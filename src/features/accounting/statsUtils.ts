import {BillRecord, RecordMode} from './types';

export interface CategorySlice {
  categoryId: string;
  label: string;
  icon: string;
  amount: number;
  percent: number;
  color: string;
}

export interface MonthPoint {
  month: number;
  label: string;
  amount: number;
}

const CATEGORY_COLORS = [
  '#FF7A30',
  '#4FA8FF',
  '#2EC4B6',
  '#FFB703',
  '#9B5DE5',
  '#F15BB5',
  '#00BBF9',
  '#E85D04',
  '#6C757D',
  '#38B000',
];

export function getCategoryColor(index: number): string {
  return CATEGORY_COLORS[index % CATEGORY_COLORS.length];
}

export function getYearMonth(timestamp: number): {year: number; month: number} {
  const date = new Date(timestamp);
  return {year: date.getFullYear(), month: date.getMonth() + 1};
}

export function aggregateCategorySlices(
  records: BillRecord[],
  mode: RecordMode,
  year: number,
  month: number,
): CategorySlice[] {
  const filtered = records.filter(record => {
    if (record.mode !== mode) {
      return false;
    }
    const ym = getYearMonth(record.createdAt);
    return ym.year === year && ym.month === month;
  });

  const totals = new Map<
    string,
    {label: string; icon: string; amount: number}
  >();

  filtered.forEach(record => {
    const prev = totals.get(record.categoryId);
    if (prev) {
      prev.amount += record.amount;
    } else {
      totals.set(record.categoryId, {
        label: record.categoryLabel,
        icon: record.categoryIcon,
        amount: record.amount,
      });
    }
  });

  const sum = Array.from(totals.values()).reduce(
    (acc, item) => acc + item.amount,
    0,
  );

  return Array.from(totals.entries())
    .map(([categoryId, item], index) => ({
      categoryId,
      label: item.label,
      icon: item.icon,
      amount: item.amount,
      percent: sum > 0 ? (item.amount / sum) * 100 : 0,
      color: getCategoryColor(index),
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function aggregateYearlyExpense(
  records: BillRecord[],
  year: number,
): MonthPoint[] {
  const amounts = Array.from({length: 12}, () => 0);

  records.forEach(record => {
    if (record.mode !== 'expense') {
      return;
    }
    const ym = getYearMonth(record.createdAt);
    if (ym.year === year) {
      amounts[ym.month - 1] += record.amount;
    }
  });

  return amounts.map((amount, index) => ({
    month: index + 1,
    label: `${index + 1}月`,
    amount,
  }));
}

export function sumSlices(slices: CategorySlice[]): number {
  return slices.reduce((acc, slice) => acc + slice.amount, 0);
}
