📍 **Nav:** [`🏠 Dev Learning Courses Hub`](https://github.com/worapha05/dev-learning-courses-hub/blob/main/README.md) | [`📂 Mobile App Courses Index`](../README.md) | [`📝 Prompt File`](https://github.com/worapha05/ai-learning-prompts-hub/blob/main/course-generation/mobile-app-courses/react-native-prompt.md)

---

# React Native & Expo Bootcamp — Zero to Expert

bootcamp เรียนรู้ **React Native + Expo Ecosystem** แบบครบวงจรสำหรับ
**High-performance iOS & Android App Development**
จาก Mobile Fundamentals → Navigation / Native Features → Enterprise Scale / Offline-First / Production

---

## เป้าหมายของหลักสูตร

เมื่อจบหลักสูตรนี้ คุณจะสามารถ:

- อธิบายสถาปัตยกรรม React Native: **Hermes**, **Bridge vs JSI**, **Fabric / TurboModules** และเลือก New Architecture ได้ถูกจังหวะ
- สร้างแอปด้วย **Expo Go** และ **Development Builds** พร้อม Core Components + Flexbox บน Mobile
- ออกแบบ navigation ด้วย **Expo Router** (Tabs / Stacks / Drawers / Dynamic routes)
- จัดการ **server state** ด้วย React Query และเก็บข้อมูลลับด้วย **SecureStore** / AsyncStorage
- เชื่อมต่อ Hardware APIs: Camera, Push Notifications, Location พร้อมจัดการ Permissions
- ปรับ performance ที่ scale: **FlashList**, image caching, ลด bridge traffic, กัน memory leak
- ออกแบบ **Offline-First** ด้วย SQLite + sync pipeline และ Config Plugins สำหรับ Native Modules
- เตรียม production: Biometrics, multi-env, **EAS Build / Submit**, **OTA Updates**, security basics

---

## โครงสร้างหลักสูตร

| Level            | folder                                   | หัวข้อหลัก                                         | เวลาแนะนำ   |
| ---------------- | ---------------------------------------- | -------------------------------------------------- | ----------- |
| 1 — Beginner     | [`01-beginner/`](./01-beginner/)         | Architecture, Expo Core, Flexbox, Lists            | 1–2 สัปดาห์ |
| 2 — Intermediate | [`02-intermediate/`](./02-intermediate/) | Expo Router, React Query, SecureStore, Native APIs | 2–3 สัปดาห์ |
| 3 — Expert       | [`03-expert/`](./03-expert/)             | FlashList, Offline-First, Config Plugins, EAS/OTA  | 2–4 สัปดาห์ |

แต่ละระดับประกอบด้วย:

1. **`README.md`** — ทฤษฎี Mobile Architecture / Bridge vs JSI / Mobile State ภาษาไทย + Best Practices
2. **`examples/`** — โค้ด TypeScript/TSX (Expo Router, UI, Native Modules) สำหรับศึกษาและทดลอง
3. **`LAB.md`** — โจทย์สถานการณ์จริงพร้อมเฉลยเต็มใน `lab/solution/`

---

## ข้อกำหนดเบื้องต้น

- JavaScript/TypeScript พื้นฐาน (async/await, modules, generics เบื้องต้น)
- เคยใช้ React บนเว็บมาบ้าง (components, hooks, props)
- ติดตั้ง [Node.js 20 LTS+](https://nodejs.org/) และ [Git](https://git-scm.com/)
- โทรศัพท์จริงหรือ Emulator/Simulator (แนะนำมีอย่างน้อยหนึ่งเครื่องจริงสำหรับ Camera/Push)

```bash
node -v # v20.x ขึ้นไป
npx --yes expo --version
```

เครื่องมือแนะนำ:

| เครื่องมือ                          | ใช้ทำอะไร                               |
| ----------------------------------- | --------------------------------------- |
| Expo Go                             | ทดลองโค้ด JS-only เร็ว ๆ                |
| Expo Dev Client / Development Build | เมื่อต้องใช้ native modules นอก Expo Go |
| Android Studio / Xcode              | Emulator, signing, native debugging     |
| EAS CLI                             | Build / Submit / Update บนคลาวด์        |

---

## วิธีใช้ Bootcamp

1. อ่าน `README.md` ของระดับนั้นให้จบ — โฟกัสที่ **ทำไม Mobile ออกแบบต่างจาก Web**
2. **Beginner:** รัน playground ที่ผูกตัวอย่างไว้แล้วใน [`01-beginner/playground/`](./01-beginner/playground/)
3. ทำ Lab ใน `LAB.md` **ด้วยตัวเองก่อน** แล้วค่อยดูเฉลย
4. Intermediate / Expert: อ่าน `examples/` แล้วสร้าง Expo app แยกเพื่อทดลอง
5. ไประดับถัดไปเมื่ออธิบาย trade-off (เช่น Expo Go vs Dev Build, FlatList vs FlashList) ได้

### รัน Beginner ทันที

```bash
cd 01-beginner/playground
npm install
npm start
```

รายละเอียดเมนูตัวอย่าง: [`01-beginner/playground/README.md`](./01-beginner/playground/README.md)

> folder `01-beginner` … `03-expert` ยังเป็น **module เรียนรู้** (อ่าน/ทำ lab)
> `01-beginner/playground/` คือ Expo app จริงสำหรับ smoke test ระดับ Beginner

---

## Learning Path ที่แนะนำ

```
Beginner: Hermes / JSI / Fabric + Expo Core + Flexbox + FlatList
 ↓
Intermediate: Expo Router + React Query/SecureStore + Camera/Push/Location
 ↓
Expert: FlashList + Offline-First SQLite Sync + Config Plugins + EAS/OTA
 ↓
project จริงของคุณเอง (Field Service / Commerce / Offline Catalog App)
```

---

## หลักการสำคัญที่หลักสูตรย้ำตลอด

| หลักการ                    | ความหมายบน Mobile                                                          |
| -------------------------- | -------------------------------------------------------------------------- |
| UI thread ≠ JS thread      | อย่าบล็อก JS ด้วยงานหนัก — ทำให้ list / animation กระตุก                   |
| Prefer JSI over Bridge     | ส่งข้อมูลก้อนใหญ่ผ่าน Bridge แบบ serialize = ช้า; New Arch ช่วยลดต้นทุนนี้ |
| Permissions are UX         | ขอสิทธิ์ตอนจำเป็น พร้อมอธิบายเหตุผล — ไม่ขอทันทีตอนเปิดแอป                 |
| Colocate state by lifetime | UI state ≠ server cache ≠ secrets — เลือกที่เก็บให้ถูกชั้น                 |
| Offline is a feature       | สมาร์ทโฟนหลุดเน็ตบ่อย — ออกแบบ sync / conflict ตั้งแต่แรก                  |
| Measure on device          | Profiler บนเครื่องจริงสำคัญกว่า simulator สำหรับ memory / FPS              |

---

## เมื่อไหร่ใช้ Expo Go vs Development Build?

| สถานการณ์                                                      | แนวทาง                                             |
| -------------------------------------------------------------- | -------------------------------------------------- |
| เรียน Core Components, Router, styling                         | Expo Go เร็วสุด                                    |
| ใช้กล้อง / notification / location ผ่าน Expo modules ที่รองรับ | Expo Go หรือ Dev Build (ตรวจ compatibility matrix) |
| Custom native code / config plugin ที่แก้ native project       | **Development Build** จำเป็น                       |
| ใกล้ production, ต้อง match binary จริง                        | Dev Build + EAS                                    |

> **กฎทอง:** เริ่มด้วย Expo managed workflow — ย้ายไป Dev Build เมื่อ “ต้องการ native ที่ Expo Go ให้ไม่ได้” ไม่ใช่เพราะกลัว Expo

---

## Best Practices ข้ามระดับ (สรุปเร็ว)

1. **เปิด New Architecture** ใน project ใหม่ (Fabric + TurboModules) และทดสอบบนเครื่องจริง
2. **แยก server state ออกจาก client state** — React Query สำหรับ remote; Context/Zustand สำหรับ UI
3. **Secrets ใส่ SecureStore** — อย่าเก็บ token ใน AsyncStorage เปล่า ๆ
4. **List ยาว = virtualization บังคับ** — FlatList/FlashList; อย่า map ทั้ง array ใน ScrollView
5. **Image ต้องมีขนาดและ cache strategy** — ระบุ dimensions, ใช้ `expo-image`
6. **ทดสอบ offline path** และ permission denial path ทุก feature ที่แตะ hardware
