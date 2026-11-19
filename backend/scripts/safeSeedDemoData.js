/**
 * Safe ABC Furniture demo seed for an existing business.
 * - Does NOT delete users or existing unrelated data
 * - Upserts by stable keys to avoid duplicates
 *
 * Usage (non-production):
 *   MONGO_URI="..." OWNER_EMAIL="owner@devfurniture.demo" node scripts/safeSeedDemoData.js
 *
 * Production override (explicit):
 *   ALLOW_SEED=true NODE_ENV=production ... node scripts/safeSeedDemoData.js
 */
require("dotenv").config();

const mongoose = require("mongoose");

const OWNER_EMAIL = (
  process.env.OWNER_EMAIL || "owner@devfurniture.demo"
).toLowerCase();

const now = new Date();

function assertSeedAllowed() {
  if (
    process.env.NODE_ENV === "production" &&
    process.env.ALLOW_SEED !== "true"
  ) {
    throw new Error(
      "Refusing seed in production. Set ALLOW_SEED=true only if intentional."
    );
  }

  const uri = process.env.MONGO_URI || "";
  const looksRemote =
    /mongodb\.net|\.mongo\.|atlas|prod/i.test(uri);

  if (
    looksRemote &&
    process.env.ALLOW_SEED !== "true"
  ) {
    throw new Error(
      "Refusing seed against remote/Atlas URI. Set ALLOW_SEED=true to override."
    );
  }
}

