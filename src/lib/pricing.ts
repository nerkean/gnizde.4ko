import { getAllProducts } from "./products";

export async function calculateTotalFromIds(items: { id: string; qty: number }[]) {
  const products = await getAllProducts(); 
  let total = 0;

  const lineItems = items.map((i) => {
    const p = products.find((x: any) => x.id === i.id);
    if (!p) throw new Error("Товар не найден: " + i.id);

    const price = p.priceUAH;
    const qty = Math.max(1, Math.min(99, i.qty | 0));
    const lineTotal = price * qty;
    total += lineTotal;

    return {
      id: p.id,
      title: p.title_ua,
      priceUAH: price,
      qty,
      lineTotal,
    };
  });

  return { total, lineItems };
}
