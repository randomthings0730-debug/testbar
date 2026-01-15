import { RuleCard, ErrorEntry, MemoryStats, StudyTask } from '../types';
import { addDays, format, isAfter, parseISO } from 'date-fns';

/**
 * Rule Deck Manager - Manages spaced repetition for important rules
 * 用於管理 Rule Deck 並追蹤複習進度
 */
export class RuleDeckManager {
  /**
   * Create a new rule card from an error entry
   * 從錯誤中創建新的規則卡
   */
  static createRuleCard(
    error: ErrorEntry,
    priority: 'high' | 'medium' | 'low' = 'high'
  ): RuleCard {
    const today = new Date();
    return {
      id: `rule-${error.id}-${Date.now()}`,
      subject: error.subject,
      ruleText: error.rule,
      priority,
      createdDate: format(today, 'yyyy-MM-dd'),
      next_review_date: format(addDays(today, 1), 'yyyy-MM-dd'), // Review tomorrow
      reviewCount: 0,
      lastReviewDate: '',
    };
  }

  /**
   * Update rule card after review
   * 根據複習結果更新規則卡
   */
  static updateRuleCard(
    card: RuleCard,
    performanceScore: number // 0-100, where 100 = perfect
  ): RuleCard {
    const today = new Date();
    const lastReviewDate = format(today, 'yyyy-MM-dd');
    
    // Adaptive spaced repetition: adjust next review based on performance
    let daysUntilNextReview = 1;
    
    if (card.priority === 'high') {
      daysUntilNextReview = performanceScore > 80 ? 3 : 1;
    } else if (card.priority === 'medium') {
      daysUntilNextReview = performanceScore > 80 ? 5 : 2;
    } else {
      daysUntilNextReview = performanceScore > 80 ? 7 : 3;
    }

    return {
      ...card,
      reviewCount: card.reviewCount + 1,
      lastReviewDate,
      next_review_date: format(addDays(today, daysUntilNextReview), 'yyyy-MM-dd'),
    };
  }

  /**
   * Get due rules for today's review
   * 獲取今天要複習的規則
   */
  static getDueRulesForToday(deck: RuleCard[], today: Date = new Date()): RuleCard[] {
    const todayStr = format(today, 'yyyy-MM-dd');
    return deck.filter(card => {
      const nextReviewStr = card.next_review_date;
      return nextReviewStr <= todayStr;
    });
  }

  /**
   * Calculate memory statistics
   * 計算記憶統計
   */
  static calculateMemoryStats(
    deck: RuleCard[],
    tasks: StudyTask[],
    totalStudyMinutes: number
  ): MemoryStats {
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');

    // Count overdue rules
    const overdueRules = deck.filter(card => {
      return card.next_review_date < todayStr;
    }).length;

    // Calculate review coverage percentage
    const reviewCoveragePercentage = deck.length > 0
      ? Math.round(((deck.length - overdueRules) / deck.length) * 100)
      : 0;

    // Calculate active recall time percentage
    const activeRecallMinutes = tasks
      .filter(t => 
        t.memoryTag?.includes('active-recall') ||
        t.memoryTag?.includes('rule-writing') ||
        t.memoryTag?.includes('recall') ||
        t.type === 'ActiveRecall' ||
        t.type === 'RuleWriting'
      )
      .reduce((sum, t) => sum + t.estimatedMinutes, 0);

    const activeRecallTimePercent = totalStudyMinutes > 0
      ? Math.round((activeRecallMinutes / totalStudyMinutes) * 100)
      : 0;

    return {
      totalRulesInDeck: deck.length,
      overduedRules: overdueRules,
      reviewCoveragePercentage,
      activeRecallTimePercent,
    };
  }

  /**
   * Generate error analysis summary from tasks
   * 從任務中生成錯誤分析摘要
   */
  static analyzeErrorPatterns(
    errors: ErrorEntry[]
  ): { topic: string; count: number; priority: 'high' | 'medium' | 'low' }[] {
    const patterns: { [key: string]: number } = {};

    errors.forEach(error => {
      if (!patterns[error.subtopic]) {
        patterns[error.subtopic] = 0;
      }
      patterns[error.subtopic]++;
    });

    return Object.entries(patterns)
      .map(([topic, count]) => {
        const priority: 'high' | 'medium' | 'low' = count >= 3 ? 'high' : count >= 2 ? 'medium' : 'low';
        return {
          topic,
          count,
          priority,
        };
      })
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Create targeted error review tasks
   * 創建針對性的錯誤複習任務
   */
  static createErrorReviewTasks(
    errorPatterns: { topic: string; count: number; priority: 'high' | 'medium' | 'low' }[],
    startDate: Date,
    subject: any // Subject enum
  ): StudyTask[] {
    const tasks: StudyTask[] = [];
    const reviewDates = [1, 3]; // Review 1 day later and 3 days later

    errorPatterns
      .filter(p => p.priority === 'high')
      .slice(0, 5) // Top 5 error patterns
      .forEach((pattern, idx) => {
        reviewDates.forEach((gap, dayIdx) => {
          const reviewDate = addDays(startDate, gap);
          const dateStr = format(reviewDate, 'yyyy-MM-dd');

          tasks.push({
            id: `error-review-${idx}-${dayIdx}-${dateStr}`,
            date: dateStr,
            type: 'ErrorAnalysis',
            subject,
            description: `[Error Analysis] ${pattern.topic}: Write key rules from memory (appeared ${pattern.count}x in errors)`,
            completed: false,
            estimatedMinutes: 15,
            memoryTag: `error-${pattern.priority}`,
          });
        });
      });

    return tasks;
  }
}
