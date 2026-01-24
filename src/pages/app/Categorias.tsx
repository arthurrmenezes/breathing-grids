import { useState, useEffect, useMemo } from 'react';
import { AppLayout, useValuesVisibility } from '@/components/app/AppLayout';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Eye, EyeOff, Tag, ChevronRight, ChevronDown, Loader2, MoreHorizontal } from 'lucide-react';
import { NewCategoryModal } from '@/components/app/NewCategoryModal';
import { EditCategoryModal } from '@/components/app/EditCategoryModal';
import { categoryService } from '@/services/categoryService';
import { transactionService } from '@/services/transactionService';
import { Category, CategoryTypeLabels, CategoryTypeEnum } from '@/types/category';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format, startOfMonth, endOfMonth } from 'date-fns';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// Color palette for categories
const categoryColors = [
  'hsl(160 84% 39%)', 'hsl(200 84% 45%)', 'hsl(280 84% 50%)', 
  'hsl(40 84% 50%)', 'hsl(0 84% 50%)', 'hsl(340 84% 50%)',
  'hsl(120 84% 39%)', 'hsl(220 84% 50%)', 'hsl(30 84% 50%)',
  'hsl(180 84% 40%)', 'hsl(260 84% 50%)', 'hsl(60 84% 45%)'
];

const getCategoryColor = (index: number) => categoryColors[index % categoryColors.length];

// Category icons based on name (simplified)
const getCategoryIcon = () => {
  return <Tag className="w-4 h-4" />;
};

interface CategoryWithStats extends Category {
  transactionCount: number;
  totalAmount: number;
}

const Categorias = () => {
  const { showValues, setShowValues } = useValuesVisibility();
  const [newCategoryOpen, setNewCategoryOpen] = useState(false);
  const [editCategoryOpen, setEditCategoryOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income'>('all');
  const [categories, setCategories] = useState<CategoryWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const categoryType = filterType === 'income' 
        ? CategoryTypeEnum.Receita 
        : filterType === 'expense' 
        ? CategoryTypeEnum.Despesa 
        : undefined;

      const response = await categoryService.getAll({ 
        pageSize: 100,
        categoryType 
      });
      
      if (response.error) {
        toast.error(response.error);
      } else if (response.data) {
        // Fetch transaction counts for each category
        const now = new Date();
        const startDate = format(startOfMonth(now), 'yyyy-MM-dd');
        const endDate = format(endOfMonth(now), 'yyyy-MM-dd');
        
        const categoriesWithStats: CategoryWithStats[] = await Promise.all(
          response.data.categories.map(async (cat) => {
            try {
              const txResponse = await transactionService.getAll({
                categoryId: cat.id,
                startDate,
                endDate,
                pageSize: 1000,
              });
              
              const transactions = txResponse.data?.transactions || [];
              const totalAmount = transactions.reduce((sum, tx) => sum + tx.amount, 0);
              
              return {
                ...cat,
                transactionCount: transactions.length,
                totalAmount,
              };
            } catch {
              return {
                ...cat,
                transactionCount: 0,
                totalAmount: 0,
              };
            }
          })
        );
        
        setCategories(categoriesWithStats);
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

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  // Statistics
  const totalCategories = categories.length;
  const expenseCategories = categories.filter(c => c.type === 'Expense' || c.type === 'Despesa' || getTypeLabel(c.type) === 'Despesa').length;
  const incomeCategories = categories.filter(c => c.type === 'Income' || c.type === 'Receita' || getTypeLabel(c.type) === 'Receita').length;
  const customCategories = categories.filter(c => !c.isDefault).length;

  const formatCurrency = (value: number) => 
    `R$ ${Math.abs(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-h2">Categorias</h1>
            <p className="text-muted-foreground">Organize suas transações por categoria</p>
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

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-1">
              <Tag className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Categorias</span>
            </div>
            <p className="text-2xl font-bold">{totalCategories}</p>
          </div>
          
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-destructive" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Despesas</span>
            </div>
            <p className="text-2xl font-bold">{expenseCategories}</p>
          </div>
          
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Receitas</span>
            </div>
            <p className="text-2xl font-bold">{incomeCategories}</p>
          </div>
          
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Personalizadas</span>
            </div>
            <p className="text-2xl font-bold">{customCategories}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <Tabs value={filterType} onValueChange={(v) => setFilterType(v as typeof filterType)}>
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="all" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              Todas
            </TabsTrigger>
            <TabsTrigger value="expense" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              Despesas
            </TabsTrigger>
            <TabsTrigger value="income" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              Receitas
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-card rounded-2xl border border-border">
            <Tag className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Nenhuma categoria encontrada</p>
            <Button variant="accent" onClick={() => setNewCategoryOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar primeira categoria
            </Button>
          </div>
        ) : (
          /* Categories List */
          <div className="bg-card rounded-2xl border border-border divide-y divide-border">
            {categories.map((category, index) => {
              const isExpanded = expandedGroups.has(category.id);
              const typeLabel = getTypeLabel(category.type);
              const isExpense = typeLabel === 'Despesa';
              
              return (
                <div key={category.id}>
                  <div className="flex items-center gap-4 p-4 hover:bg-secondary/30 transition-colors">
                    {/* Color indicator */}
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${getCategoryColor(index)}20` }}
                    >
                      <div 
                        className="w-5 h-5 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: getCategoryColor(index) }}
                      >
                        {getCategoryIcon()}
                      </div>
                    </div>
                    
                    {/* Category info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium truncate">{category.title}</h4>
                        {category.isDefault && (
                          <span className="text-xs bg-secondary px-2 py-0.5 rounded">Padrão</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded-full",
                          isExpense 
                            ? "bg-destructive/10 text-destructive" 
                            : typeLabel === 'Receita' 
                            ? "bg-success/10 text-success"
                            : "bg-accent/10 text-accent"
                        )}>
                          {typeLabel}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {category.transactionCount} transação{category.transactionCount !== 1 ? 'ões' : ''}
                        </span>
                      </div>
                    </div>
                    
                    {/* Amount */}
                    <div className="text-right hidden sm:block">
                      <p className={cn(
                        "font-medium tabular-nums",
                        showValues ? (isExpense ? 'text-destructive' : 'text-success') : ''
                      )}>
                        {showValues ? formatCurrency(category.totalAmount) : '••••••'}
                      </p>
                      <p className="text-xs text-muted-foreground">este mês</p>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      {!category.isDefault && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
                              <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(category)}>
                              <Pencil className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(category)}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Add category row */}
            <button 
              onClick={() => setNewCategoryOpen(true)}
              className="flex items-center gap-4 p-4 w-full hover:bg-secondary/30 transition-colors text-muted-foreground hover:text-foreground"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-secondary/50 shrink-0">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-sm">Adicionar categoria</span>
            </button>
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