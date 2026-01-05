import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Transaction, PaymentMethodLabels, PaymentStatusLabels } from "@/types/transaction";
import { Category } from "@/types/category";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

interface ViewTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction | null;
  categories: Category[];
}

export const ViewTransactionModal = ({
  open,
  onOpenChange,
  transaction,
  categories,
}: ViewTransactionModalProps) => {
  if (!transaction) return null;

  const category = categories.find((c) => c.id === transaction.categoryId);
  const isIncome = transaction.transactionType === "Income" || transaction.transactionType === "Receita";

  const formatCurrency = (value: number) =>
    `R$ ${Math.abs(value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Detalhes da Transação</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Title & Amount */}
          <div className="text-center p-4 bg-secondary/30 rounded-lg">
            <p className="text-lg font-semibold mb-2">{transaction.title}</p>
            <p className={`text-2xl font-bold ${isIncome ? "text-success" : "text-destructive"}`}>
              {isIncome ? "+" : "-"}{formatCurrency(transaction.amount)}
            </p>
          </div>

          {/* Details Grid */}
          <div className="space-y-3">
            <DetailRow label="Tipo" value={isIncome ? "Receita" : "Despesa"} />
            <DetailRow label="Categoria" value={category?.title || "Sem categoria"} />
            <DetailRow label="Data" value={formatDate(transaction.date)} />
            <DetailRow 
              label="Forma de Pagamento" 
              value={PaymentMethodLabels[transaction.paymentMethod] || "Não informado"} 
            />
            <DetailRow 
              label="Status" 
              value={
                <Badge variant={transaction.status === "Paid" ? "default" : transaction.status === "Overdue" ? "destructive" : "secondary"}>
                  {PaymentStatusLabels[transaction.status] || transaction.status || "Pendente"}
                </Badge>
              } 
            />
            {transaction.description && (
              <DetailRow label="Descrição" value={transaction.description} />
            )}
            {transaction.destination && (
              <DetailRow label="Destino" value={transaction.destination} />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex justify-between items-start py-2 border-b border-border last:border-0">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-sm font-medium text-right max-w-[60%]">{value}</span>
  </div>
);
