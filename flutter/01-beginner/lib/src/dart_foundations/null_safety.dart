// Strict Null Safety examples — Modern Dart Foundations.
// Prefer calling [runNullSafetyDemo] from the example app or tests.

void runNullSafetyDemo({String? subtitle}) {
  // ── Non-nullable vs Nullable ──
  const title = 'Flutter Mastery';

  print(title.toUpperCase());
  print(subtitle?.toUpperCase() ?? 'No subtitle');

  // ── Null-aware operators ──
  final displayName = subtitle ?? 'Guest Learner';
  print('Welcome, $displayName');

  // ── Promotion after null check ──
  greet(null);
  greet('Ada');

  // ── Late initialization (assign before read) ──
  late final String token;
  token = fetchToken();
  print('Token length: ${token.length}');

  // ── Required named params (null-safe by default) ──
  final user = User(id: 1, email: 'dev@example.com');
  print(user.summary());
}

void greet(String? name) {
  if (name == null) {
    print('Hello, stranger');
    return;
  }
  // name promoted to String
  print('Hello, ${name.toUpperCase()}');
}

String fetchToken() => 'abc123secure';

class User {
  User({
    required this.id,
    required this.email,
    this.displayName,
  });

  final int id;
  final String email;
  final String? displayName;

  String summary() {
    final name = displayName?.trim();
    if (name == null || name.isEmpty) {
      return 'User#$id <$email>';
    }
    return '$name <$email>';
  }
}
