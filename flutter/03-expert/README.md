# Level 3 — Expert: Enterprise Scale, Performance & DevOps

> เป้าหมาย: โปรไฟล์และจูนประสิทธิภาพ, จัด Clean Architecture, เชื่อม Native APIs, และส่งมอบแอปผ่าน pipeline ที่ปลอดภัย

---

## สารบัญ

1. [Flutter Engine Lifecycle ระดับลึก](#1-flutter-engine-lifecycle-ระดับลึก)
2. [Dart Concurrency: Isolates](#2-dart-concurrency-isolates)
3. [State Management ที่ Scale](#3-state-management-ที่-scale)
4. [Performance Tuning](#4-performance-tuning)
5. [Clean Architecture](#5-clean-architecture)
6. [Platform Channels](#6-platform-channels)
7. [Security](#7-security)
8. [Flavors & DevOps](#8-flavors--devops)
9. [Best Practices](#9-best-practices-ระดับ-expert)
10. [ไฟล์โค้ดตัวอย่าง](#10-ไฟล์โค้ดตัวอย่าง)

---

## 1. Flutter Engine Lifecycle ระดับลึก

### 1.1 จาก Vsync ถึง Pixel

```
Vsync signal (display)
 ↓
Animator / SchedulerBinding
 ↓
BuildOwner.buildScope() ← dirty Elements
 ↓
PipelineOwner.flushLayout()
 ↓
PipelineOwner.flushCompositingBits()
 ↓
PipelineOwner.flushPaint()
 ↓
Scene → Engine (Impeller/Skia) raster on GPU thread
```

- **UI thread (Dart)**: build, layout, paint recording
- **Raster thread**: GPU work — ถ้าหนักจะเกิด GPU jank แม้ Dart ไม่บล็อก
- **IO / Worker threads**: image decode, isolate helpers

### 1.2 อะไรทำให้เฟรมช้า?

| สาเหตุ                         | อาการใน DevTools   | แก้                                        |
| ------------------------------ | ------------------ | ------------------------------------------ |
| `build()` หนัก / rebuild กว้าง | UI graph สูง       | `const`, split widgets, selectors          |
| Layout ลึก / intrinsic ซ้อน    | Layout time สูง    | ลด nested IntrinsicHeight, ใช้ sized boxes |
| รูปใหญ่ไม่ cache               | Raster / IO spikes | `cached_network_image`, resize             |
| Sync work บน UI isolate        | UI thread blocked  | `Isolate.run`                              |

### 1.3 App Process Lifecycle vs Widget Lifecycle

```
iOS/Android process: created → resumed → paused → detached
    ↕
WidgetsBindingObserver.didChangeAppLifecycleState
```

ใช้ pause analytics, ปิด camera, บันทึก draft, reconnect websocket เมื่อ `resumed`

---

## 2. Dart Concurrency: Isolates

Isolates = memory คนละก้อน สื่อสารด้วย message passing (ไม่แชร์ mutable state)

```dart
final result = await Isolate.run(() {
 // heavy JSON parse / encryption / image processing
 return parseHugeJson(raw);
});
```

| API                                | ใช้เมื่อ                            |
| ---------------------------------- | ----------------------------------- |
| `Isolate.run`                      | one-shot งานหนัก (แนะนำเริ่มที่นี่) |
| `compute()`                        | Flutter wrapper รอบ `Isolate.run`   |
| long-lived Isolate + `ReceivePort` | pipeline ต่อเนื่อง (upload queue)   |

**ข้อควรระวัง**

- ส่ง message ต้องเป็นค่าที่ serialize ได้ (หรือใช้ `TransferableTypedData`)
- อย่า spawn isolate ถี่เกินจำเป็น — มีต้นทุนสร้าง
- UI ยังต้อง `await` แล้ว update state บน main isolate

ดูโค้ด: [`lib/src/expert/performance/isolate_parse.dart`](lib/src/performance/isolate_parse.dart)

---

## 3. State Management ที่ Scale

เมื่อแอปโต:

1. **Feature-first folders** + Clean Architecture layers
2. State ต่อ feature — ไม่มี God Cubit
3. **Presentation** รู้จัก ViewModel/Cubit เท่านั้น
4. Side effects รวมที่ UseCase / Interactor
5. ใช้ `BlocSelector` / Riverpod `select` ลด rebuild

```
UI rebuild budget:
 watch(entireAppState) ❌
 select(state.badgeCount) ✅
```

---

## 4. Performance Tuning

### 4.1 DevTools Checklist

1. **Performance** overlay / chart — จับ UI/Raster sparklines
2. **Rebuild counts** — เปิด highlight rebuilds
3. **Memory** — หา leak จาก controller ที่ไม่ dispose
4. **Network** — ขนาด payload, รูปไม่ย่อ

### 4.2 `const` และ Equatable/Freezed

```dart
const Text('Hello'); // ใช้ instance เดิมได้ถ้า parent const
```

State ที่ `==` เท่าเดิม → Cubit ไม่ควร emit ซ้ำ (Freezed ช่วย)

### 4.3 Image caching

- ระบุ `cacheWidth` / `cacheHeight` ตาม logical pixels × devicePixelRatio
- ใช้ CDN ที่มี resize URL
- Prefetch เฉพาะหน้าถัดไปที่จำเป็น

ดูโค้ด: [`lib/src/expert/performance/const_and_rebuilds.dart`](lib/src/performance/const_and_rebuilds.dart)

---

## 5. Clean Architecture

```
┌──────────────────────────────────────────┐
│ Presentation (Widgets, Cubit/Notifier) │
├──────────────────────────────────────────┤
│ Domain (Entities, UseCases, Ports) │ ← ไม่พึ่ง Flutter/Dio
├──────────────────────────────────────────┤
│ Data (Repositories Impl, DTO, Datasources) │
└──────────────────────────────────────────┘
```

**Dependency rule**: ชั้นในไม่รู้จักชั้นนอก — Domain ไม่ import `package:dio` / `package:flutter`

| Layer                      | ตัวอย่าง                                      |
| -------------------------- | --------------------------------------------- |
| Domain Entity              | `User`, `Order`                               |
| UseCase                    | `LoginUseCase`, `UploadDocumentUseCase`       |
| Repository port (abstract) | `AuthRepository`                              |
| Data source                | `AuthRemoteDataSource`, `AuthLocalDataSource` |
| Repository impl            | รวม remote + local + map DTO → Entity         |

ดูโค้ดใต้ [`lib/src/expert/architecture/`](lib/src/architecture/)

---

## 6. Platform Channels

MethodChannel = สะพาน Dart ↔ Kotlin/Swift

```
Dart: channel.invokeMethod('authenticate')
  ↓
Android: MethodChannel handler → BiometricPrompt
iOS: LAContext.evaluatePolicy
  ↓
Dart: Future result true/false
```

ใช้เมื่อ plugin ยังไม่ครอบคลุม หรือต้องการ logic พิเศษขององค์กร

ดูโค้ด: [`lib/src/expert/platform_channels/biometric_channel.dart`](lib/src/platform_channels/biometric_channel.dart)

---

## 7. Security

### 7.1 SSL Pinning

ตรวจ certificate / public key ของ server — ลดความเสี่ยง MITM

- ใช้ `http_certificate_pinning` หรือ custom `HttpClient` ใน Dio adapter
- วางแผนหมุนเวียนใบรับรอง (backup pin)

### 7.2 Secure Storage

- iOS Keychain / Android EncryptedSharedPreferences ผ่าน `flutter_secure_storage`
- ห้ามเก็บ access token ใน plain SharedPreferences

### 7.3 Obfuscation

```bash
flutter build apk --obfuscate --split-debug-info=build/symbols
```

เก็บ symbol files สำหรับถอด stack trace จาก Crashlytics

ดูโค้ด: [`lib/src/expert/security/secure_headers.dart`](lib/src/security/secure_headers.dart)

---

## 8. Flavors & DevOps

### 8.1 Flavors (Dev / Staging / Prod)

| Flavor  | bundle id ตัวอย่าง    | API base           |
| ------- | --------------------- | ------------------ |
| dev     | `com.company.app.dev` | `https://dev-api…` |
| staging | `com.company.app.stg` | `https://stg-api…` |
| prod    | `com.company.app`     | `https://api…`     |

ใช้ `--flavor` + `--dart-define` หรือ `app_config.dart` แยกไฟล์

### 8.2 Fastlane + CI

```
GitHub Actions / Jenkins
 ↓
 tests + analyze
 ↓
 build IPA / AAB (flavor=prod)
 ↓
 Fastlane supply / deliver
 ↓
 Play Store / App Store Connect
```

ดู script: [`devops/`](devops/) (ตัวอย่าง YAML + Fastfile)

---

## 9. Best Practices ระดับ Expert

1. วัดก่อนจูน — อย่า optimize มั่วโดยไม่มี DevTools evidence
2. Domain layer บริสุทธิ์ — เทสได้บน VM โดยไม่พึ่ง Flutter binding
3. Feature flags สำหรับ rollout เสี่ยง
4. Pin + Secure Storage + obfuscation เป็นชุด (ไม่เลือกอย่างใดอย่างหนึ่ง)
5. Pipeline ต้อง reproducible — version ล็อกใน CI
6. แยก symbol / mapping ไฟล์จาก artifact ที่ส่งลูกค้า
7. Platform channel: type-safe API ฝั่ง Dart + error code ชัดเจน

---

## 10. ไฟล์โค้ดตัวอย่าง

```
03-expert/
├── README.md
├── LAB.md
├── devops/
│ ├── github_actions_sample.yml
│ └── Fastfile.sample
└── lib/src/
  ├── performance/
  │ ├── isolate_parse.dart
  │ └── const_and_rebuilds.dart
  ├── architecture/
  │ ├── domain/
  │ ├── data/
  │ └── presentation/
  ├── platform_channels/biometric_channel.dart
  └── security/secure_headers.dart
```

**ขั้นถัดไป:** ศึกษาโค้ดใน `lib/src/` → ทำ [`LAB.md`](LAB.md) → สำเร็จหลักสูตร Zero to Expert
