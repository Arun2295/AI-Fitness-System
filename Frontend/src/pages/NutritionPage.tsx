import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Search, Plus, Trash2, Check, AlertCircle, Droplet, Flame, ArrowRight } from 'lucide-react';
import { useAuth } from '../AuthContext';
import {
  nutritionApi,
  type MealType,
  type NutritionPreviewResponse,
  type CombinedMealPreviewResponse,
  type MealEntryResponse,
  type DailySummaryResponse,
} from '../api';

import AppShell from '../components/layout/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Progress } from '../components/ui/progress';

const MEAL_LABELS: Record<MealType, string> = {
  BREAKFAST: 'Breakfast', LUNCH: 'Lunch', DINNER: 'Dinner', SNACK: 'Snack',
};
const MEAL_ICONS: Record<MealType, string> = {
  BREAKFAST: '🌅', LUNCH: '☀️', DINNER: '🌙', SNACK: '🍎',
};

function formatDate(d: Date): string { return d.toISOString().split('T')[0]; }

export default function NutritionPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  if (!user) { navigate('/login'); return null; }

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [summary, setSummary] = useState<DailySummaryResponse | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(true);

  // Simple Logging
  const [foodName, setFoodName] = useState('');
  const [weight, setWeight] = useState('');
  const [mealType, setMealType] = useState<MealType>('BREAKFAST');
  const [simplePreview, setSimplePreview] = useState<NutritionPreviewResponse | null>(null);
  const [simplePreviewLoading, setSimplePreviewLoading] = useState(false);

  // Combo Logging
  const [comboInput, setComboInput] = useState('');
  const [comboPreview, setComboPreview] = useState<CombinedMealPreviewResponse | null>(null);
  const [comboPreviewLoading, setComboPreviewLoading] = useState(false);

  const [logging, setLogging] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchSummary = useCallback(async (date: Date) => {
    setLoadingSummary(true);
    const { data } = await nutritionApi.getDailySummary(formatDate(date));
    if (data) setSummary(data);
    else setSummary(null);
    setLoadingSummary(false);
  }, []);

  useEffect(() => {
    fetchSummary(selectedDate);
  }, [selectedDate, fetchSummary]);

  // Preview Debouncers
  useEffect(() => {
    if (!foodName || !weight || isNaN(+weight)) { setSimplePreview(null); return; }
    const t = setTimeout(async () => {
      setSimplePreviewLoading(true);
      const { data } = await nutritionApi.previewNutrition(foodName, +weight);
      if (data) setSimplePreview(data);
      setSimplePreviewLoading(false);
    }, 500);
    return () => clearTimeout(t);
  }, [foodName, weight]);

  useEffect(() => {
    if (!comboInput.trim()) { setComboPreview(null); return; }
    const t = setTimeout(async () => {
      setComboPreviewLoading(true);
      const { data } = await nutritionApi.previewCombinedMeal(comboInput);
      if (data) setComboPreview(data);
      setComboPreviewLoading(false);
    }, 600);
    return () => clearTimeout(t);
  }, [comboInput]);

  const handleLogSimple = async () => {
    if (!foodName || !weight) return;
    setLogging(true); setError(''); setSuccess('');
    const { error: apiErr } = await nutritionApi.logMeal({ foodName, weightInGrams: +weight, mealType, date: formatDate(selectedDate) });
    setLogging(false);
    if (apiErr) { setError(apiErr); return; }
    setSuccess('Meal logged successfully!');
    setFoodName(''); setWeight(''); setSimplePreview(null);
    fetchSummary(selectedDate);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleLogCombo = async () => {
    if (!comboInput.trim()) return;
    setLogging(true); setError(''); setSuccess('');
    const { error: apiErr } = await nutritionApi.logCombinedMeal({ mealDescription: comboInput, mealType, date: formatDate(selectedDate) });
    setLogging(false);
    if (apiErr) { setError(apiErr); return; }
    setSuccess('Combo meal logged successfully!');
    setComboInput(''); setComboPreview(null);
    fetchSummary(selectedDate);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleDeleteMeal = async (id: string) => {
    const { error: apiErr } = await nutritionApi.deleteMeal(id);
    if (!apiErr) fetchSummary(selectedDate);
  };

  const groupedMeals = summary?.meals ? Object.entries(
    summary.meals.reduce((acc, m) => {
      if (!acc[m.mealType]) acc[m.mealType] = [];
      acc[m.mealType].push(m);
      return acc;
    }, {} as Record<string, MealEntryResponse[]>)
  ).map(([type, items]) => ({ type: type as MealType, items })) : [];

  return (
    <AppShell>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nutrition</h1>
          <p className="text-muted-foreground mt-1">Log your meals and track your macros.</p>
        </div>
        <div className="flex items-center gap-2 bg-card p-1 rounded-lg border">
          <Button variant="ghost" size="icon" onClick={() => setSelectedDate(new Date(selectedDate.getTime() - 86400000))}><ArrowRight className="size-4 rotate-180" /></Button>
          <span className="text-sm font-medium px-4">{formatDate(selectedDate)}</span>
          <Button variant="ghost" size="icon" onClick={() => setSelectedDate(new Date(selectedDate.getTime() + 86400000))}><ArrowRight className="size-4" /></Button>
        </div>
      </div>

      {error && <Alert variant="destructive" className="mb-6"><AlertCircle className="size-4" /><AlertDescription>{error}</AlertDescription></Alert>}
      {success && <Alert className="mb-6 border-primary/50 text-primary bg-primary/10"><Check className="size-4 text-primary" /><AlertDescription>{success}</AlertDescription></Alert>}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Log a Meal</CardTitle>
            <CardDescription>Add food to your diary for {formatDate(selectedDate)}</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="simple">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="simple">Simple Log</TabsTrigger>
                <TabsTrigger value="combo">Combo Meal</TabsTrigger>
              </TabsList>
              
              <TabsContent value="simple" className="space-y-4">
                <div className="flex gap-2">
                  <Input placeholder="Food name (e.g. apple)" value={foodName} onChange={e => setFoodName(e.target.value)} />
                  <Input type="number" placeholder="Weight (g)" value={weight} onChange={e => setWeight(e.target.value)} className="w-24" />
                </div>
                <div className="flex gap-2">
                  <Select value={mealType} onValueChange={(v: MealType) => setMealType(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BREAKFAST">Breakfast</SelectItem>
                      <SelectItem value="LUNCH">Lunch</SelectItem>
                      <SelectItem value="DINNER">Dinner</SelectItem>
                      <SelectItem value="SNACK">Snack</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleLogSimple} disabled={logging || !foodName || !weight} className="w-full">
                    {logging ? 'Logging...' : 'Log Meal'}
                  </Button>
                </div>
                {simplePreview && (
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg border text-sm">
                    {simplePreview.found ? (
                      <div className="flex justify-between items-center text-center">
                        <div><div className="font-bold text-amber-500">{Math.round(simplePreview.calories)}</div><div className="text-xs text-muted-foreground">kcal</div></div>
                        <div><div className="font-bold text-emerald-500">{simplePreview.protein.toFixed(1)}g</div><div className="text-xs text-muted-foreground">Protein</div></div>
                        <div><div className="font-bold text-blue-500">{simplePreview.carbs.toFixed(1)}g</div><div className="text-xs text-muted-foreground">Carbs</div></div>
                        <div><div className="font-bold text-red-500">{simplePreview.fat.toFixed(1)}g</div><div className="text-xs text-muted-foreground">Fat</div></div>
                      </div>
                    ) : (
                      <span className="text-destructive">Food not found in database.</span>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="combo" className="space-y-4">
                <textarea
                  className="w-full h-24 p-3 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="e.g. 2 whole eggs + 100g oats + 200ml milk"
                  value={comboInput}
                  onChange={e => setComboInput(e.target.value)}
                />
                <div className="flex gap-2">
                  <Select value={mealType} onValueChange={(v: MealType) => setMealType(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BREAKFAST">Breakfast</SelectItem>
                      <SelectItem value="LUNCH">Lunch</SelectItem>
                      <SelectItem value="DINNER">Dinner</SelectItem>
                      <SelectItem value="SNACK">Snack</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleLogCombo} disabled={logging || !comboInput} className="w-full">
                    {logging ? 'Logging...' : 'Log Combo'}
                  </Button>
                </div>
                {comboPreview && (
                  <div className="mt-4 space-y-2 p-3 bg-muted/50 rounded-lg border text-sm">
                    {comboPreview.items.map((it, i) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span className={it.found ? 'text-foreground' : 'text-destructive'}>
                          {it.found ? '✓' : '✗'} {it.query}
                        </span>
                        {it.found && <span className="font-semibold">{Math.round(it.calories)} kcal</span>}
                      </div>
                    ))}
                    <Separator />
                    <div className="flex justify-between font-bold text-sm">
                      <span>Total</span>
                      <span className="text-primary">{Math.round(comboPreview.totalCalories)} kcal</span>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily Summary</CardTitle>
            <CardDescription>Your macros for {formatDate(selectedDate)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-3xl font-bold text-primary">{summary ? Math.round(summary.totalCalories) : 0}</p>
                <p className="text-sm text-muted-foreground font-medium">kcal consumed</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">{summary?.mealCount || 0}</p>
                <p className="text-sm text-muted-foreground font-medium">meals logged</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-emerald-500">Protein</span>
                  <span>{summary ? summary.totalProtein.toFixed(1) : 0}g</span>
                </div>
                <Progress value={summary ? Math.min((summary.totalProtein / 150) * 100, 100) : 0} className="h-2 [&>div]:bg-emerald-500" />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-blue-500">Carbs</span>
                  <span>{summary ? summary.totalCarbs.toFixed(1) : 0}g</span>
                </div>
                <Progress value={summary ? Math.min((summary.totalCarbs / 250) * 100, 100) : 0} className="h-2 [&>div]:bg-blue-500" />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-red-500">Fat</span>
                  <span>{summary ? summary.totalFat.toFixed(1) : 0}g</span>
                </div>
                <Progress value={summary ? Math.min((summary.totalFat / 70) * 100, 100) : 0} className="h-2 [&>div]:bg-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Meal Log</CardTitle>
            <CardDescription>Everything you ate today</CardDescription>
          </CardHeader>
          <CardContent>
            {groupedMeals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No meals logged for this date.
              </div>
            ) : (
              <div className="space-y-6">
                {groupedMeals.map(({ type, items }) => (
                  <div key={type} className="space-y-3">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      {MEAL_ICONS[type]} {MEAL_LABELS[type]}
                    </h3>
                    <div className="grid gap-3 md:grid-cols-2">
                      {items.map(meal => (
                        <div key={meal.id} className="flex items-center justify-between p-4 rounded-xl border bg-muted/30">
                          <div>
                            <p className="font-semibold">{meal.foodName}</p>
                            <p className="text-xs text-muted-foreground">
                              {meal.mealDescription ? 'Combo Meal' : `${meal.weightInGrams}g`}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-bold text-amber-500">{Math.round(meal.calories)} <span className="text-xs font-normal text-muted-foreground">kcal</span></p>
                              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                                <span className="text-emerald-500">{meal.protein.toFixed(0)}p</span> ·{' '}
                                <span className="text-blue-500">{meal.carbs.toFixed(0)}c</span> ·{' '}
                                <span className="text-red-500">{meal.fat.toFixed(0)}f</span>
                              </p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteMeal(meal.id)} className="text-muted-foreground hover:text-destructive">
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
