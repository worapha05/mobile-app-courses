import 'entities.dart';

/// Application business rule — orchestrates repositories only.
class LoginUseCase {
  LoginUseCase(this._auth);

  final AuthRepository _auth;

  Future<Result<UserEntity>> call({
    required String email,
    required String password,
  }) async {
    final normalized = email.trim().toLowerCase();
    if (normalized.isEmpty || !normalized.contains('@')) {
      return const Err(AuthenticationFailure('อีเมลไม่ถูกต้อง'));
    }
    if (password.length < 8) {
      return const Err(AuthenticationFailure('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'));
    }
    return _auth.login(email: normalized, password: password);
  }
}

class RestoreSessionUseCase {
  RestoreSessionUseCase(this._auth);

  final AuthRepository _auth;

  Future<Result<UserEntity>> call() => _auth.restore();
}

class LogoutUseCase {
  LogoutUseCase(this._auth);

  final AuthRepository _auth;

  Future<void> call() => _auth.logout();
}
