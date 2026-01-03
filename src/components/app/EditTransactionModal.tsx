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
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { transactionService } from '@/services/transactionService';
import { Transaction, TransactionTypeEnum, PaymentMethodEnum, PaymentStatusEnum, TransactionTypeLabels, PaymentMethodLabels, PaymentStatusLabels } from '@/types/transaction';
import { Category } from '@/types/category';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EditTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  categories?: Category[];
  transaction: Transaction | null;
}

const paymentMethods = [
  { label: 'Pix', value: 'Pix' },
  { label: 'Cartão Crédito', value: 'Cartão Crédito' },
  { label: 'Cartão Débito', value: 'Cartão Débito' },
  { label: 'Débito Automático', value: 'Débito Automático' },
  { label: 'Transferência', value: 'Transferência' },
  { label: 'Boleto', value: 'Boleto' },
  { label: 'Dinheiro', value: 'Dinheiro' },
];

const getPaymentMethodKey = (apiValue: string): string => {
  const mapping: Record<string, string> = {
    'Pix': 'Pix',
    'CreditCard': 'Cartão Crédito',
    'DebitCard': 'Cartão Débito',
    'AutomaticDebit': 'Débito Automático',
    'Transfer': 'Transferência',
    'BankSlip': 'Boleto',
    'Cash': 'Dinheiro',
  };
  return mapping[apiValue] || apiValue;
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

  useEffect(() => {
    if (transaction && open) {
      setTitle(transaction.title);
      setRawValue(Math.round(transaction.amount * 100));
      setDate(transaction.date.split('T')[0]);
      setCategory(transaction.categoryId);
      setType(getTypeKey(transaction.transactionType));
      setPayment(getPaymentMethodKey(transaction.paymentMethod));
      setStatus(getStatusKey(transaction.status));
      setDestination(transaction.destination || '');
      setDescription(transaction.description || '');
    }
  }, [transaction, open]);

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
    
    if (!title || !rawValue || !date || !category || !type || !payment || !status) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const transactionType = type === 'Receita' ? TransactionTypeEnum.Receita : TransactionTypeEnum.Despesa;
      const paymentMethod = PaymentMethodEnum[payment as keyof typeof PaymentMethodEnum] ?? 0;
      const paymentStatus = status === 'Pago' 
        ? PaymentStatusEnum.Pago 
        : status === 'Pendente' 
        ? PaymentStatusEnum.Pendente 
        : PaymentStatusEnum.Atrasado;

      const response = await transactionService.update(transaction.id, {
        categoryId: category,
        title,
        description: description || undefined,
        amount: rawValue / 100,
        date: new Date(date).toISOString(),
        transactionType,
        paymentMethod,
        status: paymentStatus,
        destination: destination || undefined,
      });

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
                  {categories.map((cat) => (
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
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>{method.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Linha 5 - Destino/Origem */}
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

          {/* Linha 6 - Descrição */}
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
      </DialogContent>
    </Dialog>
  );
};
