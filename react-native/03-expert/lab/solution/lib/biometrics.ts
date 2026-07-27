import * as LocalAuthentication from 'expo-local-authentication';

export async function unlockStockPulse() {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  if (!hasHardware) return { ok: false as const, reason: 'no_hardware' };

  const enrolled = await LocalAuthentication.isEnrolledAsync();
  if (!enrolled) return { ok: false as const, reason: 'not_enrolled' };

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'ปลดล็อก StockPulse',
    cancelLabel: 'ยกเลิก',
    disableDeviceFallback: false,
  });

  if (!result.success) {
    return { ok: false as const, reason: result.error ?? 'failed' };
  }
  return { ok: true as const };
}
