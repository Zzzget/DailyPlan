import React, {useMemo, useState} from 'react';
import {
  RefreshControl,
  SafeAreaView,
  SectionList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {BillFilter, BillRecord, RecordMode} from '../types';
import {formatAmount, formatDate} from '../utils';
import FilterTabs from '../components/FilterTabs';
import BillListItem from '../components/BillListItem';

interface BillListScreenProps {
  records: BillRecord[];
  onAddRecord: (mode: RecordMode) => void;
  onRefresh: () => void;
}

interface Section {
  title: string;
  data: BillRecord[];
}

export default function BillListScreen({
  records,
  onAddRecord,
  onRefresh,
}: BillListScreenProps) {
  const [filter, setFilter] = useState<BillFilter>('all');
  const [refreshing, setRefreshing] = useState(false);

  const filteredRecords = useMemo(() => {
    if (filter === 'all') {
      return records;
    }
    return records.filter(record => record.mode === filter);
  }, [records, filter]);

  const totals = useMemo(() => {
    return filteredRecords.reduce(
      (acc, record) => {
        if (record.mode === 'expense') {
          acc.expense += record.amount;
        } else {
          acc.income += record.amount;
        }
        return acc;
      },
      {expense: 0, income: 0},
    );
  }, [filteredRecords]);

  const sections: Section[] = useMemo(() => {
    const groups = new Map<string, BillRecord[]>();
    filteredRecords.forEach(record => {
      const key = formatDate(record.createdAt);
      const list = groups.get(key) ?? [];
      list.push(record);
      groups.set(key, list);
    });
    return Array.from(groups.entries()).map(([title, data]) => ({
      title,
      data,
    }));
  }, [filteredRecords]);

  const handleRefresh = () => {
    setRefreshing(true);
    onRefresh();
    setTimeout(() => setRefreshing(false), 500);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <Text style={styles.title}>账单</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>支出</Text>
            <Text style={[styles.summaryValue, styles.expenseColor]}>
              {formatAmount(totals.expense)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>收入</Text>
            <Text style={[styles.summaryValue, styles.incomeColor]}>
              {formatAmount(totals.income)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.filterRow}>
        <FilterTabs value={filter} onChange={setFilter} />
      </View>

      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        renderItem={({item}) => <BillListItem record={item} />}
        renderSectionHeader={({section}) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>{section.title}</Text>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>暂无账单，点击右下角开始记账</Text>
          </View>
        }
      />

      <View style={styles.fabRow}>
        <TouchableOpacity
          style={[styles.fab, styles.fabIncome]}
          activeOpacity={0.85}
          onPress={() => onAddRecord('income')}>
          <Text style={styles.fabLabel}>+ 收入</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.fab, styles.fabExpense]}
          activeOpacity={0.85}
          onPress={() => onAddRecord('expense')}>
          <Text style={styles.fabLabel}>+ 支出</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#26262B',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 24,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#9A9AA3',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  expenseColor: {
    color: '#E85D04',
  },
  incomeColor: {
    color: '#2E86DE',
  },
  filterRow: {
    paddingBottom: 8,
  },
  listContent: {
    paddingBottom: 100,
  },
  sectionHeader: {
    backgroundColor: '#F7F7FA',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  sectionHeaderText: {
    fontSize: 13,
    color: '#9A9AA3',
    fontWeight: '600',
  },
  emptyState: {
    paddingTop: 80,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#B3B3BD',
  },
  fabRow: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    flexDirection: 'row',
    gap: 10,
  },
  fab: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 3},
    elevation: 4,
  },
  fabExpense: {
    backgroundColor: '#FF7A30',
  },
  fabIncome: {
    backgroundColor: '#4FA8FF',
  },
  fabLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
