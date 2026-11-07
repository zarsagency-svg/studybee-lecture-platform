import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Search,
  ArrowLeft,
  ChevronRight,
  Users,
  Play,
  CalendarDays,
  Check,
  Plus,
  UserRound,
  FileText,
  Menu,
  BookOpen,
} from "lucide-react";
import { cn } from "./utils/cn";
import { LOGO_DATA_URL, SB_API_BASE, SB_PLAYER_HTML } from "./playerAssets";
import { FALLBACK_TEACHERS, FALLBACK_COURSES, FALLBACK_LECTURES } from "./fallbackData";

const GOALS: Record<string, [string, string]> = {
  KSCGY: ["UPSC Civil Services (IAS)", "🏛️"],
  TMUVD: ["JEE Main & Advanced", "⚗️"],
  YOTUH: ["NEET UG", "🧬"],
  VLEMN: ["SSC Exams", "📋"],
  MAFGF: ["GRE", "🌍"],
  XNDUS: ["CAT", "📊"],
  TEWDQ: ["NTA UGC NET", "🎓"],
  RTPSX: ["Bank Exams", "🏦"],
  BBKWG: ["CA (Chartered Accountancy)", "💼"],
  MRZFY: ["Law Entrance Exams", "⚖️"],
  DZVHL: ["IELTS", "🗣️"],
  GWDPV: ["MP PSC", "🗺️"],
  GNFFE: ["Maharashtra PSC", "🗺️"],
  FHWHO: ["Punjab PSC", "🗺️"],
  QJEJG: ["Railway Exams", "🚂"],
  SCANJ: ["Rajasthan PSC", "🗺️"],
  XCTVJ: ["UP PSC / UPSSSC", "🗺️"],
  EWFJR: ["English Language", "🔤"],
  NJHPJ: ["Campus Placements", "💻"],
  SUVLV: ["Class 9", "📚"],
  GSZGO: ["Class 10", "📚"],
  GWDPZ: ["Class 11", "📚"],
  DOZGI: ["Personal Development", "🌟"],
  ZISFF: ["Tamil Nadu PSC", "🗺️"],
  TUNWK: ["CDS / AFCAT / CAPF", "🪖"],
  LGQVU: ["GMAT", "📈"],
  PESHE: ["GATE", "⚙️"],
  LVECA: ["Karnataka PSC", "🗺️"],
  QKHZF: ["AP PSC / Telangana PSC", "🗺️"],
  NVLIA: ["GATE - CSIT, DSAI", "⚙️"],
  ZIUBD: ["Kerala PSC", "🗺️"],
  RJVOD: ["Gujarat PSC", "🗺️"],
  UQCMN: ["West Bengal PSC", "🗺️"],
  JJTHM: ["DSSSB", "🏙️"],
  BIZXQ: ["CSIR UGC NET", "🔬"],
  QOIVT: ["BPSC", "🗺️"],
  GMXMZ: ["TET", "👩‍🏫"],
  IFKUZ: ["UPTET", "👩‍🏫"],
  PLWCX: ["Class 12 Board", "📚"],
  XTKHH: ["OPSC", "🗺️"],
  ZKXEQ: ["Haryana PSC", "🗺️"],
  EGKYI: ["Jammu & Kashmir PSC", "🗺️"],
  SIFWL: ["IIT JAM", "🔭"],
  SDDOC: ["NEET PG", "🩺"],
  WXKBF: ["MP TET", "👩‍🏫"],
  AELON: ["Jharkhand PSC", "🗺️"],
  DOKOV: ["Programming", "💻"],
  MCRYW: ["Company Secretary", "📑"],
  SWBEI: ["Rajasthan TET", "👩‍🏫"],
  WJWZU: ["Haryana TET", "👩‍🏫"],
  DANNJ: ["NDA / Airforce X-Y / Navy", "✈️"],
  JXGKD: ["HPPSC", "🗺️"],
  QFJOA: ["Engineering Services Exam", "🔧"],
  TPSBK: ["Foundation NTSE", "🏆"],
};

const TELEGRAM_URL = "https://t.me/+oML37V1bL-40ZDNl";

interface ExtraTeacher {
  name: string;
  username: string;
  image: string;
  goal: string;
  subject: string;
  followers: number;
}

const EXTRA_TEACHERS: ExtraTeacher[] = [
  {
    name: "Amit Gupta",
    username: "mitgupt-1395",
    image:
      "https://static.uacdn.net/educator_new/processed_image/47C4FF69-81B0-472D-9DF2-48C2A7DF46CF_.png?q=75&auto=format,compress&w=128",
    goal: "TMUVD",
    subject: "Physics · JEE",
    followers: 26000,
  },
  {
    name: "Sandal Agarwal",
    username: "unacademy-user-artz952gl36v",
    image:
      "https://static.uacdn.net/educator_new/processed_image/F47ED962-917B-4791-9AAB-8E28B1C7DC99_.png?q=75&auto=format,compress&w=128",
    goal: "TMUVD",
    subject: "Mathematics · JEE",
    followers: 5200,
  },
];

export interface TeacherItem {
  first_name?: string;
  last_name?: string;
  username: string;
  avatar_v2?: string;
  avatar_v1?: string;
  avatar?: string;
  intro_photo?: string;
  topics_display?: string;
  followers_count?: number;
  bio?: string;
  credentials?: Record<string, Array<{ title: string }>>;
  _isExtra?: boolean;
}

export interface CourseItem {
  uid: string;
  name: string;
  thumbnail?: string;
  thumbnailV1?: string;
  thumbnail_v1?: string;
  itemCount?: number;
  item_count?: number;
  languageDisplay?: string;
  language_display?: string;
}

export interface LectureItem {
  title: string;
  author: string;
  date: string;
  video: string;
  pdf: string;
}

export interface SavedCourse {
  uid: string;
  name: string;
  thumb: string;
}

