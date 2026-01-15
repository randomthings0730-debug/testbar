
import { Subject, ErrorEntry } from "../types";

/**
 * 簡單的本地學習計劃生成
 */
export async function generateWeeklyPlan(examDate: string, weakSubjects: Subject[]) {
  try {
    const plan: any[] = [];
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    weakSubjects.forEach((subject, index) => {
      const day = daysOfWeek[index % 7];
      plan.push({
        day,
        focus: `Focus on ${subject}`,
        tasks: [
          `Review key concepts in ${subject}`,
          `Practice 20 questions on ${subject}`,
          `Create summary notes`
        ]
      });
    });
    
    return plan;
  } catch (error) {
    console.error("Planner generation error:", error);
    return [];
  }
}

/**
 * 簡單的本地學習洞察
 */
export async function getStudyInsights(errors: ErrorEntry[]) {
  try {
    if (!errors.length) {
      return "No errors recorded yet. Great progress!\nKeep practicing consistently.\nReview rules periodically.";
    }

    const subjectCounts: Record<string, number> = {};
    errors.forEach(e => {
      subjectCounts[e.subject] = (subjectCounts[e.subject] || 0) + 1;
    });

    const weakestSubject = Object.entries(subjectCounts).sort((a, b) => b[1] - a[1])[0];
    
    const insights = [
      `You've made ${errors.length} errors total.`,
      `Most errors in: ${weakestSubject?.[0] || 'General'}`,
      `Error rate: ${((errors.length / (errors.length + 100)) * 100).toFixed(1)}%`,
      `\nRecommendations:`,
      `• Review ${weakestSubject?.[0] || 'core topics'} rules`,
      `• Practice similar questions`,
      `• Create flashcards for weak areas`
    ];
    
    return insights.join('\n');
  } catch (error) {
    console.error("Study insights error:", error);
    return "Unable to generate insights. Keep practicing!";
  }
}
