import type { Metadata } from "next";
import { getAllProducts } from "@/lib/products";
import HeroFade from "@/components/landing/HeroFade";
import GiftStory from "@/components/landing/GiftStory";
import AboutWorkshop from "@/components/landing/AboutWorkshop";
import Features from "@/components/landing/Features";
import FeaturedProducts from "@/components/landing/FeaturedProducts";

import { connectDB } from "@/lib/mongodb";
import ContentBlock from "@/models/ContentBlock";

export const metadata: Metadata = {
  title: "Gnizde.4ko — соломʼяні павуки та декор з соломи",
  description:
    "Майстерня Gnizde.4ko створює соломʼяні павуки, вінки та інший традиційний декор з натуральної соломи. Ручна робота, унікальні дизайни, подарункові набори та сучасний мінімалістичний стиль.",
  keywords: [
    "Gnizde.4ko",
    "соломʼяні павуки",
    "солом'яні павуки",
    "соломʼяний декор",
    "дідухи",
    "соломʼяні вінки",
    "декор з соломи",
    "український традиційний декор",
    "етнодекор",
    "handmade decor",
  ],
  openGraph: {
    title: "Gnizde.4ko — соломʼяні павуки та декор з соломи",
    description:
      "Соломʼяні павуки, вінки, дідухи та інший декор з натуральної соломи від майстерні Gnizde.4ko. Ручна робота, унікальні композиції та подарункові набори.",
    type: "website",
    siteName: "Gnizde.4ko",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gnizde.4ko — соломʼяні павуки та декор з соломи",
    description:
      "Традиційний і сучасний соломʼяний декор ручної роботи від Gnizde.4ko.",
  },
};

export const dynamic = "force-static";
export const revalidate = 60;

// ---------- ТИПИЗАЦИЯ (Оставляем как было, чтобы не сломать CMS) ----------
type LangText = string | { ua?: string; uk?: string };
type HeroImage = {
  url?: string;
  src?: string;
  alt?: string | { ua?: string };
  kind?: "image" | "video";
};

type HeroButton = { label?: string | { ua?: string }; text?: string; href?: string };
type HeroData = {
  title?: LangText;
  subtitle?: LangText;
  button?: HeroButton;
  images?: HeroImage[];
};

type FeatureDocItem = {
  icon?: string;
  title?: { ua?: string; uk?: string } | string;
  text?: { ua?: string; uk?: string } | string;
};

type FeaturesData = {
  label?: { ua?: string; uk?: string } | string;
  heading?: { ua?: string; uk?: string } | string;
  items?: FeatureDocItem[];
};

type GiftDocItem = {
  img?: string;
  title?: { ua?: string; uk?: string } | string;
  text?: { ua?: string; uk?: string } | string;
  alt?: { ua?: string; uk?: string } | string;
  image?: { url?: string; alt?: { ua?: string } | string };
};

type GiftStoryStory = {
  img?: string;
  title?: { ua?: string; uk?: string } | string;
  text?: { ua?: string; uk?: string } | string;
  alt?: { ua?: string; uk?: string } | string;
};

type GiftStoryData = {
  label?: { ua?: string; uk?: string } | string;
  heading?: { ua?: string; uk?: string } | string;
  description?: { ua?: string; uk?: string } | string;
  items?: GiftDocItem[];
  stories?: GiftStoryStory[];
  title?: { ua?: string; uk?: string } | string;
  text?: { ua?: string; uk?: string } | string;
  images?: { url?: string; alt?: { ua?: string } | string }[];
};

type AboutDocData = {
  label?: { ua?: string; uk?: string } | string;
  heading?: { ua?: string; uk?: string } | string;
  paragraphs?: (string | { ua?: string; uk?: string })[];
  image?: {
    url?: string;
    alt?: { ua?: string; uk?: string } | string;
    kind?: "image" | "video";
  };
  images?: {
    url?: string;
    alt?: { ua?: string; uk?: string } | string;
    kind?: "image" | "video";
  }[];
  cta?: { label?: { ua?: string; uk?: string } | string; href?: string };
};

// ---------- FETCHING DATA (Логика без изменений) ----------
async function getAboutDoc(): Promise<(AboutDocData & { updatedAt?: string }) | null> {
  await connectDB();
  const doc = (await ContentBlock.findOne({ key: "home.about" })
    .lean()
    .select({ data: 1, updatedAt: 1, _id: 0 })) as { data?: AboutDocData; updatedAt?: string } | null;
  return doc ? { ...(doc.data || {}), updatedAt: doc.updatedAt } : null;
}

