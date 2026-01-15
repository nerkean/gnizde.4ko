import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
// 👇 1. Импортируем нашу новую функцию
import { sendTelegramOrder } from "@/lib/telegram";

export const dynamic = "force-dynamic";

type CartItem = { id: string; qty: number };

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, customer, delivery, comment } = body || {};

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Кошик порожній" }, { status: 400 });
    }

    await connectDB();

    // 1. Проверяем актуальные цены в базе (безопасность)
    const ids = items.map((i: CartItem) => String(i.id));
    const products = await Product.find({ _id: { $in: ids } }).lean();
    
    // Превращаем массив товаров в Map для быстрого поиска
    const productsMap = new Map(products.map((p: any) => [String(p._id), p]));

    let total = 0;
    const lineItems = items.map((it: CartItem) => {
      const product: any = productsMap.get(String(it.id));
      if (!product) {
        throw new Error(`Товар з ID ${it.id} не знайдено`); // Или пропустить
      }
      
      const price = Number(product.priceUAH) || 0;
      const qty = Number(it.qty) || 1;
      
      total += price * qty;

      return {
        id: String(it.id),
        title_ua: product.title_ua,
        priceUAH: price,
        qty: qty,
        // Можно добавить картинку, если схема Order это позволяет
      };
    });

const orderId = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

    const newOrder = await Order.create({
      orderId,
      items: lineItems,
      total,
      currency: "UAH",
      status: "new",
      customer: {
        name: customer?.name,
        phone: customer?.phone,
        email: customer?.email,
        comment: comment,
      },
      delivery: delivery,
      createdAt: new Date(),
    });

    // 👇 2. Вставляем отправку в Telegram ПЕРЕД ответом клиенту
    // Используем await, чтобы убедиться, что ушло, или можно без await, чтобы не задерживать ответ
    await sendTelegramOrder(newOrder); 

    return NextResponse.json({ ok: true, orderId: newOrder.orderId });

  } catch (e: any) {
    console.error("Помилка створення замовлення:", e);
    return NextResponse.json(
      { error: e.message || "Помилка сервера" },
      { status: 500 }
    );
  }
}