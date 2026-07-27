import '../models/product.dart';

/// Local persistence port — implement with Hive or Isar in the real app.
abstract interface class ProductCache {
  Future<List<Product>?> readAll();
  Future<void> writeAll(List<Product> products);
  Future<void> clear();
}

/// In-memory stand-in that mirrors Hive box semantics for labs.
class MemoryProductCache implements ProductCache {
  List<Product>? _products;
  DateTime? updatedAt;

  @override
  Future<List<Product>?> readAll() async => _products;

  @override
  Future<void> writeAll(List<Product> products) async {
    _products = List.unmodifiable(products);
    updatedAt = DateTime.now();
  }

  @override
  Future<void> clear() async {
    _products = null;
    updatedAt = null;
  }
}

/// Cache-aside repository: local first, then network, then update local.
class ProductRepository {
  ProductRepository({
    required this.apiFetch,
    required this.cache,
    this.staleTtl = const Duration(minutes: 5),
  });

  /// Injected to avoid hard Dio dependency in this teaching file.
  final Future<List<Product>> Function({bool forceRefresh}) apiFetch;
  final ProductCache cache;
  final Duration staleTtl;

  Future<List<Product>> getProducts({bool forceRefresh = false}) async {
    if (!forceRefresh) {
      final local = await cache.readAll();
      if (local != null && local.isNotEmpty) {
        // Stale-while-revalidate kickoff could be added here.
        return local;
      }
    }

    final remote = await apiFetch(forceRefresh: forceRefresh);
    await cache.writeAll(remote);
    return remote;
  }
}

/// Example Hive-shaped adapter (pseudocode kept as comments for reference).
///
/// ```dart
/// class HiveProductCache implements ProductCache {
///   HiveProductCache(this._box);
///   final Box<Map> _box;
///
///   @override
///   Future<List<Product>?> readAll() async {
///     final raw = _box.get('products');
///     if (raw == null) return null;
///     return (raw['items'] as List)
///         .cast<Map>()
///         .map((e) => Product.fromJson(Map<String, dynamic>.from(e)))
///         .toList();
///   }
///
///   @override
///   Future<void> writeAll(List<Product> products) async {
///     await _box.put('products', {
///       'items': products.map((e) => e.toJson()).toList(),
///       'savedAt': DateTime.now().toIso8601String(),
///     });
///   }
///
///   @override
///   Future<void> clear() => _box.delete('products');
/// }
/// ```
