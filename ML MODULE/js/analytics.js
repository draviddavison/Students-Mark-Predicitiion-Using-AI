/**
 * Academic Performance Prediction & Analytics Engine
 * Covers:
 *  - 5 Exams: Model 1, Quarterly, Model 2, Half-Yearly, Model 3
 *  - Student Percentage calculation
 *  - Categorization:
 *      * > 70%: Eligible & can pass easily
 *      * 40% - 70%: Eligible & can pass upcoming final exam
 *      * < 40%: Must need extra care
 *  - Final Exam Predictive Modeling & Passing Probability
 *  - Cohort Benchmark & Risk Diagnostics
 */

const EXAM_KEYS = ['model1', 'quarterly', 'model2', 'halfYearly', 'model3'];
const EXAM_LABELS = {
  model1: 'Model 1',
  quarterly: 'Quarterly',
  model2: 'Model 2',
  halfYearly: 'Half Yearly',
  model3: 'Model 3'
};

const EXAM_WEIGHTS = {
  model1: 0.10,
  quarterly: 0.15,
  model2: 0.20,
  halfYearly: 0.25,
  model3: 0.30
};

class AnalyticsEngine {
  /**
   * Analyze an individual student's records
   */
  static analyzeStudent(student) {
    const marks = student.marks || {};
    const values = EXAM_KEYS.map(k => Number(marks[k] ?? 0));
    const validScores = values.filter(v => !isNaN(v));

    // Calculate simple average percentage
    const sum = validScores.reduce((acc, curr) => acc + curr, 0);
    const average = validScores.length ? Number((sum / validScores.length).toFixed(1)) : 0;

    // Weighted academic score emphasizing progressive exams
    let weightedSum = 0;
    let weightTotal = 0;
    EXAM_KEYS.forEach(key => {
      const score = Number(marks[key] ?? 0);
      const w = EXAM_WEIGHTS[key];
      weightedSum += score * w;
      weightTotal += w;
    });
    const weightedAverage = weightTotal > 0 ? Number((weightedSum / weightTotal).toFixed(1)) : average;

    // Determine category based on specified criteria:
    // Above 70% | 40% to 70% | Below 40%
    let categoryKey = '';
    let categoryTitle = '';
    let categoryStatus = '';
    let categoryBadgeClass = '';
    let riskLevel = '';
    let recommendation = '';

    if (average >= 70) {
      categoryKey = 'high';
      categoryTitle = 'High Achiever (Above 70%)';
      categoryStatus = 'Eligible - Will Pass Easily';
      categoryBadgeClass = 'badge-high';
      riskLevel = 'Low Risk / Distinction';
      recommendation = 'Maintain momentum. Recommend advanced problem-solving challenges and peer mentoring opportunities.';
    } else if (average >= 40) {
      categoryKey = 'moderate';
      categoryTitle = 'Moderate Performer (40% - 70%)';
      categoryStatus = 'Eligible - Final Exam Pass Track';
      categoryBadgeClass = 'badge-moderate';
      riskLevel = 'Moderate Risk / Passing Track';
      recommendation = 'Eligible to pass final exam. Focus on key weaker chapters, weekly mock quizzes, and timed revision.';
    } else {
      categoryKey = 'remedial';
      categoryTitle = 'Needs Extra Care (Below 40%)';
      categoryStatus = 'Extra Care Required - At Risk';
      categoryBadgeClass = 'badge-remedial';
      riskLevel = 'High Risk / Remedial Alert';
      recommendation = 'Mandatory extra coaching sessions needed. Assign remedial study guide, parent-teacher review, and foundational concept drills.';
    }

    // Progression trend analysis (Model 1 to Model 3)
    const m1 = Number(marks.model1 || 0);
    const m3 = Number(marks.model3 || 0);
    const netGrowth = Number((m3 - m1).toFixed(1));

    // Simple Linear Regression over the 5 exams [x=0..4]
    const n = 5;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    values.forEach((y, x) => {
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumXX += x * x;
    });
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Extrapolate to upcoming Final Exam (x = 5)
    let predictedFinalScore = Math.round(intercept + slope * 5);
    // Blend with weighted average for realistic resilience
    predictedFinalScore = Math.round(0.65 * weightedAverage + 0.35 * predictedFinalScore);
    predictedFinalScore = Math.max(10, Math.min(100, predictedFinalScore)); // clamp 10 - 100

    // Passing Probability for Upcoming Final Exam (Passing mark is 40%)
    let passingProbability = 0;
    if (predictedFinalScore >= 75) {
      passingProbability = Math.min(99, Math.round(90 + (predictedFinalScore - 75) * 0.36));
    } else if (predictedFinalScore >= 55) {
      passingProbability = Math.round(75 + (predictedFinalScore - 55) * 0.75);
    } else if (predictedFinalScore >= 40) {
      passingProbability = Math.round(52 + (predictedFinalScore - 40) * 1.5);
    } else {
      passingProbability = Math.max(12, Math.round(15 + (predictedFinalScore / 40) * 35));
    }

    // Determine Best and Weakest Exam
    let bestExam = 'model1';
    let weakestExam = 'model1';
    let maxVal = -1;
    let minVal = 999;

    EXAM_KEYS.forEach(key => {
      const val = Number(marks[key] ?? 0);
      if (val > maxVal) {
        maxVal = val;
        bestExam = key;
      }
      if (val < minVal) {
        minVal = val;
        weakestExam = key;
      }
    });

    let trendDescription = '';
    if (slope > 1.5) {
      trendDescription = 'Steadily Ascending (+ Trend)';
    } else if (slope < -1.5) {
      trendDescription = 'Declining Trajectory (- Trend)';
    } else {
      trendDescription = 'Consistent Performance';
    }

    return {
      student,
      percentage: average,
      weightedPercentage: weightedAverage,
      categoryKey,
      categoryTitle,
      categoryStatus,
      categoryBadgeClass,
      riskLevel,
      recommendation,
      examScores: values,
      netGrowth,
      slope: Number(slope.toFixed(2)),
      trendDescription,
      predictedFinalScore,
      passingProbability,
      bestExam: { key: bestExam, label: EXAM_LABELS[bestExam], score: maxVal },
      weakestExam: { key: weakestExam, label: EXAM_LABELS[weakestExam], score: minVal }
    };
  }

