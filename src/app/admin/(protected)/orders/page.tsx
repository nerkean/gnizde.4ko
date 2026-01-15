import { connectDB } from "@/lib/mongodb";
import AdminActions from "@/components/AdminActions";
import Order from "@/models/Order";
import Link from "next/link";
import { 
  Search, 
  Filter, 
  Package, 
  Calendar, 
  User,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

// --- Хелпери ---

function fmtDate(d: Date) {
  // 👇 Локаль uk-UA
  return new Date(d).toLocaleString("uk-UA", {
    day: "numeric",
    month: "short",
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

// 👇 Українські назви статусів
const statusLabels: Record<string, string> = {
  new: "Новий",
  pending: "Очікує",
  paid: "Оплачено",
  shipped: "Відправлено",
  canceled: "Скасовано",
  failure: "Помилка",
  sandbox: "Тест",
};

function StatusBadge({ status }: { status: string }) {
  const colorClass = statusColors[status] || "bg-stone-100 text-stone-600 border-stone-200";
  const label = statusLabels[status] || status;
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>
      {label}
    </span>
  );
}

function DeliveryBadge({ type }: { type?: string }) {
  if (!type) return <span className="text-stone-400">—</span>;
  // 👇 Українські назви доставки
  if (type === "nova") return <span className="text-red-600 font-bold text-xs bg-red-50 px-1 rounded">НП</span>;
  if (type === "ukr") return <span className="text-yellow-600 font-bold text-xs bg-yellow-50 px-1 rounded">Укрпошта</span>;
  if (type === "courier") return <span className="text-stone-700 font-bold text-xs bg-stone-100 px-1 rounded">Курʼєр</span>;
  return <span>{type}</span>;
}

// --- Основний компонент ---

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  await connectDB();
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page || 1));
  const limit = Math.min(50, Math.max(5, Number(sp.limit || 20))); 
  const q = (sp.q || "").trim();
  const status = sp.status?.trim() || "";

  // Фільтрація
  const filter: any = {};
  if (status) filter.status = status;
  if (q) {
    filter.$or = [
      { orderId: { $regex: q, $options: "i" } },
      { "customer.name": { $regex: q, $options: "i" } },
      { "customer.phone": { $regex: q, $options: "i" } },
      { "delivery.city": { $regex: q, $options: "i" } }, 
    ];
  }

  const total = await Order.countDocuments(filter);
  const orders = await Order.find(filter)
    .sort({ createdAt: -1 }) 
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const totalPages = Math.max(1, Math.ceil(total / limit));

  // Генерація посилань пагінації
  const genPageLink = (p: number) => {
    const params = new URLSearchParams(sp);
    params.set("page", String(p));
    return `/admin/orders?${params.toString()}`;
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Шапка */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {/* 👇 Український заголовок */}
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Замовлення</h1>
          <p className="text-sm text-stone-500 mt-1">
            Знайдено: <b>{total}</b> шт.
          </p>
        </div>
        <Link
          href="/admin"
          className="self-start text-sm font-medium text-stone-500 hover:text-amber-700 transition flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          В адмінку
        </Link>
      </div>

      {/* Панель фільтрів */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-200">
        <form className="flex flex-col md:flex-row gap-4 items-end md:items-center">
          
          {/* Пошук */}
          <div className="w-full md:w-auto flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              name="q"
              defaultValue={q}
              // 👇 Український плейсхолдер
              placeholder="Пошук: ID, ім'я, телефон..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-sm"
            />
          </div>

          {/* Статус */}
          <div className="w-full md:w-48 relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <select
              name="status"
              defaultValue={status}
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-sm appearance-none cursor-pointer"
            >
              {/* 👇 Українські опції */}
              <option value="">Всі статуси</option>
              <option value="new">🔵 Нові</option>
              <option value="pending">🟡 Очікують</option>
              <option value="paid">🟢 Оплачені</option>
              <option value="shipped">🟣 Відправлені</option>
              <option value="canceled">🔴 Скасовані</option>
            </select>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <button className="flex-1 md:flex-none bg-stone-900 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-stone-800 transition shadow-lg shadow-stone-900/10">
              Знайти
            </button>
            <a
              href="/admin/orders"
              className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 text-sm hover:bg-stone-50 transition"
            >
              Скинути
            </a>
          </div>
        </form>
      </div>

      {/* Таблиця */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-stone-50 text-stone-500 font-medium border-b border-stone-200">
              <tr>
                {/* 👇 Українські заголовки таблиці */}
                <th className="px-6 py-4 w-32">ID / Дата</th>
                <th className="px-6 py-4">Клієнт</th>
                <th className="px-6 py-4">Доставка</th>
                <th className="px-6 py-4 text-center">Товари</th>
                <th className="px-6 py-4">Сума</th>
                <th className="px-6 py-4">Статус</th>
                <th className="px-6 py-4 text-right">Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {orders.map((o: any) => {
                const itemCount = o.items?.reduce((acc: number, i: any) => acc + (i.qty || 1), 0) || 0;
                
                return (
                  <tr key={o._id} className="hover:bg-amber-50/30 transition group">
                    {/* ID + Дата */}
                    <td className="px-6 py-4 align-top">
                      <Link
                        href={`/admin/orders/${o._id}`}
                        className="font-mono font-semibold text-stone-900 hover:text-amber-700 hover:underline decoration-amber-300 underline-offset-2"
                      >
                        {o.orderId}
                      </Link>
                      <div className="flex items-center gap-1.5 text-xs text-stone-400 mt-1">
                        <Calendar className="w-3 h-3" />
                        {fmtDate(o.createdAt)}
                      </div>
                    </td>

                    {/* Клієнт */}
                    <td className="px-6 py-4 align-top">
                      <div className="font-medium text-stone-900 flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-stone-400" />
                        {o.customer?.name || "Гість"}
                      </div>
                      <div className="text-xs text-stone-500 mt-1 pl-5.5">
                        {o.customer?.phone}
                      </div>
                    </td>

                    {/* Доставка */}
                    <td className="px-6 py-4 align-top">
                      <div className="flex items-center gap-2 text-stone-700">
                        <DeliveryBadge type={o.delivery?.type} />
                        <span className="truncate max-w-[140px]" title={o.delivery?.city}>
                          {o.delivery?.city || "—"}
                        </span>
                      </div>
                    </td>

                    {/* Товари (кількість) */}
                    <td className="px-6 py-4 align-top text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-stone-50 border border-stone-200 text-xs font-medium text-stone-600">
                        <Package className="w-3 h-3" />
                        {itemCount}
                      </span>
                    </td>

                    {/* Сума */}
                    <td className="px-6 py-4 align-top">
                      <div className="font-bold text-stone-900 whitespace-nowrap">
                        {o.total?.toLocaleString("uk-UA")} <span className="text-xs font-normal text-stone-500">₴</span>
                      </div>
                      {o.paymentMethod === 'cod' && (
                         <div className="text-[10px] text-stone-400 mt-0.5">Післяплата</div>
                      )}
                    </td>

                    {/* Статус */}
                    <td className="px-6 py-4 align-top">
                      <StatusBadge status={o.status} />
                    </td>

                    {/* Дії */}
                    <td className="px-6 py-4 align-top text-right">
                      <div className="flex justify-end">
                        <AdminActions orderId={String(o._id)} current={o.status} />
                      </div>
                    </td>
                  </tr>
                );
              })}

              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-stone-500">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center">
                        <Search className="w-6 h-6 text-stone-400" />
                      </div>
                      <p>Замовлень не знайдено</p>
                      {status || q ? (
                        <a href="/admin/orders" className="text-amber-700 hover:underline text-sm">
                          Скинути фільтри
                        </a>
                      ) : null}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Пагінація */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          {page > 1 && (
            <Link
              href={genPageLink(page - 1)}
              className="p-2 rounded-lg border border-stone-300 hover:bg-white bg-stone-50 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>
          )}
          
          <span className="text-sm font-medium text-stone-600 px-2">
            Стор. {page} з {totalPages}
          </span>

          {page < totalPages && (
            <Link
              href={genPageLink(page + 1)}
              className="p-2 rounded-lg border border-stone-300 hover:bg-white bg-stone-50 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}