async function getHeroDoc(): Promise<HeroData | null> {
  await connectDB();
  const doc = (await ContentBlock.findOne({ key: "home.hero" })
    .lean()
    .select({ data: 1, _id: 0 })) as { data?: HeroData } | null;
  return doc?.data ?? null;
}

async function getFeaturesDoc(): Promise<FeaturesData | null> {
  await connectDB();
  const doc = (await ContentBlock.findOne({ key: "home.features" })
    .lean()
    .select({ data: 1, _id: 0 })) as { data?: FeaturesData } | null;
  return doc?.data ?? null;
}

async function getGiftDoc(): Promise<GiftStoryData | null> {
  await connectDB();
  const doc = (await ContentBlock.findOne({ key: "home.giftStory" })
    .lean()
    .select({ data: 1, _id: 0 })) as { data?: GiftStoryData } | null;
  return doc?.data ?? null;
}

// ---------- PAGE COMPONENT ----------
export default async function HomePage() {
  const products = await getAllProducts();

  const plain = products.map((p) => ({
    id: p.id,
    slug: p.slug,
    title_ua: p.title_ua,
    priceUAH: p.priceUAH,
    imageUrl:
      (p as any).imageUrl ||
      (Array.isArray(p.images) && p.images.length
        ? p.images[0]
        : "/images/placeholder.svg"),
    stock: p.stock,
    availability: p.availability,
  }));

  const featured = plain.slice(0, 8);

  // --- HERO DATA ---
  const hero = await getHeroDoc();
  const heroTitle =
    typeof hero?.title === "string" ? hero.title : hero?.title?.ua || hero?.title?.uk || "Соломʼяні прикраси";
  const heroSubtitle =
    typeof hero?.subtitle === "string" ? hero.subtitle : hero?.subtitle?.ua || hero?.subtitle?.uk || "Ручна робота з натуральної соломи";
  
  const heroCTA = hero?.button?.href ? {
      text: typeof hero.button.label === "string" ? hero.button.label : hero.button.label?.ua || hero.button.text || "Каталог",
      href: hero.button.href || "/catalog",
    } : undefined;

  const heroImages = Array.isArray(hero?.images) && hero.images.length
    ? hero.images.map((x) => ({
        src: x?.url || x?.src || "/images/placeholder.svg",
        alt: typeof x?.alt === "string" ? x.alt : x?.alt?.ua || "Hero",
        kind: (x as any).kind,
      }))
    : [
        { src: "/images/IMG_6610.JPG", alt: "Соломʼяні павуки — сучасний декор" },
        { src: "/images/IMG_7662.JPG", alt: "Набори для плетіння павуків" },
        { src: "/images/IMG_7624.JPG", alt: "Ручна робота з натуральної соломи" },
      ];

  // --- FEATURES DATA ---
  const featuresDoc = await getFeaturesDoc();
  const featuresLabel = typeof featuresDoc?.label === "string" ? featuresDoc.label : featuresDoc?.label?.ua || featuresDoc?.label?.uk;
  const featuresHeading = typeof featuresDoc?.heading === "string" ? featuresDoc.heading : featuresDoc?.heading?.ua || featuresDoc?.heading?.uk;
  const featureItems = (featuresDoc?.items || []).slice(0, 8).map((it) => ({
    icon: it.icon || "⭐",
    title: typeof it.title === "string" ? it.title : it.title?.ua || it.title?.uk || "",
    text: typeof it.text === "string" ? it.text : it.text?.ua || it.text?.uk || "",
  }));

  // --- GIFT STORY DATA ---
  const giftDoc = await getGiftDoc();
  const giftLabel = typeof giftDoc?.label === "string" ? giftDoc.label : giftDoc?.label?.ua || giftDoc?.label?.uk || "ІСТОРІЇ";
  const giftHeading = typeof giftDoc?.heading === "string" ? giftDoc.heading : giftDoc?.heading?.ua || giftDoc?.heading?.uk || (typeof giftDoc?.title === "string" ? giftDoc.title : giftDoc?.title?.ua || giftDoc?.title?.uk || "Подарункова історія");
  const giftDescription = typeof giftDoc?.description === "string" ? giftDoc.description : giftDoc?.description?.ua || giftDoc?.description?.uk || (typeof giftDoc?.text === "string" ? giftDoc.text : giftDoc?.text?.ua || giftDoc?.text?.uk || "");

  type GiftAny = GiftDocItem | { img?: string; title?: any; text?: any; alt?: any };
  const rawGiftItems: GiftAny[] = (giftDoc?.items && giftDoc.items.length ? giftDoc.items : giftDoc?.stories && (giftDoc.stories as any[]).length ? (giftDoc.stories as any[]).map((s) => ({ img: s.img, title: s.title, text: s.text, alt: s.alt })) : (giftDoc?.images || []).map((img) => ({ img: img.url, alt: img.alt, title: "", text: "" }))) as GiftAny[];
  
  const giftItems = rawGiftItems.slice(0, 8).map((it) => ({
    img: (it as any).img || ((it as any).image?.url ?? ""),
    alt: typeof (it as any).alt === "string" ? (it as any).alt : ((it as any).alt?.ua as string),
    title: typeof (it as any).title === "string" ? (it as any).title : ((it as any).title?.ua as string) || "",
    text: typeof (it as any).text === "string" ? (it as any).text : ((it as any).text?.ua as string) || "",
  }));

  // --- ABOUT DATA ---
  const aboutDoc = await getAboutDoc();
  const aboutLabel = typeof aboutDoc?.label === "string" ? aboutDoc.label : aboutDoc?.label?.ua;
  const aboutHeading = typeof aboutDoc?.heading === "string" ? aboutDoc.heading : aboutDoc?.heading?.ua;
  const aboutParagraphs = (aboutDoc?.paragraphs || []).map((p) => typeof p === "string" ? p : p?.ua || "");
  const rawAboutImg = aboutDoc?.image ?? (Array.isArray(aboutDoc?.images) && aboutDoc.images.length ? aboutDoc.images[0] : undefined);
  const rawAboutImgUrl = rawAboutImg?.url;
  const isVideoAbout = rawAboutImg?.kind === "video" || (rawAboutImgUrl ? /\.(mp4|webm|ogg|mov)$/i.test(rawAboutImgUrl) : false);
  const bust = aboutDoc?.updatedAt ? new Date(aboutDoc.updatedAt).getTime() : undefined;
  
  const aboutImage = rawAboutImgUrl ? {
      src: rawAboutImgUrl + (rawAboutImgUrl.includes("?") ? "&" : "?") + `v=${bust ?? Date.now()}`,
      alt: typeof aboutDoc?.image?.alt === "string" ? aboutDoc?.image?.alt : (aboutDoc?.image?.alt as any)?.ua || "",
      kind: (isVideoAbout ? "video" : "image") as "video" | "image",
    } : undefined;

  const aboutCTA = aboutDoc?.cta?.href ? {
      href: aboutDoc.cta.href,
      text: typeof aboutDoc.cta.label === "string" ? aboutDoc.cta.label : aboutDoc.cta.label!.ua || "Дізнатися більше",
    } : undefined;

  return (
    <main className="bg-[#FAFAF9] overflow-x-hidden">
      
      {/* 1. HERO SECTION */}
      {/* Оставляем на всю ширину и высоту */}
      <HeroFade images={heroImages} title={heroTitle} subtitle={heroSubtitle} cta={heroCTA} />


      {/* 2. GIFT STORY SECTION */}
      {/* Делаем чистую белую секцию с легкой атмосферой */}
      <section className="relative py-20 lg:py-28 bg-white overflow-hidden">
        {/* Декоративный блур (как на странице товара) */}
        <div className="absolute top-0 left-[-10%] w-[40vw] h-[40vw] bg-amber-100/30 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container relative z-10">
          <GiftStory
            label={giftLabel}
            heading={giftHeading}
            description={giftDescription}
            items={giftItems}
          />
        </div>
      </section>


      {/* 3. ABOUT WORKSHOP SECTION */}
      {/* Секция с теплым оттенком (Stone-50) */}
      <section className="relative py-20 lg:py-28 bg-stone-50 border-t border-stone-100">
         {/* Декоративный блур справа */}
         <div className="absolute bottom-0 right-[-5%] w-[35vw] h-[35vw] bg-emerald-100/20 blur-[100px] rounded-full pointer-events-none" />

         <AboutWorkshop
           label={aboutLabel}
           heading={aboutHeading}
           paragraphs={aboutParagraphs}
           image={aboutImage}
           cta={aboutCTA}
         />
      </section>


      {/* 4. FEATURES SECTION */}
      {/* Промежуточная секция, чистая */}
      <section className="py-16 lg:py-24 bg-white border-y border-stone-100">
        <div className="container">
           <Features 
              label={featuresLabel} 
              heading={featuresHeading} 
              items={featureItems} 
           />
        </div>
      </section>


      {/* 5. FEATURED PRODUCTS SECTION */}
      {/* Финальная секция с товарами */}
      <section className="relative py-20 lg:py-28 bg-gradient-to-b from-stone-50 to-white">
        <div className="container">
          <FeaturedProducts
            title="Хіти та новинки"
            subtitle="Найпопулярніші вироби цього сезону"
            products={featured}
            moreLink="/catalog"
          />
        </div>
      </section>

    </main>
  );
}