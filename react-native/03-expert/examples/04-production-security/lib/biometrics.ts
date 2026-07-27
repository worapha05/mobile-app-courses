import * as LocalAuthentication from 'expo-local-authentication';

export type UnlockResult = { ok: true; method: 'biometric' } | { ok: false; reason: string };

/**
 * ใช้ชีวมิติเป็นประตู unlock ก่อนอ่าน secret จาก SecureStore
 * ไม่ใช่ระบบเข้ารหัสแทน SecureStore
 *
 * หมายเหตุ: LocalAuthenticationResult เมื่อ success ไม่มี authenticationType
 * (มีแค่ success: true) — อย่าอ่าน field ที่ไม่มีใน type
 */
export async function unlockWithBiometrics(
  promptMessage = 'ยืนยันตัวตนเพื่อเข้า FieldShelf',
): Promise<UnlockResult> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  if (!hasHardware) {
    return { ok: false, reason: 'อุปกรณ์ไม่รองรับ biometrics' };
  }

  const enrolled = await LocalAuthentication.isEnrolledAsync();
  if (!enrolled) {
    return { ok: false, reason: 'ยังไม่ได้ลงทะเบียน FaceID/TouchID/ลายนิ้วมือ' };
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage,
    cancelLabel: 'ยกเลิก',
    disableDeviceFallback: false,
  });

  if (!result.success) {
    return { ok: false, reason: result.error ?? 'authentication_failed' };
  }

  return { ok: true, method: 'biometric' };
}
