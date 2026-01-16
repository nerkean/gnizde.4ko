"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

type Img = { src: string; alt: string; kind?: "image" | "video"; posterSrc?: string };
type CTA = { text: string; href: string };

export default function HeroFade({
  images,
  title,
  subtitle,
  cta,
}: {
  images: Img[];
  title: string;
  subtitle?: string;
  cta?: CTA;
}) {
  const fallback: Img = {
    src: "/images/hero-bg.jpg",
    alt: "Солом’яні павуки — сучасний декор",
    kind: "image",
  };
  
  const media = images?.[0] ?? fallback;
  const isVideo = media.kind === "video" || /\.(mp4|webm|ogg|mov)$/i.test(media.src || "");
  const posterSrc = media.posterSrc || (isVideo ? fallback.src : media.src);
  const posterAlt = media.alt || fallback.alt;

  const [showVideo, setShowVideo] = useState(false);
  useEffect(() => {
    if (isVideo) setShowVideo(true);
  }, [isVideo]);

  return (
    <section
      className="relative h-[85vh] min-h-[600px] w-full overflow-hidden bg-stone-900"
      aria-label="Головний банер Gnizde.4ko"
    >
      <div className="absolute inset-0 select-none">
        <img
          src={posterSrc}
          alt={posterAlt}
          className="h-full w-full object-cover opacity-90"
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />

        {isVideo && showVideo && (
          <video
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in opacity-0 animate-in fade-in"
            src={media.src}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            onLoadedData={(e) => (e.currentTarget.style.opacity = "1")}
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/40 to-stone-900/30" />
        <div className="absolute inset-0 opacity-[0.03] bg-[url('/images/noise.png')] mix-blend-overlay pointer-events-none" />
      </div>

      <div className="relative z-10 flex h-full items-center justify-center px-4 sm:px-6">
        <div className="flex max-w-4xl flex-col items-center text-center">
          
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
            </span>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white">
              Gnizde.4ko
            </span>
          </div>

          <h1 className="mb-6 font-display text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-7xl lg:text-[5rem] drop-shadow-sm">
            {title}
          </h1>

          {subtitle && (
            <p className="mb-10 max-w-2xl text-lg font-light leading-relaxed text-stone-200 sm:text-xl md:text-2xl">
              {subtitle}
            </p>
          )}

          {cta && (
            <div className="flex justify-center">
              <Link
                href={cta.href}
                className="group relative flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-bold uppercase tracking-wider text-stone-900 transition-all hover:bg-stone-100 hover:scale-105 active:scale-95 shadow-xl shadow-black/20"
              >
                {cta.text}
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          )}
          
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-white/50">
             <div className="h-10 w-6 rounded-full border-2 border-white/30 flex justify-center pt-2">
                <div className="h-1.5 w-1 bg-white/50 rounded-full animate-scroll" />
             </div>
          </div>

        </div>
      </div>
    </section>
  );
}