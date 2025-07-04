import * as SQLite from 'expo-sqlite';

// Database instance
let db: SQLite.SQLiteDatabase | null = null;

// Initialize database
export const initDatabase = async (): Promise<void> => {
  try {
    db = await SQLite.openDatabaseAsync('gymverse.db');
    await createTables();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Get database instance
const getDatabase = (): SQLite.SQLiteDatabase => {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
};

// Create all tables
const createTables = async (): Promise<void> => {
  const database = getDatabase();
  
  try {
    // Exercises table
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        instructions TEXT,
        muscle_groups TEXT NOT NULL, -- JSON array as string
        equipment TEXT, -- JSON array as string
        difficulty_level TEXT CHECK(difficulty_level IN ('beginner', 'intermediate', 'advanced')) NOT NULL,
        exercise_type TEXT CHECK(exercise_type IN ('strength', 'cardio', 'flexibility', 'balance')) NOT NULL,
        demo_video_url TEXT,
        demo_image_url TEXT,
        is_custom BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Workouts table
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS workouts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        estimated_duration_minutes INTEGER,
        difficulty_level TEXT CHECK(difficulty_level IN ('beginner', 'intermediate', 'advanced')) NOT NULL,
        workout_type TEXT CHECK(workout_type IN ('strength', 'cardio', 'hiit', 'flexibility', 'mixed')) NOT NULL,
        is_template BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Workout exercises table (junction table)
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS workout_exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workout_id INTEGER NOT NULL,
        exercise_id INTEGER NOT NULL,
        order_index INTEGER NOT NULL,
        target_sets INTEGER NOT NULL,
        target_reps TEXT, -- JSON array as string for rep ranges
        target_weight_kg REAL,
        target_duration_seconds INTEGER,
        rest_seconds INTEGER DEFAULT 60,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (workout_id) REFERENCES workouts (id) ON DELETE CASCADE,
        FOREIGN KEY (exercise_id) REFERENCES exercises (id) ON DELETE CASCADE
      );
    `);

    // Workout sessions table
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS workout_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workout_id INTEGER,
        name TEXT NOT NULL,
        started_at DATETIME NOT NULL,
        completed_at DATETIME,
        duration_minutes INTEGER,
        calories_burned INTEGER,
        notes TEXT,
        rating INTEGER CHECK(rating >= 1 AND rating <= 5),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (workout_id) REFERENCES workouts (id) ON DELETE SET NULL
      );
    `);

    // Session exercises table
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS session_exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id INTEGER NOT NULL,
        exercise_id INTEGER NOT NULL,
        order_index INTEGER NOT NULL,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES workout_sessions (id) ON DELETE CASCADE,
        FOREIGN KEY (exercise_id) REFERENCES exercises (id) ON DELETE CASCADE
      );
    `);

    // Exercise sets table
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS exercise_sets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_exercise_id INTEGER NOT NULL,
        set_number INTEGER NOT NULL,
        reps INTEGER,
        weight_kg REAL,
        duration_seconds INTEGER,
        distance_meters REAL,
        rest_seconds INTEGER,
        rpe INTEGER CHECK(rpe >= 1 AND rpe <= 10), -- Rate of Perceived Exertion
        completed BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_exercise_id) REFERENCES session_exercises (id) ON DELETE CASCADE
      );
    `);

    // Personal records table
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS personal_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        exercise_id INTEGER NOT NULL,
        record_type TEXT CHECK(record_type IN ('max_weight', 'max_reps', 'max_distance', 'best_time')) NOT NULL,
        value REAL NOT NULL,
        unit TEXT NOT NULL,
        session_id INTEGER,
        achieved_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (exercise_id) REFERENCES exercises (id) ON DELETE CASCADE,
        FOREIGN KEY (session_id) REFERENCES workout_sessions (id) ON DELETE SET NULL,
        UNIQUE(exercise_id, record_type)
      );
    `);

    // Body measurements table
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS body_measurements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        measurement_type TEXT NOT NULL, -- weight, body_fat, muscle_mass, etc.
        value REAL NOT NULL,
        unit TEXT NOT NULL,
        measured_at DATETIME NOT NULL,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Progress photos table
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS progress_photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        file_path TEXT NOT NULL,
        photo_type TEXT DEFAULT 'progress', -- progress, before, after
        taken_at DATETIME NOT NULL,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('All tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
};

// Seed default exercises
export const seedDefaultExercises = async (): Promise<void> => {
  const database = getDatabase();
  
  try {
    // Check if exercises already exist
    const result = await database.getFirstAsync('SELECT COUNT(*) as count FROM exercises WHERE is_custom = 0');
    if (result && (result as any).count > 0) {
      console.log('Default exercises already seeded');
      return;
    }

    const defaultExercises = [
      {
        name: 'Push-ups',
        description: 'Classic bodyweight chest exercise',
        instructions: '1. Start in plank position\n2. Lower body until chest nearly touches floor\n3. Push back up to starting position',
        muscle_groups: JSON.stringify(['chest', 'shoulders', 'triceps']),
        equipment: JSON.stringify([]),
        difficulty_level: 'beginner',
        exercise_type: 'strength',
        demo_image_url: 'https://images.pexels.com/photos/416809/pexels-photo-416809.jpeg'
      },
      {
        name: 'Squats',
        description: 'Fundamental lower body exercise',
        instructions: '1. Stand with feet shoulder-width apart\n2. Lower body as if sitting back into chair\n3. Return to standing position',
        muscle_groups: JSON.stringify(['quadriceps', 'glutes', 'hamstrings']),
        equipment: JSON.stringify([]),
        difficulty_level: 'beginner',
        exercise_type: 'strength',
        demo_image_url: 'https://images.pexels.com/photos/4162449/pexels-photo-4162449.jpeg'
      },
      {
        name: 'Deadlifts',
        description: 'Compound movement targeting posterior chain',
        instructions: '1. Stand with feet hip-width apart, bar over mid-foot\n2. Hinge at hips and knees to grip bar\n3. Drive through heels to stand up straight',
        muscle_groups: JSON.stringify(['hamstrings', 'glutes', 'lower_back', 'traps']),
        equipment: JSON.stringify(['barbell']),
        difficulty_level: 'intermediate',
        exercise_type: 'strength',
        demo_image_url: 'https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg'
      },
      {
        name: 'Pull-ups',
        description: 'Upper body pulling exercise',
        instructions: '1. Hang from pull-up bar with overhand grip\n2. Pull body up until chin clears bar\n3. Lower with control',
        muscle_groups: JSON.stringify(['lats', 'biceps', 'rhomboids']),
        equipment: JSON.stringify(['pull_up_bar']),
        difficulty_level: 'intermediate',
        exercise_type: 'strength',
        demo_image_url: 'https://images.pexels.com/photos/1552106/pexels-photo-1552106.jpeg'
      },
      {
        name: 'Plank',
        description: 'Core stability exercise',
        instructions: '1. Start in push-up position\n2. Lower to forearms\n3. Hold position keeping body straight',
        muscle_groups: JSON.stringify(['core', 'shoulders']),
        equipment: JSON.stringify([]),
        difficulty_level: 'beginner',
        exercise_type: 'strength',
        demo_image_url: 'https://images.pexels.com/photos/4162438/pexels-photo-4162438.jpeg'
      },
      {
        name: 'Running',
        description: 'Cardiovascular endurance exercise',
        instructions: '1. Start with light jog\n2. Maintain steady pace\n3. Focus on breathing rhythm',
        muscle_groups: JSON.stringify(['legs', 'cardiovascular']),
        equipment: JSON.stringify([]),
        difficulty_level: 'beginner',
        exercise_type: 'cardio',
        demo_image_url: 'https://images.pexels.com/photos/2402777/pexels-photo-2402777.jpeg'
      },
      {
        name: 'Bench Press',
        description: 'Upper body pressing movement',
        instructions: '1. Lie on bench with feet flat on floor\n2. Grip bar slightly wider than shoulders\n3. Lower bar to chest, then press up',
        muscle_groups: JSON.stringify(['chest', 'shoulders', 'triceps']),
        equipment: JSON.stringify(['barbell', 'bench']),
        difficulty_level: 'intermediate',
        exercise_type: 'strength',
        demo_image_url: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg'
      },
      {
        name: 'Lunges',
        description: 'Unilateral lower body exercise',
        instructions: '1. Step forward into lunge position\n2. Lower back knee toward ground\n3. Push back to starting position',
        muscle_groups: JSON.stringify(['quadriceps', 'glutes', 'hamstrings']),
        equipment: JSON.stringify([]),
        difficulty_level: 'beginner',
        exercise_type: 'strength',
        demo_image_url: 'https://images.pexels.com/photos/4162451/pexels-photo-4162451.jpeg'
      }
    ];

    for (const exercise of defaultExercises) {
      await database.runAsync(
        `INSERT INTO exercises (name, description, instructions, muscle_groups, equipment, difficulty_level, exercise_type, demo_image_url, is_custom)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
        [
          exercise.name,
          exercise.description,
          exercise.instructions,
          exercise.muscle_groups,
          exercise.equipment,
          exercise.difficulty_level,
          exercise.exercise_type,
          exercise.demo_image_url
        ]
      );
    }

    console.log('Default exercises seeded successfully');
  } catch (error) {
    console.error('Error seeding default exercises:', error);
    throw error;
  }
};

