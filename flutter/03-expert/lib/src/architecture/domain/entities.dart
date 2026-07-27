// Domain entity — pure Dart, no Flutter/Dio imports.

class UserEntity {
  const UserEntity({
    required this.id,
    required this.email,
    required this.displayName,
  });

  final String id;
  final String email;
  final String displayName;
}

class AuthTokens {
  const AuthTokens({
    required this.accessToken,
    required this.refreshToken,
  });

  final String accessToken;
  final String refreshToken;
}

/// Failure type for domain/use cases (instead of throwing raw exceptions).
sealed class Failure {
  const Failure(this.message);
  final String message;
}

final class NetworkFailure extends Failure {
  const NetworkFailure([super.message = 'เครือข่ายมีปัญหา']);
}

final class AuthenticationFailure extends Failure {
  const AuthenticationFailure([super.message = 'ยืนยันตัวตนไม่สำเร็จ']);
}

final class UnexpectedFailure extends Failure {
  const UnexpectedFailure([super.message = 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ']);
}

/// Result helper without external packages.
sealed class Result<T> {
  const Result();
}

final class Success<T> extends Result<T> {
  const Success(this.value);
  final T value;
}

final class Err<T> extends Result<T> {
  const Err(this.failure);
  final Failure failure;
}

/// Port — implemented in Data layer.
abstract interface class AuthRepository {
  Future<Result<UserEntity>> login({
    required String email,
    required String password,
  });

  Future<Result<UserEntity>> restore();

  Future<void> logout();
}
