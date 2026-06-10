const { MongoClient, ObjectId } = require('mongodb');

const URI = 'mongodb+srv://umair:11223344@cluster0.y6bxovc.mongodb.net/ecommerce-loyalty?serverSelectionTimeoutMS=10000&connectTimeoutMS=10000';

const categories = [
  { _id: new ObjectId(), name: 'Men Clothing', slug: 'men-clothing', createdAt: new Date(), updatedAt: new Date() },
  { _id: new ObjectId(), name: 'Women Clothing', slug: 'women-clothing', createdAt: new Date(), updatedAt: new Date() },
  { _id: new ObjectId(), name: 'Electronics', slug: 'electronics', createdAt: new Date(), updatedAt: new Date() },
  { _id: new ObjectId(), name: 'Footwear', slug: 'footwear', createdAt: new Date(), updatedAt: new Date() },
  { _id: new ObjectId(), name: 'Accessories', slug: 'accessories', createdAt: new Date(), updatedAt: new Date() },
];

function makeProduct(name, slug, price, categoryId, purchaseType, pointsPrice, pointsReward, colors, sizes, stock, description) {
  return {
    _id: new ObjectId(),
    name,
    slug,
    price,
    description,
    categoryId,
    images: [
      `https://placehold.co/600x400?text=${encodeURIComponent(name)}`
    ],
    stock,
    colors,
    sizes,
    colorImages: {},
    purchaseType,
    pointsPrice: pointsPrice || null,
    pointsReward: pointsReward || 0,
    rating: parseFloat((Math.random() * 2 + 3).toFixed(1)),
    numReviews: Math.floor(Math.random() * 50),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

async function seed() {
  const client = new MongoClient(URI);
  try {
    await client.connect();
    console.log('Connected to database.');
    const db = client.db('ecommerce-loyalty');

    // Clear existing
    await db.collection('categories').deleteMany({});
    await db.collection('products').deleteMany({});

    // Insert categories
    await db.collection('categories').insertMany(categories);
    console.log('5 categories inserted.');

    const [menCat, womenCat, elecCat, footCat, accCat] = categories;

    const products = [
      // Men Clothing (4)
      makeProduct('Men Classic T-Shirt', 'men-classic-tshirt', 19.99, menCat._id, 'money', null, 20, ['White', 'Black', 'Grey'], ['S', 'M', 'L', 'XL'], 100, 'Comfortable everyday classic t-shirt for men.'),
      makeProduct('Men Slim Fit Jeans', 'men-slim-fit-jeans', 49.99, menCat._id, 'hybrid', 500, 50, ['Blue', 'Black'], ['30', '32', '34', '36'], 60, 'Stylish slim fit jeans for a modern look.'),
      makeProduct('Men Formal Shirt', 'men-formal-shirt', 34.99, menCat._id, 'money', null, 35, ['White', 'Blue', 'Pink'], ['S', 'M', 'L', 'XL', 'XXL'], 80, 'Premium formal shirt for office and events.'),
      makeProduct('Men Winter Jacket', 'men-winter-jacket', 89.99, menCat._id, 'money', null, 90, ['Black', 'Navy', 'Brown'], ['M', 'L', 'XL'], 40, 'Warm and stylish winter jacket.'),

      // Women Clothing (4)
      makeProduct('Women Floral Dress', 'women-floral-dress', 39.99, womenCat._id, 'money', null, 40, ['Red', 'Yellow', 'Pink'], ['XS', 'S', 'M', 'L'], 70, 'Beautiful floral dress for all occasions.'),
      makeProduct('Women Casual Top', 'women-casual-top', 24.99, womenCat._id, 'hybrid', 250, 25, ['White', 'Black', 'Green'], ['XS', 'S', 'M', 'L', 'XL'], 90, 'Trendy casual top for everyday wear.'),
      makeProduct('Women Denim Jacket', 'women-denim-jacket', 59.99, womenCat._id, 'money', null, 60, ['Blue', 'Light Blue'], ['S', 'M', 'L']), 50, 'Classic denim jacket with a modern fit.',
      makeProduct('Women Printed Kurti', 'women-printed-kurti', 29.99, womenCat._id, 'points', 300, 0, ['Orange', 'Purple', 'Teal'], ['S', 'M', 'L', 'XL'], 55, 'Elegant printed kurti for a traditional look.'),

      // Electronics (4)
      makeProduct('Wireless Bluetooth Earbuds', 'wireless-bluetooth-earbuds', 49.99, elecCat._id, 'money', null, 50, ['Black', 'White'], [], 120, 'High quality wireless earbuds with noise cancellation.'),
      makeProduct('Smart Watch', 'smart-watch', 129.99, elecCat._id, 'hybrid', 1300, 130, ['Black', 'Silver', 'Rose Gold'], [], 45, 'Feature-rich smartwatch with health tracking.'),
      makeProduct('Portable Power Bank', 'portable-power-bank', 34.99, elecCat._id, 'money', null, 35, ['Black', 'White', 'Blue'], [], 200, '20000mAh fast charging portable power bank.'),
      makeProduct('USB-C Hub', 'usb-c-hub', 24.99, elecCat._id, 'points', 250, 0, ['Grey', 'Silver'], [], 150, '7-in-1 USB-C hub for laptops and tablets.'),

      // Footwear (4)
      makeProduct('Men Running Shoes', 'men-running-shoes', 69.99, footCat._id, 'money', null, 70, ['Black', 'White', 'Red'], ['40', '41', '42', '43', '44', '45'], 85, 'Lightweight running shoes for maximum performance.'),
      makeProduct('Women Sneakers', 'women-sneakers', 54.99, footCat._id, 'hybrid', 550, 55, ['White', 'Pink', 'Blue'], ['36', '37', '38', '39', '40'], 75, 'Stylish and comfortable women sneakers.'),
      makeProduct('Casual Loafers', 'casual-loafers', 44.99, footCat._id, 'money', null, 45, ['Brown', 'Black', 'Tan'], ['40', '41', '42', '43', '44'], 60, 'Premium casual loafers for everyday use.'),
      makeProduct('Sports Sandals', 'sports-sandals', 29.99, footCat._id, 'money', null, 30, ['Black', 'Grey'], ['38', '39', '40', '41', '42', '43'], 100, 'Durable and comfortable sports sandals.'),

      // Accessories (4)
      makeProduct('Leather Wallet', 'leather-wallet', 29.99, accCat._id, 'money', null, 30, ['Brown', 'Black'], [], 200, 'Genuine leather slim wallet with card slots.'),
      makeProduct('Sunglasses UV400', 'sunglasses-uv400', 19.99, accCat._id, 'hybrid', 200, 20, ['Black', 'Gold', 'Silver'], [], 150, 'Stylish UV400 protection sunglasses.'),
      makeProduct('Canvas Backpack', 'canvas-backpack', 39.99, accCat._id, 'money', null, 40, ['Grey', 'Navy', 'Black'], [], 80, 'Durable canvas backpack with laptop compartment.'),
      makeProduct('Woven Belt', 'woven-belt', 14.99, accCat._id, 'points', 150, 0, ['Black', 'Brown'], ['S', 'M', 'L', 'XL'], 120, 'Classic woven belt for formal and casual outfits.'),
    ];

    await db.collection('products').insertMany(products);
    console.log('20 products inserted.');
    console.log('\nDone! Database seeded successfully.');
  } catch (err) {
    console.error('Seeding failed:', err.message);
  } finally {
    await client.close();
  }
}

seed();
