// AI Business Inbox - Phase 1 Demo Seed
// Run (LOCAL ONLY):
//   ALLOW_DESTRUCTIVE_SEED=true mongosh mongodb://127.0.0.1:27017/ai_business_inbox seed.js
//
// WARNING: This script DELETES users/businesses/customers/products/
// conversations/messages/leads. Do NOT run against production.
// For non-destructive upsert seeding use:
//   backend/scripts/safeSeedDemoData.js

// Refuse production / accidental runs unless explicitly opted in.
(() => {
  const env =
    typeof process !== "undefined" && process.env
      ? process.env
      : {};

  if (env.NODE_ENV === "production") {
    throw new Error(
      "Refusing destructive seed: NODE_ENV=production"
    );
  }

  if (env.ALLOW_DESTRUCTIVE_SEED !== "true") {
    throw new Error(
      "Refusing destructive seed: set ALLOW_DESTRUCTIVE_SEED=true for local use only"
    );
  }
})();

use("ai_business_inbox");

// Destructive reset for local demo only.
db.users.deleteMany({});
db.businesses.deleteMany({});
db.customers.deleteMany({});
db.products.deleteMany({});
db.conversations.deleteMany({});
db.messages.deleteMany({});
db.leads.deleteMany({});

const businessId = ObjectId("68c5a0000000000000000001");
const ownerId = ObjectId("68c5a0000000000000000002");
const adminId = ObjectId("68c5a0000000000000000003");

const rahulId = ObjectId("68c5a0000000000000000011");
const amitId  = ObjectId("68c5a0000000000000000012");
const nehaId  = ObjectId("68c5a0000000000000000013");

const officeChairId = ObjectId("68c5a0000000000000000021");
const executiveChairId = ObjectId("68c5a0000000000000000022");
const officeTableId = ObjectId("68c5a0000000000000000023");
const meetingTableId = ObjectId("68c5a0000000000000000024");

const convRahulId = ObjectId("68c5a0000000000000000031");
const convAmitId  = ObjectId("68c5a0000000000000000032");
const convNehaId  = ObjectId("68c5a0000000000000000033");

const leadRahulId = ObjectId("68c5a0000000000000000041");
const leadAmitId  = ObjectId("68c5a0000000000000000042");

const now = new Date();


// ==========================================
// BUSINESS
// ==========================================

db.businesses.insertOne({
  _id: businessId,
  name: "ABC Furniture",
  industry: "Furniture",
  email: "owner@abcfurniture.demo",
  phone: "+91-9000000000",

  settings: {
    currency: "INR",
    aiEnabled: true,
    autoReplyEnabled: false,
    maxAutoDiscountPercent: 10
  },

  createdAt: now,
  updatedAt: now
});


// ==========================================
// USERS
// ==========================================

db.users.insertMany([
  {
    _id: ownerId,
    name: "Demo Owner",
    email: "owner@abcfurniture.demo",

    // bcrypt hash for LocalDev!b3059082 (cost 12) — local only; change after seed
    passwordHash: "$2b$12$ZjgBQQ8TvBYTWm4PwYVVMujPLyGwnzZUA5hWzeQiE4KIKQkZimG.e",

    role: "owner",
    businessId: businessId,

    createdAt: now,
    updatedAt: now
  },

  {
    _id: adminId,
    name: "Demo Admin",
    email: "admin@abcfurniture.demo",

    // bcrypt hash for LocalDev!b3059082 (cost 12) — local only; change after seed
    passwordHash: "$2b$12$ZjgBQQ8TvBYTWm4PwYVVMujPLyGwnzZUA5hWzeQiE4KIKQkZimG.e",

    role: "admin",
    businessId: businessId,

    createdAt: now,
    updatedAt: now
  }
]);


// ==========================================
// CUSTOMERS
// ==========================================

db.customers.insertMany([
  {
    _id: rahulId,
    businessId: businessId,

    name: "Rahul Sharma",
    email: "rahul@example.com",
    phone: "+91-9876500001",

    company: "Rahul Office Solutions",

    tags: [
      "hot-lead",
      "office-furniture"
    ],

    createdAt: now,
    updatedAt: now
  },

  {
    _id: amitId,
    businessId: businessId,

    name: "Amit Gupta",
    email: "amit@example.com",
    phone: "+91-9876500002",

    company: "Gupta Technologies",

    tags: [
      "new-lead"
    ],

    createdAt: now,
    updatedAt: now
  },

  {
    _id: nehaId,
    businessId: businessId,

    name: "Neha Singh",
    email: "neha@example.com",
    phone: "+91-9876500003",

    company: "Neha Interiors",

    tags: [
      "enquiry"
    ],

    createdAt: now,
    updatedAt: now
  }
]);


// ==========================================
// PRODUCTS
// ==========================================

