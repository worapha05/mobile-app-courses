import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../state_management/bloc/auth_cubit.dart';

/// Declarative router with ShellRoute + auth redirect.
///
/// Wire [authListenable] to a ChangeNotifier/Cubit stream adapter so
/// GoRouter re-evaluates `redirect` when login state changes.
class AppRouter {
  AppRouter({
    required AuthRepository authRepository,
    required Listenable authListenable,
  })  : _auth = authRepository,
        router = GoRouter(
          initialLocation: '/app/home',
          refreshListenable: authListenable,
          redirect: (context, state) {
            final loggedIn = _auth.isLoggedIn;
            final loc = state.matchedLocation;
            final onLogin = loc == '/login';

            if (!loggedIn && !onLogin) return '/login';
            if (loggedIn && onLogin) return '/app/home';
            return null;
          },
          routes: [
            GoRoute(
              path: '/login',
              builder: (context, state) => const _LoginPlaceholder(),
            ),
            StatefulShellRoute.indexedStack(
              builder: (context, state, navigationShell) {
                return _AppShell(navigationShell: navigationShell);
              },
              branches: [
                StatefulShellBranch(
                  routes: [
                    GoRoute(
                      path: '/app/home',
                      builder: (context, state) => const _HomePlaceholder(),
                    ),
                  ],
                ),
                StatefulShellBranch(
                  routes: [
                    GoRoute(
                      path: '/app/orders',
                      builder: (context, state) => const _OrdersPlaceholder(),
                      routes: [
                        GoRoute(
                          path: ':id',
                          builder: (context, state) {
                            final id = state.pathParameters['id']!;
                            return _OrderDetailPlaceholder(orderId: id);
                          },
                        ),
                      ],
                    ),
                  ],
                ),
                StatefulShellBranch(
                  routes: [
                    GoRoute(
                      path: '/app/profile',
                      builder: (context, state) => const _ProfilePlaceholder(),
                    ),
                  ],
                ),
              ],
            ),
          ],
        );

  final AuthRepository _auth;
  final GoRouter router;

  // Expose for labs / tests.
  AuthRepository get authRepository => _auth;
}

class _AppShell extends StatelessWidget {
  const _AppShell({required this.navigationShell});

  final StatefulNavigationShell navigationShell;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: navigationShell,
      bottomNavigationBar: NavigationBar(
        selectedIndex: navigationShell.currentIndex,
        onDestinationSelected: navigationShell.goBranch,
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home_outlined), label: 'หน้าแรก'),
          NavigationDestination(icon: Icon(Icons.receipt_long_outlined), label: 'ออเดอร์'),
          NavigationDestination(icon: Icon(Icons.person_outline), label: 'โปรไฟล์'),
        ],
      ),
    );
  }
}

class _LoginPlaceholder extends StatelessWidget {
  const _LoginPlaceholder();

  @override
  Widget build(BuildContext context) =>
      const Scaffold(body: Center(child: Text('Login Page')));
}

class _HomePlaceholder extends StatelessWidget {
  const _HomePlaceholder();

  @override
  Widget build(BuildContext context) =>
      const Scaffold(body: Center(child: Text('Home')));
}

class _OrdersPlaceholder extends StatelessWidget {
  const _OrdersPlaceholder();

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: const Text('ออเดอร์')),
        body: ListTile(
          title: const Text('ออเดอร์ #42'),
          onTap: () => context.go('/app/orders/42'),
        ),
      );
}

class _OrderDetailPlaceholder extends StatelessWidget {
  const _OrderDetailPlaceholder({required this.orderId});

  final String orderId;

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: Text('ออเดอร์ #$orderId')),
        body: Center(child: Text('รายละเอียดออเดอร์ $orderId')),
      );
}

class _ProfilePlaceholder extends StatelessWidget {
  const _ProfilePlaceholder();

  @override
  Widget build(BuildContext context) =>
      const Scaffold(body: Center(child: Text('Profile')));
}
