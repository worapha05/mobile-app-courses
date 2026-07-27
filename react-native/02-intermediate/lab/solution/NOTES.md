# NOTES — FieldShelf Lab

## 1. ทำไมไม่เก็บรายการสินค้าลง SecureStore?

SecureStore เหมาะกับค่าสั้นที่ลับ (token) มีข้อจำกัดขนาดและไม่ได้ออกแบบเป็น database
รายการสินค้าเป็น server state → ใช้ React Query cache (และระดับ Expert จะลง SQLite สำหรับ offline)

## 2. Drawer สำหรับแอดมิน

วางเป็น Stack ระดับบน หรือ nest เป็น `app/(admin)/_layout.tsx` ที่เป็น Drawer
อย่าให้ Drawer ครอบ tabs ของพนักงานสนามถ้า IA คนละแบบ — แยก group ตามบทบาทชัดเจนกว่า

## 3. Push token

เก็บชั่วคราวในหน่วยความจำหลังลงทะเบียน แล้ว **ส่งขึ้น backend ทันที** คู่กับ user id
ไม่จำเป็นต้องใส่ SecureStore เสมอไป (ไม่ใช่ secret ระดับเดียวกับ refresh token) แต่ห้าม hard-code ใน repo และควร refresh เมื่อ reinstall / เปลี่ยนเครื่อง
