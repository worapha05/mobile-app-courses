import 'package:flutter/material.dart';

/// Pixel-aware responsive layout using LayoutBuilder + Flex + Stack + GridView.
class ResponsiveHomeShell extends StatelessWidget {
  const ResponsiveHomeShell({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: LayoutBuilder(
        builder: (context, constraints) {
          final isWide = constraints.maxWidth >= 720;
          if (isWide) {
            return const _WideLayout();
          }
          return const _NarrowLayout();
        },
      ),
    );
  }
}

class _NarrowLayout extends StatelessWidget {
  const _NarrowLayout();

  @override
  Widget build(BuildContext context) {
    return CustomScrollView(
      slivers: [
        const SliverToBoxAdapter(child: _HeroBanner()),
        SliverPadding(
          padding: const EdgeInsets.all(16),
          sliver: SliverGrid(
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              mainAxisSpacing: 12,
              crossAxisSpacing: 12,
              childAspectRatio: 0.85,
            ),
            delegate: SliverChildBuilderDelegate(
              (context, index) => _ProductTile(index: index),
              childCount: 8,
            ),
          ),
        ),
      ],
    );
  }
}

class _WideLayout extends StatelessWidget {
  const _WideLayout();

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const SizedBox(
          width: 240,
          child: _SideNav(),
        ),
        const VerticalDivider(width: 1),
        Expanded(
          child: Column(
            children: [
              const _HeroBanner(),
              Expanded(
                child: GridView.builder(
                  padding: const EdgeInsets.all(24),
                  gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
                    maxCrossAxisExtent: 220,
                    mainAxisSpacing: 16,
                    crossAxisSpacing: 16,
                    childAspectRatio: 0.9,
                  ),
                  itemCount: 12,
                  itemBuilder: (context, index) => _ProductTile(index: index),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _HeroBanner extends StatelessWidget {
  const _HeroBanner();

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return AspectRatio(
      aspectRatio: 16 / 7,
      child: Stack(
        fit: StackFit.expand,
        children: [
          ColoredBox(color: scheme.primaryContainer),
          // Decorative gradient — atmosphere without fake image dependency.
          DecoratedBox(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  scheme.primary.withValues(alpha: 0.35),
                  scheme.tertiary.withValues(alpha: 0.25),
                ],
              ),
            ),
          ),
          Positioned(
            left: 24,
            bottom: 24,
            right: 24,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'Zero to Expert',
                  style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                        color: scheme.onPrimaryContainer,
                        fontWeight: FontWeight.w800,
                      ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Flutter layout ที่ยืดหยุ่นตามความกว้างจอ',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: scheme.onPrimaryContainer,
                      ),
                ),
              ],
            ),
          ),
          Positioned(
            top: 16,
            right: 16,
            child: Chip(
              avatar: Icon(Icons.bolt, color: scheme.primary, size: 18),
              label: const Text('Live'),
            ),
          ),
        ],
      ),
    );
  }
}

class _SideNav extends StatelessWidget {
  const _SideNav();

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.symmetric(vertical: 24),
      children: const [
        ListTile(leading: Icon(Icons.home), title: Text('หน้าแรก')),
        ListTile(leading: Icon(Icons.category), title: Text('หมวดหมู่')),
        ListTile(leading: Icon(Icons.favorite_border), title: Text('รายการโปรด')),
        ListTile(leading: Icon(Icons.person_outline), title: Text('โปรไฟล์')),
      ],
    );
  }
}

class _ProductTile extends StatelessWidget {
  const _ProductTile({required this.index});

  final int index;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Material(
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
                  child: Icon(Icons.shopping_bag_outlined, size: 40, color: scheme.primary),
                ),
              ),
              Text('สินค้า #${index + 1}', style: Theme.of(context).textTheme.titleSmall),
              const SizedBox(height: 4),
              Text(
                '฿${(index + 1) * 129}',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
