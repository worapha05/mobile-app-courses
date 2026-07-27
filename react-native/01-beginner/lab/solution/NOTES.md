# NOTES — BrewBoard Lab

## ทำไมไม่ใช้ ScrollView + map

`ScrollView` จะ mount ลูกทุกตัวทันที เมนูร้านที่โตขึ้น (หรือมีรูป) จะกิน memory และทำให้ JS/UI หนักตั้งแต่เฟรมแรก
`FlatList` virtualize — สร้างแถวใกล้ viewport เท่านั้น จึงเหมาะกับรายการที่ไม่จำกัดความยาว

## คำถามคิด

1. **Landscape:** ปรับ chips + ความกว้างแถวเมนูก่อน (อาจเป็น 2 column ด้วย `numColumns` หรือแยก panel) และตรวจ Safe Area ด้านข้าง
2. **Cache หน่วยความจำหายเมื่อ:** reload JS bundle, ปิดแอป, หรือ process ถูกฆ่า — ระดับถัดไปย้ายไป AsyncStorage (ไม่ลับ) หรือ SecureStore (ลับ) หรือ SQLite (offline-first)
3. **Bridge vs JSI กับ scroll:** ถ้า JS ส่ง/รับข้อมูล native ถี่ ๆ ผ่าน Bridge (serialize) ตอนเลื่อน list จะแย่ง JS thread — New Arch/JSI และการเก็บงาน gesture/layout ฝั่ง native ช่วยลดอาการกระตุก
