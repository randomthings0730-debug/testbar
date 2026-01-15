import { StudyTask, Subject, RuleCard } from '../types';
import { addDays, differenceInDays, format, isWeekend, getMonth, getDate, parseISO } from 'date-fns';

/**
 * Core Memory Principles:
 * 1. Spaced Repetition: 1 day, 3 days, 1 week, 2 weeks intervals
 * 2. Active Retrieval Practice: Write/speak/solve, don't just re-read
 * 3. Task Variety: Rotate between reading, flashcards, rule writing, problem solving
 */

export class ScheduleService {
  private static readonly SPACED_INTERVALS = [1, 3, 7, 14]; // days
  private static readonly MBE_SUBJECTS = [
    Subject.TORTS,
    Subject.CONTRACTS,
    Subject.EVIDENCE,
    Subject.CRIMINAL_LAW,
    Subject.CON_LAW,
    Subject.REAL_PROPERTY,
    Subject.CIV_PRO,
  ];

  /**
   * Generate complete study plan from start date to exam date
   * Implements phase-based strategy with embedded memory mechanisms
   */
  static generateCompletePlan(
    startDate: Date,
    endDate: Date,
    includePreviousTasks: StudyTask[] = []
  ): StudyTask[] {
    const allTasks: StudyTask[] = [];
    const preservedTasks = includePreviousTasks.filter(t => {
      const tDate = parseISO(t.date);
      return tDate < startDate;
    });

    // Generate tasks for each day from start to end
    for (let d = new Date(startDate); d <= endDate; d = addDays(d, 1)) {
      const dateStr = format(d, 'yyyy-MM-dd');
      const month = getMonth(d); // 0 = Jan, 1 = Feb, etc.
      const dayOfMonth = getDate(d);
      const isWknd = isWeekend(d);
      const daysSinceStart = differenceInDays(d, startDate);

      // Route to phase-specific generator
      if (month === 0) { // January
        allTasks.push(...this.generateJanuaryTasks(dateStr, dayOfMonth, daysSinceStart, isWknd));
      } else if (month === 1) { // February
        allTasks.push(...this.generateFebruaryTasks(dateStr, dayOfMonth, daysSinceStart, isWknd));
      } else if (month === 2) { // March
        allTasks.push(...this.generateMarchTasks(dateStr, dayOfMonth, daysSinceStart, isWknd));
      } else if (month === 3) { // April
        allTasks.push(...this.generateAprilTasks(dateStr, dayOfMonth, daysSinceStart, isWknd));
      } else if (month === 4) { // May
        allTasks.push(...this.generateMayTasks(dateStr, dayOfMonth, daysSinceStart, isWknd));
      } else if (month === 5) { // June
        allTasks.push(...this.generateJuneTasks(dateStr, dayOfMonth, daysSinceStart, isWknd));
      }
    }

    return [...preservedTasks, ...allTasks];
  }

