import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Weight,
  Ruler,
  Calendar,
  Flame,
  Dumbbell,
  Droplet,
  Moon,
  Target,
  Trophy,
  Salad,
  Activity,
} from "lucide-react";
import { useAuth } from "../AuthContext";
import AppShell from "../components/layout/AppShell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Separator } from "../components/ui/separator";

const GOAL_LABELS: Record<string, string> = {
  WEIGHT_LOSS: "Weight Loss",
  WEIGHT_GAIN: "Weight Gain",
  MAINTAIN_WEIGHT: "Maintain Weight",
  GENERAL_FITNESS: "General Fitness",
  STRENGTH: "Strength",
  ENDURANCE: "Endurance",
  CARDIO: "Cardio",
  FLEXIBILITY: "Flexibility",
  BODYBUILDING: "Bodybuilding",
};

const ACTIVITY_LABELS: Record<string, string> = {
  SEDENTARY: "Sedentary",
  LIGHTLY_ACTIVE: "Lightly Active",
  MODERATELY_ACTIVE: "Moderately Active",
  VERY_ACTIVE: "Very Active",
  EXTRA_ACTIVE: "Extra Active",
};

function bmi(height: number, weight: number) {
  if (!height || !weight) return null;
  const h = height / 100;
  return (weight / (h * h)).toFixed(1);
}

function bmiCategory(bmiVal: number) {
  if (bmiVal < 18.5)
    return { label: "Underweight", color: "text-blue-400", bg: "bg-blue-400" };
  if (bmiVal < 25)
    return { label: "Normal", color: "text-emerald-400", bg: "bg-emerald-400" };
  if (bmiVal < 30)
    return { label: "Overweight", color: "text-amber-400", bg: "bg-amber-400" };
  return { label: "Obese", color: "text-red-400", bg: "bg-red-400" };
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate("/login");
    return null;
  }

  const bmiVal = bmi(user.height ?? 0, user.weight ?? 0);
  const bmiInfo = bmiVal ? bmiCategory(parseFloat(bmiVal)) : null;
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  const stats = [
    {
      icon: <Weight className="size-5 text-primary" />,
      label: "Weight",
      value: user.weight != null ? `${user.weight} kg` : "—",
      change: "Current",
    },
    {
      icon: <Ruler className="size-5 text-primary" />,
      label: "Height",
      value: user.height != null ? `${user.height} cm` : "—",
      change: "Recorded",
    },
    {
      icon: <Calendar className="size-5 text-primary" />,
      label: "Age",
      value: user.age ? `${user.age} yrs` : "—",
      change: "Current",
    },
    {
      icon: <Activity className="size-5 text-primary" />,
      label: "BMI",
      value: bmiVal ?? "—",
      change: bmiInfo?.label ?? "Not set",
      changeColor: bmiInfo?.color,
    },
  ];

  return (
    <AppShell>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Your Fitness Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Track your progress and stay on target.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((s, i) => (
          <Card key={i} className="hover:bg-muted/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
                  {s.icon}
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-muted-foreground">
                    {s.label}
                  </p>
                  <p className="text-2xl font-bold">{s.value}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs">
                <span
                  className={`font-medium ${s.changeColor || "text-muted-foreground"}`}
                >
                  {s.change}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-xl">👤</span> Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center mb-6">
              <Avatar className="size-24 mb-4 border-4 border-background shadow-xl">
                <AvatarFallback className="text-3xl bg-primary/20 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-bold">{user.name}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <Badge className="mt-3" variant="secondary">
                {user.role}
              </Badge>
            </div>

            <Separator className="my-6" />

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground font-medium">
                  Phone
                </span>
                <span className="text-sm font-semibold">
                  {user.phoneNumber || "—"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground font-medium">
                  Gender
                </span>
                <span className="text-sm font-semibold">
                  {user.gender || "—"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground font-medium">
                  Age
                </span>
                <span className="text-sm font-semibold">
                  {user.age ? `${user.age} years` : "—"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fitness Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="size-5 text-primary" /> Fitness Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5 p-4 rounded-lg border bg-card">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                  Primary Goal
                </span>
                <span className="font-semibold text-lg flex items-center gap-2">
                  <Target className="size-5 text-primary" />
                  {user.goal ? GOAL_LABELS[user.goal] || user.goal : "—"}
                </span>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-muted-foreground font-medium">
                  Activity Level
                </span>
                <span className="text-sm font-semibold">
                  {user.activityLevel
                    ? ACTIVITY_LABELS[user.activityLevel] || user.activityLevel
                    : "—"}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-muted-foreground font-medium">
                  Height
                </span>
                <span className="text-sm font-semibold">
                  {user.height ? `${user.height} cm` : "—"}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-muted-foreground font-medium">
                  Weight
                </span>
                <span className="text-sm font-semibold">
                  {user.weight ? `${user.weight} kg` : "—"}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-muted-foreground font-medium">
                  BMI
                </span>
                <span className={`text-sm font-bold ${bmiInfo?.color || ""}`}>
                  {bmiVal ?? "—"} {bmiInfo ? `(${bmiInfo.label})` : ""}
                </span>
              </div>
            </div>

            {/* BMI Visualizer */}
            {bmiVal && (
              <div className="mt-8">
                <div className="flex justify-between text-xs font-semibold text-muted-foreground mb-2">
                  <span>BMI Range</span>
                  <span className={bmiInfo?.color}>{bmiVal}</span>
                </div>
                <div className="relative h-2.5 w-full rounded-full overflow-hidden bg-gradient-to-r from-blue-400 via-emerald-400 via-[62.5%] to-red-400 via-amber-400">
                  <div
                    className={`absolute top-0 bottom-0 w-1.5 bg-white border border-black/10 rounded-full shadow-sm transition-all duration-500`}
                    style={{
                      left: `${Math.min(Math.max(((parseFloat(bmiVal) - 15) / 25) * 100, 0), 98)}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground/60 mt-1.5 px-1 font-medium">
                  <span>15</span>
                  <span>18.5</span>
                  <span>25</span>
                  <span>30</span>
                  <span>40</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="size-5 text-orange-500" /> Quick Actions
          </CardTitle>
          <CardDescription>
            Log your daily metrics and progress.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="gap-2" onClick={() => {}}>
              <Dumbbell className="size-4" /> Log Workout
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => navigate("/nutrition")}
            >
              <Salad className="size-4" /> Log Meal
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => {}}>
              <Weight className="size-4" /> Update Weight
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => {}}>
              <Moon className="size-4" /> Log Sleep
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => {}}>
              <Droplet className="size-4 text-blue-400" /> Log Water
            </Button>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
