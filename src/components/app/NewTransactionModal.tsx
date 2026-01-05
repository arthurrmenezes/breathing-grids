import { useState } from 'react';
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
  PaymentMethodOptions
} from '@/types/transaction';
import { Category } from '@/types/category';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from '@/components/ui/switch';

interface NewTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  categories?: Category[];
}

export const NewTransactionModal = ({ open, onOpenChange, onSuccess, categories = [] }: NewTransactionModalProps) => {
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
    setType('');
    setPayment('');
    setStatus('');
    setDestination('');
    setDescription('');
    setHasInstallment(false);
    setTotalInstallments('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
            />
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
                  className="pl-8 text-right font-mono text-sm"
                  placeholder="0,00"
                  required
                  disabled={loading}
                />
              </div>
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
            <Label htmlFor="destination">
              {type === 'Receita' ? 'Origem' : 'Destino'} (opcional)
            </Label>
            <Input
              id="destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder={type === 'Receita' ? 'Ex: Empresa XYZ' : 'Ex: Pão de Açúcar'}
              disabled={loading}
            />
          </div>

          {/* Linha 7 - Descrição */}
          <div className="space-y-1.5">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
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
              {hasInstallment ? 'Criar Parcelado' : 'Criar Transação'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
