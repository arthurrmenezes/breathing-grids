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
import { useInvalidateFinancialSummary } from '@/hooks/useFinancialSummary';
import { 
  Transaction, 
  PaymentStatusEnum,
} from '@/types/transaction';
import { Category, CategoryTypeLabels } from '@/types/category';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  validateTransaction, 
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
  const { invalidateAll } = useInvalidateFinancialSummary();
  const [title, setTitle] = useState('');
  const [rawValue, setRawValue] = useState(0);
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [destination, setDestination] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  // Check if transaction is installment-based
  const isInstallmentTransaction = useMemo(() => {
    if (!transaction) return false;
    const installmentData = transaction.installment || (transaction.installments && transaction.installments[0]);
    return installmentData && installmentData.totalInstallments > 1;
  }, [transaction]);

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

  // Filter categories based on transaction type (read-only display)
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

  useEffect(() => {
    if (transaction && open) {
      setTitle(transaction.title);
      setRawValue(Math.round(transaction.amount * 100));
      setDate(transaction.date.split('T')[0]);
      setCategory(transaction.categoryId);
      setType(getTypeKey(transaction.transactionType));
      setStatus(getStatusKey(transaction.status));
      setDestination(transaction.destination || '');
      setDescription(transaction.description || '');
    }
  }, [transaction, open]);

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
  }, [title, rawValue, date, status, description, destination]);

  const formatCurrency = (cents: number) => (cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\D/g, '');
    setRawValue(parseInt(input, 10) || 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transaction || cannotEdit) return;
    
    // Only validate editable fields: CategoryId, Title, Description, Amount, Date, Status, Destination
    if (!title || !date || !category || !status) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    // For installment transactions, amount is not editable, so we don't validate it the same way
    const amountToValidate = isInstallmentTransaction ? transaction.amount * 100 : rawValue;

    const transactionErrors = validateTransaction({ 
      title: title.trim(), 
      amount: amountToValidate, 
      date, 
      status, 
      description: description.trim(), 
      destination: destination.trim() 
    });

    if (transactionErrors.length > 0) {
      setValidationErrors(transactionErrors);
      toast.error(getFirstValidationError(transactionErrors) || 'Erro de validação');
      return;
    }

    setLoading(true);
    try {
      const paymentStatus = status === 'Pago' ? PaymentStatusEnum.Pago : status === 'Pendente' ? PaymentStatusEnum.Pendente : PaymentStatusEnum.Atrasado;
      const dateValue = `${date}T12:00:00.000Z`;

      // Build payload with only allowed fields: CategoryId, Title, Description, Amount, Date, Status, Destination
      const payload: any = {
        categoryId: category,
        title: title.trim(),
        description: description.trim() || undefined,
        date: dateValue,
        status: paymentStatus,
        destination: destination.trim() || undefined,
      };

      // Only include amount if NOT an installment transaction (single payment)
      if (!isInstallmentTransaction) {
        payload.amount = rawValue / 100;
      }

      const response = await transactionService.update(transaction.id, payload);
      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success('Transação atualizada com sucesso');
        invalidateAll(); // Invalidate financial summary cache
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
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
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
            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-title">Título <span className="text-destructive">*</span></Label>
              <Input 
                id="edit-title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="Ex: Mercado" 
                required 
                disabled={loading} 
                maxLength={50} 
                className={hasError('title') ? 'border-destructive' : ''} 
              />
              {getInputError('title') && <p className="text-xs text-destructive">{getInputError('title')}</p>}
              <p className="text-xs text-muted-foreground text-right">{title.length}/50</p>
            </div>

            {/* Amount - Only editable for non-installment transactions */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-value">
                Valor <span className="text-destructive">*</span>
                {isInstallmentTransaction && (
                  <span className="text-xs text-muted-foreground ml-2">(não editável em parcelamentos)</span>
                )}
              </Label>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                <Input 
                  id="edit-value" 
                  value={formatCurrency(rawValue)} 
                  onChange={handleValueChange} 
                  className={`pl-8 text-right font-mono text-sm ${hasError('amount') ? 'border-destructive' : ''} ${isInstallmentTransaction ? 'bg-muted cursor-not-allowed' : ''}`}
                  placeholder="0,00" 
                  required 
                  disabled={loading || isInstallmentTransaction} 
                />
              </div>
              {getInputError('amount') && <p className="text-xs text-destructive">{getInputError('amount')}</p>}
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-date">Data <span className="text-destructive">*</span></Label>
              <Input 
                id="edit-date" 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                required 
                className="text-sm" 
                disabled={loading} 
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <Label>Categoria <span className="text-destructive">*</span></Label>
              <Select value={category} onValueChange={setCategory} required disabled={loading}>
                <SelectTrigger className="text-sm"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
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
              {getInputError('status') && <p className="text-xs text-destructive">{getInputError('status')}</p>}
            </div>

            {/* Destination */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-destination">{type === 'Receita' ? 'Origem' : 'Destino'} (opcional)</Label>
              <Input 
                id="edit-destination" 
                value={destination} 
                onChange={(e) => setDestination(e.target.value)} 
                placeholder={type === 'Receita' ? 'Ex: Empresa XYZ' : 'Ex: Pão de Açúcar'} 
                disabled={loading} 
                maxLength={50} 
                className={hasError('destination') ? 'border-destructive' : ''} 
              />
              {getInputError('destination') && <p className="text-xs text-destructive">{getInputError('destination')}</p>}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-description">Descrição (opcional)</Label>
              <Textarea 
                id="edit-description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Ex: Detalhes adicionais..." 
                rows={2} 
                className={`resize-none ${hasError('description') ? 'border-destructive' : ''}`} 
                disabled={loading} 
                maxLength={300} 
              />
              {getInputError('description') && <p className="text-xs text-destructive">{getInputError('description')}</p>}
            </div>

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
        )}
      </DialogContent>
    </Dialog>
  );
};