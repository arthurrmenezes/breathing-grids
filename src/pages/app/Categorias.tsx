import { useState } from 'react';
import { AppLayout, useValuesVisibility } from '@/components/app/AppLayout';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const categories = [
  { id: 1, name: 'Alimentação', icon: '🍔', color: '#10B981', budget: 1500, spent: 1245.80, transactions: 45 },
  { id: 2, name: 'Transporte', icon: '🚗', color: '#3B82F6', budget: 800, spent: 562.30, transactions: 28 },
  { id: 3, name: 'Moradia', icon: '🏠', color: '#8B5CF6', budget: 3000, spent: 2850.00, transactions: 5 },
  { id: 4, name: 'Entretenimento', icon: '🎬', color: '#F59E0B', budget: 500, spent: 387.50, transactions: 15 },
  { id: 5, name: 'Saúde', icon: '💊', color: '#EF4444', budget: 600, spent: 234.00, transactions: 8 },
  { id: 6, name: 'Educação', icon: '📚', color: '#EC4899', budget: 400, spent: 180.00, transactions: 3 },
  { id: 7, name: 'Compras', icon: '🛍️', color: '#14B8A6', budget: 1000, spent: 856.40, transactions: 22 },
  { id: 8, name: 'Investimentos', icon: '📈', color: '#6366F1', budget: 2000, spent: 2000.00, transactions: 4 },
];

const chartData = categories.map(cat => ({
  name: cat.name,
  value: cat.spent,
  color: cat.color,
}));

const Categorias = () => {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const { showValues, setShowValues } = useValuesVisibility();

  const totalBudget = categories.reduce((sum, cat) => sum + cat.budget, 0);
  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0);

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
            <Button variant="accent" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Nova Categoria
            </Button>
          </div>
        </div>

        {/* Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pie Chart */}
          <div className="lg:col-span-1 bg-card rounded-2xl border border-border p-6">
            <h3 className="text-lg font-medium mb-4">Distribuição de Gastos</h3>
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
                  formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, '']}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="text-center mt-4">
              <p className="text-sm text-muted-foreground">Total Gasto</p>
              <p className="text-2xl font-semibold">
                R$ {totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-muted-foreground">
                de R$ {totalBudget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} orçado
              </p>
            </div>
          </div>

          {/* Categories Grid */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categories.map((category) => {
                const percentage = (category.spent / category.budget) * 100;
                const isOverBudget = percentage > 100;
                
                return (
                  <div 
                    key={category.id}
                    className="bg-card rounded-xl border border-border p-5 hover:shadow-card-hover transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                          style={{ backgroundColor: `${category.color}20` }}
                        >
                          {category.icon}
                        </div>
                        <div>
                          <h4 className="font-medium">{category.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {category.transactions} transações
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                          <Pencil className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          R$ {category.spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        <span className={isOverBudget ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500"
                          style={{ 
                            width: `${Math.min(percentage, 100)}%`,
                            backgroundColor: isOverBudget ? 'hsl(var(--destructive))' : category.color
                          }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground text-right">
                        Limite: R$ {category.budget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Categorias;