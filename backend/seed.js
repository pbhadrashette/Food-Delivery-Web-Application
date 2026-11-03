require('dotenv').config();
const mongoose = require('mongoose');

const User = require('./models/User');
const Restaurant = require('./models/Restaurant');
const Category = require('./models/Category');
const Food = require('./models/Food');
const Coupon = require('./models/Coupon');
const Review = require('./models/Review');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB connected for seeding');
};

const seedDatabase = async () => {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;
  const userExists = await User.exists({ email: 'user@foodie.com' });

  const adminConfigured = Boolean(adminEmail && adminPassword);
  if (adminConfigured) {
    const configuredAdmin = await User.findOne({ email: adminEmail }).select('+password');
    if (configuredAdmin && configuredAdmin.role !== 'admin') {
      throw new Error('ADMIN_EMAIL matches a non-admin account. Refusing to grant administrator access.');
    }

    if (configuredAdmin) {
      configuredAdmin.password = adminPassword;
      configuredAdmin.isActive = true;
      await configuredAdmin.save();
      console.log('🔐 Configured administrator credentials applied.');
    } else {
      await User.create({
        name: 'Admin User',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
      });
      console.log('👤 Configured administrator account created.');
    }
  } else {
    console.warn('⚠️ Set both ADMIN_EMAIL and ADMIN_PASSWORD to create or reset an admin account.');
  }

  const legacyAdmin = await User.findOne({ email: 'admin@foodie.com', role: 'admin' }).select('+password');
  if (legacyAdmin && await legacyAdmin.comparePassword('admin123') && (!adminConfigured || adminEmail !== legacyAdmin.email)) {
    legacyAdmin.isActive = false;
    await legacyAdmin.save();
    console.warn('⚠️ Disabled the legacy demo admin account.');
  }

  if (!userExists) {
    await User.create({
      name: 'John Doe',
      email: 'user@foodie.com',
      password: 'user1234',
      phone: '8888888888',
      role: 'user',
    });
    console.log('👤 Sample user created: user@foodie.com');
  }

  const existingCategories = await Category.find();
  if (existingCategories.length === 0) {
    const categories = await Category.insertMany([
      { name: 'Pizza', icon: '🍕', sortOrder: 1 },
      { name: 'Burger', icon: '🍔', sortOrder: 2 },
      { name: 'Biryani', icon: '🍛', sortOrder: 3 },
      { name: 'Chinese', icon: '🍜', sortOrder: 4 },
      { name: 'South Indian', icon: '🥘', sortOrder: 5 },
      { name: 'North Indian', icon: '🍲', sortOrder: 6 },
      { name: 'Desserts', icon: '🍰', sortOrder: 7 },
      { name: 'Beverages', icon: '🥤', sortOrder: 8 },
      { name: 'Fast Food', icon: '🌮', sortOrder: 9 },
      { name: 'Starters', icon: '🥗', sortOrder: 10 },
    ]);
    console.log('📁 Categories created:', categories.length);
  }

  const CATEGORY_IMAGE_BY_NAME = {
    Pizza: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80&fit=crop',
    Burger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80&fit=crop',
    Biryani: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=800&q=80&fit=crop',
    Chinese: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&q=80&fit=crop',
    'South Indian': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&q=80&fit=crop',
    'North Indian': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80&fit=crop',
    Desserts: 'https://images.unsplash.com/photo-1551024503-8b3832142a27?w=800&q=80&fit=crop',
    Beverages: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&q=80&fit=crop',
    'Fast Food': 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=800&q=80&fit=crop',
    Starters: 'https://images.unsplash.com/photo-1606491956689-2ea866858177?w=800&q=80&fit=crop',
  };

  for (const [name, imageUrl] of Object.entries(CATEGORY_IMAGE_BY_NAME)) {
    await Category.updateOne({ name }, { $set: { image: imageUrl, isActive: true } });
  }

  const RESTAURANT_SEED_DATA = [
    { name: 'Spice House', description: 'Authentic North Indian cuisine with rich gravies, aromatic biryanis and tandoor delights. A foodie paradise!', phone: '9876543210', email: 'contact@spicehouse.com', address: '12, MG Road, Koramangala', city: 'Bangalore', cuisine: ['North Indian', 'Mughlai', 'Biryani'], coverImage: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=900&q=85&fit=crop', logo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&q=80&fit=crop', deliveryFee: 30, minimumOrder: 200, deliveryTime: '30-45', priceForTwo: 600, rating: 4.5, totalRatings: 1200, openingTime: '10:00', closingTime: '23:00', status: 'active', featured: true, discount: '20% OFF up to ₹100', isVeg: false, tags: ['trending', 'popular'] },
    { name: 'Urban Biryani', description: 'Award-winning biryani made with the finest basmati rice and secret spice blends. Try our signature dum biryani!', phone: '9876543211', email: 'info@urbanbiryani.com', address: '45, Indiranagar, 100ft Road', city: 'Bangalore', cuisine: ['Biryani', 'North Indian', 'Mughlai'], coverImage: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=900&q=85&fit=crop', logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&q=80&fit=crop', deliveryFee: 25, minimumOrder: 150, deliveryTime: '35-50', priceForTwo: 500, rating: 4.7, totalRatings: 2500, openingTime: '11:00', closingTime: '23:30', status: 'active', featured: true, discount: '₹50 OFF on orders above ₹300', isVeg: false, tags: ['top-rated', 'biryani-specialist'] },
    { name: 'Pizza Point', description: 'Wood-fired pizzas with fresh ingredients, crispy bases and generous toppings. Delivering happiness slice by slice!', phone: '9876543212', email: 'orders@pizzapoint.com', address: '78, Whitefield Main Road', city: 'Bangalore', cuisine: ['Pizza', 'Italian', 'Fast Food'], coverImage: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=900&q=85&fit=crop', logo: 'https://images.unsplash.com/photo-1579758630668-18800007577f?w=200&q=80&fit=crop', deliveryFee: 35, minimumOrder: 250, deliveryTime: '25-40', priceForTwo: 700, rating: 4.3, totalRatings: 980, openingTime: '11:00', closingTime: '00:00', status: 'active', featured: false, discount: 'Buy 1 Get 1 Free on Medium Pizzas', isVeg: false, tags: ['pizza-lovers'] },
    { name: 'Burger Hub', description: 'Gourmet burgers with premium patties, fresh veggies and house-made sauces. The best burgers in town!', phone: '9876543213', email: 'hello@burgerhub.com', address: '23, HSR Layout, Sector 4', city: 'Bangalore', cuisine: ['Burger', 'Fast Food', 'American'], coverImage: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=900&q=85&fit=crop', logo: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=200&q=80&fit=crop', deliveryFee: 20, minimumOrder: 150, deliveryTime: '20-35', priceForTwo: 450, rating: 4.2, totalRatings: 750, openingTime: '10:00', closingTime: '23:00', status: 'active', featured: false, discount: '15% OFF on your first order', isVeg: false, tags: ['fast-delivery'] },
    { name: 'South Indian Kitchen', description: 'Authentic South Indian breakfast and meals — crispy dosas, fluffy idlis, and traditional curries from Tamil Nadu and Kerala.', phone: '9876543214', email: 'hello@southindiankitchen.com', address: '56, JP Nagar, 7th Phase', city: 'Bangalore', cuisine: ['South Indian', 'Kerala', 'Tamil'], coverImage: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=900&q=85&fit=crop', logo: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=200&q=80&fit=crop', deliveryFee: 20, minimumOrder: 100, deliveryTime: '20-35', priceForTwo: 300, rating: 4.6, totalRatings: 1800, openingTime: '06:00', closingTime: '22:00', status: 'active', featured: true, discount: 'Free filter coffee with every meal', isVeg: true, tags: ['breakfast', 'vegetarian-friendly'] },
  ];

  for (const entry of RESTAURANT_SEED_DATA) {
    const updated = await Restaurant.updateOne(
      { name: entry.name },
      { $set: { coverImage: entry.coverImage, logo: entry.logo } }
    );
    if (updated.matchedCount > 0) {
      console.log(`🖼️  Cover image & logo synced: ${entry.name}`);
    }
  }

  const FOOD_IMAGE_BY_NAME = {
    'Butter Chicken': 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&q=80&fit=crop',
    'Paneer Tikka Masala': 'https://images.unsplash.com/photo-1567184109411-b28f5e069e85?w=800&q=80&fit=crop',
    'Mutton Rogan Josh': 'https://images.unsplash.com/photo-1545247181-516773cae7be?w=800&q=80&fit=crop',
    'Dal Makhani': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80&fit=crop',
    'Chicken Seekh Kebab': 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=800&q=80&fit=crop',
    'Gulab Jamun': 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800&q=80&fit=crop',
    'Chicken Dum Biryani': 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=800&q=80&fit=crop',
    'Mutton Biryani': 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=800&q=80&fit=crop',
    'Veg Biryani': 'https://images.unsplash.com/photo-1642821373181-696a54913e93?w=800&q=80&fit=crop',
    'Prawn Biryani': 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&q=80&fit=crop',
    'Raita': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80&fit=crop',
    'Margherita Pizza': 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=800&q=80&fit=crop',
    'Chicken BBQ Pizza': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80&fit=crop',
    'Farmhouse Pizza': 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80&fit=crop',
    'Garlic Bread': 'https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?w=800&q=80&fit=crop',
    'Chocolate Lava Cake': 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&q=80&fit=crop',
    'Classic Beef Burger': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80&fit=crop',
    'Crispy Chicken Burger': 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=800&q=80&fit=crop',
    'Veggie Delight Burger': 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80&fit=crop',
    'Loaded Fries': 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=800&q=80&fit=crop',
    'Milkshake': 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&q=80&fit=crop',
    'Masala Dosa': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&q=80&fit=crop',
    'Idli Sambar (3 pcs)': 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&q=80&fit=crop',
    'Rava Dosa': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80&fit=crop',
    'Curd Rice': 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&q=80&fit=crop',
    'Filter Coffee': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80&fit=crop',
  };

  for (const [name, imageUrl] of Object.entries(FOOD_IMAGE_BY_NAME)) {
    await Food.updateOne({ name }, { $set: { image: imageUrl } });
  }

  const reviewCount = await Review.countDocuments();
  if (reviewCount === 0) {
    const sampleUser = await User.findOne({ email: 'user@foodie.com' });
    const spiceHouse = await Restaurant.findOne({ name: 'Spice House' });
    const urbanBiryani = await Restaurant.findOne({ name: 'Urban Biryani' });
    const pizzaPoint = await Restaurant.findOne({ name: 'Pizza Point' });
    const southKitchen = await Restaurant.findOne({ name: 'South Indian Kitchen' });

    if (sampleUser) {
      const sampleReviews = [];
      if (urbanBiryani) {
        sampleReviews.push({
          user: sampleUser._id,
          restaurant: urbanBiryani._id,
          foodRating: 5,
          deliveryRating: 5,
          restaurantRating: 5,
          comment: 'The Dum Biryani was piping hot, fragrant and loaded with tender meat! Delivery took only 28 minutes. Best biryani in town!',
          isApproved: true,
        });
      }
      if (spiceHouse) {
        sampleReviews.push({
          user: sampleUser._id,
          restaurant: spiceHouse._id,
          foodRating: 5,
          deliveryRating: 4,
          restaurantRating: 5,
          comment: 'Incredible Butter Chicken and crispy garlic naan. Packed safely with zero spill. Highly recommend for family dinners!',
          isApproved: true,
        });
      }
      if (pizzaPoint) {
        sampleReviews.push({
          user: sampleUser._id,
          restaurant: pizzaPoint._id,
          foodRating: 5,
          deliveryRating: 5,
          restaurantRating: 5,
          comment: 'Crust was perfectly wood-fired, cheese was gooey and toppings were very fresh. Arrived super fast and hot!',
          isApproved: true,
        });
      }
      if (southKitchen) {
        sampleReviews.push({
          user: sampleUser._id,
          restaurant: southKitchen._id,
          foodRating: 5,
          deliveryRating: 5,
          restaurantRating: 5,
          comment: 'Authentic crispy ghee roast Masala Dosa and filter coffee. Tasted just like traditional South Indian breakfast!',
          isApproved: true,
        });
      }
      if (sampleReviews.length > 0) {
        await Review.insertMany(sampleReviews);
        console.log(`⭐ Customer reviews seeded: ${sampleReviews.length}`);
      }
    }
  }

  const restaurantCount = await Restaurant.countDocuments();
  if (restaurantCount === 0) {
    const categories = await Category.find();
    const catMap = {};
    categories.forEach((c) => (catMap[c.name] = c._id));

    const restaurants = await Restaurant.insertMany(RESTAURANT_SEED_DATA);
    console.log('🏪 Restaurants created:', restaurants.length);

    const rMap = {};
    restaurants.forEach((r) => (rMap[r.name] = r._id));

    const foods = await Food.insertMany([
      { name: 'Butter Chicken', description: 'Tender chicken in rich tomato-butter gravy, slow-cooked to perfection', price: 349, discountPrice: 299, category: catMap['North Indian'], restaurant: rMap['Spice House'], isVeg: false, menuSection: 'Main Course', preparationTime: 25, totalOrders: 450, isFeatured: true, rating: 4.6, totalRatings: 200 },
      { name: 'Paneer Tikka Masala', description: 'Creamy paneer cubes in spiced tomato gravy', price: 299, discountPrice: null, category: catMap['North Indian'], restaurant: rMap['Spice House'], isVeg: true, menuSection: 'Main Course', preparationTime: 20, totalOrders: 320, rating: 4.4, totalRatings: 150 },
      { name: 'Mutton Rogan Josh', description: 'Slow-cooked mutton in Kashmiri spices — intensely aromatic', price: 449, category: catMap['North Indian'], restaurant: rMap['Spice House'], isVeg: false, menuSection: 'Main Course', preparationTime: 35, totalOrders: 180 },
      { name: 'Dal Makhani', description: 'Black lentils slow-cooked overnight with butter and cream', price: 229, category: catMap['North Indian'], restaurant: rMap['Spice House'], isVeg: true, menuSection: 'Main Course', preparationTime: 15, totalOrders: 280 },
      { name: 'Chicken Seekh Kebab', description: 'Minced chicken marinated with herbs, skewered and grilled in tandoor', price: 299, category: catMap['Starters'], restaurant: rMap['Spice House'], isVeg: false, menuSection: 'Starters', preparationTime: 20, totalOrders: 200 },
      { name: 'Gulab Jamun', description: 'Soft milk-solid dumplings soaked in rose-flavored sugar syrup', price: 99, category: catMap['Desserts'], restaurant: rMap['Spice House'], isVeg: true, menuSection: 'Desserts', preparationTime: 5, totalOrders: 150 },
      { name: 'Chicken Dum Biryani', description: 'Aromatic basmati rice with tender chicken pieces, slow-cooked in sealed vessel', price: 299, discountPrice: 249, category: catMap['Biryani'], restaurant: rMap['Urban Biryani'], isVeg: false, menuSection: 'Biryani', preparationTime: 30, totalOrders: 780, isFeatured: true, rating: 4.8, totalRatings: 400 },
      { name: 'Mutton Biryani', description: 'Rich mutton biryani with whole spices and caramelized onions', price: 399, category: catMap['Biryani'], restaurant: rMap['Urban Biryani'], isVeg: false, menuSection: 'Biryani', preparationTime: 35, totalOrders: 520, rating: 4.7, totalRatings: 300 },
      { name: 'Veg Biryani', description: 'Seasonal vegetables with saffron and fragrant spices — the vegetarian delight', price: 229, category: catMap['Biryani'], restaurant: rMap['Urban Biryani'], isVeg: true, menuSection: 'Biryani', preparationTime: 25, totalOrders: 290 },
      { name: 'Prawn Biryani', description: 'Plump prawns cooked with fragrant basmati in a sealed handi', price: 449, category: catMap['Biryani'], restaurant: rMap['Urban Biryani'], isVeg: false, menuSection: 'Biryani', preparationTime: 35, totalOrders: 200 },
      { name: 'Raita', description: 'Fresh cucumber and onion raita — the perfect biryani companion', price: 69, category: catMap['Starters'], restaurant: rMap['Urban Biryani'], isVeg: true, menuSection: 'Sides', preparationTime: 5, totalOrders: 600 },
      { name: 'Margherita Pizza', description: 'Classic tomato sauce, mozzarella cheese and fresh basil on wood-fired base', price: 299, discountPrice: 249, category: catMap['Pizza'], restaurant: rMap['Pizza Point'], isVeg: true, menuSection: 'Pizza', preparationTime: 20, totalOrders: 350, isFeatured: true, rating: 4.3, totalRatings: 180 },
      { name: 'Chicken BBQ Pizza', description: 'Grilled chicken, BBQ sauce, red onions and cheese on crispy base', price: 449, category: catMap['Pizza'], restaurant: rMap['Pizza Point'], isVeg: false, menuSection: 'Pizza', preparationTime: 25, totalOrders: 420 },
      { name: 'Farmhouse Pizza', description: 'Loaded with fresh veggies — capsicum, mushrooms, olives and corn', price: 399, category: catMap['Pizza'], restaurant: rMap['Pizza Point'], isVeg: true, menuSection: 'Pizza', preparationTime: 22, totalOrders: 290 },
      { name: 'Garlic Bread', description: 'Crispy garlic bread with herb butter and cheese', price: 149, category: catMap['Starters'], restaurant: rMap['Pizza Point'], isVeg: true, menuSection: 'Starters', preparationTime: 10, totalOrders: 500 },
      { name: 'Chocolate Lava Cake', description: 'Warm chocolate cake with a gooey molten center, served with vanilla ice cream', price: 199, category: catMap['Desserts'], restaurant: rMap['Pizza Point'], isVeg: true, menuSection: 'Desserts', preparationTime: 15, totalOrders: 300 },
      { name: 'Classic Beef Burger', description: 'Juicy beef patty with lettuce, tomato, cheese and secret sauce in a brioche bun', price: 299, category: catMap['Burger'], restaurant: rMap['Burger Hub'], isVeg: false, menuSection: 'Burgers', preparationTime: 15, totalOrders: 400, isFeatured: true, rating: 4.2, totalRatings: 200 },
      { name: 'Crispy Chicken Burger', description: 'Crispy fried chicken with coleslaw and spicy mayo', price: 249, category: catMap['Burger'], restaurant: rMap['Burger Hub'], isVeg: false, menuSection: 'Burgers', preparationTime: 15, totalOrders: 380 },
      { name: 'Veggie Delight Burger', description: 'Aloo tikki patty with fresh veggies and mint chutney', price: 199, category: catMap['Burger'], restaurant: rMap['Burger Hub'], isVeg: true, menuSection: 'Burgers', preparationTime: 12, totalOrders: 220 },
      { name: 'Loaded Fries', description: 'Crispy fries loaded with cheese sauce, jalapeños and sour cream', price: 179, category: catMap['Fast Food'], restaurant: rMap['Burger Hub'], isVeg: true, menuSection: 'Sides', preparationTime: 10, totalOrders: 450 },
      { name: 'Milkshake', description: 'Thick and creamy milkshake in chocolate, vanilla or strawberry', price: 149, category: catMap['Beverages'], restaurant: rMap['Burger Hub'], isVeg: true, menuSection: 'Beverages', preparationTime: 5, totalOrders: 300 },
      { name: 'Masala Dosa', description: 'Crispy golden dosa filled with spiced potato masala, served with sambar and chutneys', price: 129, discountPrice: 99, category: catMap['South Indian'], restaurant: rMap['South Indian Kitchen'], isVeg: true, menuSection: 'Breakfast', preparationTime: 10, totalOrders: 650, isFeatured: true, rating: 4.7, totalRatings: 350 },
      { name: 'Idli Sambar (3 pcs)', description: 'Soft steamed rice idlis served with piping hot sambar and fresh coconut chutney', price: 99, category: catMap['South Indian'], restaurant: rMap['South Indian Kitchen'], isVeg: true, menuSection: 'Breakfast', preparationTime: 8, totalOrders: 580 },
      { name: 'Rava Dosa', description: 'Crispy and lacy semolina dosa — a South Indian classic', price: 119, category: catMap['South Indian'], restaurant: rMap['South Indian Kitchen'], isVeg: true, menuSection: 'Breakfast', preparationTime: 10, totalOrders: 400 },
      { name: 'Curd Rice', description: 'Comforting south Indian curd rice tempered with mustard seeds and curry leaves', price: 99, category: catMap['South Indian'], restaurant: rMap['South Indian Kitchen'], isVeg: true, menuSection: 'Main Course', preparationTime: 5, totalOrders: 300 },
      { name: 'Filter Coffee', description: 'Traditional South Indian decoction coffee served frothy in a brass tumbler', price: 49, category: catMap['Beverages'], restaurant: rMap['South Indian Kitchen'], isVeg: true, menuSection: 'Beverages', preparationTime: 3, totalOrders: 700 },
    ]);
    console.log('🍽️  Foods created:', foods.length);

    const couponCount = await Coupon.countDocuments();
    if (couponCount === 0) {
      await Coupon.insertMany([
        { code: 'WELCOME50', description: 'Welcome offer — Get ₹50 off on your first order above ₹200', discountType: 'fixed', discountValue: 50, minimumOrderValue: 200, maximumDiscount: 50, expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), usageLimit: 1000, isActive: true },
        { code: 'SAVE20', description: 'Get 20% off up to ₹100 on orders above ₹300', discountType: 'percentage', discountValue: 20, minimumOrderValue: 300, maximumDiscount: 100, expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), usageLimit: 500, isActive: true },
        { code: 'BIRYANI30', description: 'Get 30% off up to ₹150 on biryani orders above ₹250', discountType: 'percentage', discountValue: 30, minimumOrderValue: 250, maximumDiscount: 150, expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), usageLimit: 200, isActive: true },
      ]);
      console.log('🎟️  Coupons created: 3');
    }
  }

  return true;
};

const seed = async () => {
  await connectDB();
  await seedDatabase();
  console.log('\n✅ Seeding completed successfully!\n');
  console.log('📝 Sample customer login:');
  console.log('   User   → user@foodie.com  / user1234');
  console.log('\n🎟️  Available Coupons: WELCOME50, SAVE20, BIRYANI30\n');

  return true;
};

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Seeding failed:', err);
      process.exit(1);
    });
}

module.exports = { connectDB, seed, seedDatabase };
