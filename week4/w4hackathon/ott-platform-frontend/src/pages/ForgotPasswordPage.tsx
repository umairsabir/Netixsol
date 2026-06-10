import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Play, CheckCircle } from 'lucide-react';
import api from '../lib/axios';

const schema = z.object({ email: z.string().email('Invalid email address') });
type FormData = z.infer<typeof schema>;

const ForgotPasswordPage: React.FC = () => {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await api.post('/auth/forgot-password', { email: data.email });
      setSent(true);
    } catch {
      setSent(true); // show success even on error to avoid email enumeration
    }
  };

  return (
    <div className="min-h-screen bg-bg-custom flex items-center justify-center px-4">
      <div className="w-full max-w-[480px]">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-text-p font-bold text-2xl">
            <Play fill="currentColor" className="text-primary w-8 h-8" />
            StreamVibe
          </Link>
          <h1 className="text-text-p text-[28px] font-bold mt-6">Forgot password?</h1>
          <p className="text-text-s text-[14px] mt-2">Enter your email and we'll send a reset link</p>
        </div>

        <div className="bg-surface border border-border-darker rounded-[12px] p-8">
          {sent ? (
            <div className="flex flex-col items-center gap-4 py-4">
              <CheckCircle size={56} className="text-green-500" />
              <p className="text-text-p text-[16px] font-semibold text-center">Check your email</p>
              <p className="text-text-s text-[14px] text-center">If an account with that email exists, you'll receive a reset link shortly.</p>
              <Link to="/login" className="text-primary hover:underline text-[14px] mt-2">Back to sign in</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-text-p text-[14px] font-medium">Email address</label>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="you@example.com"
                  className="bg-bg-custom border border-border-darker rounded-[8px] px-4 py-3 text-text-p text-[14px] outline-none focus:border-primary transition-colors placeholder:text-text-s"
                />
                {errors.email && <span className="text-primary text-[12px]">{errors.email.message}</span>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary text-text-p font-semibold text-[16px] rounded-[8px] py-4 hover:bg-red-700 transition-colors disabled:opacity-60"
              >
                {isSubmitting ? 'Sending…' : 'Send Reset Link'}
              </button>

              <p className="text-center text-text-s text-[13px]">
                <Link to="/login" className="text-primary hover:underline">Back to sign in</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
