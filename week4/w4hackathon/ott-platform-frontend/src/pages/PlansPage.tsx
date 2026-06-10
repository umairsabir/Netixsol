import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, CreditCard, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/axios';

const cardSchema = z.object({
  cardNumber: z.string().regex(/^\d{16}$/, '16 digit card number required'),
  cardHolderName: z.string().min(2, 'Name required'),
  expiry: z.string().regex(/^\d{2}\/\d{2}$/, 'Format MM/YY'),
  cvv: z.string().regex(/^\d{3,4}$/, '3-4 digit CVV'),
});
type CardForm = z.infer<typeof cardSchema>;

interface Plan {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  features: string[];
}

const PlansPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [phase, setPhase] = useState<'select' | 'payment' | 'success'>('select');

  const { data: plansData = [], isLoading: plansLoading } = useQuery<Plan[]>({
    queryKey: ['plans'],
    queryFn: async () => {
      const { data } = await api.get('/subscriptions/plans');
      return data;
    },
  });

  const { data: subData, isLoading: subLoading, refetch: refetchSub } = useQuery({
    queryKey: ['mySubscription'],
    queryFn: async () => {
      const { data } = await api.get('/subscriptions/me');
      return data;
    },
    enabled: isAuthenticated,
  });

  const { register, handleSubmit, formState: { errors } } = useForm<CardForm>({
    resolver: zodResolver(cardSchema),
  });

  const subscribeMutation = useMutation({
    mutationFn: async (data: CardForm) => {
      const res = await api.post('/subscriptions/activate', {
        planId: selectedPlan!.id,
        ...data,
      });
      return res.data;
    },
    onSuccess: () => {
      refetchSub();
      setPhase('success');
    },
  });

  const handleSelectPlan = (plan: Plan) => {
    if (!isAuthenticated) { navigate('/login', { state: { from: '/plans' } }); return; }
    if (plan.id === 'free') return;
    setSelectedPlan(plan);
    setPhase('payment');
  };

  const activePlanId = subData?.subscription?.isActive 
    ? (subData.subscription.planId?._id || subData.subscription.planId?.id)
    : (isAuthenticated ? 'free' : null);

  const freePlan: Plan = {
    id: 'free',
    name: 'Free',
    price: 0,
    durationDays: 0,
    features: ['Ad-Supported Content', 'Standard Quality', '720p Resolution', '1 Device', 'Free-Tier Library Access'],
  };

  const allPlans = [freePlan, ...plansData];
  const colors = [
    'from-gray-900/40 to-gray-800/20', 
    'from-blue-900/40 to-blue-800/20', 
    'from-primary/30 to-red-800/20', 
    'from-purple-900/40 to-purple-800/20'
  ];

  const isLoading = plansLoading || (isAuthenticated && subLoading);

  return (
    <div className="min-h-screen bg-bg-custom px-[15px] laptop:px-[80px] desktop:px-[162px] py-[80px]">
      <div className="max-w-[1240px] mx-auto">

        {phase === 'success' ? (
          <div className="flex flex-col items-center justify-center gap-6 py-32 text-center">
            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center">
              <Check size={48} className="text-green-400" />
            </div>
            <h2 className="text-text-p text-[32px] font-bold">You're all set!</h2>
            <p className="text-text-s text-[16px]">Your subscription is now active. Start watching your favorite content now.</p>
            <button onClick={() => navigate('/')} className="bg-primary text-text-p font-semibold px-8 py-4 rounded-[8px] hover:bg-red-700 transition-colors">
              Start Watching
            </button>
          </div>
        ) : phase === 'payment' && selectedPlan ? (
          <div className="max-w-[500px] mx-auto">
            <button onClick={() => setPhase('select')} className="text-text-s text-[14px] mb-6 hover:text-text-p transition-colors flex items-center gap-2">
              ← Back to plans
            </button>
            <div className="bg-surface border border-border-darker rounded-[12px] p-8">
              <h2 className="text-text-p text-[24px] font-bold mb-2">Complete your purchase</h2>
              <p className="text-text-s text-[14px] mb-6">
                You've selected the <span className="text-text-p font-semibold">{selectedPlan.name}</span> plan — <span className="text-primary font-semibold">${selectedPlan.price}/month</span>
              </p>
              
              <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-[8px] px-4 py-3 mb-6">
                <Shield size={16} className="text-primary" />
                <span className="text-text-s text-[13px]">This is a simulated payment for demo purposes only.</span>
              </div>

              {subscribeMutation.isError && (
                <div className="bg-red-900/30 border border-primary text-primary text-sm rounded-[8px] px-4 py-3 mb-4">
                  {(subscribeMutation.error as any)?.response?.data?.message || 'Payment failed. Please check your details and try again.'}
                </div>
              )}

              <form onSubmit={handleSubmit((d) => subscribeMutation.mutate(d))} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-text-p text-[14px] font-medium flex items-center gap-2">
                    <CreditCard size={16} /> Card Number
                  </label>
                  <input {...register('cardNumber')} placeholder="1234 5678 1234 5678" maxLength={16}
                    className="bg-bg-custom border border-border-darker rounded-[8px] px-4 py-3 text-text-p text-[14px] outline-none focus:border-primary transition-colors placeholder:text-text-s w-full" 
                  />
                  {errors.cardNumber && <span className="text-primary text-[12px]">{errors.cardNumber.message}</span>}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-text-p text-[14px] font-medium">Cardholder Name</label>
                  <input {...register('cardHolderName')} placeholder="Full Name on Card"
                    className="bg-bg-custom border border-border-darker rounded-[8px] px-4 py-3 text-text-p text-[14px] outline-none focus:border-primary transition-colors placeholder:text-text-s w-full" 
                  />
                  {errors.cardHolderName && <span className="text-primary text-[12px]">{errors.cardHolderName.message}</span>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-text-p text-[14px] font-medium">Expiry</label>
                    <input {...register('expiry')} placeholder="MM/YY" maxLength={5}
                      className="bg-bg-custom border border-border-darker rounded-[8px] px-4 py-3 text-text-p text-[14px] outline-none focus:border-primary transition-colors placeholder:text-text-s w-full" 
                    />
                    {errors.expiry && <span className="text-primary text-[12px]">{errors.expiry.message}</span>}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-text-p text-[14px] font-medium">CVV</label>
                    <input {...register('cvv')} type="password" placeholder="•••" maxLength={4}
                      className="bg-bg-custom border border-border-darker rounded-[8px] px-4 py-3 text-text-p text-[14px] outline-none focus:border-primary transition-colors placeholder:text-text-s w-full" 
                    />
                    {errors.cvv && <span className="text-primary text-[12px]">{errors.cvv.message}</span>}
                  </div>
                </div>

                <button type="submit" disabled={subscribeMutation.isPending}
                  className="bg-primary text-text-p font-semibold text-[16px] rounded-[8px] py-4 hover:bg-red-700 transition-colors disabled:opacity-60 mt-2">
                  {subscribeMutation.isPending ? 'Processing Payment…' : `Pay $${selectedPlan.price}`}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-16">
              <h1 className="text-text-p text-[38px] md:text-[48px] font-bold tracking-tight">Choose the plan that's right for you</h1>
              <p className="text-text-s text-[16px] md:text-[18px] mt-4 max-w-[700px] mx-auto">
                Join StreamVibe and select from our flexible pricing options. Everything you love, at a price that fits.
              </p>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-32">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {allPlans.map((plan, i) => {
                  const isActive = activePlanId === plan.id;
                  return (
                    <div key={plan.id}
                      className={`relative bg-gradient-to-b ${colors[i % 4]} border ${isActive ? 'border-primary shadow-[0_0_25px_rgba(229,8,21,0.25)] ring-1 ring-primary' : 'border-border-darker'} rounded-[16px] p-8 flex flex-col gap-8 hover:border-primary/40 transition-all transform hover:-translate-y-2`}>
                      
                      {isActive && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-text-p text-[10px] sm:text-[11px] font-bold uppercase px-4 py-1.5 rounded-full border border-bg-custom whitespace-nowrap z-10">
                          Active Membership
                        </div>
                      )}

                      <div className="flex flex-col items-start gap-2">
                        <h3 className="text-text-p text-[24px] font-bold">{plan.name}</h3>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-primary text-[36px] font-bold">${plan.price}</span>
                          <span className="text-text-s text-[14px]">{plan.id === 'free' ? '' : '/month'}</span>
                        </div>
                        {plan.id !== 'free' && <p className="text-text-s text-[13px]">{plan.durationDays}-day billing cycle</p>}
                        {plan.id === 'free' && <p className="text-text-s text-[13px]">Lifetime access to free content</p>}
                      </div>

                      <div className="h-[1px] w-full bg-border-darker" />

                      <ul className="flex flex-col gap-4 flex-1">
                        {plan.features.map((f, fi) => (
                          <li key={fi} className="flex items-start gap-3">
                            <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Check size={12} className="text-primary" />
                            </div>
                            <span className="text-text-s text-[14px] leading-tight">{f}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <button
                        onClick={() => handleSelectPlan(plan)}
                        disabled={isActive || plan.id === 'free'}
                        className={`w-full font-bold text-[16px] rounded-[10px] py-4 transition-all duration-300 ${
                          isActive 
                          ? 'bg-green-500/10 text-green-400 border border-green-500/30 cursor-default' 
                          : plan.id === 'free'
                            ? 'bg-surface text-text-s border border-border-darker cursor-default opacity-80'
                            : 'bg-primary text-text-p hover:bg-red-700 hover:shadow-lg active:scale-[0.98]'
                        }`}
                      >
                        {isActive ? 'Current Plan' : plan.id === 'free' ? 'Included' : 'Get Started'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            
            <div className="mt-20 bg-surface border border-border-darker rounded-[16px] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
               <div className="max-w-[600px]">
                  <h2 className="text-text-p text-[24px] md:text-[28px] font-bold">Frequently asked about our plans?</h2>
                  <p className="text-text-s text-[16px] mt-2">Discover how we help thousands of users enjoy the best streaming experience every day.</p>
               </div>
               <button onClick={() => navigate('/support')} className="bg-bg-custom border border-border-darker text-text-p px-8 py-4 rounded-[10px] font-semibold hover:border-primary transition-colors whitespace-nowrap">
                  Contact Support
               </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PlansPage;
