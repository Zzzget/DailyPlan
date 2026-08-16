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

export interface DateRange {
  /** 起始日期，格式 YYYY-MM-DD（与日历组件的 dateString 一致，本地时区） */
  start: string;
  /** 结束日期，格式 YYYY-MM-DD；闭区间，筛选时包含结束日全天 */
  end: string;
}
