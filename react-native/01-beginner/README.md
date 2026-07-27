# ระดับ Beginner — Mobile Fundamentals & Expo Core

ทฤษฎีและแนวทางปฏิบัติสำหรับเริ่มสร้างแอป iOS/Android ด้วย **React Native + Expo**
โฟกัส: สถาปัตยกรรมเอนจิน, Bridge vs JSI, Core Components, Flexbox, และการจัดการ state บนมือถือ

---

## สารบัญ

1. [React Native Architecture](#1-react-native-architecture)
2. [Bridge vs JSI Engine](#2-bridge-vs-jsi-engine)
3. [New Architecture: Fabric & TurboModules](#3-new-architecture-fabric--turbomodules)
4. [Expo Ecosystem: Go vs Development Builds](#4-expo-ecosystem-go-vs-development-builds)
5. [Core Components](#5-core-components)
6. [Layouts & Styling (Flexbox บน Mobile)](#6-layouts--styling-flexbox-บน-mobile)
7. [Mobile State ชั้นพื้นฐาน](#7-mobile-state-ชั้นพื้นฐาน)
8. [Best Practices ระดับ Beginner](#8-best-practices-ระดับ-beginner)
9. [แผนอ่าน examples](#9-แผนอ่าน-examples)

---

## 1. React Native Architecture

React Native ไม่ได้ “วาด HTML” — มันแปล React tree เป็น **Native Views** จริงของแต่ละ platform

```
┌─────────────────────────────────────────────┐
│  JavaScript Thread  │
│ React (reconciler) + Business Logic │
│ Engine: Hermes (แนะนำ) / JSC / V8  │
└──────────────────┬──────────────────────────┘
   │ สื่อสารผ่าน Bridge (เก่า)
   │ หรือ JSI (ใหม่)
┌──────────────────▼──────────────────────────┐
│  Native / UI Thread  │
│ iOS: UIView / UILabel / UIScrollView … │
│ Android: View / TextView / RecyclerView … │
└─────────────────────────────────────────────┘
```

### 1.1 JavaScript Engine — Hermes

**Hermes** คือ JS engine ที่ Meta สร้างเพื่อ Mobile โดยเฉพาะ

| จุดเด่น                                | ทำไมสำคัญ                   |
| -------------------------------------- | --------------------------- |
| Bytecode ตอน build                     | ลดเวลา parse ตอน cold start |
| ใช้หน่วยความจำต่ำกว่า                  | มือถือมี RAM จำกัด          |
| ดีบัก / profiling ที่ออกแบบมาสำหรับ RN | หา jank ได้เร็วขึ้น         |

ใน Expo project ใหม่มักเปิด Hermes เป็นค่าเริ่มต้น — เก็บไว้ อย่าปิดโดยไม่จำเป็น

### 1.2 Threads ที่ต้องจำ

| Thread               | หน้าที่                                      | ห้ามทำ                                           |
| -------------------- | -------------------------------------------- | ------------------------------------------------ |
| **JS Thread**        | รัน React, business logic, network callbacks | งาน CPU หนักยาว ๆ (JSON ก้อนยักษ์, encrypt ใหญ่) |
| **UI / Main Thread** | Layout, paint, gesture native                | บล็อกด้วย native work ที่ช้า                     |
| **Shadow / Fabric**  | คำนวณ layout ของ Yoga                        | —                                                |

อาการ “แอปกระตุกตอนเลื่อน list” มักมาจาก **JS thread ไม่ว่าง** ไม่ใช่แค่ CSS

### 1.3 Cross-platform rendering ทำงานอย่างไร

1. คุณเขียน `<View style={{ flex: 1 }}>`
2. React สร้าง element tree
3. Reconciler คำนวณ diff
4. Host config ของ RN สั่งสร้าง/update **native view**
5. **Yoga** คำนวณ Flexbox layout ให้ทั้ง iOS และ Android ใกล้เคียงกัน

ผลลัพธ์: UI “รู้สึก native” เพราะเป็น widget จริง — ไม่ใช่ WebView (ยกเว้นคุณตั้งใจใช้ `WebView`)

---

## 2. Bridge vs JSI Engine

นี่คือหัวใจที่แยก “ทำไมแอปช้าตอนคุยกับ Native” ออกจาก “ทำไม React re-render”

### 2.1 Bridge แบบดั้งเดิม (Legacy Architecture)

```
JS ──serialize JSON──► MessageQueue (async) ──deserialize──► Native
Native ──serialize──► MessageQueue ──► JS
```

ลักษณะสำคัญ:

- **อะซิงโครนัสเสมอ** — แม้จะเรียก function ที่ดูเหมือน sync
- ข้อมูลต้อง **serialize เป็น JSON** ข้ามสะพาน
- มี bottleneck เมื่อส่งข้อมูลบ่อย/ก้อนใหญ่ (เช่น scroll event ทุกเฟรม, base64 รูป)

### 2.2 JSI (JavaScript Interface)

**JSI** ให้ JS ถือ **reference ไปยัง C++ host object** ได้โดยตรง

```
JS ──เรียก method บน HostObject──► Native (C++ / platform)
  (ไม่ต้อง JSON serialize ทุกครั้ง)
```

ประโยชน์:

- เรียก sync ได้เมื่อจำเป็น (เช่นอ่านค่าจาก native memory)
- ลดต้นทุน copy/serialize
- เป็นรากฐานของ **TurboModules** และ library ประสิทธิภาพสูง (เช่น reanimated รุ่นใหม่)

### 2.3 ตารางเปรียบเทียบ

| หัวข้อ              | Bridge                              | JSI                         |
| ------------------- | ----------------------------------- | --------------------------- |
| รูปแบบการเรียก      | Async message                       | Direct call / HostObject    |
| Serialization       | JSON เกือบทุกครั้ง                  | ลด/เลี่ยงได้                |
| Type safety ข้ามขอบ | อ่อน                                | ดีขึ้นด้วย codegen          |
| เหมาะกับ            | โค้ดเก่า, modules ที่ยังไม่ migrate | project ใหม่, perf-critical |

> **สรุปสั้น:** Bridge = ส่งจดหมาย; JSI = คุยกันตรง ๆ ในหน่วยความจำเดียวกัน (ผ่าน C++ layer)

---

## 3. New Architecture: Fabric & TurboModules

### 3.1 Fabric (New Renderer)

- แทนที่ renderer เก่า
- ใช้ JSI ให้ JS และ native แชร์โครงสร้าง UI ได้มีประสิทธิภาพขึ้น
- Concurrent features ของ React สอดคล้องกับ native ได้ดีกว่า

### 3.2 TurboModules

- Native modules แบบใหม่ที่โหลด **lazy** และมี **codegen** จาก spec (TypeScript/Flow)
- เรียกผ่าน JSI แทน Bridge queue

### 3.3 ควรเปิดเมื่อไหร่?

| สถานการณ์                            | คำแนะนำ                       |
| ------------------------------------ | ----------------------------- |
| project ใหม่ Expo SDK ใหม่           | เปิด New Arch                 |
| มี native module เก่าที่ยังไม่รองรับ | ทดสอบทีละตัว หรือรอ migration |
| ต้องใช้ library ที่ require New Arch | เปิดและ lock version ให้ตรง   |

ตรวจใน `app.json` / `app.config.ts`:

```json
{
  "expo": {
    "newArchEnabled": true
  }
}
```

---

## 4. Expo Ecosystem: Go vs Development Builds

### 4.1 Expo คืออะไรในทางปฏิบัติ

Expo = ชุดเครื่องมือ + native runtime + services ที่ลดงานตั้ง Xcode/Gradle ด้วยมือ

ชั้นที่คุณจะเจอ:

| ชั้น             | ตัวอย่าง                                             |
| ---------------- | ---------------------------------------------------- |
| Expo SDK modules | `expo-camera`, `expo-secure-store`, `expo-router`    |
| Expo CLI / Metro | bundler, Fast Refresh                                |
| EAS              | Build, Submit, Update (OTA)                          |
| Config Plugins   | แก้ native project ตอน prebuild โดยไม่ eject แบบถาวร |

### 4.2 Expo Go

- แอปสำเร็จรูปมี native modules ชุดหนึ่งฝังอยู่แล้ว
- สแกน QR แล้วโหลด **JS bundle** ของคุณเข้าไปรัน
- เร็วสำหรับเรียน UI / navigation / หลาย Expo modules

ข้อจำกัด: ใช้ native module ที่ **ไม่ได้รวมใน Expo Go** ไม่ได้

### 4.3 Development Builds (Dev Client)

- คุณ build binary เอง (ท้องถิ่นหรือ EAS) ที่รวม native modules ที่ต้องการ
- ยังได้ Fast Refresh แบบ Expo
- ใกล้เคียง production binary มากกว่า Expo Go

```
เริ่มเรียน / prototype → Expo Go
ต้องการ custom native → Development Build
ส่งสโตร์  → Release Build (EAS)
```

---

## 5. Core Components

| Component                           | เทียบ Web โดยคร่าว | ใช้เมื่อ                                                     |
| ----------------------------------- | ------------------ | ------------------------------------------------------------ |
| `View`                              | `div`              | กล่อง layout, ไม่มี text                                     |
| `Text`                              | `span` / `p`       | **ข้อความทุกตัวต้องอยู่ใน Text**                             |
| `Image`                             | `img`              | รูปท้องถิ่น/remote (เริ่มต้น; production แนะนำ `expo-image`) |
| `ScrollView`                        | scroll container   | เนื้อหาสั้น ไม่รู้จำนวนแน่นอนแต่ไม่ยาวมาก                    |
| `FlatList`                          | virtualized list   | รายการยาว — render เฉพาะที่มองเห็น                           |
| `Pressable` / `TouchableOpacity`    | button             | การโต้ตอบผู้ใช้                                              |
| `TextInput`                         | `input`            | รับข้อความ                                                   |
| `SafeAreaView` / `SafeAreaProvider` | —                  | เลี่ยง notch / home indicator                                |

ข้อผิดพลาดยอดฮิต:

```tsx
// ❌ ผิด — string ห้ามเป็นลูกตรงของ View
<View>สวัสดี</View>

// ✅ ถูก
<View><Text>สวัสดี</Text></View>
```

---

## 6. Layouts & Styling (Flexbox บน Mobile)

React Native ใช้ **Flexbox เป็นค่าเริ่มต้น** แต่มีจุดต่างจากเว็บที่ต้องจำ

### 6.1 ความต่างสำคัญจาก CSS บนเว็บ

| หัวข้อ                   | Web (มักเจอ)           | React Native                                   |
| ------------------------ | ---------------------- | ---------------------------------------------- |
| `flexDirection` เริ่มต้น | `row`                  | **`column`**                                   |
| หน่วย                    | `px`, `rem`, `%`, `vh` | ตัวเลข = density-independent pixels            |
| CSS cascade / class      | มี                     | **ไม่มี** — ใช้ `StyleSheet` หรือ style object |
| Inheritance              | หลาย property สืบทอด   | เกือบไม่สืบทอด (ยกเว้นบางอย่างใน Text)         |

### 6.2 แกนหลักของ Flexbox บนมือถือ

```tsx
{
 flexDirection: 'row' | 'column',
 justifyContent: 'flex-start' | 'center' | 'space-between' | ...,
 alignItems: 'stretch' | 'center' | 'flex-start' | ...,
 flex: 1,  // กินพื้นที่ที่เหลือใน parent
 gap: 12,  // ระยะห่างลูก (SDK ใหม่รองรับดี)
}
```

แนวคิด:

- **Parent** ควบคุมการจัดลูกด้วย `justifyContent` / `alignItems`
- **Child** ควบคุมขนาดตัวเองด้วย `flex`, `width`/`height`, `alignSelf`

### 6.3 Absolute / Relative

- ค่าเริ่มต้นของ position ใน RN คือ `relative`
- `absolute` ยึดตาม parent ที่ใกล้ที่สุด — ใช้ทำ badge, overlay, floating button
- ระวัง absolute ทับเนื้อหาจนกดไม่ได้ — ตรวจ `zIndex` และ hit area

### 6.4 Platform-specific styling

```tsx
import { Platform, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  shadow: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOpacity: 0.15,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
    },
    android: { elevation: 4 },
  }),
});
```

หรือแยกไฟล์ `Button.ios.tsx` / `Button.android.tsx` เมื่อ UI ต่างกันจริง ๆ

### 6.5 Responsive บนมือถือ

- ใช้ `flex` และเปอร์เซ็นต์มากกว่า hard-code ความกว้างจอ
- `useWindowDimensions()` เมื่อต้องแตก layout ตามความกว้าง
- อย่าสมมติว่า “มือถือ = 390px” — มีพับจอ / แท็บเล็ต / landscape

---

## 7. Mobile State ชั้นพื้นฐาน

แม้ระดับ Beginner ยังไม่ลง React Query ลึก แต่ต้องแยกชั้น state ให้ถูกตั้งแต่แรก

| ชั้น               | ตัวอย่าง                   | ที่เก็บที่เหมาะสม                                  |
| ------------------ | -------------------------- | -------------------------------------------------- |
| **Ephemeral UI**   | modal เปิด/ปิด, tab ในหน้า | `useState`                                         |
| **Form draft**     | ช่องกรอกที่ยังไม่ submit   | `useState` / controlled inputs                     |
| **Session client** | theme, locale ที่ไม่ลับ    | Context / Zustand (ระดับถัดไป)                     |
| **Server cache**   | รายการสินค้าจาก API        | ยังไม่ persist; ระดับ Intermediate → React Query   |
| **Secrets**        | access token               | **SecureStore** (Intermediate) — ห้าม AsyncStorage |

หลัก: **อย่ายัดทุกอย่างเข้า Context เดียว** — จะทำให้ทั้งต้นไม้ re-render และยากต่อการคิดเรื่อง lifetime ของข้อมูล

---

## 8. Best Practices ระดับ Beginner

1. **ห่อข้อความด้วย `Text` เสมอ** และกำหนด typography ใน `StyleSheet`
2. **ใช้ `StyleSheet.create`** — อ่านง่าย และช่วยจับผิดพลาดบางชนิด
3. **List ยาว → `FlatList`** ห้าม `array.map` ใน `ScrollView`
4. **กำหนด `keyExtractor` ที่เสถียร** (id จากข้อมูล ไม่ใช่ index ถ้า reorder ได้)
5. **รูปต้องรู้ขนาด** หรือใช้ style บังคับความสูง — กัน layout jump
6. **แยก presentational components** ออกจากหน้าจอที่ fetch ข้อมูล
7. **ทดสอบบนทั้ง iOS และ Android** ตั้งแต่สัปดาห์แรก — shadow/elevation, font, Safe Area ต่างกัน
8. **อย่า optimize ก่อนวัด** แต่จงหลีกเลี่ยง anti-pattern ที่รู้ชัด (list ไม่ virtualize, inline function หนักใน `renderItem` โดยไม่จำเป็น)

---

## 9. แผนอ่าน examples

| folder                                                                      | เนื้อหา                                                   |
| --------------------------------------------------------------------------- | --------------------------------------------------------- |
| [`examples/01-architecture-concepts`](./examples/01-architecture-concepts/) | แผนภาพ Bridge/JSI ในโค้ด + checklist New Arch             |
| [`examples/02-core-components`](./examples/02-core-components/)             | View/Text/Image/ScrollView ประกอบเป็นหน้าการ์ด            |
| [`examples/03-layouts-styling`](./examples/03-layouts-styling/)             | Flexbox, absolute badge, Platform styles                  |
| [`examples/04-flatlist-patterns`](./examples/04-flatlist-patterns/)         | FlatList พื้นฐาน, separator, empty state, pull-to-refresh |

หลังจากอ่านจบ → ทำ [`LAB.md`](./LAB.md) (แอปเมนูร้านกาแฟจำลอง)

หรือรันตัวอย่างทั้งหมดทันทีที่ [`playground/`](./playground/)

```bash
cd playground && npm start
```

---

## เกณฑ์ผ่านระดับนี้

คุณผ่าน Beginner เมื่ออธิบายได้ว่า:

- ทำไม Hermes และ New Architecture สำคัญต่อ cold start / interop
- Bridge กับ JSI ต่างกันอย่างไรในแง่ serialization
- เมื่อไหร่ใช้ ScrollView vs FlatList
- ทำไม `flexDirection` เริ่มต้นถึงเป็น column
- Expo Go กับ Development Build เลือกอย่างไร
