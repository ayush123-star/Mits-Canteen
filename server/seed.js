const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const FoodItem = require('./models/FoodItem');
const User = require('./models/User');
const Order = require('./models/Order');
const Canteen = require('./models/Canteen');
const NotificationLog = require('./models/NotificationLog');
const InventoryItem = require('./models/InventoryItem');
const Recipe = require('./models/Recipe');
const StockTransaction = require('./models/StockTransaction');
const OwnerInvitation = require('./models/OwnerInvitation');
const Feedback = require('./models/Feedback');
const AuditLog = require('./models/AuditLog');

dotenv.config();

const sampleFoodItems = [
  // Breakfast
  {
    name: 'South Indian Masala Dosa',
    description: 'Crispy golden rice crepe filled with spiced potato masala, served with fresh coconut chutney and piping hot sambar.',
    price: 70,
    category: 'Breakfast',
    isVeg: true,
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=700&auto=format&fit=crop&q=80',
    preparationTime: 8,
    calories: 320,
    tags: ['Best Seller', 'South Indian', 'Morning Special'],
    rating: 4.9,
    reviewCount: 142,
    counter: 2,
    stockCount: 60,
  },
  {
    name: 'Idli Vada Combo with Sambar',
    description: 'Two fluffy steamed idlis and one crispy medu vada served with signature lentil sambar and tangy tomato-onion chutney.',
    price: 60,
    category: 'Breakfast',
    isVeg: true,
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=700&auto=format&fit=crop&q=80',
    preparationTime: 5,
    calories: 280,
    tags: ['Quick Prep', 'Light Meal'],
    rating: 4.7,
    reviewCount: 95,
    counter: 2,
    stockCount: 50,
  },
  {
    name: 'Amritsari Chole Bhature',
    description: 'Two puffed deep-fried golden bhatures served with rich, aromatic Punjabi chole, pickle, and spiced mint onions.',
    price: 90,
    category: 'Breakfast',
    isVeg: true,
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=700&auto=format&fit=crop&q=80',
    preparationTime: 12,
    calories: 550,
    tags: ['Chef Special', 'Heavy Breakfast'],
    rating: 4.8,
    reviewCount: 180,
    counter: 2,
    stockCount: 40,
  },
  {
    name: 'Poha with Sev & Fried Peanuts',
    description: 'Warm, flattened rice tossed with mustard seeds, curry leaves, turmeric, crunchy roasted peanuts, and fine sev.',
    price: 40,
    category: 'Breakfast',
    isVeg: true,
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=700&auto=format&fit=crop&q=80',
    preparationTime: 4,
    calories: 220,
    tags: ['Budget Friendly', 'Quick Prep'],
    rating: 4.6,
    reviewCount: 67,
    counter: 2,
    stockCount: 75,
  },

  // Lunch
  {
    name: 'Special Campus Deluxe Thali',
    description: 'Complete wholesome meal with Paneer Butter Masala, Dal Makhani, Seasonal Sabzi, Jeera Rice, 2 Butter Rotis, Gulab Jamun, and Papad.',
    price: 130,
    category: 'Lunch',
    isVeg: true,
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=700&auto=format&fit=crop&q=80',
    preparationTime: 10,
    calories: 680,
    tags: ['Best Seller', 'Complete Meal', 'Student Favorite'],
    rating: 4.9,
    reviewCount: 310,
    counter: 2,
    stockCount: 80,
  },
  {
    name: 'Hyderabadi Paneer Dum Biryani',
    description: 'Fragrant long-grain basmati rice layered with marinated cottage cheese, saffron milk, caramelized onions, served with cooling cucumber raita.',
    price: 120,
    category: 'Lunch',
    isVeg: true,
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=700&auto=format&fit=crop&q=80',
    preparationTime: 8,
    calories: 520,
    tags: ['Popular', 'Aromatic'],
    rating: 4.8,
    reviewCount: 220,
    counter: 2,
    stockCount: 55,
  },
  {
    name: 'Rajma Chawal Bowl',
    description: 'Homestyle slow-simmered Punjabi red kidney beans curry topped over hot steamed basmati rice with pickled green chilies.',
    price: 80,
    category: 'Lunch',
    isVeg: true,
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=700&auto=format&fit=crop&q=80',
    preparationTime: 5,
    calories: 410,
    tags: ['Comfort Food', 'High Protein'],
    rating: 4.7,
    reviewCount: 165,
    counter: 2,
    stockCount: 60,
  },
  {
    name: 'Shahi Paneer Dum Biryani (Campus Special)',
    description: 'Fragrant long-grain basmati rice slow-cooked with marinated malai paneer cubes, whole saffron spices, caramelized onions, and fresh mint. Served with cooling cucumber raita.',
    price: 130,
    category: 'Lunch',
    isVeg: true,
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=700&auto=format&fit=crop&q=80',
    preparationTime: 10,
    calories: 520,
    tags: ['Pure Veg Bestseller', 'Campus Special'],
    rating: 4.9,
    reviewCount: 280,
    counter: 1,
    stockCount: 45,
  },

  // Fast Food
  {
    name: 'Double Cheese Veg Supreme Burger',
    description: 'Crispy herb potato patty topped with melted cheddar, sliced tomatoes, fresh lettuce, and smoky burger mayo on a toasted sesame bun.',
    price: 85,
    category: 'Fast Food',
    isVeg: true,
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=700&auto=format&fit=crop&q=80',
    preparationTime: 7,
    calories: 440,
    tags: ['Best Seller', 'Cheesy', 'Youth Favorite'],
    rating: 4.8,
    reviewCount: 204,
    counter: 1,
    stockCount: 65,
  },
  {
    name: 'Paneer Tikka Grilled Sandwich',
    description: 'Triple-layer jumbo sandwich loaded with smoky tandoori paneer cubes, crunchy bell peppers, mozzarella cheese, and mint chutney.',
    price: 95,
    category: 'Fast Food',
    isVeg: true,
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=700&auto=format&fit=crop&q=80',
    preparationTime: 8,
    calories: 480,
    tags: ['Grilled', 'High Protein'],
    rating: 4.9,
    reviewCount: 178,
    counter: 1,
    stockCount: 50,
  },
  {
    name: 'Crispy Veg Hakka Noodles',
    description: 'Wok-tossed noodles with shredded cabbage, carrots, bell peppers, spring onions, and garlic-soy chili sauce.',
    price: 80,
    category: 'Fast Food',
    isVeg: true,
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=700&auto=format&fit=crop&q=80',
    preparationTime: 9,
    calories: 390,
    tags: ['Chinese Corner', 'Spicy'],
    rating: 4.7,
    reviewCount: 130,
    counter: 1,
    stockCount: 40,
  },
  {
    name: 'Peri Peri French Fries (Jumbo)',
    description: 'Golden extra-crispy skin-on potato fries tossed in fiery African peri peri seasoning. Served with garlic dip.',
    price: 65,
    category: 'Fast Food',
    isVeg: true,
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=700&auto=format&fit=crop&q=80',
    preparationTime: 6,
    calories: 350,
    tags: ['Snack Attack', 'Crunchy'],
    rating: 4.6,
    reviewCount: 112,
    counter: 1,
    stockCount: 90,
  },

  // Snacks
  {
    name: 'Mumbai Special Butter Pav Bhaji',
    description: 'Thick spicy mashed vegetable gravy garnished with a generous dollop of butter, served with two soft butter-toasted pavs and lemon wedges.',
    price: 85,
    category: 'Snacks',
    isVeg: true,
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=700&auto=format&fit=crop&q=80',
    preparationTime: 7,
    calories: 460,
    tags: ['Best Seller', 'Street Classic'],
    rating: 4.9,
    reviewCount: 245,
    counter: 1,
    stockCount: 70,
  },
  {
    name: 'Samosa Chaat with Dahi & Chutneys',
    description: 'Two crushed golden potato samosas topped with warm spiced chole, sweet curd, tamarind chutney, mint dip, and crunchy nylon sev.',
    price: 50,
    category: 'Snacks',
    isVeg: true,
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=700&auto=format&fit=crop&q=80',
    preparationTime: 4,
    calories: 340,
    tags: ['Break Time Favorite', 'Tangy & Spicy'],
    rating: 4.8,
    reviewCount: 198,
    counter: 1,
    stockCount: 85,
  },
  {
    name: 'Paneer Kathi Roll',
    description: 'Flaky paratha wrap stuffed with succulent marinated cottage cheese, crunchy onions, and zesty chipotle mint mayo.',
    price: 75,
    category: 'Snacks',
    isVeg: true,
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=700&auto=format&fit=crop&q=80',
    preparationTime: 6,
    calories: 360,
    tags: ['Grab & Go', 'Rolls Corner'],
    rating: 4.8,
    reviewCount: 150,
    counter: 1,
    stockCount: 60,
  },

  // Beverages
  {
    name: 'Thick Cold Coffee with Chocolate Ice Cream',
    description: 'Creamy blended espresso coffee made with chilled milk, topped with a scoop of premium chocolate ice cream and cocoa drizzle.',
    price: 60,
    category: 'Beverages',
    isVeg: true,
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=700&auto=format&fit=crop&q=80',
    preparationTime: 3,
    calories: 260,
    tags: ['Best Seller', 'Chilled', 'Exam Season Lifesaver'],
    rating: 4.9,
    reviewCount: 340,
    counter: 3,
    stockCount: 100,
  },
  {
    name: 'Cutting Masala Chai (Kulhad Cup)',
    description: 'Authentic Indian milk tea brewed with crushed ginger, green cardamom, cloves, and cinnamon. Served in an earthen clay kulhad.',
    price: 20,
    category: 'Beverages',
    isVeg: true,
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=700&auto=format&fit=crop&q=80',
    preparationTime: 3,
    calories: 85,
    tags: ['Campus Daily', 'Hot Brew'],
    rating: 4.9,
    reviewCount: 420,
    counter: 3,
    stockCount: 200,
  },
  {
    name: 'Fresh Mint Lime Soda (Chilled)',
    description: 'Refreshing sparkling soda with freshly squeezed green lemons, muddled mint sprigs, black salt, and a touch of sweetness.',
    price: 35,
    category: 'Beverages',
    isVeg: true,
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=700&auto=format&fit=crop&q=80',
    preparationTime: 3,
    calories: 70,
    tags: ['Hydration', 'Summer Cooler'],
    rating: 4.7,
    reviewCount: 88,
    counter: 3,
    stockCount: 90,
  },
  {
    name: 'Mango Lassi with Dry Fruits',
    description: 'Thick, creamy yogurt drink blended with Alphonso mango pulp, garnished with slivered almonds and pistachios.',
    price: 55,
    category: 'Beverages',
    isVeg: true,
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=700&auto=format&fit=crop&q=80',
    preparationTime: 4,
    calories: 240,
    tags: ['Sweet Treat', 'Seasonal Delight'],
    rating: 4.8,
    reviewCount: 125,
    counter: 3,
    stockCount: 50,
  },

  // Combos
  {
    name: 'Burger + Fries + Cold Coffee Saver Combo',
    description: 'Double Cheese Veg Burger + Small Peri Peri Fries + 1 Chilled Thick Cold Coffee. The ultimate college hangout combo!',
    price: 180,
    category: 'Combos',
    isVeg: true,
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=700&auto=format&fit=crop&q=80',
    preparationTime: 9,
    calories: 820,
    tags: ['Combo Deal', 'Save ₹30', 'Most Ordered'],
    rating: 4.9,
    reviewCount: 380,
    counter: 1,
    stockCount: 40,
  },
  {
    name: 'South Indian Breakfast Feast Combo',
    description: '1 Mini Masala Dosa + 2 Steamed Idlis + 1 Medu Vada + 1 Hot Masala Chai in Kulhad. Complete morning energy booster!',
    price: 130,
    category: 'Combos',
    isVeg: true,
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?w=700&auto=format&fit=crop&q=80',
    preparationTime: 8,
    calories: 610,
    tags: ['Breakfast Combo', 'Heavy Meal'],
    rating: 4.9,
    reviewCount: 160,
    counter: 2,
    stockCount: 35,
  }
];

