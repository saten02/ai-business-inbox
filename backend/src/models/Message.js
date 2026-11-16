const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },

    senderType: {
      type: String,
      enum: ["customer", "user", "ai"],
      required: true,
    },

    text: {
      type: String,
      required: true,
      trim: true,
    },

    channel: {
      type: String,
      enum: [
        "manual",
        "whatsapp",
        "email",
        "website",
        "instagram",
      ],
      default: "manual",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Message", messageSchema);