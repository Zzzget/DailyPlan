export type RecordMode = 'expense' | 'income';

export interface CategoryOption {
  id: string;
  label: string;
  icon: string;
}

export interface BillRecord {
  id: string;
  mode: RecordMode;
  amount: number;
  categoryId: string;
  categoryLabel: string;
  categoryIcon: string;
  note?: string;
  createdAt: number;
}

export type BillFilter = 'all' | RecordMode;
