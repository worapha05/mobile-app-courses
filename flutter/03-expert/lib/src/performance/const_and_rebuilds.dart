import 'package:flutter/material.dart';

/// Patterns that reduce unnecessary rebuilds.

/// ✅ Prefer const constructors for static subtrees.
class ProductHeader extends StatelessWidget {
  const ProductHeader({super.key, required this.title});

  final String title;

  @override
  Widget build(BuildContext context) {
    return _Chrome(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Text(title, style: Theme.of(context).textTheme.titleLarge),
      ),
    );
  }
}

class _Chrome extends StatelessWidget {
  const _Chrome({required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Theme.of(context).colorScheme.surfaceContainerHighest,
      child: child,
    );
  }
}

/// ✅ Split rebuild scope: only the badge listens to count changes.
class CartIconButton extends StatelessWidget {
  const CartIconButton({
    super.key,
    required this.badgeCount,
    required this.onPressed,
  });

  final int badgeCount;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return Stack(
      clipBehavior: Clip.none,
      children: [
        IconButton(
          onPressed: onPressed,
          icon: const Icon(Icons.shopping_cart_outlined), // const icon
        ),
        if (badgeCount > 0)
          Positioned(
            right: 4,
            top: 4,
            child: _Badge(count: badgeCount), // only this updates when count changes
          ),
      ],
    );
  }
}

class _Badge extends StatelessWidget {
  const _Badge({required this.count});

  final int count;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
      decoration: BoxDecoration(
        color: scheme.error,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        '$count',
        style: TextStyle(color: scheme.onError, fontSize: 10),
      ),
    );
  }
}

/// ✅ List items with stable keys + extract item widget.
class OrderList extends StatelessWidget {
  const OrderList({super.key, required this.orderIds});

  final List<String> orderIds;

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      itemCount: orderIds.length,
      itemBuilder: (context, index) {
        final id = orderIds[index];
        return OrderTile(key: ValueKey(id), orderId: id);
      },
    );
  }
}

class OrderTile extends StatelessWidget {
  const OrderTile({super.key, required this.orderId});

  final String orderId;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      title: Text('Order $orderId'),
      trailing: const Icon(Icons.chevron_right), // const
    );
  }
}

/// DevTools tip:
/// - Turn on "Highlight repaints" / rebuild tracking
/// - If OrderTile flashes when typing in a search field above, hoist the
///   TextField state so the list is not under the same setState scope.
