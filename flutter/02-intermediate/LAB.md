# Level 2 LAB — โจทย์ทดสอบ + เฉลย

สถานการณ์จำลองระดับ Intermediate: State Management, GoRouter Guard, และ API Interception/Caching

---

## LAB 2.1 — ตะกร้าร้านอาหารด้วย Cubit / Notifier

### สถานการณ์

แอปสั่งอาหาร "QuickBite" ต้องการตะกร้าที่:

- เพิ่มเมนู, เปลี่ยนจำนวน, ลบรายการ
- คำนวณยอดรวม real-time
- UI rebuild เฉพาะส่วนที่จำเป็น (แยก `BlocBuilder` / `Consumer`)

### เงื่อนไขที่ต้องผ่าน

- [ ] State เป็น immutable (`copyWith`)
- [ ] Logic ไม่อยู่ใน Widget
- [ ] มี unit-testable notifier/cubit (ทดสอบได้โดยไม่ใช้ UI)

### เฉลย (Cubit)

```dart
import 'package:flutter_bloc/flutter_bloc.dart';

class CartLine {
 const CartLine({
 required this.menuId,
 required this.name,
 required this.unitPrice,
 this.qty = 1,
 });

 final String menuId;
 final String name;
 final double unitPrice;
 final int qty;

 double get total => unitPrice * qty;

 CartLine copyWith({int? qty}) => CartLine(
 menuId: menuId,
 name: name,
 unitPrice: unitPrice,
 qty: qty ?? this.qty,
 );
}

class CartState {
 const CartState({this.lines = const []});

 final List<CartLine> lines;

 double get grandTotal => lines.fold(0, (s, e) => s + e.total);

 CartState copyWith({List<CartLine>? lines}) =>
 CartState(lines: lines ?? this.lines);
}

class CartCubit extends Cubit<CartState> {
 CartCubit() : super(const CartState());

 void addItem({
 required String menuId,
 required String name,
 required double unitPrice,
 }) {
 final idx = state.lines.indexWhere((e) => e.menuId == menuId);
 if (idx >= 0) {
 final lines = [...state.lines];
 lines[idx] = lines[idx].copyWith(qty: lines[idx].qty + 1);
 emit(state.copyWith(lines: lines));
 return;
 }
 emit(
 state.copyWith(
 lines: [
  ...state.lines,
  CartLine(menuId: menuId, name: name, unitPrice: unitPrice),
 ],
 ),
 );
 }

 void updateQty(String menuId, int qty) {
 if (qty <= 0) {
 remove(menuId);
 return;
 }
 emit(
 state.copyWith(
 lines: [
  for (final line in state.lines)
  if (line.menuId == menuId) line.copyWith(qty: qty) else line,
 ],
 ),
 );
 }

 void remove(String menuId) {
 emit(
 state.copyWith(
 lines: state.lines.where((e) => e.menuId != menuId).toList(),
 ),
 );
 }
}
```

**ทดสอบ logic โดยไม่พึ่ง UI**

```dart
void main() {
 final cubit = CartCubit();
 cubit.addItem(menuId: 'm1', name: 'กะเพราไก่', unitPrice: 55);
 cubit.addItem(menuId: 'm1', name: 'กะเพราไก่', unitPrice: 55);
 assert(cubit.state.lines.first.qty == 2);
 assert(cubit.state.grandTotal == 110);
 cubit.close();
}
```

---

## LAB 2.2 — Auth Guard ด้วย GoRouter

### สถานการณ์

แอปธนาคารจำลองมีเส้นทาง:

- `/login` — สาธารณะ
- `/app/home`, `/app/transfer` — ต้อง login
- เมื่อ session หมดอายุต้องเด้งกลับ `/login` อัตโนมัติ
- หลัง login สำเร็จ กลับไปหน้าที่ตั้งใจจะเข้า (deep link)

### เงื่อนไขที่ต้องผ่าน

