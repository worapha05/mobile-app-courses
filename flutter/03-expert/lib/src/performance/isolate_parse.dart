import 'dart:async';
import 'dart:convert';
import 'dart:isolate';

/// Heavy JSON parsing off the UI isolate.
class OrderDto {
  const OrderDto({
    required this.id,
    required this.total,
    required this.itemCount,
  });

  final String id;
  final double total;
  final int itemCount;

  factory OrderDto.fromJson(Map<String, dynamic> json) {
    return OrderDto(
      id: json['id'] as String,
      total: (json['total'] as num).toDouble(),
      itemCount: json['itemCount'] as int,
    );
  }
}

/// Top-level or static function — required for Isolate.run entrypoints.
List<OrderDto> parseOrdersJson(String raw) {
  final list = jsonDecode(raw) as List<dynamic>;
  return list
      .cast<Map<String, dynamic>>()
      .map(OrderDto.fromJson)
      .toList(growable: false);
}

/// Call from a repository / use case — never from build().
Future<List<OrderDto>> parseOrdersInBackground(String raw) {
  return Isolate.run(() => parseOrdersJson(raw));
}

/// Long-lived worker for upload / transform pipelines.
class BackgroundPipeline {
  BackgroundPipeline._(this._isolate, this._replyPort, this._responses);

  final Isolate _isolate;
  final SendPort _replyPort;
  final ReceivePort _responses;
  int _seq = 0;
  final Map<int, Completer<Object?>> _pending = {};

  static Future<BackgroundPipeline> spawn() async {
    final ready = ReceivePort();
    final isolate = await Isolate.spawn(_workerMain, ready.sendPort);
    final replyPort = await ready.first as SendPort;
    ready.close();

    final responses = ReceivePort();
    replyPort.send(responses.sendPort);

    final pipeline = BackgroundPipeline._(isolate, replyPort, responses);
    responses.listen(pipeline._onMessage);
    return pipeline;
  }

  void _onMessage(dynamic message) {
    if (message is Map && message['id'] is int) {
      final id = message['id'] as int;
      final completer = _pending.remove(id);
      if (message['error'] != null) {
        completer?.completeError(StateError(message['error'].toString()));
      } else {
        completer?.complete(message['result']);
      }
    }
  }

  Future<int> hashPayload(String payload) {
    final id = ++_seq;
    final completer = Completer<Object?>();
    _pending[id] = completer;
    _replyPort.send({'id': id, 'cmd': 'hash', 'payload': payload});
    return completer.future.then((v) => v as int);
  }

  void dispose() {
    _responses.close();
    _isolate.kill(priority: Isolate.immediate);
  }
}

void _workerMain(SendPort starter) {
  final inbox = ReceivePort();
  starter.send(inbox.sendPort);

  SendPort? client;
  inbox.listen((message) {
    if (message is SendPort) {
      client = message;
      return;
    }
    if (message is Map && client != null) {
      final id = message['id'];
      try {
        if (message['cmd'] == 'hash') {
          final payload = message['payload'] as String;
          client!.send({'id': id, 'result': payload.hashCode});
        }
      } catch (e) {
        client!.send({'id': id, 'error': e.toString()});
      }
    }
  });
}
