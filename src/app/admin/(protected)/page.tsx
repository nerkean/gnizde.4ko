import { connectDB } from "@/lib/mongodb";
import AdminActions from "@/components/AdminActions";
import Order from "@/models/Order";
import Link from "next/link";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function fmtDate(d: Date) {
  return new Date(d).toLocaleString("uk-UA");
}

export default async function AdminHome({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  await connectDB();
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page || 1));
  const limit = Math.min(50, Math.max(5, Number(sp.limit || 10)));
  const q = (sp.q || "").trim();
  const status = sp.status?.trim() || "";

  const filter: any = {};
  if (status) filter.status = status;
  if (q) {
    filter.$or = [
      { orderId: { $regex: q, $options: "i" } },
      { "customer.name": { $regex: q, $options: "i" } },
      { "customer.phone": { $regex: q, $options: "i" } },
    ];
  }

  const total = await Order.countDocuments(filter);
  const orders = await Order.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const pages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-6">
      <form className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col">
          <label className="text-xs text-stone-500">Пошук</label>
          <input
            name="q"
            defaultValue={q}
            placeholder="order id / ім'я / телефон"
            className="rounded-xl border border-stone-300 px-3 py-2"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-stone-500">Статус</label>
          <select name="status" defaultValue={status} className="rounded-xl border border-stone-300 px-3 py-2">
            <option value="">Усі</option>
            <option value="pending">pending</option>
            <option value="paid">paid</option>
            <option value="sandbox">sandbox</option>
            <option value="failure">failure</option>
            <option value="error">error</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-stone-500">На сторінку</label>
          <select name="limit" defaultValue={String(limit)} className="rounded-xl border border-stone-300 px-3 py-2">
            {[10, 20, 30, 50].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <button className="rounded-xl bg-stone-900 px-4 py-2 text-white hover:bg-stone-800">Застосувати</button>
        <a href="/admin" className="rounded-xl border border-stone-300 px-4 py-2 hover:bg-stone-50">Скинути</a>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-stone-50 text-left text-stone-600">
            <tr>
              <th className="px-4 py-3">Order ID</th>
              <th className="px-4 py-3">Дата</th>
              <th className="px-4 py-3">Клієнт</th>
              <th className="px-4 py-3">Сума</th>
              <th className="px-4 py-3">Статус</th>
              <th className="px-4 py-3">Дії</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o: any) => (
              <tr key={o._id} className="border-t">
                <td className="px-4 py-3 font-mono">
                  <Link href={`/admin/orders/${o._id}`} className="underline">{o.orderId}</Link>
                </td>
                <td className="px-4 py-3">{fmtDate(o.createdAt)}</td>
                <td className="px-4 py-3">
                  <div>{o.customer?.name || "—"}</div>
                  <div className="text-stone-500 text-xs">{o.customer?.phone || "—"}</div>
                </td>
                <td className="px-4 py-3">{o.total?.toFixed(2)} {o.currency || "UAH"}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full border border-stone-300 px-2 py-1 text-xs">{o.status}</span>
                </td>
                <td className="px-4 py-3">
                  <AdminActions orderId={String(o._id)} current={o.status} />
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td className="px-4 py-6 text-center text-stone-500" colSpan={6}>Нічого не знайдено</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {Array.from({ length: pages }).map((_, i) => {
          const p = i + 1;
          const params = new URLSearchParams({ ...sp, page: String(p) } as any).toString();
          const href = `/admin?${params}`;
          const active = p === page;
          return (
            <a
              key={p}
              href={href}
              className={`rounded-lg px-3 py-1.5 text-sm border ${
                active ? "bg-stone-900 text-white border-stone-900" : "border-stone-300 hover:bg-stone-50"
              }`}
            >
              {p}
            </a>
          );
        })}
      </div>
    </div>
  );
}
