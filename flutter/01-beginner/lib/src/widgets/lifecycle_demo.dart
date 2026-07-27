import 'package:flutter/material.dart';

/// Demo: StatefulWidget lifecycle hooks.
/// Put this under MaterialApp home to observe console logs.
class LifecycleDemoPage extends StatefulWidget {
  const LifecycleDemoPage({super.key, this.title = 'Lifecycle'});

  final String title;

  @override
  State<LifecycleDemoPage> createState() => _LifecycleDemoPageState();
}

class _LifecycleDemoPageState extends State<LifecycleDemoPage> {
  int _counter = 0;

  @override
  void initState() {
    super.initState();
    // One-time setup — controllers, listeners, first fetch kickoff.
    debugPrint('[Lifecycle] initState');
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // Safe place to read InheritedWidgets (Theme, MediaQuery, Localizations).
    final brightness = Theme.of(context).brightness;
    debugPrint('[Lifecycle] didChangeDependencies brightness=$brightness');
  }

  @override
  void didUpdateWidget(covariant LifecycleDemoPage oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.title != widget.title) {
      debugPrint('[Lifecycle] didUpdateWidget title: ${oldWidget.title} → ${widget.title}');
    }
  }

  @override
  void dispose() {
    debugPrint('[Lifecycle] dispose — cancel subscriptions here');
    super.dispose();
  }

  void _increment() {
    setState(() {
      _counter++;
      // Marks Element dirty → schedule rebuild → build() again.
    });
  }

  @override
  Widget build(BuildContext context) {
    debugPrint('[Lifecycle] build counter=$_counter');
    return Scaffold(
      appBar: AppBar(title: Text(widget.title)),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text('กดปุ่มแล้วดู log ใน console'),
            const SizedBox(height: 12),
            Text(
              '$_counter',
              style: Theme.of(context).textTheme.displayMedium,
            ),
            const SizedBox(height: 24),
            FilledButton(
              onPressed: _increment,
              child: const Text('setState → rebuild'),
            ),
          ],
        ),
      ),
    );
  }
}
