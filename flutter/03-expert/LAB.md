# Level 3 LAB — โจทย์ทดสอบ + เฉลย

สถานการณ์ระดับ Expert: Performance/Isolates, Clean Architecture, Platform Channels, และ Security/DevOps

---

## LAB 3.1 — Upload Pipeline ด้วย Isolates + UI ที่ไม่ Jank

### สถานการณ์

แอปประกันภัยต้อง upload เอกสารหลายไฟล์:

1. อ่านไฟล์ → คำนวณ checksum (งานหนัก)
2. บีบอัด metadata JSON ขนาดใหญ่ก่อนส่ง
3. ระหว่างประมวลผล UI ต้องเลื่อนหน้าจอได้ลื่น (ห้ามบล็อก main isolate)
4. แสดง progress ต่อไฟล์

### เงื่อนไขที่ต้องผ่าน

- [ ] ใช้ `Isolate.run` สำหรับ checksum / parse
- [ ] Controller/UseCase เป็นคนเรียก isolate — ไม่เรียกจาก `build()`
- [ ] มี cancel เมื่อออกจากหน้า

### เฉลย

```dart
import 'dart:async';
import 'dart:convert';
import 'dart:isolate';

class UploadItem {
 const UploadItem({
 required this.id,
 required this.fileName,
 required this.bytes,
 });

 final String id;
 final String fileName;
 final List<int> bytes;
}

class UploadProgress {
 const UploadProgress({
 required this.id,
 required this.stage,
 this.percent = 0,
 this.error,
 });

 final String id;
 final String stage; // hashing | uploading | done | error
 final double percent;
 final String? error;
}

int _checksum(List<int> bytes) {
 // Simulated heavy CPU work
 var hash = 0;
 for (final b in bytes) {
 hash = (hash * 31 + b) & 0x7fffffff;
 }
 return hash;
}

String _buildManifest(Map<String, dynamic> meta) {
 return jsonEncode(meta);
}

class DocumentUploadUseCase {
 DocumentUploadUseCase({required this.upload});

 final Future<void> Function(String id, int checksum, String manifest) upload;

 Stream<UploadProgress> run(
 List<UploadItem> items, {
 required CancelTokenLike cancel,
 }) async* {
 for (final item in items) {
 if (cancel.isCancelled) return;

 yield UploadProgress(id: item.id, stage: 'hashing', percent: 0.1);

 final checksum = await Isolate.run(() => _checksum(item.bytes));
 if (cancel.isCancelled) return;

 final manifest = await Isolate.run(
 () => _buildManifest({
  'fileName': item.fileName,
  'checksum': checksum,
  'size': item.bytes.length,
 }),
 );

 yield UploadProgress(id: item.id, stage: 'uploading', percent: 0.6);
 try {
 await upload(item.id, checksum, manifest);
 yield UploadProgress(id: item.id, stage: 'done', percent: 1);
 } catch (e) {
 yield UploadProgress(
  id: item.id,
  stage: 'error',
  percent: 1,
  error: e.toString(),
 );
 }
 }
 }
}

class CancelTokenLike {
 bool isCancelled = false;
 void cancel() => isCancelled = true;
}
```

**UI (ย่อ)**

```dart
// ใน State:
// late final CancelTokenLike _cancel;
// StreamSubscription? _sub;
//
// @override
// void dispose() {
// _cancel.cancel();
// _sub?.cancel();
// super.dispose();
// }
```

---

## LAB 3.2 — Clean Architecture สำหรับโอนเงิน

### สถานการณ์

module โอนเงินต้องมีชั้น Domain บริสุทธิ์:

- Entity: `TransferOrder`
- UseCase: `ExecuteTransferUseCase` (ตรวจยอดขั้นต่ำ, ห้ามโอนเข้าบัญชีตัวเอง)
- Repository port + Data implementation (remote + local receipt cache)
- Presentation controller ที่ map `Result` → view state

### เงื่อนไขที่ต้องผ่าน

