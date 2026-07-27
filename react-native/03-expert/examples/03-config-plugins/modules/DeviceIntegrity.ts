/**
 * TypeScript surface ของ native module จำลอง
 * ของจริงจะ generate จาก Expo Modules API (Kotlin/Swift)
 *
 * เป้าหมายการเรียนรู้:
 * - JS เรียก function ที่ข้ามไป native ผ่าน JSI/TurboModule
 * - หลีกเลี่ยงการส่ง payload ใหญ่ซ้ำ ๆ ผ่าน Bridge แบบเก่า
 */

export type DeviceIntegrityResult = {
  secureHardware: boolean;
  biometricEnrolled: boolean;
  riskScore: number;
};

/** ใน project จริง: import { DeviceIntegrity } from 'fieldshelf-device-integrity' */
export async function getDeviceIntegrity(): Promise<DeviceIntegrityResult> {
  // stub สำหรับเรียนใน Expo Go / โดยไม่มี native binary
  return {
    secureHardware: true,
    biometricEnrolled: true,
    riskScore: 0.12,
  };
}

/**
 * script เชื่อมต่อแนวคิด — แสดงว่าชั้น JS ควรบาง
 */
export async function assertDeviceTrusted(threshold = 0.5): Promise<boolean> {
  const result = await getDeviceIntegrity();
  return result.secureHardware && result.riskScore < threshold;
}
