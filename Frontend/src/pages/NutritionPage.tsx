import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import {
  nutritionApi,
  type MealType,
  type NutritionPreviewResponse,
  type CombinedMealPreviewResponse,
  type ComboItemPreview,
  type MealEntryResponse,
  type DailySummaryResponse,
  type PresetMealItem,
  type MealPresetResponse,
  type NutritionArticle,
} from '../api';

// ── Constants ─────────────────────────────────────────────────────────────

const MEAL_ICONS: Record<MealType, string> = {
  BREAKFAST: '🌅', LUNCH: '☀️', DINNER: '🌙', SNACK: '🍎',
};
const MEAL_LABELS: Record<MealType, string> = {
  BREAKFAST: 'Breakfast', LUNCH: 'Lunch', DINNER: 'Dinner', SNACK: 'Snack',
};

// ── Helpers ───────────────────────────────────────────────────────────────

function formatDate(d: Date): string { return d.toISOString().split('T')[0]; }

function displayDate(d: Date): string {
  const today = new Date();
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  if (formatDate(d) === formatDate(today)) return 'Today';
  if (formatDate(d) === formatDate(yesterday)) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' });
}

function groupMealsByType(meals: MealEntryResponse[]) {
  const order: MealType[] = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'];
  const grouped: Record<string, MealEntryResponse[]> = {};
  for (const m of meals) {
    if (!grouped[m.mealType]) grouped[m.mealType] = [];
    grouped[m.mealType].push(m);
  }
  return order.filter((k) => grouped[k]?.length).map((k) => ({ type: k, items: grouped[k] }));
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// ── KPI Card ──────────────────────────────────────────────────────────────

function KpiCard({ icon, label, value, unit, color, bg, sub, progress }: {
  icon: string; label: string; value: string | number; unit: string;
  color: string; bg: string; sub?: string; progress?: number;
}) {
  return (
    <div className="nd-kpi-card" style={{ '--kpi-color': color, '--kpi-bg': bg } as React.CSSProperties}>
      <div className="nd-kpi-icon">{icon}</div>
      <div className="nd-kpi-value">{value}<span className="nd-kpi-unit">{unit}</span></div>
      <div className="nd-kpi-label">{label}</div>
      {sub && <div className="nd-kpi-sub">{sub}</div>}
      {progress !== undefined && (
        <div className="nd-kpi-bar">
          <div className="nd-kpi-bar-fill" style={{ width: `${Math.min(progress, 100)}%`, background: color }} />
        </div>
      )}
    </div>
  );
}

// ── Circular Macro Ring ────────────────────────────────────────────────────

function MacroRing({ value, label, unit, color, size = 90, max = 200 }: {
  value: number; label: string; unit: string; color: string; size?: number; max?: number;
}) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value / max, 1);
  const strokeDash = progress * circumference;
  return (
    <div className="nd-macro-ring">
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={10} />
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={10}
            strokeLinecap="round" strokeDasharray={circumference}
            strokeDashoffset={circumference - strokeDash}
            style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)', filter: `drop-shadow(0 0 6px ${color}66)` }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          <span style={{ fontSize: 16, fontWeight: 800, color, lineHeight: 1 }}>{Math.round(value * 10) / 10}</span>
          {unit && <span style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600 }}>{unit}</span>}
        </div>
      </div>
      <div className="nd-macro-ring-label" style={{ color }}>{label}</div>
    </div>
  );
}

// ── MacroMini ─────────────────────────────────────────────────────────────

function MacroMini({ label, value, color, unit = 'g' }: {
  label: string; value: number; color: string; unit?: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 44 }}>
      <span style={{ fontSize: 13, fontWeight: 700, color }}>{Math.round(value * 10) / 10}{unit === 'kcal' ? '' : unit}</span>
      <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
    </div>
  );
}

// ── Micro-Nutrient Progress Bar ────────────────────────────────────────────

function MicroBar({ label, value, max, unit, color, icon }: {
  label: string; value: number; max: number; unit: string; color: string; icon: string;
}) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="nd-micro-bar">
      <div className="nd-micro-bar-header">
        <span className="nd-micro-icon">{icon}</span>
        <span className="nd-micro-label">{label}</span>
        <span className="nd-micro-val" style={{ color }}>{value}{unit}</span>
        <span className="nd-micro-max">/ {max}{unit}</span>
      </div>
      <div className="nd-micro-track">
        <div className="nd-micro-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}cc, ${color})` }} />
      </div>
    </div>
  );
}

// ── Weekly Bar Chart ──────────────────────────────────────────────────────