  /**
   * JANUARY: MBE Foundation + MEE Micro (Memory Version)
   * Focus: Building MBE foundation with memory mechanisms
   */
  private static generateJanuaryTasks(
    dateStr: string,
    dayOfMonth: number,
    daysSinceStart: number,
    isWknd: boolean
  ): StudyTask[] {
    const tasks: StudyTask[] = [];
    const weekNum = Math.floor((dayOfMonth - 1) / 7);
    const subjectRotation = this.MBE_SUBJECTS[weekNum % this.MBE_SUBJECTS.length];

    if (!isWknd) {
      // Weekday: 2-hour structure with Active Recall block
      // Hour 1: Read & Practice
      tasks.push({
        id: `jan-outline-${dateStr}`,
        date: dateStr,
        type: 'Outline',
        subject: subjectRotation,
        description: `Read and simplify ${subjectRotation} rules - identify 5 key elements`,
        completed: false,
        estimatedMinutes: 40,
        memoryTag: 'foundation',
      });

      tasks.push({
        id: `jan-mbe-${dateStr}`,
        date: dateStr,
        type: 'MBE',
        subject: subjectRotation,
        description: `${subjectRotation}: Solve 15 questions on UWorld`,
        completed: false,
        estimatedMinutes: 50,
        memoryTag: 'practice',
      });

      // Last 20-30 mins: Active Recall Block (Mandatory)
      tasks.push({
        id: `jan-recall-${dateStr}`,
        date: dateStr,
        type: 'ActiveRecall',
        subject: subjectRotation,
        description: `[Active Recall] Write out ${subjectRotation} rule elements on blank paper (3-5 rules), then check against outline`,
        completed: false,
        estimatedMinutes: 25,
        memoryTag: 'active-recall',
      });
    } else if (dayOfMonth >= 24) {
      // Last weekend: Mini Mock
      tasks.push({
        id: `jan-mock-${dateStr}`,
        date: dateStr,
        type: 'MockExam',
        subject: subjectRotation,
        description: `50-Question Mixed MBE Mock Exam (timed)`,
        completed: false,
        estimatedMinutes: 90,
        count: 50,
      });

      // Mock Review
      const reviewDate = addDays(parseISO(dateStr), 1);
      tasks.push({
        id: `jan-mock-review-${dateStr}`,
        date: format(reviewDate, 'yyyy-MM-dd'),
        type: 'MockReview',
        subject: subjectRotation,
        description: `Review mock errors and patch outline with missed rules`,
        completed: false,
        estimatedMinutes: 120,
        memoryTag: 'error-analysis',
        linkedTaskId: `jan-mock-${dateStr}`,
      });
    } else {
      // Other weekends: Catchup
      tasks.push({
        id: `jan-catchup-${dateStr}`,
        date: dateStr,
        type: 'Outline',
        subject: subjectRotation,
        description: `Catch up on missed outlines and solve 10 extra questions`,
        completed: false,
        estimatedMinutes: 120,
      });

      tasks.push({
        id: `jan-recall-wknd-${dateStr}`,
        date: dateStr,
        type: 'ActiveRecall',
        subject: subjectRotation,
        description: `[Active Recall] Oral review - explain ${subjectRotation} key rules out loud`,
        completed: false,
        estimatedMinutes: 60,
        memoryTag: 'active-recall',
      });
    }

    return tasks;
  }

