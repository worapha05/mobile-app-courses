import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { ProductCard } from '../../components/ProductCard';
import { useProducts, useSession } from '../../hooks/useFieldShelf';

export default function HomeScreen() {
  const session = useSession();
  const products = useProducts(Boolean(session.data));

  if (products.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (products.isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{(products.error as Error).message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.caption}>{products.data?.length ?? 0} รายการในแคช</Text>
      <FlatList
        data={products.data ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ProductCard product={item} />}
        refreshControl={
          <RefreshControl
            refreshing={products.isRefetching}
            onRefresh={() => void products.refetch()}
          />
        }
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 16, backgroundColor: '#f8fafc' },
  caption: { color: '#64748b', marginBottom: 8, fontWeight: '600' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  error: { color: '#b91c1c', fontWeight: '700' },
});
