"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, User, AlertCircle, CheckCircle, ShieldCheck, Loader2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const next = searchParams.get("next") || "/admin";
  const loggedOut = searchParams.get("loggedOut") === "1";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push(next);
        router.refresh();
      } else {
        setError(data.error || "Невірний логін або пароль");
      }
    } catch (err) {
      setError("Помилка з'єднання");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[420px]">
        
        <div className="text-center mb-8">
           <div className="mx-auto h-12 w-12 bg-stone-900 text-white rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-stone-900/20">
             <ShieldCheck size={24} />
           </div>
           <h1 className="text-2xl font-display font-bold text-stone-900">
             Вхід до системи
           </h1>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] border border-stone-100 p-8 sm:p-10">

          {loggedOut && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 border border-emerald-100">
              <CheckCircle size={18} className="text-emerald-600" />
              Ви успішно вийшли
            </div>
          )}
          
          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800 border border-rose-100 animate-in fade-in slide-in-from-top-1">
              <AlertCircle size={18} className="text-rose-600" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500 ml-1">
                Логін
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
                  <User size={18} />
                </div>
                <input 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required 
                  placeholder="admin"
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 pl-11 pr-4 py-3 text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900 transition-all" 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500 ml-1">
                Пароль
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
                  <Lock size={18} />
                </div>
                <input 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password" 
                  required 
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 pl-11 pr-4 py-3 text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900 transition-all" 
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full mt-2 rounded-xl bg-stone-900 py-3.5 text-sm font-bold text-white shadow-lg shadow-stone-900/10 hover:bg-stone-800 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : "Увійти"}
            </button>
          </form>

        </div>
      </div>
  )
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#FAFAF9] p-4">
      <Suspense fallback={<div className="text-stone-400">Завантаження...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}