- [ ] ใช้ `redirect` + `refreshListenable`
- [ ] เก็บ `from` query เพื่อกลับหน้าเดิม
- [ ] ShellRoute สำหรับ bottom nav อย่างน้อย 2 แท็บ

### เฉลย

```dart
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class SessionController extends ChangeNotifier {
 bool _loggedIn = false;
 bool get isLoggedIn => _loggedIn;

 void login() {
 _loggedIn = true;
 notifyListeners();
 }

 void logout() {
 _loggedIn = false;
 notifyListeners();
 }
}

GoRouter buildRouter(SessionController session) {
 return GoRouter(
 initialLocation: '/app/home',
 refreshListenable: session,
 redirect: (context, state) {
 final loggedIn = session.isLoggedIn;
 final loggingIn = state.matchedLocation == '/login';
 final from = state.uri.queryParameters['from'];

 if (!loggedIn && !loggingIn) {
 final intended = state.uri.toString();
 return '/login?from=${Uri.encodeComponent(intended)}';
 }
 if (loggedIn && loggingIn) {
 return from ?? '/app/home';
 }
 return null;
 },
 routes: [
 GoRoute(
 path: '/login',
 builder: (context, state) {
  final from = state.uri.queryParameters['from'];
  return Scaffold(
  body: Center(
  child: FilledButton(
  onPressed: () {
   session.login();
   // redirect จะพาไปเองเมื่อ notifyListeners
  },
  child: Text('เข้าสู่ระบบ${from != null ? ' แล้วกลับ $from' : ''}'),
  ),
  ),
  );
 },
 ),
 StatefulShellRoute.indexedStack(
 builder: (context, state, shell) {
  return Scaffold(
  body: shell,
  bottomNavigationBar: NavigationBar(
  selectedIndex: shell.currentIndex,
  onDestinationSelected: shell.goBranch,
  destinations: const [
  NavigationDestination(icon: Icon(Icons.home), label: 'หน้าแรก'),
  NavigationDestination(icon: Icon(Icons.swap_horiz), label: 'โอนเงิน'),
  ],
  ),
  );
 },
 branches: [
  StatefulShellBranch(
  routes: [
  GoRoute(
  path: '/app/home',
  builder: (_, __) => const Center(child: Text('Home')),
  ),
  ],
  ),
  StatefulShellBranch(
  routes: [
  GoRoute(
  path: '/app/transfer',
  builder: (_, __) => const Center(child: Text('Transfer')),
  ),
  ],
  ),
 ],
 ),
 ],
 );
}
```

---

## LAB 2.3 — API Interception + Caching สำหรับรายการเที่ยวบิน

### สถานการณ์

แอปจองตั๋วเครื่องบินต้อง:

1. เรียก `GET /flights?from=BKK&to=CNX`
2. Cache ผลลัพธ์ 45 วินาทีผ่าน Interceptor
3. Header `Authorization: Bearer …` จาก secure token reader
4. ถ้า 401 → ส่ง `AuthFailure` ไปยัง state layer
5. Repository อ่าน local cache ก่อน แล้วค่อย sync เครือข่าย (stale-while-revalidate แบบง่าย)

### เงื่อนไขที่ต้องผ่าน

- [ ] มี `AuthInterceptor` + `CacheInterceptor`
- [ ] Model type-safe (`Flight.fromJson`)
- [ ] ปุ่ม "refresh" ส่ง `forceRefresh: true`
- [ ] UI แสดงว่าข้อมูลมาจาก cache หรือ network (อ่าน `extra`)

### เฉลย

