// =============openai service=============
/*

const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const analyzeMessage = async (message) => {
  try {
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.6-luna",

      input: [
        {
          role: "system",
          content: `
You are an AI assistant for a business inbox.

Analyze the customer's message and return ONLY valid JSON.

The JSON must contain exactly these fields:

{
  "intent": "purchase | enquiry | support | complaint | other",
  "product": "string or null",
  "quantity": "number or null",
  "priority": "low | medium | high",
  "needsHuman": "boolean"
}

Rules:

- intent should represent the customer's main intention.
- product should contain the requested product if identifiable.
- quantity should contain the requested quantity if identifiable.
- priority should be high when the customer shows strong purchase intent,
  urgency, large quantity, complaint or important issue.
- needsHuman should be true when the request requires human intervention.
- Do not invent information.
- If information is unavailable, use null.
- Return JSON only.
          `,
        },

        {
          role: "user",
          content: message,
        },
      ],
    });

    const rawOutput = response.output_text;

    if (!rawOutput) {
      throw new Error(
        "OpenAI returned empty response"
      );
    }

    // Parse JSON
    let parsed;

    try {
      parsed = JSON.parse(rawOutput);
    } catch (error) {
      console.error(
        "AI JSON parse error:",
        rawOutput
      );

      throw new Error(
        "AI returned invalid JSON"
      );
    }

    // Validate
    const validIntents = [
      "purchase",
      "enquiry",
      "support",
      "complaint",
      "other",
    ];

    const validPriorities = [
      "low",
      "medium",
      "high",
    ];

    if (
      !validIntents.includes(parsed.intent)
    ) {
      throw new Error(
        "Invalid AI intent"
      );
    }

    if (
      !validPriorities.includes(
        parsed.priority
      )
    ) {
      throw new Error(
        "Invalid AI priority"
      );
    }

    if (
      typeof parsed.needsHuman !==
      "boolean"
    ) {
      throw new Error(
        "Invalid needsHuman value"
      );
    }

    if (
      parsed.quantity !== null &&
      (
        typeof parsed.quantity !== "number" ||
        parsed.quantity < 1
      )
    ) {
      throw new Error(
        "Invalid quantity"
      );
    }

    return {
      intent: parsed.intent,
      product: parsed.product || null,
      quantity: parsed.quantity || null,
      priority: parsed.priority,
      needsHuman: parsed.needsHuman,
    };

  } catch (error) {

    console.error(
      "AI service error:",
      error.message
    );

    throw error;
  }
};

module.exports = {
  analyzeMessage,
};
*/

// =============openrouter service=============
const OpenAI = require("openai");

const {
  getProduct,
  createLead,
} = require("./tool.service");

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,

  baseURL: "https://openrouter.ai/api/v1",
});

