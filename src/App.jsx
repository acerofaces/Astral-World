import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Sparkles, User, Calendar, Clock, MapPin, Loader2, Orbit, BookOpen, RefreshCw, X, Eye, EyeOff, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ============================================================================
// 1. UTILITIES & STORAGE
// ============================================================================
export function cn(...inputs) { return twMerge(clsx(inputs)); }

export const getStorage = (key) => {
  try { const item = localStorage.getItem(key); return item ? JSON.parse(item) : null; }
  catch (error) { return null; }
};
export const setStorage = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (error) {}
};
export const removeStorage = (key) => localStorage.removeItem(key);

// ============================================================================
// 2. ASTROLOGY & NUMEROLOGY ENGINE
// ============================================================================
export const ZODIAC = [
  { name: "Aries", symbol: "♈", element: "Fire", modality: "Cardinal", ruler: "Mars", dates: "Mar 21 – Apr 19", traits: "Pioneer, courageous, driven, impulsive, leader.", keywords: "I am" },
  { name: "Taurus", symbol: "♉", element: "Earth", modality: "Fixed", ruler: "Venus", dates: "Apr 20 – May 20", traits: "Steady, sensual, patient, determined, grounded.", keywords: "I have" },
  { name: "Gemini", symbol: "♊", element: "Air", modality: "Mutable", ruler: "Mercury", dates: "May 21 – Jun 20", traits: "Curious, communicative, adaptable, witty, dual.", keywords: "I think" },
  { name: "Cancer", symbol: "♋", element: "Water", modality: "Cardinal", ruler: "Moon", dates: "Jun 21 – Jul 22", traits: "Nurturing, intuitive, protective, emotional, home-loving.", keywords: "I feel" },
  { name: "Leo", symbol: "♌", element: "Fire", modality: "Fixed", ruler: "Sun", dates: "Jul 23 – Aug 22", traits: "Radiant, generous, proud, creative, loyal.", keywords: "I will" },
  { name: "Virgo", symbol: "♍", element: "Earth", modality: "Mutable", ruler: "Mercury", dates: "Aug 23 – Sep 22", traits: "Analytical, precise, service-minded, discerning, humble.", keywords: "I analyze" },
  { name: "Libra", symbol: "♎", element: "Air", modality: "Cardinal", ruler: "Venus", dates: "Sep 23 – Oct 22", traits: "Harmonious, diplomatic, fair, relational, refined.", keywords: "I balance" },
  { name: "Scorpio", symbol: "♏", element: "Water", modality: "Fixed", ruler: "Pluto", dates: "Oct 23 – Nov 21", traits: "Intense, transformative, magnetic, deep, resolute.", keywords: "I desire" },
  { name: "Sagittarius", symbol: "♐", element: "Fire", modality: "Mutable", ruler: "Jupiter", dates: "Nov 22 – Dec 21", traits: "Adventurous, philosophical, free, optimistic, truthful.", keywords: "I seek" },
  { name: "Capricorn", symbol: "♑", element: "Earth", modality: "Cardinal", ruler: "Saturn", dates: "Dec 22 – Jan 19", traits: "Ambitious, disciplined, enduring, responsible, wise.", keywords: "I use" },
  { name: "Aquarius", symbol: "♒", element: "Air", modality: "Fixed", ruler: "Uranus", dates: "Jan 20 – Feb 18", traits: "Innovative, humanitarian, independent, visionary, eccentric.", keywords: "I know" },
  { name: "Pisces", symbol: "♓", element: "Water", modality: "Mutable", ruler: "Neptune", dates: "Feb 19 – Mar 20", traits: "Compassionate, dreamy, mystical, empathic, boundless.", keywords: "I believe" }
];

export function getSunSign(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dateCode = m * 100 + d;
  const cutoffs = [
    { code: 1222, sign: ZODIAC[9] }, { code: 1122, sign: ZODIAC[8] },
    { code: 1023, sign: ZODIAC[7] }, { code: 923, sign: ZODIAC[6] },
    { code: 823, sign: ZODIAC[5] },  { code: 723, sign: ZODIAC[4] },
    { code: 621, sign: ZODIAC[3] },  { code: 521, sign: ZODIAC[2] },
    { code: 420, sign: ZODIAC[1] },  { code: 321, sign: ZODIAC[0] },
    { code: 219, sign: ZODIAC[11] }, { code: 120, sign: ZODIAC[10] },
  ];
  for (const c of cutoffs) { if (dateCode >= c.code) return c.sign; }
  return ZODIAC[9];
}

