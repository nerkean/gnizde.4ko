// src/app/api/webhooks/liqpay/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";

export const runtime = "nodejs"; // гарантируем Node-окружение (crypto)

const sha1b64 = (s: string) => crypto.createHash("sha1").update(s).digest("base64");

// статусы LiqPay, которые считаем финально успешными
const OK_STATUSES = new Set(["success", "sandbox"]);
// промежуточные (не меняем на них paid/failed)
const PENDING_STATUSES = new Set([
  "processing", "wait_secure", "wait_accept", "3ds_verify", "otp_verify"
]);
// финально неуспешные
const FAIL_STATUSES = new Set(["failure", "error", "reversed"]);

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const data = String(form.get("data") || "");
    const signature = String(form.get("signature") || "");
    const priv = process.env.LIQPAY_PRIVATE_KEY || "";
    const expected = sha1b64(priv + data + priv);

    if (!priv || signature !== expected) {
      return NextResponse.json({ ok: false, error: "bad signature" }, { status: 400 });
    }

    const decoded = JSON.parse(Buffer.from(data, "base64").toString("utf8"));
    const liqStatus: string = decoded.status || "error";
    const order_id: string = decoded.order_id;

    await connectDB();

    // находим наш заказ (созданный заранее в checkout-роуте)
    const order = await Order.findOne({ orderId: order_id });
    if (!order) {
      // fallback: создадим черновик, но НЕ доверяем сумме из LiqPay
      await Order.create({
        orderId: order_id,
        items: [],
        total: Number(decoded.amount) || 0,
        currency: decoded.currency || "UAH",
        status: OK_STATUSES.has(liqStatus) ? "paid" : liqStatus,
        liqpayData: decoded,
        paidAt: OK_STATUSES.has(liqStatus) ? new Date() : undefined,
      });
      return NextResponse.json({ ok: true });
    }

    // --- верификация суммы/валюты (мягкая): логируем несовпадения
    const amountFromPS = Number(decoded.amount);
    const currencyFromPS = String(decoded.currency || "");
    const amountMismatch = Number.isFinite(amountFromPS) && amountFromPS !== Number(order.total);
    const currencyMismatch = currencyFromPS && currencyFromPS !== order.currency;
    if (amountMismatch || currencyMismatch) {
      // не правим total, только сохраняем «как пришло» для анализа
      order.liqpayData = decoded;
      await order.save();
      // опционально: можно вернуть 202, чтобы видеть в логах
      // return NextResponse.json({ ok: false, warn: "amount/currency mismatch" }, { status: 202 });
    }

    // --- идемпотентная смена статуса
    if (OK_STATUSES.has(liqStatus)) {
      if (order.status !== "paid") {
        order.status = "paid";
        order.paidAt = new Date();
      }
    } else if (FAIL_STATUSES.has(liqStatus)) {
      // не понижаем уже оплаченный заказ
      if (order.status !== "paid") {
        order.status = "failed";
      }
    } else if (PENDING_STATUSES.has(liqStatus)) {
      // ничего, оставим pending/текущий
      // можно лишь записать liqpayData для истории
    } else {
      // неизвестный статус — просто сохраним как есть, но не трогаем paid
      if (order.status !== "paid") {
        order.status = String(liqStatus);
      }
    }

    // всегда сохраняем последнее «сырое» сообщение от LiqPay
    order.liqpayData = decoded;
    await order.save();

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("[liqpay webhook] error:", e);
    return NextResponse.json({ ok: false, error: e.message || "Unknown" }, { status: 500 });
  }
}
