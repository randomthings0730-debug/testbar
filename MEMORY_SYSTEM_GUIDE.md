# Advanced Memory System - Implementation Guide

## Overview

This study planner now includes an advanced memory system based on cognitive science principles:

### Core Principles

1. **Spaced Repetition**: Rules and concepts reappear at 1-day, 3-day, 7-day, and 14-day intervals
2. **Active Retrieval Practice**: Tasks emphasize writing, explaining, and problem-solving rather than passive review
3. **Task Variety**: Study sessions rotate between reading, writing, solving, and error analysis
4. **Error-Driven Learning**: Mistakes are systematically tracked and reviewed at strategic intervals

## Phase-Based Schedule (January - June)

### JANUARY: MBE Foundation
- **Weekdays**: 2-hour sessions with mandatory 20-30 min "Active Recall Block"
- Students write key rules on blank paper, then compare with notes
- Last weekend: First 50-question mock exam with structured review
- **Memory Mechanism**: Introduction to active recall habit

### FEBRUARY: MBE Second Round + Spaced Repetition
- **Weekdays**: Deepening outlines, 20-question daily MCQ practice
- Active Recall block: Write 4-5 key rules without notes
- Every 3 days: Spaced repetition review (revisit day 1 material)
- Every week: Week-long review node
- Every other weekend: 50-question mock with error analysis (1-3 days later)
- **Memory Mechanism**: Establishing spaced repetition habit, error analysis system

### MARCH: MEE Foundation
- **Monday**: "Rule Writing Fridays" - write 5 common essay rules on blank paper
- **Wednesday**: "Delayed Recall" - rewrite last week's subject rules from memory
- **Friday**: "MEE Template Practice" - rewrite issue structures and rules only
- Weekends: Timed MEE essays with format-level retrieval practice
- **Memory Mechanism**: Transitioning from MBE to MEE with active recall

### APRIL: High-Volume MEE + MPT
- **Weekdays**: Rewriting old MEEs (10 min memory recall + 20 min condensing)
- Spaced rep for past MEE: every 2 days view topics and rewrite structures
- **Weekends**: 
  - Week 1: 3-essay intensive session (1 per day) + spaced recall 1-2 days later
  - Week 2: MPT task + case rule recall (2-3 important cases from memory)
- **Memory Mechanism**: High-volume practice with systematic memory reinforcement

### MAY: Intensive Simulation + Rule Deck
- **Weekdays** (2x per week): Rule Deck adaptive review (write rules, self-score, system adjusts interval)
- Other days: New MEE practice + conditional spaced rep
- **Weekends**:
  - Week 1-2: 6-essay mock session + error card creation
  - Week 3: MPT half-simulation (90 min) + template recall
- **Memory Mechanism**: Introduction of Rule Deck system with adaptive spacing

### JUNE: Polishing & Maintenance
- **Early June**: Balanced active recall (50%) + new material (50%)
  - Rule Deck maintenance, template review, new MEE practice
- **Last 2 weeks**: Heavy review mode (70% active recall, 30% new)
  - Rule Deck priority rules, old MEE rewriting, light new practice
  - Format-specific template reviews (memo, brief, demand letter, etc.)
- **Memory Mechanism**: Maintaining memory curves at peak before exam

## Key Features

### Active Recall Blocks
- Tagged tasks with `memoryTag: 'active-recall'`
- Examples: Writing rules, rewriting outlines, explaining concepts
- Target: 25-35% of total study time

### Spaced Repetition Nodes
- Linked tasks with `linkedTaskId` referencing original task
- Memory tags: `'spaced-rep-1'`, `'spaced-rep-3'`, `'spaced-rep-7'`, `'spaced-rep-14'`
- Visible in Dashboard with memory system metrics

### Error Analysis System
- Type: `'ErrorAnalysis'`
- Analyzes error patterns and generates targeted reviews
- High-priority topics reviewed within 1-3 days

### Template & Format Practice
- Type: `'TemplateReview'`
- Emphasizes format-level retrieval practice
- Students sketch task structure without looking at original

### Rule Writing Tasks
- Type: `'RuleWriting'`
- Focuses on writing concise rule statements
- Foundation for Rule Deck system

## Rule Deck System

The Rule Deck is implemented in `ruleDeckService.ts` and provides:

- **Adaptive Spacing**: Rules reviewed at optimal intervals based on performance
- **Priority Levels**: High/medium/low priority rules reviewed at different frequencies
- **Performance Scoring**: Performance on review (0-100) determines next review date
  - Good performance (>80%): Longer interval
  - Poor performance (≤80%): Shorter interval

### Example Workflow
1. User creates error entry in Error Log
2. System generates Rule Card from error
3. Rule Card enters adaptive queue
4. On review date, student writes rule from memory
5. System adjusts next review date based on score

## Dashboard Indicators

### Memory System Metrics
- **Active Recall %**: Percentage of study time dedicated to active recall (target: 25-35%)
- **Memory Tasks**: Number of spaced repetition tasks planned
- **Rule Deck Coverage**: Percentage of high-priority rules on schedule (target: ≥80%)

## Using the Generate Plan Button

Click **"Generate Plan"** in Planner to:

1. **Select Start Date**: All tasks from this date forward will be regenerated
2. **Confirm Overwrite**: Existing uncompleted tasks on/after this date will be deleted
3. **Receive New Schedule**: Complete 6-month plan with integrated memory mechanisms
   - ~1,500-2,000 tasks depending on duration
   - Each month customized for that phase's goals
   - Error analysis and rule deck management embedded

## Task Types

New task types added for memory system:

| Type | Purpose |
|------|---------|
| `ActiveRecall` | Write/explain rules on blank paper |
| `RuleWriting` | Focused rule writing practice |
| `TemplateReview` | Write format/structure from memory |
| `MockReview` | Post-mock error analysis |
| `ErrorAnalysis` | Targeted review of error topics |
| `MockExam` | Full timed mock exams |

## Memory Tags

Tasks include tags for memory strategy:

- `'active-recall'`: Retrieval practice emphasis
- `'spaced-rep-X'`: X-day spaced repetition node
- `'memory-deck'`: Rule Deck related
- `'error-spaced-rep'`: Error-driven spaced repetition
- `'format-recall'`: Format/structure memory

## Integration Notes

- All task generation is in `services/scheduleService.ts`
- Rule Deck management in `services/ruleDeckService.ts`
- Memory metrics calculated in `Dashboard.tsx`
- Tasks are fully compatible with existing Planner UI and storage

## Next Steps

1. Generate first plan using "Generate Plan" button
2. Follow daily tasks - each includes memory mechanism
3. Use Error Log to feed Rule Deck system
4. Monitor Dashboard memory metrics (target: 25-35% active recall)
5. Review monthly to ensure 80%+ Rule Deck coverage
