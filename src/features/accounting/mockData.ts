import {BillRecord} from './types';

const day = 24 * 60 * 60 * 1000;

/** 固定锚点：2026-08-07，保证 mock 月份分布稳定 */
const now = new Date(2026, 7, 7, 18, 0, 0).getTime();

function atMonth(monthIndex: number, dayOfMonth: number, hour = 12): number {
  return new Date(2026, monthIndex, dayOfMonth, hour, 0, 0).getTime();
}

export const INITIAL_RECORDS: BillRecord[] = [
  
];
