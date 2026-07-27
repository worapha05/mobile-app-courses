# Level 1 LAB — โจทย์ทดสอบ + เฉลย

สถานการณ์จำลองจากชีวิตจริง 3 ข้อ ครอบคลุม Layout, UI Component, และ Async Data Flow พื้นฐาน

---

## LAB 1.1 — หน้าเมนูร้านกาแฟ (Layout)

### สถานการณ์

ร้านกาแฟ "Bean & Byte" ต้องการหน้าเมนูมือถือ:

- Header แสดงชื่อร้าน + สถานะเปิด/ปิด
- รายการเครื่องดื่มเป็น Grid 2 column บนมือถือ, 4 column เมื่อกว้าง ≥ 600px
- แต่ละการ์ดมีชื่อ, ราคา, และป้าย "แนะนำ" (badge) มุมขวาบนด้วย `Stack`

### เงื่อนไขที่ต้องผ่าน

- [ ] ใช้ `LayoutBuilder` หรือ `MediaQuery` สลับจำนวน column
- [ ] ใช้ `Stack` + `Positioned` สำหรับ badge
- [ ] ห้าม hardcode สี — อ้างจาก `Theme.of(context)`
- [ ] Widget แยกเป็นคอมโพเนนต์อ่านง่าย

### เฉลย

```dart
import 'package:flutter/material.dart';

class CoffeeMenuPage extends StatelessWidget {
 const CoffeeMenuPage({super.key});

 static const items = [
 _Drink(name: 'Latte', price: 85, featured: true),
 _Drink(name: 'Espresso', price: 55, featured: false),
 _Drink(name: 'Matcha', price: 95, featured: true),
 _Drink(name: 'Mocha', price: 90, featured: false),
 _Drink(name: 'Cold Brew', price: 80, featured: false),
 _Drink(name: 'Cappuccino', price: 85, featured: true),
 ];

 @override
 Widget build(BuildContext context) {
 final scheme = Theme.of(context).colorScheme;
 return Scaffold(
 body: CustomScrollView(
 slivers: [
  SliverAppBar(
  pinned: true,
  title: const Text('Bean & Byte'),
  actions: [
  Padding(
  padding: const EdgeInsets.only(right: 16),
  child: Chip(
   label: const Text('เปิดอยู่'),
   backgroundColor: scheme.primaryContainer,
  ),
  ),
  ],
  ),
  SliverPadding(
  padding: const EdgeInsets.all(16),
  sliver: SliverLayoutBuilder(
  builder: (context, constraints) {
  final crossAxisCount = constraints.crossAxisExtent >= 600 ? 4 : 2;
  return SliverGrid(
   gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
   crossAxisCount: crossAxisCount,
   mainAxisSpacing: 12,
   crossAxisSpacing: 12,
   childAspectRatio: 0.9,
   ),
   delegate: SliverChildBuilderDelegate(
   (context, index) => DrinkCard(drink: items[index]),
   childCount: items.length,
   ),
  );
  },
  ),
  ),
 ],
 ),
 );
 }
}

class _Drink {
 const _Drink({
 required this.name,
 required this.price,
 required this.featured,
 });

 final String name;
 final int price;
 final bool featured;
}

class DrinkCard extends StatelessWidget {
 const DrinkCard({super.key, required this.drink});

 final _Drink drink;

 @override
 Widget build(BuildContext context) {
 final scheme = Theme.of(context).colorScheme;
 return Stack(
 children: [
 Material(
  color: scheme.surfaceContainerHighest,
  borderRadius: BorderRadius.circular(12),
  child: InkWell(
  borderRadius: BorderRadius.circular(12),
  onTap: () {},
  child: Padding(
  padding: const EdgeInsets.all(12),
  child: Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
   Expanded(
   child: Center(
   child: Icon(Icons.local_cafe, size: 36, color: scheme.primary),
   ),
   ),
   Text(drink.name, style: Theme.of(context).textTheme.titleSmall),
   const SizedBox(height: 4),
   Text(
   '฿${drink.price}',
   style: Theme.of(context).textTheme.bodyMedium?.copyWith(
    fontWeight: FontWeight.w700,
   ),
   ),
  ],
  ),
  ),
  ),
 ),
 if (drink.featured)
  Positioned(
  top: 8,
  right: 8,
  child: Container(
  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
  decoration: BoxDecoration(
  color: scheme.tertiary,
  borderRadius: BorderRadius.circular(8),
  ),
  child: Text(
  'แนะนำ',
  style: TextStyle(
   color: scheme.onTertiary,
   fontSize: 11,
   fontWeight: FontWeight.w600,
  ),
  ),
  ),
  ),
 ],
 );
 }
}
```

---

## LAB 1.2 — form จองคิวคลินิก (Stateful UI Component)

### สถานการณ์