const analyzeMessage = async (message) => {
  try {
    const response = await client.chat.completions.create({
      model:
        process.env.OPENROUTER_MODEL ||
        "openrouter/free",

      messages: [
        {
          role: "system",

          content: `
            You are an AI assistant for a business inbox.

            Analyze the customer's message.

            Return ONLY valid JSON.

            The JSON must contain exactly these fields:

            {
              "intent": "purchase | enquiry | support | complaint | other",
              "product": "string or null",
              "quantity": "number or null",
              "priority": "low | medium | high",
              "needsHuman": "boolean"
            }

            Rules:

            - intent = customer's main intention.
            - product = requested product if identifiable.
            - quantity = requested quantity if identifiable.
            - priority = high for strong purchase intent,
              urgency, large quantity, complaint or important issue.
            - needsHuman = true if human intervention is required.
            - Do not invent information.
            - Use null when information is unavailable.
            - Return JSON only.
          `,
        },

        {
          role: "user",
          content: message,
        },
      ],

      temperature: 0,
    });

    const rawOutput =
      response.choices?.[0]?.message?.content;

    if (!rawOutput) {
      throw new Error(
        "AI returned empty response"
      );
    }

    console.log(
      "AI Raw Response:",
      rawOutput
    );

    // =========================
    // PARSE JSON
    // =========================

    let parsed;

    try {
      const cleaned = rawOutput
        .replace(/```json\s*/gi, "")
        .replace(/```/g, "")
        .trim();

      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);

      parsed = JSON.parse(
        jsonMatch ? jsonMatch[0] : cleaned
      );
    } catch (error) {
      console.error(
        "AI JSON parse error:",
        rawOutput
      );

      throw new Error(
        "AI returned invalid JSON"
      );
    }

    // =========================
    // VALIDATE
    // =========================

    const validIntents = [
      "purchase",
      "enquiry",
      "support",
      "complaint",
      "other",
    ];

    const validPriorities = [
      "low",
      "medium",
      "high",
    ];

    if (
      !validIntents.includes(parsed.intent)
    ) {
      throw new Error(
        "Invalid AI intent"
      );
    }

    if (
      !validPriorities.includes(
        parsed.priority
      )
    ) {
      throw new Error(
        "Invalid AI priority"
      );
    }

    if (
      typeof parsed.needsHuman !==
      "boolean"
    ) {
      throw new Error(
        "Invalid needsHuman value"
      );
    }

    if (
      parsed.quantity !== null &&
      (
        typeof parsed.quantity !== "number" ||
        parsed.quantity < 1
      )
    ) {
      throw new Error(
        "Invalid quantity"
      );
    }

    // =========================
    // RETURN CLEAN DATA
    // =========================

    return {
      intent: parsed.intent,

      product:
        parsed.product || null,

      quantity:
        parsed.quantity || null,

      priority:
        parsed.priority,

      needsHuman:
        parsed.needsHuman,
    };

  } catch (error) {

    console.error(
      "AI service error:",
      error.message
    );

    throw error;
  }
};

const tools = [
  {
    type: "function",
  
    function: {
      name: "getProduct",
  
      description:
        "Find a product in the business inventory, check available stock and calculate the total price.",
  
      parameters: {
        type: "object",
  
        properties: {
          productName: {
            type: "string",
            description: "Product name requested by the customer",
          },
  
          quantity: {
            type: "number",
            description: "Quantity requested by the customer",
          },
        },
  
        required: ["productName", "quantity"],
      },
    },
  },

  {
    type: "function",
  
    function: {
      name: "createLead",
  
      description:
        "Create a sales lead when the customer has genuine purchase intent and the requested product is available.",
  
      parameters: {
        type: "object",
  
        properties: {
          productId: {
            type: "string",
          },
  
          quantity: {
            type: "number",
          },
  
          intent: {
            type: "string",
            enum: [
              "purchase",
              "enquiry",
              "support",
              "complaint",
              "other",
            ],
          },
  
          priority: {
            type: "string",
            enum: [
              "low",
              "medium",
              "high",
            ],
          },
        },
  
        required: [
          "productId",
          "quantity",
          "intent",
          "priority",
        ],
      },
    },
  },
];

