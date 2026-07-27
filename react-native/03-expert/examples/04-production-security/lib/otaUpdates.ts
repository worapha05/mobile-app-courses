/**
 * OTA updates — แนวทางเรียกใช้ในโค้ด
 * ติดตั้ง: npx expo install expo-updates
 */
import * as Updates from 'expo-updates';

export async function checkAndApplyUpdate(): Promise<string> {
  if (__DEV__) {
    return 'skip_update_in_dev';
  }

  const result = await Updates.checkForUpdateAsync();
  if (!result.isAvailable) {
    return 'up_to_date';
  }

  await Updates.fetchUpdateAsync();
  await Updates.reloadAsync();
  return 'reloaded_with_update';
}

/**
 * ข้อควรจำ:
 * - เปลี่ยน native module / permission → ต้อง build ใหม่ ไม่ใช่ OTA อย่างเดียว
 * - runtimeVersion ต้องสอดคล้องกับ binary
 * - แยก channel staging/production
 */
