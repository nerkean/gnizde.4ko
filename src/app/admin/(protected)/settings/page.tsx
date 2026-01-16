"use client";

import { useEffect, useState } from "react";
import { Trash2, Plus, Bell, Info, Send, Loader2, Lock, ShieldCheck, Save } from "lucide-react";

export default function SettingsPage() {
  const [ids, setIds] = useState<string[]>([]);
  const [newId, setNewId] = useState("");

  const [adminLogin, setAdminLogin] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/content/admin.settings")
      .then((res) => res.json())
      .then((json) => {
        const remoteData = json?.doc?.data;
        if (remoteData) {
          if (Array.isArray(remoteData.telegramChatIds)) {
            setIds(remoteData.telegramChatIds);
          }
          if (remoteData.login) setAdminLogin(remoteData.login);
          if (remoteData.password) setAdminPassword(remoteData.password);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const updateSettings = async (newData: Partial<{ telegramChatIds: string[], login: string, password: string }>) => {
    setSaving(true);
    
    const fullData = {
      telegramChatIds: newData.telegramChatIds ?? ids,
      login: newData.login ?? adminLogin,
      password: newData.password ?? adminPassword,
    };

    try {
      await fetch("/api/content/admin.settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "settings",
          data: fullData,
        }),
      });

      if (newData.telegramChatIds) setIds(newData.telegramChatIds);
      if (newData.login) setAdminLogin(newData.login);
      if (newData.password) setAdminPassword(newData.password);

    } catch (e) {
      alert("Помилка збереження");
    } finally {
      setSaving(false);
    }
  };

  const addId = () => {
    if (!newId.trim()) return;
    if (ids.includes(newId.trim())) {
      alert("Цей ID вже додано");
      return;
    }
    const updated = [...ids, newId.trim()];
    setNewId(""); 
    updateSettings({ telegramChatIds: updated });
  };

  const removeId = (idToRemove: string) => {
    if (!confirm("Ви впевнені, що хочете видалити цей ID?")) return;
    const updated = ids.filter((id) => id !== idToRemove);
    updateSettings({ telegramChatIds: updated });
  };

  const saveAuth = () => {
    if (!adminLogin.trim() || !adminPassword.trim()) {
      alert("Логін та пароль не можуть бути порожніми");
      return;
    }
    updateSettings({ login: adminLogin, password: adminPassword });
    alert("Дані входу оновлено ✅");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-stone-400 gap-2">
        <Loader2 className="animate-spin" /> Завантаження налаштувань...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-20">
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900">Налаштування</h1>
        <p className="text-stone-500 mt-2">Керування доступами та сповіщеннями.</p>
      </div>

      <div className="grid gap-8">
        
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-100 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)]">
          <div className="flex items-start gap-4 mb-6">
            <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
               <ShieldCheck size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-900">Доступ до адмінки</h2>
              <p className="text-stone-500 text-sm mt-1 leading-relaxed">
                Змініть логін та пароль для входу в панель керування.
              </p>
            </div>
          </div>

          <div className="grid gap-5 max-w-lg">
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                Логін адміністратора
              </label>
              <input
                type="text"
                value={adminLogin}
                onChange={(e) => setAdminLogin(e.target.value)}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                Пароль
              </label>
              <div className="relative">
                <input
                  type="text" 
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400 transition font-mono"
                />
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={saveAuth}
                disabled={saving}
                className="flex items-center gap-2 bg-stone-900 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-stone-800 disabled:opacity-70 transition shadow-lg shadow-stone-900/10"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                Зберегти нові дані
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-100 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)]">
          
          <div className="flex items-start gap-4 mb-6">
            <div className="h-12 w-12 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600 shrink-0">
               <Bell size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-900">Сповіщення в Telegram</h2>
              <p className="text-stone-500 text-sm mt-1 leading-relaxed">
                Сюди приходитимуть повідомлення про нові замовлення.
              </p>
            </div>
          </div>

          <div className="bg-stone-50 rounded-xl p-4 mb-8 flex items-start gap-3 border border-stone-200/60">
             <Info className="text-stone-400 mt-0.5 shrink-0" size={18} />
             <div className="text-sm text-stone-600">
               Щоб дізнатись свій ID, напишіть боту{" "}
               <a 
                 href="https://t.me/userinfobot" 
                 target="_blank" 
                 rel="noreferrer"
                 className="font-bold text-sky-600 hover:underline"
               >
                 @userinfobot
               </a>
               . Скопіюйте число "Id" і вставте його нижче.
             </div>
          </div>

          <div className="space-y-3 mb-8">
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
              Активні отримувачі ({ids.length})
            </h3>
            
            {ids.length === 0 && (
              <div className="text-center py-6 border-2 border-dashed border-stone-100 rounded-xl text-stone-400 text-sm">
                Список порожній. Сповіщення не надсилатимуться.
              </div>
            )}

            {ids.map((id) => (
              <div 
                key={id} 
                className="group flex items-center justify-between p-3 pl-4 bg-white border border-stone-200 rounded-xl hover:border-stone-300 transition shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500">
                    <Send size={14} />
                  </div>
                  <span className="font-mono text-stone-800 font-medium text-lg tracking-tight">
                    {id}
                  </span>
                </div>
                
                <button
                  onClick={() => removeId(id)}
                  disabled={saving}
                  title="Видалити"
                  className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
              Додати нового отримувача
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={newId}
                  onChange={(e) => setNewId(e.target.value.replace(/[^0-9-]/g, ""))}
                  onKeyDown={(e) => e.key === "Enter" && addId()}
                  placeholder="Наприклад: 123456789"
                  className="w-full pl-4 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400 transition font-mono"
                />
              </div>
              <button
                onClick={addId}
                disabled={!newId || saving}
                className="bg-stone-900 text-white px-6 rounded-xl font-medium hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2 shadow-lg shadow-stone-900/20"
              >
                {saving ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <Plus size={20} />
                    <span>Додати</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}