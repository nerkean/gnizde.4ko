"use client";

import React, { useEffect, useState } from "react";
import { 
  Save, 
  Loader2, 
  Image as ImageIcon, 
  Film, 
  Plus, 
  Trash2, 
  Check, 
  Monitor, 
  ShoppingBag, 
  LayoutTemplate,
  Info
} from "lucide-react";

async function compressImage(file: File, maxWidth = 2000, quality = 0.85): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(maxWidth / img.width, 1);
      const w = img.width * scale;
      const h = img.height * scale;

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, w, h);

      canvas.toBlob(
        (blob) => {
          if (!blob) return resolve(file);
          resolve(
            new File([blob], file.name.replace(/\.(png|jpg|jpeg|webp)$/i, ".jpg"), {
              type: "image/jpeg",
            })
          );
        },
        "image/jpeg",
        quality
      );
    };
    img.src = URL.createObjectURL(file);
  });
}

type L = { ua?: string };

type ImageItem = {
  url?: string;
  alt?: L;
  kind?: "image" | "video";
};

type Item = { icon?: string; title?: L; text?: L; image?: ImageItem };

type SocialItem = {
  kind?: "instagram" | "facebook" | "youtube" | "tiktok" | "telegram" | "custom";
  href?: string;
  label?: string;
  enabled?: boolean;
};

type BlockData = {
  title?: L;
  subtitle?: L;
  text?: L;
  button?: { label?: L; href?: string };
  images?: ImageItem[];
  items?: Item[];
  description?: L;
  label?: L;
  heading?: L;
  stories?: {
    img?: string;
    title?: L;
    text?: L;
    alt?: L;
    kind?: "image" | "video";
  }[];
  paragraphs?: string[];
  cta?: { label?: L; href?: string };
  badge?: L;
  contacts?: {
    country?: string;
    phone?: string;
    schedule?: string;
  };
  socials?: SocialItem[];
  categories?: {
    slug: string;
    title?: L;
    image?: ImageItem;
  }[];
};

type Block = {
  key: string;
  type: "hero" | "cards" | "gallery" | "rich" | "about" | "catalog" | "footer";
  data: BlockData;
};

const DEFAULTS: Record<string, Block> = {
  "home.hero": {
    key: "home.hero",
    type: "hero",
    data: {
      title: { ua: "Соломʼяні прикраси з душею" },
      subtitle: { ua: "Натуральні матеріали • Ручна робота" },
      button: { label: { ua: "Каталог" }, href: "/catalog" },
      images: [{ url: "/images/default-hero.jpg", alt: { ua: "" } }],
    },
  },
  "home.features": {
    key: "home.features",
    type: "cards",
    data: {
      label: { ua: "Особливості" },
      heading: { ua: "Чому клієнти обирають нас" },
      items: [
        { icon: "🌾", title: { ua: "Натуральні матеріали" }, text: { ua: "Солома, шнури, дерево." } },
        { icon: "🧶", title: { ua: "Ручна робота" }, text: { ua: "Кожен виріб створюється майстром." } },
        { icon: "✨", title: { ua: "Унікальні дизайни" }, text: { ua: "Від мінімалізму до етно." } },
      ],
    },
  },
  "home.giftStory": {
    key: "home.giftStory",
    type: "gallery",
    data: {
      label: { ua: "ІСТОРІЇ" },
      heading: { ua: "Подарункова історія" },
      description: { ua: "Затишок дому та традиції в кожній формі." },
      stories: [
        { img: "/images/IMG_7660.JPG", title: { ua: "Плетіння як медитація" }, text: { ua: "Ручна праця." }, alt: { ua: "" } },
        { img: "/images/IMG_7656.JPG", title: { ua: "Традиції і сучасність" }, text: { ua: "Спадщина та дизайн." }, alt: { ua: "" } },
      ],
    },
  },
  "home.about": {
    key: "home.about",
    type: "about",
    data: {
      label: { ua: "Майстерня" },
      heading: { ua: "Про нашу майстерню" },
      paragraphs: ["Ми створюємо соломʼяні «павуки» та декор вручну."],
      images: [{ url: "/images/IMG_7344.JPG", alt: { ua: "Процес" } }],
      cta: { label: { ua: "Дізнатися більше" }, href: "/about" },
    },
  },
  "footer.main": {
    key: "footer.main",
    type: "footer",
    data: {
      title: { ua: "Gnizde.4ko" },
      subtitle: { ua: "Майстерня декору" },
      description: { ua: "Створюємо затишок з натуральних матеріалів." },
      badge: { ua: "Зроблено в Україні" },
      contacts: { country: "Україна", phone: "+380 (00) 000-00-00", schedule: "Пн–Сб: 10:00–19:00" },
      socials: [
        { kind: "instagram", label: "Instagram", href: "https://instagram.com/", enabled: true },
      ],
    },
  },
  "catalog.categories": {
    key: "catalog.categories",
    type: "catalog",
    data: {
      categories: [
        { slug: "pavuky", title: { ua: "Павуки" }, image: { url: "", kind: "image" } },
        { slug: "vinky", title: { ua: "Вінки" }, image: { url: "", kind: "image" } },
        { slug: "other", title: { ua: "Інше" }, image: { url: "", kind: "image" } },
      ],
    },
  },
};

