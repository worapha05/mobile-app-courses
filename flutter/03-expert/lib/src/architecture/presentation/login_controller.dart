import 'package:flutter/foundation.dart';

import '../domain/entities.dart';
import '../domain/use_cases.dart';

/// Presentation state — UI binds to this only.
sealed class LoginViewState {
  const LoginViewState();
}

final class LoginIdle extends LoginViewState {
  const LoginIdle();
}

final class LoginSubmitting extends LoginViewState {
  const LoginSubmitting();
}

final class LoginSuccess extends LoginViewState {
  const LoginSuccess(this.user);
  final UserEntity user;
}

final class LoginError extends LoginViewState {
  const LoginError(this.message);
  final String message;
}

/// Thin presentation controller — no Dio, no JSON.
class LoginController extends ChangeNotifier {
  LoginController(this._login);

  final LoginUseCase _login;
  LoginViewState _state = const LoginIdle();

  LoginViewState get state => _state;

  Future<void> submit({required String email, required String password}) async {
    _state = const LoginSubmitting();
    notifyListeners();

    final result = await _login(email: email, password: password);
    switch (result) {
      case Success(:final value):
        _state = LoginSuccess(value);
      case Err(:final failure):
        _state = LoginError(failure.message);
    }
    notifyListeners();
  }
}
