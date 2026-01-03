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
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { categoryService } from '@/services/categoryService';
import { Category, CategoryTypeEnum, CategoryTypeLabels } from '@/types/category';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EditCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  category: Category | null;
}

const getTypeKey = (apiValue: string): string => {
  const mapping: Record<string, string> = {
    'Income': 'Receita',
    'Expense': 'Despesa',
    'Both': 'Ambos',
    'Receita': 'Receita',
    'Despesa': 'Despesa',
    'Ambos': 'Ambos',
  };
  return mapping[apiValue] || apiValue;
};

export const EditCategoryModal = ({ open, onOpenChange, onSuccess, category }: EditCategoryModalProps) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (category && open) {
      setTitle(category.title);
      setType(getTypeKey(category.type));
    }
  }, [category, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!category) return;
    
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

      const response = await categoryService.update(category.id, {
        newTitle: title,
        newType: typeValue,
      });

      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success('Categoria atualizada com sucesso');
        onOpenChange(false);
        onSuccess?.();
      }
    } catch (error) {
      toast.error('Erro ao atualizar categoria');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Editar Categoria</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="edit-cat-title">Título <span className="text-destructive">*</span></Label>
            <Input
              id="edit-cat-title"
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
              Salvar Alterações
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
