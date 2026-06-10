import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';

const PricingSection: React.FC = () => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const { data } = await api.get('/subscriptions/plans');
      return data;
    },
  });

  return (
    <section className="w-full mt-[100px] md:mt-[150px]">
      <div className="w-full max-w-[1920px] mx-auto px-[15px] laptop:px-[80px] desktop:px-[162px]">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 md:mb-[80px]">
          <div className="flex flex-col max-w-[900px]">
            <h2 className="text-[28px] md:text-[38px] font-bold text-text-p mb-3">Choose the plan that's right for you</h2>
            <p className="text-[14px] md:text-[18px] text-text-s font-normal">Join StreamVibe and select from our flexible subscription options tailored to suit your viewing preferences. Get ready for non-stop entertainment!</p>
          </div>
          
          {/* Toggle */}
          <div className="flex items-center bg-bg-custom border border-border-custom rounded-[12px] p-2 mt-6 md:mt-0">
            <button 
              className={`px-6 py-3 rounded-[10px] text-[16px] font-semibold transition-colors ${billingCycle === 'monthly' ? 'bg-surface text-text-p' : 'text-text-s hover:text-text-p'}`}
              onClick={() => setBillingCycle('monthly')}
            >
              Monthly
            </button>
            <button 
              className={`px-6 py-3 rounded-[10px] text-[16px] font-semibold transition-colors ${billingCycle === 'yearly' ? 'bg-surface text-text-p' : 'text-text-s hover:text-text-p'}`}
              onClick={() => setBillingCycle('yearly')}
            >
              Yearly
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-[30px]">
          {isLoading ? (
             [...Array(3)].map((_, i) => (
                <div key={i} className="bg-surface border border-border-custom rounded-[12px] p-8 lg:p-12 min-h-[400px] animate-pulse">
                  <div className="h-8 bg-border-custom rounded-md w-1/2 mb-4" />
                  <div className="h-20 bg-border-custom rounded-md w-full mb-8" />
                  <div className="h-12 bg-border-custom rounded-md w-2/3 mb-8" />
                  <div className="flex gap-4">
                    <div className="h-12 bg-border-custom rounded-md flex-1" />
                    <div className="h-12 bg-border-custom rounded-md flex-1" />
                  </div>
                </div>
             ))
          ) : plans.map((plan: any, idx: number) => (
            <div key={plan.id || idx} className="bg-surface border border-border-custom rounded-[12px] p-8 lg:p-12 flex flex-col justify-between">
              <div>
                <h3 className="text-[24px] font-semibold text-text-p mb-4">{plan.name}</h3>
                <p className="text-[16px] text-text-s font-normal mb-8 leading-[150%] h-[100px] overflow-hidden">
                  {plan.description || (plan.features && plan.features.join(' • ')) || 'Enjoy an extensive library of movies and shows.'}
                </p>
                <div className="text-[40px] font-bold text-text-p mb-8 border-t border-border-custom pt-8">
                  ${billingCycle === 'yearly' ? (plan.price * 10).toFixed(2) : plan.price}
                  <span className="text-[16px] text-text-s font-medium">/{billingCycle === 'yearly' ? 'year' : 'month'}</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full">
                <button 
                  onClick={() => navigate('/register')}
                  className="flex-1 px-4 py-4 bg-bg-custom border border-border-custom text-text-p rounded-[8px] font-semibold hover:bg-border-custom transition-colors"
                >Free Trial</button>
                <button 
                  onClick={() => navigate('/plans')}
                  className="flex-1 px-4 py-4 bg-primary text-text-p rounded-[8px] font-semibold hover:bg-red-700 transition-colors"
                >Choose Plan</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