async function main() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required");
  }

  assertSeedAllowed();

  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;

  const users = db.collection("users");
  const businesses = db.collection("businesses");
  const customers = db.collection("customers");
  const products = db.collection("products");
  const conversations = db.collection("conversations");
  const messages = db.collection("messages");
  const leads = db.collection("leads");

  const owner = await users.findOne({ email: OWNER_EMAIL });

  if (!owner) {
    throw new Error(`Owner user not found: ${OWNER_EMAIL}`);
  }

  if (!owner.businessId) {
    throw new Error(`Owner has no businessId: ${OWNER_EMAIL}`);
  }

  const businessId = owner.businessId;

  await businesses.updateOne(
    { _id: businessId },
    {
      $set: {
        name: "ABC Furniture",
        industry: "Furniture",
        phone: "+91-9000000000",
        settings: {
          currency: "INR",
          aiEnabled: true,
          autoReplyEnabled: false,
          maxAutoDiscountPercent: 10,
        },
        updatedAt: now,
      },
    }
  );

  const customerDefs = [
    {
      key: "rahul@example.com",
      doc: {
        businessId,
        name: "Rahul Sharma",
        email: "rahul@example.com",
        phone: "+91-9876500001",
        notes: "Rahul Office Solutions",
      },
    },
    {
      key: "amit@example.com",
      doc: {
        businessId,
        name: "Amit Gupta",
        email: "amit@example.com",
        phone: "+91-9876500002",
        notes: "Gupta Technologies",
      },
    },
    {
      key: "neha@example.com",
      doc: {
        businessId,
        name: "Neha Singh",
        email: "neha@example.com",
        phone: "+91-9876500003",
        notes: "Neha Interiors",
      },
    },
  ];

  const customerIds = {};

  for (const item of customerDefs) {
    const existing = await customers.findOne({
      businessId,
      email: item.key,
    });

    if (existing) {
      await customers.updateOne(
        { _id: existing._id },
        { $set: { ...item.doc, updatedAt: now } }
      );
      customerIds[item.key] = existing._id;
    } else {
      const inserted = await customers.insertOne({
        ...item.doc,
        createdAt: now,
        updatedAt: now,
      });
      customerIds[item.key] = inserted.insertedId;
    }
  }

  const productDefs = [
    {
      sku: "CHR-OFF-001",
      doc: {
        businessId,
        sku: "CHR-OFF-001",
        name: "Office Chair",
        description:
          "Ergonomic office chair with adjustable height and lumbar support.",
        price: 4500,
        stock: 80,
        category: "Chairs",
        isActive: true,
      },
    },
    {
      sku: "CHR-EXE-001",
      doc: {
        businessId,
        sku: "CHR-EXE-001",
        name: "Executive Chair",
        description: "Premium executive chair for managers and cabins.",
        price: 8500,
        stock: 25,
        category: "Chairs",
        isActive: true,
      },
    },
    {
      sku: "TBL-OFF-001",
      doc: {
        businessId,
        sku: "TBL-OFF-001",
        name: "Office Table",
        description: "Standard workstation table suitable for offices.",
        price: 12000,
        stock: 15,
        category: "Tables",
        isActive: true,
      },
    },
    {
      sku: "TBL-MTG-001",
      doc: {
        businessId,
        sku: "TBL-MTG-001",
        name: "Meeting Table",
        description: "Large meeting/conference table for office teams.",
        price: 25000,
        stock: 8,
        category: "Tables",
        isActive: true,
      },
    },
  ];

  const productIds = {};

  for (const item of productDefs) {
    const existing = await products.findOne({
      businessId,
      sku: item.sku,
    });

    if (existing) {
      await products.updateOne(
        { _id: existing._id },
        { $set: { ...item.doc, updatedAt: now } }
      );
      productIds[item.sku] = existing._id;
    } else {
      const inserted = await products.insertOne({
        ...item.doc,
        createdAt: now,
        updatedAt: now,
      });
      productIds[item.sku] = inserted.insertedId;
    }
  }

  const conversationDefs = [
    {
      email: "rahul@example.com",
      channel: "manual",
      status: "open",
      subject: "Office chair requirement",
      messageText:
        "Hi, I need 20 office chairs for my new office. Please send me the price.",
      lead: {
        productSku: "CHR-OFF-001",
        quantity: 20,
        intent: "purchase",
        priority: "high",
        status: "new",
      },
    },
    {
      email: "amit@example.com",
      channel: "manual",
      status: "open",
      subject: "Office table enquiry",
      messageText:
        "I need 5 office tables. What is the price and availability?",
      lead: {
        productSku: "TBL-OFF-001",
        quantity: 5,
        intent: "purchase",
        priority: "medium",
        status: "new",
      },
    },
    {
      email: "neha@example.com",
      channel: "manual",
      status: "closed",
      subject: "Product price enquiry",
      messageText: "Can you tell me the price of an executive chair?",
      lead: null,
    },
  ];

  let conversationsUpserted = 0;
  let messagesUpserted = 0;
  let leadsUpserted = 0;

  for (const item of conversationDefs) {
    const customerId = customerIds[item.email];

    let conversation = await conversations.findOne({
      businessId,
      customerId,
      channel: item.channel,
    });

    if (conversation) {
      await conversations.updateOne(
        { _id: conversation._id },
        {
          $set: {
            status: item.status,
            subject: item.subject,
            updatedAt: now,
          },
        }
      );
    } else {
      const inserted = await conversations.insertOne({
        businessId,
        customerId,
        channel: item.channel,
        status: item.status,
        subject: item.subject,
        createdAt: now,
        updatedAt: now,
      });
      conversation = { _id: inserted.insertedId };
      conversationsUpserted += 1;
    }

    const existingCustomerMessage = await messages.findOne({
      conversationId: conversation._id,
      senderType: "customer",
      text: item.messageText,
    });

    if (!existingCustomerMessage) {
      await messages.insertOne({
        conversationId: conversation._id,
        senderType: "customer",
        text: item.messageText,
        channel: item.channel,
        createdAt: now,
        updatedAt: now,
      });
      messagesUpserted += 1;
    }

    if (item.lead) {
      const productId = productIds[item.lead.productSku];
      const existingLead = await leads.findOne({
        businessId,
        customerId,
        productId,
        quantity: item.lead.quantity,
        status: item.lead.status,
      });

      if (!existingLead) {
        await leads.insertOne({
          businessId,
          customerId,
          productId,
          quantity: item.lead.quantity,
          intent: item.lead.intent,
          priority: item.lead.priority,
          status: item.lead.status,
          createdAt: now,
          updatedAt: now,
        });
        leadsUpserted += 1;
      }
    }
  }

  const summary = {
    ownerEmail: OWNER_EMAIL,
    businessId: String(businessId),
    customers: await customers.countDocuments({ businessId }),
    products: await products.countDocuments({ businessId }),
    conversations: await conversations.countDocuments({ businessId }),
    messages: await messages.countDocuments({
      conversationId: {
        $in: (
          await conversations
            .find({ businessId })
            .project({ _id: 1 })
            .toArray()
        ).map((c) => c._id),
      },
    }),
    leads: await leads.countDocuments({ businessId }),
    newlyInserted: {
      conversations: conversationsUpserted,
      messages: messagesUpserted,
      leads: leadsUpserted,
    },
  };

  console.log("Safe demo seed complete");
  console.log(JSON.stringify(summary, null, 2));

  await mongoose.disconnect();
}

main().catch((error) => {
  console.error("Safe seed failed:", error.message);
  process.exit(1);
});
