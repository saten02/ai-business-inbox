require("dotenv").config();

const mongoose = require("mongoose");

const Business = require("../models/Business");
const Customer = require("../models/Customer");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

const assertSeedAllowed = () => {
  if (
    process.env.NODE_ENV === "production" &&
    process.env.ALLOW_SEED !== "true"
  ) {
    throw new Error(
      "Refusing seedInbox in production. Set ALLOW_SEED=true only if intentional."
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
      "Refusing seedInbox against remote/Atlas URI. Set ALLOW_SEED=true to override."
    );
  }
};

const seedInbox = async () => {
  try {
    assertSeedAllowed();

    await mongoose.connect(
      process.env.MONGO_URI
    );

    console.log("MongoDB connected");

    const business =
      await Business.findOne();

    if (!business) {
      throw new Error(
        "Business not found"
      );
    }

    const customer =
      await Customer.create({
        name: "Rahul Sharma",
        email: "rahul@gmail.com",
        phone: "9876543210",
        businessId: business._id,
      });

    const conversation =
      await Conversation.create({
        customerId: customer._id,
        businessId: business._id,
        channel: "manual",
        status: "open",
      });

    await Message.create([
      {
        conversationId:
          conversation._id,
        senderType: "customer",
        text: "I need 20 office chairs",
        channel: "manual",
      },
      {
        conversationId:
          conversation._id,
        senderType: "user",
        text: "Sure, I can help you with that.",
        channel: "manual",
      },
    ]);

    console.log(
      "Inbox seed data created"
    );

    console.log(
      "Conversation ID:",
      conversation._id.toString()
    );

    process.exit(0);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedInbox();