# Level 2 — Intermediate: State Management, Navigation & Core Services

> เป้าหมาย: แยก UI จาก Business Logic, ออกแบบ Routing แบบ declarative, และสร้าง networking + local cache ระดับ production

---

## สารบัญ

1. [Flutter Engine Lifecycle กับ State](#1-flutter-engine-lifecycle-กับ-state)
2. [Dart Concurrency สำหรับ Networking](#2-dart-concurrency-สำหรับ-networking)
3. [กลยุทธ์ State Management ระดับ Enterprise](#3-กลยุทธ์-state-management-ระดับ-enterprise)
4. [BLoC / Cubit](#4-bloc--cubit)
5. [Riverpod](#5-riverpod)
6. [GoRouter — Declarative Navigation](#6-gorouter--declarative-navigation)
7. [Networking: Dio + Interceptors + Models](#7-networking-dio--interceptors--models)
8. [Local Persistence: Hive / Isar](#8-local-persistence-hive--isar)
9. [Best Practices](#9-best-practices-ระดับ-intermediate)
10. [ไฟล์โค้ดตัวอย่าง](#10-ไฟล์โค้ดตัวอย่าง)

---

## 1. Flutter Engine Lifecycle กับ State

เมื่อ `emit` / `notifyListeners` / Riverpod `ref.watch` เปลี่ยน:

```
State change
 ↓
Framework marks Element dirty
 ↓
Build phase — เฉพาะ subtree ที่พึ่งพา state นั้น
 ↓
Layout → Paint → Raster
```

**เป้าหมายของ State Management ที่ดี**

- ลดขอบเขต rebuild (อย่าใส่ state ทั้งแอปไว้ที่ root แล้ว rebuild ทุกอย่าง)
- ทำให้ state **predictable** และ **testable** นอก Widget tree
- แยก **side effects** (API, DB, navigation) ออกจาก `build()`

### App Lifecycle (WidgetsBindingObserver)

แอปมือถือมีสถานะ `resumed / inactive / paused / detached` — ใช้ pause stream, บันทึก draft, หรือ refresh token เมื่อกลับมา `resumed`

ดู pattern ใน Level 3 สำหรับ background processing ที่หนักกว่า

---

## 2. Dart Concurrency สำหรับ Networking

```
UI (main isolate)
 │ await
 ▼
Dio HTTP (async I/O — ไม่บล็อก UI)
 │
 ├─ success → parse JSON → map to Freezed model
 └─ error → Interceptor / Result type → UI error state
```

| งาน                           | ทำบน                                   |
| ----------------------------- | -------------------------------------- |
| HTTP request/response         | main isolate + event loop (async)      |
| JSON เล็ก–กลาง                | main isolate ได้                       |
| JSON ใหญ่มาก / transform หนัก | `Isolate.run` (Level 3)                |
| เขียน disk (Hive/Isar)        | async API ของ DB — อย่า sync I/O ใน UI |

**Cancellation**: ยกเลิก request เมื่อออกจากหน้า (`CancelToken` ของ Dio) เพื่อไม่ให้ `setState`/`emit` หลัง dispose

---

## 3. กลยุทธ์ State Management ระดับ Enterprise

### 3.1 หลักการร่วมกัน

ไม่ว่าจะเลือก BLoC หรือ Riverpod ให้ยึด:

1. **Unidirectional data flow**: UI → Intent/Event → Logic → State → UI
2. **Immutable state**: state ใหม่ทุกครั้งที่เปลี่ยน (copyWith / Freezed)
3. **Single source of truth** ต่อ feature
4. **UI ไม่รู้จัก Dio/DB โดยตรง** — เรียกผ่าน Repository / UseCase

### 3.2 เลือก BLoC หรือ Riverpod?

| เกณฑ์                 | BLoC / Cubit                         | Riverpod                                  |
| --------------------- | ------------------------------------ | ----------------------------------------- |
| Learning curve        | Event/State ชัด แต่ boilerplate เยอะ | น้อยกว่า (โดยเฉพาะ Cubit-like `Notifier`) |
| Testability           | สูงมาก (`blocTest`)                  | สูง (`ProviderContainer`)                 |
| DI / scoping          | ต้องจัด CubitProvider เอง            | built-in (`ProviderScope`, overrides)     |
| Compile safety        | ดี                                   | ดีมาก (codegen)                           |
| ทีมใหญ่ / audit trail | Event log อ่านง่าย                   | ขึ้นกับวินัยการตั้งชื่อ                   |

**คำแนะนำหลักสูตรนี้**: เรียนทั้งสอง — project ตัวอย่างมีทั้ง Cubit และ Riverpod Notifier

```
Presentation → Cubit/Notifier → Repository → Dio / Local DB
 UI  State  Data
```

---

## 4. BLoC / Cubit

### Cubit (เรียบง่ายกว่า BLoC)

```
UI ──call method──▶ Cubit ──emit──▶ State ──blocBuilder──▶ UI
```

- Cubit = function สาธารณะที่ `emit` state ใหม่
- BLoC = รับ `Event` stream แล้ว map เป็น `State` (เหมาะเมื่อต้องการ event sourcing / analytics)

**State sealed class** (Dart 3):

```dart
sealed class AuthState {}
final class AuthInitial extends AuthState {}
final class AuthLoading extends AuthState {}
final class AuthAuthenticated extends AuthState {
 AuthAuthenticated(this.user);
 final User user;
}
final class AuthFailure extends AuthState {
 AuthFailure(this.message);
 final String message;
}
```

ดูโค้ด: [`lib/src/intermediate/state_management/bloc/auth_cubit.dart`](lib/src/state_management/bloc/auth_cubit.dart)

---

## 5. Riverpod

แนวคิดหลัก:

- **Provider** = สูตรคำนวณ dependency / state
- **ref.watch** = subscribe และ rebuild เมื่อค่าเปลี่ยน
- **ref.read** = อ่านครั้งเดียว (ใน callbacks)
- **overrides** = mock ในเทส / flavor

```dart
@riverpod
class CartNotifier extends _$CartNotifier {
 @override
 CartState build() => const CartState.empty();

 void add(Product p) => state = state.copyWith(items: [...state.items, p]);
}
```

ดูโค้ด: [`lib/src/intermediate/state_management/riverpod/cart_notifier.dart`](lib/src/state_management/riverpod/cart_notifier.dart)

---

## 6. GoRouter — Declarative Navigation

### ทำไมไม่ใช้ Navigator 2.0 ดิบๆ?

GoRouter ห่อ declarative API ให้:

- URL / path-based routes (deep link พร้อม)
- **ShellRoute** สำหรับ bottom nav ที่คงอยู่ข้ามแท็บ
- **redirect** สำหรับ auth guard
- Nested navigation ด้วย `navigatorKey` แยกต่อสาขา

```
/login
/app   ← ShellRoute (BottomNavigationBar)
 /app/home
 /app/orders
 /app/profile
/app/orders/:id ← detail นอก shell หรือใน shell ตามดีไซน์
```

### Route Guard pattern

```dart
redirect: (context, state) {
 final loggedIn = authRepository.isLoggedIn;
 final loggingIn = state.matchedLocation == '/login';
 if (!loggedIn && !loggingIn) return '/login';
 if (loggedIn && loggingIn) return '/app/home';
 return null; // ไม่ redirect
}
```

ดูโค้ด: [`lib/src/intermediate/navigation/app_router.dart`](lib/src/navigation/app_router.dart)

---

## 7. Networking: Dio + Interceptors + Models

### Dio setup

```
Dio
 ├─ BaseOptions (baseUrl, timeouts, headers)
 ├─ AuthInterceptor → ใส่ Bearer token
 ├─ LoggingInterceptor → debug only
 ├─ CacheInterceptor → GET cache + ETag / TTL
 └─ ErrorInterceptor → map DioException → Domain Failure
```

### Type-safe models

ใช้ `freezed` + `json_serializable`:

```dart
@freezed
class Product with _$Product {
 const factory Product({
 required String id,
 required String name,
 required double price,
 }) = _Product;

 factory Product.fromJson(Map<String, dynamic> json) => _$ProductFromJson(json);
}
```

ดูโค้ด:

- [`lib/src/intermediate/networking/dio_client.dart`](lib/src/networking/dio_client.dart)
- [`lib/src/intermediate/networking/interceptors/auth_interceptor.dart`](lib/src/networking/interceptors/auth_interceptor.dart)
- [`lib/src/intermediate/networking/interceptors/cache_interceptor.dart`](lib/src/networking/interceptors/cache_interceptor.dart)
- [`lib/src/intermediate/networking/models/product.dart`](lib/src/networking/models/product.dart)

---

## 8. Local Persistence: Hive / Isar

|          | Hive                  | Isar                     |
| -------- | --------------------- | ------------------------ |
| โมเดล    | ยืดหยุ่น, TypeAdapter | Schema ชัด, query เร็ว   |
| Query    | key-value เป็นหลัก    | where clauses แรง        |
| ใช้เมื่อ | settings, small cache | รายการใหญ่, sync offline |

**กลยุทธ์ Cache-Aside ที่นิยม**

```
1. อ่านจาก local ก่อน → แสดงทันที (stale-while-revalidate)
2. เรียก API พื้นหลัง
3. update local + emit state ใหม่
```

ดูโค้ด: [`lib/src/intermediate/networking/storage/product_cache.dart`](lib/src/networking/storage/product_cache.dart)

---

## 9. Best Practices ระดับ Intermediate

1. **Repository เป็นขอบเขต I/O** — Cubit/Notifier ไม่เรียก Dio ตรง
2. **CancelToken / ref.onDispose** — ยกเลิกงานเมื่อออกจากหน้า
3. **อย่าเก็บ BuildContext ใน Cubit**
4. **Error เป็น state** — ไม่ throw ทะลุถึง UI โดยไม่มี handler
5. **Secrets**: token เก็บใน Secure Storage ไม่ใช่ SharedPreferences ธรรมดา (ละเอียดใน Level 3)
6. **GoRouter redirect ต้อง pure และเร็ว** — อย่า await network ยาวใน redirect
7. **ทดสอบ logic ด้วย unit test** โดยไม่ต้อง pump Widget ทั้งแอป

---

## 10. ไฟล์โค้ดตัวอย่าง

```
02-intermediate/
├── README.md
├── LAB.md
└── lib/src/
  ├── state_management/
  │ ├── bloc/auth_cubit.dart
  │ └── riverpod/cart_notifier.dart
  ├── navigation/app_router.dart
  └── networking/
  ├── dio_client.dart
  ├── interceptors/
  │ ├── auth_interceptor.dart
  │ └── cache_interceptor.dart
  ├── models/product.dart
  └── storage/product_cache.dart
```

**ขั้นถัดไป:** ศึกษาโค้ดใน `lib/src/` → ทำ [`LAB.md`](LAB.md) → ไป Level 3
