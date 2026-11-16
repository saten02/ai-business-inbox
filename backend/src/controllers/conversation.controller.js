const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const {
    analyzeMessage,
  } = require("../services/ai.service");
const {
  processCustomerMessage,
} = require("../services/ai.service");

// ========================================
// GET ALL CONVERSATIONS
// ========================================

const getConversations = async (req, res) => {
  try {
    const businessId = req.user.businessId;

    if (!businessId) {
      return res.status(400).json({
        success: false,
        message: "User is not associated with a business",
      });
    }

    const conversations = await Conversation.find({
      businessId,
    })
      .populate(
        "customerId",
        "name email phone"
      )
      .sort({
        updatedAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: conversations.length,
      conversations,
    });

  } catch (error) {
    console.error(
      "Get conversations error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ========================================
// GET CONVERSATION BY ID
// ========================================

const getConversationById = async (req, res) => {
  try {
    const { id } = req.params;
    const businessId = req.user.businessId;

    const conversation =
      await Conversation.findOne({
        _id: id,
        businessId,
      }).populate(
        "customerId",
        "name email phone"
      );

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const messages = await Message.find({
      conversationId: conversation._id,
    }).sort({
      createdAt: 1,
    });

    return res.status(200).json({
      success: true,
      conversation,
      messages,
    });

  } catch (error) {
    console.error(
      "Get conversation error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ========================================
// SEND MESSAGE
// ========================================

const sendMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, senderType = "user" } =
      req.body;

    const businessId = req.user.businessId;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Message text is required",
      });
    }

    const conversation =
      await Conversation.findOne({
        _id: id,
        businessId,
      });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const message = await Message.create({
      conversationId: conversation._id,
      senderType,
      text,
      channel: conversation.channel,
    });

    // Update conversation timestamp
    conversation.updatedAt = new Date();

    await conversation.save();

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: message,
    });

  } catch (error) {
    console.error(
      "Send message error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ========================================
// ANALYZE CONVERSATION WITH AI
// ========================================

const analyzeConversation = async (req, res) => {
    try {
      const { id } = req.params;
      const businessId = req.user.businessId;
  
      const conversation =
        await Conversation.findOne({
          _id: id,
          businessId,
        });
  
      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: "Conversation not found",
        });
      }
  
      // Get latest customer message
      const latestMessage =
        await Message.findOne({
          conversationId: conversation._id,
          senderType: "customer",
        }).sort({
          createdAt: -1,
        });
  
      if (!latestMessage) {
        return res.status(400).json({
          success: false,
          message:
            "No customer message available for analysis",
        });
      }
  
      // AI analysis
      const analysis =
        await analyzeMessage(
          latestMessage.text
        );
  
      return res.status(200).json({
        success: true,
        message: "Message analyzed successfully",
        analysis,
      });
  
    } catch (error) {
  
      console.error(
        "Analyze conversation error:",
        error
      );
  
      return res.status(500).json({
        success: false,
        message:
          "AI analysis failed",
      });
    }
};


// ========================================
// AI PROCESS MESSAGE
// ========================================

const processMessageWithAI = async (req, res) => {
  try {
    const { id } = req.params;

    const businessId = req.user.businessId;

    const conversation = await Conversation.findOne({
      _id: id,
      businessId,
    }).populate(
      "customerId",
      "name email phone"
    );

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    // ========================================
    // Latest customer message
    // ========================================

    const latestMessage = await Message.findOne({
      conversationId: conversation._id,
      senderType: "customer",
    }).sort({
      createdAt: -1,
    });

    if (!latestMessage) {
      return res.status(400).json({
        success: false,
        message: "No customer message found",
      });
    }

    // ========================================
    // AI AGENT
    // ========================================

    const result = await processCustomerMessage({
      message: latestMessage.text,

      customerId:
        conversation.customerId._id,

      businessId,
    });

    // ========================================
    // SAVE AI RESPONSE AS MESSAGE
    // ========================================

    const aiMessage = await Message.create({
      conversationId: conversation._id,

      senderType: "ai",

      text: result.reply,

      channel: conversation.channel,
    });

    // ========================================
    // UPDATE CONVERSATION
    // ========================================

    conversation.updatedAt = new Date();

    await conversation.save();

    // ========================================
    // RESPONSE
    // ========================================

    return res.status(200).json({
      success: true,

      reply: result.reply,

      messageId: aiMessage._id,

      toolsUsed: result.toolsUsed,
    });

  } catch (error) {
    console.error(
      "AI process error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "AI processing failed",
    });
  }
};


module.exports = {
  getConversations,
  getConversationById,
  sendMessage,
  analyzeConversation,
  processMessageWithAI,
  
};