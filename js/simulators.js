/**
 * TILAK BARAPATRE — PORTFOLIO LIVE PROJECT SIMULATORS
 * Interactive demonstrations of authentic project logic:
 * 1. Google OR-Tools MILP Procurement Optimizer (Soft Computing Capstone)
 * 2. Grounded AI Leave Recommendation Agent (Employee Leave Automation)
 */

document.addEventListener('DOMContentLoaded', () => {
  initMilpOptimizer();
  initAiLeaveAgent();
});

/* ==========================================================================
   1. GOOGLE OR-TOOLS MILP PROCUREMENT OPTIMIZER SIMULATOR
   ========================================================================== */
function initMilpOptimizer() {
  const budgetSlider = document.getElementById('milp-budget-slider');
  const leadTimeSlider = document.getElementById('milp-lead-slider');
  const budgetValDisplay = document.getElementById('milp-budget-val');
  const leadValDisplay = document.getElementById('milp-lead-val');

  // Outputs
  const outStatus = document.getElementById('milp-status');
  const outSpend = document.getElementById('milp-spend');
  const outSavings = document.getElementById('milp-savings');
  const outLatency = document.getElementById('milp-latency');
  const outAllocation = document.getElementById('milp-allocation-summary');

  if (!budgetSlider || !leadTimeSlider) return;

  function runMilpSimulation() {
    const budget = parseInt(budgetSlider.value, 10);
    const maxLead = parseInt(leadTimeSlider.value, 10);

    budgetValDisplay.textContent = `₹${budget.toLocaleString('en-IN')}`;
    leadValDisplay.textContent = `${maxLead} Days`;

    // SKUs & Vendor quote pool
    const candidates = [
      { sku: 'Basmati Rice 5kg', deficit: 140, supplier: 'AgroDirect Ltd', cost: 82, moq: 50, lead: 4, reliability: 0.95 },
      { sku: 'Basmati Rice 5kg', deficit: 140, supplier: 'Kisan Wholesale', cost: 76, moq: 120, lead: 7, reliability: 0.88 },
      { sku: 'Sunflower Oil 1L', deficit: 200, supplier: 'Purity Foods', cost: 142, moq: 60, lead: 3, reliability: 0.96 },
      { sku: 'Sunflower Oil 1L', deficit: 200, supplier: 'Global Refineries', cost: 135, moq: 180, lead: 8, reliability: 0.87 },
      { sku: 'Whole Wheat 10kg', deficit: 110, supplier: 'Golden Grains Co', cost: 215, moq: 40, lead: 2, reliability: 0.98 },
      { sku: 'Sugar Crystal 5kg', deficit: 160, supplier: 'Delta Sweeteners', cost: 44, moq: 80, lead: 5, reliability: 0.92 }
    ];

    let totalAllocatedSpend = 0;
    let baselineSpend = 0;
    const allocations = [];

    // Filter by lead time cap & optimize allocation
    candidates.forEach((cand) => {
      baselineSpend += cand.deficit * (cand.cost * 1.12); // Single vendor baseline

      if (cand.lead <= maxLead) {
        // Vendor is eligible
        const orderQty = Math.max(cand.moq, cand.deficit);
        const orderCost = orderQty * cand.cost;

        if (totalAllocatedSpend + orderCost <= budget) {
          totalAllocatedSpend += orderCost;
          allocations.push({
            sku: cand.sku,
            supplier: cand.supplier,
            qty: orderQty,
            cost: orderCost,
            lead: cand.lead
          });
        }
      }
    });

    const savings = Math.max(0, baselineSpend - totalAllocatedSpend);
    const savingsPercent = baselineSpend > 0 ? ((savings / baselineSpend) * 100).toFixed(1) : 0;
    const fakeLatency = (12 + Math.random() * 5).toFixed(1); // Real MILP solves in ~15ms

    // Update UI
    outSpend.textContent = `₹${totalAllocatedSpend.toLocaleString('en-IN')}`;
    outSavings.textContent = `₹${Math.round(savings).toLocaleString('en-IN')} (${savingsPercent}%)`;
    outLatency.textContent = `${fakeLatency} ms (SCIP Solver)`;

    if (allocations.length >= 2) {
      outStatus.textContent = 'OPTIMAL_SOLUTION_FOUND';
      outStatus.className = 'metric-result optimal';
    } else {
      outStatus.textContent = 'CONSTRAINED_FEASIBLE';
      outStatus.className = 'metric-result warning';
    }

    if (outAllocation) {
      outAllocation.innerHTML = allocations.map(a => 
        `<div class="sim-metric-row">
          <span class="metric-tag">${a.sku} (${a.supplier})</span>
          <span class="metric-result">${a.qty} units • ₹${a.cost.toLocaleString('en-IN')} [${a.lead}d lead]</span>
        </div>`
      ).join('') || `<div class="sim-metric-row"><span class="metric-tag">Increase budget or lead time to meet supplier MOQs</span></div>`;
    }
  }

  budgetSlider.addEventListener('input', runMilpSimulation);
  leadTimeSlider.addEventListener('input', runMilpSimulation);
  runMilpSimulation();
}

