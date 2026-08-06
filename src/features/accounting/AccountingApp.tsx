import React, {useState} from 'react';
import {BillRecord, RecordMode} from './types';
import {INITIAL_RECORDS} from './mockData';
import BillListScreen from './screens/BillListScreen';
import RecordEntryScreen from './screens/RecordEntryScreen';

type Screen =
  | {name: 'billList'}
  | {name: 'recordEntry'; mode: RecordMode};

export default function AccountingApp() {
  const [records, setRecords] = useState<BillRecord[]>(INITIAL_RECORDS);
  const [screen, setScreen] = useState<Screen>({name: 'billList'});

  const addRecord = (record: BillRecord) => {
    setRecords(prev => [record, ...prev]);
  };

  const handleAddRecord = (mode: RecordMode) => {
    setScreen({name: 'recordEntry', mode});
  };

  const handleSubmitRecord = (
    record: BillRecord,
    action: 'confirm' | 'again',
  ) => {
    addRecord(record);
    if (action === 'confirm') {
      setScreen({name: 'billList'});
    }
  };

  if (screen.name === 'recordEntry') {
    return (
      <RecordEntryScreen
        initialMode={screen.mode}
        onClose={() => setScreen({name: 'billList'})}
        onSubmit={handleSubmitRecord}
      />
    );
  }

  return (
    <BillListScreen
      records={records}
      onAddRecord={handleAddRecord}
      onRefresh={() => {}}
    />
  );
}
