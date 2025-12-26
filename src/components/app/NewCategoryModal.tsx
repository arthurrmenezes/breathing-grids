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
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { categoryService } from '@/services/categoryService';
import { CategoryTypeEnum } from '@/types/category';
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
  onSuccess?: () => void;
}

export const NewCategoryModal = ({ open, onOpenChange, onSuccess }: NewCategoryModalProps) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !type) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const typeValue = type === 'Receita' 
        ? CategoryTypeEnum.Receita 
        : type === 'Despesa' 
        ? CategoryTypeEnum.Despesa 
        : CategoryTypeEnum.Ambos;

      const response = await categoryService.create({
        title,
        type: typeValue,
      });

      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success('Categoria criada com sucesso');
        setTitle('');
        setType('');
        onOpenChange(false);
        onSuccess?.();
      }
    } catch (error) {
      toast.error('Erro ao criar categoria');
    } finally {
      setLoading(false);
    }
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
            <Label htmlFor="title">Título <span className="text-destructive">*</span></Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Alimentação"
              required
              disabled={loading}
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label>Tipo <span className="text-destructive">*</span></Label>
            <Select value={type} onValueChange={setType} required disabled={loading}>
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
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" variant="accent" className="flex-1" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Criar Categoria
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
