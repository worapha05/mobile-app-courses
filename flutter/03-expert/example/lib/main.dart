import 'package:flutter/material.dart';
import 'package:flutter_mastery_bootcamp_expert/expert.dart';

void main() {
  runApp(const ExpertExampleApp());
}

class ExpertExampleApp extends StatelessWidget {
  const ExpertExampleApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Expert Demos',
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
      appBar: AppBar(title: const Text('Expert — Performance & Architecture')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _DemoTile(
            title: 'Isolate JSON Parse',
            subtitle: 'Offload heavy work from UI isolate',
            builder: (_) => const _IsolatePage(),
          ),
          _DemoTile(
            title: 'Clean Architecture Login',
            subtitle: 'UseCase → Repository → UI controller',
            builder: (_) => const _LoginPage(),
          ),
          _DemoTile(
            title: 'Const & Rebuild Scope',
            subtitle: 'Cart badge pattern',
            builder: (_) => const _RebuildPage(),
          ),
          _DemoTile(
            title: 'AppConfig Flavors',
            subtitle: 'dev / staging / production',
            builder: (_) => const _FlavorPage(),
          ),
        ],
      ),
    );
  }
}

class _IsolatePage extends StatefulWidget {
  const _IsolatePage();

  @override
  State<_IsolatePage> createState() => _IsolatePageState();
}

class _IsolatePageState extends State<_IsolatePage> {
  String _result = '';
  bool _busy = false;

  Future<void> _parse() async {
    setState(() => _busy = true);
    final raw = '[{"id":"o1","total":10.5,"itemCount":3}]';
    final sw = Stopwatch()..start();
    await parseOrdersInBackground(raw);
    sw.stop();
    if (!mounted) return;
    setState(() {
      _busy = false;
      _result = 'Parsed in ${sw.elapsedMilliseconds}ms (isolate)';
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Isolates')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            Text(_result),
            const SizedBox(height: 24),
            FilledButton(
              onPressed: _busy ? null : _parse,
              child: const Text('Parse in Isolate'),
            ),
          ],
        ),
      ),
    );
  }
}

class _LoginPage extends StatefulWidget {
  const _LoginPage();

  @override
  State<_LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<_LoginPage> {
  late final LoginController _controller;

  @override
  void initState() {
    super.initState();
    final repo = AuthRepositoryImpl(
      remote: FakeAuthRemoteDataSource(),
      local: InMemoryAuthLocalDataSource(),
    );
    _controller = LoginController(LoginUseCase(repo))..addListener(_onChange);
  }

  void _onChange() => setState(() {});

  @override
  void dispose() {
    _controller.removeListener(_onChange);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = _controller.state;
    return Scaffold(
      appBar: AppBar(title: const Text('Clean Architecture')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            Text('State: ${state.runtimeType}'),
            if (state is LoginSuccess) Text('User: ${state.user.displayName}'),
            if (state is LoginError) Text(state.message),
            const SizedBox(height: 24),
            FilledButton(
              onPressed: () => _controller.submit(
                email: 'ada@example.com',
                password: 'password1',
              ),
              child: const Text('Login via UseCase'),
            ),
          ],
        ),
      ),
    );
  }
}

class _RebuildPage extends StatefulWidget {
  const _RebuildPage();

  @override
  State<_RebuildPage> createState() => _RebuildPageState();
}

class _RebuildPageState extends State<_RebuildPage> {
  int _count = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Rebuild scope'),
        actions: [
          CartIconButton(badgeCount: _count, onPressed: () {}),
        ],
      ),
      body: Center(
        child: FilledButton(
          onPressed: () => setState(() => _count++),
          child: const Text('เพิ่ม badge'),
        ),
      ),
    );
  }
}

class _FlavorPage extends StatelessWidget {
  const _FlavorPage();

  @override
  Widget build(BuildContext context) {
    final config = AppConfig.fromEnvironment();
    return Scaffold(
      appBar: AppBar(title: const Text('Flavors')),
      body: ListTile(
        title: Text('Flavor: ${config.flavor.name}'),
        subtitle: Text(config.apiBaseUrl),
        trailing: Text(config.enableLogging ? 'logging on' : 'logging off'),
      ),
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