  /**
   * FEBRUARY: MBE Second Round + Weekly Mocks + Spaced Repetition
   * Focus: Building habit of spaced repetition, error analysis
   */
  private static generateFebruaryTasks(
    dateStr: string,
    dayOfMonth: number,
    daysSinceStart: number,
    isWknd: boolean
  ): StudyTask[] {
    const tasks: StudyTask[] = [];
    const weekOfMonth = Math.floor((dayOfMonth - 1) / 7);
    const subjectIndex = weekOfMonth % this.MBE_SUBJECTS.length;
    const subject = this.MBE_SUBJECTS[subjectIndex];

    if (!isWknd) {
      // Weekday: 2-hour with Active Recall + Spaced Repetition nodes
      tasks.push({
        id: `feb-outline-${dateStr}`,
        date: dateStr,
        type: 'Outline',
        subject: subject,
        description: `Deepen ${subject} outline - add case examples`,
        completed: false,
        estimatedMinutes: 40,
      });

      tasks.push({
        id: `feb-mbe-${dateStr}`,
        date: dateStr,
        type: 'MBE',
        subject: subject,
        description: `${subject}: 20 questions on latest concepts`,
        completed: false,
        estimatedMinutes: 60,
        memoryTag: 'practice',
        count: 20,
      });

      // Active Recall block
      tasks.push({
        id: `feb-recall-${dateStr}`,
        date: dateStr,
        type: 'ActiveRecall',
        subject: subject,
        description: `[Active Recall] Write 4-5 key ${subject} rules on blank paper, compare with notes`,
        completed: false,
        estimatedMinutes: 20,
        memoryTag: 'active-recall',
      });

      // Add spaced repetition review every 3 days
      if (dayOfMonth % 3 === 0) {
        tasks.push({
          id: `feb-spaced-${dateStr}`,
          date: dateStr,
          type: 'Review',
          subject: subject,
          description: `[Spaced Repetition] Review ${subject} from 3 days ago - rewrite rules without notes`,
          completed: false,
          estimatedMinutes: 20,
          memoryTag: 'spaced-rep-3',
        });
      }

      // 1-week spaced repetition
      if (dayOfMonth % 7 === 0 && dayOfMonth !== 0) {
        tasks.push({
          id: `feb-spaced-week-${dateStr}`,
          date: dateStr,
          type: 'Review',
          subject: subject,
          description: `[Spaced Repetition] Week-long review - ${subject} rules from day 1`,
          completed: false,
          estimatedMinutes: 25,
          memoryTag: 'spaced-rep-7',
        });
      }
    } else {
      // Weekend: 50-question mock every other weekend
      if (Math.floor((dayOfMonth - 1) / 14) % 2 === 0) {
        tasks.push({
          id: `feb-mock-${dateStr}`,
          date: dateStr,
          type: 'MockExam',
          subject: subject,
          description: `50-Question Mixed MBE Mock (timed, 60 min)`,
          completed: false,
          estimatedMinutes: 90,
          count: 50,
        });

        // Generate error topic list for targeted review
        const reviewDate = addDays(parseISO(dateStr), 2);
        tasks.push({
          id: `feb-error-review-${dateStr}`,
          date: format(reviewDate, 'yyyy-MM-dd'),
          type: 'ErrorAnalysis',
          subject: subject,
          description: `[Targeted Spaced Rep] Review mock error topics - write rules for missed concepts without looking at questions`,
          completed: false,
          estimatedMinutes: 30,
          memoryTag: 'error-spaced-rep',
          linkedTaskId: `feb-mock-${dateStr}`,
        });
      } else {
        // Other weekend: Reinforcement
        tasks.push({
          id: `feb-reinforce-${dateStr}`,
          date: dateStr,
          type: 'Review',
          subject: subject,
          description: `Review past week errors and reinforce weak areas`,
          completed: false,
          estimatedMinutes: 120,
          memoryTag: 'reinforcement',
        });
      }
    }

    return tasks;
  }

