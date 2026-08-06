import React, {useMemo, useState} from 'react';
import {
  Alert,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {BillRecord, CategoryOption, RecordMode} from '../types';
import {getCategoriesByMode} from '../categories';
import {getAccountingTheme} from '../theme';
import ModeSwitch from '../components/ModeSwitch';
import CategoryTabs from '../components/CategoryTabs';
import NumberPad from '../components/NumberPad';

interface RecordEntryScreenProps {
  initialMode: RecordMode;
  onClose: () => void;
  onSubmit: (record: BillRecord, action: 'confirm' | 'again') => void;
}

const MAX_INTEGER_DIGITS = 8;

export default function RecordEntryScreen({
  initialMode,
  onClose,
  onSubmit,
}: RecordEntryScreenProps) {
  const [mode, setMode] = useState<RecordMode>(initialMode);
  const categories = getCategoriesByMode(mode);
  const [selectedCategory, setSelectedCategory] = useState<CategoryOption>(
    categories[0],
  );
  const [amount, setAmount] = useState('0');
  const [note, setNote] = useState('');
  const [savedCount, setSavedCount] = useState(0);

  const theme = getAccountingTheme(mode);

  const numericAmount = useMemo(() => parseFloat(amount) || 0, [amount]);
  const canSubmit = numericAmount > 0;

  const handleModeChange = (nextMode: RecordMode) => {
    setMode(nextMode);
    const nextCategories = getCategoriesByMode(nextMode);
    setSelectedCategory(nextCategories[0]);
  };

  const handleKeyPress = (key: string) => {
    if (key === '.') {
      if (amount.includes('.')) {
        return;
      }
      setAmount(prev => `${prev}.`);
      return;
    }

    setAmount(prev => {
      if (prev.includes('.')) {
        const decimals = prev.split('.')[1] ?? '';
        if (decimals.length >= 2) {
          return prev;
        }
        return `${prev}${key}`;
      }
      if (prev === '0') {
        return key;
      }
      const integerPart = prev.replace('.', '');
      if (integerPart.length >= MAX_INTEGER_DIGITS) {
        return prev;
      }
      return `${prev}${key}`;
    });
  };

  const handleDelete = () => {
    setAmount(prev => {
      if (prev.length <= 1) {
        return '0';
      }
      const next = prev.slice(0, -1);
      return next === '' ? '0' : next;
    });
  };

  const buildRecord = (): BillRecord => ({
    id: `${Date.now()}-${Math.round(Math.random() * 1000)}`,
    mode,
    amount: numericAmount,
    categoryId: selectedCategory.id,
    categoryLabel: selectedCategory.label,
    categoryIcon: selectedCategory.icon,
    note: note.trim() ? note.trim() : undefined,
    createdAt: Date.now(),
  });

  const resetForNextEntry = () => {
    setAmount('0');
    setNote('');
    setSavedCount(prev => prev + 1);
  };

  const handleConfirm = () => {
    if (!canSubmit) {
      Alert.alert('请输入金额', '记账金额需要大于 0');
      return;
    }
    onSubmit(buildRecord(), 'confirm');
  };

  const handleRecordAgain = () => {
    if (!canSubmit) {
      Alert.alert('请输入金额', '记账金额需要大于 0');
      return;
    }
    onSubmit(buildRecord(), 'again');
    resetForNextEntry();
  };

  return (
    <SafeAreaView style={[styles.safeArea, {backgroundColor: theme.screenBg}]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={theme.screenBg}
      />
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton} hitSlop={8}>
          <Text style={[styles.closeLabel, {color: theme.textSecondary}]}>关闭</Text>
        </TouchableOpacity>
        <ModeSwitch mode={mode} onChange={handleModeChange} />
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.categorySection}>
        <CategoryTabs
          categories={categories}
          selectedId={selectedCategory.id}
          onSelect={setSelectedCategory}
          theme={theme}
        />
      </View>

      <View style={styles.amountSection}>
        <Text style={[styles.amountHint, {color: theme.textSecondary}]}>
          {mode === 'expense' ? '支出金额' : '收入金额'}
          {savedCount > 0 ? `  ·  本次已记 ${savedCount} 笔` : ''}
        </Text>
        <View style={styles.amountRow}>
          <Text style={[styles.currencySymbol, {color: theme.textPrimary}]}>¥</Text>
          <Text style={[styles.amountText, {color: theme.textPrimary}]} numberOfLines={1}>
            {amount}
          </Text>
        </View>
        <TextInput
          style={[styles.noteInput, {borderColor: theme.primaryLight, color: theme.textPrimary}]}
          placeholder="添加备注（选填）"
          placeholderTextColor={theme.textSecondary}
          value={note}
          onChangeText={setNote}
          returnKeyType="done"
        />
      </View>

      <NumberPad
        theme={theme}
        onKeyPress={handleKeyPress}
        onDelete={handleDelete}
        onConfirm={handleConfirm}
        onRecordAgain={handleRecordAgain}
        confirmDisabled={!canSubmit}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 12 : 4,
    paddingBottom: 8,
  },
  closeButton: {
    width: 56,
  },
  closeLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  headerSpacer: {
    width: 56,
  },
  categorySection: {
    marginTop: 8,
    marginBottom: 4,
  },
  amountSection: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 8,
  },
  amountHint: {
    fontSize: 13,
    marginBottom: 6,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  currencySymbol: {
    fontSize: 26,
    fontWeight: '600',
    marginRight: 6,
    marginBottom: 4,
  },
  amountText: {
    fontSize: 44,
    fontWeight: '700',
    flexShrink: 1,
  },
  noteInput: {
    marginTop: 16,
    borderBottomWidth: 1,
    paddingVertical: 8,
    fontSize: 15,
  },
});
