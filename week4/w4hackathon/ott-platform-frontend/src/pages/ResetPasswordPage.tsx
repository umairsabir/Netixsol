import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Play, CheckCircle } from 'lucide-react';
import api from '../lib/axios';

const schema = z.object({
  password: z.string()
    .min(8, 'Min. 8 characters')
    .regex(/\d/, 'Must contain a number')
    .regex(/[a-zA-Z]/, 'Must contain a letter'),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, { message: "Passwords don't match", path: ['confirm'] });

type FormData = z.infer<typeof schema>;

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    await api.post(`/auth/reset-password?token=${token}`, { password: data.password });
    setSuccess(true);
    setTimeout(() => navigate('/login'), 3000);
  };

  return (
    <div className="min-h-screen bg-bg-custom flex items-center justify-center px-4">
      <div className="w-full max-w-[480px]">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-text-p font-bold text-2xl">
            <Play fill="currentColor" className="text-primary w-8 h-8" />
            StreamVibe
          </Link>
          <h1 className="text-text-p text-[28px] font-bold mt-6">Reset password</h1>
        </div>

        <div className="bg-surface border border-border-darker rounded-[12px] p-8">
          {success ? (
            <div className="flex flex-col items-center gap-4 py-4">
              <CheckCircle size={56} className="text-green-500" />
              <p className="text-text-p text-[16px] font-semibold">Password reset!</p>
              <p className="text-text-s text-[14px]">Redirecting to sign in…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-text-p text-[14px] font-medium">New password</label>
                <input {...register('password')} type="password" placeholder="Min. 8 chars"
                  className="bg-bg-custom border border-border-darker rounded-[8px] px-4 py-3 text-text-p text-[14px] outline-none focus:border-primary transition-colors placeholder:text-text-s" />
                {errors.password && <span className="text-primary text-[12px]">{errors.password.message}</span>}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-text-p text-[14px] font-medium">Confirm password</label>
                <input {...register('confirm')} type="password" placeholder="••••••••"
                  className="bg-bg-custom border border-border-darker rounded-[8px] px-4 py-3 text-text-p text-[14px] outline-none focus:border-primary transition-colors placeholder:text-text-s" />
                {errors.confirm && <span className="text-primary text-[12px]">{errors.confirm.message}</span>}
              </div>
              <button type="submit" disabled={isSubmitting}
                className="bg-primary text-text-p font-semibold text-[16px] rounded-[8px] py-4 hover:bg-red-700 transition-colors disabled:opacity-60">
                {isSubmitting ? 'Resetting…' : 'Reset Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