// Database utility functions
const clearAllData = async (): Promise<void> => {
  const database = getDatabase();
  
  try {
    await database.execAsync(`
      DELETE FROM exercise_sets;
      DELETE FROM session_exercises;
      DELETE FROM workout_sessions;
      DELETE FROM workout_exercises;
      DELETE FROM workouts;
      DELETE FROM personal_records;
      DELETE FROM body_measurements;
      DELETE FROM progress_photos;
      DELETE FROM exercises WHERE is_custom = 1;
    `);
    
    console.log('All user data cleared successfully');
  } catch (error) {
    console.error('Error clearing data:', error);
    throw error;
  }
};

const exportDatabaseData = async (): Promise<any> => {
  const database = getDatabase();
  
  try {
    const data = {
      exercises: await database.getAllAsync('SELECT * FROM exercises WHERE is_custom = 1'),
      workouts: await database.getAllAsync('SELECT * FROM workouts'),
      workout_exercises: await database.getAllAsync('SELECT * FROM workout_exercises'),
      workout_sessions: await database.getAllAsync('SELECT * FROM workout_sessions'),
      session_exercises: await database.getAllAsync('SELECT * FROM session_exercises'),
      exercise_sets: await database.getAllAsync('SELECT * FROM exercise_sets'),
      personal_records: await database.getAllAsync('SELECT * FROM personal_records'),
      body_measurements: await database.getAllAsync('SELECT * FROM body_measurements'),
      progress_photos: await database.getAllAsync('SELECT * FROM progress_photos'),
      exported_at: new Date().toISOString()
    };
    
    return data;
  } catch (error) {
    console.error('Error exporting database data:', error);
    throw error;
  }
};
