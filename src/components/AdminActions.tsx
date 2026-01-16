"use client";

import { useState } from "react";
import { Trash2, RefreshCw, AlertTriangle, X } from "lucide-react";

export default function AdminActions({
  orderId,
  current,
  onUpdated,
}: {
  orderId: string;
  current: string;
  onUpdated?: () => void;
}) {
  const [pending, setPending] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  async function call(method: "PATCH" | "DELETE", body?: any) {
    if (pending) return;
    setPending(true);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (res.status === 401) {
        alert("❌ Ви не авторизовані. Будь ласка, увійдіть ще раз.");
        window.location.href = "/admin/login";
        return;
      }

      if (!res.ok) {
        throw new Error(await res.text());
      }

      if (onUpdated) {
        onUpdated();
      } else {
        if (method === "DELETE") {
             if (window.location.pathname.includes("/orders/")) {
                 window.location.href = "/admin/orders";
             } else {
                 window.location.reload();
             }
        } else {
             window.location.reload();
        }
      }
    } catch (e: any) {
      console.error(e);
      alert("Помилка: " + e.message);
    } finally {
      setPending(false);
      setShowDeleteModal(false); 
    }
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    if (newStatus && newStatus !== current) {
      if (newStatus === "canceled" && !confirm("Скасувати це замовлення?")) {
        e.target.value = current; 
        return;
      }
      call("PATCH", { status: newStatus });
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 justify-end">
        {/* Випадаючий список статусів */}
        <div className="relative">
          <select
            disabled={pending}
            value={current}
            onChange={handleStatusChange}
            className={`
              appearance-none cursor-pointer pl-3 pr-8 py-1.5 rounded-lg text-xs font-medium border transition outline-none shadow-sm
              disabled:opacity-50 disabled:cursor-not-allowed
              ${current === 'new' ? 'bg-blue-50 text-blue-700 border-blue-200 hover:border-blue-300' : ''}
              ${current === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200 hover:border-amber-300' : ''}
              ${current === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:border-emerald-300' : ''}
              ${current === 'shipped' ? 'bg-violet-50 text-violet-700 border-violet-200 hover:border-violet-300' : ''}
              ${current === 'canceled' || current === 'failure' ? 'bg-red-50 text-red-700 border-red-200 hover:border-red-300' : ''}
            `}
          >
            <option value="new">🔵 Новий</option>
            <option value="pending">🟡 Очікує</option>
            <option value="paid">🟢 Оплачено</option>
            <option value="shipped">🟣 Відправлено</option>
            <option value="canceled">🔴 Скасовано</option>
            <option value="failure">❌ Помилка</option>
          </select>
          
          <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 opacity-50">
             {pending ? (
               <RefreshCw className="w-3 h-3 animate-spin" />
             ) : (
               <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                 <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
               </svg>
             )}
          </div>
        </div>

        <button
          disabled={pending}
          title="Видалити замовлення"
          onClick={() => setShowDeleteModal(true)}
          className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition disabled:opacity-50 border border-transparent hover:border-red-100"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* --- МОДАЛЬНЕ ВІКНО ВИДАЛЕННЯ --- */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden scale-100 animate-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
          >
            {/* Вміст модалки */}
            <div className="p-6 text-center">
              {/* Іконка */}
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>

              <h3 className="text-lg font-bold text-stone-900 mb-2">
                Видалити замовлення?
              </h3>
              
              <p className="text-sm text-stone-500 mb-6 leading-relaxed">
                Ви збираєтесь видалити замовлення <b>{orderId}</b>. 
                Цю дію неможливо скасувати.
              </p>

              {/* Кнопки */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={pending}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-medium hover:bg-stone-50 transition active:scale-95"
                >
                  Скасувати
                </button>
                <button
                  onClick={() => call("DELETE")}
                  disabled={pending}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 shadow-lg shadow-red-600/20 transition active:scale-95 flex items-center justify-center gap-2"
                >
                  {pending ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    "Видалити"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}