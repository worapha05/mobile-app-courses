import 'package:flutter/material.dart';

/// Stateless: UI is a pure function of props.
class PriceTag extends StatelessWidget {
  const PriceTag({
    super.key,
    required this.amount,
    this.currency = 'THB',
  });

  final double amount;
  final String currency;

  @override
  Widget build(BuildContext context) {
    final formatted = amount.toStringAsFixed(2);
    return Text(
      '$currency $formatted',
      style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.w700,
            color: Theme.of(context).colorScheme.primary,
          ),
    );
  }
}

/// Stateful: owns mutable ephemeral UI state.
class QuantityStepper extends StatefulWidget {
  const QuantityStepper({
    super.key,
    this.initial = 1,
    this.min = 1,
    this.max = 99,
    this.onChanged,
  });

  final int initial;
  final int min;
  final int max;
  final ValueChanged<int>? onChanged;

  @override
  State<QuantityStepper> createState() => _QuantityStepperState();
}

class _QuantityStepperState extends State<QuantityStepper> {
  late int _qty;

  @override
  void initState() {
    super.initState();
    _qty = widget.initial.clamp(widget.min, widget.max);
  }

  void _change(int delta) {
    final next = (_qty + delta).clamp(widget.min, widget.max);
    if (next == _qty) return;
    setState(() => _qty = next);
    widget.onChanged?.call(_qty);
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        IconButton(
          onPressed: _qty > widget.min ? () => _change(-1) : null,
          icon: const Icon(Icons.remove_circle_outline),
        ),
        SizedBox(
          width: 40,
          child: Text(
            '$_qty',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.titleMedium,
          ),
        ),
        IconButton(
          onPressed: _qty < widget.max ? () => _change(1) : null,
          icon: const Icon(Icons.add_circle_outline),
        ),
      ],
    );
  }
}

/// Composition: combine Stateless + Stateful into a product card.
class ProductCard extends StatelessWidget {
  const ProductCard({
    super.key,
    required this.name,
    required this.price,
    this.onAddToCart,
  });

  final String name;
  final double price;
  final ValueChanged<int>? onAddToCart;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(name, style: Theme.of(context).textTheme.headlineSmall),
          const SizedBox(height: 8),
          PriceTag(amount: price),
          const SizedBox(height: 16),
          QuantityStepper(
            onChanged: (qty) {
              // Parent decides what to do — keep business logic out of leaf widgets.
              debugPrint('qty=$qty');
            },
          ),
          const SizedBox(height: 12),
          FilledButton(
            onPressed: () => onAddToCart?.call(1),
            child: const Text('เพิ่มลงตะกร้า'),
          ),
        ],
      ),
    );
  }
}
