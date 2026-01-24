import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cardService } from '@/services/cardService';
import { CardTypeEnum, CardTypeOptions, BankCardColors } from '@/types/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  validateCard, 
  validateCreditCard,
  getFirstValidationError,
  getFieldError,
  hasFieldError,
  ValidationError 
} from '@/lib/validation';
import { cn } from '@/lib/utils';

interface NewCardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const NewCardModal = ({ open, onOpenChange, onSuccess }: NewCardModalProps) => {
  const [name, setName] = useState('');
  const [cardType, setCardType] = useState<string>('');
  const [limit, setLimit] = useState('');
  const [closeDay, setCloseDay] = useState('');
  const [dueDay, setDueDay] = useState('');
  const [selectedColor, setSelectedColor] = useState(0);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  // Clear validation errors when fields change
  useEffect(() => {
    setValidationErrors([]);
  }, [name, cardType, limit, closeDay, dueDay]);

  const resetForm = () => {
    setName('');
    setCardType('');
    setLimit('');
    setCloseDay('');
    setDueDay('');
    setSelectedColor(0);
    setValidationErrors([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !cardType) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const cardTypeNum = parseInt(cardType, 10);
    const isCreditCard = cardTypeNum === CardTypeEnum.CreditCard;

    // Validate card
    const cardErrors = validateCard({
      name: name.trim(),
      cardType: cardTypeNum,
      limit: isCreditCard ? parseFloat(limit) || 0 : undefined,
      closeDay: isCreditCard ? parseInt(closeDay, 10) || 0 : undefined,
      dueDay: isCreditCard ? parseInt(dueDay, 10) || 0 : undefined,
    });

    // Additional credit card validation
    if (isCreditCard) {
      const creditCardErrors = validateCreditCard(
        parseFloat(limit) || 0,
        parseInt(closeDay, 10) || 0,
        parseInt(dueDay, 10) || 0
      );
      cardErrors.push(...creditCardErrors);
    }

    if (cardErrors.length > 0) {
      setValidationErrors(cardErrors);
      const firstError = getFirstValidationError(cardErrors);
      if (firstError) {
        toast.error(firstError);
      }
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        name: name.trim(),
        cardType: cardTypeNum,
      };

      if (isCreditCard) {
        payload.creditCard = {
          limit: parseFloat(limit),
          closeDay: parseInt(closeDay, 10),
          dueDay: parseInt(dueDay, 10),
        };
      }

      const response = await cardService.create(payload);

      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success('Cartão criado com sucesso');
        resetForm();
        onOpenChange(false);
        onSuccess?.();
      }
    } catch (error) {
      toast.error('Erro ao criar cartão');
    } finally {
      setLoading(false);
    }
  };

  const getInputError = (field: string): string | undefined => {
    return getFieldError(validationErrors, field) || undefined;
  };

  const hasError = (field: string): boolean => {
    return hasFieldError(validationErrors, field);
  };

  const isCreditCard = cardType === CardTypeEnum.CreditCard.toString();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Cartão</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Nome do Cartão */}
          <div className="space-y-1.5">
            <Label htmlFor="card-name">Nome do Cartão <span className="text-destructive">*</span></Label>
            <Input
              id="card-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Itaú Débito"
              required
              disabled={loading}
              maxLength={50}
              className={hasError('name') ? 'border-destructive' : ''}
            />
            {getInputError('name') && (
              <p className="text-xs text-destructive">{getInputError('name')}</p>
            )}
          </div>

          {/* Tipo do Cartão */}
          <div className="space-y-1.5">
            <Label>Tipo do Cartão <span className="text-destructive">*</span></Label>
            <Select value={cardType} onValueChange={setCardType} required disabled={loading}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {CardTypeOptions.map((type) => (
                  <SelectItem key={type.value} value={type.value.toString()}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cor do Cartão */}
          <div className="space-y-1.5">
            <Label>Cor do Cartão</Label>
            <div className="flex flex-wrap gap-2">
              {BankCardColors.map((color, index) => (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => setSelectedColor(index)}
                  className={cn(
                    "w-8 h-8 rounded-full transition-all",
                    `bg-gradient-to-br ${color.color}`,
                    selectedColor === index && "ring-2 ring-accent ring-offset-2 ring-offset-background"
                  )}
                  title={color.name}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {BankCardColors[selectedColor].name}
            </p>
          </div>

          {/* Credit Card Fields */}
          {isCreditCard && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="limit">Limite <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                  <Input
                    id="limit"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={limit}
                    onChange={(e) => setLimit(e.target.value)}
                    className={`pl-8 ${hasError('limit') ? 'border-destructive' : ''}`}
                    placeholder="0,00"
                    required={isCreditCard}
                    disabled={loading}
                  />
                </div>
                {getInputError('limit') && (
                  <p className="text-xs text-destructive">{getInputError('limit')}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="closeDay">Dia de Fechamento <span className="text-destructive">*</span></Label>
                  <Input
                    id="closeDay"
                    type="number"
                    min="1"
                    max="31"
                    value={closeDay}
                    onChange={(e) => setCloseDay(e.target.value)}
                    className={hasError('closeDay') ? 'border-destructive' : ''}
                    placeholder="Ex: 15"
                    required={isCreditCard}
                    disabled={loading}
                  />
                  {getInputError('closeDay') && (
                    <p className="text-xs text-destructive">{getInputError('closeDay')}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="dueDay">Dia de Vencimento <span className="text-destructive">*</span></Label>
                  <Input
                    id="dueDay"
                    type="number"
                    min="1"
                    max="31"
                    value={dueDay}
                    onChange={(e) => setDueDay(e.target.value)}
                    className={hasError('dueDay') ? 'border-destructive' : ''}
                    placeholder="Ex: 22"
                    required={isCreditCard}
                    disabled={loading}
                  />
                  {getInputError('dueDay') && (
                    <p className="text-xs text-destructive">{getInputError('dueDay')}</p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" variant="accent" className="flex-1" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Criar Cartão
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