db.products.insertMany([
  {
    _id: officeChairId,
    businessId: businessId,

    sku: "CHR-OFF-001",
    name: "Office Chair",

    description:
      "Ergonomic office chair with adjustable height and lumbar support.",

    price: 4500,
    stock: 80,

    category: "Chairs",

    isActive: true,

    createdAt: now,
    updatedAt: now
  },

  {
    _id: executiveChairId,
    businessId: businessId,

    sku: "CHR-EXE-001",
    name: "Executive Chair",

    description:
      "Premium executive chair for managers and cabins.",

    price: 8500,
    stock: 25,

    category: "Chairs",

    isActive: true,

    createdAt: now,
    updatedAt: now
  },

  {
    _id: officeTableId,
    businessId: businessId,

    sku: "TBL-OFF-001",
    name: "Office Table",

    description:
      "Standard workstation table suitable for offices.",

    price: 12000,
    stock: 15,

    category: "Tables",

    isActive: true,

    createdAt: now,
    updatedAt: now
  },

  {
    _id: meetingTableId,
    businessId: businessId,

    sku: "TBL-MTG-001",
    name: "Meeting Table",

    description:
      "Large meeting/conference table for office teams.",

    price: 25000,
    stock: 8,

    category: "Tables",

    isActive: true,

    createdAt: now,
    updatedAt: now
  }
]);


// ==========================================
// CONVERSATIONS
// ==========================================

db.conversations.insertMany([
  {
    _id: convRahulId,

    businessId: businessId,
    customerId: rahulId,

    channel: "manual",
    status: "open",

    subject: "Office chair requirement",

    lastMessageAt: now,

    createdAt: now,
    updatedAt: now
  },

  {
    _id: convAmitId,

    businessId: businessId,
    customerId: amitId,

    channel: "manual",
    status: "open",

    subject: "Office table enquiry",

    lastMessageAt: now,

    createdAt: now,
    updatedAt: now
  },

  {
    _id: convNehaId,

    businessId: businessId,
    customerId: nehaId,

    channel: "manual",
    status: "closed",

    subject: "Product price enquiry",

    lastMessageAt: now,

    createdAt: now,
    updatedAt: now
  }
]);


// ==========================================
// MESSAGES
// ==========================================

db.messages.insertMany([
  {
    _id: ObjectId("68c5a0000000000000000051"),

    conversationId: convRahulId,

    senderType: "customer",
    text:
      "Hi, I need 20 office chairs for my new office. Please send me the price.",
    channel: "manual",

    createdAt: now,
    updatedAt: now
  },

  {
    _id: ObjectId("68c5a0000000000000000052"),

    conversationId: convRahulId,

    senderType: "ai",
    text:
      "We have 20 office chairs available at ₹4,500 each. The estimated total is ₹90,000. Would you like us to prepare a quotation?",
    channel: "manual",

    createdAt: now,
    updatedAt: now
  },

  {
    _id: ObjectId("68c5a0000000000000000053"),

    conversationId: convAmitId,

    senderType: "customer",
    text:
      "I need 5 office tables. What is the price and availability?",
    channel: "manual",

    createdAt: now,
    updatedAt: now
  },

  {
    _id: ObjectId("68c5a0000000000000000054"),

    conversationId: convNehaId,

    senderType: "customer",
    text:
      "Can you tell me the price of an executive chair?",
    channel: "manual",

    createdAt: now,
    updatedAt: now
  }
]);


// ==========================================
// LEADS
// ==========================================

db.leads.insertMany([
  {
    _id: leadRahulId,

    businessId: businessId,
    customerId: rahulId,
    conversationId: convRahulId,

    intent: "purchase",

    productId: officeChairId,
    product: "Office Chair",

    quantity: 20,

    unitPrice: 4500,
    estimatedValue: 90000,

    priority: "high",

    status: "new",

    source: "manual",

    createdAt: now,
    updatedAt: now
  },

  {
    _id: leadAmitId,

    businessId: businessId,
    customerId: amitId,
    conversationId: convAmitId,

    intent: "purchase",

    productId: officeTableId,
    product: "Office Table",

    quantity: 5,

    unitPrice: 12000,
    estimatedValue: 60000,

    priority: "medium",

    status: "contacted",

    source: "manual",

    createdAt: now,
    updatedAt: now
  }
]);


// ==========================================
// INDEXES
// ==========================================

db.users.createIndex(
  { email: 1 },
  { unique: true }
);

db.customers.createIndex({
  businessId: 1,
  email: 1
});

db.products.createIndex({
  businessId: 1,
  name: 1
});

db.conversations.createIndex({
  businessId: 1,
  customerId: 1
});

db.messages.createIndex({
  conversationId: 1,
  createdAt: 1
});

db.leads.createIndex({
  businessId: 1,
  status: 1
});

db.leads.createIndex({
  businessId: 1,
  customerId: 1
});


// ==========================================
// RESULT
// ==========================================

print("==============================================");
print("AI Business Inbox seed completed successfully");
print("==============================================");

print("Database:       ai_business_inbox");
print("Businesses:     " + db.businesses.countDocuments());
print("Users:          " + db.users.countDocuments());
print("Customers:      " + db.customers.countDocuments());
print("Products:       " + db.products.countDocuments());
print("Conversations:  " + db.conversations.countDocuments());
print("Messages:       " + db.messages.countDocuments());
print("Leads:          " + db.leads.countDocuments());

print("==============================================");
print("Demo Business: ABC Furniture");
print("==============================================");

print("NOTE:");
print("Demo login: owner@abcfurniture.demo / LocalDev!b3059082");
print("Local-only credentials. Change password immediately if DB is shared.");