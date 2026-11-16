import { useEffect, useState } from "react";
import api from "../services/api";

function Inbox() {
  const [conversations, setConversations] =
    useState([]);

  const [selectedConversation, setSelectedConversation] =
    useState(null);

  const [aiAnalysis, setAiAnalysis] =
  useState(null);

  const [aiLoading, setAiLoading] =
  useState(false);

  const [aiProcessLoading, setAiProcessLoading] =
    useState(false);

  const [aiResult, setAiResult] = useState(null);

  const [messages, setMessages] = useState([]);

  const [loading, setLoading] = useState(true);

  const [messageText, setMessageText] =
    useState("");

  const [error, setError] = useState("");

  // =====================================
  // LOAD CONVERSATIONS
  // =====================================

  const fetchConversations = async () => {
    try {
      const response = await api.get(
        "/conversations"
      );

      setConversations(
        response.data.conversations
      );

    } catch (error) {
      console.error(
        "Failed to load conversations:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // LOAD SINGLE CONVERSATION
  // =====================================

  const openConversation = async (id) => {
    try {
      const response = await api.get(
        `/conversations/${id}`
      );

      setSelectedConversation(
        response.data.conversation
      );

      setMessages(
        response.data.messages
      );

    } catch (error) {
      console.error(
        "Failed to load conversation:",
        error
      );
    }
  };

  // =====================================
  // ANALYZE CONVERSATION WITH AI
  // =====================================

  const analyzeWithAI = async () => {
    if (!selectedConversation) {
      return;
    }
  
    try {
      setAiLoading(true);
      setAiAnalysis(null);
      setError("");
  
      const response = await api.post(
        `/conversations/${selectedConversation._id}/analyze`
      );
  
      setAiAnalysis(
        response.data.analysis
      );
  
    } catch (error) {
  
      console.error(
        "AI analysis failed:",
        error
      );

      setError(
        error.response?.data?.message ||
          "AI analysis failed"
      );
  
    } finally {
      setAiLoading(false);
    }
  };

  // =====================================
  // SEND MESSAGE
  // =====================================

  const sendMessage = async () => {
    if (!messageText.trim()) {
      return;
    }

    try {
      setError("");

      // Inbox entry simulates a customer enquiry for the AI workflow
      const response = await api.post(
        `/conversations/${selectedConversation._id}/messages`,
        {
          text: messageText,
          senderType: "customer",
        }
      );

      setMessages((prev) => [
        ...prev,
        response.data.data,
      ]);

      setMessageText("");

      fetchConversations();

    } catch (error) {
      console.error(
        "Failed to send message:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to send message"
      );
    }
  };

  // =====================================
  // FULL AI WORKFLOW
  // =====================================

  const processWithAI = async () => {
    if (!selectedConversation) {
      return;
    }

    try {
      setAiProcessLoading(true);
      setAiResult(null);
      setError("");

      const response = await api.post(
        `/conversations/${selectedConversation._id}/ai-process`
      );

      setAiResult({
        reply: response.data.reply,
        toolsUsed: response.data.toolsUsed || [],
      });

      await openConversation(selectedConversation._id);
      fetchConversations();

    } catch (error) {
      console.error(
        "AI process failed:",
        error
      );

      setError(
        error.response?.data?.message ||
          "AI processing failed"
      );
    } finally {
      setAiProcessLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  if (loading) {
    return <h2>Loading inbox...</h2>;
  }

  return (
    <div className="inbox">

      {/* LEFT SIDE */}

      <div className="conversation-list">

        <div className="inbox-header">
          <h2>Conversations</h2>
        </div>

        {conversations.length === 0 ? (

          <p className="empty-text">
            No conversations yet.
          </p>

        ) : (

          conversations.map(
            (conversation) => (

              <div
                key={conversation._id}
                className={`conversation-preview ${
                  selectedConversation?._id ===
                  conversation._id
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  openConversation(
                    conversation._id
                  )
                }
              >

                <strong>
                  {
                    conversation.customerId
                      ?.name
                  }
                </strong>

                <p>
                  {conversation.channel}
                </p>

              </div>
            )
          )
        )}

      </div>

      {/* RIGHT SIDE */}

      <div className="chat-area">

        {!selectedConversation ? (

          <div className="empty-chat">
            <h2>
              Select a conversation
            </h2>

            <p>
              Choose a customer from the
              left side.
            </p>
          </div>

        ) : (

          <>

            {/* Chat Header */}

            <div className="chat-header">

              <div>
                <h2>
                  {
                    selectedConversation
                      .customerId?.name
                  }
                </h2>

                <p>
                  {
                    selectedConversation
                      .customerId?.email
                  }
                </p>
              </div>

              <span>
                {
                  selectedConversation.channel
                }
              </span>

            </div>

            {/* Messages */}

            <div className="messages">

              {messages.map((message) => (

                <div
                  key={message._id}
                  className={`message ${
                    message.senderType
                  }`}
                >

                  <div className="message-bubble">

                    <small>
                      {message.senderType}
                    </small>

                    <p>
                      {message.text}
                    </p>

                  </div>

                </div>

              ))}

            </div>

            {/* Input */}

            <div className="message-input">

              <input
                type="text"
                placeholder="Type a message..."
                value={messageText}
                onChange={(e) =>
                  setMessageText(
                    e.target.value
                  )
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendMessage();
                  }
                }}
              />

              <button
                onClick={sendMessage}
              >
                Send
              </button>

            </div>

            {error && (
              <div className="error">
                {error}
              </div>
            )}

            {/* AI Buttons */}

            <div className="ai-actions">
              <button
                className="ai-button"
                onClick={analyzeWithAI}
                disabled={aiLoading || aiProcessLoading}
              >
                {aiLoading ? "Analyzing..." : "Analyze with AI"}
              </button>

              <button
                className="ai-button"
                onClick={processWithAI}
                disabled={aiLoading || aiProcessLoading}
              >
                {aiProcessLoading
                  ? "Processing..."
                  : "Process with AI"}
              </button>
            </div>

            {aiAnalysis && (
              <div className="ai-analysis">

                <h3>AI Analysis</h3>

                <p>
                  <strong>Intent:</strong>{" "}
                  {aiAnalysis.intent}
                </p>

                <p>
                  <strong>Product:</strong>{" "}
                  {aiAnalysis.product || "N/A"}
                </p>

                <p>
                  <strong>Quantity:</strong>{" "}
                  {aiAnalysis.quantity || "N/A"}
                </p>

                <p>
                  <strong>Priority:</strong>{" "}
                  {aiAnalysis.priority}
                </p>

                <p>
                  <strong>Needs Human:</strong>{" "}
                  {aiAnalysis.needsHuman
                    ? "Yes"
                    : "No"}
                </p>

              </div>
            )}

            {aiResult && (
              <div className="ai-analysis">
                <h3>AI Response</h3>
                <p>{aiResult.reply}</p>

                {aiResult.toolsUsed.length > 0 && (
                  <p>
                    <strong>Tools used:</strong>{" "}
                    {aiResult.toolsUsed
                      .map((item) => item.tool)
                      .join(", ")}
                  </p>
                )}
              </div>
            )}

          </>

        )}

      </div>

    </div>
  );
}

export default Inbox;