export const PLANETS = {
  Sun: { symbol: "☉", color: "Gold", crystal: "Citrine", domain: "Identity, vitality, ego, life force." },
  Moon: { symbol: "☽", color: "Silver", crystal: "Moonstone", domain: "Emotions, instincts, memory, inner self." },
  Mars: { symbol: "♂", color: "Red", crystal: "Red Jasper", domain: "Drive, courage, action, desire, conflict." },
  Mercury: { symbol: "☿", color: "Yellow", crystal: "Aventurine", domain: "Mind, communication, logic, travel." },
  Jupiter: { symbol: "♃", color: "Royal Blue", crystal: "Amethyst", domain: "Expansion, wisdom, luck, faith, growth." },
  Venus: { symbol: "♀", color: "Rose Pink", crystal: "Rose Quartz", domain: "Love, beauty, values, attraction, art." },
  Saturn: { symbol: "♄", color: "Deep Indigo", crystal: "Garnet", domain: "Structure, discipline, karma, time, mastery." },
  Uranus: { symbol: "♅", color: "Electric Blue", crystal: "Labradorite", domain: "Change, rebellion, insight, awakening." },
  Neptune: { symbol: "♆", color: "Sea Green", crystal: "Aquamarine", domain: "Dreams, illusion, mysticism, compassion." },
  Pluto: { symbol: "♇", color: "Black", crystal: "Obsidian", domain: "Death, rebirth, power, transformation." }
};

const DAY_RULERS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
export const getDayRuler = (date = new Date()) => DAY_RULERS[date.getDay()];

const DAY_COLORS_MAP = {
  Sun: ["Gold", "Yellow", "Orange"], Moon: ["Silver", "White", "Pearl Grey"],
  Mars: ["Red", "Scarlet", "Crimson"], Mercury: ["Yellow", "Orange", "Grey"],
  Jupiter: ["Royal Blue", "Purple", "Indigo"], Venus: ["Green", "Rose Pink", "Emerald"],
  Saturn: ["Black", "Deep Indigo", "Dark Purple"]
};
const DAY_CRYSTALS_MAP = {
  Sun: ["Citrine", "Sunstone", "Tiger's Eye"], Moon: ["Moonstone", "Selenite", "Pearl"],
  Mars: ["Red Jasper", "Carnelian", "Bloodstone"], Mercury: ["Aventurine", "Agate", "Citrine"],
  Jupiter: ["Amethyst", "Lapis Lazuli", "Sapphire"], Venus: ["Rose Quartz", "Emerald", "Jade"],
  Saturn: ["Garnet", "Onyx", "Hematite"]
};

export const getDayColors = (date = new Date()) => DAY_COLORS_MAP[getDayRuler(date)];
export const getDayCrystals = (date = new Date()) => DAY_CRYSTALS_MAP[getDayRuler(date)];

const CHALDEAN = ["Saturn", "Jupiter", "Mars", "Sun", "Venus", "Mercury", "Moon"];
const fmtTime = (d) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

export function getLuckyTimes(date = new Date()) {
  const ruler = getDayRuler(date);
  const startIdx = CHALDEAN.indexOf(ruler);
  const midnight = new Date(date);
  midnight.setHours(0, 0, 0, 0);
  
  const windows = [];
  for (let h = 0; h < 24; h++) {
    const planet = CHALDEAN[(startIdx + h) % 7];
    if (planet === ruler) {
      const start = new Date(midnight.getTime() + (6 + h) * 60 * 60000);
      const end = new Date(start.getTime() + 60 * 60000);
      windows.push({ planet, start, end, startStr: fmtTime(start), endStr: fmtTime(end) });
    }
  }
  return windows;
}

