import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {BillFilter} from '../types';

interface FilterTabsProps {
  value: BillFilter;
  onChange: (value: BillFilter) => void;
}

const OPTIONS: {value: BillFilter; label: string; color: string}[] = [
  {value: 'all', label: '全部', color: '#4B4B52'},
  {value: 'expense', label: '支出', color: '#FF7A30'},
  {value: 'income', label: '收入', color: '#4FA8FF'},
];

export default function FilterTabs({value, onChange}: FilterTabsProps) {
  return (
    <View style={styles.container}>
      {OPTIONS.map(option => {
        const active = value === option.value;
        return (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.item,
              active && {
                backgroundColor: `${option.color}1A`,
                borderColor: option.color,
              },
            ]}
            onPress={() => onChange(option.value)}
            activeOpacity={0.8}>
            <Text
              style={[
                styles.label,
                {color: active ? option.color : '#8A8A93'},
                active && styles.labelActive,
              ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
  },
  item: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    marginRight: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  labelActive: {
    fontWeight: '700',
  },
});
