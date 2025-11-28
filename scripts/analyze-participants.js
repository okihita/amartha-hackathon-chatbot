const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const PARTICIPANTS_PATH = path.join(__dirname, '../docs/dataset/HACKATHON_2025_DATA/task_participants.csv');
const TASKS_PATH = path.join(__dirname, '../docs/dataset/HACKATHON_2025_DATA/tasks.csv');

// Step 1: Load tasks to get task_id -> branch_id mapping
console.log('Step 1: Loading tasks.csv for branch mapping...');
const taskToBranch = new Map();

const loadTasks = () => new Promise((resolve) => {
  fs.createReadStream(TASKS_PATH)
    .pipe(csv())
    .on('data', (row) => {
      if (row.task_id && row.branch_id) {
        taskToBranch.set(row.task_id, row.branch_id);
      }
    })
    .on('end', () => {
      console.log(`  Loaded ${taskToBranch.size.toLocaleString()} task->branch mappings`);
      resolve();
    });
});

// Step 2: Process participants and aggregate by branch
const processParticipants = () => new Promise((resolve) => {
  console.log('\nStep 2: Processing task_participants.csv...');
  
  const stats = {
    total: 0,
    withPayment: 0,
    totalPayment: 0,
    branchPayments: new Map(), // branch_id -> { count, total }
  };

  fs.createReadStream(PARTICIPANTS_PATH)
    .pipe(csv())
    .on('data', (row) => {
      stats.total++;
      
      const payment = parseFloat(row.payment_amount) || 0;
      if (payment > 0) {
        stats.withPayment++;
        stats.totalPayment += payment;
        
        // Get branch from task
        const branchId = taskToBranch.get(row.task_id);
        if (branchId) {
          if (!stats.branchPayments.has(branchId)) {
            stats.branchPayments.set(branchId, { count: 0, total: 0 });
          }
          const bp = stats.branchPayments.get(branchId);
          bp.count++;
          bp.total += payment;
        }
      }
      
      if (stats.total % 300000 === 0) {
        console.log(`  Processed ${stats.total.toLocaleString()} rows...`);
      }
    })
    .on('end', () => {
      resolve(stats);
    });
});

// Main
(async () => {
  const startTime = Date.now();
  
  await loadTasks();
  const stats = await processParticipants();
  
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\nDone in ${elapsed}s\n`);
  
  // Convert branch payments to sorted array
  const branchStats = [];
  stats.branchPayments.forEach((bp, branchId) => {
    branchStats.push({
      branchId: branchId.slice(0, 12) + '...',
      collections: bp.count,
      totalRp: bp.total,
      avgRp: Math.round(bp.total / bp.count),
    });
  });
  branchStats.sort((a, b) => b.totalRp - a.totalRp);
  
  // Summary
  const summary = {
    totalRecords: stats.total,
    paymentsRecorded: stats.withPayment,
    totalCollectedRp: Math.round(stats.totalPayment),
    totalCollectedB: Math.round(stats.totalPayment / 1e9),
    avgPaymentRp: Math.round(stats.totalPayment / stats.withPayment),
    branchCount: branchStats.length,
    topBranches: branchStats.slice(0, 15),
    bottomBranches: branchStats.slice(-10).reverse(),
  };
  
  console.log('=== FIELD COLLECTION ANALYSIS ===\n');
  console.log(`Total Records: ${stats.total.toLocaleString()}`);
  console.log(`Payments Recorded: ${stats.withPayment.toLocaleString()}`);
  console.log(`Total Collected: Rp ${summary.totalCollectedB}B`);
  console.log(`Avg Payment: Rp ${summary.avgPaymentRp.toLocaleString()}`);
  console.log(`Branches with Collections: ${branchStats.length}`);
  console.log('\nTop 10 Branches by Collection:');
  branchStats.slice(0, 10).forEach((b, i) => {
    console.log(`  ${i+1}. ${b.branchId} - Rp ${Math.round(b.totalRp/1e6)}M (${b.collections} payments)`);
  });
  
  // Save to JSON
  const outPath = path.join(__dirname, '../src/data/analytics-participants.json');
  fs.writeFileSync(outPath, JSON.stringify(summary, null, 2));
  console.log(`\nSaved to ${outPath}`);
})();