const processCustomerMessage = async ({
  message,
  customerId,
  businessId,
}) => {
  try {
    if (!message || typeof message !== "string") {
      throw new Error("Customer message is required");
    }

    if (!customerId) {
      throw new Error("Customer ID is required");
    }

    if (!businessId) {
      throw new Error("Business ID is required");
    }

    const messages = [
      {
        role: "system",
        content: `
You are an AI assistant for a business inbox.

Your job is to understand customer messages and take appropriate business actions.

Rules:

1. Identify customer intent.
2. If customer wants to purchase a product, identify product and quantity.
3. Use getProduct to check product availability, stock and price.
4. Never invent product, price or stock information.
5. If requested quantity is available, create a lead using createLead.
6. Never create a lead if the requested quantity is greater than available stock.
7. After tools are executed, generate a concise and professional customer response.
8. Mention price and estimated total when product and quantity are available.
9. Do not expose internal tool names or technical details to the customer.

Example:

Customer:
"I need 20 office chairs."

If product:
Office Chair
Price: 4500
Stock: 80

Response:
"We have 20 Office Chairs available at ₹4,500 each. The estimated total is ₹90,000. Would you like us to prepare a quotation?"
        `,
      },

      {
        role: "user",
        content: message,
      },
    ];

    const toolsUsed = [];
    const MAX_TOOL_ROUNDS = 5;
    let toolRounds = 0;

    // ========================================
    // FIRST AI CALL
    // ========================================

    let response = await client.chat.completions.create({
      model:
        process.env.OPENROUTER_MODEL ||
        "openrouter/free",

      messages,

      tools,

      tool_choice: "auto",

      temperature: 0,
    });

    let assistantMessage = response.choices?.[0]?.message;

    if (!assistantMessage) {
      throw new Error("AI returned empty response");
    }

    // ========================================
    // TOOL CALL LOOP
    // ========================================

    while (
      assistantMessage.tool_calls &&
      assistantMessage.tool_calls.length > 0
    ) {
      toolRounds += 1;

      if (toolRounds > MAX_TOOL_ROUNDS) {
        throw new Error(
          "AI tool loop exceeded maximum allowed rounds"
        );
      }
      // IMPORTANT:
      // Assistant ka complete message push karo

      messages.push({
        role: "assistant",

        content:
          typeof assistantMessage.content === "string"
            ? assistantMessage.content
            : null,

        tool_calls: assistantMessage.tool_calls,
      });

      for (const toolCall of assistantMessage.tool_calls) {
        const toolName =
          toolCall.function?.name;

        const rawArguments =
          toolCall.function?.arguments || "{}";

        let args;

        try {
          args = JSON.parse(rawArguments);
        } catch (error) {
          throw new Error(
            `Invalid arguments for tool ${toolName}`
          );
        }

        let result;

        try {
          // ========================================
          // GET PRODUCT
          // ========================================

          if (toolName === "getProduct") {
            result = await getProduct({
              productName: args.productName,
              quantity: args.quantity,
              businessId,
            });
          }

          // ========================================
          // CREATE LEAD
          // ========================================

          else if (toolName === "createLead") {
            result = await createLead({
              customerId,

              productId:
                args.productId,

              quantity:
                args.quantity,

              intent:
                args.intent,

              priority:
                args.priority,

              businessId,
            });
          }

          // ========================================
          // UNKNOWN TOOL
          // ========================================

          else {
            result = {
              success: false,
              error: `Unknown tool: ${toolName}`,
            };
          }
        } catch (toolError) {
          result = {
            success: false,
            error:
              toolError.message ||
              "Tool execution failed",
          };
        }

        // ========================================
        // SAVE TOOL USAGE
        // ========================================

        toolsUsed.push({
          tool: toolName,
          arguments: args,
          result,
        });

        // ========================================
        // SEND TOOL RESULT BACK TO AI
        // ========================================

        messages.push({
          role: "tool",

          tool_call_id:
            toolCall.id,

          content: JSON.stringify(
            result || {
              success: false,
              error: "Tool returned no result",
            }
          ),
        });
      }

      // ========================================
      // SECOND / NEXT AI CALL
      // ========================================

      response = await client.chat.completions.create({
        model:
          process.env.OPENROUTER_MODEL ||
          "openrouter/free",

        messages,

        tools,

        tool_choice: "auto",

        temperature: 0,
      });

      assistantMessage =
        response.choices?.[0]?.message;

      if (!assistantMessage) {
        throw new Error(
          "AI returned empty response after tool execution"
        );
      }
    }

    // ========================================
    // FINAL AI RESPONSE
    // ========================================

    const reply =
      typeof assistantMessage.content === "string"
        ? assistantMessage.content
        : "I was unable to generate a response.";

    return {
      reply,
      toolsUsed,
    };

  } catch (error) {
    console.error(
      "AI agent error:",
      error
    );

    throw error;
  }
};

module.exports = {
  analyzeMessage,
  processCustomerMessage,
};