import '../domain/entities.dart';

/// DTO — lives in Data layer only.
class UserDto {
  const UserDto({
    required this.id,
    required this.email,
    required this.displayName,
  });

  final String id;
  final String email;
  final String displayName;

  factory UserDto.fromJson(Map<String, dynamic> json) {
    return UserDto(
      id: json['id'] as String,
      email: json['email'] as String,
      displayName: json['displayName'] as String? ?? json['email'] as String,
    );
  }

  UserEntity toEntity() => UserEntity(
        id: id,
        email: email,
        displayName: displayName,
      );
}

abstract interface class AuthRemoteDataSource {
  Future<UserDto> login({required String email, required String password});
  Future<UserDto?> me();
}

abstract interface class AuthLocalDataSource {
  Future<void> saveTokens(AuthTokens tokens);
  Future<AuthTokens?> readTokens();
  Future<void> clear();
  Future<void> cacheUser(UserEntity user);
  Future<UserEntity?> readCachedUser();
}

class AuthRepositoryImpl implements AuthRepository {
  AuthRepositoryImpl({
    required AuthRemoteDataSource remote,
    required AuthLocalDataSource local,
  })  : _remote = remote,
        _local = local;

  final AuthRemoteDataSource _remote;
  final AuthLocalDataSource _local;

  @override
  Future<Result<UserEntity>> login({
    required String email,
    required String password,
  }) async {
    try {
      final dto = await _remote.login(email: email, password: password);
      final entity = dto.toEntity();
      // In real app: remote also returns tokens — persist via secure storage.
      await _local.cacheUser(entity);
      return Success(entity);
    } on UnauthorizedException {
      return const Err(AuthenticationFailure());
    } on NetworkException {
      return const Err(NetworkFailure());
    } catch (_) {
      return const Err(UnexpectedFailure());
    }
  }

  @override
  Future<Result<UserEntity>> restore() async {
    final cached = await _local.readCachedUser();
    if (cached != null) return Success(cached);

    try {
      final dto = await _remote.me();
      if (dto == null) return const Err(AuthenticationFailure('ไม่มีเซสชัน'));
      final entity = dto.toEntity();
      await _local.cacheUser(entity);
      return Success(entity);
    } on NetworkException {
      return const Err(NetworkFailure());
    } catch (_) {
      return const Err(UnexpectedFailure());
    }
  }

  @override
  Future<void> logout() => _local.clear();
}

class UnauthorizedException implements Exception {}

class NetworkException implements Exception {}

/// Fake remote for offline learning.
class FakeAuthRemoteDataSource implements AuthRemoteDataSource {
  @override
  Future<UserDto> login({required String email, required String password}) async {
    await Future<void>.delayed(const Duration(milliseconds: 300));
    if (password == 'wrong') throw UnauthorizedException();
    return UserDto(id: 'u1', email: email, displayName: email.split('@').first);
  }

  @override
  Future<UserDto?> me() async => null;
}

class InMemoryAuthLocalDataSource implements AuthLocalDataSource {
  AuthTokens? _tokens;
  UserEntity? _user;

  @override
  Future<void> saveTokens(AuthTokens tokens) async => _tokens = tokens;

  @override
  Future<AuthTokens?> readTokens() async => _tokens;

  @override
  Future<void> clear() async {
    _tokens = null;
    _user = null;
  }

  @override
  Future<void> cacheUser(UserEntity user) async => _user = user;

  @override
  Future<UserEntity?> readCachedUser() async => _user;
}
