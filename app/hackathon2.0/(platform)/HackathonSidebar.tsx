"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  Send,
  BarChart3,
  Settings,
  Trophy,
  Menu,
  X,
  QrCode,
  MapPin,
  Star,
  UserCheck,
  Upload,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { SignOutButton } from "./SignOutButton";

interface HackathonSidebarProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
}

export function HackathonSidebar({ user }: HackathonSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isAdmin = user.role === "ADMIN" || user.role === "ORGANIZER";
  const isJudge = user.role === "JUDGE";
  const close = () => setIsOpen(false);

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-[#161616]/95 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-4 z-40">
        <Link href="/hackathon2.0" className="flex items-center gap-2">
          <Trophy size={17} className="text-[#ff9b7a]" />
          <span className="font-bold text-[#ff9b7a] text-sm tracking-wide">HackASU</span>
        </Link>
        <button onClick={() => setIsOpen(true)} className="p-2 text-white/60 hover:text-white transition-colors">
          <Menu size={20} />
        </button>
      </div>

      {/* Sidebar - desktop fixed, mobile overlay */}
      <aside
        className={`fixed inset-y-0 left-0 w-60 border-r border-white/10 flex flex-col bg-[#161616] z-50 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:h-screen`}
      >
        {/* Brand */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <Link href="/hackathon2.0" className="flex items-center gap-2.5">
            <Trophy size={19} className="text-[#ff9b7a]" />
            <span className="font-bold text-[#ff9b7a] text-sm tracking-wide">HackASU</span>
          </Link>
          <button onClick={close} className="lg:hidden p-1 text-white/40 hover:text-white transition-colors">
            <X size={17} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">

          {/* Participant */}
          {!isAdmin && !isJudge && (
            <>
              <SectionLabel>Participant</SectionLabel>
              <NavItem href="/hackathon2.0/checkin" icon={MapPin} label="Check In"    onClick={close} />
              <NavItem href="/hackathon2.0/team"    icon={Users}  label="Team"        onClick={close} />
              <NavItem href="/hackathon2.0/submit"  icon={Send}   label="Submissions" onClick={close} />
              <NavItem href="/hackathon2.0/tracks"  icon={Zap}    label="Tracks"      onClick={close} />
            </>
          )}

          {/* Admin / Organizer */}
          {isAdmin && (
            <>
              <SectionLabel>Admin</SectionLabel>
              <NavItem href="/hackathon2.0/admin"              icon={BarChart3} label="Overview"     onClick={close} />
              <NavItem href="/hackathon2.0/admin/scanner"      icon={QrCode}    label="QR Scanner"   onClick={close} />
              <NavItem href="/hackathon2.0/admin/applicants"   icon={UserCheck} label="Participants" onClick={close} />
              <NavItem href="/hackathon2.0/admin/import"       icon={Upload}    label="Import"        onClick={close} />
              <NavItem href="/hackathon2.0/admin/teams"        icon={Users}     label="Teams"        onClick={close} />
              <NavItem href="/hackathon2.0/admin/submissions"  icon={Send}      label="Submissions"  onClick={close} />
              <NavItem href="/hackathon2.0/admin/judging"      icon={Star}      label="Judging"      onClick={close} />
              <NavItem href="/hackathon2.0/admin/content"      icon={Settings}  label="Content"      onClick={close} />
            </>
          )}

          {/* Judge */}
          {isJudge && (
            <>
              <SectionLabel>Judge</SectionLabel>
              <NavItem href="/hackathon2.0/admin/judging"      icon={Star} label="Score Projects"    onClick={close} />
              <NavItem href="/hackathon2.0/admin/submissions"  icon={Send} label="All Submissions"   onClick={close} />
            </>
          )}
        </nav>

        {/* User footer */}
        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#ff9b7a]/20 flex items-center justify-center shrink-0">
              <span className="text-[#ff9b7a] text-xs font-semibold">{user.name.charAt(0).toUpperCase()}</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-white/80 truncate">{user.name}</p>
              <p className="text-[10px] text-white/40 truncate">{user.email}</p>
            </div>
            {(isAdmin || isJudge) && (
              <span className="ml-auto shrink-0 text-[9px] bg-[#ff9b7a]/20 text-[#ff9b7a] px-1.5 py-0.5 rounded font-medium">
                {user.role}
              </span>
            )}
          </div>
          <SignOutButton />
        </div>
      </aside>

      {/* Mobile backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={close} />
      )}
    </>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] uppercase tracking-widest text-white/25 px-2 pb-1.5 pt-3 first:pt-1">
      {children}
    </p>
  );
}

function NavItem({
  href,
  icon: Icon,
  label,
  onClick,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/50 hover:text-white/90 hover:bg-white/5 transition-colors group"
    >
      <Icon size={15} className="shrink-0 group-hover:text-[#ff9b7a] transition-colors" />
      {label}
    </Link>
  );
}
