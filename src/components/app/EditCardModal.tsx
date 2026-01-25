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
import { Card, BankCardColors, saveCardColor, getCardColorIndex } from '@/types/card';
import { 
  validateCard, 
  validateCreditCard,
  getFirstValidationError,
  getFieldError,
  hasFieldError,
  ValidationError 
} from '@/lib/validation';
import { cn } from '@/lib/utils';

interface EditCardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  card: Card | null;
}

export const EditCardModal = ({ open, onOpenChange, onSuccess, card }: EditCardModalProps) => {
  const [name, setName] = useState('');
  const [limit, setLimit] = useState('');
  const [closeDay, setCloseDay] = useState('');
  const [dueDay, setDueDay] = useState('');
  const [selectedColor, setSelectedColor] = useState(0);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  // Load card data when opened
  useEffect(() => {
    if (card && open) {
      setName(card.name);
      if (card.creditCard) {
        setLimit(card.creditCard.limit.toString());
        setCloseDay(card.creditCard.closeDay.toString());
        setDueDay(card.creditCard.dueDay.toString());
      }
      // Get saved color index for this card
      setSelectedColor(getCardColorIndex(card.id, card.name));
    }
  }, [card, open]);

  // Clear validation errors when fields change
  useEffect(() => {
    setValidationErrors([]);
  }, [name, limit, closeDay, dueDay]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!card) return;
    
    if (!name) {
      toast.error('O nome do cartão é obrigatório');
      return;
    }

    const isCreditCard = card.type === 'CreditCard';
    const cardTypeNum = isCreditCard ? 1 : 0;

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
      };

      if (isCreditCard) {
        payload.creditCard = {
          limit: parseFloat(limit),
          closeDay: parseInt(closeDay, 10),
          dueDay: parseInt(dueDay, 10),
        };
      }

      const response = await cardService.update(card.id, payload);

      if (response.error) {
        toast.error(response.error);
      } else {
        // Save the selected color for this card
        saveCardColor(card.id, selectedColor);
        toast.success('Cartão atualizado com sucesso');
        onOpenChange(false);
        onSuccess?.();
      }
    } catch (error) {
      toast.error('Erro ao atualizar cartão');
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

  const isCreditCard = card?.type === 'CreditCard';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Cartão</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Nome do Cartão */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-card-name">Nome do Cartão <span className="text-destructive">*</span></Label>
            <Input
              id="edit-card-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Nubank Crédito"
              required
              disabled={loading}
              maxLength={50}
              className={hasError('name') ? 'border-destructive' : ''}
            />
            {getInputError('name') && (
              <p className="text-xs text-destructive">{getInputError('name')}</p>
            )}
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
                <Label htmlFor="edit-limit">Limite <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                  <Input
                    id="edit-limit"
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
                  <Label htmlFor="edit-closeDay">Dia de Fechamento <span className="text-destructive">*</span></Label>
                  <Input
                    id="edit-closeDay"
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
                  <Label htmlFor="edit-dueDay">Dia de Vencimento <span className="text-destructive">*</span></Label>
                  <Input
                    id="edit-dueDay"
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
              Salvar Alterações
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
