import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Play } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/\d/, 'Must contain a number')
    .regex(/[a-zA-Z]/, 'Must contain a letter'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

const RegisterPage: React.FC = () => {
  const { register: authRegister } = useAuth();
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
      await authRegister(data.name, data.email, data.password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setServerError(err?.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-bg-custom flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[480px]">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-text-p font-bold text-2xl">
            <Play fill="currentColor" className="text-primary w-8 h-8" />
            StreamVibe
          </Link>
          <h1 className="text-text-p text-[28px] font-bold mt-6">Create your account</h1>
          <p className="text-text-s text-[14px] mt-2">Start your free 7-day trial, no card required</p>
        </div>

        <div className="bg-surface border border-border-darker rounded-[12px] p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            {serverError && (
              <div className="bg-red-900/30 border border-primary text-primary text-sm rounded-[8px] px-4 py-3">
                {serverError}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-text-p text-[14px] font-medium">Full name</label>
              <input
                {...register('name')}
                type="text"
                placeholder="John Doe"
                className="bg-bg-custom border border-border-darker rounded-[8px] px-4 py-3 text-text-p text-[14px] outline-none focus:border-primary transition-colors placeholder:text-text-s"
              />
              {errors.name && <span className="text-primary text-[12px]">{errors.name.message}</span>}
            </div>

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
                  placeholder="Min. 8 chars, include letter and number"
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

            <div className="flex flex-col gap-2">
              <label className="text-text-p text-[14px] font-medium">Confirm password</label>
              <input
                {...register('confirmPassword')}
                type="password"
                placeholder="••••••••"
                className="bg-bg-custom border border-border-darker rounded-[8px] px-4 py-3 text-text-p text-[14px] outline-none focus:border-primary transition-colors placeholder:text-text-s"
              />
              {errors.confirmPassword && <span className="text-primary text-[12px]">{errors.confirmPassword.message}</span>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary text-text-p font-semibold text-[16px] rounded-[8px] py-4 hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="text-text-s text-[14px] text-center mt-6">
            Already have an account?{' '}
            <Link to="/login" state={{ from }} className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
