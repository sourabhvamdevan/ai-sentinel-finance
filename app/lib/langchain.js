// import {OpenAI} from "langchain/llms/openai";
// import {PromptTemplate} from "langchain/prompts";
// import {StringOutputParser} from "langchain/output_parsers/string";
// const model = new OpenAI({
//   modelName: "gpt-3.5-turbo",
//   temperature: 0.2,
// });
// export async function getFinancialAdvice(userTransactions, context) {
//   try {
//     // Attempt AI Generation
//     const prompt = PromptTemplate.fromTemplate(`
//       Role: Professional Financial Advisor
//       Context: {context}
//       Data: {transactions}
//       Task: Provide three data-driven recommendations.
//     `);

//     const chain = prompt.pipe(model).pipe(new StringOutputParser());

//     return await chain.invoke({
//       transactions: JSON.stringify(userTransactions),
//       context: JSON.stringify(context),
//     });
//   } catch (error) {
//     console.error("AI Service Failure, using fallback template:", error);
    
//     // Return the Static Fallback Template
//     return getFallbackInsights(userTransactions);
//   }
// }

// /**
//  * Static Fallback Template Logic
//  * Provides basic insights based on hardcoded rules if AI is offline.
//  */
// function getFallbackInsights(transactions) {
//   if (!transactions || transactions.length === 0) {
//     return "Insight: No transaction data available to analyze. Start by adding your first expense.";
//   }

//   const totalSpent = transactions
//     .filter(t => t.type === "EXPENSE")
//     .reduce((sum, t) => sum + t.amount, 0);

//   return `
//     [System Note: AI Insights currently unavailable. Showing automated summary.]
    
//     1. Spending Overview: You have recorded ${transactions.length} transactions recently.
//     2. Budget Alert: Your total expenses for this period are ${totalSpent.toFixed(2)}.
//     3. Action Item: Review your high-value transactions to ensure they align with your goals.
//   `;
// }



import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

// Initialize Gemini 1.5 Flash
const model = new ChatGoogleGenerativeAI({
  modelName: "gemini-2.5-flash",
  apiKey: process.env.GEMINI_API_KEY,
  temperature: 0.2,
});

export async function getFinancialAdvice(userTransactions, context) {
  try {
    const prompt = PromptTemplate.fromTemplate(`
      Role: Professional Financial Advisor
      Context: {context}
      Data: {transactions}
      
      Task: Provide three professional, data-driven financial recommendations based on the transaction history provided.
    `);

    const chain = prompt.pipe(model).pipe(new StringOutputParser());

    return await chain.invoke({
      transactions: JSON.stringify(userTransactions),
      context: JSON.stringify(context),
    });
  } catch (error) {
    console.error("Gemini AI Service Failure, using fallback template:", error);
    
    return getFallbackInsights(userTransactions);
  }
}

function getFallbackInsights(transactions) {
  if (!transactions || transactions.length === 0) {
    return "Insight: No transaction data available to analyze. Start by adding your first expense.";
  }

  const totalSpent = transactions
    .filter(t => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);

  return `
    [System Note: AI Insights currently unavailable. Showing automated summary.]
    
    1. Spending Overview: You have recorded ${transactions.length} transactions recently.
    2. Budget Alert: Your total expenses for this period are ${totalSpent.toFixed(2)}.
    3. Action Item: Review your high-value transactions to ensure they align with your goals.
  `;
}