import 'package:intermediate_example/main.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('intermediate catalog shows title', (tester) async {
    await tester.pumpWidget(const IntermediateExampleApp());
    expect(find.textContaining('Intermediate'), findsOneWidget);
  });
}
