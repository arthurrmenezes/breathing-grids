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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NewTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const categories = [
  'Alimentação',
  'Transporte',
  'Assinatura',
  'Conta',
  'Compras',
  'Investimento',
  'Lazer',
  'Saúde',
  'Moradia',
  'Recebido',
];

const paymentMethods = [
  'Pix',
  'Cartão Crédito',
  'Cartão Débito',
  'Débito Automático',
  'Transferência',
  'Boleto',
  'Dinheiro',
];

export const NewTransactionModal = ({ open, onOpenChange }: NewTransactionModalProps) => {
  const [title, setTitle] = useState('');
  const [rawValue, setRawValue] = useState(0);
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [payment, setPayment] = useState('');
  const [status, setStatus] = useState('');
  const [destination, setDestination] = useState('');
  const [description, setDescription] = useState('');

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!title || !rawValue || !date || !category || !type || !payment || !status) {
      return;
    }

    const transactionData = {
      title,
      value: rawValue / 100,
      date,
      category,
      type,
      payment,
      status,
      destination: destination || null,
      description: description || null,
    };

    console.log('Creating transaction:', transactionData);
    
    // Reset form
    setTitle('');
    setRawValue(0);
    setDate('');
    setCategory('');
    setType('');
    setPayment('');
    setStatus('');
    setDestination('');
    setDescription('');
    
    onOpenChange(false);
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
              />
            </div>
          </div>

          {/* Linha 3 - Tipo + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Tipo <span className="text-destructive">*</span></Label>
              <Select value={type} onValueChange={setType} required>
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
              <Select value={status} onValueChange={setStatus} required>
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
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Pagamento <span className="text-destructive">*</span></Label>
              <Select value={payment} onValueChange={setPayment} required>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method} value={method}>{method}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Linha 5 - Destino/Origem */}
          <div className="space-y-1.5">
            <Label htmlFor="destination">
              {type === 'Receita' ? 'Origem' : 'Destino'} (opcional)
            </Label>
            <Input
              id="destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder={type === 'Receita' ? 'Ex: Empresa XYZ' : 'Ex: Pão de Açúcar'}
            />
          </div>

          {/* Linha 6 - Descrição */}
          <div className="space-y-1.5">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Detalhes adicionais..."
              rows={2}
              className="resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="accent" className="flex-1">
              Criar Transação
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};