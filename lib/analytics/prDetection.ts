export interface PersonalRecord {
  id: string;
  exerciseId: string;
  exerciseName: string;
  recordType: 'weight' | 'reps' | 'volume' | 'duration' | 'distance';
  value: number;
  unit: string;
  achievedAt: string;
  workoutId: string;
  previousRecord?: number;
  improvement: number;
  improvementPercentage: number;
  setDetails?: {
    weight: number;
    reps: number;
    volume: number;
  };
}

export interface ExerciseProgress {
  exerciseId: string;
  exerciseName: string;
  muscleGroups: string[];
  records: PersonalRecord[];
  progressTrend: 'improving' | 'stable' | 'declining';
  totalSessions: number;
  lastPerformed: string;
  averageWeight: number;
  averageReps: number;
  averageVolume: number;
  bestWeight: number;
  bestReps: number;
  bestVolume: number;
  progressScore: number; // 0-100 based on recent improvements
}

export interface WorkoutSet {
  id: string;
  exerciseId: string;
  exerciseName: string;
  weight: number;
  reps: number;
  duration?: number;
  distance?: number;
  completedAt: string;
  workoutId: string;
}

export class PRDetectionEngine {
  /**
   * Detect personal records from workout history
   */
  static detectPersonalRecords(workoutHistory: any[]): PersonalRecord[] {
    const allSets = this.extractAllSets(workoutHistory);
    const exerciseGroups = this.groupSetsByExercise(allSets);
    const personalRecords: PersonalRecord[] = [];

    Object.entries(exerciseGroups).forEach(([exerciseId, sets]) => {
      const exerciseName = sets[0]?.exerciseName || 'Unknown Exercise';
      
      // Detect weight PRs
      const weightPRs = this.detectWeightPRs(exerciseId, exerciseName, sets);
      personalRecords.push(...weightPRs);

      // Detect rep PRs
      const repPRs = this.detectRepPRs(exerciseId, exerciseName, sets);
      personalRecords.push(...repPRs);

      // Detect volume PRs
      const volumePRs = this.detectVolumePRs(exerciseId, exerciseName, sets);
      personalRecords.push(...volumePRs);

      // Detect duration PRs (for time-based exercises)
      const durationPRs = this.detectDurationPRs(exerciseId, exerciseName, sets);
      personalRecords.push(...durationPRs);
    });

    return personalRecords.sort((a, b) => 
      new Date(b.achievedAt).getTime() - new Date(a.achievedAt).getTime()
    );
  }

  /**
   * Extract all sets from workout history
   */
  private static extractAllSets(workoutHistory: any[]): WorkoutSet[] {
    const allSets: WorkoutSet[] = [];

    workoutHistory.forEach(workout => {
      workout.exercises?.forEach((exercise: any) => {
        exercise.sets?.forEach((set: any) => {
          if (set.is_completed && set.actual_weight_kg && set.actual_reps) {
            allSets.push({
              id: set.id,
              exerciseId: exercise.id,
              exerciseName: exercise.exercise_name,
              weight: set.actual_weight_kg,
              reps: set.actual_reps,
              duration: set.duration_seconds,
              distance: set.distance_meters,
              completedAt: workout.completed_at || workout.created_at,
              workoutId: workout.id,
            });
          }
        });
      });
    });

    return allSets;
  }

  /**
   * Group sets by exercise
   */
  private static groupSetsByExercise(sets: WorkoutSet[]): Record<string, WorkoutSet[]> {
    return sets.reduce((groups, set) => {
      if (!groups[set.exerciseId]) {
        groups[set.exerciseId] = [];
      }
      groups[set.exerciseId].push(set);
      return groups;
    }, {} as Record<string, WorkoutSet[]>);
  }

  /**
   * Detect weight personal records
   */
  private static detectWeightPRs(
    exerciseId: string, 
    exerciseName: string, 
    sets: WorkoutSet[]
  ): PersonalRecord[] {
    const records: PersonalRecord[] = [];
    const sortedSets = sets.sort((a, b) => 
      new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
    );

    let currentMaxWeight = 0;

    sortedSets.forEach(set => {
      if (set.weight > currentMaxWeight) {
        const improvement = set.weight - currentMaxWeight;
        const improvementPercentage = currentMaxWeight > 0 
          ? ((improvement / currentMaxWeight) * 100) 
          : 100;

        records.push({
          id: `${set.id}-weight-pr`,
          exerciseId,
          exerciseName,
          recordType: 'weight',
          value: set.weight,
          unit: 'kg',
          achievedAt: set.completedAt,
          workoutId: set.workoutId,
          previousRecord: currentMaxWeight > 0 ? currentMaxWeight : undefined,
          improvement,
          improvementPercentage,
          setDetails: {
            weight: set.weight,
            reps: set.reps,
            volume: set.weight * set.reps,
          },
        });

        currentMaxWeight = set.weight;
      }
    });

    return records;
  }

