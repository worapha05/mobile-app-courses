// OOP: extends vs implements vs mixins.
// Prefer calling [runOopMixinsDemo] from the example app or tests.

void runOopMixinsDemo() {
  final dog = Dog(name: 'Mochi');
  dog.speak();
  dog.log('ate snack');

  final robot = CleaningRobot();
  robot.work();
  robot.charge();

  final admin = LearnerAdmin(id: 'u1', email: 'a@corp.com');
  print(admin.canDelete()); // true via mixin role
}

// ── Abstract base (extends = inherit implementation) ──
abstract class Animal {
  Animal({required this.name});

  final String name;

  void speak(); // must override
}

mixin Logger {
  void log(String message) => print('[${DateTime.now().toIso8601String()}] $message');
}

class Dog extends Animal with Logger {
  Dog({required super.name});

  @override
  void speak() => log('$name: Woof!');
}

// ── implements = contract only (no inherited body) ──
abstract interface class Workable {
  void work();
}

abstract interface class Chargeable {
  void charge();
}

class CleaningRobot implements Workable, Chargeable {
  @override
  void work() => print('Robot sweeping floor…');

  @override
  void charge() => print('Robot charging to 100%');
}

// ── Mixin for cross-cutting behavior ──
mixin RoleGuard {
  bool get isAdmin;

  bool canDelete() => isAdmin;
}

class LearnerAccount {
  LearnerAccount({required this.id, required this.email});

  final String id;
  final String email;
}

class LearnerAdmin extends LearnerAccount with RoleGuard {
  LearnerAdmin({required super.id, required super.email});

  @override
  bool get isAdmin => true;
}
