/**
 * RPCService - Repayment Capacity Calculator
 * USP 2 (Income) + USP 3 (Expenses) combined into RPC
 */

class RPCService {
  // Amartha's 30% buffer rule
  static BUFFER_PERCENTAGE = 0.30;
  
  // Default values for missing data
  static DEFAULTS = {
    cogs_percentage: 50,
    household_expenses: 1500000,
    existing_obligations: 0,
    active_days: 25
  };

  static calculateRPC(data) {
    const daily_revenue = data.daily_revenue || 0;
    const active_days = data.active_days || this.DEFAULTS.active_days;
    const cogs_percentage = data.cogs_percentage ?? this.DEFAULTS.cogs_percentage;
    const household_expenses = data.household_expenses ?? this.DEFAULTS.household_expenses;
    const existing_obligations = data.existing_obligations ?? this.DEFAULTS.existing_obligations;
    
    const monthly_income = daily_revenue * active_days;
    const cogs = monthly_income * (cogs_percentage / 100);
    const gross_profit = monthly_income - cogs;
    const monthly_expenses = cogs + household_expenses + existing_obligations;
    const sustainable_disposable_cash = gross_profit - household_expenses - existing_obligations;
    const max_installment = Math.max(0, Math.round(sustainable_disposable_cash * this.BUFFER_PERCENTAGE));
    
    return {
      monthly_income,
      monthly_expenses,
      cogs,
      gross_profit,
      household_expenses,
      existing_obligations,
      sustainable_disposable_cash,
      max_installment
    };
  }

  static calculateRPCScore(rpc) {
    if (!rpc || rpc.sustainable_disposable_cash <= 0) return 0;
    
    // Score based on SDC thresholds (in millions)
    const sdcMillions = rpc.sustainable_disposable_cash / 1000000;
    
    // Scoring tiers:
    // < 0.5M = 0-30
    // 0.5M - 1M = 30-50
    // 1M - 2M = 50-70
    // 2M - 4M = 70-85
    // > 4M = 85-100
    
    if (sdcMillions < 0.5) return Math.round(sdcMillions * 60);
    if (sdcMillions < 1) return Math.round(30 + (sdcMillions - 0.5) * 40);
    if (sdcMillions < 2) return Math.round(50 + (sdcMillions - 1) * 20);
    if (sdcMillions < 4) return Math.round(70 + (sdcMillions - 2) * 7.5);
    return Math.min(100, Math.round(85 + (sdcMillions - 4) * 3));
  }

  static calculateTrends(current, previous) {
    if (!previous) {
      return { income_change_pct: 0, expense_change_pct: 0 };
    }
    
    const incomeChange = previous.monthly_income > 0
      ? Math.round(((current.monthly_income - previous.monthly_income) / previous.monthly_income) * 100)
      : 0;
    
    const expenseChange = previous.monthly_expenses > 0
      ? Math.round(((current.monthly_expenses - previous.monthly_expenses) / previous.monthly_expenses) * 100)
      : 0;
    
    return {
      income_change_pct: incomeChange,
      expense_change_pct: expenseChange
    };
  }
}

module.exports = RPCService;
