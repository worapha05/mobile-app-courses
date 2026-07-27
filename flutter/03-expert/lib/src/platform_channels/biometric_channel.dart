import 'package:flutter/services.dart';

/// Dart side of a MethodChannel for biometric auth.
///
/// Android (Kotlin) & iOS (Swift) handlers live in the host app —
/// see comments at bottom for native sketches.
class BiometricChannel {
  BiometricChannel({
    MethodChannel? channel,
  }) : _channel = channel ?? const MethodChannel('com.example.app/biometrics');

  final MethodChannel _channel;

  Future<bool> isAvailable() async {
    try {
      final result = await _channel.invokeMethod<bool>('isAvailable');
      return result ?? false;
    } on PlatformException {
      return false;
    }
  }

  /// Returns true when the user passes biometric / device credential.
  Future<BiometricResult> authenticate({
    String reason = 'ยืนยันตัวตนเพื่อดำเนินการต่อ',
  }) async {
    try {
      final ok = await _channel.invokeMethod<bool>(
        'authenticate',
        <String, dynamic>{'reason': reason},
      );
      if (ok == true) return BiometricResult.success;
      return BiometricResult.failed;
    } on PlatformException catch (e) {
      return switch (e.code) {
        'NotAvailable' => BiometricResult.notAvailable,
        'UserCancel' => BiometricResult.userCancel,
        'LockedOut' => BiometricResult.lockedOut,
        _ => BiometricResult.failed,
      };
    }
  }
}

enum BiometricResult {
  success,
  failed,
  userCancel,
  notAvailable,
  lockedOut,
}

/// Push notification token bridge (example).
class PushChannel {
  PushChannel({
    MethodChannel? channel,
  }) : _channel = channel ?? const MethodChannel('com.example.app/push');

  final MethodChannel _channel;

  Future<String?> getDeviceToken() async {
    try {
      return await _channel.invokeMethod<String>('getDeviceToken');
    } on PlatformException {
      return null;
    }
  }
}

/*
─── Android (MainActivity.kt) sketch ───

MethodChannel(flutterEngine.dartExecutor.binaryMessenger, "com.example.app/biometrics")
  .setMethodCallHandler { call, result ->
    when (call.method) {
      "isAvailable" -> result.success(true)
      "authenticate" -> {
        // launch BiometricPrompt and result.success(true/false)
      }
      else -> result.notImplemented()
    }
  }

─── iOS (AppDelegate.swift) sketch ───

let channel = FlutterMethodChannel(name: "com.example.app/biometrics",
                                   binaryMessenger: controller.binaryMessenger)
channel.setMethodCallHandler { call, result in
  switch call.method {
  case "isAvailable": result(true)
  case "authenticate":
    let context = LAContext()
    // evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, ...)
  default: result(FlutterMethodNotImplemented)
  }
}
*/
