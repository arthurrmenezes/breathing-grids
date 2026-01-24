import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { transactionService } from '@/services/transactionService';
import { 
  TransactionTypeEnum, 
  PaymentStatusEnum,
  AllPaymentMethodOptions,
  CreditCardPaymentMethodOptions,
  DebitCardPaymentMethodOptions,
  PaymentMethodEnum,
} from '@/types/transaction';
import { Category, CategoryTypeLabels } from '@/types/category';
import { Card, CardTypeLabels } from '@/types/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from '@/components/ui/switch';
import { 
  validateTransaction, 
  validateInstallment, 
  getFirstValidationError,
  getFieldError,
  hasFieldError,
  ValidationError 
} from '@/lib/validation';

interface NewTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  categories?: Category[];
  cards?: Card[];
  preselectedCardId?: string;
}

export const NewTransactionModal = ({ 
  open, 
  onOpenChange, 
  onSuccess, 
  categories = [],
  cards = [],
  preselectedCardId,
}: NewTransactionModalProps) => {
  const [title, setTitle] = useState('');
  const [rawValue, setRawValue] = useState(0);
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');
  const [cardId, setCardId] = useState('');
  const [type, setType] = useState('');
  const [payment, setPayment] = useState('');
  const [status, setStatus] = useState('');
  const [destination, setDestination] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  
  // Installment fields
  const [hasInstallment, setHasInstallment] = useState(false);
  const [totalInstallments, setTotalInstallments] = useState('');

  // Set preselected card when modal opens
  useEffect(() => {
    if (open && preselectedCardId) {
      setCardId(preselectedCardId);
    }
  }, [open, preselectedCardId]);

  // Get selected card
  const selectedCard = useMemo(() => {
    return cards.find(c => c.id === cardId);
  }, [cards, cardId]);

  // Get payment method options based on selected card type
  const paymentMethodOptions = useMemo(() => {
    if (!selectedCard) return AllPaymentMethodOptions;
    
    if (selectedCard.type === 'CreditCard') {
      return CreditCardPaymentMethodOptions;
    } else {
      return DebitCardPaymentMethodOptions;
    }
  }, [selectedCard]);

  // Reset payment method when card changes
  useEffect(() => {
    if (selectedCard) {
      if (selectedCard.type === 'CreditCard') {
        setPayment(PaymentMethodEnum.Credit.toString());
      } else if (payment === PaymentMethodEnum.Credit.toString()) {
        // If debit card and credit payment was selected, reset
        setPayment('');
      }
    }
  }, [cardId, selectedCard]);

  // Filter categories based on transaction type
  const filteredCategories = useMemo(() => {
    if (!type) return categories;
    
    return categories.filter(cat => {
      const catType = CategoryTypeLabels[cat.type] || cat.type;
      // Ambos = can be used for both
      if (catType === 'Ambos' || cat.type === 'Both') return true;
      // Match type
      if (type === 'Receita' && (catType === 'Receita' || cat.type === 'Income')) return true;
      if (type === 'Despesa' && (catType === 'Despesa' || cat.type === 'Expense')) return true;
      return false;
    });
  }, [categories, type]);

  // Reset category when type changes if current category doesn't match
  useEffect(() => {
    if (type && category) {
      const currentCat = categories.find(c => c.id === category);
      if (currentCat) {
        const catType = CategoryTypeLabels[currentCat.type] || currentCat.type;
        const isCompatible = catType === 'Ambos' || currentCat.type === 'Both' ||
          (type === 'Receita' && (catType === 'Receita' || currentCat.type === 'Income')) ||
          (type === 'Despesa' && (catType === 'Despesa' || currentCat.type === 'Expense'));
        
        if (!isCompatible) {
          setCategory('');
        }
      }
    }
  }, [type, category, categories]);

  // Clear validation errors when fields change
  useEffect(() => {
    setValidationErrors([]);
  }, [title, rawValue, date, status, description, destination, hasInstallment, totalInstallments]);

  const formatCurrency = (cents: number) => {
    return (cents / 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\D/g, '');
    const numericValue = parseInt(input, 10) || 0;
    setRawValue(numericValue);
  };

  const resetForm = () => {
    setTitle('');
    setRawValue(0);
    setDate('');
    setCategory('');
    setCardId(preselectedCardId || '');
    setType('');
    setPayment('');
    setStatus('');
    setDestination('');
    setDescription('');
    setHasInstallment(false);
    setTotalInstallments('');
    setValidationErrors([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic required field check
    if (!title || !rawValue || !date || !category || !cardId || !type || !payment || !status) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    // Run transaction validation
    const transactionErrors = validateTransaction({
      title: title.trim(),
      amount: rawValue,
      date,
      status,
      description: description.trim(),
      destination: destination.trim(),
    });

    // Run installment validation if enabled
    let installmentErrors: ValidationError[] = [];
    if (hasInstallment) {
      const parsedInstallments = parseInt(totalInstallments, 10) || 0;
      installmentErrors = validateInstallment({
        totalInstallments: parsedInstallments,
        totalAmount: rawValue,
        firstPaymentDate: date,
      });
    }

    const allErrors = [...transactionErrors, ...installmentErrors];
    
    if (allErrors.length > 0) {
      setValidationErrors(allErrors);
      const firstError = getFirstValidationError(allErrors);
      if (firstError) {
        toast.error(firstError);
      }
      return;
    }

    setLoading(true);
    try {
      const transactionType = type === 'Receita' ? TransactionTypeEnum.Receita : TransactionTypeEnum.Despesa;
      const paymentMethod = parseInt(payment, 10);
      const paymentStatus = status === 'Pago' 
        ? PaymentStatusEnum.Pago 
        : status === 'Pendente' 
        ? PaymentStatusEnum.Pendente 
        : PaymentStatusEnum.Atrasado;

      // Use the date directly without timezone conversion - send as YYYY-MM-DD with noon time
      const dateValue = `${date}T12:00:00.000Z`;

      const payload: any = {
        cardId,
        categoryId: category,
        title: title.trim(),
        description: description.trim() || undefined,
        amount: rawValue / 100,
        date: dateValue,
        transactionType,
        paymentMethod,
        status: paymentStatus,
        destination: destination.trim() || undefined,
      };

      // Add installment data if enabled
      if (hasInstallment && totalInstallments) {
        payload.hasInstallment = {
          totalInstallments: parseInt(totalInstallments, 10),
        };
      }

      const response = await transactionService.create(payload);

      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success(hasInstallment ? 'Transação parcelada criada com sucesso' : 'Transação criada com sucesso');
        resetForm();
        onOpenChange(false);
        onSuccess?.();
      }
    } catch (error) {
      toast.error('Erro ao criar transação');
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Transação</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-3 mt-4">
          {/* Linha 1 - Título */}
          <div className="space-y-1.5">
            <Label htmlFor="title">Título <span className="text-destructive">*</span></Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Mercado"
              required
              disabled={loading}
              maxLength={50}
              className={hasError('title') ? 'border-destructive' : ''}
            />
            {getInputError('title') && (
              <p className="text-xs text-destructive">{getInputError('title')}</p>
            )}
            <p className="text-xs text-muted-foreground text-right">{title.length}/50</p>
          </div>

          {/* Linha 2 - Valor + Data */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="value">Valor <span className="text-destructive">*</span></Label>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                <Input
                  id="value"
                  value={formatCurrency(rawValue)}
                  onChange={handleValueChange}
                  className={`pl-8 text-right font-mono text-sm ${hasError('amount') ? 'border-destructive' : ''}`}
                  placeholder="0,00"
                  required
                  disabled={loading}
                />
              </div>
              {getInputError('amount') && (
                <p className="text-xs text-destructive">{getInputError('amount')}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="date">Data <span className="text-destructive">*</span></Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="text-sm"
                disabled={loading}
              />
            </div>
          </div>

          {/* Linha 3 - Cartão + Tipo */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Cartão <span className="text-destructive">*</span></Label>
              <Select value={cardId} onValueChange={setCardId} required disabled={loading}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Selecione o cartão" />
                </SelectTrigger>
                <SelectContent>
                  {cards.map((card) => (
                    <SelectItem key={card.id} value={card.id}>
                      {card.name} ({CardTypeLabels[card.type] || card.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {cards.length === 0 && (
                <p className="text-xs text-muted-foreground">Nenhum cartão cadastrado</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Tipo <span className="text-destructive">*</span></Label>
              <Select value={type} onValueChange={setType} required disabled={loading}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Receita">Receita</SelectItem>
                  <SelectItem value="Despesa">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Linha 4 - Status + Pagamento */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Status <span className="text-destructive">*</span></Label>
              <Select value={status} onValueChange={setStatus} required disabled={loading}>
                <SelectTrigger className={`text-sm ${hasError('status') ? 'border-destructive' : ''}`}>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pago">Pago</SelectItem>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="Atrasado">Atrasado</SelectItem>
                </SelectContent>
              </Select>
              {getInputError('status') && (
                <p className="text-xs text-destructive">{getInputError('status')}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Pagamento <span className="text-destructive">*</span></Label>
              <Select value={payment} onValueChange={setPayment} required disabled={loading || !cardId}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder={cardId ? "Selecione" : "Selecione um cartão"} />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethodOptions.map((method) => (
                    <SelectItem key={method.value} value={method.value.toString()}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedCard?.type === 'CreditCard' && (
                <p className="text-xs text-muted-foreground">Cartão de crédito usa apenas pagamento em crédito</p>
              )}
            </div>
          </div>

          {/* Linha 5 - Categoria */}
          <div className="space-y-1.5">
            <Label>Categoria <span className="text-destructive">*</span></Label>
            <Select value={category} onValueChange={setCategory} required disabled={loading || !type}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder={type ? "Selecione" : "Selecione o tipo primeiro"} />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Linha 6 - Parcelamento */}
          <div className="space-y-3 p-3 border border-border rounded-lg bg-secondary/30">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="installment-toggle" className="text-sm font-medium">Parcelar transação</Label>
                <p className="text-xs text-muted-foreground">Dividir em várias parcelas</p>
              </div>
              <Switch
                id="installment-toggle"
                checked={hasInstallment}
                onCheckedChange={setHasInstallment}
                disabled={loading}
              />
            </div>
            
            {hasInstallment && (
              <div className="space-y-1.5">
                <Label htmlFor="installments">Número de parcelas <span className="text-destructive">*</span></Label>
                <Input
                  id="installments"
                  type="number"
                  min="2"
                  max="480"
                  value={totalInstallments}
                  onChange={(e) => setTotalInstallments(e.target.value)}
                  placeholder="Ex: 12 (máx. 480)"
                  disabled={loading}
                  className={hasError('totalInstallments') ? 'border-destructive' : ''}
                />
                {getInputError('totalInstallments') && (
                  <p className="text-xs text-destructive">{getInputError('totalInstallments')}</p>
                )}
                {totalInstallments && parseInt(totalInstallments) >= 2 && parseInt(totalInstallments) <= 480 && (
                  <p className="text-xs text-muted-foreground">
                    {parseInt(totalInstallments)}x de {formatCurrency(Math.ceil(rawValue / parseInt(totalInstallments)))}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Linha 7 - Destino/Origem */}
          <div className="space-y-1.5">
            <Label htmlFor="destination">
              {type === 'Receita' ? 'Origem' : 'Destino'} (opcional)
            </Label>
            <Input
              id="destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder={type === 'Receita' ? 'Ex: Empresa XYZ' : 'Ex: Pão de Açúcar'}
              disabled={loading}
              maxLength={50}
              className={hasError('destination') ? 'border-destructive' : ''}
            />
            {getInputError('destination') && (
              <p className="text-xs text-destructive">{getInputError('destination')}</p>
            )}
            {destination.length > 0 && (
              <p className="text-xs text-muted-foreground text-right">{destination.length}/50</p>
            )}
          </div>

          {/* Linha 8 - Descrição */}
          <div className="space-y-1.5">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Detalhes adicionais..."
              rows={2}
              className={`resize-none ${hasError('description') ? 'border-destructive' : ''}`}
              disabled={loading}
              maxLength={300}
            />
            {getInputError('description') && (
              <p className="text-xs text-destructive">{getInputError('description')}</p>
            )}
            {description.length > 0 && (
              <p className="text-xs text-muted-foreground text-right">{description.length}/300</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" variant="accent" className="flex-1" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {hasInstallment ? 'Criar Parcelado' : 'Criar Transação'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
