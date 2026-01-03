import { useState, useEffect } from 'react';
import { AppLayout, useValuesVisibility } from '@/components/app/AppLayout';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Eye, EyeOff, Filter, Loader2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { NewCategoryModal } from '@/components/app/NewCategoryModal';
import { EditCategoryModal } from '@/components/app/EditCategoryModal';
import { categoryService } from '@/services/categoryService';
import { Category, CategoryTypeLabels, CategoryTypeEnum } from '@/types/category';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Color palette for categories
const categoryColors = [
  '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', 
  '#EC4899', '#14B8A6', '#6366F1', '#22C55E', '#0EA5E9',
  '#F97316', '#84CC16', '#06B6D4', '#A855F7', '#F43F5E'
];

const getCategoryColor = (index: number) => categoryColors[index % categoryColors.length];

const Categorias = () => {
  const { showValues, setShowValues } = useValuesVisibility();
  const [newCategoryOpen, setNewCategoryOpen] = useState(false);
  const [editCategoryOpen, setEditCategoryOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [filterType, setFilterType] = useState('Todos');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const categoryType = filterType === 'Receita' 
        ? CategoryTypeEnum.Receita 
        : filterType === 'Despesa' 
        ? CategoryTypeEnum.Despesa 
        : undefined;

      const response = await categoryService.getAll({ 
        pageSize: 50,
        categoryType 
      });
      
      if (response.error) {
        toast.error(response.error);
      } else if (response.data) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      toast.error('Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [filterType]);

  const handleDelete = (category: Category) => {
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedCategory) return;
    
    setDeleting(true);
    try {
      const response = await categoryService.delete(selectedCategory.id);
      
      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success('Categoria excluída com sucesso');
        fetchCategories();
      }
    } catch (error) {
      toast.error('Erro ao excluir categoria');
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setSelectedCategory(null);
    }
  };

  const handleCategoryCreated = () => {
    fetchCategories();
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setEditCategoryOpen(true);
  };

  const handleEditSuccess = () => {
    fetchCategories();
  };

  const getTypeLabel = (type: string) => {
    return CategoryTypeLabels[type] || type;
  };

  // Simulate spent data for chart (this would come from transactions API in real scenario)
  const chartData = categories.map((cat, index) => ({
    name: cat.title,
    value: 100, // Placeholder value
    color: getCategoryColor(index),
  }));

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-h2">Categorias</h1>
            <p className="text-muted-foreground">Gerencie suas categorias de gastos</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowValues(!showValues)}>
              {showValues ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </Button>
            <Button variant="accent" size="sm" onClick={() => setNewCategoryOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Categoria
            </Button>
          </div>
        </div>

        {/* Filter by Type */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filtrar por tipo:</span>
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todos</SelectItem>
              <SelectItem value="Receita">Receita</SelectItem>
              <SelectItem value="Despesa">Despesa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground mb-4">Nenhuma categoria encontrada</p>
            <Button variant="accent" onClick={() => setNewCategoryOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar primeira categoria
            </Button>
          </div>
        ) : (
          /* Overview */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pie Chart */}
            <div className="lg:col-span-1 bg-card rounded-2xl border border-border p-6">
              <h3 className="text-lg font-medium mb-4">Distribuição</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number, name: string) => [name, '']}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="text-center mt-4">
                <p className="text-sm text-muted-foreground">Total de Categorias</p>
                <p className="text-2xl font-semibold">{categories.length}</p>
              </div>
            </div>

            {/* Categories Grid */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {categories.map((category, index) => (
                  <div 
                    key={category.id}
                    className="bg-card rounded-xl border border-border p-5 hover:shadow-card-hover transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                          style={{ backgroundColor: `${getCategoryColor(index)}20` }}
                        >
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: getCategoryColor(index) }}
                          />
                        </div>
                        <div>
                          <h4 className="font-medium">{category.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {getTypeLabel(category.type)}
                            {category.isDefault && ' • Padrão'}
                          </p>
                        </div>
                      </div>
                      {!category.isDefault && (
                        <div className="flex items-center gap-1">
                          <button 
                            className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                            onClick={() => handleEdit(category)}
                          >
                            <Pencil className="w-4 h-4 text-muted-foreground" />
                          </button>
                          <button 
                            className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
                            onClick={() => handleDelete(category)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* New Category Modal */}
      <NewCategoryModal 
        open={newCategoryOpen} 
        onOpenChange={setNewCategoryOpen} 
        onSuccess={handleCategoryCreated}
      />

      {/* Edit Category Modal */}
      <EditCategoryModal
        open={editCategoryOpen}
        onOpenChange={setEditCategoryOpen}
        onSuccess={handleEditSuccess}
        category={editingCategory}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir categoria</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a categoria "{selectedCategory?.title}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default Categorias;
