import React, {useMemo, useState} from 'react';
import {
  RefreshControl,
  SectionList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {BillFilter, BillRecord, DateRange, RecordMode} from '../types';
import {
  formatAmount,
  formatDate,
  formatDayLabel,
  formatDayShort,
  isWithinDateRange,
} from '../utils';
import {SafeAreaView} from 'react-native-safe-area-context';
import FilterTabs from '../components/FilterTabs';
import BillListItem from '../components/BillListItem';
import DateRangePickerModal from '../components/DateRangePickerModal';
import {useRecords} from '../RecordsContext';
import {BillListScreenProps} from '../navigation/types';

interface Section {
  title: string;
  data: BillRecord[];
}

export default function BillListScreen({navigation}: BillListScreenProps) {
  const {records} = useRecords();
  /** 收支类型筛选：全部 / 仅支出 / 仅收入 */
  const [filter, setFilter] = useState<BillFilter>('all');
  /** 下拉刷新进行中标记，仅用于展示刷新动效 */
  const [refreshing, setRefreshing] = useState(false);
  /** 当前生效的日期范围筛选；null 表示不按日期过滤 */
  const [dateRange, setDateRange] = useState<DateRange | null>(null);
  /** 日期范围选择弹层是否可见 */
  const [pickerVisible, setPickerVisible] = useState(false);

  // 列表数据 = 全部账单先按收支类型过滤，再叠加日期范围过滤（闭区间，含结束日全天）
  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      if (filter !== 'all' && record.mode !== filter) {
        return false;
      }
      if (dateRange) {
        return isWithinDateRange(
          record.createdAt,
          dateRange.start,
          dateRange.end,
        );
      }
      return true;
    });
  }, [records, filter, dateRange]);

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
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleAddRecord = (mode: RecordMode) => {
    navigation.navigate('RecordEntry', {mode});
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
        <View style={styles.filterTabsWrap}>
          <FilterTabs value={filter} onChange={setFilter} />
        </View>
        <TouchableOpacity
          style={[styles.calendarBtn, dateRange && styles.calendarBtnActive]}
          activeOpacity={0.8}
          onPress={() => setPickerVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="选择日期范围">
          <Text
            style={[
              styles.calendarBtnText,
              dateRange && styles.calendarBtnTextActive,
            ]}>
            {dateRange
              ? `📅 ${formatDayShort(dateRange.start)}-${formatDayShort(
                  dateRange.end,
                )}`
              : '📅 日期'}
          </Text>
        </TouchableOpacity>
      </View>

      {dateRange && (
        <View style={styles.rangeHintBar}>
          <Text style={styles.rangeHintText}>
            已筛选 {formatDayLabel(dateRange.start)} ~{' '}
            {formatDayLabel(dateRange.end)} 的账单
          </Text>
          <TouchableOpacity
            onPress={() => setDateRange(null)}
            accessibilityRole="button"
            accessibilityLabel="清除日期筛选">
            <Text style={styles.rangeClearText}>清除</Text>
          </TouchableOpacity>
        </View>
      )}

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
            <Text style={styles.emptyText}>
              {dateRange
                ? '所选时间范围内暂无账单'
                : '暂无账单，点击右下角开始记账'}
            </Text>
          </View>
        }
      />

      <DateRangePickerModal
        visible={pickerVisible}
        value={dateRange}
        onConfirm={range => {
          setDateRange(range);
          setPickerVisible(false);
        }}
        onClose={() => setPickerVisible(false)}
      />

      <View style={styles.fabRow}>
        <TouchableOpacity
          style={[styles.fab, styles.fabStats]}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Stats')}
          accessibilityRole="button"
          accessibilityLabel="查看数据统计">
          <Text style={styles.fabStatsLabel}>统计</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.fab, styles.fabIncome]}
          activeOpacity={0.85}
          onPress={() => handleAddRecord('income')}>
          <Text style={styles.fabLabel}>+ 收入</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.fab, styles.fabExpense]}
          activeOpacity={0.85}
          onPress={() => handleAddRecord('expense')}>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 8,
  },
  filterTabsWrap: {
    flex: 1,
  },
  calendarBtn: {
    marginRight: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DDDDE3',
  },
  calendarBtnActive: {
    borderColor: '#26262B',
    backgroundColor: '#26262B0D',
  },
  calendarBtnText: {
    fontSize: 13,
    color: '#8A8A93',
    fontWeight: '600',
  },
  calendarBtnTextActive: {
    color: '#26262B',
    fontWeight: '700',
  },
  rangeHintBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#F7F7FA',
  },
  rangeHintText: {
    fontSize: 12,
    color: '#4B4B52',
    fontWeight: '600',
  },
  rangeClearText: {
    fontSize: 12,
    color: '#9A9AA3',
    fontWeight: '600',
    paddingLeft: 12,
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
  fabStats: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#26262B',
  },
  fabLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  fabStatsLabel: {
    color: '#26262B',
    fontSize: 14,
    fontWeight: '700',
  },
});
