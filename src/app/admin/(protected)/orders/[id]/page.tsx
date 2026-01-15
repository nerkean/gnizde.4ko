import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Link from "next/link";
import { notFound } from "next/navigation";
import AdminActions from "@/components/AdminActions";
import { 
  ChevronLeft, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Truck, 
  MessageSquare, 
  Calendar, 
  CreditCard,
  Package
} from "lucide-react";

// --- Хелпери ---

function fmtDate(d: string | Date) {
  return new Date(d).toLocaleString("uk-UA", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-700 border-blue-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
  shipped: "bg-violet-100 text-violet-700 border-violet-200",
  canceled: "bg-red-50 text-red-700 border-red-200",
  failure: "bg-red-50 text-red-700 border-red-200",
  sandbox: "bg-gray-100 text-gray-600 border-gray-200",
};

const statusLabels: Record<string, string> = {
  new: "Новий",
  pending: "Очікує підтвердження",
  paid: "Оплачено",
  shipped: "Відправлено",
  canceled: "Скасовано",
  failure: "Помилка оплати",
  sandbox: "Тестове замовлення",
};

function StatusBadge({ status }: { status: string }) {
  const colorClass = statusColors[status] || "bg-stone-100 text-stone-600 border-stone-200";
  const label = statusLabels[status] || status;
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${colorClass}`}>
      {label}
    </span>
  );
}

// Типізація даних замовлення
type OrderLean = {
  _id: string;
  orderId: string;
  status: string;
  total: number;
  currency?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  customer?: {
    name?: string;
    phone?: string;
    email?: string;
    comment?: string;
  };
  delivery?: {
    type?: string;
    city?: string;
    branch?: string;
    address?: string;
  };
  items?: {
    id: string;
    title_ua: string;
    priceUAH: number;
    qty: number;
  }[];
  // Сирі дані (якщо є)
  paymentData?: any;
  fondyData?: any;
  liqpayData?: any;
};

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connectDB();
  const { id } = await params;

  const o = await Order.findById(id).lean<OrderLean>();
  if (!o) return notFound();

  // Збираємо сирі дані для дебагу
  const rawPayment =
    o.paymentData !== undefined
      ? o.paymentData
      : o.fondyData !== undefined
      ? o.fondyData
      : o.liqpayData !== undefined
      ? o.liqpayData
      : null;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      
      {/* --- Верхня панель --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <Link 
              href="/admin/orders" 
              className="p-1 rounded-lg hover:bg-stone-100 text-stone-500 transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-stone-900 font-mono tracking-tight">
              {o.orderId}
            </h1>
            <StatusBadge status={o.status} />
          </div>
          <div className="flex items-center gap-2 text-sm text-stone-500 ml-9">
            <Calendar className="w-4 h-4" />
            {fmtDate(o.createdAt)}
          </div>
        </div>

        {/* Панель дій */}
        <div className="bg-white p-2 rounded-xl border border-stone-200 shadow-sm flex items-center gap-2">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider px-2">Дії:</span>
            <AdminActions orderId={String(o._id)} current={o.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* --- ЛІВА КОЛОНКА (Основна) --- */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Блок товарів */}
          <section className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-100 flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-600" />
              <h2 className="font-semibold text-stone-900">Товари в замовленні</h2>
            </div>
            <div className="divide-y divide-stone-100">
              {o.items?.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between px-6 py-4 hover:bg-stone-50 transition">
                  <div className="flex-1 pr-4">
                    <div className="font-medium text-stone-900 text-lg">{item.title_ua}</div>
                    <div className="text-xs text-stone-400 font-mono mt-0.5">ID: {item.id}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-stone-900">
                      {item.qty} шт. × {item.priceUAH} ₴
                    </div>
                    <div className="text-sm font-bold text-stone-900 mt-1">
                      {(item.qty * item.priceUAH).toLocaleString("uk-UA")} ₴
                    </div>
                  </div>
                </div>
              ))}
              {(!o.items || o.items.length === 0) && (
                <div className="p-6 text-center text-stone-500">Товари відсутні</div>
              )}
            </div>
            
            {/* Підсумок */}
            <div className="bg-stone-50 px-6 py-4 border-t border-stone-200 flex justify-between items-center">
              <span className="text-stone-600 font-medium">Загальна сума</span>
              <span className="text-2xl font-bold text-stone-900">
                {o.total?.toLocaleString("uk-UA")} <span className="text-lg font-normal text-stone-500">₴</span>
              </span>
            </div>
          </section>

          {/* Коментар клієнта */}
          {o.customer?.comment && (
            <section className="bg-amber-50 rounded-2xl border border-amber-100 p-5">
              <div className="flex gap-3">
                <MessageSquare className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-amber-800 uppercase tracking-wide mb-1">Коментар клієнта</h3>
                  <p className="text-stone-800 whitespace-pre-wrap">{o.customer.comment}</p>
                </div>
              </div>
            </section>
          )}

           {/* Технічна інфо (Raw Data) */}
           {rawPayment && (
            <details className="group bg-white rounded-2xl border border-stone-200 overflow-hidden">
              <summary className="flex items-center gap-2 px-6 py-3 cursor-pointer hover:bg-stone-50 font-medium text-stone-500 text-sm select-none">
                <CreditCard className="w-4 h-4" />
                <span>Технічні дані оплати (JSON)</span>
                <span className="ml-auto text-xs opacity-50 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="bg-stone-900 p-4 overflow-x-auto">
                <pre className="text-xs text-green-400 font-mono">
                  {JSON.stringify(rawPayment, null, 2)}
                </pre>
              </div>
            </details>
          )}

        </div>

        {/* --- ПРАВА КОЛОНКА (Інфо) --- */}
        <div className="space-y-6">
          
          {/* Картка клієнта */}
          <section className="bg-white rounded-2xl shadow-sm border border-stone-200 p-5">
            <h2 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <User className="w-4 h-4" />
              Клієнт
            </h2>
            <div className="space-y-4">
              <div>
                <div className="text-xl font-semibold text-stone-900">{o.customer?.name || "Не вказано"}</div>
              </div>
              
              <div className="flex items-center gap-3 text-stone-700">
                <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-stone-600" />
                </div>
                <a href={`tel:${o.customer?.phone}`} className="hover:text-amber-700 hover:underline">
                  {o.customer?.phone || "—"}
                </a>
              </div>

              {o.customer?.email && (
                <div className="flex items-center gap-3 text-stone-700">
                  <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-stone-600" />
                  </div>
                  <a href={`mailto:${o.customer?.email}`} className="text-sm hover:text-amber-700 hover:underline break-all">
                    {o.customer.email}
                  </a>
                </div>
              )}
            </div>
          </section>

          {/* Картка доставки */}
          <section className="bg-white rounded-2xl shadow-sm border border-stone-200 p-5">
            <h2 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Truck className="w-4 h-4" />
              Доставка
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  o.delivery?.type === 'nova' ? 'bg-red-50 text-red-600' :
                  o.delivery?.type === 'ukr' ? 'bg-yellow-50 text-yellow-600' :
                  'bg-stone-100 text-stone-600'
                }`}>
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                   <div className="font-medium text-stone-900">
                    {o.delivery?.type === "nova" ? "Нова Пошта" : 
                     o.delivery?.type === "ukr" ? "Укрпошта" : 
                     o.delivery?.type === "courier" ? "Курʼєр" : "Не вказано"}
                   </div>
                   <div className="text-sm text-stone-500 mt-0.5">Спосіб доставки</div>
                </div>
              </div>

              {o.delivery?.city && (
                <div className="pl-11">
                  <div className="text-sm text-stone-500">Місто</div>
                  <div className="text-stone-900 font-medium">{o.delivery.city}</div>
                </div>
              )}

              {(o.delivery?.branch || o.delivery?.address) && (
                <div className="pl-11">
                  <div className="text-sm text-stone-500">
                    {o.delivery?.type === "courier" ? "Адреса" : "Відділення"}
                  </div>
                  <div className="text-stone-900 font-medium leading-relaxed">
                    {o.delivery?.branch || o.delivery?.address}
                  </div>
                </div>
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}