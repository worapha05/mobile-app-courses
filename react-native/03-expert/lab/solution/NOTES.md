# NOTES — StockPulse Lab

## OTA ได้ / ต้อง build ใหม่

| เปลี่ยนอะไร                                                        | ช่องทาง                                        |
| ------------------------------------------------------------------ | ---------------------------------------------- |
| JS/TSX, สไตล์, รูปใน bundle เดิม                                   | OTA (`expo-updates`) ได้ถ้า runtimeVersion ตรง |
| เพิ่ม native module, แก้ Info.plist/Gradle ผ่าน plugin, สิทธิ์ใหม่ | **ต้อง EAS Build ใหม่**                        |
| เปลี่ยน `runtimeVersion` policy / native binary                    | build ใหม่ + จัด channel ให้ถูก                |

## Conflict policy ที่เลือก

สำหรับงานนับสต็อกภาคสนาม แนะนำเริ่มด้วย **Last-Write-Wins พร้อมเก็บ audit** หรือ **server authoritative + แจ้งเตือน conflict**
ถ้ามูลค่าสูงมาก (ยา/อิเล็กทรอนิกส์ราคาแพง) ใช้คิวให้คนตัดสินดีกว่าการทับเงียบ ๆ

## ทำไม base64 รูปจำนวนมากผ่าน Bridge อันตราย

ต้อง serialize string ยักษ์ข้ามขอบ JS↔Native ซ้ำ ๆ กิน CPU/memory บน JS thread → แย่งเวลากับ React reconcile และทำให้ list/animation เฟรมหล่น
ส่งเป็นไฟล์ URI / ใช้ native image pipeline (`expo-image`) ดีกว่า

## runtimeVersion

ในเฉลยแนว `appVersion` (หรือ policy ที่ทีมกำหนด) — เป้าหมายคือ **binary กับ JS update ต้องเข้ากันได้**
เมื่อแตะ native ให้bump version ที่ทำให้ OTA เก่าไม่ไหลเข้า binary ใหม่โดยไม่ตั้งใจ
