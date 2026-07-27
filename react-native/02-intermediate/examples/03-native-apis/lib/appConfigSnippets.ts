/**
 * ตัวอย่างสิทธิ์ใน app.json / app.config.ts
 * ต้องตรงกับ modules ที่ใช้จริงก่อน build
 */
export const nativePermissionConfig = {
  expo: {
    plugins: [
      [
        'expo-camera',
        {
          cameraPermission: 'ใช้กล้องเพื่อถ่ายรูปสินค้าภาคสนาม',
        },
      ],
      [
        'expo-location',
        {
          locationWhenInUsePermission: 'ใช้ตำแหน่งเพื่อบันทึกจุดตรวจงาน',
        },
      ],
      'expo-secure-store',
    ],
    android: {
      permissions: ['CAMERA', 'ACCESS_COARSE_LOCATION', 'ACCESS_FINE_LOCATION'],
    },
    ios: {
      infoPlist: {
        UIBackgroundModes: ['remote-notification'],
      },
    },
  },
} as const;
