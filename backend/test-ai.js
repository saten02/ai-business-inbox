require("dotenv").config();

const {
  analyzeMessage,
} = require("./src/services/ai.service");

const test = async () => {
  try {

    const result =
      await analyzeMessage(
        "I need 20 office chairs for my new office."
      );

    console.log(
      "AI RESULT:"
    );

    console.log(result);

  } catch (error) {

    console.error(
      "Test failed:",
      error.message
    );

  }
};

test();