- [ ] Domain ไม่ import Flutter / Dio
- [ ] Validation อยู่ใน UseCase
- [ ] Data map DTO → Entity
- [ ] เทส UseCase ด้วย fake repository ได้

### เฉลย

```dart
// ── domain/transfer.dart ──
class TransferOrder {
 const TransferOrder({
 required this.id,
 required this.fromAccount,
 required this.toAccount,
 required this.amount,
 });

 final String id;
 final String fromAccount;
 final String toAccount;
 final double amount;
}

sealed class Failure {
 const Failure(this.message);
 final String message;
}

class ValidationFailure extends Failure {
 const ValidationFailure(super.message);
}

class NetworkFailure extends Failure {
 const NetworkFailure([super.message = 'เครือข่ายผิดพลาด']);
}

sealed class Result<T> {
 const Result();
}

class Success<T> extends Result<T> {
 const Success(this.value);
 final T value;
}

class Err<T> extends Result<T> {
 const Err(this.failure);
 final Failure failure;
}

abstract interface class TransferRepository {
 Future<Result<TransferOrder>> transfer({
 required String fromAccount,
 required String toAccount,
 required double amount,
 });
}

class ExecuteTransferUseCase {
 ExecuteTransferUseCase(this._repo);
 final TransferRepository _repo;

 Future<Result<TransferOrder>> call({
 required String fromAccount,
 required String toAccount,
 required double amount,
 }) async {
 if (fromAccount == toAccount) {
 return const Err(ValidationFailure('ห้ามโอนเข้าบัญชีตัวเอง'));
 }
 if (amount < 1) {
 return const Err(ValidationFailure('ยอดโอนขั้นต่ำ 1 บาท'));
 }
 if (amount > 200000) {
 return const Err(ValidationFailure('เกินวงเงินต่อครั้ง'));
 }
 return _repo.transfer(
 fromAccount: fromAccount,
 toAccount: toAccount,
 amount: amount,
 );
 }
}

// ── data/transfer_repository_impl.dart ──
class TransferDto {
 TransferDto({required this.id, required this.from, required this.to, required this.amount});
 final String id;
 final String from;
 final String to;
 final double amount;

 TransferOrder toEntity() => TransferOrder(
 id: id,
 fromAccount: from,
 toAccount: to,
 amount: amount,
 );
}

class TransferRepositoryImpl implements TransferRepository {
 TransferRepositoryImpl(this._api);
 final Future<TransferDto> Function({
 required String from,
 required String to,
 required double amount,
 }) _api;

 @override
 Future<Result<TransferOrder>> transfer({
 required String fromAccount,
 required String toAccount,
 required double amount,
 }) async {
 try {
 final dto = await _api(from: fromAccount, to: toAccount, amount: amount);
 return Success(dto.toEntity());
 } catch (_) {
 return const Err(NetworkFailure());
 }
 }
}

// ── test (pure Dart) ──
class FakeTransferRepo implements TransferRepository {
 @override
 Future<Result<TransferOrder>> transfer({
 required String fromAccount,
 required String toAccount,
 required double amount,
 }) async =>
 Success(
 TransferOrder(
  id: 't1',
  fromAccount: fromAccount,
  toAccount: toAccount,
  amount: amount,
 ),
 );
}

Future<void> main() async {
 final uc = ExecuteTransferUseCase(FakeTransferRepo());
 final bad = await uc(fromAccount: 'A', toAccount: 'A', amount: 100);
 assert(bad is Err);
 final ok = await uc(fromAccount: 'A', toAccount: 'B', amount: 100);
 assert(ok is Success);
}
```

---

## LAB 3.3 — Biometrics Gate + SSL Pinning Config ต่อ Flavor

### สถานการณ์

แอปธนาคารก่อนเข้าหน้าโอนเงินต้อง:

