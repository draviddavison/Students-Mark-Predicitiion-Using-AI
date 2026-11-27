/**
 * EduPredict AI - Application Controller
 * Connects UI, Analytics Engine, Chart.js, and Storage
 */

(function () {
  'use strict';

  // State Management
  let currentFilter = 'all'; // 'all' | 'high' | 'moderate' | 'remedial'
  let currentSearchQuery = '';
  let currentSort = 'pct-desc';
  let activeStudentId = null;

  // Chart Instances
  let trendChartInstance = null;
  let donutChartInstance = null;
  let studentSparklineInstance = null;

  // DOM Elements
  const studentsGrid = document.getElementById('students-grid');
  const searchInput = document.getElementById('search-input');
  const sortSelect = document.getElementById('sort-select');
  const categoryTabBtns = document.querySelectorAll('.category-tab-btn');

  // KPI Elements
  const kpiTotalStudents = document.getElementById('kpi-total-students');
  const kpiClassAvg = document.getElementById('kpi-class-avg');
  const kpiHighCount = document.getElementById('kpi-high-count');
  const kpiHighPct = document.getElementById('kpi-high-pct');
  const kpiModerateCount = document.getElementById('kpi-moderate-count');
  const kpiModeratePct = document.getElementById('kpi-moderate-pct');
  const kpiRemedialCount = document.getElementById('kpi-remedial-count');
  const kpiRemedialPct = document.getElementById('kpi-remedial-pct');

  // Tab Badge Elements
  const tabBadgeAll = document.getElementById('tab-badge-all');
  const tabBadgeHigh = document.getElementById('tab-badge-high');
  const tabBadgeModerate = document.getElementById('tab-badge-moderate');
  const tabBadgeRemedial = document.getElementById('tab-badge-remedial');

  // Modals
  const modalDetail = document.getElementById('modal-student-detail');
  const modalAdd = document.getElementById('modal-add-student');
  const toastContainer = document.getElementById('toast-container');

  // Detail Modal Elements
  const modalStudentAvatar = document.getElementById('modal-student-avatar');
  const modalStudentName = document.getElementById('modal-student-name');
  const modalStudentRoll = document.getElementById('modal-student-roll');
  const modalStudentClass = document.getElementById('modal-student-class');
  const modalStudentId = document.getElementById('modal-student-id');
  const modalStatPercentage = document.getElementById('modal-stat-percentage');
  const modalStatCategoryTag = document.getElementById('modal-stat-category-tag');
  const modalStatPredicted = document.getElementById('modal-stat-predicted');
  const modalStatProbability = document.getElementById('modal-stat-probability');
  const modalStatRisk = document.getElementById('modal-stat-risk');
  const modalStatGrowth = document.getElementById('modal-stat-growth');
  const modalStatTrend = document.getElementById('modal-stat-trend');

  const inputM1 = document.getElementById('input-mark-model1');
  const inputQ = document.getElementById('input-mark-quarterly');
  const inputM2 = document.getElementById('input-mark-model2');
  const inputHY = document.getElementById('input-mark-halfYearly');
  const inputM3 = document.getElementById('input-mark-model3');
  const inputNotes = document.getElementById('modal-input-notes');

  const modalAdvisoryBox = document.getElementById('modal-advisory-box');
  const modalAdvisoryHeading = document.getElementById('modal-advisory-heading');
  const modalAdvisoryText = document.getElementById('modal-advisory-text');
  const modalActionChecklist = document.getElementById('modal-action-checklist');

  /**
   * Initialize Application
   */
  function init() {
    setupEventListeners();
    refreshDashboard();
  }

  /**
   * Refresh all dashboard metrics, charts, and student cards
   */
  function refreshDashboard() {
    const rawStudents = StorageManager.getStudents();
    const cohort = AnalyticsEngine.analyzeCohort(rawStudents);

    updateKPICards(cohort);
    updateTabBadges(cohort);
    renderCharts(cohort);
    renderStudentCards(cohort.students);
  }

  /**
   * Update KPI Banner
   */
  function updateKPICards(cohort) {
    if (kpiTotalStudents) kpiTotalStudents.textContent = cohort.total;
    if (kpiClassAvg) kpiClassAvg.textContent = `Avg: ${cohort.classAverage}%`;

    if (kpiHighCount) kpiHighCount.textContent = cohort.highCount;
    if (kpiHighPct) kpiHighPct.textContent = `${cohort.highPercentage}% of class`;

    if (kpiModerateCount) kpiModerateCount.textContent = cohort.moderateCount;
    if (kpiModeratePct) kpiModeratePct.textContent = `${cohort.moderatePercentage}% of class`;

    if (kpiRemedialCount) kpiRemedialCount.textContent = cohort.remedialCount;
    if (kpiRemedialPct) kpiRemedialPct.textContent = `${cohort.remedialPercentage}% of class`;
  }

  /**
   * Update Badges on Category Tabs
   */
  function updateTabBadges(cohort) {
    if (tabBadgeAll) tabBadgeAll.textContent = cohort.total;
    if (tabBadgeHigh) tabBadgeHigh.textContent = cohort.highCount;
    if (tabBadgeModerate) tabBadgeModerate.textContent = cohort.moderateCount;
    if (tabBadgeRemedial) tabBadgeRemedial.textContent = cohort.remedialCount;
  }

  /**
   * Filter and Sort Student Cohort
   */
  function getFilteredStudents(analyzedStudents) {
    let filtered = [...analyzedStudents];

    // Filter by Category
    if (currentFilter !== 'all') {
      filtered = filtered.filter(item => item.categoryKey === currentFilter);
    }

    // Filter by Search Query
    if (currentSearchQuery.trim() !== '') {
      const q = currentSearchQuery.toLowerCase().trim();
      filtered = filtered.filter(item => {
        const s = item.student;
        return (
          s.name.toLowerCase().includes(q) ||
          s.rollNo.toLowerCase().includes(q) ||
          s.className.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q)
        );
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (currentSort) {
        case 'pct-desc':
          return b.percentage - a.percentage;
        case 'pct-asc':
          return a.percentage - b.percentage;
        case 'name-asc':
          return a.student.name.localeCompare(b.student.name);
        case 'roll-asc':
          return a.student.rollNo.localeCompare(b.student.rollNo);
        default:
          return b.percentage - a.percentage;
      }
    });

    return filtered;
  }

  /**
   * Render Student Cards in the Grid
   */
  function renderStudentCards(analyzedStudents) {
    const list = getFilteredStudents(analyzedStudents);

    if (list.length === 0) {
      studentsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1.5rem; background: var(--bg-surface); border-radius: var(--radius-lg); border: 1px dashed var(--border-subtle);">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" style="color: var(--text-muted); margin-bottom: 0.75rem;">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <h3 style="color: #fff; margin-bottom: 0.35rem;">No students found</h3>
          <p style="color: var(--text-secondary); font-size: 0.88rem;">Try adjusting your search query or selecting a different category filter.</p>
        </div>
      `;
      return;
    }

    studentsGrid.innerHTML = list.map(item => {
      const s = item.student;
      const marks = s.marks || {};
      
      let fillClass = 'fill-high';
      if (item.categoryKey === 'moderate') fillClass = 'fill-moderate';
      if (item.categoryKey === 'remedial') fillClass = 'fill-remedial';

      return `
        <article class="student-card" data-id="${s.id}" tabindex="0" role="button" aria-label="View and edit ${s.name}">
          <div class="student-card-header">
            <img src="${s.avatar}" alt="${s.name}" class="student-avatar" loading="lazy">
            <div class="student-meta">
              <div class="student-name" title="${s.name}">${s.name}</div>
              <div class="student-subinfo">
                <span class="roll-badge">${s.rollNo}</span>
                <span>${s.className}</span>
              </div>
            </div>
          </div>

          <!-- Category Eligibility Badge -->
          <div class="category-status-pill ${item.categoryBadgeClass}">
            <span class="status-dot"></span>
            <span>${item.categoryStatus}</span>
          </div>

          <!-- 5 Exam Marks Matrix -->
          <div class="exam-scores-matrix">
            <div class="exam-col">
              <span class="exam-short-label">Model 1</span>
              <span class="exam-mark-val">${marks.model1 ?? 0}</span>
            </div>
            <div class="exam-col">
              <span class="exam-short-label">Quar.</span>
              <span class="exam-mark-val">${marks.quarterly ?? 0}</span>
            </div>
            <div class="exam-col">
              <span class="exam-short-label">Model 2</span>
              <span class="exam-mark-val">${marks.model2 ?? 0}</span>
            </div>
            <div class="exam-col">
              <span class="exam-short-label">Half-Yr</span>
              <span class="exam-mark-val">${marks.halfYearly ?? 0}</span>
            </div>
            <div class="exam-col">
              <span class="exam-short-label">Model 3</span>
              <span class="exam-mark-val">${marks.model3 ?? 0}</span>
            </div>
          </div>

          <!-- Overall Percentage Progress Bar -->
          <div class="percentage-progress-wrap">
            <div class="progress-info-row">
              <span class="progress-label">Exam Average</span>
              <span class="progress-value">${item.percentage}%</span>
            </div>
            <div class="progress-bar-bg">
              <div class="progress-bar-fill ${fillClass}" style="width: ${Math.min(100, Math.max(5, item.percentage))}%;"></div>
            </div>
          </div>

          <!-- Predictive Analytics Footer -->
          <div class="card-prediction-footer">
            <div class="prediction-stat">
              <span class="pred-caption">Predicted Final</span>
              <span class="pred-val">${item.predictedFinalScore}/100 (${item.passingProbability}% pass odds)</span>
            </div>
            <span class="card-action-btn">
              Edit Marks
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </span>
          </div>
        </article>
      `;
    }).join('');

    // Attach click handlers to student cards
    studentsGrid.querySelectorAll('.student-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        openStudentDetailModal(id);
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const id = card.getAttribute('data-id');
          openStudentDetailModal(id);
        }
      });
    });
  }

  /**
   * Render Chart.js Visualizations
   */
  function renderCharts(cohort) {
    if (typeof Chart === 'undefined') return;

    // 1. Cohort Exam Progression Trend Chart
    const trendCtx = document.getElementById('trendChart');
    if (trendCtx) {
      const examLabels = ['Model 1', 'Quarterly', 'Model 2', 'Half-Yearly', 'Model 3', '★ Predicted Final'];
      const classAvgData = [
        cohort.examAverages.model1,
        cohort.examAverages.quarterly,
        cohort.examAverages.model2,
        cohort.examAverages.halfYearly,
        cohort.examAverages.model3,
        cohort.classAverage // forecast
      ];

      if (trendChartInstance) {
        trendChartInstance.destroy();
      }

      trendChartInstance = new Chart(trendCtx, {
        type: 'line',
        data: {
          labels: examLabels,
          datasets: [
            {
              label: 'Class Cohort Average',
              data: classAvgData,
              borderColor: '#6366f1',
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              borderWidth: 3,
              fill: true,
              tension: 0.35,
              pointBackgroundColor: '#818cf8',
              pointRadius: 5,
              pointHoverRadius: 7
            },
            {
              label: 'Passing Benchmark (40%)',
              data: [40, 40, 40, 40, 40, 40],
              borderColor: 'rgba(244, 63, 94, 0.6)',
              borderWidth: 2,
              borderDash: [6, 6],
              fill: false,
              pointRadius: 0
            },
            {
              label: 'Distinction Benchmark (70%)',
              data: [70, 70, 70, 70, 70, 70],
              borderColor: 'rgba(16, 185, 129, 0.6)',
              borderWidth: 2,
              borderDash: [6, 6],
              fill: false,
              pointRadius: 0
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: {
                color: '#94a3b8',
                font: { family: 'Plus Jakarta Sans', size: 11 }
              }
            },
            tooltip: {
              backgroundColor: '#182238',
              borderColor: 'rgba(255, 255, 255, 0.15)',
              borderWidth: 1,
              titleColor: '#fff',
              bodyColor: '#cbd5e1'
            }
          },
          scales: {
            y: {
              min: 0,
              max: 100,
              ticks: { color: '#64748b', stepSize: 20 },
              grid: { color: 'rgba(255, 255, 255, 0.05)' }
            },
            x: {
              ticks: { color: '#94a3b8', font: { weight: 600 } },
              grid: { color: 'rgba(255, 255, 255, 0.03)' }
            }
          }
        }
      });
    }

    // 2. Performance Category Donut Chart
    const donutCtx = document.getElementById('donutChart');
    if (donutCtx) {
      if (donutChartInstance) {
        donutChartInstance.destroy();
      }

      donutChartInstance = new Chart(donutCtx, {
        type: 'doughnut',
        data: {
          labels: [
            `Above 70% (Pass Easily) [${cohort.highCount}]`,
            `40% - 70% (Final Pass Track) [${cohort.moderateCount}]`,
            `Below 40% (Needs Extra Care) [${cohort.remedialCount}]`
          ],
          datasets: [
            {
              data: [cohort.highCount, cohort.moderateCount, cohort.remedialCount],
              backgroundColor: ['#10b981', '#f59e0b', '#f43f5e'],
              borderWidth: 2,
              borderColor: '#111726',
              hoverOffset: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: '#94a3b8',
                padding: 12,
                font: { family: 'Plus Jakarta Sans', size: 11 },
                usePointStyle: true,
                pointStyle: 'circle'
              }
            },
            tooltip: {
              backgroundColor: '#182238',
              borderColor: 'rgba(255, 255, 255, 0.15)',
              borderWidth: 1,
              titleColor: '#fff',
              bodyColor: '#cbd5e1'
            }
          },
          cutout: '68%'
        }
      });
    }
  }

  /**
   * Open Student Detail & Marks Update Modal
   */
  function openStudentDetailModal(studentId) {
    activeStudentId = studentId;
    const student = StorageManager.getStudentById(studentId);
    if (!student) return;

    modalStudentAvatar.src = student.avatar;
    modalStudentName.textContent = student.name;
    modalStudentRoll.textContent = student.rollNo;
    modalStudentClass.textContent = student.className;
    modalStudentId.textContent = student.id;

    // Fill current mark values
    const m = student.marks || {};
    inputM1.value = m.model1 ?? 0;
    inputQ.value = m.quarterly ?? 0;
    inputM2.value = m.model2 ?? 0;
    inputHY.value = m.halfYearly ?? 0;
    inputM3.value = m.model3 ?? 0;
    inputNotes.value = student.notes || '';

    // Trigger instant calculation and rendering
    updateModalComputedAnalytics();

    modalDetail.classList.add('open');
    modalDetail.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  /**
   * Close Student Detail Modal
   */
  function closeStudentDetailModal() {
    modalDetail.classList.remove('open');
    modalDetail.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    activeStudentId = null;
  }

  /**
   * Real-time calculation within Modal as teacher types scores
   */
  function updateModalComputedAnalytics() {
    const rawStudent = StorageManager.getStudentById(activeStudentId) || { name: 'Student' };
    const tempStudent = {
      ...rawStudent,
      marks: {
        model1: Number(inputM1.value || 0),
        quarterly: Number(inputQ.value || 0),
        model2: Number(inputM2.value || 0),
        halfYearly: Number(inputHY.value || 0),
        model3: Number(inputM3.value || 0)
      }
    };

    const analysis = AnalyticsEngine.analyzeStudent(tempStudent);

    // Update Banner
    modalStatPercentage.textContent = `${analysis.percentage}%`;
    modalStatCategoryTag.textContent = analysis.categoryStatus;
    modalStatCategoryTag.className = `modal-stat-tag ${analysis.categoryBadgeClass}`;

    modalStatPredicted.textContent = `${analysis.predictedFinalScore}/100`;
    modalStatProbability.textContent = `${analysis.passingProbability}%`;
    modalStatRisk.textContent = analysis.riskLevel;

    const sign = analysis.netGrowth >= 0 ? '+' : '';
    modalStatGrowth.textContent = `${sign}${analysis.netGrowth}%`;
    modalStatGrowth.style.color = analysis.netGrowth >= 0 ? '#34d399' : '#fb7185';
    modalStatTrend.textContent = analysis.trendDescription;

    // Update Advisory Box & Checklist
    updateAdvisoryBox(analysis);

    // Update Sparkline Chart
    renderStudentSparkline(analysis);
  }

  /**
   * Render Student Sparkline in Modal
   */
  function renderStudentSparkline(analysis) {
    if (typeof Chart === 'undefined') return;
    const canvas = document.getElementById('studentSparklineChart');
    if (!canvas) return;

    const rawStudents = StorageManager.getStudents();
    const cohort = AnalyticsEngine.analyzeCohort(rawStudents);

    const labels = ['Model 1', 'Quarterly', 'Model 2', 'Half-Yearly', 'Model 3', 'Predicted Final'];
    const studentData = [...analysis.examScores, analysis.predictedFinalScore];
    const classAvgData = [
      cohort.examAverages.model1,
      cohort.examAverages.quarterly,
      cohort.examAverages.model2,
      cohort.examAverages.halfYearly,
      cohort.examAverages.model3,
      cohort.classAverage
    ];

    let strokeColor = '#10b981';
    let bgColor = 'rgba(16, 185, 129, 0.15)';
    if (analysis.categoryKey === 'moderate') {
      strokeColor = '#f59e0b';
      bgColor = 'rgba(245, 158, 11, 0.15)';
    } else if (analysis.categoryKey === 'remedial') {
      strokeColor = '#f43f5e';
      bgColor = 'rgba(244, 63, 94, 0.15)';
    }

    if (studentSparklineInstance) {
      studentSparklineInstance.destroy();
    }

    studentSparklineInstance = new Chart(canvas, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: `${analysis.student.name} Score`,
            data: studentData,
            borderColor: strokeColor,
            backgroundColor: bgColor,
            borderWidth: 3,
            fill: true,
            tension: 0.35,
            pointBackgroundColor: strokeColor,
            pointRadius: 5
          },
          {
            label: 'Cohort Average Benchmark',
            data: classAvgData,
            borderColor: 'rgba(255, 255, 255, 0.25)',
            borderWidth: 2,
            borderDash: [5, 5],
            fill: false,
            pointRadius: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 11 } }
          }
        },
        scales: {
          y: {
            min: 0,
            max: 100,
            ticks: { color: '#64748b', stepSize: 25 },
            grid: { color: 'rgba(255, 255, 255, 0.05)' }
          },
          x: {
            ticks: { color: '#94a3b8' },
            grid: { color: 'rgba(255, 255, 255, 0.03)' }
          }
        }
      }
    });
  }

  /**
   * Update Dynamic Recommendation Box
   */
  function updateAdvisoryBox(analysis) {
    modalAdvisoryBox.className = `advisory-box advisory-${analysis.categoryKey}`;

    if (analysis.categoryKey === 'high') {
      modalAdvisoryHeading.textContent = `★ High Achiever Profile (${analysis.percentage}%) - Eligible to Pass Easily`;
      modalAdvisoryText.textContent = `This student has demonstrated strong mastery across Model 1, Quarterly, Model 2, Half-Yearly, and Model 3. Projected to pass the upcoming final board examination with top tier distinction.`;
      modalActionChecklist.innerHTML = `
        <li>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
          Provide advanced Olympiad / Competitive problem sets to maintain engagement.
        </li>
        <li>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
          Appoint as peer study group leader to foster leadership and solidify concepts.
        </li>
        <li>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
          Refine test time-management to aim for a perfect 100% in final board exam.
        </li>
      `;
    } else if (analysis.categoryKey === 'moderate') {
      modalAdvisoryHeading.textContent = `✓ Moderate Performer Profile (${analysis.percentage}%) - Eligible for Upcoming Final Pass`;
      modalAdvisoryText.textContent = `Student is performing in the 40% - 70% bracket. They have adequate baseline capability and are fully eligible to pass the upcoming final exam with focused preparation.`;
      modalActionChecklist.innerHTML = `
        <li>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
          Target weak scoring exam: Lowest performance was in <strong>${analysis.weakestExam.label} (${analysis.weakestExam.score}/100)</strong>. Review those specific chapters.
        </li>
        <li>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
          Conduct bi-weekly timed mock tests to build exam stamina and speed.
        </li>
        <li>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
          Encourage participation in after-school revision circles to push score beyond 70%.
        </li>
      `;
    } else {
      modalAdvisoryHeading.textContent = `⚠ Critical Academic Alert (${analysis.percentage}%) - Needs Extra Care & Urgent Intervention`;
      modalAdvisoryText.textContent = `Student is scoring below 40%. They are at high risk of failing the final exam without immediate, dedicated remedial intervention across all model exam concepts.`;
      modalActionChecklist.innerHTML = `
        <li>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #fb7185;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <strong>Immediate 1-on-1 Remedial Coaching:</strong> Assign teacher mentor for daily 45-minute concept recovery.
        </li>
        <li>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #fb7185;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <strong>Simplify Study Material:</strong> Focus on core 40% high-weightage topics to guarantee passing threshold.
        </li>
        <li>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #fb7185;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <strong>Parent-Teacher Counseling:</strong> Schedule academic progress review to establish home study routines.
        </li>
      `;
    }
  }

  /**
   * Save Marks changes from Modal
   */
  function handleSaveMarks() {
    if (!activeStudentId) return;

    const updatedMarks = {
      model1: Math.min(100, Math.max(0, Number(inputM1.value || 0))),
      quarterly: Math.min(100, Math.max(0, Number(inputQ.value || 0))),
      model2: Math.min(100, Math.max(0, Number(inputM2.value || 0))),
      halfYearly: Math.min(100, Math.max(0, Number(inputHY.value || 0))),
      model3: Math.min(100, Math.max(0, Number(inputM3.value || 0)))
    };

    const notes = inputNotes.value;
    const updated = StorageManager.updateStudentMarks(activeStudentId, updatedMarks, notes);

    if (updated) {
      showToast(`Marks and predictions updated for ${updated.name}!`, 'success');
      closeStudentDetailModal();
      refreshDashboard();
    }
  }

  /**
   * Delete Student Handler
   */
  function handleDeleteStudent() {
    if (!activeStudentId) return;
    const student = StorageManager.getStudentById(activeStudentId);
    if (!student) return;

    if (confirm(`Are you sure you want to remove ${student.name} (${student.rollNo}) from the cohort?`)) {
      StorageManager.deleteStudent(activeStudentId);
      showToast(`Removed student ${student.name}`, 'warning');
      closeStudentDetailModal();
      refreshDashboard();
    }
  }

  /**
   * Add New Student Form Handler
   */
  function handleAddStudentForm(e) {
    e.preventDefault();
    const name = document.getElementById('add-student-name').value.trim();
    const rollNo = document.getElementById('add-student-roll').value.trim();
    const className = document.getElementById('add-student-class').value.trim();
    const gender = document.getElementById('add-student-gender').value;

    const m1 = document.getElementById('add-mark-m1').value;
    const q = document.getElementById('add-mark-q').value;
    const m2 = document.getElementById('add-mark-m2').value;
    const hy = document.getElementById('add-mark-hy').value;
    const m3 = document.getElementById('add-mark-m3').value;

    if (!name || !rollNo) {
      showToast('Please enter both student name and roll number', 'danger');
      return;
    }

    const newStudent = StorageManager.addStudent({
      name,
      rollNo,
      className,
      gender,
      model1: m1,
      quarterly: q,
      model2: m2,
      halfYearly: hy,
      model3: m3
    });

    showToast(`Successfully registered ${newStudent.name}`, 'success');
    closeAddStudentModal();
    document.getElementById('form-add-student').reset();
    refreshDashboard();
  }

  function openAddStudentModal() {
    modalAdd.classList.add('open');
    modalAdd.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeAddStudentModal() {
    modalAdd.classList.remove('open');
    modalAdd.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  /**
   * Export Cohort Analytics to CSV
   */
  function exportToCSV() {
    const rawStudents = StorageManager.getStudents();
    const cohort = AnalyticsEngine.analyzeCohort(rawStudents);

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Student ID,Roll No,Name,Class,Model 1,Quarterly,Model 2,Half-Yearly,Model 3,Percentage,Category,Predicted Final,Passing Odds,Risk Level\n";

    cohort.students.forEach(item => {
      const s = item.student;
      const m = s.marks || {};
      const row = [
        `"${s.id}"`,
        `"${s.rollNo}"`,
        `"${s.name}"`,
        `"${s.className}"`,
        m.model1 ?? 0,
        m.quarterly ?? 0,
        m.model2 ?? 0,
        m.halfYearly ?? 0,
        m.model3 ?? 0,
        `"${item.percentage}%"`,
        `"${item.categoryTitle}"`,
        item.predictedFinalScore,
        `"${item.passingProbability}%"`,
        `"${item.riskLevel}"`
      ];
      csvContent += row.join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Student_Academic_Prediction_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Academic analysis exported to CSV!', 'success');
  }

  /**
   * Reset Cohort to Default
   */
  function handleResetDemo() {
    if (confirm('Reset cohort to default sample students and marks?')) {
      StorageManager.resetToDefault();
      showToast('Cohort reset to default sample dataset', 'success');
      refreshDashboard();
    }
  }

  /**
   * Toast Notification Helper
   */
  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = `
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
    `;
    if (type === 'warning') {
      icon = `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" style="color: #f59e0b;">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      `;
    } else if (type === 'danger') {
      icon = `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" style="color: #f43f5e;">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
      `;
    }

    toast.innerHTML = `${icon}<span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toastContainer.contains(toast)) {
          toastContainer.removeChild(toast);
        }
      }, 300);
    }, 3500);
  }

  /**
   * Setup Event Listeners
   */
  function setupEventListeners() {
    // Category Tabs
    categoryTabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        categoryTabBtns.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        currentFilter = btn.getAttribute('data-cat');
        
        const rawStudents = StorageManager.getStudents();
        const cohort = AnalyticsEngine.analyzeCohort(rawStudents);
        renderStudentCards(cohort.students);
      });
    });

    // Search Input
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        currentSearchQuery = e.target.value;
        const rawStudents = StorageManager.getStudents();
        const cohort = AnalyticsEngine.analyzeCohort(rawStudents);
        renderStudentCards(cohort.students);
      });
    }

    // Sort Dropdown
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        const rawStudents = StorageManager.getStudents();
        const cohort = AnalyticsEngine.analyzeCohort(rawStudents);
        renderStudentCards(cohort.students);
      });
    }

    // Live Mark Inputs in Modal (recalculate immediately on typing!)
    [inputM1, inputQ, inputM2, inputHY, inputM3].forEach(input => {
      if (input) {
        input.addEventListener('input', () => {
          updateModalComputedAnalytics();
        });
      }
    });

    // Modal Action Buttons
    const btnSaveMarks = document.getElementById('modal-btn-save');
    if (btnSaveMarks) btnSaveMarks.addEventListener('click', handleSaveMarks);

    const btnDeleteStudent = document.getElementById('modal-btn-delete');
    if (btnDeleteStudent) btnDeleteStudent.addEventListener('click', handleDeleteStudent);

    const btnCloseModal = document.getElementById('modal-close-btn');
    if (btnCloseModal) btnCloseModal.addEventListener('click', closeStudentDetailModal);

    const btnCancelModal = document.getElementById('modal-btn-cancel');
    if (btnCancelModal) btnCancelModal.addEventListener('click', closeStudentDetailModal);

    // Close on overlay backdrop click
    if (modalDetail) {
      modalDetail.addEventListener('click', (e) => {
        if (e.target === modalDetail) closeStudentDetailModal();
      });
    }

    // Add Student Modal buttons
    const btnOpenAdd = document.getElementById('btn-open-add-student');
    if (btnOpenAdd) btnOpenAdd.addEventListener('click', openAddStudentModal);

    const btnCloseAdd = document.getElementById('modal-add-close-btn');
    if (btnCloseAdd) btnCloseAdd.addEventListener('click', closeAddStudentModal);

    const btnCancelAdd = document.getElementById('modal-add-btn-cancel');
    if (btnCancelAdd) btnCancelAdd.addEventListener('click', closeAddStudentModal);

    if (modalAdd) {
      modalAdd.addEventListener('click', (e) => {
        if (e.target === modalAdd) closeAddStudentModal();
      });
    }

    const formAddStudent = document.getElementById('form-add-student');
    if (formAddStudent) formAddStudent.addEventListener('submit', handleAddStudentForm);

    // Top action buttons
    const btnResetData = document.getElementById('btn-reset-data');
    if (btnResetData) btnResetData.addEventListener('click', handleResetDemo);

    const btnExportCSV = document.getElementById('btn-export-csv');
    if (btnExportCSV) btnExportCSV.addEventListener('click', exportToCSV);

    // Escape key to close any active modal
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (modalDetail && modalDetail.classList.contains('open')) closeStudentDetailModal();
        if (modalAdd && modalAdd.classList.contains('open')) closeAddStudentModal();
      }
    });
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
