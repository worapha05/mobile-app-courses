import 'package:beginner_example/main.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('beginner catalog shows title', (tester) async {
    await tester.pumpWidget(const BeginnerExampleApp());
    expect(find.textContaining('Beginner'), findsOneWidget);
  });
}
