import 'package:flutter_bloc/flutter_bloc.dart';

/// Domain user — keep presentation models free of JSON annotations when possible.
class AppUser {
  const AppUser({required this.id, required this.email, required this.displayName});

  final String id;
  final String email;
  final String displayName;
}

/// Sealed states — exhaustively switch in UI.
sealed class AuthState {
  const AuthState();
}

final class AuthInitial extends AuthState {
  const AuthInitial();
}

final class AuthLoading extends AuthState {
  const AuthLoading();
}

final class AuthAuthenticated extends AuthState {
  const AuthAuthenticated(this.user);
  final AppUser user;
}

final class AuthUnauthenticated extends AuthState {
  const AuthUnauthenticated();
}

final class AuthFailure extends AuthState {
  const AuthFailure(this.message);
  final String message;
}

/// Port — Cubit depends on abstraction, not Dio.
abstract interface class AuthRepository {
  Future<AppUser?> restoreSession();
  Future<AppUser> login({required String email, required String password});
  Future<void> logout();
  bool get isLoggedIn;
}

/// Cubit: UI calls methods → emit immutable states.
class AuthCubit extends Cubit<AuthState> {
  AuthCubit(this._repo) : super(const AuthInitial());

  final AuthRepository _repo;

  Future<void> bootstrap() async {
    emit(const AuthLoading());
    try {
      final user = await _repo.restoreSession();
      if (user == null) {
        emit(const AuthUnauthenticated());
      } else {
        emit(AuthAuthenticated(user));
      }
    } catch (e) {
      emit(AuthFailure(e.toString()));
    }
  }

  Future<void> login({required String email, required String password}) async {
    emit(const AuthLoading());
    try {
      final user = await _repo.login(email: email, password: password);
      emit(AuthAuthenticated(user));
    } catch (e) {
      emit(AuthFailure(_mapError(e)));
    }
  }

  Future<void> logout() async {
    await _repo.logout();
    emit(const AuthUnauthenticated());
  }

  String _mapError(Object e) {
    // Map infra errors to user-safe messages at the edge of the cubit.
    return 'เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่';
  }
}

/// In-memory fake for labs / previews (swap for Dio implementation in app).
class FakeAuthRepository implements AuthRepository {
  AppUser? _user;

  @override
  bool get isLoggedIn => _user != null;

  @override
  Future<AppUser?> restoreSession() async {
    await Future<void>.delayed(const Duration(milliseconds: 200));
    return _user;
  }

  @override
  Future<AppUser> login({required String email, required String password}) async {
    await Future<void>.delayed(const Duration(milliseconds: 400));
    if (email.isEmpty || password.length < 4) {
      throw StateError('invalid credentials');
    }
    _user = AppUser(id: '1', email: email, displayName: email.split('@').first);
    return _user!;
  }

  @override
  Future<void> logout() async {
    _user = null;
  }
}