const seedData = async () => {
  try {
    await connectDB();
    console.log('[Seed] Database ready.');

    // Clear existing menu items and users for clean state
    await FoodItem.deleteMany({});
    console.log('[Seed] Cleared existing food items.');

    const createdFoods = await FoodItem.insertMany(sampleFoodItems);
    console.log(`[Seed] Seeded ${createdFoods.length} realistic campus food items.`);

    // Check or create Lead Developer & Student: Ayush Pandey (Electronics and Telecommunication)
    let ayushUser = await User.findOne({ email: '25et1ay39@mitsgwl.ac.in' });
    if (!ayushUser) {
      ayushUser = await User.create({
        name: 'Ayush Pandey',
        email: '25et1ay39@mitsgwl.ac.in',
        password: 'password123',
        role: 'student',
        userType: 'student',
        studentId: 'BTET25O1039',
        department: 'Electronics and Telecommunication',
        phone: '9039567623',
        avatar: '/assets/developer/ayush_pandey.jpg',
        favorites: [createdFoods[0]._id, createdFoods[2]._id],
      });
      console.log('[Seed] Created MITS Student (Lead Developer): 25et1ay39@mitsgwl.ac.in (BTET25O1039)');
    }

    // Check or create Demo Student (MITS Gwalior Pattern: 0901...)
    let student = await User.findOne({ email: '0901cs221045@mitsgwalior.in' });
    if (!student) {
      student = await User.create({
        name: 'Aryan Sharma',
        email: '0901cs221045@mitsgwalior.in',
        password: 'password123',
        role: 'student',
        studentId: '0901CS221045',
        department: 'Computer Science & Engineering',
        phone: '9039567623',
        favorites: [createdFoods[0]._id, createdFoods[4]._id, createdFoods[12]._id],
      });
      console.log('[Seed] Created MITS Student: 0901cs221045@mitsgwalior.in / password123');
    }

    // Check or create Demo Faculty (MITS Gwalior Pattern: name@mitsgwalior.in)
    let faculty = await User.findOne({ email: 'rksharma.cse@mitsgwalior.in' });
    if (!faculty) {
      faculty = await User.create({
        name: 'Dr. R.K. Sharma',
        email: 'rksharma.cse@mitsgwalior.in',
        password: 'password123',
        role: 'student', // Diner access
        studentId: 'MITS-FAC-CSE-012',
        department: 'Computer Science & Engineering',
        phone: '9425112345',
        favorites: [createdFoods[1]._id, createdFoods[5]._id],
      });
      console.log('[Seed] Created MITS Faculty: rksharma.cse@mitsgwalior.in / password123');
    }

    // Fallback student for compatibility
    let legacyStudent = await User.findOne({ email: 'student@campus.edu' });
    if (!legacyStudent) {
      await User.create({
        name: 'Aryan Sharma',
        email: 'student@campus.edu',
        password: 'password123',
        role: 'student',
        studentId: '0901CS221045',
        department: 'Computer Science & Engineering',
        phone: '9039567623',
      });
    }

    // Demo student with Gmail (universal login)
    let gmailStudent = await User.findOne({ email: 'student@gmail.com' });
    if (!gmailStudent) {
      await User.create({
        name: 'MITS Student (Gmail)',
        email: 'student@gmail.com',
        password: 'password123',
        role: 'student',
        studentId: 'STU-GMAIL-101',
        department: 'Computer Science & Engineering',
        phone: '9039567623',
      });
    }

    // Check or create Demo Admin
    let admin = await User.findOne({ email: 'admin@campus.edu' });
    if (!admin) {
      admin = await User.create({
        name: 'Campus Canteen Manager',
        email: 'admin@campus.edu',
        password: 'admin123',
        role: 'admin',
        studentId: 'STAFF-MGR-01',
        department: 'Campus Hospitality & Dining',
        phone: '9811223344',
      });
      console.log('[Seed] Created Demo Admin: admin@campus.edu / admin123');
    }

    // Check or create Super Admin (Campus Owner / Directorate)
    let superAdmin = await User.findOne({ email: 'superadmin@campus.edu' });
    if (!superAdmin) {
      superAdmin = await User.create({
        name: 'Campus Directorate / System Owner',
        email: 'superadmin@campus.edu',
        password: 'super123',
        role: 'super_admin',
        studentId: 'SUPER-OWNER-01',
        department: 'Campus Administration & Facilities',
        phone: '9899001122',
      });
      console.log('[Seed] Created Super Admin / Owner: superadmin@campus.edu / super123');
    }

    // Seed Registered Canteens
    await Canteen.deleteMany({});
    await Canteen.create([
      {
        name: 'MITS Main Canteen',
        code: 'MITS-01',
        location: 'MITS Main Canteen, Counter 1, MITS Gwalior',
        isOpen: true,
        status: 'Operational',
        openingTime: '08:00 AM',
        closingTime: '07:30 PM',
        activeCounters: 1, // Single Express Counter 1
        managerName: 'MITS Canteen Incharge',
        managerPhone: '+91 98112 23344',
        rating: 4.9,
        todayOrdersCount: 42,
        todayRevenue: 4850,
      },
      {
        name: 'Engineering & Tech Wing Cafe',
        code: 'CANTEEN-02',
        location: 'Block B, Academic Courtyard',
        isOpen: true,
        status: 'Operational',
        openingTime: '09:00 AM',
        closingTime: '06:00 PM',
        activeCounters: 2,
        managerName: 'Ramesh K. (Asst. Supervisor)',
        managerPhone: '+91 98223 34455',
        rating: 4.7,
        todayOrdersCount: 28,
        todayRevenue: 3120,
      },
      {
        name: 'Central Library Lounge Snack Bar',
        code: 'CANTEEN-03',
        location: 'Knowledge Center, 1st Floor',
        isOpen: true,
        status: 'Operational',
        openingTime: '10:00 AM',
        closingTime: '09:00 PM',
        activeCounters: 1,
        managerName: 'Priya Sharma (Barista Lead)',
        managerPhone: '+91 98334 45566',
        rating: 4.8,
        todayOrdersCount: 19,
        todayRevenue: 1950,
      }
    ]);
    console.log('[Seed] Seeded 3 Campus Canteens (CANTEEN-01, CANTEEN-02, CANTEEN-03).');

    // Seed a couple of active orders so live token display has immediate data!
    const existingOrders = await Order.countDocuments();
    if (existingOrders === 0) {
      const now = new Date();
      await Order.create([
        {
          tokenNumber: 'TK-101',
          user: student._id,
          items: [
            {
              foodItem: createdFoods[0]._id,
              name: createdFoods[0].name,
              price: createdFoods[0].price,
              quantity: 1,
              counter: 2,
            },
            {
              foodItem: createdFoods[13]._id,
              name: createdFoods[13].name,
              price: createdFoods[13].price,
              quantity: 2,
              counter: 3,
            }
          ],
          totalAmount: 110,
          discountAmount: 0,
          finalAmount: 110,
          paymentMethod: 'UPI',
          paymentStatus: 'Completed',
          status: 'Ready for Pickup',
          estimatedPrepMinutes: 8,
          estimatedReadyTime: now,
          assignedCounter: 2,
          scheduledPickupTime: 'ASAP (Immediate)',
          timeline: [
            { status: 'Placed', timestamp: new Date(Date.now() - 15 * 60000) },
            { status: 'Preparing', timestamp: new Date(Date.now() - 8 * 60000) },
            { status: 'Ready for Pickup', timestamp: now },
          ],
        },
        {
          tokenNumber: 'TK-102',
          user: student._id,
          items: [
            {
              foodItem: createdFoods[4]._id,
              name: createdFoods[4].name,
              price: createdFoods[4].price,
              quantity: 1,
              counter: 2,
            }
          ],
          totalAmount: 130,
          discountAmount: 10,
          finalAmount: 120,
          couponCode: 'STUDENT10',
          paymentMethod: 'CASH_AT_COUNTER',
          paymentStatus: 'Pending',
          status: 'Preparing',
          estimatedPrepMinutes: 12,
          estimatedReadyTime: new Date(Date.now() + 6 * 60000),
          assignedCounter: 2,
          scheduledPickupTime: '1:00 PM - Lunch Break',
          timeline: [
            { status: 'Placed', timestamp: new Date(Date.now() - 5 * 60000) },
            { status: 'Preparing', timestamp: new Date(Date.now() - 2 * 60000) },
          ],
        },
        {
          tokenNumber: 'TK-103',
          user: student._id,
          items: [
            {
              foodItem: createdFoods[16]._id,
              name: createdFoods[16].name,
              price: createdFoods[16].price,
              quantity: 1,
              counter: 1,
            }
          ],
          totalAmount: 180,
          discountAmount: 0,
          finalAmount: 180,
          paymentMethod: 'UPI',
          paymentStatus: 'Completed',
          status: 'Accepted',
          estimatedPrepMinutes: 10,
          estimatedReadyTime: new Date(Date.now() + 10 * 60000),
          assignedCounter: 1,
          scheduledPickupTime: 'ASAP (Immediate)',
          timeline: [
            { status: 'Placed', timestamp: new Date(Date.now() - 1 * 60000) },
            { status: 'Accepted', timestamp: now },
          ],
        }
      ]);
      console.log('[Seed] Created initial realistic live orders (TK-101 Ready, TK-102 Preparing, TK-103 Accepted).');
    }

    // Check or create Demo New Owner (Tests first-time mandatory password reset)
    let newOwner = await User.findOne({ email: 'newowner@campus.edu' });
    if (!newOwner) {
      newOwner = await User.create({
        name: 'Vikram Mehta (New Owner)',
        email: 'newowner@campus.edu',
        password: 'temp123',
        role: 'canteen_admin',
        studentId: 'STAFF-MGR-02',
        canteenName: 'Engineering & Tech Wing Cafe',
        department: 'Campus Hospitality & Dining',
        phone: '9822334455',
        requiresPasswordChange: true,
      });
      console.log('[Seed] Created New Owner (First-Login Demo): newowner@campus.edu / temp123 (Password Change Required)');
    }

    // Seed Raw Material Inventory
    await InventoryItem.deleteMany({});
    const createdInventory = await InventoryItem.insertMany([
      { name: 'Gourmet Burger Buns', category: 'Bakery', currentQuantity: 120, unit: 'pcs', minimumStockLevel: 30, reorderQuantity: 100, status: 'Optimal', supplier: 'Daily Fresh Bakery' },
      { name: 'Cheddar Cheese Slices', category: 'Dairy', currentQuantity: 8.5, unit: 'kg', minimumStockLevel: 2.0, reorderQuantity: 10, status: 'Optimal', supplier: 'Amul Dairy Distributors' },
      { name: 'Eggless Mayonnaise', category: 'Condiments', currentQuantity: 6.2, unit: 'L', minimumStockLevel: 2.0, reorderQuantity: 10, status: 'Optimal', supplier: 'Veeba Food Services' },
      { name: 'Farm Fresh Potatoes', category: 'Vegetables', currentQuantity: 45, unit: 'kg', minimumStockLevel: 15, reorderQuantity: 50, status: 'Optimal', supplier: 'APMC Mandi Wholesale' },
      { name: 'Crispy Herb Veg Patties', category: 'Pantry & Spices', currentQuantity: 95, unit: 'pcs', minimumStockLevel: 25, reorderQuantity: 100, status: 'Optimal', supplier: 'McCain Commercial' },
      { name: 'Fermented Dosa Batter', category: 'Pantry & Spices', currentQuantity: 18, unit: 'kg', minimumStockLevel: 5, reorderQuantity: 20, status: 'Optimal', supplier: 'ID Fresh Foods' },
      { name: 'Fresh Malai Paneer', category: 'Dairy', currentQuantity: 1.4, unit: 'kg', minimumStockLevel: 3.0, reorderQuantity: 10, status: 'Low Stock', supplier: 'Mother Dairy Direct' },
      { name: 'Fresh Toned Milk', category: 'Dairy', currentQuantity: 3.5, unit: 'L', minimumStockLevel: 5.0, reorderQuantity: 20, status: 'Low Stock', supplier: 'Amul Dairy Distributors' },
      { name: 'Arabica Coffee Beans', category: 'Beverages', currentQuantity: 5.0, unit: 'kg', minimumStockLevel: 1.5, reorderQuantity: 5, status: 'Optimal', supplier: 'Blue Tokai Roasters' },
      { name: 'Arhar / Toor Sambar Dal', category: 'Pantry & Spices', currentQuantity: 22, unit: 'kg', minimumStockLevel: 8, reorderQuantity: 25, status: 'Optimal', supplier: 'Tata Sampann' },
      { name: 'Desi Amul Table Butter', category: 'Dairy', currentQuantity: 4.8, unit: 'kg', minimumStockLevel: 2.0, reorderQuantity: 5, status: 'Optimal', supplier: 'Amul Dairy Distributors' },
      { name: 'Biodegradable Meal Boxes', category: 'Packaging', currentQuantity: 350, unit: 'pcs', minimumStockLevel: 100, reorderQuantity: 500, status: 'Optimal', supplier: 'EcoCampus Pack' },
    ]);
    console.log(`[Seed] Seeded ${createdInventory.length} raw material inventory items.`);

    // Seed Recipes
    await Recipe.deleteMany({});
    const burgerFood = createdFoods.find((f) => f.name.includes('Burger'));
    const dosaFood = createdFoods.find((f) => f.name.includes('Dosa'));
    const coffeeFood = createdFoods.find((f) => f.name.includes('Coffee'));

    await Recipe.create([
      {
        menuItemId: burgerFood ? burgerFood._id.toString() : 'food-1',
        menuItemName: 'Double Cheese Veg Supreme Burger',
        ingredients: [
          { inventoryId: createdInventory[0]._id.toString(), quantity: 1, unit: 'pcs' },
          { inventoryId: createdInventory[1]._id.toString(), quantity: 0.05, unit: 'kg' },
          { inventoryId: createdInventory[2]._id.toString(), quantity: 0.02, unit: 'L' },
          { inventoryId: createdInventory[4]._id.toString(), quantity: 1, unit: 'pcs' },
        ],
        lastUpdatedBy: 'Chef Executive',
      },
      {
        menuItemId: dosaFood ? dosaFood._id.toString() : 'food-2',
        menuItemName: 'South Indian Masala Dosa',
        ingredients: [
          { inventoryId: createdInventory[5]._id.toString(), quantity: 0.25, unit: 'kg' },
          { inventoryId: createdInventory[3]._id.toString(), quantity: 0.1, unit: 'kg' },
          { inventoryId: createdInventory[10]._id.toString(), quantity: 0.02, unit: 'kg' },
        ],
        lastUpdatedBy: 'South Kitchen Master',
      },
    ]);
    console.log('[Seed] Seeded Recipe Formulas & Auto-Deduction mappings.');

    // Seed Stock Transactions
    await StockTransaction.deleteMany({});
    await StockTransaction.create([
      { timestamp: '08:15 AM', inventoryItem: 'Gourmet Burger Buns', type: 'STOCK_IN', quantity: 100, unit: 'pcs', balanceAfter: 120, reference: 'Morning Bakery Inward PO-4412', actor: 'Ramesh Wholesale' },
      { timestamp: '09:30 AM', inventoryItem: 'Cheddar Cheese Slices', type: 'RECIPE_DEDUCTION', quantity: -0.15, unit: 'kg', balanceAfter: 8.5, reference: 'Order #TK-101 (Double Cheese Burger)', actor: 'Recipe Engine Auto' },
      { timestamp: '10:00 AM', inventoryItem: 'Fresh Malai Paneer', type: 'MANUAL_ADJUSTMENT', quantity: -0.6, unit: 'kg', balanceAfter: 1.4, reference: 'Wastage / Shelf Spoilage - Verified by chef', actor: 'Store Keeper' },
    ]);
    console.log('[Seed] Seeded Stock Transaction Ledger entries.');

    // Seed Owner Invitations (with 24h deadline)
    await OwnerInvitation.deleteMany({});
    await OwnerInvitation.create([
      {
        email: 'vikram.mehta@campus.edu',
        canteenName: 'Engineering & Tech Wing Cafe',
        role: 'canteen_admin',
        token: 'invite_tok_engg_2026',
        status: 'PENDING',
        expiresAt: Date.now() + 18 * 60 * 60 * 1000, // 18 hours remaining
        invitedBy: 'Super Admin Directorate',
      },
      {
        email: 'sunita.sharma@campus.edu',
        canteenName: 'Central Library Lounge Snack Bar',
        role: 'canteen_admin',
        token: 'invite_tok_lib_2026',
        status: 'PENDING',
        expiresAt: Date.now() + 22 * 60 * 60 * 1000, // 22 hours remaining
        invitedBy: 'Super Admin Directorate',
      },
    ]);
    console.log('[Seed] Seeded 24-Hour Canteen Owner Invitations.');

    // Seed Feedback
    await Feedback.deleteMany({});
    await Feedback.create([
      { studentId: student._id.toString(), studentName: 'Aryan Sharma', foodItemId: createdFoods[0]._id.toString(), foodName: createdFoods[0].name, rating: 5, comment: 'Crispy dosa and the sambar was piping hot! Zero wait time using the digital pass.', tags: ['Crispy & Fresh', 'Piping Hot'] },
      { studentId: student._id.toString(), studentName: 'Pooja Verma', foodItemId: createdFoods[1]._id.toString(), foodName: createdFoods[1].name, rating: 5, comment: 'Double cheese burger patty is juicy and super cheesy. Best lunch on campus!', tags: ['Generous Portion', 'Budget Friendly'] },
    ]);
    console.log('[Seed] Seeded Student Dish Reviews & Feedback.');

    // Seed Audit Logs
    await AuditLog.deleteMany({});
    await AuditLog.create([
      { timestamp: new Date().toLocaleString(), actor: 'Super Admin Directorate', action: 'CANTEEN_STATUS_UPDATE', module: 'CANTEENS', details: 'Opened Main Campus Dining Canteen for morning shift', ip: '192.168.1.10' },
      { timestamp: new Date().toLocaleString(), actor: 'System Auto-Engine', action: 'RECIPE_DEDUCTION', module: 'INVENTORY', details: 'Auto-deducted 4 ingredients for Order #TK-101', ip: '127.0.0.1' },
      { timestamp: new Date().toLocaleString(), actor: 'Super Admin Directorate', action: 'OWNER_INVITE_SENT', module: 'AUTH', details: 'Sent 24-hr onboarding invitation to vikram.mehta@campus.edu', ip: '192.168.1.10' },
    ]);
    console.log('[Seed] Seeded System Security Audit Logs.');

    console.log('[Seed] Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('[Seed] Error seeding data:', err);
    process.exit(1);
  }
};

seedData();
