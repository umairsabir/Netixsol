import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Play } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const from = (location.state as any)?.from || '/';

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      setServerError('');
      await login(data.email, data.password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setServerError(err?.response?.data?.message || 'Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen bg-bg-custom flex items-center justify-center px-4">
      <div className="w-full max-w-[480px]">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-text-p font-bold text-2xl">
            <Play fill="currentColor" className="text-primary w-8 h-8" />
            StreamVibe
          </Link>
          <h1 className="text-text-p text-[28px] font-bold mt-6">Welcome back</h1>
          <p className="text-text-s text-[14px] mt-2">Sign in to your account to continue watching</p>
        </div>

        <div className="bg-surface border border-border-darker rounded-[12px] p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            {serverError && (
              <div className="bg-red-900/30 border border-primary text-primary text-sm rounded-[8px] px-4 py-3">
                {serverError}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-text-p text-[14px] font-medium">Email</label>
              <input
                {...register('email')}
                type="email"
                placeholder="you@example.com"
                className="bg-bg-custom border border-border-darker rounded-[8px] px-4 py-3 text-text-p text-[14px] outline-none focus:border-primary transition-colors placeholder:text-text-s"
              />
              {errors.email && <span className="text-primary text-[12px]">{errors.email.message}</span>}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-text-p text-[14px] font-medium">Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full bg-bg-custom border border-border-darker rounded-[8px] px-4 py-3 pr-12 text-text-p text-[14px] outline-none focus:border-primary transition-colors placeholder:text-text-s"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-s hover:text-text-p"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <span className="text-primary text-[12px]">{errors.password.message}</span>}
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-text-s text-[13px] hover:text-primary transition-colors">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary text-text-p font-semibold text-[16px] rounded-[8px] py-4 hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-text-s text-[14px] text-center mt-6">
            Don't have an account?{' '}
            <Link to="/register" state={{ from }} className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
