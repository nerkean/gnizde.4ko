const ukMap: Record<string, string> = {
  а: "a",  б: "b",  в: "v",  г: "h",  ґ: "g",
  д: "d",  е: "e",  є: "ye", ж: "zh", з: "z",
  и: "y",  і: "i",  ї: "yi", й: "i",  к: "k",
  л: "l",  м: "m",  н: "n",  о: "o",  п: "p",
  р: "r",  с: "s",  т: "t",  у: "u",  ф: "f",
  х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "shch",
  ь: "",   ю: "yu", я: "ya",
};

export function toSlug(s: string): string {
  if (!s) return "";

  const lower = s.toLowerCase().trim();

  const translit = lower
    .split("")
    .map((ch) => ukMap[ch] ?? ch)
    .join("");

  const clean = translit
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/--+/g, "-");

  return clean.slice(0, 80);
}
