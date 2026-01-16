import { connectDB } from "@/lib/mongodb";
import ContentBlock from "@/models/ContentBlock";

export async function sendTelegramOrder(order: any) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!token) {
    console.error("❌ Telegram token is missing in .env");
    return;
  }

  const envChatId = process.env.TELEGRAM_CHAT_ID;

  let dbChatIds: string[] = [];
  try {
    await connectDB();
    const settings = await ContentBlock.findOne({ key: "admin.settings" }).lean() as any;
    
    if (settings && settings.data && Array.isArray(settings.data.telegramChatIds)) {
      dbChatIds = settings.data.telegramChatIds;
    }
  } catch (e) {
    console.error("⚠️ Error reading telegram settings from DB:", e);
  }

  const uniqueIds = new Set<string>();
  if (envChatId) {
    envChatId.split(",").forEach(id => uniqueIds.add(id.trim()));
  }
  dbChatIds.forEach((id) => uniqueIds.add(String(id)));
  const targets = Array.from(uniqueIds).filter(Boolean);

  if (targets.length === 0) {
    console.error("❌ No Telegram Chat IDs found.");
    return;
  }

  const customerName = order.customer?.name || order.name || "Не вказано";
  const customerPhone = order.customer?.phone || order.phone || "Не вказано";
  const customerEmail = order.customer?.email || order.email || "";
  const comment = order.customer?.comment || order.comment || "";

  const delType = order.delivery?.type || order.delivery; 
  const delCity = order.delivery?.city || order.city || "";
  
  const delPoint = order.delivery?.branch || order.delivery?.address || order.delivery?.warehouse || order.warehouse || "";

  let deliveryText = "";
  if (delType === "nova") {
    deliveryText = `🔴 Нова Пошта: ${delCity}, ${delPoint}`;
  } else if (delType === "ukr") {
    deliveryText = `🟡 Укрпошта: ${delCity}, ${delPoint}`;
  } else if (delType === "courier") {
    deliveryText = `🚚 Кур'єр: ${delCity}, ${delPoint}`;
  } else {
    deliveryText = `Інше: ${delCity} ${delPoint}`;
  }

  const itemsList = order.items
    .map(
      (i: any, index: number) =>
        `${index + 1}. <b>${i.title_ua || i.title || "Товар"}</b>\n    ${i.qty || i.quantity} шт. × ${i.priceUAH || i.price} ₴`
    )
    .join("\n");

  const orderDisplayId = order.orderId || (order._id ? String(order._id).slice(-6).toUpperCase() : "ID");

  const message = `
📦 <b>НОВЕ ЗАМОВЛЕННЯ!</b>
<code>${orderDisplayId}</code>

👤 <b>Клієнт:</b> ${customerName}
📞 <b>Телефон:</b> <code>${customerPhone}</code>
${customerEmail ? `✉️ <b>Email:</b> ${customerEmail}` : ""}

🚚 <b>Доставка:</b>
${deliveryText}

🛒 <b>Товари:</b>
${itemsList}

💰 <b>СУМА: ${order.total} ₴</b>

${comment ? `📝 <b>Коментар:</b>\n${comment}` : ""}
`;

  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  console.log(`🚀 Sending Telegram to ${targets.length} recipients...`);

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