export function getNextLuckyTime(date = new Date()) {
  const windows = getLuckyTimes(date);
  const now = date.getTime();
  let next = windows.find(w => w.end.getTime() > now);
  
  if (!next) {
    const tomorrow = new Date(date);
    tomorrow.setDate(tomorrow.getDate() + 1);
    next = getLuckyTimes(tomorrow)[0];
  }
  
  const diffMinutes = Math.max(0, Math.floor((next.start.getTime() - now) / 60000));
  const hrs = Math.floor(diffMinutes / 60);
  const mins = diffMinutes % 60;
  return { ...next, hrs, mins };
}

export function reduceNumber(n) {
  let val = Math.abs(Math.trunc(n));
  while (val > 9 && ![11, 22, 33].includes(val)) {
    val = String(val).split('').reduce((a, b) => a + parseInt(b), 0);
  }
  return val;
}
export function getLifePathNumber(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return reduceNumber(reduceNumber(m) + reduceNumber(d) + reduceNumber(y));
}
export function getPersonalDayNumber(birthDateStr, current = new Date()) {
  const [_, m, d] = birthDateStr.split('-').map(Number);
  const universalYear = reduceNumber(current.getFullYear());
  const personalYear = reduceNumber(reduceNumber(m) + reduceNumber(d) + universalYear);
  const personalMonth = reduceNumber(personalYear + (current.getMonth() + 1));
  return reduceNumber(personalMonth + current.getDate());
}

export const NUMEROLOGY_MEANINGS = {
  1: { title: "The Pioneer", meaning: "Initiation, independence, leadership. A day to start fresh, act boldly, and plant seeds of will." },
  2: { title: "The Diplomat", meaning: "Cooperation, sensitivity, partnership. A day for harmony, patience, and tending relationships." },
  3: { title: "The Creator", meaning: "Expression, joy, creativity. A day to speak, create, and share your light." },
  4: { title: "The Builder", meaning: "Structure, work, foundation. A day for discipline, order, and steady effort." },
  5: { title: "The Wanderer", meaning: "Change, freedom, sensation. A day of movement, adaptability, and embracing the unexpected." },
  6: { title: "The Nurturer", meaning: "Love, home, responsibility. A day for care, beauty, and service to others." },
  7: { title: "The Seeker", meaning: "Introspection, wisdom, spirit. A day for study, meditation, and inner truth." },
  8: { title: "The Sovereign", meaning: "Power, ambition, material mastery. A day for business, finances, and claiming authority." },
  9: { title: "The Sage", meaning: "Completion, release, compassion. A day to forgive, finish, and let go." },
  11: { title: "The Illuminator", meaning: "Inspiration, intuition, vision. A master day — trust insight and higher knowing." },
  22: { title: "The Master Builder", meaning: "Vision made manifest. A master day for large-scale creation and practical idealism." },
  33: { title: "The Master Teacher", meaning: "Compassionate service and healing. A master day of love in action." }
};
export const COLOR_MEANINGS = { Gold: "Vitality, wealth, divine light", Yellow: "Joy, intellect, confidence", Orange: "Creativity, enthusiasm", Silver: "Intuition, emotional flow", White: "Purity, cleansing, peace", "Pearl Grey": "Mystery, balance", Red: "Passion, action, strength", Scarlet: "Courage, fire", Crimson: "Deep power, grounding", Grey: "Neutrality, reflection", "Royal Blue": "Wisdom, spiritual insight", Purple: "Magic, royalty", Indigo: "Third eye, intuition", "Rose Pink": "Gentle love, self-care", Emerald: "Heart healing, prosperity", Green: "Growth, abundance", Black: "Protection, banishing", "Deep Indigo": "Karmic lessons, deep knowing", "Dark Purple": "Mysticism, mastery" };
export const CRYSTAL_MEANINGS = { Citrine: "Manifestation, joy", Sunstone: "Leadership, warmth", "Tiger's Eye": "Courage, grounding", Moonstone: "Intuition, feminine energy", Selenite: "Cleansing, divine light", Pearl: "Purity, emotional balance", "Red Jasper": "Stamina, focus", Carnelian: "Creativity, motivation", Bloodstone: "Strength, vitality", Aventurine: "Luck, opportunity", Agate: "Stability, grounding", Amethyst: "Spiritual protection, peace", "Lapis Lazuli": "Truth, inner vision", Sapphire: "Wisdom, mental clarity", "Rose Quartz": "Unconditional love", Emerald: "Heart healing, loyalty", Jade: "Luck, harmony", Garnet: "Passion, devotion", Onyx: "Protection, willpower", Hematite: "Grounding, balancing", Labradorite: "Magic, transformation", Aquamarine: "Calming, clear communication", Obsidian: "Shielding, shadow work" };

