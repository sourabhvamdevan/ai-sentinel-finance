

### Langchain_Setup.md

This document outlines the configuration and integration steps for the LangChain service within the AI Finance Platform.

---

## 1. Package Installation

Install the required dependencies to enable LangChain and Google Generative AI integration.

```bash
npm install langchain @langchain/google-genai @langchain/core

```

---

## 2. Environment Variables

Update the `.env` file in the root directory with your Gemini API credentials.

```env
GEMINI_API_KEY=your_gemini_api_key_here

```

---

## 3. Service Initialization

Create a file at `lib/langchain.js` to manage the AI logic and chain definitions.

```javascript
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

// Initialize Gemini 1.5 Flash
const model = new ChatGoogleGenerativeAI({
  modelName: "gemini-2.5-flash",
  apiKey: process.env.GEMINI_API_KEY,
  temperature: 0.2,
});

/**
 * Processes transaction data to generate financial insights.
 * @param {Array} userTransactions - Serialized transaction objects.
 * @param {Object} context - Additional metadata like budget limits.
 */
export async function getFinancialAdvice(userTransactions, context) {
  const prompt = PromptTemplate.fromTemplate(`
    Role: Professional Financial Advisor
    Context: {context}
    Data: {transactions}
    
    Task: Analyze the transaction history and provide three specific, 
    data-driven recommendations to improve the user's financial health.
    Output: Professional, concise, and fact-based responses.
  `);

  const chain = prompt.pipe(model).pipe(new StringOutputParser());

  try {
    return await chain.invoke({
      transactions: JSON.stringify(userTransactions),
      context: JSON.stringify(context),
    });
  } catch (error) {
    console.error("LangChain Execution Error:", error);
    return "Error: Unable to generate AI insights.";
  }
}

```

---

## 4. Architectural Integration

The LangChain service is positioned within the **Domain Actions** layer of the system architecture.

* **Trigger**: Invoked via the `generateInsights` Server Action in `actions/dashboard.js`.
* **Data Flow**: Retrieves data from the **Prisma Persistence Layer**, processes it via LangChain, and returns structured text to the **Dashboard Workspace**.
* **Security**: Rate limiting is enforced at the **Edge Gate** via **ArcJet** to manage API consumption.

---

## 5. Deployment Considerations

The multi-stage **Dockerfile** will automatically include these dependencies during the `npm ci` phase. Ensure the `GEMINI_API_KEY` is provided as an environment variable in your production container environment.