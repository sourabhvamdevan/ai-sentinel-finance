


export const FALLBACK_INSIGHTS = {
  header: "[Automated Summary - AI Advisor Currently Offline]",
  noData: "Insight: No transaction data available to analyze. Start by adding your first expense to receive personalized advice.",
  generalTips: [
    "Tip: Review your recurring subscriptions to identify potential savings.",
    "Tip: Consider setting a monthly budget goal for your top expense categories.",
    "Tip: Regularly reconcile your accounts to maintain accurate balance tracking."
  ]
};

/**
 * Generates a structured response based on raw transaction data.
 * @param {Array} transactions - Array of serialized transaction objects.
 */
export function generateFallbackTemplate(transactions) {
  if (!transactions || transactions.length === 0) {
    return FALLBACK_INSIGHTS.noData;
  }

  const expenses = transactions.filter((t) => t.type === "EXPENSE");
  const totalSpent = expenses.reduce((sum, t) => sum + t.amount, 0);

  const highestExpense = expenses.length > 0 
    ? expenses.reduce((prev, current) => (prev.amount > current.amount) ? prev : current)
    : null;

  let report = `${FALLBACK_INSIGHTS.header}\n\n`;
  
  report += `1. Activity Overview: You have recorded ${transactions.length} transactions in this period.\n`;
  report += `2. Spending Summary: Your total calculated expenses are ${totalSpent.toFixed(2)}.\n`;
  
  if (highestExpense) {
    report += `3. Significant Transaction: Your largest expense was "${highestExpense.description}" at ${highestExpense.amount.toFixed(2)}.\n`;
  } else {
    report += `3. Financial Tip: ${FALLBACK_INSIGHTS.generalTips[0]}\n`;
  }

  return report;
}