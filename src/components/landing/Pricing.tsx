import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const plans = [
  {
    name: 'Grátis',
    description: 'Para começar',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      'Conectar 2 contas bancárias',
      'Rastreamento básico de transações',
      'Histórico de 30 dias',
      'Resumos mensais',
      'Acesso ao app mobile',
    ],
    cta: 'Começar Grátis',
    highlighted: false,
  },
  {
    name: 'Pro',
    description: 'Para controle total',
    monthlyPrice: 29,
    yearlyPrice: 23,
    features: [
      'Contas bancárias ilimitadas',
      'Categorização com IA',
      'Histórico ilimitado',
      'Análises avançadas',
      'Detecção de recorrentes',
      'Acompanhamento de metas',
      'Exportar para CSV/PDF',
      'Suporte prioritário',
    ],
    cta: 'Iniciar Teste Grátis',
    highlighted: true,
  },
  {
    name: 'Família',
    description: 'Para o lar',
    monthlyPrice: 49,
    yearlyPrice: 39,
    features: [
      'Tudo do Pro',
      'Até 5 membros da família',
      'Orçamentos compartilhados',
      'Painel familiar',
      'Controles parentais',
      'Gestão de mesada',
      'Suporte dedicado',
    ],
    cta: 'Iniciar Teste Grátis',
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
            Preços
          </span>
          <h2 className="text-h1 mb-4">
            Preços simples e transparentes
          </h2>
          <p className="text-body-lg text-muted-foreground">
            Comece grátis, faça upgrade quando quiser. Sem taxas ocultas, nunca.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span className={`text-sm font-medium transition-colors ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
            Mensal
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
            Anual
          </span>
          {isYearly && (
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-success/10 text-success">
              Economize 20%
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
                  ? 'border-accent shadow-green-glow scale-105 z-10' 
                  : 'border-border shadow-card hover:shadow-card-hover'
                }
              `}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium">
                    Mais Popular
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
                  <span className="text-muted-foreground">/mês</span>
                </div>
                {isYearly && plan.monthlyPrice > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Cobrado anualmente (R$ {plan.yearlyPrice * 12}/ano)
                  </p>
                )}
              </div>

              <Link to="/cadastro">
                <Button 
                  variant={plan.highlighted ? 'accent' : 'outline'}
                  className="w-full mb-8"
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </Link>

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
          Todos os planos incluem 14 dias de teste grátis. Não precisa de cartão de crédito.
        </p>
      </div>
    </section>
  );
};