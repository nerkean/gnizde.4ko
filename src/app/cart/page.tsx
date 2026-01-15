import CartPageClient from "@/components/cart/CartPageClient";

export const dynamic = "force-dynamic"; // 💥 Отключает static export

export const metadata = {
  title: "Кошик • PAVUK",
  description: "Ваші обрані товари перед оформленням замовлення.",
};

export default function CartPage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
      <CartPageClient />
    </section>
  );
}
