# ระดับ Expert — Enterprise Scale, Performance & Offline-First

ทฤษฎีสำหรับแอปที่ต้องทนโหลดจริง: **performance ที่ scale**, **Offline-First**, **Custom Native Modules / Config Plugins**, และ **Production Security + EAS/OTA**

---

## สารบัญ

1. [สถาปัตยกรรมระดับองค์กรบน Mobile](#1-สถาปัตยกรรมระดับองค์กรบน-mobile)
2. [Bridge / JSI ที่งาน Performance](#2-bridge--jsi-ที่งาน-performance)
3. [Performance Tuning at Scale](#3-performance-tuning-at-scale)
4. [Offline-First + Sync Pipeline](#4-offline-first--sync-pipeline)
5. [Custom Native Modules & Expo Config Plugins](#5-custom-native-modules--expo-config-plugins)
6. [Production Security & DevOps (EAS / OTA)](#6-production-security--devops-eas--ota)
7. [Mobile State ชั้น Expert](#7-mobile-state-ชั้น-expert)
8. [Best Practices ระดับ Expert](#8-best-practices-ระดับ-expert)
9. [แผนอ่าน examples](#9-แผนอ่าน-examples)

---

## 1. สถาปัตยกรรมระดับองค์กรบน Mobile

แอป enterprise มักไม่ใช่ “หน้าจอ + API” ล้วน ๆ แต่เป็นระบบกระจายบนอุปกรณ์:

```
┌──────────── Presentation (Router / UI) ────────────┐
│ FlashList · expo-image · Reanimated (UI thread) │
├──────────── Application Services ──────────────────┤
│ Auth / Biometrics · Sync Engine · Feature Flags │
├──────────── Local Source of Truth ─────────────────┤
│ SQLite / Realm + SecureStore (secrets)  │
├──────────── Native Edge ───────────────────────────┤
│ TurboModules · Config Plugins · Platform APIs │
└──────────────────────┬─────────────────────────────┘
   │ sync when online
   ▼
   Backend / CDC / Queues
```

หลัก:

- **Local DB คือ source of truth ตอนออฟไลน์** — server เป็น source เมื่อ sync สำเร็จ
- **แยก sync engine** ออกจาก UI — UI สมัครสมาชิกข้อมูลท้องถิ่น
- **Environment แยก staging/production** ทั้ง API URL, bundle id, EAS profile

---

## 2. Bridge / JSI ที่งาน Performance

จุดเจ็บปวด classic เมื่อ scale:

| Anti-pattern                       | ผล                            | แนวแก้                                         |
| ---------------------------------- | ----------------------------- | ---------------------------------------------- |
| ส่ง object ใหญ่ผ่าน Bridge ถี่ ๆ   | JS thread หนาแน่น, frame drop | ลด frequency, ใช้ JSI module, ย้ายงานลง native |
| อ่าน SecureStore ทุกครั้งใน render | latency + churn               | cache ใน memory หลัง unlock                    |
| decode รูปใหญ่บน JS                | memory spike                  | `expo-image`, กำหนดขนาด, disk cache            |
| นับ list 10k ใน ScrollView         | OOM / ANR                     | FlashList / recycler                           |

New Architecture ไม่ได้ “ทำให้โค้ดแย่เร็วขึ้นเอง” — มันลดต้นทุน interop ให้คุณออกแบบ data path ที่ถูกต้องได้ง่ายขึ้น

---

## 3. Performance Tuning at Scale

### 3.1 FlatList vs FlashList

|                          | FlatList      | FlashList (`@shopify/flash-list`)      |
| ------------------------ | ------------- | -------------------------------------- |
| Virtualization           | มี            | มี + cell recycling ที่คาดการณ์ได้กว่า |
| ต้องรู้ขนาดโดยประมาณ     | ไม่บังคับเสมอ | **แนะนำ `estimatedItemSize`**          |
| รายการยาวมาก / รูปแบบซ้ำ | ใช้ได้        | มักลื่นและใช้ memory ดีกว่า            |

กฎปฏิบัติ:

- ให้แถวสูงคงที่หรือประมาณได้
- หลีกเลี่ยง anonymous component ใหม่ทุก render ใน `renderItem` โดยไม่จำเป็น
- `keyExtractor` เสถียร
- อย่าใส่ค่าที่เปลี่ยนถี่มากใน context ที่ห่อทั้ง list

### 3.2 Memory leaks ที่พบบ่อยบน RN

- subscription (`AppState`, location watch, NetInfo) ไม่ unsubscribe ใน cleanup
- เก็บอ้างอิง component ไว้ใน singleton / module scope
- timer / debounce ไม่ clear
- image / video ที่ไม่ปล่อยเมื่อออกหน้า

### 3.3 Image loading profiles

ใช้ `expo-image` เป็นค่าเริ่มต้นในงานจริง:

- disk + memory cache
- placeholder / transition
- ระบุความกว้าง-สูงเพื่อลด layout thrash
- เลือกความละเอียดตามความหนาแน่นจอ ไม่ดึง 4K มาโชว์ thumbnail

### 3.4 วัดก่อนเดา

- React Native Performance Monitor / Flipper / Xcode Instruments / Android Studio Profiler
- วัดบน **เครื่องกลาง-ล่าง** ไม่ใช่แค่ flagship

---

## 4. Offline-First + Sync Pipeline

### 4.1 ทำไม Offline-First

มือถือหลุดเน็ตตามลิฟต์/โกดัง/ทุ่งนา — feature หลักต้องทำงานได้โดยไม่รอ API

### 4.2 โมเดลข้อมูลท้องถิ่น

| ทางเลือก                   | จุดเด่น                        | เหมาะกับ                          |
| -------------------------- | ------------------------------ | --------------------------------- |
| **SQLite** (`expo-sqlite`) | SQLคุ้นเคย, เบา, ควบคุม schema | sync ชัดเจน, รายงาน, query        |
| **Realm**                  | object model, reactive         | ทีมที่ชอบ ORM-like + live objects |

หลักสูตรนี้ใช้ **SQLite** เป็นตัวอย่างหลัก เพราะโปร่งใสเรื่อง sync table

### 4.3 Outbox pattern

```
User action → เขียนลง SQLite (committed)
  → ใส่แถว outbox (pending)
  → เมื่อ online: ส่งตามลำดับ / batch
  → สำเร็จ: mark synced + update server version
  → ขัดแย้ง: ใช้ policy (LWW / manual merge)
```

### 4.4 Conflict policy (เลือกให้ชัด)

| นโยบาย                | ความหมาย                                   |
| --------------------- | ------------------------------------------ |
| Last-Write-Wins (LWW) | timestamp ใหม่ชนะ — ง่าย แต่สูญเสียของเก่า |
| Server Authoritative  | server ชนะเสมอ                             |
| Field-level merge     | รวมทีละฟิลด์ — ซับซ้อนขึ้น                 |
| Manual queue          | ให้คนตัดสิน — เหมาะของมีมูลค่าสูง          |

### 4.5 สถานะเครือข่าย

ผูก sync กับ NetInfo + AppState:

- online + foreground → drain outbox
- backoff เมื่อ 5xx / timeout
- idempotency key ต่อ mutation กันส่งซ้ำ

---

## 5. Custom Native Modules & Expo Config Plugins

### 5.1 เมื่อไหร่ต้องลง native

- API ที่ Expo/community ยังไม่ครอบ
- ต้องการ performance พิเศษ / hardware เฉพาะ
- ต้องแก้ Info.plist / Gradle / entitlements แบบกำหนดเอง

### 5.2 Config Plugins

Config Plugin = function ที่แก้ native project **ตอน `expo prebuild`**

ข้อดี: ยังอยู่ใน ecosystem ของ managed + EAS โดยไม่ maintain folder `ios/`/`android/` ด้วยมือถาวร (สามารถ generate ใหม่ได้)

```ts
// plugins/withSomething.ts
import { ConfigPlugin, withInfoPlist } from 'expo/config-plugins';

const withSomething: ConfigPlugin = (config) => {
  return withInfoPlist(config, (cfg) => {
    cfg.modResults.SomeKey = 'value';
    return cfg;
  });
};

export default withSomething;
```

ใน `app.config.ts`:

```ts
plugins: ['./plugins/withSomething'];
```

### 5.3 Local TurboModule / Expo Module

แนวทางสมัยใหม่: สร้างด้วย **Expo Modules API** (Kotlin/Swift) แล้วเรียกจาก TypeScript
codegen + JSI ทำให้ข้าม Bridge แบบเก่า

ใน examples จะมีโครง module จำลอง + plugin ประกอบ

---

## 6. Production Security & DevOps (EAS / OTA)

### 6.1 Security checklist

| หัวข้อ         | การปฏิบัติ                                                                                    |
| -------------- | --------------------------------------------------------------------------------------------- |
| Secrets        | SecureStore / Keychain; ไม่ฝังใน JS bundle                                                    |
| Obfuscation    | Android Proguard/R8; iOS bitcode ไม่ใช่คำตอบหลัก — โฟกัสไม่ใส่ secret ใน JS                   |
| Transport      | HTTPS เท่านั้น; พิจารณา cert pinning เมื่อ threat model ต้องการ                               |
| Biometrics     | `expo-local-authentication` ก่อนโชว์ข้อมูลอ่อนไหว / ก่อนอ่าน refresh token จาก secure storage |
| Jailbreak/Root | detect เป็นสัญญาณเสี่ยง — ไม่ใช่หลักความปลอดภัยเพียงอย่างเดียว                                |
| Logging        | ห้าม log token / PII ใน production                                                            |

### 6.2 Multi-environment

ใช้ EAS profiles + `app.config.ts` อ่าน `APP_ENV`:

| Profile     | bundle id / package | API     |
| ----------- | ------------------- | ------- |
| development | `.dev`              | dev API |
| staging     | `.staging`          | staging |
| production  | ปกติ                | prod    |

แยก credentials ต่อ profile ใน EAS

### 6.3 OTA ด้วย `expo-updates`

- ส่ง update **JS/assets** โดยไม่ผ่านสโตร์เมื่ออยู่ในกฎของนโยบาย
- **เปลี่ยน native code / permissions ใหม่ = ต้อง build ใหม่**
- ใช้ channel/branch แยก staging/production
- มี rollback plan และตรวจ `runtimeVersion` ให้ตรง binary

### 6.4 EAS Build & Submit

```bash
eas build --platform all --profile production
eas submit --platform ios
eas submit --platform android
```

เตรียม:

- ไอคอน, splash, privacy policy URL
- สิทธิ์ที่อธิบายได้ใน App Store / Play Console
- version + versionCode/buildNumber อัตโนมัติผ่าน EAS

---

## 7. Mobile State ชั้น Expert

| ชั้น          | ที่เก็บ                      | เจ้าของ             |
| ------------- | ---------------------------- | ------------------- |
| UI ephemeral  | useState/Zustand             | Screen              |
| Server mirror | React Query (online)         | Hooks               |
| Offline truth | SQLite                       | Repositories        |
| Sync metadata | outbox / cursor tables       | SyncEngine          |
| Secrets       | SecureStore + biometric gate | AuthService         |
| Remote config | cached file/db               | FeatureFlag service |

อย่าให้ React Query เป็น “ฐานข้อมูลออฟไลน์” ระยะยาว — มันเป็น cache
ออฟไลน์จริง = persistence ที่ query ได้และอยู่รอดหลัง process ตาย

---

## 8. Best Practices ระดับ Expert

1. **กำหนด sync contract + idempotency** ก่อนเขียน UI สวย ๆ
2. **FlashList + estimatedItemSize** สำหรับฟีดหลัก
3. **ทุก subscription มี cleanup** และทดสอบย้ำเข้า-ออกหน้า
4. **Config changes ที่แตะ native = bump runtimeVersion / build ใหม่**
5. **Staging ต้องใช้ Development/Preview binary เดียวกับวิธีปล่อยจริง**
6. **Biometric ≠ encryption keys ทั้งหมด** — ใช้เป็น unlock UX บน secret ที่เข้ารหัสแล้ว
7. **วัด performance บนชุดข้อมูลใกล้ production** (ไม่ใช่ 20 แถว)

---

## 9. แผนอ่าน examples

| folder                                                                  | เนื้อหา                           |
| ----------------------------------------------------------------------- | --------------------------------- |
| [`examples/01-performance-lists`](./examples/01-performance-lists/)     | FlashList vs FlatList patterns    |
| [`examples/02-offline-first`](./examples/02-offline-first/)             | SQLite schema + outbox sync       |
| [`examples/03-config-plugins`](./examples/03-config-plugins/)           | Config Plugin + Expo Module stub  |
| [`examples/04-production-security`](./examples/04-production-security/) | Biometrics, EAS profiles, Updates |

หลังจากอ่านจบ → ทำ [`LAB.md`](./LAB.md) (ระบบตรวจนับสต็อกออฟไลน์ระดับองค์กร)

---

## เกณฑ์ผ่านระดับนี้

- เลือก FlashList/FlatList และอธิบายเหตุผลได้
- ออกแบบ outbox + conflict policy ได้
- เขียน/ติดตั้ง Config Plugin พื้นฐานได้
- วางแผน EAS multi-env + OTA กับขอบเขต native ได้
