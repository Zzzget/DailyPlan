import React from 'react';
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {CategoryOption} from '../types';
import {AccountingTheme} from '../theme';

interface CategoryTabsProps {
  categories: CategoryOption[];
  selectedId: string;
  onSelect: (category: CategoryOption) => void;
  theme: AccountingTheme;
}

export default function CategoryTabs({
  categories,
  selectedId,
  onSelect,
  theme,
}: CategoryTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}>
      {categories.map(category => {
        const active = category.id === selectedId;
        return (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.chip,
              {
                backgroundColor: active ? theme.primary : theme.cardBg,
                borderColor: active ? theme.primary : theme.primaryLight,
              },
            ]}
            onPress={() => onSelect(category)}
            activeOpacity={0.85}>
            <Text style={styles.icon}>{category.icon}</Text>
            <Text
              style={[
                styles.label,
                {color: active ? theme.onPrimary : theme.textPrimary},
              ]}>
              {category.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
  },
  icon: {
    fontSize: 16,
    marginRight: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
});
