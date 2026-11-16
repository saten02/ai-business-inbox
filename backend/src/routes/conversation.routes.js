const express = require("express");

const {
  getConversations,
  getConversationById,
  sendMessage,
  analyzeConversation,
  processMessageWithAI,
} = require(
  "../controllers/conversation.controller"
);

const authMiddleware = require(
  "../middleware/auth.middleware"
);

const router = express.Router();

// All conversation APIs protected
router.use(authMiddleware);

router.get("/", getConversations);

router.get("/:id", getConversationById);

router.post("/:id/messages", sendMessage);

router.post("/:id/analyze", analyzeConversation);

router.post("/:id/ai-process", processMessageWithAI);

module.exports = router;