  /**
   * MARCH: MEE Foundation + Template Learning (Memory Version)
   * Focus: Active recall for MEE structure and rule writing
   */
  private static generateMarchTasks(
    dateStr: string,
    dayOfMonth: number,
    daysSinceStart: number,
    isWknd: boolean
  ): StudyTask[] {
    const tasks: StudyTask[] = [];
    const weekNum = Math.floor((dayOfMonth - 1) / 7);
    const weekSubjects = [Subject.CONTRACTS, Subject.TORTS, Subject.EVIDENCE, Subject.CRIMINAL_LAW];
    const mainSubject = weekSubjects[weekNum % weekSubjects.length];

    if (!isWknd) {
      const dayOfWeek = new Date(dateStr).getDay();

      // Monday: Rule writing practice
      if (dayOfWeek === 1) {
        tasks.push({
          id: `mar-rules-${dateStr}`,
          date: dateStr,
          type: 'RuleWriting',
          subject: mainSubject,
          description: `[Active Recall] Write 5 common ${mainSubject} essay rules (offer, acceptance, consideration, etc.) on blank paper`,
          completed: false,
          estimatedMinutes: 30,
          memoryTag: 'active-recall-rules',
        });

        tasks.push({
          id: `mar-practice-${dateStr}`,
          date: dateStr,
          type: 'Review',
          subject: mainSubject,
          description: `MBE practice: 20 ${mainSubject} questions`,
          completed: false,
          estimatedMinutes: 45,
          count: 20,
        });
      }
      // Wednesday: Delayed recall - last week's subject
      else if (dayOfWeek === 3) {
        const priorSubject = weekSubjects[(weekNum - 1) % weekSubjects.length];
        tasks.push({
          id: `mar-delayed-${dateStr}`,
          date: dateStr,
          type: 'ActiveRecall',
          subject: priorSubject,
          description: `[Delayed Recall] Write ${priorSubject} rules from last week without notes, then check`,
          completed: false,
          estimatedMinutes: 30,
          memoryTag: 'delayed-recall',
        });

        tasks.push({
          id: `mar-outline-${dateStr}`,
          date: dateStr,
          type: 'Outline',
          subject: mainSubject,
          description: `Study current week's ${mainSubject} outline`,
          completed: false,
          estimatedMinutes: 40,
        });
      }
      // Friday: MEE issue structure & rewriting practice
      else if (dayOfWeek === 5) {
        tasks.push({
          id: `mar-template-${dateStr}`,
          date: dateStr,
          type: 'TemplateReview',
          subject: mainSubject,
          description: `[Template Practice] Rewrite a ${mainSubject} MEE issue (issue headings + short rules only, no full answers)`,
          completed: false,
          estimatedMinutes: 40,
          memoryTag: 'template-recall',
        });

        tasks.push({
          id: `mar-mbe-${dateStr}`,
          date: dateStr,
          type: 'MBE',
          subject: mainSubject,
          description: `Timed ${mainSubject} MCQ: 15 questions in 18 minutes`,
          completed: false,
          estimatedMinutes: 30,
          count: 15,
        });
      } else {
        // Other weekdays: General study
        tasks.push({
          id: `mar-general-${dateStr}`,
          date: dateStr,
          type: 'Outline',
          subject: mainSubject,
          description: `Outline review and case reading`,
          completed: false,
          estimatedMinutes: 60,
        });
      }
    } else {
      // Weekend: MEE practice + MPT introduction
      const weekOfMonth = Math.floor((dayOfMonth - 1) / 7);

      tasks.push({
        id: `mar-mee-${dateStr}`,
        date: dateStr,
        type: 'MEE',
        subject: mainSubject,
        description: `Timed MEE essay (${mainSubject}): 30 minutes`,
        completed: false,
        estimatedMinutes: 40,
      });

      // Review with format-level retrieval practice
      const reviewDate = addDays(parseISO(dateStr), 1);
      tasks.push({
        id: `mar-mee-review-${dateStr}`,
        date: format(reviewDate, 'yyyy-MM-dd'),
        type: 'MockReview',
        subject: mainSubject,
        description: `[Format Retrieval Practice] Rewrite MEE format skeleton (headings, structure) from memory without looking at original`,
        completed: false,
        estimatedMinutes: 25,
        memoryTag: 'format-recall',
        linkedTaskId: `mar-mee-${dateStr}`,
      });

      // Optional: MPT introduction
      if (weekOfMonth % 2 === 0) {
        tasks.push({
          id: `mar-mpt-${dateStr}`,
          date: format(addDays(parseISO(dateStr), 1), 'yyyy-MM-dd'),
          type: 'Review',
          subject: Subject.CIV_PRO,
          description: `Introduction to MPT format - study instructions and task types`,
          completed: false,
          estimatedMinutes: 45,
        });
      }
    }

    return tasks;
  }

