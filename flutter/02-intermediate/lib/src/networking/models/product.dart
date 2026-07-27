// Type-safe product model.
// In a real project annotate with freezed + json_serializable and run build_runner:
//
// @freezed
// class Product with _$Product {
//   const factory Product({
//     required String id,
//     required String name,
//     required double price,
//     String? imageUrl,
//   }) = _Product;
//   factory Product.fromJson(Map<String, dynamic> json) => _$ProductFromJson(json);
// }

class Product {
  const Product({
    required this.id,
    required this.name,
    required this.price,
    this.imageUrl,
  });

  final String id;
  final String name;
  final double price;
  final String? imageUrl;

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'] as String,
      name: json['name'] as String,
      price: (json['price'] as num).toDouble(),
      imageUrl: json['imageUrl'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'price': price,
        if (imageUrl != null) 'imageUrl': imageUrl,
      };

  Product copyWith({
    String? id,
    String? name,
    double? price,
    String? imageUrl,
  }) {
    return Product(
      id: id ?? this.id,
      name: name ?? this.name,
      price: price ?? this.price,
      imageUrl: imageUrl ?? this.imageUrl,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Product &&
          id == other.id &&
          name == other.name &&
          price == other.price &&
          imageUrl == other.imageUrl;

  @override
  int get hashCode => Object.hash(id, name, price, imageUrl);
}
