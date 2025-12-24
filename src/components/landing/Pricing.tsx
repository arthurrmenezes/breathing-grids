import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    description: 'For getting started',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      'Connect 2 bank accounts',
      'Basic transaction tracking',
      '30-day history',
      'Monthly summaries',
      'Mobile app access',
    ],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Pro',
    description: 'For total control',
    monthlyPrice: 29,
    yearlyPrice: 23,
    features: [
      'Unlimited bank accounts',
      'AI-powered categorization',
      'Unlimited history',
      'Advanced analytics',
      'Recurring detection',
      'Goal tracking',
      'Export to CSV/PDF',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    highlighted: true,
  },
  {
    name: 'Family',
    description: 'For the household',
    monthlyPrice: 49,
    yearlyPrice: 39,
    features: [
      'Everything in Pro',
      'Up to 5 family members',
      'Shared budgets',
      'Family dashboard',
      'Parental controls',
      'Allowance management',
      'Dedicated support',
    ],
    cta: 'Start Free Trial',
    highlighted: false,
  },
];

export const Pricing = () => {
  const [isYearly, setIsYearly] = useState(true);

  return (
    <section id="pricing" className="py-24 lg:py-32 bg-secondary/30 relative">
      <div className="absolute inset-0 grid-pattern opacity-10" />
      
      <div className="container relative mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-micro uppercase tracking-widest text-accent mb-4 block">
            Pricing
          </span>
          <h2 className="text-h1 mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-body-lg text-muted-foreground">
            Start free, upgrade when you're ready. No hidden fees, ever.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span className={`text-sm font-medium transition-colors ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
            Monthly
          </span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className="relative w-14 h-8 rounded-full bg-accent/20 p-1 transition-colors hover:bg-accent/30"
          >
            <div 
              className={`
                w-6 h-6 rounded-full bg-accent shadow-lg 
                transition-transform duration-300 ease-out
                ${isYearly ? 'translate-x-6' : 'translate-x-0'}
              `}
            />
          </button>
          <span className={`text-sm font-medium transition-colors ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
            Yearly
          </span>
          {isYearly && (
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-success/10 text-success">
              Save 20%
            </span>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`
                relative bg-surface rounded-2xl border p-8
                transition-all duration-300
                ${plan.highlighted 
                  ? 'border-accent shadow-purple-glow scale-105 z-10' 
                  : 'border-border shadow-card hover:shadow-card-hover'
                }
              `}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-h3 mb-1">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-semibold tabular-nums">
                    R$ {isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                  </span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                {isYearly && plan.monthlyPrice > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Billed annually (R$ {plan.yearlyPrice * 12}/year)
                  </p>
                )}
              </div>

              <Button 
                variant={plan.highlighted ? 'accent' : 'outline'}
                className="w-full mb-8"
                size="lg"
              >
                {plan.cta}
              </Button>

              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-success" />
                    </div>
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Trust Note */}
        <p className="text-center text-sm text-muted-foreground mt-12">
          All plans include a 14-day free trial. No credit card required.
        </p>
      </div>
    </section>
  );
};
