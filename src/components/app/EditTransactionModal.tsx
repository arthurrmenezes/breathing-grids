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
import { Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { transactionService } from '@/services/transactionService';
import { cardService } from '@/services/cardService';
import { 
  Transaction, 
  TransactionTypeEnum, 
  PaymentStatusEnum,
  PaymentMethodEnum,
  PaymentMethodOptions,
  CreditCardPaymentMethodOptions,
  DebitCardPaymentMethodOptions
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  validateTransaction, 
  validateInstallment, 
  getFirstValidationError,
  getFieldError,
  hasFieldError,
  ValidationError 
} from '@/lib/validation';

interface EditTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  categories?: Category[];
  transaction: Transaction | null;
}

const getPaymentMethodValue = (apiValue: string): number => {
  const mapping: Record<string, number> = {
    'Credit': PaymentMethodEnum.Credit,
    'Debit': PaymentMethodEnum.Debit,
    'CreditCard': PaymentMethodEnum.Credit,
    'DebitCard': PaymentMethodEnum.Debit,
    'Pix': PaymentMethodEnum.Pix,
    'TED': PaymentMethodEnum.TED,
    'Boleto': PaymentMethodEnum.Boleto,
    'Cash': PaymentMethodEnum.Cash,
    'Cheque': PaymentMethodEnum.Cheque,
    'CryptoWallet': PaymentMethodEnum.CryptoWallet,
    'Voucher': PaymentMethodEnum.Voucher,
    'Other': PaymentMethodEnum.Other,
  };
  return mapping[apiValue] ?? 0;
};

const getStatusKey = (apiValue: string): string => {
  const mapping: Record<string, string> = {
    'Pending': 'Pendente',
    'Paid': 'Pago',
    'Overdue': 'Atrasado',
  };
  return mapping[apiValue] || apiValue;
};

const getTypeKey = (apiValue: string): string => {
  const mapping: Record<string, string> = {
    'Income': 'Receita',
    'Expense': 'Despesa',
  };
  return mapping[apiValue] || apiValue;
};

