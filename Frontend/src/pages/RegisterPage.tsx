import React, { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api';
import type { RegisterPayload } from '../api';
import { useAuth } from '../AuthContext';

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
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
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
    errors[field] ? <span className="field-error">⚠ {errors[field]}</span> : null;

  return (
    <div className="auth-page">
      <div className="auth-container" style={{ maxWidth: 560 }}>
        <div className="auth-card">
          {/* Logo */}
          <div className="auth-logo">
            <div className="auth-logo-icon">💪</div>
            <span className="auth-logo-text">AI Fitness</span>
          </div>

          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">Start your personalised fitness journey today.</p>

          {apiError && <div className="alert alert-error">⚠ {apiError}</div>}

          {/* Google */}
          <button id="btn-google-register" className="btn btn-google" type="button" onClick={handleGoogle}>
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </button>

          <div className="auth-divider"><span>or register with email</span></div>

          <form onSubmit={handleSubmit} noValidate>
            {/* Row 1 */}
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-firstName">First Name</label>
                <input id="reg-firstName" className={`form-input${errors.firstName ? ' error' : ''}`}
                  type="text" name="firstName" placeholder="John" value={form.firstName} onChange={handleChange} />
                {E('firstName')}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-lastName">Last Name</label>
                <input id="reg-lastName" className="form-input"
                  type="text" name="lastName" placeholder="Doe" value={form.lastName} onChange={handleChange} />
              </div>
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email</label>
              <input id="reg-email" className={`form-input${errors.email ? ' error' : ''}`}
                type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} />
              {E('email')}
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Password</label>
              <input id="reg-password" className={`form-input${errors.password ? ' error' : ''}`}
                type="password" name="password" placeholder="Min 8 characters" value={form.password} onChange={handleChange} />
              {E('password')}
            </div>

            {/* Row 2 */}
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-phone">Phone</label>
                <input id="reg-phone" className={`form-input${errors.phone ? ' error' : ''}`}
                  type="tel" name="phone" placeholder="+91..." value={form.phone} onChange={handleChange} />
                {E('phone')}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-gender">Gender</label>
                <select id="reg-gender" className={`form-select${errors.gender ? ' error' : ''}`}
                  name="gender" value={form.gender} onChange={handleChange}>
                  <option value="">Select</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
                {E('gender')}
              </div>
            </div>

            {/* Row 3 */}
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-height">Height (cm)</label>
                <input id="reg-height" className={`form-input${errors.height ? ' error' : ''}`}
                  type="number" name="height" placeholder="175" value={form.height} onChange={handleChange} />
                {E('height')}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-weight">Weight (kg)</label>
                <input id="reg-weight" className={`form-input${errors.weight ? ' error' : ''}`}
                  type="number" name="weight" placeholder="70" value={form.weight} onChange={handleChange} />
                {E('weight')}
              </div>
            </div>

            {/* Age */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-age">Age</label>
              <input id="reg-age" className={`form-input${errors.age ? ' error' : ''}`}
                type="number" name="age" placeholder="25" value={form.age} onChange={handleChange} />
              {E('age')}
            </div>

            {/* Activity Level */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-activityLevel">Activity Level</label>
              <select id="reg-activityLevel" className={`form-select${errors.activityLevel ? ' error' : ''}`}
                name="activityLevel" value={form.activityLevel} onChange={handleChange}>
                <option value="">Select level</option>
                <option value="SEDENTARY">Sedentary (little or no exercise)</option>
                <option value="LIGHTLY_ACTIVE">Lightly Active (1–3 days/week)</option>
                <option value="MODERATELY_ACTIVE">Moderately Active (3–5 days/week)</option>
                <option value="VERY_ACTIVE">Very Active (6–7 days/week)</option>
                <option value="EXTRA_ACTIVE">Extra Active (athlete / physical job)</option>
              </select>
              {E('activityLevel')}
            </div>

            {/* Goal */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-goal">Fitness Goal</label>
              <select id="reg-goal" className={`form-select${errors.goal ? ' error' : ''}`}
                name="goal" value={form.goal} onChange={handleChange}>
                <option value="">Select goal</option>
                <option value="WEIGHT_LOSS">Lose Weight</option>
                <option value="WEIGHT_GAIN">Build Muscle</option>
                <option value="MAINTAIN_WEIGHT">Maintain Weight</option>
                <option value="GENERAL_FITNESS">General Fitness</option>
                <option value="STRENGTH">Strength</option>
                <option value="ENDURANCE">Endurance</option>
                <option value="CARDIO">Cardio</option>
                <option value="FLEXIBILITY">Flexibility</option>
                <option value="BODYBUILDING">Bodybuilding</option>
              </select>
              {E('goal')}
            </div>

            <button id="btn-register-submit" className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? <span className="spinner" /> : null}
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
