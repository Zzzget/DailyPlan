import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {BillRecord} from '../types';
import {formatAmount, formatTime} from '../utils';

interface BillListItemProps {
  record: BillRecord;
}

export default function BillListItem({record}: BillListItemProps) {
  const isExpense = record.mode === 'expense';
  const amountColor = isExpense ? '#E85D04' : '#2E86DE';
  const iconBg = isExpense ? '#FFE3CC' : '#D6ECFF';

  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, {backgroundColor: iconBg}]}>
        <Text style={styles.icon}>{record.categoryIcon}</Text>
      </View>
      <View style={styles.middle}>
        <Text style={styles.category}>{record.categoryLabel}</Text>
        {record.note ? (
          <Text style={styles.note} numberOfLines={1}>
            {record.note}
          </Text>
        ) : null}
      </View>
      <View style={styles.right}>
        <Text style={[styles.amount, {color: amountColor}]}>
          {isExpense ? '-' : '+'}
          {formatAmount(record.amount)}
        </Text>
        <Text style={styles.time}>{formatTime(record.createdAt)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 18,
  },
  middle: {
    flex: 1,
  },
  category: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2B2B2E',
  },
  note: {
    fontSize: 12,
    color: '#9A9AA3',
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
  },
  time: {
    fontSize: 12,
    color: '#B3B3BD',
    marginTop: 2,
  },
});
