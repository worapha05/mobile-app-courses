import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import type { MenuCategory } from '../data/menu';

export type CategoryFilter = 'all' | MenuCategory;

const OPTIONS: { key: CategoryFilter; label: string }[] = [
  { key: 'all', label: 'ทั้งหมด' },
  { key: 'coffee', label: 'กาแฟ' },
  { key: 'tea', label: 'ชา' },
  { key: 'snack', label: 'ของว่าง' },
];

type Props = {
  value: CategoryFilter;
  onChange: (next: CategoryFilter) => void;
};

export function CategoryChips({ value, onChange }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {OPTIONS.map((opt) => {
        const active = opt.key === value;
        return (
          <Pressable
            key={opt.key}
            onPress={() => onChange(opt.key)}
            style={[styles.chip, active && styles.chipActive]}
            role="button"
            aria-selected={active}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: 20, gap: 8, paddingBottom: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#f3e9df',
  },
  chipActive: { backgroundColor: '#9a3412' },
  label: { color: '#7c2d12', fontWeight: '700' },
  labelActive: { color: '#fff7ed' },
});