export const formatDate = (date) => date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
export const todayKey = (date = new Date()) => `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

// ============================================================================
// 3. LLM API INTEGRATION (Gemini)
// ============================================================================
export async function generateReading({ kind, payload }) {
  const apiKey = getStorage("astralis_gemini_key");
  const model = getStorage("astralis_gemini_model") || "gemini-2.5-flash";
  
  if (!apiKey) throw new Error("NO_KEY");

  let prompt = "";
  if (kind === "daily") {
    prompt = `You are Astralis, a master astrologer. Today is ${payload.date_string}.
The querent was born on ${payload.birth_date} ${payload.birth_time ? "at "+payload.birth_time : "with an unknown birth time"} in ${payload.birth_location}.
Their Sun sign is ${payload.sun_sign}. Life Path number: ${payload.life_path_number}. Personal Day number: ${payload.personal_day_number}. Today is ruled by ${payload.day_ruler}.
Using REAL current planetary transit and ephemeris data for ${payload.date_string} (search the web for today's actual planetary positions, Moon sign, and major aspects), write a deep, accurate daily astrology report.
Return ONLY rich Markdown with these exact sections:
## 🌌 Today's Cosmic Sky
The real planetary positions and major transits/aspects occurring today (Moon sign, key planetary aspects, any retrogrades or ingresses). Name the actual signs and planets.
## ✦ What It Means For You
How today's real transits interact with the querent's ${payload.sun_sign} Sun. Be specific and deep — name the planets and aspects and translate them into this person's lived experience today.
## 🔮 Forces at Play
The dominant energies and archetypal forces active today, and concrete ways to work WITH them (timing, mood, what to lean into, what to soften).
## 📖 Today's Lesson
Teach one clear, genuine astrology concept that arises from today's actual sky (e.g. explain an aspect, a planetary ingress, the Moon's phase/sign, a retrograde). Define any terms. The goal is that, over many days, the reader becomes a master astrologer.
## ✦ One Word for Today
A single resonant word or short phrase to carry through the day.
Be accurate to real ephemeris data for ${payload.date_string}. Be insightful, specific, and rooted in traditional Western tropical astrology. Avoid generic horoscope clichés — give real, usable depth.`;
  } else if (kind === "natal") {
    prompt = `You are Astralis, a master astrologer trained in Western tropical astrology and traditional ephemeris calculation.
Using REAL astronomical ephemeris data (search the web for the planetary positions on this date), cast and interpret the natal chart for:
Name: ${payload.name}
Born: ${payload.birth_date} ${payload.birth_time ? "at "+payload.birth_time : "with an unknown birth time (note where time-sensitive readings like the Ascendant and house placements are approximate)"}
Location: ${payload.birth_location}
Return ONLY rich Markdown with these exact sections, in this order:
# ✦ The Natal Chart of ${payload.name}
## ☉ Sun Sign
## ☽ Moon Sign
## ↑ Ascendant (Rising Sign)
## 🜨 The Planets   
(Create a ### subsection for each: Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto — name the zodiac sign it occupied that day + a 2–3 sentence interpretation)
## ✶ Major Aspects   
(conjunction, trine, square, opposition, sextile — planets involved + one-sentence meaning each)
## 🏠 The Houses (if time known)
## ✦ Soul Path Summary   
(a deep, synthesizing reading weaving the placements into a cohesive portrait)
Be accurate to real ephemeris positions for ${payload.birth_date}. Do not invent degrees; if uncertain, say so. Use traditional astrological symbolism throughout.`;
  }

  const response = await fetch(`[https://generativelanguage.googleapis.com/v1beta/models/$](https://generativelanguage.googleapis.com/v1beta/models/$){model}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      tools: [{ google_search: {} }],
      generationConfig: { temperature: 0.85, maxOutputTokens: 4096 }
    })
  });

  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  if (!data.candidates?.[0]?.content?.parts) throw new Error("Invalid response format");
  
  return data.candidates[0].content.parts.map(p => p.text).join("\n");
}

