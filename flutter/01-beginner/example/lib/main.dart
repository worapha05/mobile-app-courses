import 'package:flutter/material.dart';
import 'package:flutter_mastery_bootcamp_beginner/beginner.dart';

void main() {
  runApp(const BeginnerExampleApp());
}

class BeginnerExampleApp extends StatelessWidget {
  const BeginnerExampleApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Beginner Demos',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light(),
      darkTheme: AppTheme.dark(),
      home: const CatalogPage(),
    );
  }
}

class CatalogPage extends StatelessWidget {
  const CatalogPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Beginner — Flutter Basics')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _DemoTile(
            title: 'Widget Lifecycle',
            subtitle: 'initState → build → dispose',
            builder: (_) => const LifecycleDemoPage(),
          ),
          _DemoTile(
            title: 'Stateless vs Stateful',
            subtitle: 'PriceTag + QuantityStepper',
            builder: (_) => Scaffold(
              appBar: AppBar(title: const Text('Product Card')),
              body: ProductCard(name: 'Cold Brew', price: 89),
            ),
          ),
          _DemoTile(
            title: 'Responsive Layout',
            subtitle: 'LayoutBuilder · Grid · Stack',
            builder: (_) => const ResponsiveHomeShell(),
          ),
          _DemoTile(
            title: 'Dart Foundations',
            subtitle: 'Null safety · OOP · async',
            builder: (_) => const _DartPage(),
          ),
        ],
      ),
    );
  }
}

class _DartPage extends StatefulWidget {
  const _DartPage();

  @override
  State<_DartPage> createState() => _DartPageState();
}

class _DartPageState extends State<_DartPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      runNullSafetyDemo();
      runOopMixinsDemo();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Dart Foundations')),
      body: const Center(
        child: Text('ดูผลลัพธ์ใน debug console'),
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
