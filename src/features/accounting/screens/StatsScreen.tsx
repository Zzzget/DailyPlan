import React, {useMemo} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {LineChart, PieChart} from 'react-native-gifted-charts';
import {useRecords} from '../RecordsContext';
import {StatsScreenProps} from '../navigation/types';
import {
  CategorySlice,
  aggregateCategorySlices,
  aggregateYearlyExpense,
  sumSlices,
} from '../statsUtils';
import {formatAmount} from '../utils';

function CategoryLegend({slices}: {slices: CategorySlice[]}) {
  if (slices.length === 0) {
    return <Text style={styles.emptyHint}>本月暂无数据</Text>;
  }

  return (
    <View style={styles.legendList}>
      {slices.map(slice => (
        <View key={slice.categoryId} style={styles.legendRow}>
          <View style={styles.legendLeft}>
            <View style={[styles.swatch, {backgroundColor: slice.color}]} />
            <Text style={styles.legendIcon}>{slice.icon}</Text>
            <Text style={styles.legendLabel} numberOfLines={1}>
              {slice.label}
            </Text>
          </View>
          <View style={styles.legendRight}>
            <Text style={styles.legendPercent}>
              {slice.percent.toFixed(1)}%
            </Text>
            <Text style={styles.legendAmount}>
              ¥{formatAmount(slice.amount)}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function CategoryPieCard({
  title,
  accent,
  slices,
}: {
  title: string;
  accent: string;
  slices: CategorySlice[];
}) {
  const total = sumSlices(slices);
  const pieData = slices.map(slice => ({
    value: slice.amount,
    color: slice.color,
    text: slice.percent >= 8 ? `${Math.round(slice.percent)}%` : '',
  }));

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={[styles.cardTotal, {color: accent}]}>
          ¥{formatAmount(total)}
        </Text>
      </View>

      {slices.length === 0 ? (
        <View style={styles.emptyChart}>
          <Text style={styles.emptyHint}>本月暂无数据</Text>
        </View>
      ) : (
        <View style={styles.pieRow}>
          <PieChart
            data={pieData}
            donut
            radius={78}
            innerRadius={48}
            innerCircleColor="#FFFFFF"
            centerLabelComponent={() => (
              <View style={styles.pieCenter}>
                <Text style={styles.pieCenterLabel}>合计</Text>
                <Text style={[styles.pieCenterValue, {color: accent}]}>
                  {total >= 1000
                    ? `${(total / 1000).toFixed(1)}k`
                    : formatAmount(total)}
                </Text>
              </View>
            )}
            showText
            textColor="#FFFFFF"
            textSize={10}
            fontWeight="700"
            focusOnPress
          />
        </View>
      )}

      <CategoryLegend slices={slices} />
    </View>
  );
}

export default function StatsScreen({navigation}: StatsScreenProps) {
  const {records} = useRecords();
  const now = new Date();
  const chartYear = now.getFullYear();
  const chartMonth = now.getMonth() + 1;

  const expenseSlices = useMemo(
    () => aggregateCategorySlices(records, 'expense', chartYear, chartMonth),
    [records, chartYear, chartMonth],
  );

  const incomeSlices = useMemo(
    () => aggregateCategorySlices(records, 'income', chartYear, chartMonth),
    [records, chartYear, chartMonth],
  );

  const yearlyExpense = useMemo(
    () => aggregateYearlyExpense(records, chartYear),
    [records, chartYear],
  );

  const lineData = useMemo(
    () =>
      yearlyExpense.map(point => ({
        value: Math.round(point.amount),
        label: point.label,
        labelTextStyle: styles.lineLabel,
      })),
    [yearlyExpense],
  );

  const yearTotal = useMemo(
    () => yearlyExpense.reduce((acc, point) => acc + point.amount, 0),
    [yearlyExpense],
  );

  const maxMonth = useMemo(() => {
    const max = Math.max(...yearlyExpense.map(point => point.amount), 0);
    return Math.ceil(max / 500) * 500 || 1000;
  }, [yearlyExpense]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />

      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="返回账单列表">
          <Text style={styles.backText}>‹ 返回</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>数据统计</Text>
        <View style={styles.navSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.periodHint}>
          {chartYear}年{chartMonth}月 · 分类占比
        </Text>

        <CategoryPieCard
          title="月度支出"
          accent="#E85D04"
          slices={expenseSlices}
        />

        <CategoryPieCard
          title="月度收入"
          accent="#2E86DE"
          slices={incomeSlices}
        />

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{chartYear}年消费趋势</Text>
            <Text style={[styles.cardTotal, styles.expenseAccent]}>
              ¥{formatAmount(yearTotal)}
            </Text>
          </View>
          <Text style={styles.cardSubtitle}>按月支出合计</Text>

          <View style={styles.lineWrap}>
            <LineChart
              data={lineData}
              height={200}
              width={300}
              spacing={22}
              initialSpacing={12}
              endSpacing={12}
              color="#FF7A30"
              thickness={2.5}
              startFillColor="rgba(255, 122, 48, 0.28)"
              endFillColor="rgba(255, 122, 48, 0.02)"
              startOpacity={0.9}
              endOpacity={0.05}
              areaChart
              hideDataPoints={false}
              dataPointsColor="#E85D04"
              dataPointsRadius={3.5}
              yAxisColor="#E8E8ED"
              xAxisColor="#E8E8ED"
              yAxisTextStyle={styles.axisText}
              xAxisLabelTextStyle={styles.lineLabel}
              rulesColor="#F0F0F4"
              rulesType="solid"
              noOfSections={4}
              maxValue={maxMonth}
              yAxisLabelPrefix=""
              formatYLabel={(label: string) => {
                const n = Number(label);
                if (n >= 1000) {
                  return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
                }
                return `${n}`;
              }}
              curved
              animateOnDataChange
              animationDuration={600}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FAFAFA',
  },
  backBtn: {
    minWidth: 64,
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  backText: {
    fontSize: 16,
    color: '#4B4B52',
    fontWeight: '600',
  },
  navTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#26262B',
  },
  navSpacer: {
    minWidth: 64,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 14,
  },
  periodHint: {
    fontSize: 13,
    color: '#8A8A93',
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEEEF2',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#26262B',
  },
  cardTotal: {
    fontSize: 15,
    fontWeight: '700',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#9A9AA3',
    marginBottom: 12,
  },
  expenseAccent: {
    color: '#E85D04',
  },
  pieRow: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  pieCenter: {
    alignItems: 'center',
  },
  pieCenterLabel: {
    fontSize: 11,
    color: '#9A9AA3',
  },
  pieCenterValue: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },
  emptyChart: {
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyHint: {
    fontSize: 13,
    color: '#B3B3BD',
    textAlign: 'center',
    paddingVertical: 8,
  },
  legendList: {
    gap: 10,
    marginTop: 4,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 28,
  },
  legendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 6,
    marginRight: 12,
  },
  swatch: {
    width: 10,
    height: 10,
    borderRadius: 3,
  },
  legendIcon: {
    fontSize: 14,
  },
  legendLabel: {
    fontSize: 14,
    color: '#3A3A42',
    fontWeight: '500',
    flexShrink: 1,
  },
  legendRight: {
    alignItems: 'flex-end',
  },
  legendPercent: {
    fontSize: 12,
    color: '#8A8A93',
    fontWeight: '600',
  },
  legendAmount: {
    fontSize: 13,
    color: '#26262B',
    fontWeight: '700',
    marginTop: 1,
  },
  lineWrap: {
    alignItems: 'center',
    overflow: 'hidden',
  },
  lineLabel: {
    fontSize: 10,
    color: '#9A9AA3',
    width: 28,
  },
  axisText: {
    fontSize: 10,
    color: '#9A9AA3',
  },
});