// ============================================================================
// 4. UI COMPONENTS
// ============================================================================
function GradientText({ children, className, as: Tag = "span" }) {
  return <Tag className={cn("uv-text uv-glow", className)}>{children}</Tag>;
}

function AsciiBox({ title, glyph = "✦", children, className, bodyClassName }) {
  return (
    <div className={cn("relative w-full text-muted-foreground", className)}>
      <div className="flex items-center text-fuchsia/50 ascii-frame">
        <span>╭</span>
        <div className="h-[1px] flex-grow border-t border-dashed border-fuchsia/30 mx-2" />
        {title && <span className="uppercase tracking-[0.3em] text-foreground text-sm mx-2 uv-text uv-glow">{glyph} {title} {glyph}</span>}
        <div className="h-[1px] flex-grow border-t border-dashed border-fuchsia/30 mx-2" />
        <span>╮</span>
      </div>
      <div className={cn("px-4 py-5 sm:px-7 sm:py-6 border-l border-r border-dashed border-fuchsia/20 mx-[4px]", bodyClassName)}>
        {children}
      </div>
      <div className="flex items-center text-fuchsia/50 ascii-frame">
        <span>╰</span>
        <div className="h-[1px] flex-grow border-t border-dashed border-fuchsia/30 mx-2" />
        <span>╯</span>
      </div>
    </div>
  );
}

function Starfield() {
  const stars = useMemo(() => Array.from({ length: 70 }).map((_, i) => ({
    top: `${(i * 73.31) % 100}%`, left: `${(i * 41.17) % 100}%`,
    width: `${(i % 5) * 0.4 + 0.6}px`, height: `${(i % 5) * 0.4 + 0.6}px`,
    animationDelay: `${(i % 9) * 0.6}s`, opacity: 0.25 + ((i * 13) % 60) / 100
  })), []);
  return (
    <div className="fixed inset-0 -z-10 bg-black pointer-events-none overflow-hidden">
      <div className="absolute inset-0 opacity-60" style={{
        background: `radial-gradient(circle at 50% 0%, rgba(139,92,246,0.15), transparent 40%),
                     radial-gradient(circle at 100% 100%, rgba(192,38,211,0.15), transparent 40%),
                     radial-gradient(circle at 0% 100%, rgba(240,171,252,0.1), transparent 40%)`
      }} />
      {stars.map((s, i) => <div key={i} className="absolute rounded-full bg-white animate-twinkle" style={s} />)}
    </div>
  );
}

function ZodiacWheel({ highlight, className, size = 320 }) {
  const cx = 100, cy = 100, rOuter = 92, rInner = 58, rGlyph = 75;
  const segments = 12, offset = Math.PI;
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" className={cn("overflow-visible", className)}>
      <defs>
        <linearGradient id="wheelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="55%" stopColor="#C026D3" />
          <stop offset="100%" stopColor="#F0ABFC" />
        </linearGradient>
      </defs>
      <circle cx={cx} cy={cy} r={rOuter} fill="none" stroke="url(#wheelGrad)" strokeWidth="0.5" className="opacity-40" />
      <circle cx={cx} cy={cy} r={rInner} fill="none" stroke="url(#wheelGrad)" strokeWidth="0.5" className="opacity-40" />
      <circle cx={cx} cy={cy} r={rOuter + 4} fill="none" stroke="url(#wheelGrad)" strokeWidth="0.2" className="opacity-20" strokeDasharray="2 4" />
      {Array.from({ length: segments }).map((_, i) => {
        const angle = offset + (i * 2 * Math.PI) / segments;
        const x2 = cx + rOuter * Math.cos(angle); const y2 = cy + rOuter * Math.sin(angle);
        const x1 = cx + rInner * Math.cos(angle); const y1 = cy + rInner * Math.sin(angle);
        const textAngle = angle + Math.PI / segments;
        const tx = cx + rGlyph * Math.cos
