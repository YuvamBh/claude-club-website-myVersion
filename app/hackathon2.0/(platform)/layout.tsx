import { redirect } from "next/navigation";
import Link from "next/link";
import { getHackathonUser } from "@/lib/hackathon2.0/rbac";
import { SignOutButton } from "./SignOutButton";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Send,
  BarChart3,
  FileText,
  Settings,
  Trophy,
  type LucideIcon,
} from "lucide-react";

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getHackathonUser();
  if (!user) redirect("/hackathon2.0/signin");

  const isAdmin = user.role === "ADMIN";

  return (
    <div className="flex min-h-screen bg-transparent text-[#e0e0e0] relative">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-white/10 flex flex-col bg-[#161616]/80 backdrop-blur-xl">
        {/* Brand */}
        <div className="px-5 py-5 border-b border-white/10">
          <Link href="/hackathon2.0" className="flex items-center gap-2.5 group">
            <Trophy size={20} className="text-[#ff9b7a]" />
            <span className="font-bold text-[#ff9b7a] text-sm tracking-wide">HackASU</span>
          </Link>
          <p className="text-xs text-white/30 mt-1 pl-7">Platform</p>
        </div>

        {/* Participant nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <p className="text-[10px] uppercase tracking-widest text-white/30 px-2 pb-1.5 pt-1">
            Participant
          </p>
          <NavItem href="/hackathon2.0/dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem href="/hackathon2.0/apply" icon={ClipboardList} label="Application" />
          <NavItem href="/hackathon2.0/team" icon={Users} label="My Team" />
          <NavItem href="/hackathon2.0/submit" icon={Send} label="Submit Project" />

          {/* Admin section */}
          {isAdmin && (
            <>
              <p className="text-[10px] uppercase tracking-widest text-white/30 px-2 pb-1.5 pt-4">
                Admin
              </p>
              <NavItem href="/hackathon2.0/admin" icon={BarChart3} label="Overview" />
              <NavItem href="/hackathon2.0/admin/applicants" icon={FileText} label="Applicants" />
              <NavItem href="/hackathon2.0/admin/teams" icon={Users} label="Teams" />
              <NavItem href="/hackathon2.0/admin/submissions" icon={Send} label="Submissions" />
              <NavItem href="/hackathon2.0/admin/content" icon={Settings} label="Content" />
            </>
          )}
        </nav>

        {/* User */}
        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#ff9b7a]/20 flex items-center justify-center shrink-0">
              <span className="text-[#ff9b7a] text-xs font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-white/80 truncate">{user.name}</p>
              <p className="text-[10px] text-white/40 truncate">{user.email}</p>
            </div>
            {isAdmin && (
              <span className="ml-auto shrink-0 text-[9px] bg-[#ff9b7a]/20 text-[#ff9b7a] px-1.5 py-0.5 rounded font-medium">
                ADMIN
              </span>
            )}
          </div>
          <SignOutButton />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto relative z-10">
        <div className="max-w-5xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  );
}

function NavItem({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/50 hover:text-white/90 hover:bg-white/5 transition-colors group"
    >
      <Icon size={15} className="shrink-0 group-hover:text-[#ff9b7a] transition-colors" />
      {label}
    </Link>
  );
}
