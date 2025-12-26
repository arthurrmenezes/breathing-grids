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
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Transação</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Mercado"
              required
            />
          </div>

          {/* Value */}
          <div className="space-y-2">
            <Label htmlFor="value">Valor *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
              <Input
                id="value"
                value={formatCurrency(rawValue)}
                onChange={handleValueChange}
                className="pl-10 text-right font-mono"
                placeholder="0,00"
                required
              />
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Data *</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label>Tipo *</Label>
            <Select value={type} onValueChange={setType} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Receita">Receita</SelectItem>
                <SelectItem value="Despesa">Despesa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Categoria *</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label>Forma de Pagamento *</Label>
            <Select value={payment} onValueChange={setPayment} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a forma de pagamento" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method} value={method}>{method}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status *</Label>
            <Select value={status} onValueChange={setStatus} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pago">Pago</SelectItem>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Atrasado">Atrasado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Destination */}
          <div className="space-y-2">
            <Label htmlFor="destination">Destino (opcional)</Label>
            <Input
              id="destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Ex: Pão de Açúcar"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Detalhes adicionais..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
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
