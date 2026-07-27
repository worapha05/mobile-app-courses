import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_mastery_bootcamp_intermediate/intermediate.dart';

void main() {
  runApp(const IntermediateExampleApp());
}

class IntermediateExampleApp extends StatelessWidget {
  const IntermediateExampleApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Intermediate Demos',
      debugShowCheckedModeBanner: false,
      home: const CatalogPage(),
    );
  }
}

class CatalogPage extends StatelessWidget {
  const CatalogPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Intermediate — State & Networking')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _DemoTile(
            title: 'Auth Cubit',
            subtitle: 'Login flow with sealed states',
            builder: (_) => BlocProvider(
              create: (_) => AuthCubit(FakeAuthRepository())..bootstrap(),
              child: const _AuthPage(),
            ),
          ),
          _DemoTile(
            title: 'Cart Notifier',
            subtitle: 'Immutable cart state',
            builder: (_) => const _CartPage(),
          ),
          _DemoTile(
            title: 'Cache Interceptor',
            subtitle: 'In-memory GET cache TTL',
            builder: (_) => const _CachePage(),
          ),
        ],
      ),
    );
  }
}

class _AuthPage extends StatelessWidget {
  const _AuthPage();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Auth Cubit')),
      body: BlocBuilder<AuthCubit, AuthState>(
        builder: (context, state) {
          return Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text('State: ${state.runtimeType}'),
                const SizedBox(height: 16),
                if (state is AuthAuthenticated)
                  Text('สวัสดี ${state.user.displayName}'),
                if (state is AuthFailure) Text(state.message),
                const Spacer(),
                FilledButton(
                  onPressed: () => context.read<AuthCubit>().login(
                        email: 'ada@example.com',
                        password: 'secret',
                      ),
                  child: const Text('Login'),
                ),
                const SizedBox(height: 8),
                OutlinedButton(
                  onPressed: () => context.read<AuthCubit>().logout(),
                  child: const Text('Logout'),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _CartPage extends StatefulWidget {
  const _CartPage();

  @override
  State<_CartPage> createState() => _CartPageState();
}

class _CartPageState extends State<_CartPage> {
  late final CartNotifier _cart;

  @override
  void initState() {
    super.initState();
    _cart = CartNotifier();
  }

  void _refresh(VoidCallback action) {
    action();
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final state = _cart.state;
    return Scaffold(
      appBar: AppBar(title: const Text('Cart')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text('รวม ${state.totalQty} ชิ้น'),
          const SizedBox(height: 12),
          ...state.items.map(
            (e) => ListTile(
              title: Text(e.name),
              subtitle: Text('x${e.qty}'),
            ),
          ),
          const SizedBox(height: 24),
          FilledButton(
            onPressed: () => _refresh(
              () => _cart.add(productId: 'p1', name: 'กะเพราไก่', unitPrice: 55),
            ),
            child: const Text('เพิ่มกะเพราไก่'),
          ),
          OutlinedButton(
            onPressed: () => _refresh(_cart.clear),
            child: const Text('ล้างตะกร้า'),
          ),
        ],
      ),
    );
  }
}

class _CachePage extends StatelessWidget {
  const _CachePage();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Cache Interceptor')),
      body: const Center(child: Text('ดูโค้ดใน lib/src/networking/interceptors/')),
    );
  }
}

class _DemoTile extends StatelessWidget {
  const _DemoTile({
    required this.title,
    required this.subtitle,
    required this.builder,
  });

  final String title;
  final String subtitle;
  final WidgetBuilder builder;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        title: Text(title),
        subtitle: Text(subtitle),
        trailing: const Icon(Icons.chevron_right),
        onTap: () {
          Navigator.of(context).push(
            MaterialPageRoute<void>(builder: builder),
          );
        },
      ),
    );
  }
}