export const EditTransactionModal = ({ open, onOpenChange, onSuccess, categories = [], transaction }: EditTransactionModalProps) => {
  const [title, setTitle] = useState('');
  const [rawValue, setRawValue] = useState(0);
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [payment, setPayment] = useState('');
  const [status, setStatus] = useState('');
  const [destination, setDestination] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCardId, setSelectedCardId] = useState('');
  const [loadingCards, setLoadingCards] = useState(false);
  
  const [hasInstallment, setHasInstallment] = useState(false);
  const [totalInstallments, setTotalInstallments] = useState('');

  const hasPaidInstallments = useMemo(() => {
    if (!transaction) return false;
    const installmentData = transaction.installment || (transaction.installments && transaction.installments[0]);
    if (!installmentData || !installmentData.installments) return false;
    return installmentData.installments.some(inst => inst.status === 'Paid');
  }, [transaction]);

  const isInstallmentTransactionPaid = useMemo(() => {
    if (!transaction) return false;
    const installmentData = transaction.installment || (transaction.installments && transaction.installments[0]);
    if (!installmentData) return false;
    return transaction.status === 'Paid' || installmentData.status === 'Paid';
  }, [transaction]);

  const cannotEdit = hasPaidInstallments || isInstallmentTransactionPaid;

  const selectedCard = useMemo(() => cards.find(c => c.id === selectedCardId), [cards, selectedCardId]);

  const paymentMethodOptions = useMemo(() => {
    if (!selectedCard) return PaymentMethodOptions;
    return selectedCard.type === 'CreditCard' ? CreditCardPaymentMethodOptions : DebitCardPaymentMethodOptions;
  }, [selectedCard]);

  const filteredCategories = useMemo(() => {
    if (!type) return categories;
    return categories.filter(cat => {
      const catType = CategoryTypeLabels[cat.type] || cat.type;
      if (catType === 'Ambos' || cat.type === 'Both') return true;
      if (type === 'Receita' && (catType === 'Receita' || cat.type === 'Income')) return true;
      if (type === 'Despesa' && (catType === 'Despesa' || cat.type === 'Expense')) return true;
      return false;
    });
  }, [categories, type]);

  const fetchCards = async () => {
    setLoadingCards(true);
    try {
      const response = await cardService.getAll({ pageSize: 50 });
      if (response.data) setCards(response.data.cards);
    } catch (error) {
      console.error('Error fetching cards:', error);
    } finally {
      setLoadingCards(false);
    }
  };

  useEffect(() => {
    if (open) fetchCards();
  }, [open]);

  useEffect(() => {
    if (transaction && open) {
      setTitle(transaction.title);
      setRawValue(Math.round(transaction.amount * 100));
      setDate(transaction.date.split('T')[0]);
      setCategory(transaction.categoryId);
      setType(getTypeKey(transaction.transactionType));
      setPayment(getPaymentMethodValue(transaction.paymentMethod).toString());
      setStatus(getStatusKey(transaction.status));
      setDestination(transaction.destination || '');
      setDescription(transaction.description || '');
      setSelectedCardId(transaction.cardId || '');
      
      const installmentData = transaction.installment || (transaction.installments && transaction.installments[0]);
      if (installmentData && installmentData.totalInstallments > 1) {
        setHasInstallment(true);
        setTotalInstallments(installmentData.totalInstallments.toString());
      } else {
        setHasInstallment(false);
        setTotalInstallments('');
      }
    }
  }, [transaction, open]);

  useEffect(() => {
    if (selectedCard) {
      const currentPaymentValue = parseInt(payment, 10);
      const validOptions = selectedCard.type === 'CreditCard' ? CreditCardPaymentMethodOptions : DebitCardPaymentMethodOptions;
      const isValid = validOptions.some(opt => opt.value === currentPaymentValue);
      if (!isValid && validOptions.length > 0) setPayment(validOptions[0].value.toString());
    }
  }, [selectedCard]);

  useEffect(() => {
    if (type && category) {
      const currentCat = categories.find(c => c.id === category);
      if (currentCat) {
        const catType = CategoryTypeLabels[currentCat.type] || currentCat.type;
        const isCompatible = catType === 'Ambos' || currentCat.type === 'Both' ||
          (type === 'Receita' && (catType === 'Receita' || currentCat.type === 'Income')) ||
          (type === 'Despesa' && (catType === 'Despesa' || currentCat.type === 'Expense'));
        if (!isCompatible) setCategory('');
      }
    }
  }, [type, category, categories]);

  useEffect(() => {
    setValidationErrors([]);
  }, [title, rawValue, date, status, description, destination, hasInstallment, totalInstallments]);

  const formatCurrency = (cents: number) => (cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\D/g, '');
    setRawValue(parseInt(input, 10) || 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transaction || cannotEdit) return;
    
    if (!title || !rawValue || !date || !category || !type || !payment || !status || !selectedCardId) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const transactionErrors = validateTransaction({ title: title.trim(), amount: rawValue, date, status, description: description.trim(), destination: destination.trim() });
    let installmentErrors: ValidationError[] = [];
    if (hasInstallment) {
      installmentErrors = validateInstallment({ totalInstallments: parseInt(totalInstallments, 10) || 0, totalAmount: rawValue, firstPaymentDate: date });
    }

    const allErrors = [...transactionErrors, ...installmentErrors];
    if (allErrors.length > 0) {
      setValidationErrors(allErrors);
      toast.error(getFirstValidationError(allErrors) || 'Erro de validação');
      return;
    }

    setLoading(true);
    try {
      const transactionType = type === 'Receita' ? TransactionTypeEnum.Receita : TransactionTypeEnum.Despesa;
      const paymentMethod = parseInt(payment, 10);
      const paymentStatus = status === 'Pago' ? PaymentStatusEnum.Pago : status === 'Pendente' ? PaymentStatusEnum.Pendente : PaymentStatusEnum.Atrasado;
      const dateValue = `${date}T12:00:00.000Z`;

      const payload: any = {
        categoryId: category,
        title: title.trim(),
        description: description.trim() || undefined,
        amount: rawValue / 100,
        date: dateValue,
        status: paymentStatus,
        destination: destination.trim() || undefined,
      };

      const response = await transactionService.update(transaction.id, payload);
      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success('Transação atualizada com sucesso');
        onOpenChange(false);
        onSuccess?.();
      }
    } catch (error) {
      toast.error('Erro ao atualizar transação');
    } finally {
      setLoading(false);
    }
  };

  const getInputError = (field: string) => getFieldError(validationErrors, field) || undefined;
  const hasError = (field: string) => hasFieldError(validationErrors, field);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Transação</DialogTitle>
        </DialogHeader>
        
        {cannotEdit ? (
          <div className="space-y-4 mt-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>Esta transação possui parcelas já pagas e não pode ser editada.</AlertDescription>
            </Alert>
            <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>Fechar</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 mt-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-title">Título <span className="text-destructive">*</span></Label>
              <Input id="edit-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Mercado" required disabled={loading} maxLength={50} className={hasError('title') ? 'border-destructive' : ''} />
              {getInputError('title') && <p className="text-xs text-destructive">{getInputError('title')}</p>}
              <p className="text-xs text-muted-foreground text-right">{title.length}/50</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-value">Valor <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                  <Input id="edit-value" value={formatCurrency(rawValue)} onChange={handleValueChange} className={`pl-8 text-right font-mono text-sm ${hasError('amount') ? 'border-destructive' : ''}`} placeholder="0,00" required disabled={loading} />
                </div>
                {getInputError('amount') && <p className="text-xs text-destructive">{getInputError('amount')}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-date">Data <span className="text-destructive">*</span></Label>
                <Input id="edit-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="text-sm" disabled={loading} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Tipo <span className="text-destructive">*</span></Label>
                <Select value={type} onValueChange={setType} required disabled={loading}>
                  <SelectTrigger className="text-sm"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Receita">Receita</SelectItem>
                    <SelectItem value="Despesa">Despesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status <span className="text-destructive">*</span></Label>
                <Select value={status} onValueChange={setStatus} required disabled={loading}>
                  <SelectTrigger className={`text-sm ${hasError('status') ? 'border-destructive' : ''}`}><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pago">Pago</SelectItem>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                    <SelectItem value="Atrasado">Atrasado</SelectItem>
                  </SelectContent>
                </Select>
                {getInputError('status') && <p className="text-xs text-destructive">{getInputError('status')}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Cartão <span className="text-destructive">*</span></Label>
              <Select value={selectedCardId} onValueChange={setSelectedCardId} required disabled={loading || loadingCards}>
                <SelectTrigger className="text-sm"><SelectValue placeholder={loadingCards ? "Carregando..." : "Selecione o cartão"} /></SelectTrigger>
                <SelectContent>
                  {cards.map((card) => (
                    <SelectItem key={card.id} value={card.id}>{card.name} ({CardTypeLabels[card.type] || card.type})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Categoria <span className="text-destructive">*</span></Label>
                <Select value={category} onValueChange={setCategory} required disabled={loading}>
                  <SelectTrigger className="text-sm"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {filteredCategories.map((cat) => <SelectItem key={cat.id} value={cat.id}>{cat.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Pagamento <span className="text-destructive">*</span></Label>
                <Select value={payment} onValueChange={setPayment} required disabled={loading}>
                  <SelectTrigger className="text-sm"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {paymentMethodOptions.map((method) => <SelectItem key={method.value} value={method.value.toString()}>{method.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-destination">{type === 'Receita' ? 'Origem' : 'Destino'} (opcional)</Label>
              <Input id="edit-destination" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder={type === 'Receita' ? 'Ex: Empresa XYZ' : 'Ex: Pão de Açúcar'} disabled={loading} maxLength={50} className={hasError('destination') ? 'border-destructive' : ''} />
              {getInputError('destination') && <p className="text-xs text-destructive">{getInputError('destination')}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-description">Descrição (opcional)</Label>
              <Textarea id="edit-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: Detalhes adicionais..." rows={2} className={`resize-none ${hasError('description') ? 'border-destructive' : ''}`} disabled={loading} maxLength={300} />
              {getInputError('description') && <p className="text-xs text-destructive">{getInputError('description')}</p>}
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)} disabled={loading}>Cancelar</Button>
              <Button type="submit" variant="accent" className="flex-1" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Salvar Alterações
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
