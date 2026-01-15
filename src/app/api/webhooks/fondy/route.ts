// src/app/api/webhooks/fondy/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const raw: Record<string, any> = {};
    form.forEach((v, k) => {
      raw[k] = v;
    });

    const orderId = String(raw.order_id || "");
    const orderStatus = String(raw.order_status || raw.order_status || "");
    const amount = Number(raw.amount || 0) / 100;
    const currency = String(raw.currency || "UAH");

    if (!orderId) {
      return NextResponse.json({ ok: false, error: "No order_id" }, { status: 400 });
    }

    await connectDB();
    const order = await Order.findOne({ orderId });

    if (!order) {
      // fallback: если наш заказ не нашли — создаём черновик
      await Order.create({
        orderId,
        items: [],
        total: amount,
        currency,
        status: orderStatus || "unknown",
        liqpayData: raw, // используем то же поле для «сырых» данных
      });
      return NextResponse.json({ ok: true, created: true });
    }

    // --- логика статусов ---
    if (orderStatus === "approved") {
      if (order.status !== "paid") {
        order.status = "paid";
        // @ts-ignore
        order.paidAt = order.paidAt || new Date();
      }
    } else if (["declined", "expired", "reversed", "error"].includes(orderStatus)) {
      if (order.status !== "paid") {
        order.status = "failed";
      }
    } else {
      // created / processing / etc
      if (order.status !== "paid") {
        order.status = orderStatus || order.status;
      }
    }

    order.currency = order.currency || currency;
    order.liqpayData = raw; // пусть тут лежат сырые данные Fondy

    await order.save();

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("[fondy webhook] error:", e);
    return NextResponse.json({ ok: false, error: e.message || "Unknown" }, { status: 500 });
  }
}
