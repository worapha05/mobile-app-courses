import 'package:dio/dio.dart';

/// Minimal in-memory / injectable cache contract.
abstract interface class CacheStore {
  CacheEntry? read(String key);
  void write(String key, CacheEntry entry);
  void remove(String key);
  void clear();
}

class CacheEntry {
  CacheEntry({
    required this.statusCode,
    required this.data,
    required this.headers,
    required this.storedAt,
    required this.ttl,
  });

  final int statusCode;
  final dynamic data;
  final Map<String, List<String>> headers;
  final DateTime storedAt;
  final Duration ttl;

  bool get isExpired => DateTime.now().isAfter(storedAt.add(ttl));
}

class MemoryCacheStore implements CacheStore {
  final Map<String, CacheEntry> _map = {};

  @override
  CacheEntry? read(String key) => _map[key];

  @override
  void write(String key, CacheEntry entry) => _map[key] = entry;

  @override
  void remove(String key) => _map.remove(key);

  @override
  void clear() => _map.clear();
}

/// GET response cache with TTL. Supports force-refresh via Options.extra.
class CacheInterceptor extends Interceptor {
  CacheInterceptor({
    required this.store,
    this.defaultTtl = const Duration(seconds: 30),
  });

  static const extraForceRefresh = 'forceRefresh';
  static const extraFromCache = 'fromCache';

  final CacheStore store;
  final Duration defaultTtl;

  String _key(RequestOptions o) => '${o.method}:${o.uri}';

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    if (options.method.toUpperCase() != 'GET') {
      handler.next(options);
      return;
    }

    final force = options.extra[extraForceRefresh] == true;
    if (force) {
      store.remove(_key(options));
      handler.next(options);
      return;
    }

    final cached = store.read(_key(options));
    if (cached != null && !cached.isExpired) {
      handler.resolve(
        Response(
          requestOptions: options,
          data: cached.data,
          statusCode: cached.statusCode,
          headers: Headers.fromMap(cached.headers),
          extra: {
            ...options.extra,
            extraFromCache: true,
          },
        ),
        true,
      );
      return;
    }

    handler.next(options);
  }

  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    final options = response.requestOptions;
    if (options.method.toUpperCase() == 'GET' &&
        response.statusCode != null &&
        response.statusCode! >= 200 &&
        response.statusCode! < 300) {
      store.write(
        _key(options),
        CacheEntry(
          statusCode: response.statusCode!,
          data: response.data,
          headers: response.headers.map,
          storedAt: DateTime.now(),
          ttl: defaultTtl,
        ),
      );
    }
    handler.next(response);
  }
}
