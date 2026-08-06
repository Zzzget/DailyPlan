import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {AccountingTheme} from '../theme';

interface NumberPadProps {
  onKeyPress: (key: string) => void;
  onDelete: () => void;
  onConfirm: () => void;
  onRecordAgain: () => void;
  confirmDisabled?: boolean;
  theme: AccountingTheme;
}

const KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['.', '0', 'del'],
];

export default function NumberPad({
  onKeyPress,
  onDelete,
  onConfirm,
  onRecordAgain,
  confirmDisabled,
  theme,
}: NumberPadProps) {
  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {KEYS.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map(key => (
              <TouchableOpacity
                key={key}
                style={styles.key}
                activeOpacity={0.6}
                onPress={() => (key === 'del' ? onDelete() : onKeyPress(key))}>
                <Text style={styles.keyLabel}>
                  {key === 'del' ? '⌫' : key}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.secondaryButton,
            {borderColor: theme.primary},
            confirmDisabled && styles.disabled,
          ]}
          activeOpacity={0.8}
          disabled={confirmDisabled}
          onPress={onRecordAgain}>
          <Text style={[styles.secondaryButtonLabel, {color: theme.primaryDark}]}>
            再记
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.primaryButton,
            {backgroundColor: theme.primary},
            confirmDisabled && styles.disabled,
          ]}
          activeOpacity={0.8}
          disabled={confirmDisabled}
          onPress={onConfirm}>
          <Text style={[styles.primaryButtonLabel, {color: theme.onPrimary}]}>
            确认
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  grid: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
  },
  key: {
    flex: 1,
    height: 56,
    marginHorizontal: 4,
    marginVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F4F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyLabel: {
    fontSize: 22,
    fontWeight: '600',
    color: '#2B2B2E',
  },
  actionsRow: {
    flexDirection: 'row',
    marginHorizontal: 4,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {},
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
  },
  primaryButtonLabel: {
    fontSize: 17,
    fontWeight: '700',
  },
  secondaryButtonLabel: {
    fontSize: 17,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.4,
  },
});
