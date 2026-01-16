"use client";

import Image from "next/image";

type StoryItem = {
  img?: string;    
  title?: string;   
  text?: string;   
  alt?: string;    
  kind?: "image" | "video"; 
};

export default function GiftStory({
  label,
  heading,
  description,
  items,
}: {
  label?: string;
  heading?: string;
  description?: string;
  items?: StoryItem[];
}) {
  const data = (items && items.length ? items : []).slice(0, 8);

  const labelText = label || "Історії";
  const headingText = heading || "Подарункова історія";
  const descriptionText = description || "Затишок дому та традиції в кожній формі.";

  const isVideoItem = (item: StoryItem): boolean => {
    if (item.kind === "video") return true;
    if (item.kind === "image") return false;
    const src = item.img || "";
    return /\.(mp4|webm|ogg|mov)$/i.test(src);
  };

  return (
    <section className="w-full">

      <div className="mx-auto max-w-2xl text-center mb-12 sm:mb-16">
        <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-amber-700 mb-3">
          {labelText}
        </span>
        <h2 className="text-3xl sm:text-4xl font-bold font-display text-stone-900 mb-4 leading-tight">
          {headingText}
        </h2>
        <p className="text-stone-600 text-lg leading-relaxed">
          {descriptionText}
        </p>
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:gap-12">
        {data.map((item, idx) => {
          const isVideo = isVideoItem(item);
          const altText = item.alt || item.title || "Gift story";

          return (
            <article
              key={`${item.title ?? "story"}-${idx}`}
              className="group flex flex-col gap-6"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem] bg-stone-100 shadow-sm transition-all duration-500 group-hover:shadow-md">
                {!!item.img && (
                  isVideo ? (
                    <video
                      src={item.img}
                      className="h-full w-full object-cover"
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                  ) : (
                    <Image
                      src={item.img}
                      alt={altText}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(min-width:1024px) 800px, (min-width:640px) 50vw, 100vw"
                    />
                  )
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </div>

              <div className="px-2">
                {item.title && (
                  <h3 className="mb-3 text-xl sm:text-2xl font-bold text-stone-900 group-hover:text-amber-700 transition-colors duration-300">
                    {item.title}
                  </h3>
                )}
                {item.text && (
                  <p className="text-base text-stone-600 leading-relaxed max-w-xl">
                    {item.text}
                  </p>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}