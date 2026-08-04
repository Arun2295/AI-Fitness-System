// Central API configuration and service
const API_BASE = ''; // Vite dev proxy forwards /api and /oauth2 to localhost:8081

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : {};

    if (!res.ok) {
      const msg = data?.message || data?.error || `Error ${res.status}`;
      return { error: msg };
    }

    return { data };
  } catch (err: any) {
    return { error: err.message || 'Network error — is the server running?' };
  }
}

// ── Auth ──────────────────────────────────────────────────
export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  gender: string;
  height: number;
  weight: number;
  age: number;
  activityLevel: string;
  goal: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  phoneNumber: string | null;
  role: string;
  gender: string | null;
  height: number | null;
  weight: number | null;
  age: number;
  activityLevel: string | null;
  goal: string | null;
}

export interface AuthData {
  refreshToken: string;
  tokenType: string;
  accessTokenExpiration: number;
  refreshTokenExpiration: number;
  user: UserData;
  profileComplete: boolean;
}

export const authApi = {
  register: (payload: RegisterPayload) =>
    apiFetch<AuthData>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (payload: LoginPayload) =>
    apiFetch<AuthData>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  logout: () =>
    apiFetch('/api/auth/logout', { method: 'POST' }),

  googleLogin: () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  },
};

// ── Nutrition ──────────────────────────────────────────────────────────────

export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';

export interface NutritionPreviewResponse {
  foodName: string;
  weightInGrams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fibre: number;
  found: boolean;
}

// Per-item breakdown in a combo meal preview
export interface ComboItemPreview {
  query: string;
  found: boolean;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fibre: number;
}

export interface CombinedMealPreviewResponse {
  mealDescription: string;
  items: ComboItemPreview[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFibre: number;
  allFound: boolean;
}

export interface MealEntryResponse {
  id: string;
  foodName: string;
  mealDescription?: string; // non-null for combo meals
  weightInGrams: number;
  mealType: MealType;
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fibre: number;
  createdAt: string;
}

export interface DailySummaryResponse {
  date: string;
  mealCount: number;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFibre: number;
  meals: MealEntryResponse[];
}

export interface FoodSearchItem {
  id: string;
  name: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fibrePer100g: number;
}

export const nutritionApi = {
  // Simple meal: one food + weight
  previewNutrition: (foodName: string, weightInGrams: number) =>
    apiFetch<NutritionPreviewResponse>('/api/nutrition/preview', {
      method: 'POST',
      body: JSON.stringify({ foodName, weightInGrams }),
    }),

  logMeal: (payload: { foodName: string; weightInGrams: number; mealType: MealType; date?: string }) =>
    apiFetch<MealEntryResponse>('/api/nutrition/meals', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Combo meal: "5 eggs + 200ml milk + 50gm oats"
  previewCombinedMeal: (mealDescription: string) =>
    apiFetch<CombinedMealPreviewResponse>('/api/nutrition/preview/combined', {
      method: 'POST',
      body: JSON.stringify({ mealDescription }),
    }),

  logCombinedMeal: (payload: { mealDescription: string; mealType: MealType; date?: string }) =>
    apiFetch<MealEntryResponse>('/api/nutrition/meals/combined', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Shared
  getDailyMeals: (date?: string) => {
    const query = date ? `?date=${date}` : '';
    return apiFetch<MealEntryResponse[]>(`/api/nutrition/meals${query}`);
  },

  getDailySummary: (date?: string) => {
    const query = date ? `?date=${date}` : '';
    return apiFetch<DailySummaryResponse>(`/api/nutrition/meals/summary${query}`);
  },

  deleteMeal: (id: string) =>
    apiFetch(`/api/nutrition/meals/${id}`, { method: 'DELETE' }),

  searchFoods: (query: string) =>
    apiFetch<FoodSearchItem[]>(`/api/nutrition/foods/search?query=${encodeURIComponent(query)}`),

  getMealPresets: () =>
    apiFetch<MealPresetResponse>('/api/nutrition/meals/presets'),

  getNutritionArticles: () =>
    apiFetch<NutritionArticle[]>('/api/nutrition/articles'),
};

export interface PresetMealItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fibre: number;
  highInVitamin: string;
  antioxidant: boolean;
  antioxidantDescription: string | null;
}

export interface MealPresetResponse {
  veg: PresetMealItem[];
  nonVeg: PresetMealItem[];
  preWorkout: PresetMealItem[];
  postWorkout: PresetMealItem[];
  recovery: PresetMealItem[];
  injury: PresetMealItem[];
}

export interface NutritionArticle {
  id: string;
  title: string;
  category: string;
  readTime: string;
  summary: string;
  content: string;
  tags: string[];
}
