const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const importData = async () => {
  try {
    await User.deleteMany();
    await Product.deleteMany();

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@shopnest.com',
      password: hashedPassword,
      role: 'admin'
    });

    const demoUser = await User.create({
      name: 'Demo Customer',
      email: 'user@shopnest.com',
      password: hashedPassword,
      role: 'user'
    });

    const products = [
      {
        name: 'Wireless Noise-Cancelling Headphones',
        description: 'Immersive sound experience with advanced active noise cancellation and 30-hour battery life.',
        price: 299.99,
        category: 'Electronics',
        stock: 15,
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.8,
        numReviews: 24
      },
      {
        name: 'Minimalist Modern Chair',
        description: 'A stylish and comfortable addition to any contemporary living room or reading nook.',
        price: 150.00,
        category: 'Furniture',
        stock: 30,
        imageUrl: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.5,
        numReviews: 12
      },
      {
        name: 'Professional DSLR Camera',
        description: 'Capture stunning moments with 45MP high-resolution sensor clarity and ultra-fast autofocus.',
        price: 1199.99,
        category: 'Electronics',
        stock: 8,
        imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 5.0,
        numReviews: 50
      },
      {
        name: 'Classic White Sneakers',
        description: 'Versatile and comfortable, crafted from supple grain leather for any casual or smart-casual outfit.',
        price: 85.00,
        category: 'Clothing',
        stock: 50,
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.5,
        numReviews: 89
      },
      {
        name: 'Ultra-Slim 4K OLED Smart TV (65")',
        description: 'Immerse yourself in infinite contrast with Dolby Vision IQ, 120Hz gaming mode, and cinematic Dolby Atmos.',
        price: 1499.00,
        category: 'Electronics',
        stock: 12,
        imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.9,
        numReviews: 32
      },
      {
        name: 'Mechanical RGB Gaming Keyboard',
        description: 'Tactile hot-swappable mechanical switches, per-key RGB illumination, aircraft-grade aluminum top plate.',
        price: 129.50,
        category: 'Electronics',
        stock: 35,
        imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.7,
        numReviews: 41
      },
      {
        name: 'Waterproof Bluetooth Speaker',
        description: 'Rugged 360-degree acoustic performance with punchy bass, IPX7 waterproof housing, and 24-hour battery.',
        price: 89.99,
        category: 'Electronics',
        stock: 40,
        imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.6,
        numReviews: 67
      },
      {
        name: 'Smart Fitness Watch Series 9',
        description: 'AMOLED edge-to-edge display with continuous heart health monitoring, SpO2 sensor, and onboard GPS.',
        price: 249.00,
        category: 'Electronics',
        stock: 25,
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.8,
        numReviews: 58
      },
      {
        name: 'Premium Merino Wool Knit Sweater',
        description: 'Spun from pure Australian Merino wool, providing ultra-lightweight warmth, natural breathability, and softness.',
        price: 115.00,
        category: 'Clothing',
        stock: 28,
        imageUrl: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.7,
        numReviews: 34
      },
      {
        name: 'Handcrafted Leather Messenger Bag',
        description: 'Full-grain vegetable-tanned leather briefcase with dedicated 15-inch laptop compartment and brass hardware.',
        price: 185.00,
        category: 'Clothing',
        stock: 18,
        imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.9,
        numReviews: 29
      },
      {
        name: 'Polarized Titanium Aviator Sunglasses',
        description: 'Featherweight titanium frames with scratch-resistant polarized TAC lenses providing 100% UV400 protection.',
        price: 135.00,
        category: 'Clothing',
        stock: 45,
        imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.6,
        numReviews: 52
      },
      {
        name: 'Tailored Slim-Fit Cotton Chinos',
        description: 'Premium stretch-cotton chinos crafted for breathable all-day comfort, versatile styling, and wrinkle resistance.',
        price: 68.00,
        category: 'Clothing',
        stock: 60,
        imageUrl: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.5,
        numReviews: 44
      },
      {
        name: 'Ergonomic Mesh Office Chair',
        description: 'Designed for optimal spinal health with dynamic lumbar support, breathable matrix mesh, and 3D adjustable armrests.',
        price: 279.00,
        category: 'Furniture',
        stock: 20,
        imageUrl: 'https://images.unsplash.com/photo-1580481077195-c3a82105e3b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.8,
        numReviews: 73
      },
      {
        name: 'Mid-Century Solid Oak Coffee Table',
        description: 'Artisan-crafted American oak coffee table featuring beveled edges, solid tapered legs, and lower open shelf.',
        price: 320.00,
        category: 'Furniture',
        stock: 14,
        imageUrl: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.7,
        numReviews: 19
      },
      {
        name: 'Dimmable Ceramic Accent Desk Lamp',
        description: 'Handcrafted stoneware ceramic base with natural textured linen shade and warm dimmable LED ambiance.',
        price: 74.00,
        category: 'Furniture',
        stock: 38,
        imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.6,
        numReviews: 38
      },
      {
        name: 'Geometric Handwoven Wool Area Rug',
        description: 'Neutral minimalist palette 5x8 ft area rug handwoven with durable, plush New Zealand wool fibers.',
        price: 210.00,
        category: 'Furniture',
        stock: 16,
        imageUrl: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.7,
        numReviews: 22
      },
      {
        name: 'Precision Pour-Over Electric Gooseneck Kettle',
        description: 'Variable temperature dial to 1 degree precision with built-in stopwatch brew timer and counterbalanced handle.',
        price: 98.00,
        category: 'Kitchen',
        stock: 32,
        imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.9,
        numReviews: 61
      },
      {
        name: 'Italian 15-Bar Espresso Machine',
        description: 'Commercial 15-bar Italian pressure pump with microfoam steam wand for velvety cappuccinos and espresso shots.',
        price: 389.00,
        category: 'Kitchen',
        stock: 12,
        imageUrl: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.8,
        numReviews: 47
      },
      {
        name: 'Japanese Damascus Steel Chef Knife (8")',
        description: 'Forged from 67 micro-layers of Japanese Damascus steel with VG-10 core and ergonomic moisture-resistant pakkawood handle.',
        price: 145.00,
        category: 'Kitchen',
        stock: 22,
        imageUrl: 'https://images.unsplash.com/photo-1593618998160-e34014e67546?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 5.0,
        numReviews: 39
      },
      {
        name: 'Enameled Cast Iron Dutch Oven (5.5 Qt)',
        description: 'Heavy-duty enameled cast iron delivers superior heat retention and uniform distribution for braising, sourdough, and stews.',
        price: 119.00,
        category: 'Kitchen',
        stock: 26,
        imageUrl: 'https://images.unsplash.com/photo-1584990347449-3995f57353f8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.8,
        numReviews: 54
      },
      {
        name: 'Sonic Electric Toothbrush with UV Case',
        description: '40,000 sonic vibrations per minute with 5 custom modes, DuPont bristles, and UV travel sanitizer case.',
        price: 89.00,
        category: 'Beauty',
        stock: 42,
        imageUrl: 'https://images.unsplash.com/photo-1559591937-e1112b323677?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.7,
        numReviews: 33
      },
      {
        name: 'Ultrasonic Aromatherapy Essential Oil Diffuser',
        description: 'Handcrafted wood grain ultrasonic diffuser featuring whisper-quiet cool mist, ambient LED light cycles, and safety auto-off.',
        price: 45.00,
        category: 'Beauty',
        stock: 55,
        imageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.6,
        numReviews: 49
      },
      {
        name: 'True Wireless Noise-Cancelling Earbuds Pro',
        description: 'Spatial audio with dynamic head tracking, active noise cancellation, transparency mode, and wireless MagSafe charging case.',
        price: 199.99,
        category: 'Electronics',
        stock: 28,
        imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.8,
        numReviews: 36
      },
      {
        name: 'Portable High-Res Bluetooth Speaker',
        description: '360-degree immersive sound with dual passive radiators, IPX7 waterproof rating, and 24-hour non-stop battery playtime.',
        price: 129.99,
        category: 'Electronics',
        stock: 35,
        imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.7,
        numReviews: 42
      },
      {
        name: 'Tailored Slim-Fit Linen Blazer',
        description: 'Breathable 100% natural European linen tailored with soft unstructured shoulders, double rear vents, and horn buttons.',
        price: 165.00,
        category: 'Clothing',
        stock: 18,
        imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.8,
        numReviews: 28
      },
      {
        name: 'Water-Repellent Commuter Trench Coat',
        description: 'Modern technical cotton-blend trench with weatherproof DWR coating, storm flap, waist belt, and deep fleece-lined pockets.',
        price: 219.00,
        category: 'Clothing',
        stock: 14,
        imageUrl: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.9,
        numReviews: 19
      },
      {
        name: 'Solid American Walnut Coffee Table',
        description: 'Handcrafted solid walnut coffee table with organic curved beveled edges, slender tapered legs, and natural satin wax finish.',
        price: 340.00,
        category: 'Furniture',
        stock: 9,
        imageUrl: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.9,
        numReviews: 15
      },
      {
        name: 'Velvet Ergonomic Accent Lounge Armchair',
        description: 'Plush stain-resistant velvet upholstery over high-density resilient foam cushioning with matte black steel splayed legs.',
        price: 275.00,
        category: 'Furniture',
        stock: 11,
        imageUrl: 'https://images.unsplash.com/photo-1580481077195-c23199d78bc4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.7,
        numReviews: 22
      },
      {
        name: 'Professional High-Speed Countertop Blender',
        description: 'Commercial-grade 1400W motor with 6 aircraft-grade stainless steel blades, pulse dial, and 64-oz shatterproof BPA-free pitcher.',
        price: 189.00,
        category: 'Kitchen',
        stock: 20,
        imageUrl: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.8,
        numReviews: 38
      },
      {
        name: 'Non-Stick Ceramic Cookware 10-Piece Set',
        description: 'Toxin-free mineral ceramic non-stick coating with induction-ready heavy gauge aluminum core and cool-touch stainless steel handles.',
        price: 249.00,
        category: 'Kitchen',
        stock: 15,
        imageUrl: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.9,
        numReviews: 26
      },
      {
        name: 'Botanical Rosehip & Bakuchiol Facial Serum',
        description: 'Antioxidant-rich organic facial oil with plant-derived retinol alternative Bakuchiol, cold-pressed rosehip seed oil, and Vitamin E.',
        price: 52.00,
        category: 'Beauty',
        stock: 48,
        imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.9,
        numReviews: 45
      },
      {
        name: 'Natural Jade Facial Roller & Gua Sha Sculpting Set',
        description: 'Authentic 100% Brazilian Xiuyan jade roller with dual-ended smooth stone and ergonomic heart-shaped Gua Sha lymphatic drainage tool.',
        price: 32.00,
        category: 'Beauty',
        stock: 60,
        imageUrl: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.8,
        numReviews: 31
      },
      {
        name: '4K Ultra HD Drone with Gimbal Camera',
        description: '3-axis motorized gimbal with 4K HDR 60fps video, GPS auto-return, obstacle sensing, and 34-minute flight time per battery.',
        price: 499.00,
        category: 'Electronics',
        stock: 16,
        imageUrl: 'https://images.unsplash.com/photo-1507582020434-9e063efe2850?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.9,
        numReviews: 44
      },
      {
        name: 'Wireless Ergonomic Vertical Mouse',
        description: 'Natural handshake 57-degree ergonomic angle reduces muscle strain with whisper-quiet clicks, multi-device flow, and rechargeable USB-C.',
        price: 59.99,
        category: 'Electronics',
        stock: 40,
        imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.8,
        numReviews: 53
      },
      {
        name: 'Smart Home 1080p Security Camera (2-Pack)',
        description: 'Weatherproof HD outdoor and indoor security cams featuring color night vision, 2-way audio, AI person detection, and cloud backup.',
        price: 79.99,
        category: 'Electronics',
        stock: 25,
        imageUrl: 'https://images.unsplash.com/photo-1557324232-b891713e3dcd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.7,
        numReviews: 37
      },
      {
        name: 'Fast Magnetic Wireless Charging Stand 3-in-1',
        description: 'Simultaneously fast-charges smartphone, smartwatch, and wireless earbuds with anti-slip weighted aluminum base and LED indicator.',
        price: 69.50,
        category: 'Electronics',
        stock: 32,
        imageUrl: 'https://images.unsplash.com/photo-1586105251261-72a756497a11?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.8,
        numReviews: 29
      },
      {
        name: 'Active Noise-Cancelling Wireless Soundbar',
        description: 'Cinematic 2.1 channel soundbar with built-in subwoofers, Dolby Audio, Bluetooth 5.3, and HDMI ARC optical connections.',
        price: 179.00,
        category: 'Electronics',
        stock: 18,
        imageUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.7,
        numReviews: 61
      },
      {
        name: 'Waterproof Hiking Trail Windbreaker Jacket',
        description: 'Lightweight ripstop nylon windbreaker with sealed taped seams, adjustable storm hood, underarm venting, and packable pocket.',
        price: 110.00,
        category: 'Clothing',
        stock: 24,
        imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.9,
        numReviews: 25
      },
      {
        name: 'Classic 100% Cashmere Scarf',
        description: 'Woven from pure Mongolian cashmere with delicate eyelash fringe trim. Unmatched softness and thermal comfort.',
        price: 75.00,
        category: 'Clothing',
        stock: 30,
        imageUrl: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.8,
        numReviews: 48
      },
      {
        name: 'Everyday Stretch Slim Chino Pants',
        description: 'Crisp twill cotton engineered with 3% elastane flex for full mobility, reinforced belt loops, and hidden anti-theft zip pocket.',
        price: 58.00,
        category: 'Clothing',
        stock: 45,
        imageUrl: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.7,
        numReviews: 36
      },
      {
        name: 'Handmade Italian Leather Dress Belt',
        description: 'Vegetable-tanned full-grain bridle leather with brushed nickel solid brass buckle and hand-burnished edges.',
        price: 49.00,
        category: 'Clothing',
        stock: 38,
        imageUrl: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.9,
        numReviews: 52
      },
      {
        name: 'Polarized Aviator Sunglasses in 24k Gold',
        description: 'Ultralight titanium alloy frames plated in 24k gold with anti-glare polarized scratch-resistant UV400 glass lenses.',
        price: 135.00,
        category: 'Clothing',
        stock: 22,
        imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.8,
        numReviews: 41
      },
      {
        name: 'Modern Minimalist Standing Bookshelf',
        description: '5-tier open architecture shelving unit constructed from durable black powder-coated steel and natural engineered walnut wood.',
        price: 210.00,
        category: 'Furniture',
        stock: 14,
        imageUrl: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.7,
        numReviews: 18
      },
      {
        name: 'Architectural Matte Black Floor Lamp',
        description: 'Cantilevered arced floor lamp with heavy terrazzo marble anchor base, rotatable spun metal dome shade, and brass step dimmer.',
        price: 125.00,
        category: 'Furniture',
        stock: 20,
        imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.8,
        numReviews: 33
      },
      {
        name: 'Ergonomic High-Back Mesh Desk Chair',
        description: 'Breathable 3D honeycomb mesh, dynamic lumbar tracking, 4D adjustable armrests, and 135-degree synchro-tilt mechanism.',
        price: 310.00,
        category: 'Furniture',
        stock: 17,
        imageUrl: 'https://images.unsplash.com/photo-1580481077195-c23199d78bc4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.9,
        numReviews: 47
      },
      {
        name: 'Round Marble Top Dining Table',
        description: 'Genuine white Carrara marble slab top with sealed satin finish and pedestal cast-iron fluted trumpet base.',
        price: 590.00,
        category: 'Furniture',
        stock: 8,
        imageUrl: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 5.0,
        numReviews: 14
      },
      {
        name: 'Tufted Ottoman Pouf with Hidden Storage',
        description: 'High-density foam cushioned seat lid that lifts to reveal 40L of concealed blanket storage, wrapped in durable woven boucle fabric.',
        price: 89.00,
        category: 'Furniture',
        stock: 27,
        imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.6,
        numReviews: 29
      },
      {
        name: '7-in-1 Digital Multi-Cooker & Air Fryer',
        description: 'Combines pressure cooking, crisp air frying, slow cooking, sous vide, and baking with 15 one-touch presets and dishwasher-safe pot.',
        price: 159.00,
        category: 'Kitchen',
        stock: 21,
        imageUrl: 'https://images.unsplash.com/photo-1585515320310-259814833e62?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.8,
        numReviews: 56
      },
      {
        name: 'Cold Brew Iced Coffee Maker Pitcher',
        description: '1.5L shatterproof borosilicate glass pitcher with ultra-fine stainless steel mesh filter core and airtight silicone seal lid.',
        price: 34.99,
        category: 'Kitchen',
        stock: 50,
        imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.9,
        numReviews: 43
      },
      {
        name: 'Artisanal Acacia Wood Cutting Board',
        description: 'End-grain natural acacia hardwood cutting board with deep perimeter juice groove and side inset handles for carving and charcuterie.',
        price: 42.00,
        category: 'Kitchen',
        stock: 35,
        imageUrl: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.8,
        numReviews: 38
      },
      {
        name: 'Electric Wine Opener with Foil Cutter & Aerator',
        description: 'Uncorks up to 80 bottles on a single charge with illuminated blue LED, precision foil blade, drip-free aerator, and vacuum stopper.',
        price: 38.00,
        category: 'Kitchen',
        stock: 42,
        imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.7,
        numReviews: 22
      },
      {
        name: 'Stainless Steel Spice Rack Carousel (16 Jars)',
        description: '360-degree rotating stainless steel tower loaded with 16 pre-labeled glass spice canisters with dual sprinkle-and-pour shaker tops.',
        price: 48.00,
        category: 'Kitchen',
        stock: 29,
        imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.8,
        numReviews: 35
      },
      {
        name: 'Hydrating Hyaluronic Acid & Ceramide Moisturizer',
        description: 'Deeply replenishing barrier-repair cream packed with 5 molecular weights of hyaluronic acid, vegan ceramides, and centella asiatica.',
        price: 36.00,
        category: 'Beauty',
        stock: 65,
        imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.9,
        numReviews: 62
      },
      {
        name: 'Organic Cold-Pressed Moroccan Argan Hair Oil',
        description: '100% pure USDA certified organic cold-pressed Moroccan argan oil for silky smooth frizz control, heat defense, and split end repair.',
        price: 29.50,
        category: 'Beauty',
        stock: 58,
        imageUrl: 'https://images.unsplash.com/photo-1608248597359-3221b6678b87?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.8,
        numReviews: 44
      },
      {
        name: 'Professional Negative Ionic Hair Dryer',
        description: '110,000 RPM brushless motor delivering fast salon drying with intelligent thermal sensor preventing heat damage, plus diffuser nozzle.',
        price: 119.00,
        category: 'Beauty',
        stock: 23,
        imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.8,
        numReviews: 39
      },
      {
        name: 'Soothing Lavender & Dead Sea Bath Salts (32 oz)',
        description: 'Mineral-dense authentic Dead Sea salt crystals infused with French lavender essential oil and eucalyptus for sore muscle tension relief.',
        price: 26.00,
        category: 'Beauty',
        stock: 70,
        imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.9,
        numReviews: 50
      },
      {
        name: 'Collagen Peptides Anti-Aging Eye Cream',
        description: 'Firming eye treatment infused with bioactive copper peptides, caffeine, and niacinamide to visibly reduce dark circles and puffiness.',
        price: 44.00,
        category: 'Beauty',
        stock: 52,
        imageUrl: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.8,
        numReviews: 47
      }
    ];

    await Product.insertMany(products);
    
    console.log('✅ Data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error(`❌ Error with data import: ${error.message}`);
    process.exit(1);
  }
};

importData();