  /**
   * APRIL: MEE Three-Essay Sessions + MPT (Memory Version)
   * Focus: High-volume MEE with integrated spaced repetition
   */
  private static generateAprilTasks(
    dateStr: string,
    dayOfMonth: number,
    daysSinceStart: number,
    isWknd: boolean
  ): StudyTask[] {
    const tasks: StudyTask[] = [];
    const weekNum = Math.floor((dayOfMonth - 1) / 7);
    const subjects = [Subject.CONTRACTS, Subject.TORTS, Subject.EVIDENCE, Subject.CRIMINAL_LAW];
    const mainSubject = subjects[weekNum % subjects.length];

    if (!isWknd) {
      // Weekday: Rewriting old MEE practice
      tasks.push({
        id: `apr-rewrite-${dateStr}`,
        date: dateStr,
        type: 'MEE',
        subject: mainSubject,
        description: `[Rewriting] Rewrite old ${mainSubject} MEE: Step 1 (10 min) - sketch issue structure from memory only`,
        completed: false,
        estimatedMinutes: 30,
        memoryTag: 'rewrite-phase-1',
      });

      tasks.push({
        id: `apr-condense-${dateStr}`,
        date: dateStr,
        type: 'Review',
        subject: mainSubject,
        description: `[Rewriting] Step 2 - shorten rules and integrate facts more tightly`,
        completed: false,
        estimatedMinutes: 20,
        memoryTag: 'rewrite-phase-2',
      });

      // Spaced rep for past MEE
      if (dayOfMonth % 2 === 0) {
        tasks.push({
          id: `apr-spaced-mee-${dateStr}`,
          date: dateStr,
          type: 'ActiveRecall',
          subject: mainSubject,
          description: `[Spaced Rep] View only ${mainSubject} MEE summary (no answer), rewrite issue structure`,
          completed: false,
          estimatedMinutes: 25,
          memoryTag: 'mee-spaced-rep',
        });
      }
    } else {
      // Weekend: 3-essay session
      const isMidweek = Math.floor((dayOfMonth - 1) / 7) % 2 === 0;

      if (isMidweek) {
        // Essay 1
        tasks.push({
          id: `apr-mee-1-${dateStr}`,
          date: dateStr,
          type: 'MEE',
          subject: subjects[0],
          description: `${subjects[0]} MEE Essay - 30 minutes`,
          completed: false,
          estimatedMinutes: 40,
        });

        // Essay 2
        tasks.push({
          id: `apr-mee-2-${dateStr}`,
          date: format(addDays(parseISO(dateStr), 1), 'yyyy-MM-dd'),
          type: 'MEE',
          subject: subjects[1],
          description: `${subjects[1]} MEE Essay - 30 minutes`,
          completed: false,
          estimatedMinutes: 40,
        });

        // Essay 3
        tasks.push({
          id: `apr-mee-3-${dateStr}`,
          date: format(addDays(parseISO(dateStr), 2), 'yyyy-MM-dd'),
          type: 'MEE',
          subject: subjects[2],
          description: `${subjects[2]} MEE Essay - 30 minutes`,
          completed: false,
          estimatedMinutes: 40,
        });

        // Spaced recall 1-2 days later
        const recallDate = format(addDays(parseISO(dateStr), 2), 'yyyy-MM-dd');
        tasks.push({
          id: `apr-recall-essays-${dateStr}`,
          date: recallDate,
          type: 'ActiveRecall',
          subject: subjects[0],
          description: `[Spaced Rep] View only essay topics, rewrite issue list + key rules (no full answers)`,
          completed: false,
          estimatedMinutes: 30,
          memoryTag: 'essay-spaced-rep',
        });
      } else {
        // MPT weekend
        tasks.push({
          id: `apr-mpt-${dateStr}`,
          date: dateStr,
          type: 'Review',
          subject: Subject.CIV_PRO,
          description: `Timed MPT Task - 90 minutes`,
          completed: false,
          estimatedMinutes: 120,
        });

        // Case rule recall after MPT review
        const reviewDate = format(addDays(parseISO(dateStr), 2), 'yyyy-MM-dd');
        tasks.push({
          id: `apr-case-recall-${dateStr}`,
          date: reviewDate,
          type: 'ActiveRecall',
          subject: Subject.CIV_PRO,
          description: `[Case Rule Recall] Pick 2-3 key cases from MPT library, write case name + core rules without referencing original task`,
          completed: false,
          estimatedMinutes: 20,
          memoryTag: 'case-recall',
          linkedTaskId: `apr-mpt-${dateStr}`,
        });
      }
    }

    return tasks;
  }

