import 'package:dio/dio.dart';

typedef TokenReader = Future<String?> Function();

/// Injects Authorization header on every request when a token exists.
class AuthInterceptor extends Interceptor {
  AuthInterceptor({required this.tokenReader});

  final TokenReader tokenReader;

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final token = await tokenReader();
    if (token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    if (err.response?.statusCode == 401) {
      // In a full app: trigger refresh-token flow or force logout via a bus/cubit.
      handler.next(
        err.copyWith(
          error: UnauthorizedException(err.message ?? 'Unauthorized'),
        ),
      );
      return;
    }
    handler.next(err);
  }
}

class UnauthorizedException implements Exception {
  UnauthorizedException(this.message);
  final String message;

  @override
  String toString() => 'UnauthorizedException: $message';
}