function resolveApiUrl(path: string): string {
  if (!SB_API_BASE) return path;
  const u = new URL(path, "https://sb.invalid");
  const m = u.pathname.match(/^\/api\/unc\/(\w+)$/);
  if (!m) return path;
  const params = new URLSearchParams(u.search);
  params.set("action", m[1]);
  return `${SB_API_BASE}/?${params.toString()}`;
}

function getTeacherName(t?: TeacherItem | null): string {
  if (!t) return "";
  return `${t.first_name ?? ""} ${t.last_name ?? ""}`.trim();
}

function getTeacherAvatar(t?: TeacherItem | null): string {
  if (!t) return "";
  return t.avatar_v2 || t.avatar_v1 || t.avatar || t.intro_photo || "";
}

function getCourseThumb(c?: CourseItem | null): string {
  if (!c) return "";
  return c.thumbnail || c.thumbnailV1 || c.thumbnail_v1 || "";
}

function formatLectureDate(iso?: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return new Date(d.getTime() + 19800000).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function getFallbackAvatar(name?: string, size = 128): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name || "SB"
  )}&background=1c1c22&color=f6b73c&size=${size}&font-size=0.4&bold=true`;
}

const PLAYER_BASE_URL = "/player.html";

function buildPlayerSrcDoc(playerUrl: string): string {
  if (!SB_PLAYER_HTML) return "";
  let stream = "";
  try {
    stream = new URL(playerUrl, "https://sb.invalid").searchParams.get("url") ?? "";
  } catch {
    stream = "";
  }
  const inject = `<script>window.__SB_STREAM__=${JSON.stringify(stream)};</script>`;
  return SB_PLAYER_HTML.replace("<head>", `<head>${inject}`);
}

function resolveLectureVideoUrl(rawUrl: string): string {
  try {
    let url = rawUrl;
    if (url.startsWith(PLAYER_BASE_URL)) return url;
    if (url.includes("player.html") && url.includes("url=")) {
      const extracted = new URL(url, "https://player.invalid").searchParams.get("url");
      if (extracted) url = extracted;
    }
    let streamUrl = "";
    if (url.includes("uid=")) {
      const uid = url.split("uid=")[1].split("&")[0];
      streamUrl = `https://uamedia.uacdn.net/lesson-raw/${uid}/output.webm`;
    } else if (/^https?:\/\/\S+\.webm([?#].*)?$/.test(url)) {
      streamUrl = url;
    } else {
      return "";
    }
    return `${PLAYER_BASE_URL}?url=${encodeURIComponent(streamUrl)}`;
  } catch {
    return "";
  }
}

