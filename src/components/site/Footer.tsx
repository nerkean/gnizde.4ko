import Link from "next/link";
import {
  Instagram,
  Facebook,
  Youtube,
  Phone,
  MapPin,
  Clock,
  ArrowUpRight
} from "lucide-react";
import { getContentBlock } from "@/lib/content-block";
import Image from "next/image";

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  );
}

type SocialItem = {
  kind?: "instagram" | "facebook" | "youtube" | "tiktok" | "telegram" | "custom";
  href?: string;
  label?: string;
  enabled?: boolean;
};

function SocialIcon({ kind }: { kind?: SocialItem["kind"] }) {
  switch (kind) {
    case "instagram": return <Instagram className="h-4 w-4" />;
    case "facebook": return <Facebook className="h-4 w-4" />;
    case "youtube": return <Youtube className="h-4 w-4" />;
    case "tiktok": return <TikTokIcon />;
    case "telegram": return <TelegramIcon />;
    default: return <span className="text-[10px] font-bold">SOC</span>;
  }
}

export default async function Footer() {
  const footer = await getContentBlock("footer.main");
  const data: any = footer?.data || {};

  const title = data.title?.ua || "Майстерня солом'яного декору";
  const desc = data.description?.ua || "Створюємо затишок та оберігаємо традиції. Кожен виріб зроблено з любов'ю та увагою до деталей.";
  
  const contacts = data.contacts || {
    country: "Україна",
    phone: "+380 (99) 123-45-67",
    schedule: "Пн–Нд: 10:00–19:00",
  };

  const defaultSocials: SocialItem[] = [
    { kind: "instagram", href: "https://instagram.com/", enabled: true },
    { kind: "facebook", href: "https://facebook.com/", enabled: true },
  ];

  const socials: SocialItem[] = (data.socials || defaultSocials).filter(
    (s: SocialItem) => (s.enabled ?? true) && s.href
  );

  const year = new Date().getFullYear();

  return (
    <footer className="bg-stone-50 border-t border-stone-200 text-stone-600 pt-16 pb-8">
      <div className="container px-4 md:px-6">
        
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr] mb-16">
          
          <div className="space-y-6">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <div className="relative h-10 w-10 overflow-hidden rounded-full border border-amber-100 bg-white p-1.5 shadow-sm transition-transform group-hover:rotate-12">
                 <Image src="/images/logo.svg" alt="Logo" width={40} height={40} className="w-full h-full object-contain" />
              </div>
              <span className="font-display text-xl font-bold text-stone-900 tracking-tight">Gnizde.4ko</span>
            </Link>
            
            <div className="space-y-4 max-w-sm">
              <h3 className="font-medium text-stone-900">{title}</h3>
              <p className="text-sm leading-relaxed text-stone-500">
                {desc}
              </p>
            </div>

            <div className="flex gap-2">
              {socials.map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white border border-stone-200 text-stone-600 hover:text-amber-700 hover:border-amber-200 hover:bg-amber-50 transition-all shadow-sm"
                  aria-label={s.label || s.kind}
                >
                  <SocialIcon kind={s.kind} />
                </a>
              ))}
            </div>
          </div>

          <div className="lg:pl-8">
            <h4 className="font-semibold text-stone-900 mb-5 text-sm uppercase tracking-wider">Каталог</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/catalog" className="hover:text-amber-700 transition flex items-center gap-1 group">
                  Всі вироби
                  <ArrowUpRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </Link>
              </li>
              <li><Link href="/catalog?group=pavuky" className="hover:text-amber-700 transition">Павуки</Link></li>
              <li><Link href="/catalog?group=vinky" className="hover:text-amber-700 transition">Вінки</Link></li>
              <li><Link href="/catalog?group=other" className="hover:text-amber-700 transition">Інший декор</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-stone-900 mb-5 text-sm uppercase tracking-wider">Контакти</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-amber-600/70 shrink-0" />
                <span className="text-stone-600">{contacts.country}</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-amber-600/70 shrink-0" />
                <a href={`tel:${contacts.phone}`} className="hover:text-amber-700 hover:underline transition">
                  {contacts.phone}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-amber-600/70 shrink-0" />
                <span>{contacts.schedule}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-200 pt-8 flex justify-center text-xs text-stone-400">
          <p>© {year} Gnizde.4ko. Всі права захищені.</p>
        </div>
      </div>
    </footer>
  );
}