1. เรียก `BiometricChannel.authenticate`
2. ถ้าสำเร็จถึงจะ `GoRouter` ไป `/app/transfer`
3. Dio ของ production ต้องเปิด certificate pinning
4. สร้าง flavor `dev` / `prod` คนละ `main_*.dart` และ CI build `prod` พร้อม obfuscation

### เงื่อนไขที่ต้องผ่าน

- [ ] ห่อ Platform Channel เป็น interface (mock ได้ในเทส)
- [ ] `AppConfig.fromEnvironment()` แยก pins ต่อ flavor
- [ ] มีขั้นตอน CI (YAML) build พร้อม `--obfuscate`

### เฉลย

```dart
abstract interface class BiometricGateway {
 Future<bool> authenticate({String reason});
}

class MethodChannelBiometricGateway implements BiometricGateway {
 MethodChannelBiometricGateway(this._channel);
 final BiometricChannel _channel;

 @override
 Future<bool> authenticate({String reason = 'ยืนยันตัวตน'}) async {
 final result = await _channel.authenticate(reason: reason);
 return result == BiometricResult.success;
 }
}

class TransferGate {
 TransferGate(this._bio);
 final BiometricGateway _bio;

 Future<bool> canEnterTransfer() => _bio.authenticate(
 reason: 'ยืนยันตัวตนเพื่อโอนเงิน',
 );
}

// main_prod.dart
// void main() {
// const config = AppConfig(... production pins ...);
// runApp(MyApp(config: AppConfig.fromEnvironment()));
// }
//
// flutter run --flavor prod -t lib/main_prod.dart --dart-define=FLAVOR=production
//
// CI:
// flutter build appbundle --flavor prod -t lib/main_prod.dart \
// --obfuscate --split-debug-info=build/symbols \
// --dart-define=FLAVOR=production
```

**GoRouter redirect ร่วมกับ biometrics (แนวทาง)**

```dart
// อย่าใส่ biometric ใน redirect โดยตรง (ช้า/side-effect)
// ให้หน้า Transfer เป็นจุดเรียก TransferGate ก่อนแสดง form:

class TransferPage extends StatefulWidget {
 const TransferPage({super.key, required this.gate});
 final TransferGate gate;

 @override
 State<TransferPage> createState() => _TransferPageState();
}

class _TransferPageState extends State<TransferPage> {
 bool? _ok;

 @override
 void initState() {
 super.initState();
 _unlock();
 }

 Future<void> _unlock() async {
 final ok = await widget.gate.canEnterTransfer();
 if (!mounted) return;
 if (!ok) {
 Navigator.of(context).maybePop();
 return;
 }
 setState(() => _ok = true);
 }

 @override
 Widget build(BuildContext context) {
 if (_ok != true) {
 return const Scaffold(body: Center(child: CircularProgressIndicator()));
 }
 return const Scaffold(body: Center(child: Text('form โอนเงิน')));
 }
}
```

ใช้ [`lib/src/security/secure_headers.dart`](lib/src/security/secure_headers.dart) และ [`devops/github_actions_sample.yml`](devops/github_actions_sample.yml) เป็นต้นแบบ CI

---

## Checklist สรุป Level 3

| LAB | ทักษะ                                           | ผ่านแล้ว |
| --- | ----------------------------------------------- | -------- |
| 3.1 | Isolates, cancel, non-blocking UI               | ☐        |
| 3.2 | Clean Architecture + UseCase tests              | ☐        |
| 3.3 | MethodChannel, Flavors, Pinning, CI obfuscation | ☐        |

---

## จบหลักสูตร

คุณผ่านเส้นทาง **Zero → Expert** แล้ว:

1. Beginner — Dart, Widgets, Layouts
2. Intermediate — State, GoRouter, Dio/Cache
3. Expert — Performance, Architecture, Native, DevOps

แนะนำ project ปิดคอร์ส: สร้างแอปจริง 1 ตัวที่ใช้ครบ Clean Architecture + Riverpod/BLoC + GoRouter + Dio cache + อย่างน้อย 1 Platform Channel + flavor dev/prod
