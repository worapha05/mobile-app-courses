# Lab ระดับ Expert — ระบบตรวจนับสต็อกออฟไลน์ “StockPulse”

## เป้าหมาย

ออกแบบและลงมือสร้างแกนของแอปองค์กร **StockPulse**:

- รายการงานยาวด้วย **FlashList**
- **Offline-First** ด้วย SQLite + outbox sync
- Config Plugin เล็กน้อย + ประตู **Biometric**
- เตรียมแนวทาง **EAS multi-env / OTA**

ทำด้วยตัวเองก่อน แล้วค่อยเทียบกับ [`lab/solution/`](./lab/solution/)

---

## กรณีศึกษา

โกดังภูมิภาคของเครือค้าปลีกต้องการให้พนักงานนับสต็อกได้แม้เน็ตล่ม
ข้อกำหนดจากสถาปนิกองค์กร:

1. เปิดแอปแล้วเห็นงานนับอย่างน้อย 1,000 รายการเลื่อนลื่น
2. บันทึกจำนวนลงเครื่องทันที แล้ว sync เมื่อกลับมาออนไลน์
3. ก่อนเข้าหน้าที่มีข้อมูลสต็อกจริง ต้องผ่าน FaceID/TouchID (หรือ device passcode fallback)
4. มี partner metadata ใน native config ผ่าน Config Plugin
5. แยก staging/production ได้ด้วย EAS profile และอธิบายขอบเขต OTA

---

## โจทย์

### ส่วนที่ 1 — FlashList Feed

- สร้างรายการงานนับอย่างน้อย 1,000 แถว (จำลองได้)
- ใช้ `@shopify/flash-list` พร้อม `estimatedItemSize`
- แถวสูงคงที่ และแยก `FeedRow` เป็น component

### ส่วนที่ 2 — SQLite + Outbox

ตารางอย่างน้อย:

- `jobs` หรือใช้รายการในหน่วยความจำก็ได้สำหรับฟีด
- `counts` (id, sku, quantity, updated_at, synced_at)
- `outbox` (id, aggregate_id, type, payload, attempts, last_error)

พฤติกรรม:

1. ผู้ใช้บันทึกจำนวน → เขียน counts + outbox ใน transaction เดียว
2. `syncNow()` ดึง outbox ตามลำดับ ยิง API จำลอง
3. สำเร็จ → ลบ outbox + ตั้ง synced_at
4. ล้มเหลว → เพิ่ม attempts + last_error (ไม่ลบแถว)

### ส่วนที่ 3 — Biometric Gate

- หน้าจอหลักของข้อมูลสต็อกถูกบล็อกจนกว่า `unlockWithBiometrics()` สำเร็จ
- แสดงเหตุผลเมื่อฮาร์ดแวร์/การลงทะเบียนไม่พร้อม

### ส่วนที่ 4 — Config Plugin + EAS เอกสาร

- มี `plugins/withPartnerMetadata.ts` ใส่ค่า partner id
- มี `eas.json` อย่างน้อย development / staging / production
- ใน `NOTES.md` อธิบาย: อะไร update ด้วย OTA ได้ / ต้อง build ใหม่

### ส่วนที่ 5 — คำถามคิด (`NOTES.md`)

1. ถ้าพนักงานสองคนแก้จำนวน SKU เดียวกันคนละเครื่อง จะเลือก conflict policy แบบไหน เพราะอะไร?
2. ทำไมการส่ง base64 รูปสินค้าจำนวนมากผ่าน Bridge ถึงอันตรายต่อ FPS?
3. `runtimeVersion` ควรผูกกับอะไรใน project นี้?

---

## เกณฑ์ผ่าน

- [ ] FlashList เลื่อนได้ด้วยข้อมูลขนาดใหญ่
- [ ] Offline write + outbox drain ทำงานตามสัญญา
- [ ] Biometric gate มี happy/failure path
- [ ] มี plugin + eas.json + NOTES ครบ

---

## เฉลย

[`lab/solution/`](./lab/solution/)