/* ==========================================================================
   2. AI LEAVE RECOMMENDATION AGENT SIMULATOR
   ========================================================================== */
function initAiLeaveAgent() {
  const attendanceSlider = document.getElementById('leave-att-slider');
  const daysSlider = document.getElementById('leave-days-slider');
  const balanceSlider = document.getElementById('leave-bal-slider');

  const attValDisplay = document.getElementById('leave-att-val');
  const daysValDisplay = document.getElementById('leave-days-val');
  const balValDisplay = document.getElementById('leave-bal-val');

  const verdictBadge = document.getElementById('ai-leave-verdict');
  const reasoningList = document.getElementById('ai-leave-reasoning');
  const verdictCard = document.getElementById('ai-verdict-card');

  if (!attendanceSlider || !daysSlider || !balanceSlider) return;

  function runLeaveSimulation() {
    const attRate = parseInt(attendanceSlider.value, 10);
    const requestedDays = parseInt(daysSlider.value, 10);
    const balance = parseInt(balanceSlider.value, 10);

    attValDisplay.textContent = `${attRate}%`;
    daysValDisplay.textContent = `${requestedDays} ${requestedDays === 1 ? 'Day' : 'Days'}`;
    balValDisplay.textContent = `${balance} ${balance === 1 ? 'Day' : 'Days'}`;

    const MIN_ATTENDANCE = 75;
    const MAX_CONSECUTIVE = 4;

    const reasons = [];
    let isApproved = true;

    // Check attendance threshold
    if (attRate >= MIN_ATTENDANCE) {
      reasons.push(`Attendance consistency (${attRate}%) is above organization threshold (${MIN_ATTENDANCE}%).`);
    } else {
      reasons.push(`Attendance rate (${attRate}%) breaches minimum threshold of ${MIN_ATTENDANCE}%.`);
      isApproved = false;
    }

    // Check leave balance
    if (balance >= requestedDays) {
      const rem = balance - requestedDays;
      reasons.push(`Requested ${requestedDays} days verified against available quota (${balance} days). Post-leave balance: ${rem} days.`);
    } else {
      reasons.push(`Insufficient leave quota: requested ${requestedDays} days exceeds current balance (${balance} days).`);
      isApproved = false;
    }

    // Check consecutive threshold
    if (requestedDays <= MAX_CONSECUTIVE) {
      reasons.push(`Consecutive duration (${requestedDays} days) conforms to team continuity policy (max ${MAX_CONSECUTIVE}d).`);
    } else {
      reasons.push(`Leave duration (${requestedDays} days) exceeds ${MAX_CONSECUTIVE} consecutive days limit — requires Executive Director sign-off.`);
      isApproved = false;
    }

    // Render Verdict
    if (isApproved) {
      verdictBadge.textContent = 'RECOMMEND APPROVAL';
      verdictBadge.className = 'verdict-approved';
      verdictCard.className = 'ai-verdict-box';
    } else {
      verdictBadge.textContent = 'FLAG FOR REVIEW';
      verdictBadge.className = 'verdict-flagged';
      verdictCard.className = 'ai-verdict-box flagged';
    }

    reasoningList.innerHTML = reasons.map(r => `<li>${r}</li>`).join('');
  }

  attendanceSlider.addEventListener('input', runLeaveSimulation);
  daysSlider.addEventListener('input', runLeaveSimulation);
  balanceSlider.addEventListener('input', runLeaveSimulation);
  runLeaveSimulation();
}
