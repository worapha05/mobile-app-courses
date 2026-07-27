import 'package:flutter/material.dart';
import 'package:flutter_mastery_bootcamp_beginner/beginner.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('null-safe User summary', () {
    final user = User(id: 1, email: 'a@b.com', displayName: 'Ada');
    expect(user.summary(), 'Ada <a@b.com>');
  });

  testWidgets('LifecycleDemoPage builds', (tester) async {
    await tester.pumpWidget(const MaterialApp(home: LifecycleDemoPage()));
    expect(find.text('setState → rebuild'), findsOneWidget);
  });
}