  /**
   * Detect rep personal records (for same weight)
   */
  private static detectRepPRs(
    exerciseId: string, 
    exerciseName: string, 
    sets: WorkoutSet[]
  ): PersonalRecord[] {
    const records: PersonalRecord[] = [];
    const weightGroups = sets.reduce((groups, set) => {
      const weightKey = set.weight.toString();
      if (!groups[weightKey]) {
        groups[weightKey] = [];
      }
      groups[weightKey].push(set);
      return groups;
    }, {} as Record<string, WorkoutSet[]>);

    Object.entries(weightGroups).forEach(([weight, weightSets]) => {
      const sortedSets = weightSets.sort((a, b) => 
        new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
      );

      let currentMaxReps = 0;

      sortedSets.forEach(set => {
        if (set.reps > currentMaxReps) {
          const improvement = set.reps - currentMaxReps;
          const improvementPercentage = currentMaxReps > 0 
            ? ((improvement / currentMaxReps) * 100) 
            : 100;

          records.push({
            id: `${set.id}-reps-pr`,
            exerciseId,
            exerciseName,
            recordType: 'reps',
            value: set.reps,
            unit: `reps @ ${weight}kg`,
            achievedAt: set.completedAt,
            workoutId: set.workoutId,
            previousRecord: currentMaxReps > 0 ? currentMaxReps : undefined,
            improvement,
            improvementPercentage,
            setDetails: {
              weight: set.weight,
              reps: set.reps,
              volume: set.weight * set.reps,
            },
          });

          currentMaxReps = set.reps;
        }
      });
    });

    return records;
  }

  /**
   * Detect volume personal records (weight × reps)
   */
  private static detectVolumePRs(
    exerciseId: string, 
    exerciseName: string, 
    sets: WorkoutSet[]
  ): PersonalRecord[] {
    const records: PersonalRecord[] = [];
    const sortedSets = sets.sort((a, b) => 
      new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
    );

    let currentMaxVolume = 0;

    sortedSets.forEach(set => {
      const volume = set.weight * set.reps;
      
      if (volume > currentMaxVolume) {
        const improvement = volume - currentMaxVolume;
        const improvementPercentage = currentMaxVolume > 0 
          ? ((improvement / currentMaxVolume) * 100) 
          : 100;

        records.push({
          id: `${set.id}-volume-pr`,
          exerciseId,
          exerciseName,
          recordType: 'volume',
          value: volume,
          unit: 'kg',
          achievedAt: set.completedAt,
          workoutId: set.workoutId,
          previousRecord: currentMaxVolume > 0 ? currentMaxVolume : undefined,
          improvement,
          improvementPercentage,
          setDetails: {
            weight: set.weight,
            reps: set.reps,
            volume,
          },
        });

        currentMaxVolume = volume;
      }
    });

    return records;
  }

  /**
   * Detect duration personal records
   */
  private static detectDurationPRs(
    exerciseId: string, 
    exerciseName: string, 
    sets: WorkoutSet[]
  ): PersonalRecord[] {
    const records: PersonalRecord[] = [];
    const durationSets = sets.filter(set => set.duration && set.duration > 0);
    
    if (durationSets.length === 0) return records;

    const sortedSets = durationSets.sort((a, b) => 
      new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
    );

    let currentMaxDuration = 0;

    sortedSets.forEach(set => {
      if (set.duration! > currentMaxDuration) {
        const improvement = set.duration! - currentMaxDuration;
        const improvementPercentage = currentMaxDuration > 0 
          ? ((improvement / currentMaxDuration) * 100) 
          : 100;

        records.push({
          id: `${set.id}-duration-pr`,
          exerciseId,
          exerciseName,
          recordType: 'duration',
          value: set.duration!,
          unit: 'seconds',
          achievedAt: set.completedAt,
          workoutId: set.workoutId,
          previousRecord: currentMaxDuration > 0 ? currentMaxDuration : undefined,
          improvement,
          improvementPercentage,
        });

        currentMaxDuration = set.duration!;
      }
    });

    return records;
  }