  /**
   * MAY: High-Volume MEE Simulation + Rule Deck (Memory Version)
   * Focus: Systematic rule deck with adaptive spacing, high-frequency rule backing
   */
  private static generateMayTasks(
    dateStr: string,
    dayOfMonth: number,
    daysSinceStart: number,
    isWknd: boolean
  ): StudyTask[] {
    const tasks: StudyTask[] = [];
    const subjects = [Subject.CONTRACTS, Subject.TORTS, Subject.EVIDENCE, Subject.CRIMINAL_LAW];
    const mainSubject = subjects[Math.floor((dayOfMonth - 1) / 7) % subjects.length];

    if (!isWknd) {
      // Weekday: Rule Deck review on 2 days + MEE practice on other days
      const dayOfWeek = new Date(dateStr).getDay();

      if (dayOfWeek === 1 || dayOfWeek === 3) {
        // Rule Deck Review (20 min session)
        tasks.push({
          id: `may-deck-${dateStr}`,
          date: dateStr,
          type: 'RuleWriting',
          subject: mainSubject,
          description: `[Rule Deck] Review due ${mainSubject} rules - write 3-5 rules on blank paper, score yourself, adjust next review date`,
          completed: false,
          estimatedMinutes: 20,
          memoryTag: 'rule-deck-adaptive',
        });

        tasks.push({
          id: `may-practice-${dateStr}`,
          date: dateStr,
          type: 'MBE',
          subject: mainSubject,
          description: `${mainSubject} MBE: 15 questions`,
          completed: false,
          estimatedMinutes: 30,
          count: 15,
        });
      } else {
        // MEE practice
        tasks.push({
          id: `may-mee-${dateStr}`,
          date: dateStr,
          type: 'MEE',
          subject: mainSubject,
          description: `${mainSubject} MEE - timed 30 min`,
          completed: false,
          estimatedMinutes: 40,
        });

        // Conditional spaced rep for past MEE
        if (dayOfMonth % 4 === 0) {
          tasks.push({
            id: `may-spaced-mee-${dateStr}`,
            date: dateStr,
            type: 'ActiveRecall',
            subject: mainSubject,
            description: `[Spaced Rep] Rewrite past MEE outline (issue list only, no answers)`,
            completed: false,
            estimatedMinutes: 20,
            memoryTag: 'mee-spaced',
          });
        }
      }
    } else {
      // Weekend: 6-essay mock or MPT half-simulation
      const weekNum = Math.floor((dayOfMonth - 1) / 7);

      if (weekNum % 2 === 0) {
        // 6-essay intensive MEE session
        const essaySubjects = [subjects[0], subjects[1], subjects[2], subjects[3], subjects[0], subjects[1]];

        for (let i = 0; i < 3; i++) {
          tasks.push({
            id: `may-mee-${i + 1}-${dateStr}`,
            date: format(addDays(parseISO(dateStr), i), 'yyyy-MM-dd'),
            type: 'MEE',
            subject: essaySubjects[i],
            description: `MEE Session ${i + 1}: ${essaySubjects[i]} - 30 minutes`,
            completed: false,
            estimatedMinutes: 40,
          });
        }

        // Error card creation task - review after
        const reviewDate = format(addDays(parseISO(dateStr), 3), 'yyyy-MM-dd');
        tasks.push({
          id: `may-error-cards-${dateStr}`,
          date: reviewDate,
          type: 'RuleWriting',
          subject: subjects[0],
          description: `[Rule Deck Update] For any rules missed in essays, create new high-priority cards in Rule Deck. Plan 2+ reviews in next 5 days`,
          completed: false,
          estimatedMinutes: 30,
          memoryTag: 'rule-deck-update',
        });
      } else {
        // MPT half-simulation (MPT 90 min + review)
        tasks.push({
          id: `may-mpt-${dateStr}`,
          date: dateStr,
          type: 'Review',
          subject: Subject.CIV_PRO,
          description: `Full MPT Task - 90 minutes`,
          completed: false,
          estimatedMinutes: 120,
        });

        // Post-MPT template recall
        const reviewDate = format(addDays(parseISO(dateStr), 2), 'yyyy-MM-dd');
        tasks.push({
          id: `may-mpt-template-${dateStr}`,
          date: reviewDate,
          type: 'TemplateReview',
          subject: Subject.CIV_PRO,
          description: `[Template Recall] Write task format template + 3 main issues + 1-2 bonus issues you missed, from memory`,
          completed: false,
          estimatedMinutes: 25,
          memoryTag: 'template-spaced',
          linkedTaskId: `may-mpt-${dateStr}`,
        });
      }
    }

    return tasks;
  }

