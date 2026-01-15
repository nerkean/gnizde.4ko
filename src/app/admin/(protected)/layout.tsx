// src/app/admin/(protected)/layout.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_NAME } from "@/lib/admin-auth";
import AdminNavbar from "@/components/AdminNavbar";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const store = await cookies();
  const authed = store.get(COOKIE_NAME)?.value === "1";

  if (!authed) {
    redirect("/admin/login?next=/admin");
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      {/* Хедер (fixed, высота h-16 = 64px) */}
      <AdminNavbar />

      {/* 👇 ГЛАВНОЕ ИСПРАВЛЕНИЕ: pt-24 (96px) 
         Это опускает контент вниз, чтобы хедер его не перекрывал.
      */}
      <main className="container mx-auto px-4 sm:px-6 pt-24 pb-12">
        {children}
      </main>
    </div>
  );
}