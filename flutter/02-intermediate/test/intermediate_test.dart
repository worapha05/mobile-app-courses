import 'package:flutter_mastery_bootcamp_intermediate/intermediate.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('CartNotifier totals', () {
    final cart = CartNotifier();
    cart.add(productId: '1', name: 'Item', unitPrice: 10);
    cart.add(productId: '1', name: 'Item', unitPrice: 10);
    expect(cart.state.totalQty, 2);
    expect(cart.state.totalPrice, 20);
  });
}
