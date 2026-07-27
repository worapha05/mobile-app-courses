import 'dart:async';

/// Async-Await & Futures — Dart Concurrency basics.
/// Prefer calling [runAsyncDemo] from the example app or tests.

Future<void> runAsyncDemo() async {
  print('1) Sequential await');
  final user = await fetchUser(id: 42);
  print('   User: $user');

  print('2) Parallel with Future.wait');
  final results = await Future.wait([
    fetchUser(id: 1),
    fetchUser(id: 2),
    fetchUser(id: 3),
  ]);
  print('   Got ${results.length} users');

  print('3) Error handling');
  try {
    await fetchUser(id: -1);
  } on ApiException catch (e) {
    print('   Caught: ${e.message}');
  }

  print('4) Timeout');
  try {
    await slowNetwork().timeout(const Duration(milliseconds: 200));
  } on TimeoutException {
    print('   Request timed out — show cached data');
  }

  print('5) Microtask vs event queue order');
  scheduleDemo();
  await Future<void>.delayed(Duration.zero);
}

Future<String> fetchUser({required int id}) async {
  await Future<void>.delayed(const Duration(milliseconds: 50));
  if (id < 0) {
    throw ApiException('Invalid user id: $id');
  }
  return 'User#$id';
}

Future<String> slowNetwork() async {
  await Future<void>.delayed(const Duration(seconds: 2));
  return 'payload';
}

void scheduleDemo() {
  Future(() => print('   event queue'));
  Future.microtask(() => print('   microtask (runs first)'));
  print('   sync code');
}

class ApiException implements Exception {
  ApiException(this.message);
  final String message;
}
