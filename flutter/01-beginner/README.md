# Level 1 — Beginner: Dart Core & Flutter UI Basics

> เป้าหมาย: เข้าใจรากฐาน Dart สมัยใหม่, Widget Tree, Lifecycle, และออกแบบ Layout ที่ responsive ได้ถูกต้อง

---

## สารบัญ

1. [Flutter Engine & Widget Lifecycle](#1-flutter-engine--widget-lifecycle)
2. [Dart Concurrency พื้นฐาน](#2-dart-concurrency-พื้นฐาน)
3. [กลยุทธ์ State Management (ภาพรวม)](#3-กลยุทธ์-state-management-ภาพรวม)
4. [Modern Dart Foundations](#4-modern-dart-foundations)
5. [Flutter Widget Architecture](#5-flutter-widget-architecture)
6. [Layouts & Compositing](#6-layouts--compositing)
7. [Best Practices](#7-best-practices-ระดับ-beginner)
8. [ไฟล์โค้ดตัวอย่าง](#8-ไฟล์โค้ดตัวอย่าง)

---

## 1. Flutter Engine & Widget Lifecycle

### 1.1 สถาปัตยกรรมสามชั้นของ Flutter

```
┌─────────────────────────────────────┐
│ Framework (Dart)   │ ← Widgets, Elements, RenderObjects
│ Material / Cupertino / Foundation │
├─────────────────────────────────────┤
│ Engine (C++ / Skia / Impeller) │ ← Rasterization, Text Layout, Isolates
├─────────────────────────────────────┤
│ Embedder (Platform)  │ ← iOS/Android/Web/Desktop runners
└─────────────────────────────────────┘
```

- **Framework**: เขียนด้วย Dart — คุณทำงานส่วนใหญ่อยู่ชั้นนี้
- **Engine**: จัดการ graphics (Skia/Impeller), text, Dart runtime, isolate
- **Embedder**: เชื่อม OS (surface, input, lifecycle ของแอป)

### 1.2 Widget → Element → RenderObject

ทุกเฟรม Flutter แปลง UI เป็นสามชั้น:

| Layer            | หน้าที่                                                           | อายุขัย                                             |
| ---------------- | ----------------------------------------------------------------- | --------------------------------------------------- |
| **Widget**       | คำอธิบาย UI ที่ immutable (configuration)                         | สั้น — สร้างใหม่ทุก rebuild                         |
| **Element**      | สะพานระหว่าง Widget กับ RenderObject; จัดการ mount/update/unmount | คงอยู่ข้าม rebuild ถ้า `runtimeType` + `key` ตรงกัน |
| **RenderObject** | layout, paint, hit-test จริงบนจอ                                  | คงอยู่และ expensive ที่สุด                          |

**ทำไมต้องเข้าใจเรื่องนี้?**
ถ้าคุณสร้าง Widget ใหม่ทุกครั้งที่ `setState` แต่ `Element` สามารถ reuse ได้ — Flutter จะไม่ recreate `RenderObject` ทั้งต้นไม้ → ประสิทธิภาพดีขึ้นมาก

### 1.3 Frame Pipeline (หนึ่งเฟรม ~16ms ที่ 60fps)

```
Input / Animation / setState
 ↓
 Build (Widget → Element)
 ↓
 Layout (constraints → size)
 ↓
 Paint (บันทึก drawing commands)
 ↓
 Composite & Rasterize (GPU)
```

- **Build**: เรียก `build()` ของ dirty widgets
- **Layout**: parent ส่ง constraints → child คืน size (box model)
- **Paint**: วาดลง layer
- **Raster**: Engine แปลงเป็น pixels ผ่าน Skia/Impeller

### 1.4 StatefulWidget Lifecycle

```
createState()
 ↓
initState()  ← one-time setup (controllers, listeners)
 ↓
didChangeDependencies() ← InheritedWidget เปลี่ยน (Theme, MediaQuery)
 ↓
build()  ← เรียกซ้ำได้หลายครั้ง
 ↓
didUpdateWidget() ← parent ส่ง widget ใหม่มา (เปรียบเทียบ oldWidget)
 ↓
setState() → build() ← update state แล้ว rebuild
 ↓
deactivate()  ← ถูกเอาออกจาก tree ชั่วคราว
 ↓
dispose()  ← ปล่อย resource ถาวร (controllers, streams)
```

**กฎสำคัญ**

| Method      | ทำอะไรได้ / ไม่ได้                                                                                      |
| ----------- | ------------------------------------------------------------------------------------------------------- |
| `initState` | init controllers; **ห้าม** ใช้ `InheritedWidget.of(context)` ที่นี่โดยตรง — ใช้ `didChangeDependencies` |
| `build`     | ต้อง pure และเร็ว; **ห้าม** side-effect (API call, setState)                                            |
| `dispose`   | ยกเลิก `AnimationController`, `StreamSubscription`, `TextEditingController`                             |

ดูโค้ด: [`lib/src/beginner/widgets/lifecycle_demo.dart`](lib/src/widgets/lifecycle_demo.dart)

---

## 2. Dart Concurrency พื้นฐาน

### 2.1 Single-threaded Event Loop

Dart รันบน **isolate เดียว** เป็นหลัก (main isolate) พร้อม event loop:

```
┌──────────────┐ ┌─────────────────┐
│ Microtask │ → │ Event Queue │ → รัน callback
│ Queue (ก่อน) │ │ (Timer, I/O, │
└──────────────┘ │ user input) │
   └─────────────────┘
```

งานหนักที่บล็อก event loop = UI ค้าง (jank)

### 2.2 Future & async/await

```dart
Future<String> fetchUser() async {
 final response = await http.get(uri); // ไม่บล็อก — yield กลับ event loop
 return response.body;
}
```

- `Future` = ค่าที่จะมาในอนาคต (สำเร็จหรือ error)
- `async` function คืน `Future` โดยอัตโนมัติ
- `await` รอผลลัพธ์โดยไม่บล็อก isolate

### 2.3 เมื่อไหร่ใช้ Isolate?

| งาน                             | วิธี                          |
| ------------------------------- | ----------------------------- |
| API call, DB read, animation    | `async/await` บน main isolate |
| JSON ใหญ่, image decode, crypto | `Isolate.run()` / `compute()` |

ระดับ Beginner ใช้ Future ให้คล่องก่อน — Isolates ละเอียดใน Level 3

ดูโค้ด: [`lib/src/beginner/dart_foundations/async_examples.dart`](lib/src/dart_foundations/async_examples.dart)

---

## 3. กลยุทธ์ State Management (ภาพรวม)

ในระดับ Beginner คุณใช้ `setState` เป็นหลัก แต่ต้องรู้ว่ามีตัวเลือกอะไรในอนาคต:

| แนวทาง                         | ความซับซ้อน | เหมาะกับ                                     |
| ------------------------------ | ----------- | -------------------------------------------- |
| **setState**                   | ต่ำ         | Local UI state (counter, toggle, form field) |
| **InheritedWidget / Provider** | กลาง        | Share state ลง subtree                       |
| **BLoC / Cubit**               | สูง         | Enterprise, testable, event-driven           |
| **Riverpod**                   | สูง         | Compile-safe DI + reactive                   |

**หลักการแยก State**

1. **Ephemeral (UI) state** — อยู่ใน Widget (`selectedTab`, `isExpanded`) → `setState` พอ
2. **App state** — ใช้ข้ามหลายหน้า (user session, cart) → ย้ายไป BLoC/Riverpod ใน Level 2

```
❌ ดึง API ใน build()
✅ ดึงใน initState / controller แล้ว setState หรือ emit state
```

---

## 4. Modern Dart Foundations

### 4.1 Strict Null Safety

```dart
String name = 'Flutter'; // non-nullable — ห้ามเป็น null
String? nickname;  // nullable
String display = nickname ?? 'Guest';
String forced = nickname!; // ใช้เมื่อมั่นใจว่าไม่ null (ระวัง)
```

**Promotion**: หลัง null-check ตัวแปรจะ promote เป็น non-null

```dart
void greet(String? name) {
 if (name != null) {
 print(name.length); // name เป็น String แล้ว
 }
}
```

### 4.2 OOP: class, extends, implements, mixin

| Keyword        | ความหมาย                                    |
| -------------- | ------------------------------------------- |
| `extends`      | สืบทอด implementation (single inheritance)  |
| `implements`   | สัญญา interface — ต้อง implement ทุก member |
| `with` (mixin) | นำพฤติกรรมมาใช้ซ้ำโดยไม่สืบทอด class        |

```dart
mixin Logger {
 void log(String msg) => print('[LOG] $msg');
}

abstract class Animal {
 void speak();
}

class Dog extends Animal with Logger {
 @override
 void speak() => log('Woof');
}
```

ดูโค้ด: [`lib/src/beginner/dart_foundations/oop_mixins.dart`](lib/src/dart_foundations/oop_mixins.dart)

---

## 5. Flutter Widget Architecture

### 5.1 Everything is a Widget

ปุ่ม, padding, theme, แม้กระทั่งแอปทั้งก้อน — ล้วนเป็น Widget ที่ประกอบกันเป็น **immutable configuration tree**

### 5.2 Declarative UI

```dart
// Imperative (คิดแบบเก่า): button.setText("Hi")
// Declarative (Flutter):
Text(isLoggedIn ? 'สวัสดี' : 'เข้าสู่ระบบ')
```

คุณอธิบาย **UI ควรเป็นอะไรจาก state ปัจจุบัน** — Framework จัดการ diff ให้

### 5.3 StatelessWidget vs StatefulWidget

|          | StatelessWidget             | StatefulWidget                       |
| -------- | --------------------------- | ------------------------------------ |
| State    | ไม่มี mutable state         | มี `State` object                    |
| Rebuild  | เมื่อ parent rebuild        | เมื่อ `setState` หรือ parent rebuild |
| ใช้เมื่อ | UI ขึ้นกับ props อย่างเดียว | มี interaction / animation / stream  |

### 5.4 BuildContext

`BuildContext` คือ handle ไปยังตำแหน่งของ Element ใน tree:

```dart
Theme.of(context); // เดินขึ้นหา Theme
Navigator.of(context); // หา Navigator ที่ใกล้ที่สุด
MediaQuery.of(context); // ขนาดจอ, padding
```

**ข้อผิดพลาดบ่อย**: ใช้ `context` หลัง `async` gap โดยไม่เช็ค `mounted`

```dart
await Future.delayed(Duration(seconds: 1));
if (!mounted) return;
Navigator.of(context).pop();
```

ดูโค้ด: [`lib/src/beginner/widgets/stateless_vs_stateful.dart`](lib/src/widgets/stateless_vs_stateful.dart)

---

## 6. Layouts & Compositing

### 6.1 Constraints ไป Size กลับ

กฎทองของ Flutter layout:

> **Constraints go down. Sizes go up. Parent sets position.**

Parent ส่ง min/max width/height → Child เลือก size ภายในนั้น → Parent วางตำแหน่ง child

### 6.2 Row, Column, Flex, Stack, GridView

| Widget                  | แกนหลัก           | ใช้เมื่อ                 |
| ----------------------- | ----------------- | ------------------------ |
| `Row`                   | แนวนอน            | toolbar, chips           |
| `Column`                | แนวตั้ง           | form, list section       |
| `Expanded` / `Flexible` | แบ่งพื้นที่เหลือ  | ปุ่มเต็มความกว้าง        |
| `Stack`                 | ซ้อน z-axis       | badge บน avatar, overlay |
| `GridView`              | ตาราง             | gallery, product grid    |
| `Wrap`                  | ขึ้นบรรทัดใหม่เอง | tags                     |

### 6.3 Responsive ด้วย LayoutBuilder / MediaQuery

```dart
LayoutBuilder(
 builder: (context, constraints) {
 if (constraints.maxWidth >= 600) {
 return const WideLayout();
 }
 return const NarrowLayout();
 },
);
```

### 6.4 Theme

กำหนดสี/ตัวอักษรที่ `ThemeData` ระดับแอป แล้วอ้างผ่าน `Theme.of(context)` — อย่า hardcode สีกระจายทั่วแอป

ดูโค้ด: [`lib/src/beginner/layouts/responsive_layouts.dart`](lib/src/layouts/responsive_layouts.dart), [`lib/src/beginner/layouts/app_theme.dart`](lib/src/layouts/app_theme.dart)

---

## 7. Best Practices ระดับ Beginner

1. **ใช้ `const` ให้มากที่สุด** — Widget ที่ไม่เปลี่ยนจะไม่ถูก recreate
2. **แยก Widget เป็นไฟล์/class เล็กๆ** — `build()` ที่ยาวเกิน ~80 บรรทัดควรแตก
3. **Key เมื่อ reorder list** — `ValueKey(id)` ป้องกัน state สลับผิดตัว
4. **อย่าเรียก API ใน `build()`**
5. **dispose ทุก controller**
6. **Prefer composition over deep inheritance** ของ Widget
7. **Null safety**: หลีกเลี่ยง `!` — ใช้ `??`, `?.`, early return

---

## 8. ไฟล์โค้ดตัวอย่าง

```
01-beginner/
├── README.md  ← ไฟล์นี้
├── LAB.md  ← โจทย์ + เฉลย
└── lib/src/
  ├── dart_foundations/
  │ ├── null_safety.dart
  │ ├── oop_mixins.dart
  │ └── async_examples.dart
  ├── widgets/
  │ ├── lifecycle_demo.dart
  │ └── stateless_vs_stateful.dart
  └── layouts/
  ├── responsive_layouts.dart
  └── app_theme.dart
```

**ขั้นถัดไป:** อ่านโค้ดใน `lib/src/` → ทำโจทย์ใน [`LAB.md`](LAB.md) → ไป Level 2