function BeeLogo({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <span
      className={cn("relative inline-flex shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <img
        src={LOGO_DATA_URL}
        alt="MINDSPARK logo"
        width={size}
        height={size}
        className="relative h-full w-full rounded-[28%] object-cover ring-1 ring-white/15"
        draggable={false}
      />
    </span>
  );
}

function BrandLockup({
  size = 36,
  titleClass,
  subtitle,
  centered = false,
}: {
  size?: number;
  titleClass?: string;
  subtitle?: string;
  centered?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-3", centered && "flex-col text-center")}>
      <BeeLogo size={size} />
      <div className={cn("flex flex-col", centered && "items-center")}>
        <span
          className={cn(
            "font-logo uppercase leading-none tracking-[0.02em] text-foreground",
            titleClass
          )}
        >
          Mind<span className="text-honey">Spark</span>
        </span>
        {subtitle && (
          <span className="mt-1 text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}

function HomeSvgIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden={true}
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function CoursesSvgIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden={true}
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function DrawerNavItem({
  icon,
  label,
  badge,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  badge?: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`focus-honey group flex items-center gap-3.5 rounded-2xl px-4 py-3.5 text-[0.95rem] font-semibold transition-all duration-200 ${
        active
          ? "border border-honey/30 bg-honey-soft text-honey"
          : "border border-transparent text-foreground/75 hover:bg-secondary hover:text-foreground"
      }`}
    >
      <span className={active ? "text-honey" : "text-muted-foreground group-hover:text-honey"}>
        {icon}
      </span>
      {label}
      {typeof badge === "number" && (
        <span
          className={`ml-auto grid h-6 min-w-6 place-items-center rounded-full px-2 font-mono text-[0.7rem] font-bold ${
            active ? "bg-honey text-black" : "bg-secondary text-foreground/80"
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

function SideDrawer({
  open,
  onClose,
  onHome,
  onMyCourses,
  saved,
  activeView,
  telegramUrl,
}: {
  open: boolean;
  onClose: () => void;
  onHome: () => void;
  onMyCourses: () => void;
  saved: SavedCourse[];
  activeView: "home" | "mycourses" | "other";
  telegramUrl: string;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="scrim"
            className="fixed inset-0 z-[200] bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            onClick={onClose}
            aria-hidden={true}
          />
          <motion.aside
            key="panel"
            role="dialog"
            aria-label="Navigation menu"
            className="glass-strong fixed inset-y-0 left-0 z-[300] flex w-[300px] max-w-[85vw] flex-col overflow-hidden rounded-r-3xl"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
          >
            <div aria-hidden={true} className="h-[3px] w-full shrink-0 bg-honey" />
            <div className="flex items-start justify-between px-6 pb-5 pt-6">
              <div className="flex items-center gap-3.5">
                <img
                  src={LOGO_DATA_URL}
                  alt="MINDSPARK"
                  className="h-12 w-12 rounded-[28%] object-cover ring-1 ring-white/15"
                />
                <div className="flex flex-col">
                  <h2 className="font-logo text-[1rem] uppercase leading-none tracking-[0.02em]">
                    Study{"\u00A0"}
                    Mind<span className="text-honey">Spark</span>
                  </h2>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close menu"
                className="focus-honey grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-honey mx-4 mb-2 flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 text-sm font-bold text-foreground transition hover:border-honey/40 hover:bg-honey-soft"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-honey" aria-hidden={true}>
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.26 13.523l-2.956-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.884.036z" />
              </svg>
              Join the Hive on Telegram
            </a>
            <div className="mx-6 h-px bg-border" />
            <nav className="flex flex-col gap-1 p-4" aria-label="Primary">
              <DrawerNavItem
                icon={<HomeSvgIcon />}
                label="Home"
                active={activeView === "home"}
                onClick={onHome}
              />
              <DrawerNavItem
                icon={<CoursesSvgIcon />}
                label="My Courses"
                badge={saved.length}
                active={activeView === "mycourses"}
                onClick={onMyCourses}
              />
            </nav>
            <div className="mt-auto px-6 pb-6 pt-2 text-[0.68rem] text-muted-foreground/70">
              <div className="mb-3 h-px bg-border" />
              <p className="font-mono tracking-wide">© {new Date().getFullYear()} MINDSPARK</p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function VideoModal({
  url,
  title,
  onClose,
}: {
  url: string | null;
  title: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!url) return;
    const onMessage = (e: MessageEvent) => {
      if (e.data?.type === "sb-esc") onClose();
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [url, onClose]);

  useEffect(() => {
    document.body.style.overflow = url ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [url]);

  return (
    <AnimatePresence>
      {url && (
        <motion.div
          className="fixed inset-0 z-[1000] flex flex-col bg-[#050507]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          role="dialog"
          aria-label={title || "Video player"}
        >
          <div className="glass-strong flex shrink-0 items-center justify-between gap-4 rounded-none border-x-0 border-t-0 px-4 py-3 sm:px-6">
            <div className="min-w-0 flex-1">
              <p className="mb-0.5 font-mono text-[0.6rem] uppercase tracking-[0.25em] text-honey">
                Now Playing
              </p>
              <p className="truncate font-mono text-sm text-foreground/90">{title}</p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close video"
              className="focus-honey grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/15 bg-white/10 text-foreground transition hover:border-destructive/50 hover:bg-destructive/25 hover:text-red-300"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
          <div className="relative flex-1 bg-black">
            <iframe
              srcDoc={buildPlayerSrcDoc(url)}
              title={title || "Lecture video"}
              allowFullScreen={true}
              allow="autoplay; fullscreen"
              className="absolute inset-0 h-full w-full border-0 bg-black"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SearchBar({
  value,
  onChange,
  placeholder,
  label,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  label: string;
}) {
  return (
    <div className="group relative">
      <span className="pointer-events-none absolute left-4.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-honey">
        <Search className="h-[18px] w-[18px]" />
      </span>
      <input
        type="text"
        value={value}
        aria-label={label}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="glass focus-honey h-[56px] w-full rounded-2xl pl-12 pr-12 text-[1.02rem] font-semibold text-foreground placeholder:font-normal placeholder:text-foreground/30"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="focus-honey absolute right-4 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

function SectionHeading({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "mb-5 flex items-center gap-3.5 font-mono text-[0.72rem] font-bold uppercase tracking-[0.3em] text-muted-foreground",
        className
      )}
    >
      <span aria-hidden={true} className="h-1.5 w-1.5 rounded-full bg-honey" />
      {children}
      <span
        aria-hidden={true}
        className="h-px flex-1 bg-gradient-to-r from-white/15 to-transparent"
      />
    </p>
  );
}

function BackButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="glass focus-honey mb-6 flex w-fit items-center gap-2.5 rounded-full px-5 py-2.5 text-sm font-bold text-foreground/85 transition hover:border-honey/40 hover:text-honey"
    >
      <ArrowLeft className="h-4 w-4" />
      {children}
    </button>
  );
}

function Breadcrumb({
  items,
}: {
  items: Array<{ label: string; onClick?: () => void }>;
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="glass mb-6 flex w-fit max-w-full flex-wrap items-center gap-1.5 rounded-full px-4 py-2 text-[0.74rem] font-semibold"
    >
      {items.map((item, idx) => (
        <span key={idx} className="flex min-w-0 items-center gap-1.5">
          {idx > 0 && (
            <ChevronRight aria-hidden={true} className="h-3 w-3 shrink-0 text-white/25" />
          )}
          {item.onClick ? (
            <button
              onClick={item.onClick}
              className="focus-honey max-w-[180px] truncate rounded text-honey/90 transition hover:text-honey hover:underline"
            >
              {item.label}
            </button>
          ) : (
            <span className="max-w-[220px] truncate text-foreground/60">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

function Spinner() {
  return <div className="spin-honey" role="status" aria-label="Loading" />;
}

function EmptyState({
  emoji,
  title,
  sub,
  children,
}: {
  emoji: string;
  title: string;
  sub?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="glass rise-in mx-auto max-w-md rounded-3xl px-8 py-14 text-center">
      <div className="mb-4 text-5xl" aria-hidden={true}>
        {emoji}
      </div>
      <p className="font-display text-lg font-semibold text-foreground/90">{title}</p>
      {sub && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{sub}</p>}
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}

function LoadMoreButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-10 text-center">
      <button
        onClick={onClick}
        className="glass focus-honey rounded-full px-10 py-3.5 text-[0.95rem] font-bold tracking-wide text-foreground/90 transition hover:border-honey/45 hover:text-honey"
      >
        {children}
      </button>
    </div>
  );
}

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

const cardItemVariant = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.32, 0.72, 0, 1] as const },
  },
};

function CardGrid({
  children,
  cols,
}: {
  children: React.ReactNode;
  cols: "goals" | "teachers" | "courses";
}) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className={cn(
        "grid gap-4",
        cols === "goals" && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        cols === "teachers" && "grid-cols-1 lg:grid-cols-2",
        cols === "courses" && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      )}
    >
      {children}
    </motion.div>
  );
}

function HomeView({
  search,
  setSearch,
  onSelectGoal,
}: {
  search: string;
  setSearch: (v: string) => void;
  onSelectGoal: (uid: string, name: string) => void;
}) {
  const filteredGoals = useMemo(() => {
    const q = search.toLowerCase().trim();
    return Object.entries(GOALS).filter(([, [name]]) => name.toLowerCase().includes(q));
  }, [search]);

  return (
    <div>
      <section className="rise-in relative mb-9 flex flex-col items-center pt-8 pb-10 text-center sm:pt-12">
        <div className="float-y mb-6">
          <BeeLogo size={92} />
        </div>
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Ignite your <span className="text-honey">mind</span>.
        </h1>
        <p className="mt-3.5 max-w-[540px] text-[0.98rem] leading-relaxed text-muted-foreground">
          Pick a goal, follow top educators and stream every lecture — all in one simple,
          clutter-free place.
        </p>
      </section>
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search goals… JEE, NEET, UPSC, SSC…"
        label="Search goals"
      />
      <div className="mt-9">
        <SectionHeading>Select your goal</SectionHeading>
        {filteredGoals.length === 0 ? (
          <EmptyState emoji="🐝" title="No goals found" sub="Try a different keyword." />
        ) : (
          <CardGrid cols="goals">
            {filteredGoals.map(([uid, [name, emoji]]) => (
              <motion.button
                key={uid}
                variants={cardItemVariant}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectGoal(uid, name)}
                className="glass-card focus-honey flex min-h-[84px] items-center gap-4 rounded-3xl px-5 py-4 text-left"
              >
                <span
                  aria-hidden={true}
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-border bg-muted text-2xl"
                >
                  {emoji}
                </span>
                <span className="text-[0.97rem] font-bold leading-snug">{name}</span>
              </motion.button>
            ))}
          </CardGrid>
        )}
      </div>
    </div>
  );
}

function EducatorsView({
  goalName,
  search,
  setSearch,
  teachers,
  loading,
  error,
  onBack,
  onSelect,
  onLoadMore,
  canLoadMore,
}: {
  goalName: string;
  search: string;
  setSearch: (v: string) => void;
  teachers: TeacherItem[];
  loading: boolean;
  error: string | null;
  onBack: () => void;
  onSelect: (t: TeacherItem) => void;
  onLoadMore: () => void;
  canLoadMore: boolean;
}) {
  const q = search.toLowerCase().trim();
  const filtered = q
    ? teachers.filter((t) =>
        `${getTeacherName(t)} ${t.username} ${t.topics_display ?? ""}`
          .toLowerCase()
          .includes(q)
      )
    : teachers;

  return (
    <div>
      <BackButton onClick={onBack}>Back to Goals</BackButton>
      <Breadcrumb items={[{ label: "Goals", onClick: onBack }, { label: goalName }]} />
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search educators by name or subject…"
        label="Search educators"
      />
      <div className="mt-8">
        <SectionHeading>Choose an educator</SectionHeading>
        {loading && teachers.length === 0 ? (
          <Spinner />
        ) : error && teachers.length === 0 ? (
          <EmptyState emoji="⚠️" title="Couldn't load educators" sub={error}>
            <LoadMoreButton onClick={onLoadMore}>Retry</LoadMoreButton>
          </EmptyState>
        ) : filtered.length === 0 ? (
          <EmptyState emoji="🔍" title="No educators found" sub="Try a different search." />
        ) : (
          <CardGrid cols="teachers">
            {filtered.map((t) => {
              const displayName = getTeacherName(t) || t.username;
              const avatar = getTeacherAvatar(t);
              const followers = Number(t.followers_count ?? 0).toLocaleString("en-IN");
              return (
                <motion.button
                  key={`${t.username}-${t._isExtra ? "x" : "a"}`}
                  variants={cardItemVariant}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelect(t)}
                  className="glass-card focus-honey group flex items-center gap-5 rounded-3xl p-5 text-left"
                >
                  <span className="relative shrink-0">
                    <img
                      src={avatar || getFallbackAvatar(displayName, 128)}
                      alt={displayName}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = getFallbackAvatar(displayName);
                      }}
                      className="h-[72px] w-[72px] rounded-full border-[3px] border-border object-cover transition duration-300 group-hover:border-honey/60"
                    />
                    <span
                      aria-hidden={true}
                      className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-white/20"
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-display text-[1.08rem] font-bold">
                      {displayName}
                    </span>
                    <span className="mt-1 block clamp-2 text-[0.8rem] leading-snug text-foreground/55">
                      {t.topics_display || "Educator"}
                    </span>
                    <span className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-honey-soft px-2.5 py-1 font-mono text-[0.7rem] font-bold text-honey">
                      <Users aria-hidden={true} className="h-3 w-3" /> {followers} followers
                    </span>
                  </span>
                </motion.button>
              );
            })}
          </CardGrid>
        )}
        {canLoadMore && !loading && (
          <LoadMoreButton onClick={onLoadMore}>Load More Educators</LoadMoreButton>
        )}
      </div>
    </div>
  );
}

function EducatorProfileView({
  teacher,
  goalName,
  tab,
  onTab,
  courses,
  loading,
  error,
  onBack,
  onSelectCourse,
  onLoadMore,
  canLoadMore,
  savedUids,
  onToggleSave,
}: {
  teacher: TeacherItem;
  goalName: string;
  tab: "popular" | "latest";
  onTab: (tab: "popular" | "latest") => void;
  courses: CourseItem[];
  loading: boolean;
  error: string | null;
  onBack: () => void;
  onSelectCourse: (c: CourseItem) => void;
  onLoadMore: () => void;
  canLoadMore: boolean;
  savedUids: Set<string>;
  onToggleSave: (c: CourseItem) => void;
}) {
  const displayName = getTeacherName(teacher) || teacher.username;
  const avatar = getTeacherAvatar(teacher);
  const bio =
    (teacher.bio ||
      (teacher.credentials?.["4"] ?? []).map((item) => item.title).join(" · ")) ??
    "";

  return (
    <div>
      <BackButton onClick={onBack}>Back to Educators</BackButton>
      <Breadcrumb
        items={[
          {
            label: "Goals",
            onClick: () => window.dispatchEvent(new CustomEvent("sb:home")),
          },
          {
            label: goalName,
            onClick: () => window.dispatchEvent(new CustomEvent("sb:teachers")),
          },
          { label: displayName },
        ]}
      />
      <section className="rise-in mb-9 flex flex-col items-center pb-10 text-center">
        <div className="mb-6 rounded-full bg-honey p-[3px]">
          <img
            src={avatar || getFallbackAvatar(displayName, 256)}
            alt={displayName}
            onError={(e) => {
              e.currentTarget.src = getFallbackAvatar(displayName, 256);
            }}
            className="h-[128px] w-[128px] rounded-full border-4 border-background object-cover"
          />
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          {displayName}
        </h1>
        {bio && (
          <p className="clamp-3 mt-3.5 max-w-[620px] text-[0.92rem] leading-relaxed text-muted-foreground">
            {bio.slice(0, 280)}
            {bio.length > 280 ? "…" : ""}
          </p>
        )}
      </section>
      <div
        role="tablist"
        aria-label="Course order"
        className="glass mb-8 flex gap-1.5 rounded-2xl p-1.5"
      >
        {(
          [
            {
              id: "popular",
              label: "Popular",
              icon: <Play aria-hidden={true} className="h-3.5 w-3.5" />,
            },
            {
              id: "latest",
              label: "Latest",
              icon: <CalendarDays aria-hidden={true} className="h-3.5 w-3.5" />,
            },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => onTab(item.id)}
            className={cn(
              "focus-honey flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-[0.9rem] font-bold tracking-wide transition-all duration-200",
              tab === item.id
                ? "bg-honey-soft text-honey"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {item.icon}
            {item.label.toUpperCase()}
          </button>
        ))}
      </div>
      {loading && courses.length === 0 ? (
        <Spinner />
      ) : error && courses.length === 0 ? (
        <EmptyState emoji="⚠️" title="Couldn't load courses" sub={error}>
          <LoadMoreButton onClick={onLoadMore}>Retry</LoadMoreButton>
        </EmptyState>
      ) : courses.length === 0 ? (
        <EmptyState
          emoji="📫"
          title="No courses found"
          sub="This educator hasn't published courses here yet."
        />
      ) : (
        <CardGrid cols="courses">
          {courses.map((course) => {
            const thumb = getCourseThumb(course);
            const isSaved = savedUids.has(course.uid);
            const lessons = course.itemCount ?? course.item_count ?? 0;
            const lang = course.languageDisplay ?? course.language_display ?? "";
            return (
              <motion.article
                key={course.uid}
                variants={cardItemVariant}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectCourse(course)}
                className="glass-card group cursor-pointer overflow-hidden rounded-3xl"
              >
                <div className="img-shimmer relative aspect-video w-full overflow-hidden">
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={course.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                      onError={(e) => {
                        e.currentTarget.style.opacity = "0";
                      }}
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center bg-muted text-3xl">
                      🐝
                    </div>
                  )}
                  <div
                    aria-hidden={true}
                    className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSave(course);
                    }}
                    aria-label={isSaved ? "Remove from My Courses" : "Add to My Courses"}
                    className={cn(
                      "focus-honey absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[0.72rem] font-bold transition-all duration-200 active:scale-95",
                      isSaved
                        ? "border-emerald-300/40 bg-emerald-500 text-white"
                        : "border-white/25 bg-[#141419] text-white hover:border-honey/60 hover:bg-honey hover:text-black"
                    )}
                  >
                    {isSaved ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Plus className="h-3.5 w-3.5" />
                    )}
                    {isSaved ? "Added" : "My Course"}
                  </button>
                </div>
                <div className="p-4.5">
                  <h3 className="clamp-2 text-[0.94rem] font-semibold leading-snug">
                    {course.name}
                  </h3>
                  <p className="mt-2 font-mono text-[0.7rem] font-semibold text-muted-foreground">
                    {lessons} lessons{lang ? ` · ${lang}` : ""}
                  </p>
                </div>
              </motion.article>
            );
          })}
        </CardGrid>
      )}
      {canLoadMore && !loading && (
        <LoadMoreButton onClick={onLoadMore}>Load More Courses</LoadMoreButton>
      )}
    </div>
  );
}

function LecturesView({
  courseName,
  lectures,
  loading,
  error,
  onBack,
  onWatch,
}: {
  courseName: string;
  lectures: LectureItem[];
  loading: boolean;
  error: string | null;
  onBack: () => void;
  onWatch: (videoUrl: string, title: string) => void;
}) {
  return (
    <div>
      <BackButton onClick={onBack}>Back to Course</BackButton>
      <Breadcrumb items={[{ label: courseName }]} />
      {loading ? (
        <Spinner />
      ) : error ? (
        <EmptyState emoji="⚠️" title="Couldn't load lectures" sub={error} />
      ) : lectures.length === 0 ? (
        <EmptyState
          emoji="📫"
          title="No lectures found"
          sub="This course has no published lectures yet."
        />
      ) : (
        <div className="flex flex-col gap-3.5">
          {lectures.map((lec, idx) => (
            <motion.article
              key={`${idx}-${lec.title}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: Math.min(idx * 0.04, 0.4),
                ease: [0.32, 0.72, 0, 1],
              }}
              className="glass-card group relative overflow-hidden rounded-3xl p-5 pl-6 sm:p-6 sm:pl-7"
            >
              <span
                aria-hidden={true}
                className="absolute inset-y-4 left-0 w-[3px] rounded-full bg-honey opacity-70 transition group-hover:opacity-100"
              />
              <p className="mb-2 font-mono text-[0.66rem] font-bold uppercase tracking-[0.28em] text-honey">
                Lecture {String(idx + 1).padStart(2, "0")}
              </p>
              <h3 className="clamp-2 mb-3 text-[1.05rem] font-semibold leading-snug">
                {lec.title}
              </h3>
              <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 font-mono text-[0.72rem] font-semibold text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <UserRound aria-hidden={true} className="h-3.5 w-3.5" /> {lec.author}
                </span>
                {lec.date && (
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays aria-hidden={true} className="h-3.5 w-3.5" /> {lec.date}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                {lec.video && (
                  <button
                    onClick={() => onWatch(lec.video, lec.title)}
                    className="focus-honey inline-flex items-center gap-2 rounded-xl bg-honey px-5 py-2.5 text-[0.85rem] font-bold text-black transition hover:-translate-y-0.5 hover:opacity-90"
                  >
                    <Play aria-hidden={true} className="h-4 w-4 fill-current" /> Watch Online
                  </button>
                )}
                {lec.pdf && (
                  <a
                    href={lec.pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="focus-honey inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-[0.85rem] font-bold text-honey transition hover:-translate-y-0.5 hover:border-honey/45 hover:bg-honey-soft"
                  >
                    <FileText aria-hidden={true} className="h-4 w-4" /> Download PDF
                  </a>
                )}
                {!lec.video && !lec.pdf && (
                  <span className="text-[0.8rem] text-muted-foreground">
                    No media available
                  </span>
                )}
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </div>
  );
}

function MyCoursesView({
  saved,
  count,
  onBack,
  onOpen,
  onRemove,
}: {
  saved: SavedCourse[];
  count: number;
  onBack: () => void;
  onOpen: (c: SavedCourse) => void;
  onRemove: (uid: string) => void;
}) {
  return (
    <div>
      <BackButton onClick={onBack}>Back to Home</BackButton>
      <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
        <SectionHeading className="mb-0 flex-1">My saved courses</SectionHeading>
        <span className="glass rounded-full px-4 py-1.5 font-mono text-[0.72rem] font-bold text-honey">
          {count} course{count !== 1 ? "s" : ""}
        </span>
      </div>
      {saved.length === 0 ? (
        <EmptyState
          emoji="📫"
          title="No saved courses yet"
          sub={
            <>
              Browse goals → educator → tap{" "}
              <span className="font-bold text-honey">“+ My Course”</span> to build your
              collection.
            </>
          }
        />
      ) : (
        <CardGrid cols="courses">
          {saved.map((item) => (
            <motion.article
              key={item.uid}
              variants={cardItemVariant}
              whileTap={{ scale: 0.98 }}
              onClick={() => onOpen(item)}
              className="glass-card group cursor-pointer overflow-hidden rounded-3xl"
            >
              <div className="img-shimmer relative aspect-video w-full overflow-hidden">
                {item.thumb ? (
                  <img
                    src={item.thumb}
                    alt={item.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                    onError={(e) => {
                      e.currentTarget.style.opacity = "0";
                    }}
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center bg-white/[0.04] text-3xl">
                    🐝
                  </div>
                )}
                <div
                  aria-hidden={true}
                  className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(item.uid);
                  }}
                  aria-label={`Remove ${item.name}`}
                  className="focus-honey absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full border border-red-300/30 bg-[#141419] text-red-300 transition hover:border-destructive hover:bg-destructive hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-4.5">
                <h3 className="clamp-2 text-[0.92rem] font-semibold leading-snug">
                  {item.name}
                </h3>
              </div>
            </motion.article>
          ))}
        </CardGrid>
      )}
    </div>
  );
}

const STORAGE_KEY = "stubybee_mc";

export function App() {
  const [view, setView] = useState<"home" | "teachers" | "profile" | "lectures" | "mycourses">(
    "home"
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [goalSearch, setGoalSearch] = useState("");
  const [teacherSearch, setTeacherSearch] = useState("");
  const [goalUid, setGoalUid] = useState<string | null>(null);
  const [goalName, setGoalName] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherItem | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<{ uid: string; name: string } | null>(
    null
  );
  const [openedFromSaved, setOpenedFromSaved] = useState(false);

  const [apiTeachers, setApiTeachers] = useState<TeacherItem[]>([]);
  const [extraTeachers, setExtraTeachers] = useState<ExtraTeacher[]>([]);
  const [teachersTotal, setTeachersTotal] = useState(0);
  const [teachersLoading, setTeachersLoading] = useState(false);
  const [teachersError, setTeachersError] = useState<string | null>(null);
  const teachersOffsetRef = useRef(0);

  const [courseTab, setCourseTab] = useState<"popular" | "latest">("popular");
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [coursesTotal, setCoursesTotal] = useState(0);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [coursesError, setCoursesError] = useState<string | null>(null);
  const coursesOffsetRef = useRef(0);
  const activeTabRef = useRef<"popular" | "latest">("popular");

  const [lectures, setLectures] = useState<LectureItem[]>([]);
  const [lecturesLoading, setLecturesLoading] = useState(false);
  const [lecturesError, setLecturesError] = useState<string | null>(null);

  const [savedCourses, setSavedCourses] = useState<SavedCourse[]>([]);
  const [nowPlaying, setNowPlaying] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    try {
      setSavedCourses(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"));
    } catch {
      setSavedCourses([]);
    }
  }, []);

  const savedUids = useMemo(() => new Set(savedCourses.map((c) => c.uid)), [savedCourses]);

  const persistSaved = (next: SavedCourse[]) => {
    setSavedCourses(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore storage errors
    }
  };

  const toggleSaveCourse = (course: CourseItem) => {
    const thumb = getCourseThumb(course);
    if (savedUids.has(course.uid)) {
      persistSaved(savedCourses.filter((c) => c.uid !== course.uid));
    } else {
      persistSaved([{ uid: course.uid, name: course.name, thumb }, ...savedCourses]);
    }
  };

  const mergedTeachers = useCallback((): TeacherItem[] => {
    const extras: TeacherItem[] = extraTeachers
      .filter((t) => t.goal === goalUid)
      .map((t) => ({
        first_name: t.name.split(" ")[0] || t.name,
        last_name: t.name.split(" ").slice(1).join(" "),
        username: t.username,
        avatar_v2: t.image,
        avatar_v1: t.image,
        avatar: t.image,
        topics_display: t.subject,
        followers_count: t.followers,
        _isExtra: true,
      }));
    const seen = new Set(extras.map((t) => t.username.toLowerCase()));
    const rest = apiTeachers.filter((t) => !seen.has(t.username.toLowerCase()));
    return [...extras, ...rest];
  }, [extraTeachers, goalUid, apiTeachers]);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });

  const loadExtraTeachers = useCallback(async () => {
    setExtraTeachers(EXTRA_TEACHERS);
  }, []);

  const fetchTeachers = useCallback(async (reset: boolean, gUid: string) => {
    setTeachersLoading(true);
    setTeachersError(null);
    if (reset) {
      teachersOffsetRef.current = 0;
      setApiTeachers([]);
      setTeachersTotal(0);
    }
    try {
      const res = await fetch(
        resolveApiUrl(
          `/api/unc/teachers?goal_uid=${encodeURIComponent(gUid)}&offset=${teachersOffsetRef.current}`
        )
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const results: TeacherItem[] = data.results ?? [];
      setApiTeachers((prev) => (reset ? results : [...prev, ...results]));
      setTeachersTotal(data.count ?? 0);
      teachersOffsetRef.current += results.length;
    } catch (err) {
      const fallback = FALLBACK_TEACHERS[gUid] || FALLBACK_TEACHERS["TMUVD"];
      if (reset && fallback?.results) {
        const results: TeacherItem[] = fallback.results;
        setApiTeachers(results);
        setTeachersTotal(fallback.count ?? results.length);
        teachersOffsetRef.current = results.length;
      } else {
        setTeachersError(err instanceof Error ? err.message : "Something went wrong");
      }
    } finally {
      setTeachersLoading(false);
    }
  }, []);

  const fetchCourses = useCallback(
    async (reset: boolean, username: string, orderType: "popular" | "latest") => {
      setCoursesLoading(true);
      setCoursesError(null);
      const offset = reset ? 0 : coursesOffsetRef.current;
      if (reset) {
        setCourses([]);
        setCoursesTotal(0);
        coursesOffsetRef.current = 0;
      }
      try {
        const res = await fetch(
          resolveApiUrl(
            `/api/unc/courses?username=${encodeURIComponent(username)}&offset=${offset}&type=${orderType}`
          )
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const results: CourseItem[] = data.results ?? [];
        setCourses((prev) => (reset ? results : [...prev, ...results]));
        setCoursesTotal(data.count ?? 0);
        coursesOffsetRef.current = reset
          ? results.length
          : coursesOffsetRef.current + results.length;
      } catch (err) {
        const fallback = FALLBACK_COURSES[username] || FALLBACK_COURSES["mitgupt-1395"];
        if (reset && fallback?.results) {
          const results: CourseItem[] = fallback.results;
          setCourses(results);
          setCoursesTotal(fallback.count ?? results.length);
          coursesOffsetRef.current = results.length;
        } else {
          setCoursesError(err instanceof Error ? err.message : "Something went wrong");
        }
      } finally {
        setCoursesLoading(false);
      }
    },
    []
  );

  const mapRawLectures = (rawResults: any[], fallbackAuthor: string): LectureItem[] =>
    (rawResults ?? []).map((item: any) => {
      const val = item.value ?? {};
      const liveClass = val.live_class ?? {};
      const author =
        `${liveClass.author?.first_name ?? ""} ${liveClass.author?.last_name ?? ""}`.trim() ||
        fallbackAuthor ||
        "Unknown";
      let video = "";
      if (liveClass.video_url) {
        video = resolveLectureVideoUrl(liveClass.video_url);
      }
      return {
        title: (val.title ?? "Untitled").trim(),
        author,
        date: formatLectureDate(liveClass.started_at || liveClass.created_at),
        video,
        pdf: liveClass.slides_pdf?.with_annotation ?? "",
      };
    });

  const fetchLectures = useCallback(async (courseUid: string, fallbackAuthor: string) => {
    setLecturesLoading(true);
    setLecturesError(null);
    setLectures([]);
    try {
      const res = await fetch(
        resolveApiUrl(`/api/unc/lectures?uid=${encodeURIComponent(courseUid)}`)
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setLectures(mapRawLectures(data.results ?? [], fallbackAuthor));
    } catch (err) {
      const fallback = FALLBACK_LECTURES[courseUid] || FALLBACK_LECTURES["XSTHQYG4"];
      if (fallback?.results) {
        setLectures(mapRawLectures(fallback.results, fallbackAuthor));
      } else {
        setLecturesError(err instanceof Error ? err.message : "Something went wrong");
      }
    } finally {
      setLecturesLoading(false);
    }
  }, []);

  const handleSelectGoal = async (uid: string, name: string) => {
    setGoalUid(uid);
    setGoalName(name);
    setTeacherSearch("");
    setView("teachers");
    scrollTop();
    loadExtraTeachers();
    fetchTeachers(true, uid);
  };

  const handleSelectTeacher = (teacher: TeacherItem) => {
    setSelectedTeacher(teacher);
    setCourseTab("popular");
    activeTabRef.current = "popular";
    setView("profile");
    scrollTop();
    fetchCourses(true, teacher.username.toLowerCase(), "popular");
  };

  const handleSwitchCourseTab = (nextTab: "popular" | "latest") => {
    if (!selectedTeacher) return;
    setCourseTab(nextTab);
    activeTabRef.current = nextTab;
    fetchCourses(true, selectedTeacher.username.toLowerCase(), nextTab);
  };

  const handleSelectCourse = (course: CourseItem) => {
    setSelectedCourse({ uid: course.uid, name: course.name });
    setOpenedFromSaved(false);
    setView("lectures");
    scrollTop();
    fetchLectures(course.uid, selectedTeacher ? getTeacherName(selectedTeacher) : "");
  };

  const handleOpenSavedCourse = (course: SavedCourse) => {
    setSelectedCourse({ uid: course.uid, name: course.name });
    setOpenedFromSaved(true);
    setView("lectures");
    scrollTop();
    fetchLectures(course.uid, "");
  };

  const goHome = () => {
    setView("home");
    setGoalSearch("");
    scrollTop();
  };

  const goTeachers = () => {
    if (!goalUid) {
      setView("home");
      return;
    }
    setView("teachers");
    scrollTop();
  };

  useEffect(() => {
    const onHomeEvent = () => goHome();
    const onTeachersEvent = () => goTeachers();
    window.addEventListener("sb:home", onHomeEvent);
    window.addEventListener("sb:teachers", onTeachersEvent);
    return () => {
      window.removeEventListener("sb:home", onHomeEvent);
      window.removeEventListener("sb:teachers", onTeachersEvent);
    };
  }, [goalUid]);

  return (
    <div className="relative flex min-h-screen flex-col">
      <SideDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onHome={() => {
          goHome();
          setDrawerOpen(false);
        }}
        onMyCourses={() => {
          setView("mycourses");
          scrollTop();
          setDrawerOpen(false);
        }}
        saved={savedCourses}
        activeView={view === "home" ? "home" : view === "mycourses" ? "mycourses" : "other"}
        telegramUrl={TELEGRAM_URL}
      />

      <motion.header
        initial={{ y: -70, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.32, 0.72, 0, 1] }}
        className="glass-strong sticky top-0 z-[100] rounded-none border-x-0 border-t-0"
      >
        <div className="mx-auto flex h-[68px] w-full max-w-[1200px] items-center gap-4 px-4 sm:px-6">
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            className="focus-honey group grid h-11 w-11 shrink-0 place-items-center rounded-full border border-border bg-card transition hover:border-honey/40 hover:bg-honey-soft"
          >
            <Menu className="h-5 w-5 text-foreground/80 transition group-hover:text-honey" />
          </button>

          <button
            onClick={goHome}
            aria-label="MINDSPARK home"
            className="focus-honey flex min-w-0 items-center gap-3 rounded-2xl px-1 py-1 text-left"
          >
            <BrandLockup size={38} titleClass="text-[0.95rem] sm:text-[1.05rem]" />
          </button>

          <div className="ml-auto flex items-center gap-2.5">
            <a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-honey hidden h-10 items-center gap-2 rounded-full border border-border bg-card px-4 text-[0.8rem] font-bold text-foreground/80 transition hover:border-honey/40 hover:text-honey sm:inline-flex"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden={true}>
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.26 13.523l-2.956-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.884.036z" />
              </svg>
              Telegram
            </a>

            <button
              onClick={() => {
                setView("mycourses");
                scrollTop();
              }}
              aria-label="My saved courses"
              className={`focus-honey relative grid h-10 w-10 place-items-center rounded-full border transition ${
                view === "mycourses"
                  ? "border-honey/50 bg-honey-soft text-honey"
                  : "border-border bg-card text-foreground/80 hover:border-honey/40 hover:text-honey"
              }`}
            >
              <BookOpen className="h-[18px] w-[18px]" />
              {savedCourses.length > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-honey px-1 font-mono text-[0.62rem] font-bold text-black shadow-sm">
                  {savedCourses.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </motion.header>

      <main className="relative z-[1] mx-auto w-full max-w-[1200px] flex-1 px-4 pb-16 pt-8 sm:px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
          >
            {view === "home" && (
              <HomeView
                search={goalSearch}
                setSearch={setGoalSearch}
                onSelectGoal={handleSelectGoal}
              />
            )}

            {view === "teachers" && (
              <EducatorsView
                goalName={goalName}
                search={teacherSearch}
                setSearch={setTeacherSearch}
                teachers={mergedTeachers()}
                loading={teachersLoading}
                error={teachersError}
                onBack={goHome}
                onSelect={handleSelectTeacher}
                onLoadMore={() => goalUid && fetchTeachers(false, goalUid)}
                canLoadMore={!teachersLoading && teachersOffsetRef.current < teachersTotal}
              />
            )}

            {view === "profile" && selectedTeacher && (
              <EducatorProfileView
                teacher={selectedTeacher}
                goalName={goalName}
                tab={courseTab}
                onTab={handleSwitchCourseTab}
                courses={courses}
                loading={coursesLoading}
                error={coursesError}
                onBack={goTeachers}
                onSelectCourse={handleSelectCourse}
                onLoadMore={() =>
                  selectedTeacher &&
                  fetchCourses(
                    false,
                    selectedTeacher.username.toLowerCase(),
                    activeTabRef.current
                  )
                }
                canLoadMore={!coursesLoading && coursesOffsetRef.current < coursesTotal}
                savedUids={savedUids}
                onToggleSave={toggleSaveCourse}
              />
            )}

            {view === "lectures" && selectedCourse && (
              <LecturesView
                courseName={selectedCourse.name}
                lectures={lectures}
                loading={lecturesLoading}
                error={lecturesError}
                onBack={() => {
                  if (openedFromSaved) {
                    setView("mycourses");
                    scrollTop();
                  } else {
                    setView("profile");
                    scrollTop();
                  }
                }}
                onWatch={(url, title) => setNowPlaying({ url, title })}
              />
            )}

            {view === "mycourses" && (
              <MyCoursesView
                saved={savedCourses}
                count={savedCourses.length}
                onBack={goHome}
                onOpen={handleOpenSavedCourse}
                onRemove={(uid) => persistSaved(savedCourses.filter((c) => c.uid !== uid))}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="relative z-[1] mt-auto border-t border-border bg-card">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center justify-between gap-3 px-6 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center sm:flex-row sm:text-left">
          <div className="flex items-center gap-2.5">
            <img
              src={LOGO_DATA_URL}
              alt="MINDSPARK"
              className="h-7 w-7 rounded-[28%]"
            />
            <p className="font-logo text-[0.72rem] uppercase tracking-[0.08em]">
              Study{"\u00A0"}
              Mind<span className="text-honey">Spark</span>
            </p>
          </div>
          <p className="font-mono text-[0.68rem] text-muted-foreground/80">
            © {new Date().getFullYear()} MINDSPARK
          </p>
        </div>
      </footer>

      <VideoModal
        url={nowPlaying?.url ?? null}
        title={nowPlaying?.title ?? ""}
        onClose={() => setNowPlaying(null)}
      />
    </div>
  );
}
export default App;