  /**
   * JUNE: Polishing + Maintenance (Memory Version)
   * Focus: Reduce new material, maximize review and rule deck maintenance
   */
  private static generateJuneTasks(
    dateStr: string,
    dayOfMonth: number,
    daysSinceStart: number,
    isWknd: boolean
  ): StudyTask[] {
    const tasks: StudyTask[] = [];
    const subjects = [Subject.CONTRACTS, Subject.TORTS, Subject.EVIDENCE, Subject.CRIMINAL_LAW];
    const mainSubject = subjects[Math.floor((dayOfMonth - 1) / 7) % subjects.length];
    const isLastWeeks = dayOfMonth >= 15; // Last 2 weeks

    if (!isWknd) {
      // Weekday: Focus on Rule Deck + old MEE rewriting (50-70% active recall, 30-50% new)
      if (isLastWeeks) {
        // Final weeks: Heavy emphasis on review
        tasks.push({
          id: `jun-deck-${dateStr}`,
          date: dateStr,
          type: 'RuleWriting',
          subject: mainSubject,
          description: `[Rule Deck Priority] Write overdue high-priority rules from blank paper`,
          completed: false,
          estimatedMinutes: 25,
          memoryTag: 'rule-deck-final',
        });

        tasks.push({
          id: `jun-old-mee-${dateStr}`,
          date: dateStr,
          type: 'ActiveRecall',
          subject: mainSubject,
          description: `[Spaced Rep] Rewrite old MEE outline (issue headings only, no answers)`,
          completed: false,
          estimatedMinutes: 25,
          memoryTag: 'old-mee-final',
        });

        tasks.push({
          id: `jun-light-practice-${dateStr}`,
          date: dateStr,
          type: 'MBE',
          subject: mainSubject,
          description: `Light MBE: 5-10 current-week-topic questions`,
          completed: false,
          estimatedMinutes: 15,
          count: 8,
        });
      } else {
        // Early June: Balanced approach
        tasks.push({
          id: `jun-template-${dateStr}`,
          date: dateStr,
          type: 'TemplateReview',
          subject: mainSubject,
          description: `[Template Maintenance] Sketch MEE template + MPT format from memory`,
          completed: false,
          estimatedMinutes: 20,
          memoryTag: 'template-maintain',
        });

        tasks.push({
          id: `jun-deck-${dateStr}`,
          date: dateStr,
          type: 'RuleWriting',
          subject: mainSubject,
          description: `[Rule Deck] Review scheduled rules`,
          completed: false,
          estimatedMinutes: 25,
          memoryTag: 'rule-deck',
        });

        tasks.push({
          id: `jun-new-${dateStr}`,
          date: dateStr,
          type: 'MEE',
          subject: mainSubject,
          description: `New MEE or light practice`,
          completed: false,
          estimatedMinutes: 30,
        });
      }
    } else {
      // Weekend: Format-specific template review or light full mocks
      const taskTypes = ['memo', 'brief', 'client-letter', 'demand-letter'];
      const taskType = taskTypes[Math.floor((dayOfMonth - 1) / 7) % taskTypes.length];

      tasks.push({
        id: `jun-format-${dateStr}`,
        date: dateStr,
        type: 'TemplateReview',
        subject: Subject.CIV_PRO,
        description: `[Format Template Review] Sketch ${taskType} format bone structure from memory, compare with sample`,
        completed: false,
        estimatedMinutes: 30,
        memoryTag: 'format-recall',
      });

      tasks.push({
        id: `jun-review-${dateStr}`,
        date: dateStr,
        type: 'Review',
        subject: mainSubject,
        description: `Light review session - past errors and weak areas`,
        completed: false,
        estimatedMinutes: 90,
        memoryTag: 'final-review',
      });
    }

    return tasks;
  }
}
