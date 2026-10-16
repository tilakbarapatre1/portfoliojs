/**
 * TILAK BARAPATRE — ARCHITECTURE & VIVA DEFENSE MODAL
 * Comprehensive deep-dive documentation for technical recruiters & evaluators
 */

(function () {
  const modalOverlay = document.getElementById('project-modal');
  const modalTitle = document.getElementById('modal-title-text');
  const modalContent = document.getElementById('modal-dynamic-content');
  const closeBtn = document.getElementById('modal-close-trigger');

  if (!modalOverlay || !closeBtn) return;

  const projectData = {
    softcomputing: {
      title: 'Smart Inventory AI — System Architecture & Mathematical Viva Defense',
      html: `
        <div>
          <h4 style="color: var(--accent-coral); font-weight: 700; margin-bottom: 0.5rem;">1. System Flow & Architecture Pipeline</h4>
          <pre class="code-blueprint">
[Product Catalog & Transaction Stream]
                 │
                 ▼
[Feature Engineering & Lag Generators: t-1, t-7, t-14, t-30, Rolling Means]
                 │
                 ▼
[Multi-Model Regressor Benchmark (XGBoost / Random Forest / Ridge)]
                 │
                 ▼
[Point Forecast + 95% Confidence Intervals + ROP Dynamic Safety Stock]
                 │
                 ▼
[Google OR-Tools Mixed-Integer Linear Programming (MILP SCIP Solver)]
    ├── Enforces Supplier MOQs (Binary indicator variables y_is)
    ├── Respects Joint Procurement Budget Ceilings
    └── Optimizes Risk-Weighted Cost + Lead Time Penalty in ~15 ms
                 │
                 ▼
[Transparent XAI Decision Rationale & Automated PO Ledger Sync]
          </pre>
        </div>

        <div>
          <h4 style="color: var(--accent-coral); font-weight: 700; margin-bottom: 0.5rem;">2. Mathematical Formulation (Google OR-Tools MILP)</h4>
          <p style="color: var(--text-secondary); margin-bottom: 0.75rem;">
            The procurement allocation is modeled as a <strong>Mixed-Integer Linear Program</strong> minimizing total procurement cost and risk:
          </p>
          <pre class="code-blueprint">
Objective:
min Σ_i Σ_s [ Cost_{i,s} + RiskPenalty_{i,s} ] · x_{i,s}

Constraints:
1. Demand Deficit Satisfaction:   Σ_s x_{i,s} ≥ Deficit_i            ∀ i
2. Minimum Order Quantity (MOQ): MOQ_{i,s} · y_{i,s} ≤ x_{i,s} ≤ M · y_{i,s}  ∀ i, s
3. Total Budget Limitation:       Σ_i Σ_s Cost_{i,s} · x_{i,s} ≤ BudgetLimit
4. Binary Activation:            y_{i,s} ∈ {0, 1},  x_{i,s} ∈ ℤ⁺
          </pre>
        </div>

        <div>
          <h4 style="color: var(--accent-coral); font-weight: 700; margin-bottom: 0.5rem;">3. Dynamic Safety Stock & Reorder Point (ROP)</h4>
          <pre class="code-blueprint">
ROP = (d̄ × L) + SafetyStock

SafetyStock = Z_α × σ_d × √L
where:
  d̄   = Average daily demand
  L   = Vendor lead time in days
  σ_d = Standard deviation of daily demand
  Z_α = Service level factor (1.65 for 95% cycle service level)
          </pre>
        </div>

        <div>
          <h4 style="color: var(--accent-coral); font-weight: 700; margin-bottom: 0.5rem;">4. Technical Viva & Design Trade-offs</h4>
          <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.85rem; color: var(--text-secondary); font-size: 0.9rem;">
            <li><strong style="color: var(--accent-coral);">Q: Why Google OR-Tools SCIP solver instead of Genetic Algorithms or Heuristics?</strong><br>
            A: GAs produce non-deterministic approximations and can violate hard budget constraints under edge cases. Google OR-Tools SCIP solver guarantees exact mathematical optimality with proof of infeasibility in ~15 ms, essential for enterprise capital management.</li>
            <li><strong style="color: var(--accent-coral);">Q: Why compare XGBoost against Ridge and Random Forest?</strong><br>
            A: In demand forecasting, tree-based models capture non-linear calendar seasonality (e.g. festivals and weekend uplifts), while Ridge regularizer prevents overfitting on sparse SKUs. Holdout test metrics authenticates MAE, RMSE, and MAPE scores before deployment.</li>
          </ul>
        </div>
      `
    },
    flexi: {
      title: 'Employee Leave Automation — Architecture & Rule Engine Defense',
      html: `
        <div>
          <h4 style="color: var(--accent-coral); font-weight: 700; margin-bottom: 0.5rem;">1. System Architecture & Component Stack</h4>
          <pre class="code-blueprint">
[Role-Based Web UI: Gradio 5.20 Enterprise Architecture]
    ├── Manager Administrative Dashboard
    └── Employee Self-Service Portal
                 │
                 ▼
[Intelligent AI Leave Recommendation Agent]
    ├── Evaluates 30-Day Rolling Attendance Percentage
    ├── Verifies Accrued Leave Quota vs Requested Days
    └── Validates Team Continuity & Consecutive Leave Caps
                 │
                 ▼
[Database Layer: SQLite Relational Store + SQLAlchemy ORM]
    ├── Employees & Roles
    ├── Attendance Ledger (Present / Absent)
    ├── Leave Applications & Status Lifecycle
    └── System Audit Log Trail
                 │
                 ▼
[Visual Analytics Engine: Plotly Interactive Graphs]
          </pre>
        </div>

        <div>
          <h4 style="color: var(--accent-coral); font-weight: 700; margin-bottom: 0.5rem;">2. Human-in-the-Loop AI Recommendation Design</h4>
          <p style="color: var(--text-secondary); margin-bottom: 0.75rem;">
            The AI recommendation agent provides decision support without replacing human managerial authority:
          </p>
          <pre class="code-blueprint">
Rule Evaluator:
1. IF AttendanceRate < 75%  ==> FLAG_FOR_REVIEW (Breach of minimum attendance policy)
2. IF RequestedDays > Balance ==> REJECT_INSUFFICIENT_QUOTA
3. IF RequestedDays > 4 Days  ==> FLAG_EXECUTIVE_APPROVAL (Consecutive threshold)
4. ELSE                        ==> RECOMMEND_APPROVAL with bullet rationale
          </pre>
        </div>

        <div>
          <h4 style="color: var(--accent-coral); font-weight: 700; margin-bottom: 0.5rem;">3. Technical Viva & Practical Applications</h4>
          <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.85rem; color: var(--text-secondary); font-size: 0.9rem;">
            <li><strong style="color: var(--accent-coral);">Q: Why was Gradio selected alongside Python?</strong><br>
            A: Gradio allows lightning-fast prototyping of data-driven enterprise dashboards with built-in reactive component states, seamlessly integrating with Pandas and Plotly without requiring separate API scaffolding for internal tools.</li>
            <li><strong style="color: var(--accent-coral);">Q: How are concurrent attendance entries handled safely?</strong><br>
            A: SQLite transaction contexts wrap attendance marking and leave balance deductions in atomic ACID operations, preventing double-application or quota drift.</li>
          </ul>
        </div>
      `
    }
  };

  window.openProjectModal = function (projectId) {
    const data = projectData[projectId];
    if (!data) return;

    modalTitle.textContent = data.title;
    modalContent.innerHTML = data.html;
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  function closeModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
      closeModal();
    }
  });
})();
