import { redirect } from "next/navigation";
import Link from "next/link";
import { getHackathonUser } from "@/lib/hackathon2.0/rbac";
import { createClient } from "@/lib/supabase/server";
import { HackathonSidebar } from "./HackathonSidebar";
import { type LucideIcon } from "lucide-react";

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) redirect("/hackathon2.0/signin");

  const user = await getHackathonUser();
  if (!user) redirect("/hackathon2.0/not-registered");

  const isAdmin = user.role === "ADMIN";

  return (
    <div className="flex min-h-screen bg-transparent text-[#e0e0e0] relative">
      <HackathonSidebar user={user} />

      {/* Main content */}
      <main className="flex-1 overflow-auto relative z-10 pt-16 lg:pt-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">{children}</div>
      </main>
    </div>
  );
}

