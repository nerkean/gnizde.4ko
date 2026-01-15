import { connectDB } from "@/lib/mongodb";
import ContentBlock from "@/models/ContentBlock";

export async function sendTelegramOrder(order: any) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!token) {
    console.error("❌ Telegram token is missing in .env");
    return;
  }

  // 1. Получаем ID из .env (резервный)
  const envChatId = process.env.TELEGRAM_CHAT_ID;

  // 2. Получаем список ID из базы данных (настройки админки)
  let dbChatIds: string[] = [];
  try {
    await connectDB();
    // 👇 ГЛАВНОЕ ИСПРАВЛЕНИЕ: "as any" убирает ошибку TypeScript
    const settings = await ContentBlock.findOne({ key: "admin.settings" }).lean() as any;
    
    if (settings && settings.data && Array.isArray(settings.data.telegramChatIds)) {
      dbChatIds = settings.data.telegramChatIds;
    }
  } catch (e) {
    console.error("⚠️ Error reading telegram settings from DB:", e);
  }

  // 3. Объединяем все ID и убираем дубликаты
  const uniqueIds = new Set<string>();
  
  if (envChatId) {
    // Если в .env несколько ID через запятую
    envChatId.split(",").forEach(id => uniqueIds.add(id.trim()));
  }
  
  dbChatIds.forEach((id) => uniqueIds.add(String(id)));

  const targets = Array.from(uniqueIds).filter(Boolean);

  if (targets.length === 0) {
    console.error("❌ No Telegram Chat IDs found. Add them in Admin Panel or .env");
    return;
  }

  // 4. Формируем красивый текст сообщения
  const itemsList = order.items
    .map(
      (i: any, index: number) =>
        `${index + 1}. <b>${i.title_ua || i.product?.title_ua || "Товар"}</b>\n    ${i.quantity || i.qty} шт. × ${i.priceUAH || i.product?.priceUAH} ₴`
    )
    .join("\n");

  const deliveryText = order.delivery === "nova_poshta" 
    ? `🔴 Нова Пошта: ${order.city}, ${order.warehouse}`
    : order.delivery === "ukr_poshta" 
      ? `🟡 Укрпошта: ${order.city}, ${order.warehouse}`
      : `🚚 Інше: ${order.city}, ${order.warehouse}`;

  const message = `
📦 <b>НОВЕ ЗАМОВЛЕННЯ!</b>
<code>#${order._id ? String(order._id).slice(-6).toUpperCase() : "ID"}</code>

👤 <b>Клієнт:</b> ${order.name}
📞 <b>Телефон:</b> <code>${order.phone}</code>
💬 <b>Зв'язок:</b> ${order.messenger}

🚚 <b>Доставка:</b>
${deliveryText}

🛒 <b>Товари:</b>
${itemsList}

💰 <b>СУМА: ${order.total} ₴</b>

${order.comment ? `📝 <b>Коментар:</b>\n${order.comment}` : ""}
`;

  // 5. Отправляем каждому получателю
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  console.log(`🚀 Sending Telegram order notification to ${targets.length} recipients...`);

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