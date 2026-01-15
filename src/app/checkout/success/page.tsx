import Link from "next/link";
import { Check, ArrowRight, ShoppingBag, Home } from "lucide-react";
import ClearCartOnSuccess from "@/components/checkout/ClearCartOnSuccess";

// 👇 Типизация для Next.js 15
type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// 👇 Async компонент
export default async function SuccessPage({ searchParams }: Props) {
  // 👇 Await параметров
  const sp = await searchParams;
  const orderId = String(sp.orderId || sp.order_id || "");

  return (
    <section className="min-h-[85vh] flex items-center justify-center bg-stone-50 py-12 px-4 relative overflow-hidden">
      
      {/* Фоновые пятна (Ambient Light) - спокойные тона */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none select-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-amber-100/40 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-emerald-100/40 blur-[100px]" />
      </div>

      {/* Логика очистки (невидимка) */}
      {orderId && <ClearCartOnSuccess orderId={orderId} />}

      <div className="relative w-full max-w-lg text-center z-10">
        
        {/* Основная карточка */}
        <div className="bg-white rounded-[2rem] p-8 sm:p-12 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.05)] border border-stone-100 ring-1 ring-stone-50">
          
          {/* Анимация галочки (CSS only) */}
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
             <div className="h-20 w-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-in zoom-in duration-500">
                <Check size={40} strokeWidth={3} className="text-white" />
             </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-display font-bold text-stone-900 mb-4 tracking-tight">
            Замовлення успішне!
          </h1>
          
          <p className="text-stone-600 text-base sm:text-lg leading-relaxed mb-8">
            Дякуємо за покупку. <br className="hidden sm:block" />
            Ми вже обробляємо ваше замовлення та скоро звʼяжемося для підтвердження.
          </p>

          {/* Блок с номером заказа */}
          {orderId && (
            <div className="bg-stone-50 rounded-2xl p-5 mb-8 border border-stone-200/60 dashed border-2 group hover:border-amber-200 transition-colors">
              <p className="text-[11px] text-stone-400 uppercase tracking-widest font-bold mb-1.5">
                Номер замовлення
              </p>
              <div className="flex items-center justify-center gap-2">
                 <span className="text-xl sm:text-2xl font-mono font-bold text-stone-900 tracking-wider select-all group-hover:text-amber-900 transition-colors">
                  {orderId}
                 </span>
              </div>
            </div>
          )}

          {/* Кнопки */}
          <div className="flex flex-col gap-3">
            <Link
              href="/catalog"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-stone-900 px-6 py-4 text-base font-bold text-white transition-all hover:bg-stone-800 hover:shadow-lg hover:shadow-stone-900/10 hover:-translate-y-0.5 active:translate-y-0"
            >
              <ShoppingBag size={18} className="text-stone-300" />
              Повернутися до покупок
            </Link>
            
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-stone-500 hover:text-stone-800 hover:bg-stone-50 transition-colors"
            >
              <Home size={16} />
              На головну
            </Link>
          </div>

        </div>
        
        <p className="mt-8 text-xs text-stone-400 max-w-xs mx-auto leading-relaxed">
          Перевірте папку "Спам", якщо не отримали автоматичний лист-підтвердження протягом 5 хвилин.
        </p>
      </div>
    </section>
  );
}