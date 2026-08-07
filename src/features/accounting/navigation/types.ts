import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RecordMode} from '../types';

export type AccountingStackParamList = {
  BillList: undefined;
  RecordEntry: {mode: RecordMode};
  Stats: undefined;
};

export type BillListScreenProps = NativeStackScreenProps<
  AccountingStackParamList,
  'BillList'
>;

export type RecordEntryScreenProps = NativeStackScreenProps<
  AccountingStackParamList,
  'RecordEntry'
>;

export type StatsScreenProps = NativeStackScreenProps<
  AccountingStackParamList,
  'Stats'
>;
