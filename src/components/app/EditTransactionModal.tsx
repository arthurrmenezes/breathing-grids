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
import { 
  Transaction, 
  TransactionTypeEnum, 
  PaymentStatusEnum,
  PaymentMethodEnum,
  PaymentMethodOptions
} from '@/types/transaction';
import { Category, CategoryTypeLabels } from '@/types/category';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EditTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  categories?: Category[];
  transaction: Transaction | null;
}

// Map backend paymentMethod string to enum number
const getPaymentMethodValue = (apiValue: string): number => {
  const mapping: Record<string, number> = {
    'CreditCard': PaymentMethodEnum.CreditCard,
    'DebitCard': PaymentMethodEnum.DebitCard,
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
  
  // Installment fields
  const [hasInstallment, setHasInstallment] = useState(false);
  const [totalInstallments, setTotalInstallments] = useState('');

  // Check if transaction has paid installments (cannot edit)
  const hasPaidInstallments = useMemo(() => {
    if (!transaction) return false;
    
    const installmentData = transaction.installment || (transaction.installments && transaction.installments[0]);
    if (!installmentData || !installmentData.installments) return false;
    
    // Check if any installment is paid
    return installmentData.installments.some(inst => inst.status === 'Paid');
  }, [transaction]);

  // Check if transaction itself is paid and has installments
  const isInstallmentTransactionPaid = useMemo(() => {
    if (!transaction) return false;
    
    const installmentData = transaction.installment || (transaction.installments && transaction.installments[0]);
    if (!installmentData) return false;
    
    return transaction.status === 'Paid' || installmentData.status === 'Paid';
  }, [transaction]);

  const cannotEdit = hasPaidInstallments || isInstallmentTransactionPaid;

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
      
      // Set installment data
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!transaction) return;
    
    if (cannotEdit) {
      toast.error('Não é possível editar transações com parcelas já pagas');
      return;
    }
    
    if (!title || !rawValue || !date || !category || !type || !payment || !status) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (hasInstallment && (!totalInstallments || parseInt(totalInstallments) < 2)) {
      toast.error('Número de parcelas deve ser pelo menos 2');
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
        categoryId: category,
        title,
        description: description || undefined,
        amount: rawValue / 100,
        date: dateValue,
        transactionType,
        paymentMethod,
        status: paymentStatus,
        destination: destination || undefined,
      };

      // Add installment data if changed
      if (hasInstallment && totalInstallments) {
        payload.installment = {
          totalInstallments: parseInt(totalInstallments, 10),
        };
      }

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
              <AlertDescription>
                Esta transação possui parcelas já pagas e não pode ser editada.
              </AlertDescription>
            </Alert>
            <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 mt-4">
            {/* Linha 1 - Título */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-title">Título <span className="text-destructive">*</span></Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Mercado"
                required
                disabled={loading}
              />
            </div>

            {/* Linha 2 - Valor + Data */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-value">Valor <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                  <Input
                    id="edit-value"
                    value={formatCurrency(rawValue)}
                    onChange={handleValueChange}
                    className="pl-8 text-right font-mono text-sm"
                    placeholder="0,00"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

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
            </div>

            {/* Linha 3 - Tipo + Status */}
            <div className="grid grid-cols-2 gap-3">
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

              <div className="space-y-1.5">
                <Label>Status <span className="text-destructive">*</span></Label>
                <Select value={status} onValueChange={setStatus} required disabled={loading}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pago">Pago</SelectItem>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                    <SelectItem value="Atrasado">Atrasado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Linha 4 - Categoria + Forma de Pagamento */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Categoria <span className="text-destructive">*</span></Label>
                <Select value={category} onValueChange={setCategory} required disabled={loading}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Pagamento <span className="text-destructive">*</span></Label>
                <Select value={payment} onValueChange={setPayment} required disabled={loading}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {PaymentMethodOptions.map((method) => (
                      <SelectItem key={method.value} value={method.value.toString()}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Linha 5 - Parcelamento */}
            <div className="space-y-3 p-3 border border-border rounded-lg bg-secondary/30">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="edit-installment-toggle" className="text-sm font-medium">Parcelar transação</Label>
                  <p className="text-xs text-muted-foreground">Dividir em várias parcelas</p>
                </div>
                <Switch
                  id="edit-installment-toggle"
                  checked={hasInstallment}
                  onCheckedChange={setHasInstallment}
                  disabled={loading}
                />
              </div>
              
              {hasInstallment && (
                <div className="space-y-1.5">
                  <Label htmlFor="edit-installments">Número de parcelas <span className="text-destructive">*</span></Label>
                  <Input
                    id="edit-installments"
                    type="number"
                    min="2"
                    max="48"
                    value={totalInstallments}
                    onChange={(e) => setTotalInstallments(e.target.value)}
                    placeholder="Ex: 12"
                    disabled={loading}
                  />
                  {totalInstallments && parseInt(totalInstallments) >= 2 && (
                    <p className="text-xs text-muted-foreground">
                      {parseInt(totalInstallments)}x de {formatCurrency(Math.ceil(rawValue / parseInt(totalInstallments)))}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Linha 6 - Destino/Origem */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-destination">
                {type === 'Receita' ? 'Origem' : 'Destino'} (opcional)
              </Label>
              <Input
                id="edit-destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder={type === 'Receita' ? 'Ex: Empresa XYZ' : 'Ex: Pão de Açúcar'}
                disabled={loading}
              />
            </div>

            {/* Linha 7 - Descrição */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-description">Descrição (opcional)</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Detalhes adicionais..."
                rows={2}
                className="resize-none"
                disabled={loading}
              />
            </div>

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
        )}
      </DialogContent>
    </Dialog>
  );
};
