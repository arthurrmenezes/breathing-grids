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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NewCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NewCategoryModal = ({ open, onOpenChange }: NewCategoryModalProps) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !type) {
      return;
    }

    const categoryData = {
      title,
      type,
    };

    console.log('Creating category:', categoryData);
    
    // Reset form
    setTitle('');
    setType('');
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Nova Categoria</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Alimentação"
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
                <SelectItem value="Despesa">Despesa</SelectItem>
                <SelectItem value="Receita">Receita</SelectItem>
                <SelectItem value="Ambos">Ambos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="accent" className="flex-1">
              Criar Categoria
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