const BLOCK_META: Record<keyof typeof DEFAULTS, { label: string; description: string }> = {
  "home.hero": { label: "Герой (Банер)", description: "Головний екран сайту: фото, заголовок, кнопка." },
  "home.features": { label: "Особливості", description: "Картки переваг (іконка + текст)." },
  "home.giftStory": { label: "Історії (Галерея)", description: "Слайдер з фото та описом процесу." },
  "home.about": { label: "Про майстерню", description: "Текстовий блок з фото про нас." },
  "catalog.categories": { label: "Обкладинки категорій", description: "Фото для розділів каталогу." },
  "footer.main": { label: "Футер", description: "Контакти, соцмережі, копірайт." },
};

const HOME_KEYS: Array<keyof typeof DEFAULTS> = ["home.hero", "home.features", "home.giftStory", "home.about"];
const CATALOG_KEYS: Array<keyof typeof DEFAULTS> = ["catalog.categories"];
const FOOTER_KEYS: Array<keyof typeof DEFAULTS> = ["footer.main"];
const KEYS = Object.keys(DEFAULTS) as Array<keyof typeof DEFAULTS>;

export default function ContentAdminPage() {
  const [active, setActive] = useState<keyof typeof DEFAULTS>("home.hero");
  const [block, setBlock] = useState<Block>(DEFAULTS["home.hero"]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false); 
  const [activeGroup, setActiveGroup] = useState<"home" | "catalog" | "footer">("home");

  useEffect(() => {
    const k = String(active);
    if (k.startsWith("home.")) setActiveGroup("home");
    else if (k.startsWith("catalog")) setActiveGroup("catalog");
    else if (k.startsWith("footer")) setActiveGroup("footer");
  }, [active]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/content/${active}`, { cache: "no-store" });
        const json = await res.json();
        const doc = json?.doc ?? json?.block ?? json ?? null;
        let server: Block = doc ? { ...DEFAULTS[active], ...doc, key: active } : DEFAULTS[active];

        if (server.type === "gallery" && (!server.data.stories || server.data.stories.length === 0)) {
           const converted = (server.data.images || []).map((img) => ({
             img: img.url,
             title: { ua: "" },
             text: { ua: "" },
             alt: img.alt || { ua: "" },
           }));
           server = { ...server, data: { ...server.data, stories: converted } };
        }
        if (!cancelled) setBlock(server);
      } catch {
        if (!cancelled) setBlock(DEFAULTS[active]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [active]);

  const onChange = (patch: Partial<BlockData>) =>
    setBlock((b) => ({ ...b, data: { ...b.data, ...patch } }));

  const save = async () => {
    setSaving(true);
    setSuccess(false);
    try {
      const res = await fetch(`/api/content/${block.key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: block.type, data: block.data }),
      });
      const json = await res.json();
      if (!json?.ok) throw new Error("Save failed");
      
      setTimeout(() => {
        setSaving(false);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }, 500);

    } catch (e: any) {
      alert(e?.message || "Помилка збереження");
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
           <h1 className="text-3xl font-bold text-stone-900">Управління контентом</h1>
           <p className="text-stone-500 mt-2">Редагування текстів, банерів та інформації на сайті.</p>
        </div>
        
        {success && (
          <div className="hidden md:flex items-center gap-2 text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 animate-in fade-in slide-in-from-bottom-2 duration-300">
             <Check size={14} />
             <span>Зміни збережено</span>
          </div>
        )}
      </div>

      <div className="flex p-1 bg-stone-100 rounded-xl mb-6 w-full sm:w-fit border border-stone-200">
         <GroupTab 
            active={activeGroup === "home"} 
            onClick={() => { setActiveGroup("home"); setActive("home.hero"); }}
            icon={Monitor}
            label="Головна"
         />
         <GroupTab 
            active={activeGroup === "catalog"} 
            onClick={() => { setActiveGroup("catalog"); setActive("catalog.categories"); }}
            icon={ShoppingBag}
            label="Каталог"
         />
         <GroupTab 
            active={activeGroup === "footer"} 
            onClick={() => { setActiveGroup("footer"); setActive("footer.main"); }}
            icon={LayoutTemplate}
            label="Футер"
         />
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {activeGroup === "home" && HOME_KEYS.map(k => <BlockPill key={k} meta={BLOCK_META[k]} active={active === k} onClick={() => setActive(k)} />)}
        {activeGroup === "catalog" && CATALOG_KEYS.map(k => <BlockPill key={k} meta={BLOCK_META[k]} active={active === k} onClick={() => setActive(k)} />)}
        {activeGroup === "footer" && FOOTER_KEYS.map(k => <BlockPill key={k} meta={BLOCK_META[k]} active={active === k} onClick={() => setActive(k)} />)}
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden relative min-h-[400px]">
        
        <div className="border-b border-stone-100 bg-stone-50/50 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
           <div>
              <h2 className="text-lg font-bold text-stone-900">{BLOCK_META[active]?.label}</h2>
              <p className="text-xs text-stone-500">{BLOCK_META[active]?.description}</p>
           </div>
           
           <button
             onClick={save}
             disabled={saving || loading}
             className="flex items-center gap-2 bg-stone-900 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-stone-800 disabled:opacity-70 disabled:cursor-not-allowed transition shadow-lg shadow-stone-900/10"
           >
             {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
             <span>{saving ? "Збереження..." : "Зберегти зміни"}</span>
           </button>
        </div>

        <div className="p-6 sm:p-8">
           {loading ? (
             <div className="flex items-center justify-center h-40 text-stone-400 gap-2">
                <Loader2 className="animate-spin" /> Завантаження даних...
             </div>
           ) : (
             <div className="max-w-3xl">
                {block.type === "hero" && (
                  <div className="space-y-8">
                    <Section title="Текстовий контент">
                      <Field label="Заголовок" value={block.data.title?.ua} onChange={v => onChange({ title: { ua: v } })} />
                      <Field label="Підзаголовок" value={block.data.subtitle?.ua} onChange={v => onChange({ subtitle: { ua: v } })} />
                      <div className="grid grid-cols-2 gap-4">
                         <Field label="Текст кнопки" value={block.data.button?.label?.ua} onChange={v => onChange({ button: { ...block.data.button, label: { ua: v } } })} />
                         <Field label="Посилання кнопки" value={block.data.button?.href} onChange={v => onChange({ button: { ...block.data.button, href: v } })} />
                      </div>
                    </Section>
                    <Section title="Фонове зображення">
                      <ImagesEditor images={block.data.images || []} onChange={imgs => onChange({ images: imgs })} max={1} />
                    </Section>
                  </div>
                )}

                {block.type === "cards" && (
                   <div className="space-y-8">
                      <Section title="Заголовки секції">
                         <Field label="Надзаголовок (Label)" value={block.data.label?.ua} onChange={v => onChange({ label: { ua: v } })} />
                         <Field label="Головний заголовок" value={block.data.heading?.ua} onChange={v => onChange({ heading: { ua: v } })} />
                      </Section>
                      <Section title="Картки переваг">
                         <CardsEditor items={block.data.items || []} onChange={items => onChange({ items })} />
                      </Section>
                   </div>
                )}

                {block.type === "gallery" && (
                   <div className="space-y-8">
                      <Section title="Тексти секції">
                         <Field label="Надзаголовок" value={block.data.label?.ua} onChange={v => onChange({ label: { ua: v } })} />
                         <Field label="Заголовок" value={block.data.heading?.ua} onChange={v => onChange({ heading: { ua: v } })} />
                         <Textarea label="Опис" value={block.data.description?.ua} onChange={v => onChange({ description: { ua: v } })} />
                      </Section>
                      <Section title="Слайди історій">
                         <GalleryEditor items={block.data.stories || []} onChange={stories => onChange({ stories })} />
                      </Section>
                   </div>
                )}

                {block.type === "about" && (
                   <div className="space-y-8">
                      <Section title="Тексти">
                         <Field label="Надзаголовок" value={block.data.label?.ua} onChange={v => onChange({ label: { ua: v } })} />
                         <Field label="Заголовок" value={block.data.heading?.ua} onChange={v => onChange({ heading: { ua: v } })} />
                         <ParagraphsEditor value={block.data.paragraphs || []} onChange={paragraphs => onChange({ paragraphs })} />
                      </Section>
                      <Section title="Фото майстерні">
                         <ImagesEditor images={block.data.images || []} onChange={imgs => onChange({ images: imgs })} max={1} />
                      </Section>
                      <Section title="Кнопка">
                         <div className="grid grid-cols-2 gap-4">
                           <Field label="Текст" value={block.data.cta?.label?.ua} onChange={v => onChange({ cta: { ...block.data.cta, label: { ua: v } } })} />
                           <Field label="Посилання" value={block.data.cta?.href} onChange={v => onChange({ cta: { ...block.data.cta, href: v } })} />
                         </div>
                      </Section>
                   </div>
                )}

                {block.type === "catalog" && (
                   <Section title="Зображення категорій">
                      <CatalogCategoriesEditor categories={block.data.categories || []} onChange={categories => onChange({ categories })} />
                   </Section>
                )}

                {block.type === "footer" && (
                   <div className="space-y-8">
                      <Section title="Основна інформація">
                         <Field label="Заголовок (Бренд)" value={block.data.title?.ua} onChange={v => onChange({ title: { ua: v } })} />
                         <Field label="Підзаголовок" value={block.data.subtitle?.ua} onChange={v => onChange({ subtitle: { ua: v } })} />
                         <Textarea label="Опис (Про нас)" value={block.data.description?.ua} onChange={v => onChange({ description: { ua: v } })} />
                         <Field label="Бейдж" value={block.data.badge?.ua} onChange={v => onChange({ badge: { ua: v } })} />
                      </Section>
                      <Section title="Контакти">
                         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Field label="Країна" value={block.data.contacts?.country} onChange={v => onChange({ contacts: { ...block.data.contacts, country: v } })} />
                            <Field label="Телефон" value={block.data.contacts?.phone} onChange={v => onChange({ contacts: { ...block.data.contacts, phone: v } })} />
                            <Field label="Графік" value={block.data.contacts?.schedule} onChange={v => onChange({ contacts: { ...block.data.contacts, schedule: v } })} />
                         </div>
                      </Section>
                      <Section title="Соцмережі">
                         <SocialsEditor value={block.data.socials || []} onChange={socials => onChange({ socials })} />
                      </Section>
                   </div>
                )}
             </div>
           )}
        </div>
      </div>
    </div>
  );
}

