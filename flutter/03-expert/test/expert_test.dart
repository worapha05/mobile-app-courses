import 'package:flutter_mastery_bootcamp_expert/expert.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('LoginUseCase validates email', () async {
    final repo = AuthRepositoryImpl(
      remote: FakeAuthRemoteDataSource(),
      local: InMemoryAuthLocalDataSource(),
    );
    final uc = LoginUseCase(repo);
    final result = await uc(email: 'bad', password: 'password1');
    expect(result, isA<Err<UserEntity>>());
  });
}
