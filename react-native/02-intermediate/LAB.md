# Lab ระดับ Intermediate — แอปภาคสนาม “FieldShelf”

## เป้าหมาย

สร้างแอป **FieldShelf** สำหรับพนักงานคลังสินค้าเคลื่อนที่:

- Navigation ด้วย **Expo Router** (Tabs + Stack + dynamic route)
- **React Query** ดึงรายการสินค้า + **SecureStore** เก็บ session token
- feature **สแกน/ถ่ายรูป** และ **บันทึกตำแหน่ง** พร้อม permission UX ที่สุภาพ

ทำด้วยตัวเองก่อน แล้วค่อยเทียบกับ [`lab/solution/`](./lab/solution/)

---

## กรณีศึกษา

บริษัทโลจิสติกส์ให้พนักงานเดินนับสต็อกตามโซน
แอปเดิมเป็นเว็บใน WebView — ช้า ออฟไลน์ไม่ได้ และ token ถูกเก็บใน AsyncStorage

CTO ขอ MVP ว่า:

1. ล็อกอินแล้วเข้าแท็บ Home / Scan / Profile ได้
2. แท็บ Home แสดงสินค้าจาก API จำลอง (React Query) กดแล้วเข้า `/product/[id]`
3. Token เก็บใน SecureStore เท่านั้น
4. แท็บ Scan ขอกล้องเมื่อเข้าหน้า — ถ้าปฏิเสธต้องมีทางไป Settings
5. ตอนดูรายละเอียดสินค้า กด “ปักพิกัดโซน” แล้วอ่าน location ครั้งเดียว

---

## โจทย์

### ส่วนที่ 1 — Expo Router

โครงอย่างน้อย:

```
app/
 _layout.tsx   # QueryClientProvider + Stack
 login.tsx
 (tabs)/
 _layout.tsx
 index.tsx   # รายการสินค้า
 scan.tsx
 profile.tsx
 product/[id].tsx
```

- ยังไม่ล็อกอิน → `Redirect` ไป `/login`
- ล็อกอินแล้วเปิด `/login` → ส่งกลับ `/(tabs)`

### ส่วนที่ 2 — Auth + SecureStore + React Query

- `login` สำเร็จ → บันทึก token → invalidate session/catalog
- `logout` → ลบ token + ล้าง catalog queries
- `fetchProducts` ต้องอ่าน token และโยน error ถ้าไม่มี
- แสดงสถานะ loading / error บน Home

### ส่วนที่ 3 — Layout รายการ (Flexbox)

- การ์ดสินค้าเป็นแถว: ชื่อซ้าย ราคา/สต็อกขวา
- ใช้ FlatList ไม่ใช่ ScrollView+map

### ส่วนที่ 4 — Scan + Location

- `scan.tsx`: อธิบายเหตุผลสั้น ๆ ก่อนปุ่มขอสิทธิ์; แสดง Camera preview เมื่อ granted
- `product/[id].tsx`: ปุ่มอ่านพิกัด แสดง lat/lng หรือข้อความเมื่อถูกปฏิเสธ

### ส่วนที่ 5 — คำถามคิด (`NOTES.md`)

1. ทำไมไม่เก็บรายการสินค้าลง SecureStore?
2. ถ้าจะเพิ่ม Drawer สำหรับเมนูแอดมิน จะวางในต้นไม้ navigator อย่างไร?
3. Push notification token ควรอยู่ชั้น storage ไหน และส่งต่อ backend เมื่อไหร่?

---

## เกณฑ์ผ่าน

- [ ] Auth gate ด้วย Expo Router ทำงาน
- [ ] React Query + SecureStore แยกหน้าที่ชัด
- [ ] Scan / Location จัดการ denied ได้
- [ ] มี NOTES ตอบคำถามคิด

---

## เฉลย

[`lab/solution/`](./lab/solution/)
