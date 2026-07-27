# Lab ระดับ Beginner — แอปเมนูร้านกาแฟ “BrewBoard”

## เป้าหมาย

สร้างหน้าจอมือถือสำหรับร้านกาแฟจำลอง **BrewBoard**:

- จัด layout ด้วย **Flexbox** (header, หมวดหมู่แนวนอน, รายการเมนู)
- ใช้ **FlatList** แสดงเมนูพร้อม pull-to-refresh
- จำลอง **Data Fetching + Local Cache ในหน่วยความจำ** (ยังไม่ใช้ SecureStore)
- รองรับสไตล์ต่างกันเล็กน้อยระหว่าง iOS / Android

ทำด้วยตัวเองก่อน แล้วค่อยเทียบกับ [`lab/solution/`](./lab/solution/)

---

## กรณีศึกษา

ร้านกาแฟ **BrewBoard** มีพนักงานใช้แท็บเล็ตหลังเคาน์เตอร์ดูเมนูและสถานะวัตถุดิบ
เน็ตในร้านไม่เสถียร — ต้องการให้เปิดแอปแล้วเห็นเมนูจาก cache ทันที แล้วค่อย sync ใหม่เมื่อดึง refresh

PO ต้องการหน้าจอเดียวที่:

1. แสดงแบรนด์และสรุปจำนวนรายการ
2. กรองหมวดหมู่ (ทั้งหมด / กาแฟ / ชา / ของว่าง)
3. เลื่อนรายการเมนูได้ลื่น (FlatList)
4. ดึงลง refresh แล้ว update จาก “API จำลอง” พร้อมเก็บ cache ล่าสุด

---

## โจทย์

### ส่วนที่ 1 — โครงสร้างหน้าจอ (Flexbox)

สร้าง `BrewBoardScreen` ที่ประกอบด้วย:

| ส่วน           | ข้อกำหนด layout                              |
| -------------- | -------------------------------------------- |
| Header         | แถว `row`: ชื่อแบรนด์ซ้าย, จำนวนรายการขวา    |
| Category chips | แถวแนวนอนเลื่อนได้ (`ScrollView` horizontal) |
| Menu list      | `FlatList` กินพื้นที่ที่เหลือ (`flex: 1`)    |

ใช้ `SafeAreaView` และกำหนด `StyleSheet` ให้ชัดเจน

### ส่วนที่ 2 — โมเดลข้อมูล + API จำลอง

สร้างไฟล์ข้อมูลอย่างน้อย:

```ts
export type MenuCategory = 'coffee' | 'tea' | 'snack';

export type MenuItem = {
  id: string;
  name: string;
  category: MenuCategory;
  price: number;
  inStock: boolean;
};
```

เขียน function `fetchMenu(): Promise<MenuItem[]>` ที่:

1. หน่วงเวลา ~500–800ms (จำลองเครือข่าย)
2. คืนรายการอย่างน้อย 8 รายการ ครบ 3 หมวด
3. สุ่ม `inStock` บางรายการเป็น `false` ตอน refresh ได้ (optional แต่แนะนำ)

### ส่วนที่ 3 — Local Cache ชั้นหน่วยความจำ

สร้าง module cache ง่าย ๆ:

- `getCachedMenu(): MenuItem[] | null`
- `setCachedMenu(items: MenuItem[]): void`

พฤติกรรมหน้าจอ:

1. ตอน mount ถ้ามี cache → แสดงทันที
2. จากนั้นเรียก `fetchMenu` แล้ว update UI + cache
3. Pull-to-refresh ทำข้อ 2 ซ้ำ
4. แสดงสถานะ `loading` / `refreshing` / `error` ให้ผู้ใช้เข้าใจ

### ส่วนที่ 4 — FlatList + Filter

- กรองตามหมวดที่เลือกก่อนส่งเข้า `data`
- `keyExtractor` ใช้ `id`
- แถวเมนูแสดงชื่อ, ราคา, และป้าย “หมด” เมื่อ `inStock === false`
- มี `ListEmptyComponent` เมื่อหมวดนั้นว่าง

### ส่วนที่ 5 — Platform polish

- ใช้ `Platform.select` ใส่เงาให้การ์ด/แถวแตกต่างกันบน iOS และ Android
- ใน `NOTES.md` อธิบายสั้น ๆ: ทำไมไม่ใช้ `ScrollView` + `map` สำหรับเมนูทั้งร้าน

### ส่วนที่ 6 — คำถามคิด (ตอบใน `NOTES.md`)

1. ถ้าพนักงานหมุนจอเป็น landscape layout ไหนที่ควรปรับก่อน?
2. Cache ในหน่วยความจำหายเมื่อไหร่? ระดับถัดไปจะย้ายไปที่ไหนได้บ้าง?
3. Bridge vs JSI สัมพันธ์กับ list scroll อย่างไรในทางปฏิบัติ?

---

## เกณฑ์ผ่าน

- [ ] Header + chips + FlatList จัดด้วย Flexbox ถูกต้องบนจอแคบ
- [ ] มี fetch จำลอง + in-memory cache ตามพฤติกรรมข้างบน
- [ ] กรองหมวดและ empty state ทำงาน
- [ ] มี `NOTES.md` ตอบคำถามคิด
- [ ] โค้ดเป็น TypeScript/TSX แยกไฟล์ชัด (screen / components / data)

---

## เฉลย

ดูโครงสร้างเต็มใน [`lab/solution/`](./lab/solution/)