```dart
import 'package:dio/dio.dart';

class Flight {
 const Flight({
 required this.id,
 required this.from,
 required this.to,
 required this.price,
 });

 final String id;
 final String from;
 final String to;
 final int price;

 factory Flight.fromJson(Map<String, dynamic> json) => Flight(
 id: json['id'] as String,
 from: json['from'] as String,
 to: json['to'] as String,
 price: json['price'] as int,
 );
}

class FlightCacheEntry {
 FlightCacheEntry(this.flights, this.savedAt);
 final List<Flight> flights;
 final DateTime savedAt;
}

class FlightRepository {
 FlightRepository(this._dio);

 final Dio _dio;
 FlightCacheEntry? _local;
 static const _localTtl = Duration(minutes: 10);

 Future<({List<Flight> flights, bool fromCache})> search({
 required String from,
 required String to,
 bool forceRefresh = false,
 }) async {
 if (!forceRefresh &&
 _local != null &&
 DateTime.now().difference(_local!.savedAt) < _localTtl) {
 // Return local immediately; optionally kick network in background.
 return (flights: _local!.flights, fromCache: true);
 }

 final response = await _dio.get<List<dynamic>>(
 '/flights',
 queryParameters: {'from': from, 'to': to},
 options: Options(
 extra: {'forceRefresh': forceRefresh},
 ),
 );

 final flights = (response.data ?? const [])
 .cast<Map<String, dynamic>>()
 .map(Flight.fromJson)
 .toList(growable: false);

 _local = FlightCacheEntry(flights, DateTime.now());
 final fromCache = response.extra['fromCache'] == true;
 return (flights: flights, fromCache: fromCache);
 }
}

/// Wiring (ใช้ CacheInterceptor / AuthInterceptor จาก lib/networking)
Dio buildFlightDio({
 required Future<String?> Function() readToken,
 required CacheStore store,
}) {
 final dio = Dio(BaseOptions(baseUrl: 'https://api.example.com'));
 dio.interceptors.addAll([
 AuthInterceptor(tokenReader: readToken),
 CacheInterceptor(store: store, defaultTtl: const Duration(seconds: 45)),
 ]);
 return dio;
}
```

**UI snippet**

```dart
class FlightSearchPage extends StatefulWidget {
 const FlightSearchPage({super.key, required this.repo});
 final FlightRepository repo;

 @override
 State<FlightSearchPage> createState() => _FlightSearchPageState();
}

class _FlightSearchPageState extends State<FlightSearchPage> {
 String? _banner;
 List<Flight> _flights = const [];
 bool _loading = false;

 Future<void> _load({bool force = false}) async {
 setState(() => _loading = true);
 final result = await widget.repo.search(from: 'BKK', to: 'CNX', forceRefresh: force);
 if (!mounted) return;
 setState(() {
 _flights = result.flights;
 _banner = result.fromCache ? 'แสดงจาก cache' : 'ข้อมูลล่าสุดจาก server';
 _loading = false;
 });
 }

 @override
 void initState() {
 super.initState();
 _load();
 }

 @override
 Widget build(BuildContext context) {
 return Scaffold(
 appBar: AppBar(
 title: const Text('เที่ยวบิน BKK → CNX'),
 actions: [
  IconButton(onPressed: () => _load(force: true), icon: const Icon(Icons.refresh)),
 ],
 ),
 body: _loading
  ? const Center(child: CircularProgressIndicator())
  : Column(
  children: [
  if (_banner != null) MaterialBanner(content: Text(_banner!), actions: const [SizedBox.shrink()]),
  Expanded(
   child: ListView.builder(
   itemCount: _flights.length,
   itemBuilder: (_, i) {
   final f = _flights[i];
   return ListTile(
   title: Text('${f.from} → ${f.to}'),
   subtitle: Text(f.id),
   trailing: Text('฿${f.price}'),
   );
   },
   ),
  ),
  ],
  ),
 );
 }
}
```

> หมายเหตุ: นำ `AuthInterceptor`, `CacheInterceptor`, `CacheStore` จาก folder `lib/networking/` มาใช้ร่วมกันได้เลย

---

## Checklist สรุป Level 2

| LAB | ทักษะ                               | ผ่านแล้ว |
| --- | ----------------------------------- | -------- |
| 2.1 | Cubit/Notifier, immutable state     | ☐        |
| 2.2 | GoRouter Shell + redirect guard     | ☐        |
| 2.3 | Dio interceptors, cache, repository | ☐        |

เมื่อครบทั้ง 3 LAB → ไปต่อที่ [`../03-expert/`](../03-expert/)