คลินิกทันตกรรมต้องการ form จองคิว:

- ช่องชื่อ (บังคับ), เบอร์โทร (บังคับ, 10 หลัก)
- เลือกช่วงเวลาด้วย `SegmentedButton` หรือ ChoiceChip: เช้า / บ่าย / เย็น
- ปุ่มยืนยันเปิดใช้งานเมื่อ form valid
- แสดง SnackBar เมื่อส่งสำเร็จ

### เงื่อนไขที่ต้องผ่าน

- [ ] ใช้ `Form` + `GlobalKey<FormState>`
- [ ] Validation ครบ
- [ ] `dispose` ของ `TextEditingController`
- [ ] เช็ค `mounted` ก่อนแสดง SnackBar หลัง delay จำลอง

### เฉลย

```dart
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

enum TimeSlot { morning, afternoon, evening }

class ClinicBookingForm extends StatefulWidget {
 const ClinicBookingForm({super.key});

 @override
 State<ClinicBookingForm> createState() => _ClinicBookingFormState();
}

class _ClinicBookingFormState extends State<ClinicBookingForm> {
 final _formKey = GlobalKey<FormState>();
 final _nameCtrl = TextEditingController();
 final _phoneCtrl = TextEditingController();
 TimeSlot _slot = TimeSlot.morning;
 bool _submitting = false;

 @override
 void dispose() {
 _nameCtrl.dispose();
 _phoneCtrl.dispose();
 super.dispose();
 }

 Future<void> _submit() async {
 if (!(_formKey.currentState?.validate() ?? false)) return;

 setState(() => _submitting = true);
 await Future<void>.delayed(const Duration(milliseconds: 600)); // mock API
 if (!mounted) return;

 setState(() => _submitting = false);
 ScaffoldMessenger.of(context).showSnackBar(
 SnackBar(
 content: Text(
  'จองคิวสำเร็จ: ${_nameCtrl.text} / ${_slot.label}',
 ),
 ),
 );
 }

 @override
 Widget build(BuildContext context) {
 return Scaffold(
 appBar: AppBar(title: const Text('จองคิวทันตกรรม')),
 body: Form(
 key: _formKey,
 child: ListView(
  padding: const EdgeInsets.all(20),
  children: [
  TextFormField(
  controller: _nameCtrl,
  textInputAction: TextInputAction.next,
  decoration: const InputDecoration(
  labelText: 'ชื่อ-นามสกุล',
  border: OutlineInputBorder(),
  ),
  validator: (v) {
  if (v == null || v.trim().isEmpty) return 'กรุณากรอกชื่อ';
  return null;
  },
  ),
  const SizedBox(height: 16),
  TextFormField(
  controller: _phoneCtrl,
  keyboardType: TextInputType.phone,
  inputFormatters: [
  FilteringTextInputFormatter.digitsOnly,
  LengthLimitingTextInputFormatter(10),
  ],
  decoration: const InputDecoration(
  labelText: 'เบอร์โทร',
  border: OutlineInputBorder(),
  ),
  validator: (v) {
  if (v == null || v.length != 10) return 'เบอร์โทรต้อง 10 หลัก';
  return null;
  },
  ),
  const SizedBox(height: 24),
  Text('ช่วงเวลา', style: Theme.of(context).textTheme.titleMedium),
  const SizedBox(height: 8),
  SegmentedButton<TimeSlot>(
  segments: [
  for (final s in TimeSlot.values)
   ButtonSegment(value: s, label: Text(s.label)),
  ],
  selected: {_slot},
  onSelectionChanged: (set) => setState(() => _slot = set.first),
  ),
  const SizedBox(height: 32),
  FilledButton(
  onPressed: _submitting ? null : _submit,
  child: _submitting
   ? const SizedBox(
   height: 22,
   width: 22,
   child: CircularProgressIndicator(strokeWidth: 2),
   )
   : const Text('ยืนยันการจอง'),
  ),
  ],
 ),
 ),
 );
 }
}

extension on TimeSlot {
 String get label => switch (this) {
 TimeSlot.morning => 'เช้า',
 TimeSlot.afternoon => 'บ่าย',
 TimeSlot.evening => 'เย็น',
 };
}
```

---

## LAB 1.3 — โหลดรายการพัสดุจาก API จำลอง (Async + Caching พื้นฐาน)

### สถานการณ์

แอปติดตามพัสดุต้อง:

1. ดึงรายการพัสดุจาก "API" (จำลองด้วย delay + JSON ใน memory)
2. แสดง loading / error / success states
3. เก็บผลลัพธ์ล่าสุดใน memory cache — กด refresh ภายใน 30 วินาทีให้ใช้ cache
4. ปุ่ม "บังคับ refresh" ข้าม cache

### เงื่อนไขที่ต้องผ่าน