function GroupTab({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
   return (
      <button 
         onClick={onClick}
         className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
            active ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700"
         }`}
      >
         <Icon size={16} className={active ? "text-stone-900" : "text-stone-400"} />
         {label}
      </button>
   )
}

function BlockPill({ meta, active, onClick }: { meta: any, active: boolean, onClick: () => void }) {
   return (
      <button 
         onClick={onClick}
         className={`px-4 py-2 rounded-full text-xs font-medium border transition-all ${
            active 
             ? "bg-stone-900 text-white border-stone-900 shadow-md" 
             : "bg-white text-stone-600 border-stone-200 hover:border-stone-300 hover:bg-stone-50"
         }`}
      >
         {meta?.label || "Блок"}
      </button>
   )
}

function Section({ title, children }: { title: string, children: React.ReactNode }) {
   return (
      <div className="space-y-4">
         <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider border-b border-stone-100 pb-2 mb-4">
            {title}
         </h3>
         {children}
      </div>
   )
}

function Field({ label, value, onChange }: { label: string, value?: string, onChange: (v: string) => void }) {
   return (
      <div className="space-y-1.5">
         <label className="text-xs font-bold text-stone-500 uppercase">{label}</label>
         <input 
            value={value || ""}
            onChange={e => onChange(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400 transition"
         />
      </div>
   )
}

function Textarea({ label, value, onChange }: { label: string, value?: string, onChange: (v: string) => void }) {
   return (
      <div className="space-y-1.5">
         <label className="text-xs font-bold text-stone-500 uppercase">{label}</label>
         <textarea 
            rows={4}
            value={value || ""}
            onChange={e => onChange(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400 transition resize-none"
         />
      </div>
   )
}

function ImagesEditor({ images, onChange, max = 99 }: { images: ImageItem[], onChange: (next: ImageItem[]) => void, max?: number }) {
   const [uploading, setUploading] = useState(false);

   const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      setUploading(true);
      try {
         let processedFile = file;
         if (file.type.startsWith("image/")) {
            processedFile = await compressImage(file);
         }

         const reader = new FileReader();
         reader.readAsDataURL(processedFile);
         reader.onload = async () => {
            const base64 = reader.result as string;
            const res = await fetch("/api/upload", {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({ file: base64, fileName: processedFile.name })
            });
            const data = await res.json();
            if (data.ok) {
               onChange([...images, { url: data.url, kind: file.type.startsWith("video/") ? "video" : "image" }]);
            } else {
               alert("Upload failed");
            }
            setUploading(false);
         };
      } catch {
         setUploading(false);
      }
   };

   const remove = (idx: number) => onChange(images.filter((_, i) => i !== idx));

   return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
         {images.map((img, i) => (
            <div key={i} className="group relative aspect-square bg-stone-100 rounded-2xl overflow-hidden border border-stone-200">
               {img.kind === "video" || img.url?.match(/\.(mp4|webm)$/i) ? (
                  <video src={img.url} className="w-full h-full object-cover" muted />
               ) : (
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
               )}
               <button onClick={() => remove(i)} className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition shadow-sm">
                  <Trash2 size={14} />
               </button>
            </div>
         ))}
         
         {images.length < max && (
            <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-stone-300 rounded-2xl hover:bg-stone-50 cursor-pointer transition text-stone-400 hover:text-stone-600 hover:border-stone-400">
               {uploading ? <Loader2 className="animate-spin" /> : <Plus size={24} />}
               <span className="text-xs font-medium mt-2">Додати</span>
               <input type="file" className="hidden" accept="image/*,video/*" onChange={handleUpload} disabled={uploading} />
            </label>
         )}
      </div>
   )
}

function CardsEditor({ items, onChange }: { items: Item[], onChange: (next: Item[]) => void }) {
   const add = () => onChange([...items, { icon: "⭐", title: { ua: "" }, text: { ua: "" } }]);
   const remove = (idx: number) => onChange(items.filter((_, i) => i !== idx));
   const update = (idx: number, patch: Partial<Item>) => onChange(items.map((it, i) => i === idx ? { ...it, ...patch } : it));

   return (
      <div className="space-y-3">
         {items.map((it, i) => (
            <div key={i} className="flex gap-3 bg-stone-50 p-3 rounded-xl border border-stone-200 items-start">
               <div className="w-10 pt-2">
                  <input 
                     value={it.icon} 
                     onChange={e => update(i, { icon: e.target.value })} 
                     className="w-full text-center bg-white border border-stone-200 rounded-lg py-1"
                  />
               </div>
               <div className="flex-1 space-y-2">
                  <input 
                     placeholder="Заголовок"
                     value={it.title?.ua} 
                     onChange={e => update(i, { title: { ua: e.target.value } })}
                     className="w-full bg-white border border-stone-200 rounded-lg px-3 py-1.5 text-sm font-medium"
                  />
                  <input 
                     placeholder="Опис"
                     value={it.text?.ua} 
                     onChange={e => update(i, { text: { ua: e.target.value } })}
                     className="w-full bg-white border border-stone-200 rounded-lg px-3 py-1.5 text-sm"
                  />
               </div>
               <button onClick={() => remove(i)} className="text-stone-400 hover:text-rose-500 pt-2">
                  <Trash2 size={16} />
               </button>
            </div>
         ))}
         <button onClick={add} className="flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-stone-900 px-2 py-1">
            <Plus size={16} /> Додати картку
         </button>
      </div>
   )
}

function GalleryEditor({ items, onChange }: { items: any[], onChange: (next: any[]) => void }) {
   const add = () => onChange([...items, { img: "", title: { ua: "" }, text: { ua: "" }, kind: "image" }]);
   
   const uploadOne = async (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
       const file = e.target.files?.[0];
       if (!file) return;
       
       const processed = file.type.startsWith("image") ? await compressImage(file) : file;
       const reader = new FileReader();
       reader.readAsDataURL(processed);
       reader.onload = async () => {
          const res = await fetch("/api/upload", { method: "POST", body: JSON.stringify({ file: reader.result, fileName: processed.name }) });
          const data = await res.json();
          if (data.ok) {
             const next = [...items];
             next[idx] = { ...next[idx], img: data.url, kind: file.type.startsWith("video") ? "video" : "image" };
             onChange(next);
          }
       }
   };
   
   const remove = (idx: number) => onChange(items.filter((_, i) => i !== idx));
   const update = (idx: number, patch: any) => onChange(items.map((it, i) => i === idx ? { ...it, ...patch } : it));

   return (
      <div className="space-y-4">
         {items.map((it, i) => (
            <div key={i} className="bg-stone-50 p-4 rounded-2xl border border-stone-200 flex flex-col sm:flex-row gap-4">
               <label className="w-full sm:w-32 aspect-square bg-stone-200 rounded-xl overflow-hidden cursor-pointer flex items-center justify-center hover:opacity-80 transition relative">
                  {it.img ? (
                     it.kind === "video" ? <video src={it.img} className="w-full h-full object-cover" /> : <img src={it.img} className="w-full h-full object-cover" alt="" />
                  ) : <ImageIcon className="text-stone-400" />}
                  <input type="file" className="hidden" onChange={e => uploadOne(i, e)} />
               </label>
               
               <div className="flex-1 space-y-3">
                  <Field label="Заголовок" value={it.title?.ua} onChange={v => update(i, { title: { ua: v } })} />
                  <Textarea label="Текст" value={it.text?.ua} onChange={v => update(i, { text: { ua: v } })} />
               </div>
               <button onClick={() => remove(i)} className="self-start text-stone-400 hover:text-rose-500">
                  <Trash2 size={18} />
               </button>
            </div>
         ))}
         <button onClick={add} className="btn btn-light w-full py-3 flex items-center justify-center gap-2 border border-dashed border-stone-300 rounded-xl text-stone-600 hover:bg-stone-50">
            <Plus size={16} /> Додати історію
         </button>
      </div>
   )
}

function ParagraphsEditor({ value, onChange }: { value: string[], onChange: (v: string[]) => void }) {
   const add = () => onChange([...value, ""]);
   const update = (i: number, v: string) => onChange(value.map((p, idx) => idx === i ? v : p));
   const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));

   return (
      <div className="space-y-3">
         {value.map((p, i) => (
            <div key={i} className="flex gap-2">
               <textarea 
                  rows={3}
                  value={p}
                  onChange={e => update(i, e.target.value)}
                  className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10"
               />
               <button onClick={() => remove(i)} className="text-stone-400 hover:text-rose-500 self-center">
                  <Trash2 size={16} />
               </button>
            </div>
         ))}
         <button onClick={add} className="text-sm font-medium text-stone-600 hover:text-stone-900 flex items-center gap-2">
            <Plus size={16} /> Додати абзац
         </button>
      </div>
   )
}

function CatalogCategoriesEditor({ categories, onChange }: { categories: any[], onChange: (v: any[]) => void }) {
   const updateImage = (i: number, img: ImageItem) => {
      const next = [...categories];
      next[i] = { ...next[i], image: img };
      onChange(next);
   };

   return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
         {categories.map((cat, i) => (
            <div key={i} className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
               <h4 className="font-bold text-stone-900 mb-3">{cat.title?.ua || cat.slug}</h4>
               <ImagesEditor images={cat.image ? [cat.image] : []} onChange={imgs => updateImage(i, imgs[0])} max={1} />
            </div>
         ))}
      </div>
   )
}

function SocialsEditor({ value, onChange }: { value: SocialItem[], onChange: (v: SocialItem[]) => void }) {
   const add = () => onChange([...value, { kind: "instagram", label: "Instagram", href: "", enabled: true }]);
   const update = (i: number, patch: Partial<SocialItem>) => onChange(value.map((it, idx) => idx === i ? { ...it, ...patch } : it));
   const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));

   return (
      <div className="space-y-3">
         {value.map((s, i) => (
            <div key={i} className="flex gap-3 items-center bg-stone-50 p-3 rounded-xl border border-stone-200">
               <div className="w-32">
                  <select 
                     value={s.kind} 
                     onChange={e => update(i, { kind: e.target.value as any })}
                     className="w-full bg-white border border-stone-200 rounded-lg py-2 px-2 text-sm"
                  >
                     <option value="instagram">Instagram</option>
                     <option value="facebook">Facebook</option>
                     <option value="telegram">Telegram</option>
                     <option value="youtube">YouTube</option>
                     <option value="tiktok">TikTok</option>
                  </select>
               </div>
               <input 
                  placeholder="Посилання (https://...)" 
                  value={s.href} 
                  onChange={e => update(i, { href: e.target.value })}
                  className="flex-1 bg-white border border-stone-200 rounded-lg py-2 px-3 text-sm"
               />
               <button onClick={() => remove(i)} className="text-stone-400 hover:text-rose-500">
                  <Trash2 size={16} />
               </button>
            </div>
         ))}
         <button onClick={add} className="flex items-center gap-2 text-sm font-medium text-stone-600">
            <Plus size={16} /> Додати соцмережу
         </button>
      </div>
   )
}