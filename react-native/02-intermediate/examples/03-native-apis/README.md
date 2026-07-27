# 03 — Native APIs

Camera, Location, Push Notifications + permission UX

## หมายเหตุ SDK ใหม่

- สิทธิ์กล้องใช้ named exports: `getCameraPermissionsAsync` / `requestCameraPermissionsAsync` (ไม่ใช้ class `Camera` แบบ legacy)
- `getExpoPushTokenAsync` ต้องมี `projectId` จาก EAS (`extra.eas.projectId`)
- ติดตั้งเพิ่ม: `npx expo install expo-camera expo-location expo-notifications expo-device expo-constants`
