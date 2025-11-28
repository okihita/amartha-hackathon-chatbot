/**
 * Data Analytics Service
 * Processes hackathon dataset for ML predictions and insights
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const DATA_PATH = path.join(__dirname, '../../docs/dataset/HACKATHON_2025_DATA');

class DataAnalyticsService {
  constructor() {
    this.customers = [];
    this.loanSnapshots = [];
    this.bills = [];
    this.tasks = [];
    this.taskParticipants = [];
    this.loaded = false;
    this.customerMetrics = new Map();
  }

  async loadData() {
    if (this.loaded) return;
    
    console.log('[Analytics] Loading dataset...');
    
    const [customers, loans, bills, tasks] = await Promise.all([
      this._loadCSV('customers.csv'),
      this._loadCSV('loan_snapshots.csv'),
      this._loadCSV('bills.csv'),
      this._loadCSV('tasks.csv'),
    ]);

    this.customers = customers;
    this.loanSnapshots = loans;
    this.bills = bills;
    this.tasks = tasks;
    
    console.log(`[Analytics] Loaded: ${customers.length} customers, ${loans.length} loans, ${bills.length} bills, ${tasks.length} tasks`);
    
    this._computeMetrics();
    this.loaded = true;
  }

  _loadCSV(filename) {
    return new Promise((resolve, reject) => {
      const results = [];
      const filePath = path.join(DATA_PATH, filename);
      
      if (!fs.existsSync(filePath)) {
        console.warn(`[Analytics] File not found: ${filename}`);
        return resolve([]);
      }

      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', reject);
    });
  }

  _computeMetrics() {
    console.log('[Analytics] Computing customer metrics...');
    
    // Index loans by customer
    const loansByCustomer = new Map();
    this.loanSnapshots.forEach(loan => {
      loansByCustomer.set(loan.customer_number, loan);
    });

    // Index bills by loan
    const billsByLoan = new Map();
    this.bills.forEach(bill => {
      if (!billsByLoan.has(bill.loan_id)) billsByLoan.set(bill.loan_id, []);
      billsByLoan.get(bill.loan_id).push(bill);
    });

    // Compute metrics per customer
    this.customers.forEach(customer => {
      const loan = loansByCustomer.get(customer.customer_number);
      if (!loan) return;

      const bills = billsByLoan.get(loan.loan_id) || [];
      const paidBills = bills.filter(b => b.bill_paid_date && b.paid_amount > 0);
      const lateBills = bills.filter(b => {
        if (!b.bill_paid_date || !b.bill_scheduled_date) return false;
        return new Date(b.bill_paid_date) > new Date(b.bill_scheduled_date);
      });

      const totalBilled = bills.reduce((sum, b) => sum + parseFloat(b.amount || 0), 0);
      const totalPaid = bills.reduce((sum, b) => sum + parseFloat(b.paid_amount || 0), 0);

      this.customerMetrics.set(customer.customer_number, {
        customer,
        loan,
        billCount: bills.length,
        paidCount: paidBills.length,
        lateCount: lateBills.length,
        paymentRatio: bills.length > 0 ? paidBills.length / bills.length : 0,
        lateRatio: paidBills.length > 0 ? lateBills.length / paidBills.length : 0,
        totalBilled,
        totalPaid,
        collectionRatio: totalBilled > 0 ? totalPaid / totalBilled : 0,
        dpd: parseInt(loan.dpd) || 0,
        principal: parseFloat(loan.principal_amount) || 0,
        outstanding: parseFloat(loan.outstanding_amount) || 0,
        businessType: this._categorizeBusinessType(customer.purpose),
      });
    });

    console.log(`[Analytics] Computed metrics for ${this.customerMetrics.size} customers`);
  }

  _categorizeBusinessType(purpose) {
    if (!purpose) return 'other';
    const p = purpose.toLowerCase();
    if (p.includes('warung') || p.includes('dagang')) return 'retail';
    if (p.includes('ternak')) return 'livestock';
    if (p.includes('tani')) return 'farming';
    if (p.includes('kerajinan')) return 'crafts';
    return 'other';
  }

  // ============ IDEA 1: Default Risk Prediction ============
  predictDefaultRisk(customerNumber) {
    const metrics = this.customerMetrics.get(customerNumber);
    if (!metrics) return null;

    // Simple scoring model based on payment behavior
    let riskScore = 50; // Base score

    // Payment ratio impact (0-100% paid bills)
    riskScore -= metrics.paymentRatio * 30; // Good payers reduce risk

    // Late payment impact
    riskScore += metrics.lateRatio * 25; // Late payers increase risk

    // DPD impact (days past due)
    if (metrics.dpd > 0) riskScore += Math.min(metrics.dpd / 2, 30);

    // Collection ratio impact
    riskScore -= (metrics.collectionRatio - 0.5) * 20;

    // Business type risk adjustment
    const businessRisk = { retail: -5, livestock: 0, farming: 5, crafts: 0, other: 5 };
    riskScore += businessRisk[metrics.businessType] || 0;

    // Clamp to 0-100
    riskScore = Math.max(0, Math.min(100, riskScore));

    const riskLevel = riskScore < 30 ? 'Low' : riskScore < 60 ? 'Medium' : 'High';

    return {
      customerNumber,
      riskScore: Math.round(riskScore),
      riskLevel,
      factors: {
        paymentRatio: Math.round(metrics.paymentRatio * 100),
        lateRatio: Math.round(metrics.lateRatio * 100),
        dpd: metrics.dpd,
        collectionRatio: Math.round(metrics.collectionRatio * 100),
        businessType: metrics.businessType,
      },
      recommendation: this._getRiskRecommendation(riskLevel, metrics),
    };
  }

  _getRiskRecommendation(riskLevel, metrics) {
    if (riskLevel === 'Low') {
      return 'Customer shows strong payment discipline. Consider for loan limit increase.';
    } else if (riskLevel === 'Medium') {
      return `Monitor closely. ${metrics.lateRatio > 0.3 ? 'High late payment frequency.' : ''} ${metrics.dpd > 0 ? `Currently ${metrics.dpd} days overdue.` : ''}`;
    } else {
      return 'High default risk. Recommend proactive collection contact and payment plan restructuring.';
    }
  }

  getAllRiskPredictions() {
    const predictions = [];
    this.customerMetrics.forEach((_, customerNumber) => {
      predictions.push(this.predictDefaultRisk(customerNumber));
    });
    return predictions.filter(p => p).sort((a, b) => b.riskScore - a.riskScore);
  }

  // ============ IDEA 2: Field Agent Route Analysis ============
  analyzeFieldAgentRoutes() {
    const branchTasks = new Map();
    
    this.tasks.forEach(task => {
      const branchId = task.branch_id;
      if (!branchTasks.has(branchId)) branchTasks.set(branchId, []);
      branchTasks.get(branchId).push({
        taskId: task.task_id,
        lat: parseFloat(task.latitude),
        lng: parseFloat(task.longitude),
        scheduled: new Date(task.start_datetime),
        actual: new Date(task.actual_datetime),
      });
    });

    const branchAnalysis = [];
    branchTasks.forEach((tasks, branchId) => {
      const validTasks = tasks.filter(t => !isNaN(t.lat) && !isNaN(t.lng) && t.lat !== 0);
      if (validTasks.length < 2) return;

      // Calculate center point
      const centerLat = validTasks.reduce((s, t) => s + t.lat, 0) / validTasks.length;
      const centerLng = validTasks.reduce((s, t) => s + t.lng, 0) / validTasks.length;

      // Calculate spread (avg distance from center)
      const distances = validTasks.map(t => this._haversine(centerLat, centerLng, t.lat, t.lng));
      const avgSpread = distances.reduce((s, d) => s + d, 0) / distances.length;
      const maxSpread = Math.max(...distances);

      // Calculate time delays
      const delays = validTasks.map(t => (t.actual - t.scheduled) / (1000 * 60 * 60)); // hours
      const avgDelay = delays.reduce((s, d) => s + d, 0) / delays.length;

      branchAnalysis.push({
        branchId: branchId.substring(0, 8) + '...',
        taskCount: validTasks.length,
        centerLat: Math.round(centerLat * 1000) / 1000,
        centerLng: Math.round(centerLng * 1000) / 1000,
        avgSpreadKm: Math.round(avgSpread * 10) / 10,
        maxSpreadKm: Math.round(maxSpread * 10) / 10,
        avgDelayHours: Math.round(avgDelay * 10) / 10,
        efficiency: avgDelay < 2 ? 'Good' : avgDelay < 5 ? 'Moderate' : 'Poor',
        locations: validTasks.slice(0, 20).map(t => ({ lat: t.lat, lng: t.lng })),
      });
    });

    return branchAnalysis.sort((a, b) => b.taskCount - a.taskCount).slice(0, 20);
  }

  _haversine(lat1, lon1, lat2, lon2) {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }

  // ============ IDEA 3: Business Image Analysis Stats ============
  getImageAnalysisStats() {
    const businessPath = path.join(DATA_PATH, 'business');
    const housePath = path.join(DATA_PATH, 'house');

    const businessImages = fs.existsSync(businessPath) ? fs.readdirSync(businessPath).filter(f => f.endsWith('.jpeg')) : [];
    const houseImages = fs.existsSync(housePath) ? fs.readdirSync(housePath).filter(f => f.endsWith('.jpeg')) : [];

    return {
      businessCount: businessImages.length,
      houseCount: houseImages.length,
      businessSamples: businessImages.slice(0, 10).map(f => `/api/analytics/image/business/${f}`),
      houseSamples: houseImages.slice(0, 10).map(f => `/api/analytics/image/house/${f}`),
    };
  }

  getImagePath(type, filename) {
    const basePath = type === 'business' ? path.join(DATA_PATH, 'business') : path.join(DATA_PATH, 'house');
    return path.join(basePath, filename);
  }

  // ============ IDEA 4: Payment Behavior Analytics ============
  getPaymentAnalytics() {
    const monthlyPayments = new Map();
    const businessTypePayments = new Map();
    let totalScheduled = 0, totalPaid = 0, totalLate = 0;

    this.bills.forEach(bill => {
      const scheduled = new Date(bill.bill_scheduled_date);
      const monthKey = `${scheduled.getFullYear()}-${String(scheduled.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyPayments.has(monthKey)) {
        monthlyPayments.set(monthKey, { scheduled: 0, paid: 0, late: 0, count: 0 });
      }
      
      const mp = monthlyPayments.get(monthKey);
      mp.scheduled += parseFloat(bill.amount) || 0;
      mp.paid += parseFloat(bill.paid_amount) || 0;
      mp.count++;
      
      if (bill.bill_paid_date && new Date(bill.bill_paid_date) > scheduled) {
        mp.late++;
        totalLate++;
      }

      totalScheduled += parseFloat(bill.amount) || 0;
      totalPaid += parseFloat(bill.paid_amount) || 0;
    });

    // Business type analysis
    this.customerMetrics.forEach(metrics => {
      const bt = metrics.businessType;
      if (!businessTypePayments.has(bt)) {
        businessTypePayments.set(bt, { count: 0, totalRisk: 0, avgPaymentRatio: 0 });
      }
      const btp = businessTypePayments.get(bt);
      btp.count++;
      btp.totalRisk += this.predictDefaultRisk(metrics.customer.customer_number)?.riskScore || 50;
      btp.avgPaymentRatio += metrics.paymentRatio;
    });

    // Finalize business type stats
    const businessTypeStats = [];
    businessTypePayments.forEach((stats, type) => {
      businessTypeStats.push({
        type,
        count: stats.count,
        avgRiskScore: Math.round(stats.totalRisk / stats.count),
        avgPaymentRatio: Math.round((stats.avgPaymentRatio / stats.count) * 100),
      });
    });

    // Monthly trend
    const monthlyTrend = Array.from(monthlyPayments.entries())
      .map(([month, data]) => ({
        month,
        scheduled: Math.round(data.scheduled / 1000000), // millions
        paid: Math.round(data.paid / 1000000),
        collectionRate: data.scheduled > 0 ? Math.round((data.paid / data.scheduled) * 100) : 0,
        lateRate: data.count > 0 ? Math.round((data.late / data.count) * 100) : 0,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return {
      summary: {
        totalCustomers: this.customers.length,
        totalBills: this.bills.length,
        totalScheduledM: Math.round(totalScheduled / 1000000),
        totalPaidM: Math.round(totalPaid / 1000000),
        overallCollectionRate: Math.round((totalPaid / totalScheduled) * 100),
        overallLateRate: Math.round((totalLate / this.bills.length) * 100),
      },
      monthlyTrend,
      businessTypeStats: businessTypeStats.sort((a, b) => b.count - a.count),
      atRiskCustomers: this.getAllRiskPredictions().filter(p => p.riskLevel === 'High').length,
    };
  }

  // ============ IDEA 5: Customer Segmentation ============
  getCustomerSegments() {
    const segments = {
      'star_performers': { criteria: 'Low risk + High payment ratio', customers: [], recommendations: [] },
      'growth_potential': { criteria: 'Medium risk + Retail business', customers: [], recommendations: [] },
      'needs_attention': { criteria: 'High late ratio but still paying', customers: [], recommendations: [] },
      'high_risk': { criteria: 'High risk + DPD > 30', customers: [], recommendations: [] },
      'new_borrowers': { criteria: 'Few bills, insufficient data', customers: [], recommendations: [] },
    };

    this.customerMetrics.forEach((metrics, customerNumber) => {
      const risk = this.predictDefaultRisk(customerNumber);
      if (!risk) return;

      const customer = {
        id: customerNumber.substring(0, 8) + '...',
        businessType: metrics.businessType,
        purpose: metrics.customer.purpose,
        riskScore: risk.riskScore,
        paymentRatio: Math.round(metrics.paymentRatio * 100),
        dpd: metrics.dpd,
      };

      if (metrics.billCount < 3) {
        segments.new_borrowers.customers.push(customer);
      } else if (risk.riskLevel === 'Low' && metrics.paymentRatio > 0.9) {
        segments.star_performers.customers.push(customer);
      } else if (risk.riskLevel === 'Medium' && metrics.businessType === 'retail') {
        segments.growth_potential.customers.push(customer);
      } else if (metrics.lateRatio > 0.3 && metrics.paymentRatio > 0.5) {
        segments.needs_attention.customers.push(customer);
      } else if (risk.riskLevel === 'High' || metrics.dpd > 30) {
        segments.high_risk.customers.push(customer);
      }
    });

    // Add recommendations
    segments.star_performers.recommendations = [
      'Offer loan limit increases',
      'Invite to referral program',
      'Skip advanced literacy modules',
    ];
    segments.growth_potential.recommendations = [
      'Recommend inventory management module',
      'Offer business expansion coaching',
      'Monitor for upgrade to star performer',
    ];
    segments.needs_attention.recommendations = [
      'Send payment reminder 3 days before due',
      'Assign to proactive field agent follow-up',
      'Recommend cash flow management module',
    ];
    segments.high_risk.recommendations = [
      'Immediate field agent contact',
      'Offer payment restructuring',
      'Escalate to collections team',
    ];
    segments.new_borrowers.recommendations = [
      'Complete onboarding literacy modules',
      'Schedule first field agent visit',
      'Monitor first 3 payments closely',
    ];

    // Limit customers shown
    Object.values(segments).forEach(seg => {
      seg.count = seg.customers.length;
      seg.customers = seg.customers.slice(0, 10);
    });

    return segments;
  }

  // ============ Dashboard Summary ============
  getDashboardSummary() {
    const riskDistribution = { Low: 0, Medium: 0, High: 0 };
    this.customerMetrics.forEach((_, customerNumber) => {
      const risk = this.predictDefaultRisk(customerNumber);
      if (risk) riskDistribution[risk.riskLevel]++;
    });

    return {
      dataLoaded: this.loaded,
      customerCount: this.customers.length,
      loanCount: this.loanSnapshots.length,
      billCount: this.bills.length,
      taskCount: this.tasks.length,
      riskDistribution,
      avgDPD: Math.round(
        Array.from(this.customerMetrics.values()).reduce((s, m) => s + m.dpd, 0) / this.customerMetrics.size
      ),
    };
  }
}

module.exports = new DataAnalyticsService();
