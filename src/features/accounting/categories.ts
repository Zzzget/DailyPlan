import {CategoryOption, RecordMode} from './types';

export const EXPENSE_CATEGORIES: CategoryOption[] = [
  {id: 'food', label: '饮食', icon: '🍔'},
  {id: 'transport', label: '交通', icon: '🚌'},
  {id: 'fun', label: '娱乐', icon: '🎮'},
  {id: 'shopping', label: '购物', icon: '🛍️'},
  {id: 'home', label: '居住', icon: '🏠'},
  {id: 'medical', label: '医疗', icon: '💊'},
  {id: 'education', label: '教育', icon: '📚'},
  {id: 'communication', label: '通讯', icon: '📱'},
  {id: 'social', label: '人情', icon: '🎁'},
  {id: 'other-expense', label: '其他', icon: '🧾'},
];

export const INCOME_CATEGORIES: CategoryOption[] = [
  {id: 'salary', label: '工资', icon: '💰'},
  {id: 'bonus', label: '奖金', icon: '🏆'},
  {id: 'part-time', label: '兼职', icon: '💼'},
  {id: 'investment', label: '理财', icon: '📈'},
  {id: 'red-packet', label: '红包', icon: '🧧'},
  {id: 'refund', label: '退款', icon: '↩️'},
  {id: 'other-income', label: '其他', icon: '🧾'},
];

export function getCategoriesByMode(mode: RecordMode): CategoryOption[] {
  return mode === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
}
