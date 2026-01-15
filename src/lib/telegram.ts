import { connectDB } from "@/lib/mongodb";
import ContentBlock from "@/models/ContentBlock";

export async function sendTelegramOrder(order: any) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  // Основной ID из файла (как резерв)
  const envChatId = process.env.TELEGRAM_CHAT_ID;

  if (!token) {
    console.error("❌ Telegram token is missing");
    return;
  }

  // 1. Получаем список ID из базы данных
  let dbChatIds: string[] = [];
  try {
    await connectDB();
    const settings = await ContentBlock.findOne({ key: "admin.settings" }).lean();
    if (settings && settings.data && Array.isArray(settings.data.telegramChatIds)) {
      dbChatIds = settings.data.telegramChatIds;
    }
  } catch (e) {
    console.error("⚠️ Error reading telegram settings from DB:", e);
  }

  // 2. Объединяем ID из .env и базы (убираем дубликаты)
  const allChatIds = new Set<string>();
  if (envChatId) allChatIds.add(envChatId);
  dbChatIds.forEach((id) => allChatIds.add(String(id)));

  const targets = Array.from(allChatIds).filter(Boolean);

  if (targets.length === 0) {
    console.error("❌ No Telegram Chat IDs found (check .env or Admin Settings)");
    return;
  }

  // Формируем текст сообщения
  const itemsList = order.items
    .map(
      (i: any, index: number) =>
        `${index + 1}. <b>${i.title_ua}</b>\n    ${i.qty} шт. × ${i.priceUAH} ₴`
    )
    .join("\n");

  const message = `
📦 <b>НОВЕ ЗАМОВЛЕННЯ!</b>
<code>${order.orderId}</code>

👤 <b>Клієнт:</b> ${order.customer.name}
📞 <b>Телефон:</b> ${order.customer.phone}
${order.customer.email ? `✉️ <b>Email:</b> ${order.customer.email}` : ""}

🚚 <b>Доставка:</b>
${order.delivery.type === "nova" ? "Нова Пошта" : order.delivery.type === "ukr" ? "Укрпошта" : "Кур'єр"}
${order.delivery.city}, ${order.delivery.branch || order.delivery.address}

💰 <b>Сума: ${order.total} ₴</b>

🛒 <b>Товари:</b>
${itemsList}

${order.customer.comment ? `💬 <b>Коментар:</b>\n${order.customer.comment}` : ""}
`;

  // 3. Отправляем каждому получателю
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  console.log(`🚀 Sending Telegram notifications to ${targets.length} recipients...`);

  await Promise.all(
    targets.map(async (chatId) => {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: "HTML",
          }),
        });
        if (!res.ok) {
          const err = await res.text();
          console.error(`❌ Failed to send to ${chatId}:`, err);
        }
      } catch (e) {
        console.error(`❌ Network error sending to ${chatId}:`, e);
      }
    })
  );
}