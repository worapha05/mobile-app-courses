import 'package:flutter/foundation.dart';

/// Lightweight Riverpod-style Notifier without codegen dependency.
/// In a real app prefer `riverpod_annotation` + `riverpod_generator`.
///
/// Usage sketch:
/// ```dart
/// final cartProvider = NotifierProvider<CartNotifier, CartState>(CartNotifier.new);
/// // ref.watch(cartProvider)
/// // ref.read(cartProvider.notifier).add(product)
/// ```

@immutable
class CartItem {
  const CartItem({required this.productId, required this.name, required this.unitPrice, this.qty = 1});

  final String productId;
  final String name;
  final double unitPrice;
  final int qty;

  double get lineTotal => unitPrice * qty;

  CartItem copyWith({int? qty}) => CartItem(
        productId: productId,
        name: name,
        unitPrice: unitPrice,
        qty: qty ?? this.qty,
      );
}

@immutable
class CartState {
  const CartState({this.items = const []});

  const CartState.empty() : items = const [];

  final List<CartItem> items;

  int get totalQty => items.fold(0, (s, e) => s + e.qty);

  double get totalPrice => items.fold(0, (s, e) => s + e.lineTotal);

  CartState copyWith({List<CartItem>? items}) => CartState(items: items ?? this.items);
}

/// Mirrors Riverpod Notifier API shape for teaching.
abstract class Notifier<T> {
  late T state;
  T build();
}

class CartNotifier extends Notifier<CartState> {
  CartNotifier() {
    state = build();
  }

  @override
  CartState build() => const CartState.empty();

  void add({
    required String productId,
    required String name,
    required double unitPrice,
  }) {
    final existing = state.items.indexWhere((e) => e.productId == productId);
    if (existing >= 0) {
      final updated = [...state.items];
      final item = updated[existing];
      updated[existing] = item.copyWith(qty: item.qty + 1);
      state = state.copyWith(items: updated);
      return;
    }
    state = state.copyWith(
      items: [
        ...state.items,
        CartItem(productId: productId, name: name, unitPrice: unitPrice),
      ],
    );
  }

  void setQty(String productId, int qty) {
    if (qty <= 0) {
      remove(productId);
      return;
    }
    state = state.copyWith(
      items: [
        for (final item in state.items)
          if (item.productId == productId) item.copyWith(qty: qty) else item,
      ],
    );
  }

  void remove(String productId) {
    state = state.copyWith(
      items: state.items.where((e) => e.productId != productId).toList(growable: false),
    );
  }

  void clear() => state = const CartState.empty();
}
