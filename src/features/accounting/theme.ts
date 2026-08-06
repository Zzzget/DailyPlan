import {RecordMode} from './types';

export interface AccountingTheme {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  primaryLighter: string;
  onPrimary: string;
  screenBg: string;
  cardBg: string;
  textPrimary: string;
  textSecondary: string;
}

const expenseTheme: AccountingTheme = {
  primary: '#FF7A30',
  primaryDark: '#E85D04',
  primaryLight: '#FFE3CC',
  primaryLighter: '#FFF4EB',
  onPrimary: '#FFFFFF',
  screenBg: '#FFF8F2',
  cardBg: '#FFFFFF',
  textPrimary: '#3A2A1E',
  textSecondary: '#9C8674',
};

const incomeTheme: AccountingTheme = {
  primary: '#4FA8FF',
  primaryDark: '#2E86DE',
  primaryLight: '#D6ECFF',
  primaryLighter: '#F0F8FF',
  onPrimary: '#FFFFFF',
  screenBg: '#F3FAFF',
  cardBg: '#FFFFFF',
  textPrimary: '#22384A',
  textSecondary: '#7E9AB0',
};

export function getAccountingTheme(mode: RecordMode): AccountingTheme {
  return mode === 'expense' ? expenseTheme : incomeTheme;
}
