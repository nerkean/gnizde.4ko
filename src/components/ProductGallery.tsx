"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { Play, Volume2, VolumeX } from "lucide-react";

type GalleryImage = string | { src: string; alt_ua?: string };

type ProductGalleryProps = {
  images: GalleryImage[];
  title: string;
  className?: string;
};

function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm|ogg|mov)$/i.test(url);
}

export default function ProductGallery({
  images,
  title,
  className = "",
}: ProductGalleryProps) {
  const safe = Array.isArray(images) && images.length > 0
    ? images.map((img) => {
        const src = typeof img === "string" ? img : img.src;
        const alt = typeof img === "string" ? title : img.alt_ua || title;
        const kind: "image" | "video" = isVideoUrl(src) ? "video" : "image";
        return { src, alt, kind };
      })
    : [{ src: "/images/placeholder.svg", alt: title, kind: "image" }];

  const [active, setActive] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      const width = scrollRef.current.offsetWidth;
      const index = Math.round(scrollLeft / width);
      setActive(index);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      const width = scrollRef.current.offsetWidth;
      scrollRef.current.scrollTo({ left: active * width, behavior: "smooth" });
    }
  }, [active]);

  return (
    <div className={`w-full ${className}`}>
      
      {/* 📱 МОБИЛЬНАЯ ВЕРСИЯ (Квадрат + Свайп + Отступы) */}
      <div className="lg:hidden relative select-none group">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex w-full overflow-x-auto snap-x snap-mandatory scrollbar-hide aspect-square bg-white"
        >
          {safe.map((item, idx) => (
            <div 
              key={idx} 
              className="w-full flex-shrink-0 snap-center relative flex items-center justify-center bg-white"
            >
              {item.kind === "video" ? (
                <MobileVideoPlayer src={item.src} />
              ) : (
                <div className="relative w-full h-full p-6"> 
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    className="object-contain"
                    priority={idx === 0}
                    sizes="(max-width: 768px) 100vw, 500px"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Точки */}
        {safe.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
            {safe.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 shadow-sm ${
                  i === active 
                    ? "w-6 bg-stone-800" 
                    : "w-1.5 bg-stone-300"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* 💻 ДЕСКТОП ВЕРСИЯ (Квадрат + Миниатюры) */}
      <div className="hidden lg:flex flex-col gap-4">
        
        {/* Главное окно */}
        <div 
          className="relative w-full bg-white overflow-hidden rounded-2xl"
          style={{ aspectRatio: '1/1' }}
        >
          {safe[active].kind === "video" ? (
            <div className="absolute inset-0 bg-black flex items-center justify-center">
              <video
                src={safe[active].src}
                className="w-full h-full object-contain"
                controls
                playsInline
                preload="metadata"
              />
            </div>
          ) : (
            <div className="relative w-full h-full p-8">
              <Image
                src={safe[active].src}
                alt={safe[active].alt}
                fill
                className="object-contain hover:scale-105 transition-transform duration-500 ease-out" 
                sizes="50vw"
                priority
              />
            </div>
          )}
        </div>

        {/* Миниатюры */}
        {safe.length > 1 && (
          <div className="grid grid-cols-6 gap-2 px-1">
            {safe.map((item, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`
                  relative aspect-square w-full rounded-lg overflow-hidden transition-all duration-200 border-2
                  ${i === active 
                    ? "border-stone-900 opacity-100 ring-1 ring-stone-900" 
                    : "border-transparent opacity-60 hover:opacity-100 bg-stone-50"
                  }
                `}
              >
                {item.kind === "video" ? (
                  <div className="w-full h-full bg-stone-800 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Play size={14} className="fill-white text-white" />
                    </div>
                  </div>
                ) : (
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    className="object-contain p-1" 
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MobileVideoPlayer({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center" onClick={togglePlay}>
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-contain"
        playsInline
        loop
        muted={isMuted}
        preload="metadata"
      />
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 pointer-events-none">
          <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/30">
            <Play size={32} className="fill-white text-white ml-1" />
          </div>
        </div>
      )}
      {isPlaying && (
        <button 
          onClick={toggleMute}
          className="absolute bottom-4 right-4 p-2.5 rounded-full bg-black/40 text-white backdrop-blur-md z-10"
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      )}
    </div>
  );
}