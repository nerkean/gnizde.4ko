import { Lock, User, AlertCircle, CheckCircle, ShieldCheck } from "lucide-react";

export default async function AdminLoginPage({
  searchParams,
}: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams;
  const next = sp?.next || "/admin";
  const error = sp?.error === "1";
  const loggedOut = sp?.loggedOut === "1";

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#FAFAF9] p-4">
      
      {/* Контейнер карточки */}
      <div className="w-full max-w-[420px]">
        
        {/* Логотип / Заголовок */}
        <div className="text-center mb-8">
           <div className="mx-auto h-12 w-12 bg-stone-900 text-white rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-stone-900/20">
             <ShieldCheck size={24} />
           </div>
           <h1 className="text-2xl font-display font-bold text-stone-900">
             Вхід до системи
           </h1>
        </div>

        {/* Форма */}
        <div className="bg-white rounded-[2.5rem] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] border border-stone-100 p-8 sm:p-10">
          
          {/* Сообщения (Alerts) */}
          {loggedOut && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 border border-emerald-100">
              <CheckCircle size={18} className="text-emerald-600" />
              Ви успішно вийшли
            </div>
          )}
          
          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800 border border-rose-100">
              <AlertCircle size={18} className="text-rose-600" />
              Невірний логін або пароль
            </div>
          )}

          <form method="POST" action="/api/admin/login" className="space-y-5">
            <input type="hidden" name="next" value={next} />
            
            {/* Логин */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500 ml-1">
                Логін
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
                  <User size={18} />
                </div>
                <input 
                  name="username" 
                  required 
                  placeholder="admin"
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 pl-11 pr-4 py-3 text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900 transition-all" 
                />
              </div>
            </div>

            {/* Пароль */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500 ml-1">
                Пароль
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
                  <Lock size={18} />
                </div>
                <input 
                  name="password" 
                  type="password" 
                  required 
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 pl-11 pr-4 py-3 text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900 transition-all" 
                />
              </div>
            </div>

            {/* Кнопка */}
            <button className="w-full mt-2 rounded-xl bg-stone-900 py-3.5 text-sm font-bold text-white shadow-lg shadow-stone-900/10 hover:bg-stone-800 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all">
              Увійти
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}