import { useState, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  CreditCard, 
  Tag, 
  Palette, 
  ArrowRight, 
  Check,
  Sun,
  Moon,
  Mail,
  SkipForward
} from 'lucide-react';
import { NewCardModal } from './NewCardModal';
import { NewCategoryModal } from './NewCategoryModal';
import { cn } from '@/lib/utils';

interface OnboardingWizardProps {
  open: boolean;
  onComplete: () => void;
}

type OnboardingStep = 'welcome' | 'card' | 'category' | 'theme' | 'complete';

const steps: { id: OnboardingStep; title: string; icon: React.ElementType }[] = [
  { id: 'welcome', title: 'Boas-vindas', icon: Sparkles },
  { id: 'card', title: 'Conta', icon: CreditCard },
  { id: 'category', title: 'Categorias', icon: Tag },
  { id: 'theme', title: 'Tema', icon: Palette },
];

export const OnboardingWizard = ({ open, onComplete }: OnboardingWizardProps) => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [cardCreated, setCardCreated] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const { theme, setTheme } = useTheme();

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  const nextStep = useCallback(() => {
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id);
    } else {
      setCurrentStep('complete');
    }
  }, [currentStep]);

  const handleCardSuccess = useCallback(() => {
    setCardCreated(true);
    setShowCardModal(false);
  }, []);

  const handleCategorySuccess = useCallback(() => {
    setShowCategoryModal(false);
  }, []);

  const handleFinish = useCallback(() => {
    onComplete();
  }, [onComplete]);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-accent/10 flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-accent" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Bem-vindo ao tMoney!</h2>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Prepare-se para gerenciar suas finanças de forma simples e intuitiva.
              </p>
            </div>
            <div className="space-y-3 text-left bg-muted/30 rounded-lg p-4">
              <p className="text-sm font-medium">Com o tMoney você pode:</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-accent flex-shrink-0" />
                  Acompanhar receitas e despesas em tempo real
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-accent flex-shrink-0" />
                  Gerenciar múltiplas contas e cartões
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-accent flex-shrink-0" />
                  Organizar gastos por categorias personalizadas
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-accent flex-shrink-0" />
                  Visualizar relatórios e gráficos detalhados
                </li>
              </ul>
            </div>
            <Button variant="accent" onClick={nextStep} className="w-full">
              Vamos começar
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        );

      case 'card':
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-accent/10 flex items-center justify-center">
              <CreditCard className="w-10 h-10 text-accent" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Cadastre sua primeira conta</h2>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Para começar, adicione uma conta bancária ou cartão. Isso permitirá registrar suas transações.
              </p>
            </div>

            {cardCreated ? (
              <div className="bg-accent/10 rounded-lg p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <Check className="w-5 h-5 text-accent" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-accent">Conta criada com sucesso!</p>
                  <p className="text-sm text-muted-foreground">Você pode adicionar mais contas depois.</p>
                </div>
              </div>
            ) : (
              <Button 
                variant="accent" 
                onClick={() => setShowCardModal(true)} 
                className="w-full"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Adicionar Conta
              </Button>
            )}

            <Button 
              variant={cardCreated ? "accent" : "outline"} 
              onClick={nextStep} 
              className="w-full"
              disabled={!cardCreated}
            >
              {cardCreated ? (
                <>
                  Continuar
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              ) : (
                'Crie uma conta para continuar'
              )}
            </Button>
          </div>
        );

      case 'category':
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-accent/10 flex items-center justify-center">
              <Tag className="w-10 h-10 text-accent" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Organize seus gastos</h2>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Crie categorias personalizadas para organizar suas transações e entender melhor para onde seu dinheiro está indo.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button 
                variant="accent" 
                onClick={() => setShowCategoryModal(true)} 
                className="w-full"
              >
                <Tag className="w-4 h-4 mr-2" />
                Criar Categoria
              </Button>

              <Button 
                variant="outline" 
                onClick={nextStep} 
                className="w-full"
              >
                <SkipForward className="w-4 h-4 mr-2" />
                Pular por enquanto
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Você pode criar categorias a qualquer momento no menu Categorias.
            </p>
          </div>
        );

      case 'theme':
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-accent/10 flex items-center justify-center">
              <Palette className="w-10 h-10 text-accent" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Escolha seu tema</h2>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Personalize sua experiência escolhendo o tema que mais combina com você.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setTheme('light')}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3",
                  theme === 'light' 
                    ? "border-accent bg-accent/5" 
                    : "border-border hover:border-accent/50"
                )}
              >
                <div className="w-14 h-14 rounded-full bg-background border border-border flex items-center justify-center shadow-sm">
                  <Sun className="w-7 h-7 text-accent" />
                </div>
                <span className="font-medium">Claro</span>
                {theme === 'light' && (
                  <Check className="w-5 h-5 text-accent" />
                )}
              </button>

              <button
                onClick={() => setTheme('dark')}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3",
                  theme === 'dark' 
                    ? "border-accent bg-accent/5" 
                    : "border-border hover:border-accent/50"
                )}
              >
                <div className="w-14 h-14 rounded-full bg-muted border border-border flex items-center justify-center">
                  <Moon className="w-7 h-7 text-accent" />
                </div>
                <span className="font-medium">Escuro</span>
                {theme === 'dark' && (
                  <Check className="w-5 h-5 text-accent" />
                )}
              </button>
            </div>

            <Button variant="accent" onClick={nextStep} className="w-full">
              Continuar
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-accent/10 flex items-center justify-center">
              <Check className="w-10 h-10 text-accent" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Tudo pronto!</h2>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Sua conta está configurada. Agora você pode começar a gerenciar suas finanças.
              </p>
            </div>

            <div className="bg-muted/30 rounded-lg p-4 flex items-start gap-3 text-left">
              <Mail className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Precisa de ajuda?</p>
                <p className="text-sm text-muted-foreground">
                  Entre em contato pelo email:{' '}
                  <a 
                    href="mailto:contato.tmoney@gmail.com" 
                    className="text-accent hover:underline"
                  >
                    contato.tmoney@gmail.com
                  </a>
                </p>
              </div>
            </div>

            <Button variant="accent" onClick={handleFinish} className="w-full">
              Começar a usar o tMoney
              <Sparkles className="w-4 h-4 ml-2" />
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={() => {}}>
        <DialogContent 
          className="sm:max-w-[480px] p-0 gap-0 overflow-hidden"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          {/* Progress Steps */}
          {currentStep !== 'complete' && (
            <div className="flex justify-center gap-2 px-6 pt-6">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-colors",
                    index <= currentStepIndex ? "bg-accent" : "bg-muted"
                  )}
                />
              ))}
            </div>
          )}

          {/* Content */}
          <div className="p-6 min-h-[400px] flex items-center">
            <AnimatePresence mode="wait" custom={1}>
              <motion.div
                key={currentStep}
                custom={1}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                className="w-full"
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </DialogContent>
      </Dialog>

      {/* Card Creation Modal */}
      <NewCardModal 
        open={showCardModal} 
        onOpenChange={setShowCardModal}
        onSuccess={handleCardSuccess}
      />

      {/* Category Creation Modal */}
      <NewCategoryModal
        open={showCategoryModal}
        onOpenChange={setShowCategoryModal}
        onSuccess={handleCategorySuccess}
      />
    </>
  );
};
