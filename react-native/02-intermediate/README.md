# ระดับ Intermediate — Navigation, State & Native Features

ทฤษฎีและแนวทางสำหรับแอปที่ “ใช้งานจริงได้”: **Expo Router**, การจัดการ Mobile State หลายชั้น, และการคุยกับ Hardware อย่างปลอดภัย

---

## สารบัญ

1. [Mobile Architecture ในระดับแอปจริง](#1-mobile-architecture-ในระดับแอปจริง)
2. [Bridge / JSI กับ Native Modules ที่ใช้บ่อย](#2-bridge--jsi-กับ-native-modules-ที่ใช้บ่อย)
3. [Expo Router — File-based Navigation](#3-expo-router--file-based-navigation)
4. [Mobile State & Storage](#4-mobile-state--storage)
5. [Hardware: Camera, Push, Location, Permissions](#5-hardware-camera-push-location-permissions)
6. [Best Practices ระดับ Intermediate](#6-best-practices-ระดับ-intermediate)
7. [แผนอ่าน examples](#7-แผนอ่าน-examples)

---

## 1. Mobile Architecture ในระดับแอปจริง

เมื่อพ้นหน้าจอเดียว แอปมือถือมักแบ่งเป็นชั้นดังนี้:

```
┌──────────────────────────────────────────┐
│ Presentation (Expo Router screens/UI) │
├──────────────────────────────────────────┤
│ Client State (UI, permissions status) │
├──────────────────────────────────────────┤
│ Server State Cache (React Query)  │
├──────────────────────────────────────────┤
│ Secure / Persistent Storage  │
├──────────────────────────────────────────┤
│ Native Modules (Camera, Push, Location) │
│ ↑ JSI / TurboModule / Bridge │
└──────────────────────────────────────────┘
```

หลักออกแบบ:

- **หน้าจอไม่ใช่เจ้าของข้อมูลระยะยาว** — เป็นผู้ subscribe
- **Native API ไม่ถูกเรียกกระจายทุกที่** — ห่อเป็น hooks/`lib` มีจุดขอ permission เดียว
- **Navigation state ≠ business state** — URL/route params เก็บสิ่งที่แชร์/deep link ได้; ของลับไม่ใส่ใน query

---

## 2. Bridge / JSI กับ Native Modules ที่ใช้บ่อย

แม้คุณจะไม่เขียน C++ เอง ทุกครั้งที่เรียก `Camera` / `Location` / `SecureStore` คุณกำลังข้ามขอบ JS ↔ Native

| ประเภทงาน                 | แนวทาง                                                                    |
| ------------------------- | ------------------------------------------------------------------------- |
| อ่านพิกัดครั้งเดียว       | เรียกครั้งเดียวหลังได้ permission — cache ผลสั้น ๆ                        |
| Watch ตำแหน่งต่อเนื่อง    | ลด `distanceInterval` / ปิดเมื่อออกหน้าจอ — กัน battery + callback ถี่    |
| ถ่ายรูปแล้วส่งขึ้น server | upload ไฟล์/URI อย่าแปลง base64 ยัดลง Bridge แล้วเก็บใน React state ยาว ๆ |
| Push token                | เก็บ SecureStore หรือส่ง server ทันที; ไม่ log เต็มใน production          |

> **กฎ:** ยิ่งข้อมูลใหญ่และถี่เท่าไร ยิ่งควรหลีกเลี่ยงการ serialize ซ้ำบน JS thread

New Architecture (TurboModules) ทำให้หลาย Expo modules สื่อสารถูกทางขึ้น — ยังต้องออกแบบการใช้ให้ฉลาดอยู่ดี

---

## 3. Expo Router — File-based Navigation

Expo Router = React Navigation + ไฟล์ใน folder `app/` เป็น source of truth ของ routes (คล้าย Next.js App Router)

### 3.1 แนวคิดหลัก

| ไฟล์ / folder            | ความหมาย                     |
| ------------------------ | ---------------------------- |
| `app/_layout.tsx`        | Layout ราก (มักเป็น Stack)   |
| `app/(tabs)/_layout.tsx` | Tab navigator ใน route group |
| `app/(tabs)/index.tsx`   | แท็บแรก `/`                  |
| `app/product/[id].tsx`   | Dynamic route `/product/123` |
| `app/(auth)/login.tsx`   | Group ไม่ปรากฏใน URL         |

**Route groups** `(name)` ใช้จัดไฟล์ ไม่เปลี่ยน path

### 3.2 Tabs + Stacks + Drawers

รูปแบบที่พบบ่อยในแอป commerce / field:

```
Root Stack
├── (tabs)
│ ├── index (Home)
│ ├── search
│ └── profile
├── product/[id] (push บน stack เหนือ tabs)
└── modal/settings
```

- **Tabs** = ปลายทางหลักที่สลับบ่อย
- **Stack** = เจาะรายละเอียด / flowที่กลับได้
- **Drawer** = เมนูข้าง สำหรับแอปที่มีปลายทางเยอะหรือต้องการ hierarchy แบบ desktop

### 3.3 Dynamic params & typing

```tsx
import { useLocalSearchParams, useRouter } from 'expo-router';

const { id } = useLocalSearchParams<{ id: string }>();
const router = useRouter();
router.push(`/product/${id}`);
```

Best practices:

- Validate ว่า `id` เป็น string เดียว (บางครั้งได้ `string | string[]`)
- อย่าใส่ข้อมูลใหญ่ใน params — ส่ง id แล้วค่อย fetch/cache
- Deep link: ออกแบบ path ให้เสถียรตั้งแต่แรก

### 3.4 Protected routes (แนวคิด)

ใช้ layout ตรวจ session แล้ว `Redirect` — อย่าซ่อนแค่ปุ่ม

```tsx
if (!token) return <Redirect href="/login" />;
```

รายละเอียด auth + SecureStore อยู่ส่วนถัดไปและใน examples

---

## 4. Mobile State & Storage

### 4.1 แยกประเภทให้ขาด

| ประเภท             | เครื่องมือแนะนำ                       | ตัวอย่าง                          |
| ------------------ | ------------------------------------- | --------------------------------- |
| Server state       | **TanStack Query (React Query)**      | รายการสินค้า, โปรไฟล์จาก API      |
| Client UI state    | `useState` / Zustand / Context เล็ก ๆ | filter, bottom sheet              |
| Durable non-secret | AsyncStorage / `expo-sqlite`          | onboarding flag, draft ไม่อ่อนไหว |
| Secrets            | **expo-secure-store**                 | access token, refresh token       |

### 4.2 React Query บนมือถือ

จุดเด่นที่สำคัญบน Mobile มากกว่าบน Web:

- **`staleTime` / `gcTime`** กัน refetch ถี่ตอนสลับแท็บ
- **`onlineManager` / NetInfo** ให้รู้ว่าออฟไลน์
- **`focusManager`** ผูกกับ AppState — refetch เมื่อกลับมา foreground (ตามที่ตั้ง)
- Prefetch ตอนกดการ์ดก่อน `router.push`

โครงขั้นต่ำ:

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 2,
    },
  },
});
```

### 4.3 Expo SecureStore

- ใช้ Keychain (iOS) / Keystore-backed storage (Android)
- เหมาะกับค่าสั้น ๆ (token) ไม่ใช่ JSON ก้อนใหญ่
- จำกัดขนาด — อย่าเก็บรูปหรือรายการสินค้า

```ts
await SecureStore.setItemAsync('accessToken', token);
const token = await SecureStore.getItemAsync('accessToken');
```

### 4.4 AsyncStorage

- ไม่เข้ารหัสโดยค่าเริ่มต้น → **ห้ามเก็บ secrets**
- เหมาะกับ preferences, cache ที่ยอมอ่านได้ถ้าเครื่องถูก jailbreak/root แบบ offline dump

### 4.5 รูปแบบ Auth session ที่สะอาด

```
Login API → ได้ tokens
 → เขียน SecureStore
 → ตั้งค่า header ใน API client
 → invalidate/prefetch user query
Logout → ลบ SecureStore + clear QueryClient
```

---

## 5. Hardware: Camera, Push, Location, Permissions

### 5.1 ปรัชญา Permissions

1. **อธิบายก่อนขอ** (in-app rationale UI)
2. ขอตอน feature จะถูกใช้ — ไม่ขอตอน launch กองรวม
3. รองรับ **denied** และ **blocked** (พาไป Settings)
4. อย่าทำให้แอปใช้ไม่ได้ทั้งก้อนเพราะ user กดไม่อนุญาตกล้อง

### 5.2 Camera (`expo-camera` / `expo-image-picker`)

- Image Picker มักพอสำหรับแนบรูป
- Camera view เต็มจอเมื่อต้องสแกน/ถ่ายตาม workflow
- จัดการ orientation และ permission แยก iOS/Android ใน config plugins (`app.json` permissions)

### 5.3 Push Notifications (`expo-notifications`)

ขั้นตอนแนวคิด:

1. ขอ permission
2. ได้ Expo push token / device token
3. ส่ง token ขึ้น backend
4. ตั้ง handler ตอน foreground / response (user แตะ notification)
5. Android: ต้องมี notification channel

ใช้ Development Build เมื่อต้องการทดสอบพฤติกรรมใกล้ production; Expo Go ใช้ทดสอบได้บางส่วนแต่มีข้อจำกัดตาม version

### 5.4 Location (`expo-location`)

| โหมด       | ใช้เมื่อ                                         |
| ---------- | ------------------------------------------------ |
| Foreground | แสดงแผนที่/ร้านใกล้เคียงตอนเปิดหน้า              |
| Background | tracking ต่อเนื่อง — ต้องเหตุผลชัด + นโยบายสโตร์ |

ปิด watcher ใน `useEffect` cleanup เสมอ

---

## 6. Best Practices ระดับ Intermediate

1. **โครงสร้าง folder `app/` ให้สะท้อน IA ของผลิตภัณฑ์** ไม่ใช่สะท้อนทีม
2. **Params มีแค่ identifiers** — ข้อมูลเต็มมาจาก Query cache
3. **ห่อ SecureStore หลัง `authStorage` module** — ห้ามเรียกกระจาย
4. **Permission hooks คืนสถานะชัด** (`undetermined | granted | denied`)
5. **ทุกหน้าจอที่พึ่ง hardware มี fallback UI**
6. **อย่าผสม React Query cache กับ SecureStore** เป็นที่เก็บเดียวกัน — คนละหน้าที่
7. **ทดสอบ deep link** ไปยัง dynamic route ตั้งแต่ Intermediate

---

## 7. แผนอ่าน examples

| folder                                                                  | เนื้อหา                                         |
| ----------------------------------------------------------------------- | ----------------------------------------------- |
| [`examples/01-expo-router`](./examples/01-expo-router/)                 | Tabs + Stack + dynamic `[id]`                   |
| [`examples/02-react-query-storage`](./examples/02-react-query-storage/) | React Query + SecureStore auth helpers          |
| [`examples/03-native-apis`](./examples/03-native-apis/)                 | Camera / Location / Notifications + permissions |

หลังจากอ่านจบ → ทำ [`LAB.md`](./LAB.md) (แอป Field Catalog พร้อมล็อกอินและสแกน)

---

## เกณฑ์ผ่านระดับนี้

- อธิบายได้ว่าทำไมต้องแยก server state กับ secrets
- ออกแบบ Tabs + Stack ด้วย Expo Router ได้
- เขียน flow ขอ permission ที่ไม่ทำร้าย UX
- รู้ว่าเมื่อไหร่ต้องย้ายจาก Expo Go → Development Build
