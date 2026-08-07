import React, {createContext, useContext, useMemo, useState} from 'react';
import {BillRecord} from './types';
import {INITIAL_RECORDS} from './mockData';

interface RecordsContextValue {
  records: BillRecord[];
  addRecord: (record: BillRecord) => void;
}

const RecordsContext = createContext<RecordsContextValue | null>(null);

export function RecordsProvider({children}: {children: React.ReactNode}) {
  const [records, setRecords] = useState<BillRecord[]>(INITIAL_RECORDS);

  const value = useMemo(
    () => ({
      records,
      addRecord: (record: BillRecord) => {
        setRecords(prev => [record, ...prev]);
      },
    }),
    [records],
  );

  return (
    <RecordsContext.Provider value={value}>{children}</RecordsContext.Provider>
  );
}

export function useRecords() {
  const context = useContext(RecordsContext);
  if (!context) {
    throw new Error('useRecords must be used within RecordsProvider');
  }
  return context;
}
