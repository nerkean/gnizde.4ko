import Link from "next/link";
import { 
  Package, 
  Tag, 
  LayoutTemplate, 
  Settings, 
  ExternalLink, 
  ArrowRight
} from "lucide-react";

export default function AdminDashboard() {
  const menu = [
    {
      title: "Замовлення",
      desc: "Перегляд та обробка нових замовлень",
      href: "/admin/orders",
      icon: Package,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "hover:border-emerald-200",
    },
    {
      title: "Товари",
      desc: "Керування каталогом, цінами та наявністю",
      href: "/admin/products",
      icon: Tag,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "hover:border-amber-200",
    },
    {
      title: "Контент",
      desc: "Редагування банерів, текстів та блоків",
      href: "/admin/content",
      icon: LayoutTemplate,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "hover:border-blue-200",
    },
    {
      title: "Налаштування",
      desc: "Загальні налаштування магазину",
      href: "/admin/settings",
      icon: Settings,
      color: "text-stone-600",
      bg: "bg-stone-100",
      border: "hover:border-stone-300",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF9] p-6 sm:p-10">
      <div className="mx-auto max-w-6xl">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-display font-bold text-stone-900">
              Адмін-панель
            </h1>
            <p className="text-stone-500 mt-1">
              Вітаємо! Оберіть розділ для роботи.
            </p>
          </div>
          
          <Link 
            href="/" 
            target="_blank"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-stone-200 text-stone-700 font-medium shadow-sm hover:bg-stone-50 hover:border-stone-300 transition-all"
          >
            <ExternalLink size={16} />
            Відкрити сайт
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {menu.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex flex-col p-6 rounded-[2rem] bg-white border border-stone-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${item.border}`}
            >
              <div className="mb-6 flex justify-between items-start">
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${item.bg} ${item.color} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                  <item.icon size={26} strokeWidth={2} />
                </div>
                <div className="opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                  <div className="h-8 w-8 rounded-full bg-stone-50 flex items-center justify-center text-stone-400">
                    <ArrowRight size={16} />
                  </div>
                </div>
              </div>
              
              <div className="mt-auto">
                <h3 className="text-xl font-bold text-stone-900 mb-2 group-hover:text-amber-700 transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-stone-500 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}