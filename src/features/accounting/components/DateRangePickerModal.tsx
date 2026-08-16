import React, {useEffect, useMemo, useState} from 'react';
import {Modal, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Calendar, LocaleConfig} from 'react-native-calendars';
import type {DateData} from 'react-native-calendars/src/types';
import {DateRange} from '../types';
import {formatDayLabel, toDayKey} from '../utils';

// 日历组件默认英文，注册一次中文语言包并设为默认
LocaleConfig.locales['zh-cn'] = {
  monthNames: [
    '1月',
    '2月',
    '3月',
    '4月',
    '5月',
    '6月',
    '7月',
    '8月',
    '9月',
    '10月',
    '11月',
    '12月',
  ],
  monthNamesShort: [
    '1月',
    '2月',
    '3月',
    '4月',
    '5月',
    '6月',
    '7月',
    '8月',
    '9月',
    '10月',
    '11月',
    '12月',
  ],
  dayNames: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
  dayNamesShort: ['日', '一', '二', '三', '四', '五', '六'],
  today: '今天',
};
LocaleConfig.defaultLocale = 'zh-cn';

/** 区间标记：startingDay/endingDay 标记区间两端使其圆角收尾，color 为当天背景色 */
type PeriodMarks = Record<
  string,
  {
    startingDay?: boolean;
    endingDay?: boolean;
    color?: string;
    textColor?: string;
  }
>;

const RANGE_ENDPOINT_COLOR = '#26262B';
const RANGE_MIDDLE_COLOR = '#EFEFF3';

interface DateRangePickerModalProps {
  /** 是否展示弹层 */
  visible: boolean;
  /** 已生效的时间范围，用于打开时回填；null 表示当前未筛选 */
  value: DateRange | null;
  /** 点击确定回调；若只选了起始日，end 会取与 start 相同的单日范围 */
  onConfirm: (range: DateRange) => void;
  /** 点击取消、遮罩或系统返回键时关闭弹层 */
  onClose: () => void;
}

export default function DateRangePickerModal({
  visible,
  value,
  onConfirm,
  onClose,
}: DateRangePickerModalProps) {
  /** 当前点选的起始日，格式 YYYY-MM-DD；未点选时为 null */
  const [start, setStart] = useState<string | null>(null);
  /** 当前点选的结束日，格式 YYYY-MM-DD；仅选起始日时为 null，提交按单日范围处理 */
  const [end, setEnd] = useState<string | null>(null);

  // 每次打开弹层时用已生效的范围回填，关闭后内部点选状态不影响外部
  useEffect(() => {
    if (visible) {
      setStart(value?.start ?? null);
      setEnd(value?.end ?? null);
    }
  }, [visible, value]);

  const handleDayPress = (day: DateData) => {
    if (!start || (start && end)) {
      // 全新一轮选择：以本次点选作为起点
      setStart(day.dateString);
      setEnd(null);
      return;
    }
    if (day.dateString < start) {
      // 点到起点之前的日期，把起点前移
      setStart(day.dateString);
      return;
    }
    setEnd(day.dateString);
  };

  const markedDates = useMemo<PeriodMarks>(() => {
    if (!start) {
      return {};
    }
    const effectiveEnd = end ?? start;
    const marks: PeriodMarks = {};

    // 逐日推进生成整段区间标记；起止端点深色、中间浅色
    const [sy, sm, sd] = start.split('-').map(Number);
    const [ey, em, ed] = effectiveEnd.split('-').map(Number);
    const cursor = new Date(sy, sm - 1, sd);
    const last = new Date(ey, em - 1, ed);

    while (cursor.getTime() <= last.getTime()) {
      const key = toDayKey(cursor);
      const isEndpoint = key === start || key === effectiveEnd;
      marks[key] = {
        startingDay: key === start,
        endingDay: key === effectiveEnd,
        color: isEndpoint ? RANGE_ENDPOINT_COLOR : RANGE_MIDDLE_COLOR,
        textColor: isEndpoint ? '#FFFFFF' : '#3A3A42',
      };
      cursor.setDate(cursor.getDate() + 1);
    }
    return marks;
  }, [start, end]);

  const handleConfirm = () => {
    if (!start) {
      return;
    }
    onConfirm({start, end: end ?? start});
  };

  const rangeHint = start
    ? `${formatDayLabel(start)} ~ ${formatDayLabel(end ?? start)}`
    : '点选两个日期作为起止';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <TouchableOpacity
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={onClose}
          accessibilityLabel="关闭日期选择"
        />
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>选择时间范围</Text>
            <Text style={styles.rangeHint}>{rangeHint}</Text>
          </View>

          <Calendar
            markingType="period"
            markedDates={markedDates}
            onDayPress={handleDayPress}
            enableSwipeMonths
            theme={{
              todayTextColor: '#FF7A30',
              arrowColor: '#26262B',
              textDayFontSize: 15,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 12,
            }}
          />

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.resetBtn}
              activeOpacity={0.8}
              onPress={() => {
                setStart(null);
                setEnd(null);
              }}>
              <Text style={styles.resetLabel}>重置</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelBtn}
              activeOpacity={0.8}
              onPress={onClose}>
              <Text style={styles.cancelLabel}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmBtn, !start && styles.confirmBtnDisabled]}
              activeOpacity={0.8}
              disabled={!start}
              onPress={handleConfirm}>
              <Text style={styles.confirmLabel}>确定</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'flex-end',
  },
  backdropTouchable: {
    flex: 1,
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#26262B',
  },
  rangeHint: {
    fontSize: 13,
    color: '#9A9AA3',
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 10,
  },
  resetBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  resetLabel: {
    fontSize: 14,
    color: '#9A9AA3',
    fontWeight: '600',
  },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DDDDE3',
  },
  cancelLabel: {
    fontSize: 14,
    color: '#4B4B52',
    fontWeight: '600',
  },
  confirmBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#26262B',
  },
  confirmBtnDisabled: {
    backgroundColor: '#C9C9D1',
  },
  confirmLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