  /**
   * Run full cohort diagnostics
   */
  static analyzeCohort(students) {
    const analyzed = students.map(s => this.analyzeStudent(s));

    const totalStudents = analyzed.length;
    if (totalStudents === 0) {
      return {
        total: 0,
        highCount: 0,
        moderateCount: 0,
        remedialCount: 0,
        averagePercentage: 0,
        passRate: 0,
        examAverages: { model1: 0, quarterly: 0, model2: 0, halfYearly: 0, model3: 0 },
        students: []
      };
    }

    const highStudents = analyzed.filter(a => a.categoryKey === 'high');
    const moderateStudents = analyzed.filter(a => a.categoryKey === 'moderate');
    const remedialStudents = analyzed.filter(a => a.categoryKey === 'remedial');

    const totalPercentage = analyzed.reduce((acc, curr) => acc + curr.percentage, 0);
    const classAverage = Number((totalPercentage / totalStudents).toFixed(1));

    // Eligible students who can pass (>= 40%)
    const eligibleCount = highStudents.length + moderateStudents.length;
    const passRate = Number(((eligibleCount / totalStudents) * 100).toFixed(1));

    // Exam-wise cohort averages
    const examAverages = {};
    EXAM_KEYS.forEach((key, index) => {
      const sum = analyzed.reduce((acc, curr) => acc + curr.examScores[index], 0);
      examAverages[key] = Number((sum / totalStudents).toFixed(1));
    });

    // Predicted cohort pass rate for final exam
    const predictedPassCount = analyzed.filter(a => a.predictedFinalScore >= 40).length;
    const predictedPassRate = Number(((predictedPassCount / totalStudents) * 100).toFixed(1));

    return {
      total: totalStudents,
      highCount: highStudents.length,
      moderateCount: moderateStudents.length,
      remedialCount: remedialStudents.length,
      highPercentage: Number(((highStudents.length / totalStudents) * 100).toFixed(1)),
      moderatePercentage: Number(((moderateStudents.length / totalStudents) * 100).toFixed(1)),
      remedialPercentage: Number(((remedialStudents.length / totalStudents) * 100).toFixed(1)),
      classAverage,
      passRate,
      predictedPassRate,
      examAverages,
      students: analyzed
    };
  }
}

window.AnalyticsEngine = AnalyticsEngine;
window.EXAM_KEYS = EXAM_KEYS;
window.EXAM_LABELS = EXAM_LABELS;
window.EXAM_WEIGHTS = EXAM_WEIGHTS;
