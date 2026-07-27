# Android / iOS release hardening (สรุป)

## Android

- เปิด minify/shrink ใน release (R8/Proguard) ผ่าน EAS Gradle config เมื่อจำเป็น
- อย่าเก็บ API key ใน `BuildConfig` ที่ดึงกลับง่ายโดยไม่จำเป็น — ใช้ backend เป็นที่ออก secret
- ตรวจ permissions ใน manifest สุดท้ายหลัง prebuild

## iOS

- ใช้ App Store Connect encryption compliance ให้ถูกต้อง
- FaceID usage string ต้องชัดใน Info.plist (ผ่าน config plugin / expo-local-authentication)
- ตรวจ Associated Domains ถ้ามี deep link แบบ universal

## ทั้งสอง platform

- ไม่ log Authorization header
- แยก signing credentials ต่อ environment ใน EAS
- ทดสอบการ update OTA บน staging channel ก่อน production
