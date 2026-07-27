import { Platform, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import type { MenuItem } from '../data/menu';

type Props = { item: MenuItem };

export function MenuRow({ item }: Props) {
  return (
    <View style={[styles.row, platformShadow]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.category}>{item.category}</Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.price}>฿{item.price}</Text>
        {!item.inStock ? <Text style={styles.oos}>หมด</Text> : null}
      </View>
    </View>
  );
}

const platformShadow: ViewStyle =
  Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#000',
      shadowOpacity: 0.06,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
    },
    android: { elevation: 2 },
    default: {},
  }) ?? {};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginVertical: 6,
    padding: 14,
    borderRadius: 14,
  },
  name: { fontSize: 16, fontWeight: '700', color: '#1c1917' },
  category: { marginTop: 2, color: '#a8a29e', textTransform: 'capitalize' },
  right: { alignItems: 'flex-end', gap: 4 },
  price: { fontWeight: '800', color: '#9a3412' },
  oos: {
    fontSize: 12,
    fontWeight: '700',
    color: '#b91c1c',
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
  },
});
