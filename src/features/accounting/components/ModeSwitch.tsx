import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {RecordMode} from '../types';
import {getAccountingTheme} from '../theme';

interface ModeSwitchProps {
  mode: RecordMode;
  onChange: (mode: RecordMode) => void;
}

const OPTIONS: {value: RecordMode; label: string}[] = [
  {value: 'expense', label: '支出'},
  {value: 'income', label: '收入'},
];

export default function ModeSwitch({mode, onChange}: ModeSwitchProps) {
  const theme = getAccountingTheme(mode);

  return (
    <View style={[styles.container, {backgroundColor: theme.primaryLight}]}>
      {OPTIONS.map(option => {
        const active = option.value === mode;
        const activeTheme = getAccountingTheme(option.value);
        return (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.item,
              active && {backgroundColor: activeTheme.primary},
            ]}
            onPress={() => onChange(option.value)}
            activeOpacity={0.85}>
            <Text
              style={[
                styles.label,
                {color: active ? activeTheme.onPrimary : theme.textSecondary},
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
    borderRadius: 22,
    padding: 4,
    alignSelf: 'center',
  },
  item: {
    paddingVertical: 8,
    paddingHorizontal: 28,
    borderRadius: 18,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
  labelActive: {
    fontWeight: '700',
  },
});
