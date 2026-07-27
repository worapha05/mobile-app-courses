import 'package:expert_example/main.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('expert catalog shows title', (tester) async {
    await tester.pumpWidget(const ExpertExampleApp());
    expect(find.textContaining('Expert'), findsOneWidget);
  });
}