  /**
   * Calculate exercise progress metrics
   */
  static calculateExerciseProgress(
    exerciseId: string,
    exerciseName: string,
    muscleGroups: string[],
    sets: WorkoutSet[],
    records: PersonalRecord[]
  ): ExerciseProgress {
    if (sets.length === 0) {
      return {
        exerciseId,
        exerciseName,
        muscleGroups,
        records: [],
        progressTrend: 'stable',
        totalSessions: 0,
        lastPerformed: '',
        averageWeight: 0,
        averageReps: 0,
        averageVolume: 0,
        bestWeight: 0,
        bestReps: 0,
        bestVolume: 0,
        progressScore: 0,
      };
    }

    const sortedSets = sets.sort((a, b) => 
      new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
    );

    const exerciseRecords = records.filter(r => r.exerciseId === exerciseId);
    const uniqueSessions = new Set(sets.map(s => s.workoutId)).size;
    
    // Calculate averages
    const totalWeight = sets.reduce((sum, set) => sum + set.weight, 0);
    const totalReps = sets.reduce((sum, set) => sum + set.reps, 0);
    const totalVolume = sets.reduce((sum, set) => sum + (set.weight * set.reps), 0);
    
    const averageWeight = totalWeight / sets.length;
    const averageReps = totalReps / sets.length;
    const averageVolume = totalVolume / sets.length;

    // Calculate bests
    const bestWeight = Math.max(...sets.map(s => s.weight));
    const bestReps = Math.max(...sets.map(s => s.reps));
    const bestVolume = Math.max(...sets.map(s => s.weight * s.reps));

    // Calculate progress trend
    const progressTrend = this.calculateProgressTrend(sortedSets);
    
    // Calculate progress score
    const progressScore = this.calculateProgressScore(sortedSets, exerciseRecords);

    return {
      exerciseId,
      exerciseName,
      muscleGroups,
      records: exerciseRecords,
      progressTrend,
      totalSessions: uniqueSessions,
      lastPerformed: sortedSets[sortedSets.length - 1].completedAt,
      averageWeight,
      averageReps,
      averageVolume,
      bestWeight,
      bestReps,
      bestVolume,
      progressScore,
    };
  }

  /**
   * Calculate progress trend based on recent performance
   */
  private static calculateProgressTrend(sets: WorkoutSet[]): 'improving' | 'stable' | 'declining' {
    if (sets.length < 4) return 'stable';

    const recentSets = sets.slice(-6); // Last 6 sets
    const olderSets = sets.slice(-12, -6); // Previous 6 sets

    if (olderSets.length === 0) return 'stable';

    const recentAvgVolume = recentSets.reduce((sum, set) => 
      sum + (set.weight * set.reps), 0) / recentSets.length;
    
    const olderAvgVolume = olderSets.reduce((sum, set) => 
      sum + (set.weight * set.reps), 0) / olderSets.length;

    const improvement = (recentAvgVolume - olderAvgVolume) / olderAvgVolume;

    if (improvement > 0.05) return 'improving'; // 5% improvement
    if (improvement < -0.05) return 'declining'; // 5% decline
    return 'stable';
  }

  /**
   * Calculate progress score (0-100)
   */
  private static calculateProgressScore(sets: WorkoutSet[], records: PersonalRecord[]): number {
    if (sets.length === 0) return 0;

    let score = 50; // Base score

    // Recent activity bonus (0-20 points)
    const daysSinceLastWorkout = Math.floor(
      (Date.now() - new Date(sets[sets.length - 1].completedAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceLastWorkout <= 3) score += 20;
    else if (daysSinceLastWorkout <= 7) score += 15;
    else if (daysSinceLastWorkout <= 14) score += 10;
    else if (daysSinceLastWorkout <= 30) score += 5;

    // Consistency bonus (0-15 points)
    const uniqueWeeks = new Set(
      sets.map(set => {
        const date = new Date(set.completedAt);
        const year = date.getFullYear();
        const week = Math.floor(date.getTime() / (1000 * 60 * 60 * 24 * 7));
        return `${year}-${week}`;
      })
    ).size;
    
    score += Math.min(uniqueWeeks * 2, 15);

    // Recent PRs bonus (0-15 points)
    const recentPRs = records.filter(record => {
      const prDate = new Date(record.achievedAt);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return prDate >= thirtyDaysAgo;
    });
    
    score += Math.min(recentPRs.length * 5, 15);

    return Math.min(Math.max(score, 0), 100);
  }
}
