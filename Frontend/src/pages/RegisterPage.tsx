import React, { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { authApi } from '../api';
import type { RegisterPayload } from '../api';
import { useAuth } from '../AuthContext';
import AuthShell from '../components/auth/AuthShell';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Separator } from '../components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

type FormState = Omit<RegisterPayload, 'height' | 'weight' | 'age'> & {
  height: string;
  weight: string;
  age: string;
};

const INITIAL: FormState = {
  firstName: '', lastName: '', email: '', password: '',
  phone: '', gender: '', height: '', weight: '', age: '',
  activityLevel: '', goal: '',
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormState]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (apiError) setApiError('');
  };

  const handleSelectChange = (name: string, value: string) => {
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormState]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (apiError) setApiError('');
  };

  const validate = (): boolean => {
    const errs: Partial<FormState> = {};
    if (!form.firstName) errs.firstName = 'Required';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email required';
    if (!form.password || form.password.length < 8) errs.password = 'Min 8 characters';
    if (!form.phone) errs.phone = 'Required';
    if (!form.gender) errs.gender = 'Required';
    if (!form.height || isNaN(+form.height)) errs.height = 'Valid number required';
    if (!form.weight || isNaN(+form.weight)) errs.weight = 'Valid number required';
    if (!form.age || isNaN(+form.age) || +form.age < 1) errs.age = 'Valid age required';
    if (!form.activityLevel) errs.activityLevel = 'Required';
    if (!form.goal) errs.goal = 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setApiError('');

    const payload: RegisterPayload = {
      ...form,
      height: parseFloat(form.height),
      weight: parseFloat(form.weight),
      age: parseInt(form.age),
    };

    const { data, error } = await authApi.register(payload);
    setLoading(false);

    if (error) { setApiError(error); return; }
    if (data?.user) {
      setAuth(data.user, data.refreshToken);
      navigate('/dashboard');
    }
  };

  const handleGoogle = () => authApi.googleLogin();

  const E = (field: keyof FormState) =>
    errors[field] ? <p className="mt-1 text-xs text-destructive">{errors[field]}</p> : null;

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start your personalised fitness journey today."
      wide
    >
      {apiError && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{apiError}</AlertDescription>
        </Alert>
      )}

      <Button
        id="btn-google-register"
        type="button"
        variant="outline"
        className="w-full h-11 mb-6"
        onClick={handleGoogle}
      >
        <svg className="size-4 mr-2" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        </svg>
        Continue with Google
      </Button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground tracking-widest">
            Or register with email
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="reg-firstName">First Name</Label>
            <Input
              id="reg-firstName"
              type="text"
              name="firstName"
              placeholder="John"
              value={form.firstName}
              onChange={handleChange}
              aria-invalid={!!errors.firstName}
            />
            {E('firstName')}
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-lastName">Last Name</Label>
            <Input
              id="reg-lastName"
              type="text"
              name="lastName"
              placeholder="Doe"
              value={form.lastName}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reg-email">Email</Label>
          <Input
            id="reg-email"
            type="email"
            name="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            aria-invalid={!!errors.email}
          />
          {E('email')}
        </div>

        <div className="space-y-2">
          <Label htmlFor="reg-password">Password</Label>
          <Input
            id="reg-password"
            type="password"
            name="password"
            placeholder="Min 8 characters"
            value={form.password}
            onChange={handleChange}
            aria-invalid={!!errors.password}
          />
          {E('password')}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="reg-phone">Phone</Label>
            <Input
              id="reg-phone"
              type="tel"
              name="phone"
              placeholder="+1..."
              value={form.phone}
              onChange={handleChange}
              aria-invalid={!!errors.phone}
            />
            {E('phone')}
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-gender">Gender</Label>
            <Select value={form.gender} onValueChange={(val) => handleSelectChange('gender', val)}>
              <SelectTrigger id="reg-gender" aria-invalid={!!errors.gender}>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MALE">Male</SelectItem>
                <SelectItem value="FEMALE">Female</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
            {E('gender')}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="reg-height">Height (cm)</Label>
            <Input
              id="reg-height"
              type="number"
              name="height"
              placeholder="175"
              value={form.height}
              onChange={handleChange}
              aria-invalid={!!errors.height}
            />
            {E('height')}
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-weight">Weight (kg)</Label>
            <Input
              id="reg-weight"
              type="number"
              name="weight"
              placeholder="70"
              value={form.weight}
              onChange={handleChange}
              aria-invalid={!!errors.weight}
            />
            {E('weight')}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="reg-age">Age</Label>
            <Input
              id="reg-age"
              type="number"
              name="age"
              placeholder="25"
              value={form.age}
              onChange={handleChange}
              aria-invalid={!!errors.age}
            />
            {E('age')}
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-activityLevel">Activity Level</Label>
            <Select value={form.activityLevel} onValueChange={(val) => handleSelectChange('activityLevel', val)}>
              <SelectTrigger id="reg-activityLevel" aria-invalid={!!errors.activityLevel}>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SEDENTARY">Sedentary (little or no exercise)</SelectItem>
                <SelectItem value="LIGHTLY_ACTIVE">Lightly Active (1–3 days/week)</SelectItem>
                <SelectItem value="MODERATELY_ACTIVE">Moderately Active (3–5 days/week)</SelectItem>
                <SelectItem value="VERY_ACTIVE">Very Active (6–7 days/week)</SelectItem>
                <SelectItem value="EXTRA_ACTIVE">Extra Active (athlete / physical job)</SelectItem>
              </SelectContent>
            </Select>
            {E('activityLevel')}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reg-goal">Fitness Goal</Label>
          <Select value={form.goal} onValueChange={(val) => handleSelectChange('goal', val)}>
            <SelectTrigger id="reg-goal" aria-invalid={!!errors.goal}>
              <SelectValue placeholder="Select goal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="WEIGHT_LOSS">Lose Weight</SelectItem>
              <SelectItem value="WEIGHT_GAIN">Build Muscle</SelectItem>
              <SelectItem value="MAINTAIN_WEIGHT">Maintain Weight</SelectItem>
              <SelectItem value="GENERAL_FITNESS">General Fitness</SelectItem>
              <SelectItem value="STRENGTH">Strength</SelectItem>
              <SelectItem value="ENDURANCE">Endurance</SelectItem>
              <SelectItem value="CARDIO">Cardio</SelectItem>
              <SelectItem value="FLEXIBILITY">Flexibility</SelectItem>
              <SelectItem value="BODYBUILDING">Bodybuilding</SelectItem>
            </SelectContent>
          </Select>
          {E('goal')}
        </div>

        <Button
          id="btn-register-submit"
          type="submit"
          className="w-full h-11 mt-6"
          disabled={loading}
        >
          {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
          {loading ? 'Creating account…' : 'Create Account'}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-primary hover:underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