function WeeklyChart({ data, color, label }: { data: number[]; color: string; label: string }) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const max = Math.max(...data, 1);
  return (
    <div className="nd-chart">
      <div className="nd-chart-title">{label}</div>
      <div className="nd-chart-bars">
        {data.map((v, i) => (
          <div key={i} className="nd-chart-col">
            <div className="nd-chart-bar-wrap">
              <div className="nd-chart-bar" style={{ height: `${(v / max) * 100}%`, background: `linear-gradient(180deg, ${color}, ${color}88)`, boxShadow: `0 -4px 12px ${color}44` }} />
            </div>
            <div className="nd-chart-day">{days[i]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── AI Coach Card ─────────────────────────────────────────────────────────

function AICoachCard({ summary, firstName }: { summary: DailySummaryResponse | null; firstName: string }) {
  const tips = [
    { emoji: '🥗', tip: 'Try adding more leafy greens to hit your iron targets today.', tag: 'Micronutrients' },
    { emoji: '💧', tip: 'You\'re 40% behind your hydration goal. Drink a glass now!', tag: 'Hydration' },
    { emoji: '💪', tip: 'Your protein intake is on track. Keep it up for muscle recovery.', tag: 'Macros' },
    { emoji: '🌙', tip: 'Eating a light, protein-rich dinner will aid overnight recovery.', tag: 'Recovery' },
    { emoji: '⚡', tip: 'Pre-workout carbs 60 mins before training can boost performance.', tag: 'Performance' },
  ];
  const idx = new Date().getHours() % tips.length;
  const tip = tips[idx];
  const score = summary ? Math.min(Math.round((summary.totalCalories / 2000) * 40 + (summary.totalProtein / 150) * 30 + (summary.mealCount / 4) * 30), 100) : 72;
  return (
    <div className="nd-ai-coach">
      <div className="nd-ai-coach-header">
        <div className="nd-ai-badge">
          <span className="nd-ai-dot" />
          AI Coach
        </div>
        <div className="nd-ai-score">
          <span style={{ fontSize: 22, fontWeight: 900, color: 'var(--accent)' }}>{score}</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>/100</span>
        </div>
      </div>
      <div className="nd-ai-greeting">Hey {firstName}! Here's your personalized tip:</div>
      <div className="nd-ai-tip">
        <span className="nd-ai-tip-emoji">{tip.emoji}</span>
        <div>
          <div className="nd-ai-tip-tag">{tip.tag}</div>
          <div className="nd-ai-tip-text">{tip.tip}</div>
        </div>
      </div>
      <div className="nd-ai-score-bar">
        <div className="nd-ai-score-fill" style={{ width: `${score}%` }} />
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>Nutrition Score — {score >= 80 ? 'Excellent 🌟' : score >= 60 ? 'Good 👍' : 'Needs Work 📈'}</div>
    </div>
  );
}

// ── Hydration Tracker ─────────────────────────────────────────────────────

function HydrationTracker() {
  const [glasses, setGlasses] = useState(5);
  const target = 8;
  return (
    <div className="nd-hydration">
      <div className="nd-hydration-header">
        <span style={{ fontSize: 20 }}>💧</span>
        <div>
          <div className="nd-hydration-title">Hydration</div>
          <div className="nd-hydration-sub">{glasses} of {target} glasses</div>
        </div>
        <div className="nd-hydration-val">{Math.round((glasses / target) * 100)}%</div>
      </div>
      <div className="nd-hydration-glasses">
        {Array.from({ length: target }).map((_, i) => (
          <button key={i} className={`nd-glass ${i < glasses ? 'nd-glass-full' : ''}`} onClick={() => setGlasses(i + 1)} title={`Set to ${i + 1} glasses`}>
            💧
          </button>
        ))}
      </div>
      <div className="nd-hydration-track">
        <div className="nd-hydration-fill" style={{ width: `${(glasses / target) * 100}%` }} />
      </div>
    </div>
  );
}

// ── Streak Achievement ────────────────────────────────────────────────────

function StreakCard() {
  const achievements = [
    { icon: '🔥', label: '7-Day Streak', desc: 'Logged meals every day', earned: true },
    { icon: '💯', label: 'Protein Pro', desc: 'Hit protein goal 5 days', earned: true },
    { icon: '🥗', label: 'Green Eater', desc: 'Ate veggies 10 times', earned: true },
    { icon: '💧', label: 'Hydrated', desc: '8 glasses for 3 days', earned: false },
    { icon: '⚡', label: 'Energy Master', desc: 'Optimal calorie balance', earned: false },
    { icon: '🌙', label: 'Night Owl', desc: 'Log dinner 3 days straight', earned: false },
  ];
  return (
    <div className="nd-streak">
      <div className="nd-section-header">
        <span className="nd-section-icon">🏆</span>
        <span>Streak & Achievements</span>
        <span className="nd-badge-pill" style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24' }}>3 Earned</span>
      </div>
      <div className="nd-achievement-grid">
        {achievements.map((a, i) => (
          <div key={i} className={`nd-achievement ${a.earned ? 'nd-achievement-earned' : 'nd-achievement-locked'}`}>
            <span className="nd-achievement-icon">{a.icon}</span>
            <div className="nd-achievement-label">{a.label}</div>
            <div className="nd-achievement-desc">{a.desc}</div>
            {!a.earned && <div className="nd-achievement-lock">🔒</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Grocery Suggestions ───────────────────────────────────────────────────

function GrocerySuggestions({ summary }: { summary: DailySummaryResponse | null }) {
  const all = [
    { food: 'Spinach', reason: 'High iron & folate', emoji: '🥬', tag: 'Iron', color: '#34d399' },
    { food: 'Greek Yogurt', reason: 'Protein + probiotics', emoji: '🥛', tag: 'Protein', color: '#60a5fa' },
    { food: 'Almonds', reason: 'Healthy fats & Vitamin E', emoji: '🥜', tag: 'Fats', color: '#f59e0b' },
    { food: 'Salmon', reason: 'Omega-3 & Vitamin D', emoji: '🐟', tag: 'Vit D', color: '#818cf8' },
    { food: 'Sweet Potato', reason: 'Complex carbs & Beta-carotene', emoji: '🍠', tag: 'Carbs', color: '#fb923c' },
    { food: 'Broccoli', reason: 'Fiber, calcium & antioxidants', emoji: '🥦', tag: 'Fiber', color: '#4ade80' },
  ];
  const suggestions = summary && summary.totalProtein < 60
    ? all.filter(a => a.tag === 'Protein' || a.tag === 'Iron')
    : all.slice(0, 4);
  return (
    <div className="nd-grocery">
      <div className="nd-section-header">
        <span className="nd-section-icon">🛒</span>
        <span>Smart Grocery Picks</span>
        <span className="nd-badge-pill" style={{ background: 'rgba(52,211,153,0.1)', color: 'var(--accent)' }}>AI Picks</span>
      </div>
      <div className="nd-grocery-list">
        {all.map((g, i) => (
          <div key={i} className="nd-grocery-item">
            <span className="nd-grocery-emoji">{g.emoji}</span>
            <div className="nd-grocery-info">
              <div className="nd-grocery-name">{g.food}</div>
              <div className="nd-grocery-reason">{g.reason}</div>
            </div>
            <span className="nd-grocery-tag" style={{ background: `${g.color}18`, color: g.color }}>{g.tag}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Body Metrics Card ─────────────────────────────────────────────────────

function BodyMetrics({ user }: { user: any }) {
  const weight = user?.weight ?? 75;
  const height = user?.height ?? 175;
  const bmi = +(weight / ((height / 100) ** 2)).toFixed(1);
  const bmiLabel = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese';
  const bmiColor = bmi < 18.5 ? '#60a5fa' : bmi < 25 ? '#34d399' : bmi < 30 ? '#fbbf24' : '#f87171';
  const bmr = Math.round(10 * weight + 6.25 * height - 5 * (user?.age ?? 25) + (user?.gender === 'MALE' ? 5 : -161));
  const tdee = Math.round(bmr * 1.55);
  return (
    <div className="nd-body-metrics">
      <div className="nd-section-header">
        <span className="nd-section-icon">📏</span>
        <span>Body Metrics</span>
      </div>
      <div className="nd-metrics-grid">
        <div className="nd-metric-item">
          <div className="nd-metric-val">{weight}<span className="nd-metric-unit">kg</span></div>
          <div className="nd-metric-label">Weight</div>
        </div>
        <div className="nd-metric-item">
          <div className="nd-metric-val">{height}<span className="nd-metric-unit">cm</span></div>
          <div className="nd-metric-label">Height</div>
        </div>
        <div className="nd-metric-item">
          <div className="nd-metric-val" style={{ color: bmiColor }}>{bmi}</div>
          <div className="nd-metric-label">BMI · {bmiLabel}</div>
        </div>
        <div className="nd-metric-item">
          <div className="nd-metric-val">{bmr}<span className="nd-metric-unit">kcal</span></div>
          <div className="nd-metric-label">BMR</div>
        </div>
        <div className="nd-metric-item nd-metric-wide">
          <div className="nd-metric-val" style={{ color: 'var(--accent)' }}>{tdee}<span className="nd-metric-unit">kcal</span></div>
          <div className="nd-metric-label">Daily Energy Need (TDEE)</div>
        </div>
      </div>
    </div>
  );
}

// ── Floating AI Chat ──────────────────────────────────────────────────────

function FloatingChat({ firstName }: { firstName: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ from: 'ai' | 'user'; text: string }[]>([
    { from: 'ai', text: `Hi ${firstName}! 👋 I'm your AI Nutrition Coach. Ask me anything about your diet, macros, or meal planning!` }
  ]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const aiReplies = [
    "Great question! Aim for 0.8–1g of protein per pound of bodyweight for muscle building.",
    "For fat loss, create a 300–500 kcal deficit while keeping protein high to preserve muscle.",
    "Carbs aren't the enemy! Focus on complex carbs like oats, quinoa, and sweet potatoes.",
    "Hydration is crucial. Even 2% dehydration can affect performance by up to 20%.",
    "Pre-workout: eat carbs + protein 1–2 hours before. Post-workout: consume within 30 minutes.",
    "Fiber keeps you full and supports gut health. Aim for 25–35g per day.",
    "Vitamin D deficiency is common. Get sunlight or supplement with 1000–2000 IU daily.",
  ];

  const sendMsg = () => {
    if (!input.trim()) return;
    const userMsg = { from: 'user' as const, text: input.trim() };
    const aiMsg = { from: 'ai' as const, text: aiReplies[Math.floor(Math.random() * aiReplies.length)] };
    setMessages(prev => [...prev, userMsg, aiMsg]);
    setInput('');
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  return (
    <div className="nd-float-chat">
      {open && (
        <div className="nd-chat-window">
          <div className="nd-chat-header">
            <div className="nd-ai-dot" style={{ width: 8, height: 8 }} />
            <span>AI Nutrition Coach</span>
            <button className="nd-chat-close" onClick={() => setOpen(false)}>✕</button>
          </div>
          <div className="nd-chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`nd-chat-msg ${m.from === 'ai' ? 'nd-chat-ai' : 'nd-chat-user'}`}>
                {m.text}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="nd-chat-input-row">
            <input
              className="nd-chat-input"
              placeholder="Ask about nutrition..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMsg()}
            />
            <button className="nd-chat-send" onClick={sendMsg}>➤</button>
          </div>
        </div>
      )}
      <button className="nd-chat-fab" onClick={() => setOpen(o => !o)} title="AI Nutrition Coach">
        {open ? '✕' : '🤖'}
      </button>
    </div>
  );
}

// ── Calorie Balance ────────────────────────────────────────────────────────

function CalorieBalance({ summary, user }: { summary: DailySummaryResponse | null; user: any }) {
  const weight = user?.weight ?? 75;
  const height = user?.height ?? 175;
  const bmr = Math.round(10 * weight + 6.25 * height - 5 * (user?.age ?? 25) + (user?.gender === 'MALE' ? 5 : -161));
  const burned = Math.round(bmr * 1.55);
  const consumed = Math.round(summary?.totalCalories ?? 0);
  const net = consumed - burned;
  const isDeficit = net < 0;
  return (
    <div className="nd-calorie-balance">
      <div className="nd-section-header">
        <span className="nd-section-icon">⚡</span>
        <span>Calorie Balance</span>
        <span className="nd-badge-pill" style={{ background: isDeficit ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)', color: isDeficit ? '#34d399' : '#f87171' }}>
          {isDeficit ? '🔻 Deficit' : '🔺 Surplus'}
        </span>
      </div>
      <div className="nd-calorie-row">
        <div className="nd-calorie-item">
          <div className="nd-calorie-circle" style={{ '--c': '#fbbf24' } as React.CSSProperties}>
            <span style={{ fontSize: 24, fontWeight: 900, color: '#fbbf24' }}>{consumed}</span>
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>kcal in</span>
          </div>
          <div className="nd-calorie-item-label">Consumed</div>
        </div>
        <div className="nd-calorie-vs">
          <div className="nd-net-val" style={{ color: isDeficit ? '#34d399' : '#f87171' }}>{Math.abs(net)}</div>
          <div className="nd-net-label">kcal {isDeficit ? 'deficit' : 'surplus'}</div>
        </div>
        <div className="nd-calorie-item">
          <div className="nd-calorie-circle" style={{ '--c': '#f87171' } as React.CSSProperties}>
            <span style={{ fontSize: 24, fontWeight: 900, color: '#f87171' }}>{burned}</span>
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>kcal out</span>
          </div>
          <div className="nd-calorie-item-label">Burned (Est.)</div>
        </div>
      </div>
    </div>
  );
}

// ── Log Mode ──────────────────────────────────────────────────────────────
type LogMode = 'simple' | 'combo' | 'sheets';

// ── Main Component ────────────────────────────────────────────────────────

export default function NutritionPage() {
  const { user, clearAuth } = useAuth();
  const navigate = useNavigate();

  const [logMode, setLogMode] = useState<LogMode>('combo');
  const [foodName, setFoodName] = useState('');
  const [weight, setWeight] = useState('');
  const [simplePreview, setSimplePreview] = useState<NutritionPreviewResponse | null>(null);
  const [simplePreviewLoading, setSimplePreviewLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<{ name: string }[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [comboInput, setComboInput] = useState('');
  const [comboPreview, setComboPreview] = useState<CombinedMealPreviewResponse | null>(null);
  const [comboPreviewLoading, setComboPreviewLoading] = useState(false);
  const [presets, setPresets] = useState<MealPresetResponse | null>(null);
  const [presetsLoading, setPresetsLoading] = useState(false);
  const [activeSheet, setActiveSheet] = useState<'veg' | 'nonVeg' | 'preWorkout' | 'postWorkout' | 'recovery' | 'injury'>('veg');
  const [articles, setArticles] = useState<NutritionArticle[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<NutritionArticle | null>(null);
  const [mealType, setMealType] = useState<MealType>('BREAKFAST');
  const [summary, setSummary] = useState<DailySummaryResponse | null>(null);
  const [mealsLoading, setMealsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [logging, setLogging] = useState(false);
  const [logError, setLogError] = useState('');
  const [logSuccess, setLogSuccess] = useState('');

  const handleLogout = async () => { await clearAuth(); navigate('/login'); };
  const firstName = user?.name?.split(' ')[0] || 'User';

  useEffect(() => {
    const fetchPresets = async () => {
      setPresetsLoading(true);
      try { const res = await nutritionApi.getMealPresets(); if (res.data) setPresets(res.data); } catch { /* ignore */ }
      setPresetsLoading(false);
    };
    const fetchArticles = async () => {
      setArticlesLoading(true);
      try { const res = await nutritionApi.getNutritionArticles(); if (res.data) setArticles(res.data); } catch { /* ignore */ }
      setArticlesLoading(false);
    };
    fetchPresets(); fetchArticles();
  }, []);

  const loadSummary = useCallback(async () => {
    setMealsLoading(true);
    const res = await nutritionApi.getDailySummary(formatDate(selectedDate));
    if (res.data) setSummary(res.data);
    setMealsLoading(false);
  }, [selectedDate]);

  useEffect(() => { loadSummary(); }, [loadSummary]);

  const simpleTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (simpleTimeout.current) clearTimeout(simpleTimeout.current);
    const w = parseFloat(weight);
    if (!foodName.trim() || !w || w < 1) { setSimplePreview(null); return; }
    simpleTimeout.current = setTimeout(async () => {
      setSimplePreviewLoading(true);
      const res = await nutritionApi.previewNutrition(foodName.trim(), w);
      if (res.data) setSimplePreview(res.data);
      setSimplePreviewLoading(false);
    }, 600);
    return () => { if (simpleTimeout.current) clearTimeout(simpleTimeout.current); };
  }, [foodName, weight]);

  const suggestionTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleFoodInput = (value: string) => {
    setFoodName(value);
    if (suggestionTimeout.current) clearTimeout(suggestionTimeout.current);
    if (value.length < 2) { setSuggestions([]); setShowDropdown(false); return; }
    suggestionTimeout.current = setTimeout(async () => {
      const res = await nutritionApi.searchFoods(value);
      if (res.data?.length) { setSuggestions(res.data.map((f) => ({ name: f.name }))); setShowDropdown(true); }
      else { setSuggestions([]); setShowDropdown(false); }
    }, 300);
  };
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const comboTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (comboTimeout.current) clearTimeout(comboTimeout.current);
    if (!comboInput.trim() || !comboInput.includes('+') && comboInput.trim().length < 3) { setComboPreview(null); return; }
    comboTimeout.current = setTimeout(async () => {
      setComboPreviewLoading(true);
      const res = await nutritionApi.previewCombinedMeal(comboInput.trim());
      if (res.data) setComboPreview(res.data);
      setComboPreviewLoading(false);
    }, 800);
    return () => { if (comboTimeout.current) clearTimeout(comboTimeout.current); };
  }, [comboInput]);

  const handleLogSimple = async () => {
    const w = parseFloat(weight);
    if (!foodName.trim()) { setLogError('Please enter a food name.'); return; }
    if (!w || w < 1) { setLogError('Please enter a valid weight (min 1g).'); return; }
    setLogging(true); setLogError(''); setLogSuccess('');
    const res = await nutritionApi.logMeal({ foodName: foodName.trim(), weightInGrams: w, mealType, date: formatDate(selectedDate) });
    setLogging(false);
    if (res.error) { setLogError(res.error); }
    else { setLogSuccess(`✅ ${foodName} logged! ${res.data?.calories.toFixed(0)} kcal added.`); setFoodName(''); setWeight(''); setSimplePreview(null); loadSummary(); setTimeout(() => setLogSuccess(''), 4000); }
  };

  const handleLogCombo = async () => {
    if (!comboInput.trim()) { setLogError('Please enter a meal description.'); return; }
    setLogging(true); setLogError(''); setLogSuccess('');
    const res = await nutritionApi.logCombinedMeal({ mealDescription: comboInput.trim(), mealType, date: formatDate(selectedDate) });
    setLogging(false);
    if (res.error) { setLogError(res.error); }
    else { setLogSuccess(`✅ Meal logged! ${res.data?.calories.toFixed(0)} kcal added.`); setComboInput(''); setComboPreview(null); loadSummary(); setTimeout(() => setLogSuccess(''), 4000); }
  };

  const handleDeleteMeal = async (id: string) => { await nutritionApi.deleteMeal(id); loadSummary(); };
  const goToPrevDay = () => { const d = new Date(selectedDate); d.setDate(d.getDate() - 1); setSelectedDate(d); };
  const goToNextDay = () => { const d = new Date(selectedDate); d.setDate(d.getDate() + 1); if (d <= new Date()) setSelectedDate(d); };
  const groupedMeals = summary ? groupMealsByType(summary.meals) : [];

  // Derived data for new sections
  const calorieGoal = 2000;
  const proteinGoal = 150;
  const carbGoal = 250;
  const fatGoal = 65;
  const waterGoal = 2500;

  const weeklyCalories = [1850, 2100, 1780, 2200, 1950, 2050, summary?.totalCalories ?? 0];
  const weeklyProtein = [120, 145, 110, 160, 135, 148, summary?.totalProtein ?? 0];

  const micronutrients = [
    { label: 'Iron', value: 8, max: 18, unit: 'mg', color: '#f87171', icon: '🔴' },
    { label: 'Calcium', value: 650, max: 1000, unit: 'mg', color: '#60a5fa', icon: '🦴' },
    { label: 'Vitamin D', value: 400, max: 600, unit: 'IU', color: '#fbbf24', icon: '☀️' },
    { label: 'Vitamin B12', value: 1.8, max: 2.4, unit: 'μg', color: '#a78bfa', icon: '💊' },
    { label: 'Fiber', value: summary ? Math.round(summary.totalFibre) : 12, max: 30, unit: 'g', color: '#4ade80', icon: '🌾' },
    { label: 'Zinc', value: 6, max: 11, unit: 'mg', color: '#fb923c', icon: '⚡' },
  ];

  const sheetLabels: Record<string, string> = {
    veg: '🥦 Vegetarian', nonVeg: '🍗 Non-Veg', preWorkout: '⚡ Pre-Workout',
    postWorkout: '🔋 Post-Workout', recovery: '🌿 Recovery', injury: '🩹 Injury Care',
  };
  const sheetKeys = Object.keys(sheetLabels) as (typeof activeSheet)[];
  const sheetData: PresetMealItem[] = presets ? (presets[activeSheet] ?? []) : [];

  const catColor = (cat: string) => {
    const map: Record<string, [string, string]> = {
      'Macros': ['rgba(52,211,153,0.12)', '#34d399'],
      'Vitamins & Minerals': ['rgba(96,165,250,0.12)', '#60a5fa'],
      'Recovery': ['rgba(167,139,250,0.12)', '#a78bfa'],
      'Hydration': ['rgba(251,191,36,0.12)', '#fbbf24'],
    };
    return map[cat] ?? ['rgba(255,255,255,0.08)', 'var(--text-muted)'];
  };

  return (
    <div className="dashboard">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">💪</div>
          <span className="sidebar-logo-text">AI Fitness</span>
        </div>
        <nav className="sidebar-nav">
          <Link className="nav-item" to="/dashboard"><span className="nav-icon">🏠</span> Dashboard</Link>
          <a className="nav-item" href="#progress"><span className="nav-icon">📈</span> Progress</a>
          <Link className="nav-item active" to="/nutrition"><span className="nav-icon">🥗</span> Nutrition</Link>
          <Link className="nav-item" to="/knowledge"><span className="nav-icon">📚</span> Knowledge</Link>
          <a className="nav-item" href="#workouts"><span className="nav-icon">🏋️</span> Workouts</a>
          <a className="nav-item" href="#goals"><span className="nav-icon">🎯</span> Goals</a>
          <a className="nav-item" href="#settings"><span className="nav-icon">⚙️</span> Settings</a>
        </nav>
        <div className="sidebar-footer">
          <button id="btn-nutrition-logout" className="nav-item" onClick={handleLogout} style={{ color: '#f87171', width: '100%' }}>
            <span className="nav-icon">🚪</span> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="main-content nd-main">
        {/* ── Premium Hero Topbar ── */}
        <div className="nd-hero-bar">
          <div className="nd-hero-left">
            <div className="nd-avatar">{firstName[0]?.toUpperCase()}</div>
            <div>
              <div className="nd-hero-greeting">{getGreeting()}, <span className="nd-hero-name">{firstName}</span> 👋</div>
              <div className="nd-hero-date">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>
          <div className="nd-hero-right">
            <span className="badge badge-accent">🥗 Nutrition Dashboard</span>
            <div className="date-nav" style={{ margin: 0 }}>
              <button className="date-nav-btn" onClick={goToPrevDay}>◀</button>
              <div className="date-nav-label" style={{ minWidth: 120, fontSize: 13 }}>{displayDate(selectedDate)}</div>
              <button className="date-nav-btn" onClick={goToNextDay} disabled={formatDate(selectedDate) === formatDate(new Date())}>▶</button>
            </div>
            <button id="btn-nutrition-top-logout" className="btn btn-outline btn-sm" onClick={handleLogout}>Sign Out</button>
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div className="nd-kpi-grid">
          <KpiCard icon="🔥" label="Calories" value={Math.round(summary?.totalCalories ?? 0)} unit=" kcal"
            color="#fbbf24" bg="rgba(251,191,36,0.08)"
            sub={`Goal: ${calorieGoal} kcal`}
            progress={((summary?.totalCalories ?? 0) / calorieGoal) * 100} />
          <KpiCard icon="💪" label="Protein" value={`${(summary?.totalProtein ?? 0).toFixed(0)}`} unit="g"
            color="#34d399" bg="rgba(52,211,153,0.08)"
            sub={`Goal: ${proteinGoal}g`}
            progress={((summary?.totalProtein ?? 0) / proteinGoal) * 100} />
          <KpiCard icon="⚡" label="Carbs" value={`${(summary?.totalCarbs ?? 0).toFixed(0)}`} unit="g"
            color="#60a5fa" bg="rgba(96,165,250,0.08)"
            sub={`Goal: ${carbGoal}g`}
            progress={((summary?.totalCarbs ?? 0) / carbGoal) * 100} />
          <KpiCard icon="🫒" label="Fat" value={`${(summary?.totalFat ?? 0).toFixed(0)}`} unit="g"
            color="#f87171" bg="rgba(248,113,113,0.08)"
            sub={`Goal: ${fatGoal}g`}
            progress={((summary?.totalFat ?? 0) / fatGoal) * 100} />
          <KpiCard icon="💧" label="Water" value="1.5" unit="L"
            color="#22d3ee" bg="rgba(34,211,238,0.08)"
            sub="Goal: 2.5L"
            progress={60} />
          <KpiCard icon="🌟" label="Nutrition Score" value="76" unit="/100"
            color="#a78bfa" bg="rgba(167,139,250,0.08)"
            sub="Good progress!"
            progress={76} />
        </div>

        {/* ── AI Coach + Body Metrics Row ── */}
        <div className="nd-two-col">
          <AICoachCard summary={summary} firstName={firstName} />
          <BodyMetrics user={user} />
        </div>

        {/* ── Macro Summary + Calorie Balance ── */}
        <div className="nd-two-col">
          {/* Macro Rings */}
          <div className="nd-glass-card">
            <div className="nd-section-header">
              <span className="nd-section-icon">🎯</span>
              <span>Today's Macro Overview</span>
            </div>
            {mealsLoading ? (
              <div style={{ textAlign: 'center', padding: 24 }}><div className="spinner" style={{ margin: '0 auto', borderTopColor: 'var(--accent)' }} /></div>
            ) : summary && summary.mealCount > 0 ? (
              <>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <div className="calories-highlight" style={{ fontSize: 48 }}>{Math.round(summary.totalCalories)}</div>
                  <div className="calories-label" style={{ fontSize: 13 }}>Total Calories Today</div>
                </div>
                <div className="nd-rings-row">
                  <MacroRing value={summary.totalProtein} label="Protein" unit="g" color="#34d399" max={proteinGoal} />
                  <MacroRing value={summary.totalCarbs} label="Carbs" unit="g" color="#60a5fa" max={carbGoal} />
                  <MacroRing value={summary.totalFat} label="Fat" unit="g" color="#f87171" max={fatGoal} />
                  <MacroRing value={summary.totalFibre} label="Fiber" unit="g" color="#a78bfa" max={35} />
                  <MacroRing value={summary.mealCount} label="Meals" unit="" color="#fbbf24" max={6} />
                </div>
              </>
            ) : (
              <div className="empty-state" style={{ padding: '32px 0' }}>
                <div className="empty-state-icon">🍽️</div>
                <div className="empty-state-text">No meals logged for {displayDate(selectedDate).toLowerCase()}.</div>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Log your first meal below!</p>
              </div>
            )}
          </div>

          <CalorieBalance summary={summary} user={user} />
        </div>

        {/* ── Meal Timeline ── */}
        {summary && summary.mealCount > 0 && (
          <div className="nd-glass-card">
            <div className="nd-section-header">
              <span className="nd-section-icon">🕐</span>
              <span>Today's Meal Timeline</span>
              <span className="nd-badge-pill" style={{ background: 'rgba(52,211,153,0.1)', color: 'var(--accent)' }}>{summary.mealCount} meals</span>
            </div>
            <div className="nd-timeline">
              {(['BREAKFAST', 'LUNCH', 'SNACK', 'DINNER'] as MealType[]).map((type, ti) => {
                const typeMeals = summary.meals.filter(m => m.mealType === type);
                const typeCalories = typeMeals.reduce((a, m) => a + m.calories, 0);
                const isEmpty = typeMeals.length === 0;
                return (
                  <div key={type} className="nd-timeline-row">
                    <div className="nd-timeline-time">
                      {type === 'BREAKFAST' ? '8 AM' : type === 'LUNCH' ? '1 PM' : type === 'SNACK' ? '4 PM' : '8 PM'}
                    </div>
                    <div className={`nd-timeline-dot ${isEmpty ? 'nd-timeline-dot-empty' : ''}`}>
                      {!isEmpty && MEAL_ICONS[type]}
                    </div>
                    <div className={`nd-timeline-card ${isEmpty ? 'nd-timeline-card-empty' : ''}`}>
                      <div className="nd-timeline-meal-label">{MEAL_LABELS[type]}</div>
                      {isEmpty ? (
                        <div className="nd-timeline-empty-label">Not logged yet</div>
                      ) : (
                        <>
                          <div className="nd-timeline-foods">
                            {typeMeals.map(m => (
                              <span key={m.id} className="nd-timeline-food-tag">{m.foodName}</span>
                            ))}
                          </div>
                          <div className="nd-timeline-kcal" style={{ color: '#fbbf24' }}>{Math.round(typeCalories)} kcal</div>
                        </>
                      )}
                    </div>
                    {ti < 3 && <div className="nd-timeline-line" />}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Log Meal Card ── */}
        <div className="nd-glass-card">
          <div className="nd-section-header" style={{ marginBottom: 20 }}>
            <span className="nd-section-icon">🍽️</span>
            <span>Log a Meal</span>
          </div>

          {/* Mode toggle */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 4, width: 'fit-content' }}>
            {(['combo', 'simple', 'sheets'] as LogMode[]).map((mode) => (
              <button key={mode} onClick={() => { setLogMode(mode); setLogError(''); setLogSuccess(''); }}
                style={{ padding: '9px 22px', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: 13, transition: 'all 0.2s',
                  background: logMode === mode ? 'linear-gradient(135deg, var(--accent), var(--accent-dark))' : 'transparent',
                  color: logMode === mode ? '#0a0f1a' : 'var(--text-muted)' }}>
                {mode === 'combo' ? '🍱 Combo Meal' : mode === 'simple' ? '🥩 Single Food' : '🥗 Meal Sheets'}
              </button>
            ))}
          </div>

          {/* Combo Mode */}
          {logMode === 'combo' && (
            <>
              <div style={{ marginBottom: 8, fontSize: 13, color: 'var(--text-muted)' }}>
                Separate foods with <strong style={{ color: 'var(--accent)' }}>+</strong>. Include quantity and unit.
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                {['5 whole eggs + 200ml milk + 50gm oats', '100g chicken breast + 150g rice + 80g broccoli', '2 chapati + 1 cup dal + 30g paneer'].map((ex) => (
                  <button key={ex} onClick={() => setComboInput(ex)}
                    style={{ padding: '4px 10px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.03)', borderRadius: 999, fontSize: 11, color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}
                    onMouseOver={e => { (e.target as HTMLElement).style.borderColor = 'var(--accent)'; (e.target as HTMLElement).style.color = 'var(--accent)'; }}
                    onMouseOut={e => { (e.target as HTMLElement).style.borderColor = 'var(--border)'; (e.target as HTMLElement).style.color = 'var(--text-muted)'; }}>
                    {ex}
                  </button>
                ))}
              </div>
              <div className="log-form-row">
                <textarea id="combo-meal-input" placeholder="e.g. 5 whole eggs + 200ml milk + 50gm oats" value={comboInput} onChange={(e) => setComboInput(e.target.value)} rows={2}
                  style={{ width: '100%', padding: '13px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: 15, fontFamily: 'inherit', outline: 'none', resize: 'vertical', lineHeight: 1.5, transition: 'border-color 0.2s, box-shadow 0.2s' }}
                  onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-glow)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }} />
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                  <select id="combo-meal-type" className="meal-type-select" value={mealType} onChange={(e) => setMealType(e.target.value as MealType)}>
                    <option value="BREAKFAST">🌅 Breakfast</option>
                    <option value="LUNCH">☀️ Lunch</option>
                    <option value="DINNER">🌙 Dinner</option>
                    <option value="SNACK">🍎 Snack</option>
                  </select>
                  <button id="btn-log-combo" className="btn-log-meal" onClick={handleLogCombo} disabled={logging || !comboInput.trim()}>
                    {logging ? '⏳ Logging…' : '✅ Log Meal'}
                  </button>
                </div>
              </div>
              {comboPreviewLoading && (<div className="nutrition-preview" style={{ textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto', borderTopColor: 'var(--accent)' }} /><p style={{ marginTop: 8, fontSize: 13, color: 'var(--text-muted)' }}>Fetching nutrition…</p></div>)}
              {!comboPreviewLoading && comboPreview && (
                <div className="nutrition-preview">
                  <div className="nutrition-preview-title">✨ Auto-Calculated Nutrition Breakdown</div>
                  {comboPreview.items.map((item: ComboItemPreview, i: number) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < comboPreview.items.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                      <div style={{ flex: '0 0 auto', minWidth: 160, fontSize: 13, fontWeight: 600, color: item.found ? 'var(--text-primary)' : 'var(--error)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 16 }}>{item.found ? '✅' : '❓'}</span>{item.query}
                      </div>
                      {item.found ? (
                        <div style={{ display: 'flex', gap: 16, flex: 1 }}>
                          <MacroMini label="kcal" value={item.calories} color="#fbbf24" unit="kcal" />
                          <MacroMini label="protein" value={item.protein} color="#34d399" />
                          <MacroMini label="carbs" value={item.carbs} color="#60a5fa" />
                          <MacroMini label="fat" value={item.fat} color="#f87171" />
                          <MacroMini label="fibre" value={item.fibre} color="#a78bfa" />
                        </div>
                      ) : (<span style={{ fontSize: 12, color: 'var(--error)' }}>Not recognised — check spelling</span>)}
                    </div>
                  ))}
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: '2px solid rgba(52,211,153,0.2)', display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ flex: '0 0 auto', minWidth: 160, fontSize: 12, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Total</div>
                    <div style={{ display: 'flex', gap: 16, flex: 1 }}>
                      <MacroMini label="kcal" value={comboPreview.totalCalories} color="#fbbf24" unit="kcal" />
                      <MacroMini label="protein" value={comboPreview.totalProtein} color="#34d399" />
                      <MacroMini label="carbs" value={comboPreview.totalCarbs} color="#60a5fa" />
                      <MacroMini label="fat" value={comboPreview.totalFat} color="#f87171" />
                      <MacroMini label="fibre" value={comboPreview.totalFibre} color="#a78bfa" />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Simple Mode */}
          {logMode === 'simple' && (
            <>
              <div className="log-form-row">
                <div className="food-search-wrapper" ref={dropdownRef}>
                  <input id="food-name-input" placeholder="Search food (e.g. boiled egg)" value={foodName} onChange={(e) => handleFoodInput(e.target.value)} autoComplete="off" />
                  {showDropdown && suggestions.length > 0 && (
                    <div className="food-dropdown">
                      {suggestions.map((s, i) => (
                        <div key={i} className="food-dropdown-item" onClick={() => { setFoodName(s.name); setShowDropdown(false); }}>
                          🍽️ {s.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="weight-input-group">
                  <input id="food-weight-input" type="number" placeholder="Weight" min="1" value={weight} onChange={(e) => setWeight(e.target.value)} />
                  <span className="weight-unit">g</span>
                </div>
                <select id="simple-meal-type" className="meal-type-select" value={mealType} onChange={(e) => setMealType(e.target.value as MealType)}>
                  <option value="BREAKFAST">🌅 Breakfast</option>
                  <option value="LUNCH">☀️ Lunch</option>
                  <option value="DINNER">🌙 Dinner</option>
                  <option value="SNACK">🍎 Snack</option>
                </select>
                <button id="btn-log-simple" className="btn-log-meal" onClick={handleLogSimple} disabled={logging || !foodName.trim() || !weight}>
                  {logging ? '⏳ Logging…' : '✅ Log Meal'}
                </button>
              </div>
              {simplePreviewLoading && (<div className="nutrition-preview" style={{ textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto', borderTopColor: 'var(--accent)' }} /></div>)}
              {!simplePreviewLoading && simplePreview && (
                <div className="nutrition-preview">
                  <div className="nutrition-preview-title">
                    {simplePreview.found ? '✨ Nutrition Preview' : '⚠️ Food Not Found'}
                  </div>
                  {simplePreview.found ? (
                    <div className="nutrition-preview-grid">
                      {[{ v: simplePreview.calories.toFixed(0), l: 'kcal', c: '#fbbf24' }, { v: simplePreview.protein.toFixed(1) + 'g', l: 'Protein', c: '#34d399' }, { v: simplePreview.carbs.toFixed(1) + 'g', l: 'Carbs', c: '#60a5fa' }, { v: simplePreview.fat.toFixed(1) + 'g', l: 'Fat', c: '#f87171' }, { v: simplePreview.fibre.toFixed(1) + 'g', l: 'Fibre', c: '#a78bfa' }].map(({ v, l, c }) => (
                        <div key={l} className="preview-macro">
                          <div className="preview-macro-value" style={{ color: c }}>{v}</div>
                          <div className="preview-macro-label">{l}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="preview-not-found">❌ Food not found. Try a different name.</div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Sheets Mode */}
          {logMode === 'sheets' && (
            <>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
                {sheetKeys.map(k => (
                  <button key={k} onClick={() => setActiveSheet(k)}
                    style={{ padding: '7px 14px', border: `1px solid ${activeSheet === k ? 'var(--accent)' : 'var(--border)'}`, background: activeSheet === k ? 'var(--accent-glow)' : 'transparent', borderRadius: 999, fontSize: 12, fontWeight: 600, color: activeSheet === k ? 'var(--accent)' : 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit' }}>
                    {sheetLabels[k]}
                  </button>
                ))}
              </div>
              {presetsLoading ? (
                <div style={{ textAlign: 'center', padding: 24 }}><div className="spinner" style={{ margin: '0 auto', borderTopColor: 'var(--accent)' }} /></div>
              ) : (
                <div className="nd-preset-grid">
                  {sheetData.map((item, i) => (
                    <div key={i} className="nd-preset-card">
                      <div className="nd-preset-name">{item.name}</div>
                      <div className="nd-preset-kcal">{item.calories} kcal</div>
                      <div className="nd-preset-macros">
                        <span style={{ color: '#34d399' }}>P {item.protein}g</span>
                        <span style={{ color: '#60a5fa' }}>C {item.carbs}g</span>
                        <span style={{ color: '#f87171' }}>F {item.fat}g</span>
                      </div>
                      {item.highInVitamin && <div className="nd-preset-badge">🌿 {item.highInVitamin}</div>}
                      {item.antioxidant && <div className="nd-preset-badge nd-preset-badge-antioxidant">⚡ Antioxidant</div>}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Alerts */}
          {logError && <div className="alert alert-error" style={{ marginTop: 16 }}>⚠️ {logError}</div>}
          {logSuccess && <div className="alert alert-success" style={{ marginTop: 16 }}>{logSuccess}</div>}
        </div>

        {/* ── Weekly Charts ── */}
        <div className="nd-two-col">
          <div className="nd-glass-card">
            <div className="nd-section-header">
              <span className="nd-section-icon">📊</span>
              <span>Weekly Nutrition Trends</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <WeeklyChart data={weeklyCalories} color="#fbbf24" label="Calories (kcal)" />
              <WeeklyChart data={weeklyProtein} color="#34d399" label="Protein (g)" />
            </div>
          </div>

          {/* Micronutrients */}
          <div className="nd-glass-card">
            <div className="nd-section-header">
              <span className="nd-section-icon">🧬</span>
              <span>Micronutrient Status</span>
              <span className="nd-badge-pill" style={{ background: 'rgba(96,165,250,0.1)', color: '#60a5fa' }}>Today</span>
            </div>
            <div className="nd-micro-list">
              {micronutrients.map((m, i) => (
                <MicroBar key={i} {...m} />
              ))}
            </div>
          </div>
        </div>

        {/* ── Hydration + Streaks row ── */}
        <div className="nd-two-col">
          <HydrationTracker />
          <StreakCard />
        </div>

        {/* ── Grocery Suggestions ── */}
        <div className="nd-glass-card">
          <GrocerySuggestions summary={summary} />
        </div>

        {/* ── Meal Log ── */}
        {summary && summary.mealCount > 0 && (
          <div className="nd-glass-card">
            <div className="nd-section-header" style={{ marginBottom: 20 }}>
              <span className="nd-section-icon">📋</span>
              <span>Meal Log — {displayDate(selectedDate)}</span>
              <span className="nd-badge-pill" style={{ background: 'rgba(52,211,153,0.1)', color: 'var(--accent)' }}>{summary.mealCount} entries</span>
            </div>
            {groupedMeals.map(({ type, items }) => (
              <div key={type}>
                <div className="meal-group-header">{MEAL_ICONS[type]} {MEAL_LABELS[type]}</div>
                {items.map((meal) => (
                  <div key={meal.id} className="meal-entry-card">
                    <div className="meal-entry-left">
                      <div className="meal-entry-icon">{MEAL_ICONS[meal.mealType]}</div>
                      <div>
                        <div className="meal-entry-name">{meal.foodName}</div>
                        <div className="meal-entry-weight">
                          {meal.mealDescription ? <span style={{ color: 'var(--accent)', fontSize: 11 }}>🍱 Combo</span> : `${meal.weightInGrams}g`}
                        </div>
                      </div>
                    </div>
                    <div className="meal-macros-row">
                      {[
                        { val: Math.round(meal.calories), lbl: 'kcal', color: '#fbbf24' },
                        { val: meal.protein.toFixed(1), lbl: 'protein', color: '#34d399' },
                        { val: meal.carbs.toFixed(1), lbl: 'carbs', color: '#60a5fa' },
                        { val: meal.fat.toFixed(1), lbl: 'fat', color: '#f87171' },
                        { val: meal.fibre.toFixed(1), lbl: 'fibre', color: '#a78bfa' },
                      ].map(({ val, lbl, color }) => (
                        <div key={lbl} className="meal-macro-pill">
                          <span className="meal-macro-val" style={{ color }}>{val}{lbl !== 'kcal' ? 'g' : ''}</span>
                          <span className="meal-macro-lbl">{lbl}</span>
                        </div>
                      ))}
                    </div>
                    <button className="meal-delete-btn" title="Delete" onClick={() => handleDeleteMeal(meal.id)}>🗑</button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* ── Articles ── */}
        <div className="nd-glass-card">
          <div className="nd-section-header" style={{ marginBottom: 20 }}>
            <span className="nd-section-icon">📚</span>
            <span>Nutrition Reading Corner</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Boost your nutrition knowledge with science-backed articles.</p>
          {articlesLoading ? (
            <div style={{ textAlign: 'center', padding: 24 }}><div className="spinner" style={{ margin: '0 auto', borderTopColor: 'var(--accent)' }} /></div>
          ) : (
            <div className="nd-articles-grid">
              {articles.map((art) => {
                const [bg, clr] = catColor(art.category);
                return (
                  <div key={art.id} className="nd-article-card" onClick={() => setSelectedArticle(art)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="nd-article-cat" style={{ background: bg, color: clr }}>{art.category}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>⏱️ {art.readTime}</span>
                    </div>
                    <h3 className="nd-article-title">{art.title}</h3>
                    <p className="nd-article-summary">{art.summary}</p>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 'auto' }}>
                      {art.tags.map((t) => (
                        <span key={t} className="nd-article-tag">#{t}</span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* ── Article Modal ── */}
      {selectedArticle && (
        <div className="nd-modal-overlay" onClick={() => setSelectedArticle(null)}>
          <div className="nd-modal" onClick={e => e.stopPropagation()}>
            <div className="nd-modal-header">
              <div>
                <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {selectedArticle.category} · {selectedArticle.readTime}
                </span>
                <h2 style={{ margin: '4px 0 0 0', fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>{selectedArticle.title}</h2>
              </div>
              <button className="nd-modal-close" onClick={() => setSelectedArticle(null)}>✕</button>
            </div>
            <div className="nd-modal-body">
              {selectedArticle.content.split('\n\n').map((p, idx) => {
                if (p.startsWith('### ')) return <h3 key={idx} style={{ color: 'var(--text-primary)', margin: '12px 0 4px', fontSize: 16, fontWeight: 700 }}>{p.replace('### ', '')}</h3>;
                if (p.startsWith('- ')) return <ul key={idx} style={{ margin: 0, paddingLeft: 20 }}>{p.split('\n').map((li, lIdx) => <li key={lIdx} style={{ marginBottom: 4 }}>{li.replace('- ', '')}</li>)}</ul>;
                return <p key={idx} style={{ margin: 0 }}>{p}</p>;
              })}
            </div>
            <div className="nd-modal-footer">
              <button className="btn-log-meal" onClick={() => setSelectedArticle(null)}>Done Reading</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Floating AI Chat ── */}
      <FloatingChat firstName={firstName} />
    </div>
  );
}