- [ ] แยก `ParcelRepository` ออกจาก UI
- [ ] ใช้ `Future` + `async/await` อย่างถูกต้อง
- [ ] UI ไม่เรียก network ใน `build()` โดยตรงซ้ำทุก rebuild (ใช้ flag / Future ที่เก็บไว้)
- [ ] มี cache TTL

### เฉลย

```dart
import 'package:flutter/material.dart';

class Parcel {
 const Parcel({
 required this.trackingId,
 required this.status,
 required this.destination,
 });

 final String trackingId;
 final String status;
 final String destination;

 factory Parcel.fromJson(Map<String, dynamic> json) {
 return Parcel(
 trackingId: json['trackingId'] as String,
 status: json['status'] as String,
 destination: json['destination'] as String,
 );
 }
}

class ParcelRepository {
 List<Parcel>? _cache;
 DateTime? _cachedAt;
 static const _ttl = Duration(seconds: 30);

 Future<List<Parcel>> fetchParcels({bool forceRefresh = false}) async {
 final now = DateTime.now();
 final cacheValid = _cache != null &&
 _cachedAt != null &&
 now.difference(_cachedAt!) < _ttl;

 if (!forceRefresh && cacheValid) {
 return _cache!;
 }

 await Future<void>.delayed(const Duration(milliseconds: 800)); // mock latency

 // Simulated API payload
 const payload = [
 {
 'trackingId': 'TH1001',
 'status': 'กำลังจัดส่ง',
 'destination': 'กรุงเทพฯ',
 },
 {
 'trackingId': 'TH1002',
 'status': 'ถึงศูนย์คัดแยก',
 'destination': 'เชียงใหม่',
 },
 {
 'trackingId': 'TH1003',
 'status': 'ส่งสำเร็จ',
 'destination': 'ขอนแก่น',
 },
 ];

 final parcels = payload.map(Parcel.fromJson).toList(growable: false);
 _cache = parcels;
 _cachedAt = DateTime.now();
 return parcels;
 }
}

class ParcelListPage extends StatefulWidget {
 const ParcelListPage({super.key});

 @override
 State<ParcelListPage> createState() => _ParcelListPageState();
}

class _ParcelListPageState extends State<ParcelListPage> {
 final _repo = ParcelRepository();
 late Future<List<Parcel>> _future;

 @override
 void initState() {
 super.initState();
 _future = _repo.fetchParcels();
 }

 void _reload({bool force = false}) {
 setState(() {
 _future = _repo.fetchParcels(forceRefresh: force);
 });
 }

 @override
 Widget build(BuildContext context) {
 return Scaffold(
 appBar: AppBar(
 title: const Text('ติดตามพัสดุ'),
 actions: [
  IconButton(
  tooltip: 'ใช้ cache ถ้ายังไม่หมดอายุ',
  onPressed: () => _reload(),
  icon: const Icon(Icons.refresh),
  ),
  IconButton(
  tooltip: 'บังคับ refresh',
  onPressed: () => _reload(force: true),
  icon: const Icon(Icons.cloud_sync),
  ),
 ],
 ),
 body: FutureBuilder<List<Parcel>>(
 future: _future,
 builder: (context, snapshot) {
  if (snapshot.connectionState == ConnectionState.waiting) {
  return const Center(child: CircularProgressIndicator());
  }
  if (snapshot.hasError) {
  return Center(
  child: Column(
  mainAxisSize: MainAxisSize.min,
  children: [
   Text('เกิดข้อผิดพลาด: ${snapshot.error}'),
   const SizedBox(height: 12),
   FilledButton(
   onPressed: () => _reload(force: true),
   child: const Text('ลองใหม่'),
   ),
  ],
  ),
  );
  }
  final items = snapshot.data ?? const <Parcel>[];
  if (items.isEmpty) {
  return const Center(child: Text('ไม่มีพัสดุ'));
  }
  return ListView.separated(
  itemCount: items.length,
  separatorBuilder: (_, __) => const Divider(height: 1),
  itemBuilder: (context, index) {
  final p = items[index];
  return ListTile(
  leading: const Icon(Icons.local_shipping_outlined),
  title: Text(p.trackingId),
  subtitle: Text(p.destination),
  trailing: Text(p.status),
  );
  },
  );
 },
 ),
 );
 }
}
```

---

## Checklist สรุป Level 1

| LAB | ทักษะ                                        | ผ่านแล้ว |
| --- | -------------------------------------------- | -------- |
| 1.1 | LayoutBuilder, Grid, Stack, Theme            | ☐        |
| 1.2 | Form, StatefulWidget, dispose, mounted       | ☐        |
| 1.3 | Repository, Future, cache TTL, FutureBuilder | ☐        |

เมื่อครบทั้ง 3 LAB → ไปต่อที่ [`../02-intermediate/`](../02-intermediate/)
