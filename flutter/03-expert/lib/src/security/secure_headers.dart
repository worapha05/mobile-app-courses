import 'dart:io';

import 'package:dio/dio.dart';
import 'package:dio/io.dart';

/// Security helpers: pinning hooks + secure header policy.
///
/// NOTE: Pin fingerprints below are EXAMPLES — replace with your real
/// SHA-256 SPKI pins and rotate with a backup pin before cert expiry.

typedef FingerprintSet = Set<String>;

/// Validates server certificate against pinned SHA-256 fingerprints.
bool validatePinnedCert(
  X509Certificate cert,
  FingerprintSet allowedSha256Fingerprints,
) {
  // In production use a proper SPKI pin library.
  // Here we demonstrate the control point Dio/HttpClient gives you.
  final fingerprint = cert.sha1.toString(); // placeholder — use sha256 SPKI in prod
  // Compare against configured pins (normalize hex format).
  final normalized = fingerprint.replaceAll(':', '').toLowerCase();
  return allowedSha256Fingerprints
      .map((e) => e.replaceAll(':', '').toLowerCase())
      .contains(normalized);
}

Dio createPinnedDio({
  required String baseUrl,
  required FingerprintSet pins,
  required Future<String?> Function() readAccessToken,
}) {
  final dio = Dio(BaseOptions(baseUrl: baseUrl));

  dio.httpClientAdapter = IOHttpClientAdapter(
    createHttpClient: () {
      final client = HttpClient();
      client.badCertificateCallback = (cert, host, port) {
        // Return true ONLY when pin matches — never blindly trust.
        return validatePinnedCert(cert, pins);
      };
      return client;
    },
  );

  dio.interceptors.add(
    InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await readAccessToken();
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        options.headers['X-Requested-With'] = 'FlutterApp';
        handler.next(options);
      },
    ),
  );

  return dio;
}

/// Flavor-aware config — inject via --dart-define or separate main_*.dart.
enum AppFlavor { dev, staging, production }

class AppConfig {
  const AppConfig({
    required this.flavor,
    required this.apiBaseUrl,
    required this.certificatePins,
    required this.enableLogging,
  });

  final AppFlavor flavor;
  final String apiBaseUrl;
  final FingerprintSet certificatePins;
  final bool enableLogging;

  static AppConfig fromEnvironment() {
    const flavorName = String.fromEnvironment('FLAVOR', defaultValue: 'dev');
    final flavor = AppFlavor.values.firstWhere(
      (e) => e.name == flavorName,
      orElse: () => AppFlavor.dev,
    );

    return switch (flavor) {
      AppFlavor.dev => const AppConfig(
          flavor: AppFlavor.dev,
          apiBaseUrl: 'https://dev-api.example.com',
          certificatePins: <String>{}, // often disabled on local/dev
          enableLogging: true,
        ),
      AppFlavor.staging => const AppConfig(
          flavor: AppFlavor.staging,
          apiBaseUrl: 'https://stg-api.example.com',
          certificatePins: <String>{'REPLACE_WITH_STG_PIN'},
          enableLogging: true,
        ),
      AppFlavor.production => const AppConfig(
          flavor: AppFlavor.production,
          apiBaseUrl: 'https://api.example.com',
          certificatePins: <String>{
            'REPLACE_WITH_PROD_PIN',
            'REPLACE_WITH_BACKUP_PIN',
          },
          enableLogging: false,
        ),
    };
  }
}

/// Obfuscation reminder (run in CI):
/// flutter build appbundle --flavor prod -t lib/main_prod.dart \
///   --obfuscate --split-debug-info=build/symbols \
///   --dart-define=FLAVOR=production
