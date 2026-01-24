// Card Types

export interface CardCreditCard {
  limit: number;
  closeDay: number;
  dueDay: number;
}

export interface Card {
  id: string;
  accountId: string;
  name: string;
  type: string; // 'DebitCard' | 'CreditCard'
  creditCard?: CardCreditCard;
  updatedAt?: string;
  createdAt: string;
  // Frontend-only property for UI
  color?: string;
}

export interface CreateCardCreditCardInput {
  limit: number;
  closeDay: number;
  dueDay: number;
}

export interface CreateCardInput {
  name: string;
  cardType: number; // 0 = DebitCard, 1 = CreditCard
  creditCard?: CreateCardCreditCardInput;
}

export interface UpdateCardCreditCardInput {
  limit?: number;
  closeDay?: number;
  dueDay?: number;
}

export interface UpdateCardInput {
  name?: string;
  creditCard?: UpdateCardCreditCardInput;
}

export interface CardsListResponse {
  totalCards: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  cards: Card[];
}

export interface GetCardsParams {
  pageNumber?: number;
  pageSize?: number;
  cardType?: number;
}

// Enums
export const CardTypeEnum = {
  DebitCard: 0,
  CreditCard: 1,
} as const;

// Labels for display
export const CardTypeLabels: Record<string, string> = {
  'DebitCard': 'Débito',
  'CreditCard': 'Crédito',
};

// Card type options for forms
export const CardTypeOptions = [
  { label: 'Débito', value: CardTypeEnum.DebitCard },
  { label: 'Crédito', value: CardTypeEnum.CreditCard },
];

// Brazilian bank colors
export const BankCardColors = [
  { name: 'Nubank', color: 'from-purple-500 to-purple-700', hex: '#820AD1' },
  { name: 'Itaú', color: 'from-orange-500 to-orange-700', hex: '#EC7000' },
  { name: 'Inter', color: 'from-orange-400 to-red-500', hex: '#FF7A00' },
  { name: 'C6 Bank', color: 'from-gray-800 to-gray-900', hex: '#242424' },
  { name: 'Banco do Brasil', color: 'from-yellow-400 to-yellow-600', hex: '#FFCC00' },
  { name: 'Bradesco', color: 'from-red-600 to-red-800', hex: '#CC092F' },
  { name: 'Santander', color: 'from-red-500 to-red-700', hex: '#EC0000' },
  { name: 'Caixa', color: 'from-blue-600 to-blue-800', hex: '#005CA9' },
  { name: 'BTG', color: 'from-blue-900 to-blue-950', hex: '#000066' },
  { name: 'XP', color: 'from-gray-700 to-gray-900', hex: '#333333' },
  { name: 'PicPay', color: 'from-green-400 to-green-600', hex: '#21C25E' },
  { name: 'Neon', color: 'from-cyan-400 to-cyan-600', hex: '#00D4FF' },
  { name: 'Original', color: 'from-green-600 to-green-800', hex: '#00A651' },
  { name: 'Next', color: 'from-green-500 to-green-700', hex: '#00C853' },
  { name: 'Outro', color: 'from-slate-500 to-slate-700', hex: '#64748B' },
];

// Get card color by name or index
export const getCardColor = (name: string, index: number = 0): string => {
  const found = BankCardColors.find(c => 
    name.toLowerCase().includes(c.name.toLowerCase())
  );
  if (found) return found.color;
  return BankCardColors[index % BankCardColors.length].color;
};
