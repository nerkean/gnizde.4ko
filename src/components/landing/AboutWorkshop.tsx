"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

type AboutImage = {
  src?: string;
  alt?: string;
  kind?: "image" | "video";
};

type AboutCTA = { text?: string; href?: string };

export default function AboutWorkshop({
  label,
  heading,
  paragraphs,
  image,
  cta,
}: {
  label?: string;
  heading?: string;
  paragraphs?: string[];
  image?: AboutImage;
  cta?: AboutCTA;
}) {
  const safeLabel = label ?? "Майстерня";
  const safeHeading = heading ?? "Про нашу майстерню";

  const safeParagraphs =
    (paragraphs && paragraphs.length
      ? paragraphs
      : [
          "Ми створюємо соломʼяні «павуки» та декор вручну, поєднуючи традицію з мінімалістичним дизайном.",
          "Кожен виріб — це ретельний добір матеріалів, пропорцій та форм, аби наповнити простір теплом і затишком.",
        ]
    ).slice(0, 3);

  const looksLikeVideo = (src?: string, kind?: "image" | "video") => {
    if (kind === "video") return true;
    if (kind === "image") return false;
    if (!src) return false;
    return /\.(mp4|webm|ogg|mov)$/i.test(src);
  };

  const isVideo = looksLikeVideo(image?.src, image?.kind);
  const safeImg: AboutImage = {
    src: image?.src || "/images/IMG_7344.JPG",
    alt: image?.alt || "Процес створення солом’яних павуків",
    kind: isVideo ? "video" : "image",
  };

  const safeCTA = cta?.href && cta?.text 
    ? { href: cta.href, text: cta.text }
    : undefined;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative order-2 lg:order-1"
        >
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] bg-stone-200 shadow-xl shadow-stone-900/5">
            {safeImg.src && (
              safeImg.kind === "video" ? (
                <video
                  src={safeImg.src}
                  className="h-full w-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : (
                <Image
                  src={safeImg.src}
                  alt={safeImg.alt || ""}
                  fill
                  className="object-cover transition-transform duration-[1.5s] hover:scale-105"
                  sizes="(min-width: 1024px) 50vw, 100vw"
                />
              )
            )}
            
            <div className="absolute inset-0 rounded-[2rem] border border-black/5 pointer-events-none" />
          </div>
          
          <div className="absolute -bottom-6 -left-6 -z-10 h-full w-full rounded-[2.5rem] bg-stone-100" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="order-1 flex flex-col justify-center lg:order-2"
        >
          <span className="mb-4 inline-block text-xs font-bold uppercase tracking-[0.2em] text-amber-700">
            {safeLabel}
          </span>
          
          <h2 className="mb-6 text-3xl font-bold font-display leading-tight text-stone-900 sm:text-4xl lg:text-5xl">
            {safeHeading}
          </h2>

          <div className="space-y-6 text-lg text-stone-600 leading-relaxed">
            {safeParagraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {safeCTA && (
            <div className="mt-8 sm:mt-10">
              <Link
                href={safeCTA.href!}
                className="group inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-stone-900 hover:text-amber-700 transition-colors"
              >
                {safeCTA.text}
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
}