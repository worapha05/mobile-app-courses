import 'package:dio/dio.dart';

import 'interceptors/auth_interceptor.dart';
import 'interceptors/cache_interceptor.dart';

/// Factory for a production-shaped Dio client.
class DioClient {
  DioClient({
    required String baseUrl,
    required TokenReader tokenReader,
    required CacheStore cacheStore,
    bool enableLogging = true,
  }) : dio = Dio(
          BaseOptions(
            baseUrl: baseUrl,
            connectTimeout: const Duration(seconds: 15),
            receiveTimeout: const Duration(seconds: 20),
            headers: const {
              Headers.acceptHeader: 'application/json',
              Headers.contentTypeHeader: 'application/json',
            },
          ),
        ) {
    dio.interceptors.addAll([
      AuthInterceptor(tokenReader: tokenReader),
      CacheInterceptor(store: cacheStore),
      if (enableLogging)
        LogInterceptor(
          requestBody: true,
          responseBody: true,
          error: true,
        ),
    ]);
  }

  final Dio dio;
}

/// Thin API facade used by repositories.
class ProductApi {
  ProductApi(this._dio);

  final Dio _dio;

  Future<List<Map<String, dynamic>>> fetchProducts({
    CancelToken? cancelToken,
    bool forceRefresh = false,
  }) async {
    final response = await _dio.get<List<dynamic>>(
      '/products',
      cancelToken: cancelToken,
      options: Options(
        extra: {
          CacheInterceptor.extraForceRefresh: forceRefresh,
        },
      ),
    );
    final data = response.data ?? const [];
    return data.cast<Map<String, dynamic>>();
  }
}
