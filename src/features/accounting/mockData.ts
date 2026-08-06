import {BillRecord} from './types';

const day = 24 * 60 * 60 * 1000;
const now = Date.now();

export const INITIAL_RECORDS: BillRecord[] = [
  {
    id: 'seed-1',
    mode: 'expense',
    amount: 32.5,
    categoryId: 'food',
    categoryLabel: '饮食',
    categoryIcon: '🍔',
    note: '午餐',
    createdAt: now - day * 0,
  },
  {
    id: 'seed-2',
    mode: 'income',
    amount: 8000,
    categoryId: 'salary',
    categoryLabel: '工资',
    categoryIcon: '💰',
    note: '8 月工资',
    createdAt: now - day * 0.3,
  },
  {
    id: 'seed-3',
    mode: 'expense',
    amount: 128,
    categoryId: 'shopping',
    categoryLabel: '购物',
    categoryIcon: '🛍️',
    createdAt: now - day * 1,
  },
  {
    id: 'seed-4',
    mode: 'expense',
    amount: 15,
    categoryId: 'transport',
    categoryLabel: '交通',
    categoryIcon: '🚌',
    createdAt: now - day * 1.2,
  },
  {
    id: 'seed-5',
    mode: 'income',
    amount: 200,
    categoryId: 'red-packet',
    categoryLabel: '红包',
    categoryIcon: '🧧',
    note: '生日红包',
    createdAt: now - day * 2,
  },
  {
    id: 'seed-6',
    mode: 'expense',
    amount: 66,
    categoryId: 'fun',
    categoryLabel: '娱乐',
    categoryIcon: '🎮',
    createdAt: now - day * 3,
  },
];
