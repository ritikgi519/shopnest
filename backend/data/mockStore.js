const bcrypt = require('bcryptjs');

// In-memory data store for when MongoDB is disconnected
const adminPasswordHash = bcrypt.hashSync('password123', 10);

const users = [
  {
    _id: '650000000000000000000099',
    name: 'Admin User',
    email: 'admin@shopnest.com',
    password: adminPasswordHash,
    role: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '650000000000000000000098',
    name: 'Demo Customer',
    email: 'user@shopnest.com',
    password: adminPasswordHash,
    role: 'user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const wishlists = {
  '650000000000000000000098': ['650000000000000000000002']
};

const products = [
  {
    _id: '650000000000000000000001',
    name: 'Wireless Noise-Cancelling Headphones',
    description: 'Immersive sound experience with advanced active noise cancellation and 30-hour battery life.',
    price: 299.99,
    category: 'Electronics',
    stock: 15,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ratings: 4.8,
    numReviews: 2,
    reviews: [
      {
        _id: '650000000000000000000501',
        user: '650000000000000000000098',
        name: 'Demo Customer',
        rating: 5,
        comment: 'Crystal-clear sound quality and the battery life is sensational! Highly recommended for flights.',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        _id: '650000000000000000000502',
        user: '650000000000000000000099',
        name: 'Aarav Sharma',
        rating: 4.5,
        comment: 'Super comfortable earcups and stellar noise cancellation. Build quality feels very premium.',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '650000000000000000000002',
    name: 'Minimalist Modern Chair',
    description: 'A stylish and comfortable addition to any contemporary living room or reading nook.',
    price: 150.00,
    category: 'Furniture',
    stock: 30,
    imageUrl: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ratings: 4.5,
    numReviews: 1,
    reviews: [
      {
        _id: '650000000000000000000503',
        user: '650000000000000000000098',
        name: 'Demo Customer',
        rating: 5,
        comment: 'Beautiful ergonomic design. Looks gorgeous in our studio room.',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '650000000000000000000003',
    name: 'Professional DSLR Camera',
    description: 'Capture stunning moments with 45MP high-resolution sensor clarity and ultra-fast autofocus.',
    price: 1199.99,
    category: 'Electronics',
    stock: 8,
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ratings: 5.0,
    numReviews: 1,
    reviews: [
      {
        _id: '650000000000000000000504',
        user: '650000000000000000000098',
        name: 'Rohan Mehra',
        rating: 5,
        comment: 'Sharp low-light auto focus and incredible dynamic range. Perfect for portrait shoots.',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '650000000000000000000004',
    name: 'Classic White Sneakers',
    description: 'Versatile and comfortable, crafted from supple grain leather for any casual or smart-casual outfit.',
    price: 85.00,
    category: 'Clothing',
    stock: 50,
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ratings: 4.5,
    numReviews: 1,
    reviews: [
      {
        _id: '650000000000000000000505',
        user: '650000000000000000000098',
        name: 'Demo Customer',
        rating: 4,
        comment: 'Comfortable fit right out of the box. Easy to clean and matches with everything.',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '650000000000000000000005',
    name: 'Ultra-Slim 4K OLED Smart TV (65")',
    description: 'Immerse yourself in infinite contrast with Dolby Vision IQ, 120Hz gaming mode, and cinematic Dolby Atmos.',
    price: 1499.00,
    category: 'Electronics',
    stock: 12,
    imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ratings: 4.9,
    numReviews: 1,
    reviews: [
      {
        _id: '650000000000000000000506',
        user: '650000000000000000000099',
        name: 'Priya Patel',
        rating: 5,
        comment: 'Incredible inky blacks and vibrant HDR colors. Movies look just like they were mastered for cinema.',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '650000000000000000000006',
    name: 'Mechanical RGB Gaming Keyboard',
    description: 'Tactile hot-swappable mechanical switches, per-key RGB illumination, aircraft-grade aluminum top plate.',
    price: 129.50,
    category: 'Electronics',
    stock: 35,
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ratings: 4.7,
    numReviews: 1,
    reviews: [
      {
        _id: '650000000000000000000507',
        user: '650000000000000000000098',
        name: 'Arjun Das',
        rating: 5,
        comment: 'Sensational keystroke acoustic feedback. The hot-swap PCB makes customization a dream.',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 86400000 * 6).toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '650000000000000000000007',
    name: 'Waterproof Bluetooth Speaker',
    description: 'Rugged 360-degree acoustic performance with punchy bass, IPX7 waterproof housing, and 24-hour battery.',
    price: 89.99,
    category: 'Electronics',
    stock: 40,
    imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ratings: 4.6,
    numReviews: 1,
    reviews: [
      {
        _id: '650000000000000000000508',
        user: '650000000000000000000099',
        name: 'Kavita Roy',
        rating: 5,
        comment: 'Took this on a camping weekend. Lasted all 3 days on a single charge and handled poolside splashes easily.',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '650000000000000000000008',
    name: 'Smart Fitness Watch Series 9',
    description: 'AMOLED edge-to-edge display with continuous heart health monitoring, SpO2 sensor, and onboard GPS.',
    price: 249.00,
    category: 'Electronics',
    stock: 25,
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ratings: 4.8,
    numReviews: 1,
    reviews: [
      {
        _id: '650000000000000000000509',
        user: '650000000000000000000098',
        name: 'Demo Customer',
        rating: 5,
        comment: 'Very accurate sleep and workout tracking. Battery easily lasts 48+ hours with always-on display.',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '650000000000000000000009',
    name: 'Premium Merino Wool Knit Sweater',
    description: 'Spun from pure Australian Merino wool, providing ultra-lightweight warmth, natural breathability, and softness.',
    price: 115.00,
    category: 'Clothing',
    stock: 28,
    imageUrl: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ratings: 4.7,
    numReviews: 1,
    reviews: [
      {
        _id: '650000000000000000000510',
        user: '650000000000000000000098',
        name: 'Neha Kapoor',
        rating: 5,
        comment: 'So buttery soft against the skin, zero scratchiness. Fits true to size with a refined drape.',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '650000000000000000000010',
    name: 'Handcrafted Leather Messenger Bag',
    description: 'Full-grain vegetable-tanned leather briefcase with dedicated 15-inch laptop compartment and brass hardware.',
    price: 185.00,
    category: 'Clothing',
    stock: 18,
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ratings: 4.9,
    numReviews: 1,
    reviews: [
      {
        _id: '650000000000000000000511',
        user: '650000000000000000000099',
        name: 'Vikram Singh',
        rating: 5,
        comment: 'Outstanding artisan leather craftsmanship. Develops a gorgeous patina over time.',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 86400000 * 8).toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '650000000000000000000011',
    name: 'Polarized Titanium Aviator Sunglasses',
    description: 'Featherweight titanium frames with scratch-resistant polarized TAC lenses providing 100% UV400 protection.',
    price: 135.00,
    category: 'Clothing',
    stock: 45,
    imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ratings: 4.6,
    numReviews: 1,
    reviews: [
      {
        _id: '650000000000000000000512',
        user: '650000000000000000000098',
        name: 'Demo Customer',
        rating: 5,
        comment: 'Crystal clear optics and so lightweight you barely feel them on your face all day.',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '650000000000000000000012',
    name: 'Tailored Slim-Fit Cotton Chinos',
    description: 'Premium stretch-cotton chinos crafted for breathable all-day comfort, versatile styling, and wrinkle resistance.',
    price: 68.00,
    category: 'Clothing',
    stock: 60,
    imageUrl: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ratings: 4.5,
    numReviews: 1,
    reviews: [
      {
        _id: '650000000000000000000513',
        user: '650000000000000000000098',
        name: 'Manish Verma',
        rating: 4,
        comment: 'Great fit around the thighs and waist with just the right amount of stretch.',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '650000000000000000000013',
    name: 'Ergonomic Mesh Office Chair',
    description: 'Designed for optimal spinal health with dynamic lumbar support, breathable matrix mesh, and 3D adjustable armrests.',
    price: 279.00,
    category: 'Furniture',
    stock: 20,
    imageUrl: 'https://images.unsplash.com/photo-1580481077195-c3a82105e3b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ratings: 4.8,
    numReviews: 1,
    reviews: [
      {
        _id: '650000000000000000000514',
        user: '650000000000000000000099',
        name: 'Ananya Sen',
        rating: 5,
        comment: 'Completely eliminated my lower back soreness during long 8+ hour coding days. Worth every penny.',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '650000000000000000000014',
    name: 'Mid-Century Solid Oak Coffee Table',
    description: 'Artisan-crafted American oak coffee table featuring beveled edges, solid tapered legs, and lower open shelf.',
    price: 320.00,
    category: 'Furniture',
    stock: 14,
    imageUrl: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ratings: 4.7,
    numReviews: 1,
    reviews: [
      {
        _id: '650000000000000000000515',
        user: '650000000000000000000098',
        name: 'Demo Customer',
        rating: 5,
        comment: 'Solid, hefty wood with natural grain beauty. Assembled in under 15 minutes.',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 86400000 * 9).toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '650000000000000000000015',
    name: 'Dimmable Ceramic Accent Desk Lamp',
    description: 'Handcrafted stoneware ceramic base with natural textured linen shade and warm dimmable LED ambiance.',
    price: 74.00,
    category: 'Furniture',
    stock: 38,
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ratings: 4.6,
    numReviews: 1,
    reviews: [
      {
        _id: '650000000000000000000516',
        user: '650000000000000000000098',
        name: 'Siddharth Rao',
        rating: 5,
        comment: 'Adds an instantaneous warm and cozy mood to our bedside nightstand.',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '650000000000000000000016',
    name: 'Geometric Handwoven Wool Area Rug',
    description: 'Neutral minimalist palette 5x8 ft area rug handwoven with durable, plush New Zealand wool fibers.',
    price: 210.00,
    category: 'Furniture',
    stock: 16,
    imageUrl: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ratings: 4.7,
    numReviews: 1,
    reviews: [
      {
        _id: '650000000000000000000517',
        user: '650000000000000000000099',
        name: 'Tara Joshi',
        rating: 5,
        comment: 'Extraordinarily soft underfoot and doesn’t shed like cheap rugs. Ties the room together beautifully.',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 86400000 * 6).toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '650000000000000000000017',
    name: 'Precision Pour-Over Electric Gooseneck Kettle',
    description: 'Variable temperature dial to 1 degree precision with built-in stopwatch brew timer and counterbalanced handle.',
    price: 98.00,
    category: 'Kitchen',
    stock: 32,
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ratings: 4.9,
    numReviews: 1,
    reviews: [
      {
        _id: '650000000000000000000518',
        user: '650000000000000000000098',
        name: 'Aditya Nair',
        rating: 5,
        comment: 'The controlled pour flow rate makes an enormous difference in specialty coffee extraction. Essential kitchen gear.',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '650000000000000000000018',
    name: 'Italian 15-Bar Espresso Machine',
    description: 'Commercial 15-bar Italian pressure pump with microfoam steam wand for velvety cappuccinos and espresso shots.',
    price: 389.00,
    category: 'Kitchen',
    stock: 12,
    imageUrl: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ratings: 4.8,
    numReviews: 1,
    reviews: [
      {
        _id: '650000000000000000000519',
        user: '650000000000000000000099',
        name: 'Demo Customer',
        rating: 5,
        comment: 'Produces rich golden crema every single morning. Heats up in just 30 seconds!',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '650000000000000000000019',
    name: 'Japanese Damascus Steel Chef Knife (8")',
    description: 'Forged from 67 micro-layers of Japanese Damascus steel with VG-10 core and ergonomic moisture-resistant pakkawood handle.',
    price: 145.00,
    category: 'Kitchen',
    stock: 22,
    imageUrl: 'https://images.unsplash.com/photo-1593618998160-e34014e67546?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ratings: 5.0,
    numReviews: 1,
    reviews: [
      {
        _id: '650000000000000000000520',
        user: '650000000000000000000098',
        name: 'Chef Rajesh',
        rating: 5,
        comment: 'Slices through ripe tomatoes and meat with zero resistance. Perfectly balanced in the hand.',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '650000000000000000000020',
    name: 'Enameled Cast Iron Dutch Oven (5.5 Qt)',
    description: 'Heavy-duty enameled cast iron delivers superior heat retention and uniform distribution for braising, sourdough, and stews.',
    price: 119.00,
    category: 'Kitchen',
    stock: 26,
    imageUrl: 'https://images.unsplash.com/photo-1584990347449-3995f57353f8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ratings: 4.8,
    numReviews: 1,
    reviews: [
      {
        _id: '650000000000000000000521',
        user: '650000000000000000000099',
        name: 'Sunita Reddy',
        rating: 5,
        comment: 'Bakes artisan crusty sourdough loaves to perfection. Easy to clean enamel coating.',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '650000000000000000000021',
    name: 'Sonic Electric Toothbrush with UV Case',
    description: '40,000 sonic vibrations per minute with 5 custom modes, DuPont bristles, and UV travel sanitizer case.',
    price: 89.00,
    category: 'Beauty',
    stock: 42,
    imageUrl: 'https://images.unsplash.com/photo-1559591937-e1112b323677?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ratings: 4.7,
    numReviews: 1,
    reviews: [
      {
        _id: '650000000000000000000522',
        user: '650000000000000000000098',
        name: 'Demo Customer',
        rating: 5,
        comment: 'Leaves teeth feeling dentist-clean every single day. The UV sanitizing travel case is awesome.',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '650000000000000000000022',
    name: 'Ultrasonic Aromatherapy Essential Oil Diffuser',
    description: 'Handcrafted wood grain ultrasonic diffuser featuring whisper-quiet cool mist, ambient LED light cycles, and safety auto-off.',
    price: 45.00,
    category: 'Beauty',
    stock: 55,
    imageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ratings: 4.6,
    numReviews: 1,
    reviews: [
      {
        _id: '650000000000000000000523',
        user: '650000000000000000000098',
        name: 'Meera Chawla',
        rating: 5,
        comment: 'Fills the entire master bedroom with lavender fragrance within minutes. Beautiful warm night light.',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '650000000000000000000023',
    name: 'True Wireless Noise-Cancelling Earbuds Pro',
    description: 'Spatial audio with dynamic head tracking, active noise cancellation, transparency mode, and wireless MagSafe charging case.',
    price: 199.99,
    category: 'Electronics',
    stock: 28,
    imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ratings: 4.8,
    numReviews: 1,
    reviews: [
      {
        _id: '650000000000000000000524',
        user: '650000000000000000000098',
        name: 'Demo Customer',
        rating: 5,
        comment: 'The active noise cancellation is stunning. Seamless Bluetooth pairing and crystal-clear call quality.',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '650000000000000000000024',
    name: 'Portable High-Res Bluetooth Speaker',
    description: '360-degree immersive sound with dual passive radiators, IPX7 waterproof rating, and 24-hour non-stop battery playtime.',
    price: 129.99,
    category: 'Electronics',
    stock: 35,
    imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ratings: 4.7,
    numReviews: 1,
    reviews: [
      {
        _id: '650000000000000000000525',
        user: '650000000000000000000099',
        name: 'Karan Patel',
        rating: 5,
        comment: 'Deep punchy bass and remarkable clarity even at high volumes. Survived pool splashes with zero issues.',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '650000000000000000000025',
    name: 'Tailored Slim-Fit Linen Blazer',
    description: 'Breathable 100% natural European linen tailored with soft unstructured shoulders, double rear vents, and horn buttons.',
    price: 165.00,
    category: 'Clothing',
    stock: 18,
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ratings: 4.8,
    numReviews: 1,
    reviews: [
      {
        _id: '650000000000000000000526',
        user: '650000000000000000000098',
        name: 'Demo Customer',
        rating: 5,
        comment: 'Drapes exceptionally well and stays cool during warm outdoor events. Impeccable tailoring and finish.',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '650000000000000000000026',
    name: 'Water-Repellent Commuter Trench Coat',
    description: 'Modern technical cotton-blend trench with weatherproof DWR coating, storm flap, waist belt, and deep fleece-lined pockets.',
    price: 219.00,
    category: 'Clothing',
    stock: 14,
    imageUrl: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ratings: 4.9,
    numReviews: 1,
    reviews: [
      {
        _id: '650000000000000000000527',
        user: '650000000000000000000099',
        name: 'Ananya Roy',
        rating: 5,
        comment: 'Keeps rain completely off while looking effortlessly chic and sharp for office commuting.',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '650000000000000000000027',
    name: 'Solid American Walnut Coffee Table',
    description: 'Handcrafted solid walnut coffee table with organic curved beveled edges, slender tapered legs, and natural satin wax finish.',
    price: 340.00,
    category: 'Furniture',
    stock: 9,
    imageUrl: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ratings: 4.9,
    numReviews: 1,
    reviews: [
      {
        _id: '650000000000000000000528',
        user: '650000000000000000000098',
        name: 'Vikram Mehta',
        rating: 5,
        comment: 'The natural wood grain is breathtaking. Heavy solid construction that will last generations.',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '650000000000000000000028',
    name: 'Velvet Ergonomic Accent Lounge Armchair',
    description: 'Plush stain-resistant velvet upholstery over high-density resilient foam cushioning with matte black steel splayed legs.',
    price: 275.00,
    category: 'Furniture',
    stock: 11,
    imageUrl: 'https://images.unsplash.com/photo-1580481077195-c23199d78bc4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ratings: 4.7,
    numReviews: 1,
    reviews: [
      {
        _id: '650000000000000000000529',
        user: '650000000000000000000099',
        name: 'Demo Customer',
        rating: 5,
        comment: 'Extremely cozy for reading. The jewel-tone velvet adds luxurious warmth to our living room.',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '650000000000000000000029',
    name: 'Professional High-Speed Countertop Blender',
    description: 'Commercial-grade 1400W motor with 6 aircraft-grade stainless steel blades, pulse dial, and 64-oz shatterproof BPA-free pitcher.',
    price: 189.00,
    category: 'Kitchen',
    stock: 20,
    imageUrl: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ratings: 4.8,
    numReviews: 1,
    reviews: [
      {
        _id: '650000000000000000000530',
        user: '650000000000000000000098',
        name: 'Rohan Gupta',
        rating: 5,
        comment: 'Crushes frozen fruit and ice into silk-smooth smoothies in under 20 seconds. Super easy to rinse clean.',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '650000000000000000000030',
    name: 'Non-Stick Ceramic Cookware 10-Piece Set',
    description: 'Toxin-free mineral ceramic non-stick coating with induction-ready heavy gauge aluminum core and cool-touch stainless steel handles.',
    price: 249.00,
    category: 'Kitchen',
    stock: 15,
    imageUrl: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ratings: 4.9,
    numReviews: 1,
    reviews: [
      {
        _id: '650000000000000000000531',
        user: '650000000000000000000099',
        name: 'Pooja Verma',
        rating: 5,
        comment: 'Food literally glides off without butter or oil. Gorgeous color and solid, comfortable handles.',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '650000000000000000000031',
    name: 'Botanical Rosehip & Bakuchiol Facial Serum',
    description: 'Antioxidant-rich organic facial oil with plant-derived retinol alternative Bakuchiol, cold-pressed rosehip seed oil, and Vitamin E.',
    price: 52.00,
    category: 'Beauty',
    stock: 48,
    imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ratings: 4.9,
    numReviews: 1,
    reviews: [
      {
        _id: '650000000000000000000532',
        user: '650000000000000000000098',
        name: 'Demo Customer',
        rating: 5,
        comment: 'Gives my skin a radiant dewy glow overnight without clogging pores. Absorbs rapidly.',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '650000000000000000000032',
    name: 'Natural Jade Facial Roller & Gua Sha Sculpting Set',
    description: 'Authentic 100% Brazilian Xiuyan jade roller with dual-ended smooth stone and ergonomic heart-shaped Gua Sha lymphatic drainage tool.',
    price: 32.00,
    category: 'Beauty',
    stock: 60,
    imageUrl: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ratings: 4.8,
    numReviews: 1,
    reviews: [
      {
        _id: '650000000000000000000533',
        user: '650000000000000000000099',
        name: 'Simran Kaur',
        rating: 5,
        comment: 'Keeps cold naturally and depuffs morning facial tension so well. Outstanding stone craftsmanship.',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '650000000000000000000033',
    name: '4K Ultra HD Drone with Gimbal Camera',
    description: '3-axis motorized gimbal with 4K HDR 60fps video, GPS auto-return, obstacle sensing, and 34-minute flight time per battery.',
    price: 499.00,
    category: 'Electronics',
    stock: 16,
    imageUrl: 'https://images.unsplash.com/photo-1507582020434-9e063efe2850?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ratings: 4.9,
    numReviews: 1,
    reviews: [
      {
        _id: '650000000000000000000534',
        user: '650000000000000000000098',
        name: 'Demo Customer',
        rating: 5,
        comment: 'Crystal-clear aerial 4K footage and rocks-steady wind resistance even over ocean cliffs.',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '650000000000000000000034',
    name: 'Wireless Ergonomic Vertical Mouse',
    description: 'Natural handshake 57-degree ergonomic angle reduces muscle strain with whisper-quiet clicks, multi-device flow, and rechargeable USB-C.',
    price: 59.99,
    category: 'Electronics',
    stock: 40,
    imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ratings: 4.8,
    numReviews: 1,
    reviews: [
      {
        _id: '650000000000000000000535',
        user: '650000000000000000000099',
        name: 'Arjun Sen',
        rating: 5,
        comment: 'Eliminated my carpal tunnel wrist pain in less than a week of full-time office work.',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '650000000000000000000035',
    name: 'Smart Home 1080p Security Camera (2-Pack)',
    description: 'Weatherproof HD outdoor and indoor security cams featuring color night vision, 2-way audio, AI person detection, and cloud backup.',
    price: 79.99,
    category: 'Electronics',
    stock: 25,
    imageUrl: 'https://images.unsplash.com/photo-1557324232-b891713e3dcd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ratings: 4.7,
    numReviews: 1,
    reviews: [
      {
        _id: '650000000000000000000536',
        user: '650000000000000000000098',
        name: 'Demo Customer',
        rating: 5,
        comment: 'Instant motion alert push notifications and very clear color night vision.',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '650000000000000000000036',
    name: 'Fast Magnetic Wireless Charging Stand 3-in-1',
    description: 'Simultaneously fast-charges smartphone, smartwatch, and wireless earbuds with anti-slip weighted aluminum base and LED indicator.',
    price: 69.50,
    category: 'Electronics',
    stock: 32,
    imageUrl: 'https://images.unsplash.com/photo-1586105251261-72a756497a11?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ratings: 4.8,
    numReviews: 1,
    reviews: [
      {
        _id: '650000000000000000000537',
        user: '650000000000000000000099',
        name: 'Ritu Sharma',
        rating: 5,
        comment: 'Cleaned up all the cable clutter on my nightstand completely. Strong magnetic snap.',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '650000000000000000000037',
    name: 'Active Noise-Cancelling Wireless Soundbar',
    description: 'Cinematic 2.1 channel soundbar with built-in subwoofers, Dolby Audio, Bluetooth 5.3, and HDMI ARC optical connections.',
    price: 179.00,
    category: 'Electronics',
    stock: 18,
    imageUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ratings: 4.7,
    numReviews: 1,
    reviews: [
      {
        _id: '650000000000000000000538',
        user: '650000000000000000000098',
        name: 'Demo Customer',
        rating: 5,
        comment: 'Dialogue clarity in movies is dramatically improved over standard TV speakers.',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '650000000000000000000038',
    name: 'Waterproof Hiking Trail Windbreaker Jacket',
    description: 'Lightweight ripstop nylon windbreaker with sealed taped seams, adjustable storm hood, underarm venting, and packable pocket.',
    price: 110.00,
    category: 'Clothing',
    stock: 24,
    imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ratings: 4.9,
    numReviews: 1,
    reviews: [
      {
        _id: '650000000000000000000539',
        user: '650000000000000000000098',
        name: 'Demo Customer',
        rating: 5,
        comment: 'Stayed 100% dry during a 4-hour mountain downpour. Packs into its own chest pouch.',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '650000000000000000000039',
    name: 'Classic 100% Cashmere Scarf',
    description: 'Woven from pure Mongolian cashmere with delicate eyelash fringe trim. Unmatched softness and thermal comfort.',
    price: 75.00,
    category: 'Clothing',
    stock: 30,
    imageUrl: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ratings: 4.8,
    numReviews: 1,
    reviews: [
      {
        _id: '650000000000000000000540',
        user: '650000000000000000000099',
        name: 'Devika Nambiar',
        rating: 5,
        comment: 'Featherlight yet wonderfully cozy. Elegant neutral tone that pairs with every coat.',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 86400000 * 6).toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '650000000000000000000040',
    name: 'Everyday Stretch Slim Chino Pants',
    description: 'Crisp twill cotton engineered with 3% elastane flex for full mobility, reinforced belt loops, and hidden anti-theft zip pocket.',
    price: 58.00,
    category: 'Clothing',
    stock: 45,
    imageUrl: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ratings: 4.7,
    numReviews: 1,
    reviews: [
      {
        _id: '650000000000000000000541',
        user: '650000000000000000000098',
        name: 'Demo Customer',
        rating: 5,
        comment: 'The stretch waistband makes long travel flights so comfortable while looking tailored.',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '650000000000000000000041',
    name: 'Handmade Italian Leather Dress Belt',
    description: 'Vegetable-tanned full-grain bridle leather with brushed nickel solid brass buckle and hand-burnished edges.',
    price: 49.00,
    category: 'Clothing',
    stock: 38,
    imageUrl: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ratings: 4.9,
    numReviews: 1,
    reviews: [
      {
        _id: '650000000000000000000542',
        user: '650000000000000000000099',
        name: 'Sameer Joshi',
        rating: 5,
        comment: 'Substantial leather thickness that develops a magnificent patina over time.',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '650000000000000000000042',
    name: 'Polarized Aviator Sunglasses in 24k Gold',
    description: 'Ultralight titanium alloy frames plated in 24k gold with anti-glare polarized scratch-resistant UV400 glass lenses.',
    price: 135.00,
    category: 'Clothing',
    stock: 22,
    imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ratings: 4.8,
    numReviews: 1,
    reviews: [
      {
        _id: '650000000000000000000543',
        user: '650000000000000000000098',
        name: 'Demo Customer',
        rating: 5,
        comment: 'Crystal clarity under direct sun, zero glare off wet roads, and zero nose bridge pinching.',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '650000000000000000000043',
    name: 'Modern Minimalist Standing Bookshelf',
    description: '5-tier open architecture shelving unit constructed from durable black powder-coated steel and natural engineered walnut wood.',
    price: 210.00,
    category: 'Furniture',
    stock: 14,
    imageUrl: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ratings: 4.7,
    numReviews: 1,
    reviews: [
      {
        _id: '650000000000000000000544',
        user: '650000000000000000000099',
        name: 'Priya Sundaram',
        rating: 5,
        comment: 'Extremely sturdy, easy 20-minute assembly, and holds dozens of heavy art monographs.',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '650000000000000000000044',
    name: 'Architectural Matte Black Floor Lamp',
    description: 'Cantilevered arced floor lamp with heavy terrazzo marble anchor base, rotatable spun metal dome shade, and brass step dimmer.',
    price: 125.00,
    category: 'Furniture',
    stock: 20,
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ratings: 4.8,
    numReviews: 1,
    reviews: [
      {
        _id: '650000000000000000000545',
        user: '650000000000000000000098',
        name: 'Demo Customer',
        rating: 5,
        comment: 'Casts a warm gentle pool of light right over our sectional sofa without harsh glare.',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '650000000000000000000045',
    name: 'Ergonomic High-Back Mesh Desk Chair',
    description: 'Breathable 3D honeycomb mesh, dynamic lumbar tracking, 4D adjustable armrests, and 135-degree synchro-tilt mechanism.',
    price: 310.00,
    category: 'Furniture',
    stock: 17,
    imageUrl: 'https://images.unsplash.com/photo-1580481077195-c23199d78bc4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ratings: 4.9,
    numReviews: 1,
    reviews: [
      {
        _id: '650000000000000000000546',
        user: '650000000000000000000099',
        name: 'Tanya Bose',
        rating: 5,
        comment: 'Working 10-hour desk shifts is now completely painless. Lumbar support adjusts precisely.',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '650000000000000000000046',
    name: 'Round Marble Top Dining Table',
    description: 'Genuine white Carrara marble slab top with sealed satin finish and pedestal cast-iron fluted trumpet base.',
    price: 590.00,
    category: 'Furniture',
    stock: 8,
    imageUrl: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ratings: 5.0,
    numReviews: 1,
    reviews: [
      {
        _id: '650000000000000000000547',
        user: '650000000000000000000098',
        name: 'Demo Customer',
        rating: 5,
        comment: 'Absolute showstopper centerpiece for our dining alcove. Heavy, smooth, and stain-sealed.',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 86400000 * 6).toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '650000000000000000000047',
    name: 'Tufted Ottoman Pouf with Hidden Storage',
    description: 'High-density foam cushioned seat lid that lifts to reveal 40L of concealed blanket storage, wrapped in durable woven boucle fabric.',
    price: 89.00,
    category: 'Furniture',
    stock: 27,
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ratings: 4.6,
    numReviews: 1,
    reviews: [
      {
        _id: '650000000000000000000548',
        user: '650000000000000000000099',
        name: 'Rohit Bansal',
        rating: 5,
        comment: 'Doubles as an extra guest seat and footrest while storing winter throws neatly.',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '650000000000000000000048',
    name: '7-in-1 Digital Multi-Cooker & Air Fryer',
    description: 'Combines pressure cooking, crisp air frying, slow cooking, sous vide, and baking with 15 one-touch presets and dishwasher-safe pot.',
    price: 159.00,
    category: 'Kitchen',
    stock: 21,
    imageUrl: 'https://images.unsplash.com/photo-1585515320310-259814833e62?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ratings: 4.8,
    numReviews: 1,
    reviews: [
      {
        _id: '650000000000000000000549',
        user: '650000000000000000000098',
        name: 'Demo Customer',
        rating: 5,
        comment: 'Replaced three kitchen appliances in one go. Crisp french fries in 12 minutes without oil.',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '650000000000000000000049',
    name: 'Cold Brew Iced Coffee Maker Pitcher',
    description: '1.5L shatterproof borosilicate glass pitcher with ultra-fine stainless steel mesh filter core and airtight silicone seal lid.',
    price: 34.99,
    category: 'Kitchen',
    stock: 50,
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ratings: 4.9,
    numReviews: 1,
    reviews: [
      {
        _id: '650000000000000000000550',
        user: '650000000000000000000099',
        name: 'Kavita Pillai',
        rating: 5,
        comment: 'Yields super smooth, low-acidity cold brew that keeps fresh in the fridge door for two weeks.',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '650000000000000000000050',
    name: 'Artisanal Acacia Wood Cutting Board',
    description: 'End-grain natural acacia hardwood cutting board with deep perimeter juice groove and side inset handles for carving and charcuterie.',
    price: 42.00,
    category: 'Kitchen',
    stock: 35,
    imageUrl: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ratings: 4.8,
    numReviews: 1,
    reviews: [
      {
        _id: '650000000000000000000551',
        user: '650000000000000000000098',
        name: 'Demo Customer',
        rating: 5,
        comment: 'Does not dull knife edges, cleans up easily, and looks like a piece of art on the countertop.',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '650000000000000000000051',
    name: 'Electric Wine Opener with Foil Cutter & Aerator',
    description: 'Uncorks up to 80 bottles on a single charge with illuminated blue LED, precision foil blade, drip-free aerator, and vacuum stopper.',
    price: 38.00,
    category: 'Kitchen',
    stock: 42,
    imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ratings: 4.7,
    numReviews: 1,
    reviews: [
      {
        _id: '650000000000000000000552',
        user: '650000000000000000000099',
        name: 'Sunil Rao',
        rating: 5,
        comment: 'Effortless cork removal in 6 seconds without crumbling old corks. Fantastic gift item.',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '650000000000000000000052',
    name: 'Stainless Steel Spice Rack Carousel (16 Jars)',
    description: '360-degree rotating stainless steel tower loaded with 16 pre-labeled glass spice canisters with dual sprinkle-and-pour shaker tops.',
    price: 48.00,
    category: 'Kitchen',
    stock: 29,
    imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ratings: 4.8,
    numReviews: 1,
    reviews: [
      {
        _id: '650000000000000000000553',
        user: '650000000000000000000098',
        name: 'Demo Customer',
        rating: 5,
        comment: 'Spins smoothly and keeps all daily cooking seasonings organized in a compact footprint.',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '650000000000000000000053',
    name: 'Hydrating Hyaluronic Acid & Ceramide Moisturizer',
    description: 'Deeply replenishing barrier-repair cream packed with 5 molecular weights of hyaluronic acid, vegan ceramides, and centella asiatica.',
    price: 36.00,
    category: 'Beauty',
    stock: 65,
    imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ratings: 4.9,
    numReviews: 1,
    reviews: [
      {
        _id: '650000000000000000000554',
        user: '650000000000000000000098',
        name: 'Demo Customer',
        rating: 5,
        comment: 'Sinks in like silk without being greasy. Heals dry winter flakiness immediately.',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '650000000000000000000054',
    name: 'Organic Cold-Pressed Moroccan Argan Hair Oil',
    description: '100% pure USDA certified organic cold-pressed Moroccan argan oil for silky smooth frizz control, heat defense, and split end repair.',
    price: 29.50,
    category: 'Beauty',
    stock: 58,
    imageUrl: 'https://images.unsplash.com/photo-1608248597359-3221b6678b87?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ratings: 4.8,
    numReviews: 1,
    reviews: [
      {
        _id: '650000000000000000000555',
        user: '650000000000000000000099',
        name: 'Zoya Khan',
        rating: 5,
        comment: 'Tames frizz without weighing down fine hair. Subtle natural nutty scent.',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '650000000000000000000055',
    name: 'Professional Negative Ionic Hair Dryer',
    description: '110,000 RPM brushless motor delivering fast salon drying with intelligent thermal sensor preventing heat damage, plus diffuser nozzle.',
    price: 119.00,
    category: 'Beauty',
    stock: 23,
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ratings: 4.8,
    numReviews: 1,
    reviews: [
      {
        _id: '650000000000000000000556',
        user: '650000000000000000000098',
        name: 'Demo Customer',
        rating: 5,
        comment: 'Dries thick wavy hair in under 5 minutes while leaving it remarkably shiny and bouncy.',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '650000000000000000000056',
    name: 'Soothing Lavender & Dead Sea Bath Salts (32 oz)',
    description: 'Mineral-dense authentic Dead Sea salt crystals infused with French lavender essential oil and eucalyptus for sore muscle tension relief.',
    price: 26.00,
    category: 'Beauty',
    stock: 70,
    imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ratings: 4.9,
    numReviews: 1,
    reviews: [
      {
        _id: '650000000000000000000557',
        user: '650000000000000000000099',
        name: 'Neha Roy',
        rating: 5,
        comment: 'Dissolves cleanly without residue. The lavender fragrance turns a hot bath into a spa.',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '650000000000000000000057',
    name: 'Collagen Peptides Anti-Aging Eye Cream',
    description: 'Firming eye treatment infused with bioactive copper peptides, caffeine, and niacinamide to visibly reduce dark circles and puffiness.',
    price: 44.00,
    category: 'Beauty',
    stock: 52,
    imageUrl: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ratings: 4.8,
    numReviews: 1,
    reviews: [
      {
        _id: '650000000000000000000558',
        user: '650000000000000000000098',
        name: 'Demo Customer',
        rating: 5,
        comment: 'Visibly softened expression lines and lightened stubborn dark circles in two weeks.',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const orders = [
  {
    _id: '650000000000000000000101',
    userId: { _id: '650000000000000000000098', id: '650000000000000000000098', name: 'Demo Customer' },
    items: [
      {
        productId: '650000000000000000000001',
        name: 'Wireless Noise-Cancelling Headphones',
        qty: 1,
        price: 299.99
      }
    ],
    totalAmount: 299.99,
    address: {
      fullName: 'Demo Customer',
      street: '123 Market Street',
      city: 'San Francisco',
      postalCode: '94105',
      country: 'USA'
    },
    paymentId: 'pay_mock_12345',
    status: 'Delivered',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString()
  }
];

let nextId = 1000;
const generateId = () => {
  return '65000000000000000000' + String(nextId++).padStart(4, '0');
};

const mockStore = {
  // Products
  getProducts: () => [...products],
  getProductById: (id) => {
    const p = products.find(prod => String(prod._id) === String(id));
    if (!p) return null;
    return { ...p, reviews: p.reviews || [] };
  },
  createProduct: (data) => {
    const newProduct = {
      _id: generateId(),
      ratings: 0,
      numReviews: 0,
      reviews: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data
    };
    products.unshift(newProduct);
    return newProduct;
  },
  updateProduct: (id, data) => {
    const idx = products.findIndex(p => String(p._id) === String(id));
    if (idx === -1) return null;
    products[idx] = {
      ...products[idx],
      ...data,
      updatedAt: new Date().toISOString()
    };
    return products[idx];
  },
  deleteProduct: (id) => {
    const idx = products.findIndex(p => String(p._id) === String(id));
    if (idx === -1) return false;
    products.splice(idx, 1);
    return true;
  },

  // Reviews
  addProductReview: (productId, reviewData) => {
    const p = products.find(prod => String(prod._id) === String(productId));
    if (!p) return null;
    if (!p.reviews) p.reviews = [];

    const existingIndex = p.reviews.findIndex(r => String(r.user) === String(reviewData.user));
    const newReview = {
      _id: generateId(),
      createdAt: new Date().toISOString(),
      ...reviewData
    };

    if (existingIndex >= 0) {
      p.reviews[existingIndex] = newReview;
    } else {
      p.reviews.unshift(newReview);
    }

    p.numReviews = p.reviews.length;
    const sumRatings = p.reviews.reduce((acc, r) => acc + Number(r.rating || 0), 0);
    p.ratings = Number((sumRatings / p.reviews.length).toFixed(1));
    p.updatedAt = new Date().toISOString();

    return { product: p, review: newReview };
  },

  // Check if user has purchased this product
  hasUserPurchasedProduct: (userId, productId) => {
    return orders.some(o => {
      const uid = typeof o.userId === 'object' ? o.userId._id || o.userId.id : o.userId;
      if (String(uid) !== String(userId)) return false;
      return (o.items || []).some(item => {
        const itemPid = typeof item.productId === 'object' ? item.productId._id : item.productId;
        return String(itemPid) === String(productId);
      });
    });
  },

  // Users
  getUserByEmail: (email) => users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null,
  getUserById: (id) => {
    const user = users.find(u => String(u._id) === String(id));
    if (!user) return null;
    const { password, ...safeUser } = user;
    return safeUser;
  },
  createUser: (data) => {
    const newUser = {
      _id: generateId(),
      role: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data
    };
    users.push(newUser);
    return newUser;
  },
  getUsers: () => users.map(({ password, ...u }) => u),

  // Orders
  getOrders: () => [...orders],
  getOrderById: (id) => orders.find(o => String(o._id) === String(id)) || null,
  getUserOrders: (userId) => orders.filter(o => {
    const uid = typeof o.userId === 'object' ? o.userId._id || o.userId.id : o.userId;
    return String(uid) === String(userId);
  }),
  createOrder: (orderData) => {
    const newOrder = {
      _id: generateId(),
      status: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...orderData
    };
    orders.unshift(newOrder);
    return newOrder;
  },
  updateOrderStatus: (id, status) => {
    const order = orders.find(o => String(o._id) === String(id));
    if (!order) return null;
    order.status = status;
    order.updatedAt = new Date().toISOString();
    return order;
  },
  requestOrderReturn: (id, userId, returnData) => {
    const order = orders.find(o => String(o._id) === String(id));
    if (!order) return null;
    const uid = typeof order.userId === 'object' ? order.userId._id || order.userId.id : order.userId;
    if (String(uid) !== String(userId)) {
      return { error: 'Unauthorized' };
    }
    const rmaCode = 'RMA-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);
    order.returnStatus = 'Requested';
    order.returnReason = returnData.reason || 'General Return';
    order.returnComments = returnData.comments || '';
    order.refundMethod = returnData.refundMethod || 'Original Payment Method';
    order.rmaCode = rmaCode;
    order.returnItems = returnData.items || order.items || [];
    order.returnRequestedAt = new Date().toISOString();
    order.updatedAt = new Date().toISOString();
    return order;
  },
  cancelOrderReturn: (id, userId) => {
    const order = orders.find(o => String(o._id) === String(id));
    if (!order) return null;
    const uid = typeof order.userId === 'object' ? order.userId._id || order.userId.id : order.userId;
    if (String(uid) !== String(userId)) {
      return { error: 'Unauthorized' };
    }
    order.returnStatus = 'Cancelled';
    order.updatedAt = new Date().toISOString();
    return order;
  },
  updateOrderReturnStatus: (id, returnStatus) => {
    const order = orders.find(o => String(o._id) === String(id));
    if (!order) return null;
    order.returnStatus = returnStatus;
    if (returnStatus === 'Refunded') {
      order.returnResolvedAt = new Date().toISOString();
    }
    order.updatedAt = new Date().toISOString();
    return order;
  },
  getUserReturns: (userId) => {
    return orders.filter(o => {
      const uid = typeof o.userId === 'object' ? o.userId._id || o.userId.id : o.userId;
      return String(uid) === String(userId) && o.returnStatus && o.returnStatus !== 'None';
    });
  },

  // Wishlists
  getWishlist: (userId) => {
    const pIds = wishlists[String(userId)] || [];
    return pIds
      .map(id => products.find(p => String(p._id) === String(id)))
      .filter(Boolean);
  },
  addToWishlist: (userId, productId) => {
    const key = String(userId);
    if (!wishlists[key]) wishlists[key] = [];
    if (!wishlists[key].includes(String(productId))) {
      wishlists[key].push(String(productId));
    }
    return mockStore.getWishlist(userId);
  },
  removeFromWishlist: (userId, productId) => {
    const key = String(userId);
    if (wishlists[key]) {
      wishlists[key] = wishlists[key].filter(id => id !== String(productId));
    }
    return mockStore.getWishlist(userId);
  },
  isInWishlist: (userId, productId) => {
    const key = String(userId);
    return Boolean(wishlists[key] && wishlists[key].includes(String(productId)));
  },

  // Analytics
  getStats: () => {
    const totalOrders = orders.length;
    const totalProducts = products.length;
    const totalUsers = users.filter(u => u.role === 'user').length;
    const totalRevenue = orders.reduce((acc, curr) => acc + (Number(curr.totalAmount) || 0), 0);
    return { totalOrders, totalProducts, totalUsers, totalRevenue };
  }
};

module.exports = mockStore;
