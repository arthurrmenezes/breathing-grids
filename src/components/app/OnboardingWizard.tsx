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
  SkipForward,
  Loader2,
  ShoppingCart,
  Car,
  Utensils,
  Film,
  Home,
  Heart,
  GraduationCap,
  Briefcase
} from 'lucide-react';
import { NewCardModal } from './NewCardModal';
import { NewCategoryModal } from './NewCategoryModal';
import { categoryService } from '@/services/categoryService';
import { CategoryTypeEnum } from '@/types/category';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Suggested categories with icons and types
const suggestedCategories = [
  { name: 'Mercado', icon: ShoppingCart, type: CategoryTypeEnum.Despesa },
  { name: 'Transporte', icon: Car, type: CategoryTypeEnum.Despesa },
  { name: 'Alimentação', icon: Utensils, type: CategoryTypeEnum.Despesa },
  { name: 'Lazer', icon: Film, type: CategoryTypeEnum.Despesa },
  { name: 'Moradia', icon: Home, type: CategoryTypeEnum.Despesa },
  { name: 'Saúde', icon: Heart, type: CategoryTypeEnum.Despesa },
  { name: 'Educação', icon: GraduationCap, type: CategoryTypeEnum.Ambos },
  { name: 'Salário', icon: Briefcase, type: CategoryTypeEnum.Receita },
];

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
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [creatingCategories, setCreatingCategories] = useState(false);
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

  const toggleCategory = (name: string) => {
    setSelectedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(name)) {
        newSet.delete(name);
      } else {
        newSet.add(name);
      }
      return newSet;
    });
  };

  const handleCreateSelectedCategories = async () => {
    if (selectedCategories.size === 0) {
      nextStep();
      return;
    }

    setCreatingCategories(true);
    try {
      const categoriesToCreate = suggestedCategories.filter(c => selectedCategories.has(c.name));
      
      // Create categories in parallel
      const results = await Promise.all(
        categoriesToCreate.map(cat => 
          categoryService.create({ title: cat.name, type: cat.type })
        )
      );

      const successCount = results.filter(r => !r.error).length;
      const failCount = results.filter(r => r.error).length;

      if (successCount > 0) {
        toast.success(`${successCount} categoria${successCount > 1 ? 's' : ''} criada${successCount > 1 ? 's' : ''} com sucesso!`);
      }
      if (failCount > 0) {
        toast.error(`${failCount} categoria${failCount > 1 ? 's' : ''} não ${failCount > 1 ? 'puderam' : 'pôde'} ser criada${failCount > 1 ? 's' : ''}`);
      }

      nextStep();
    } catch (error) {
      toast.error('Erro ao criar categorias');
    } finally {
      setCreatingCategories(false);
    }
  };

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
          <div className="text-center space-y-5">
            <div className="w-16 h-16 mx-auto rounded-full bg-accent/10 flex items-center justify-center">
              <Tag className="w-8 h-8 text-accent" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold">Organize seus gastos</h2>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Selecione categorias sugeridas ou crie as suas próprias.
              </p>
            </div>

            {/* Suggested Categories Grid */}
            <div className="grid grid-cols-2 gap-2">
              {suggestedCategories.map((category) => {
                const Icon = category.icon;
                const isSelected = selectedCategories.has(category.name);
                return (
                  <button
                    key={category.name}
                    onClick={() => toggleCategory(category.name)}
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-lg border transition-all text-left",
                      isSelected 
                        ? "border-accent bg-accent/10 text-accent" 
                        : "border-border hover:border-accent/50"
                    )}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm font-medium truncate">{category.name}</span>
                    {isSelected && <Check className="w-4 h-4 ml-auto flex-shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-2">
              <Button 
                variant="accent" 
                onClick={handleCreateSelectedCategories}
                disabled={creatingCategories}
                className="w-full"
              >
                {creatingCategories ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : selectedCategories.size > 0 ? (
                  <>
                    Criar {selectedCategories.size} categoria{selectedCategories.size > 1 ? 's' : ''}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    Continuar sem categorias
                    <SkipForward className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>

              <Button 
                variant="ghost" 
                onClick={() => setShowCategoryModal(true)} 
                className="w-full text-muted-foreground"
                size="sm"
              >
                <Tag className="w-4 h-4 mr-2" />
                Criar categoria personalizada
              </Button>
            </div>
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
