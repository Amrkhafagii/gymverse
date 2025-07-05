import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  followers_count: number;
  following_count: number;
  workouts_count: number;
}

interface Workout {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  duration: number;
  calories_burned?: number;
  exercises: Exercise[];
  created_at: string;
  user?: User;
}

interface Exercise {
  id: string;
  name: string;
  sets: Set[];
  notes?: string;
}

interface Set {
  id: string;
  reps: number;
  weight?: number;
  duration?: number;
  rest_time?: number;
}

interface Achievement {
  id: string;
  user_id: string;
  title: string;
  description: string;
  icon: string;
  earned_at: string;
  category: 'strength' | 'endurance' | 'consistency' | 'milestone';
}

interface DataContextType {
  // User data
  currentUser: User | null;
  users: User[];
  
  // Workout data
  workouts: Workout[];
  userWorkouts: Workout[];
  
  // Achievement data
  achievements: Achievement[];
  userAchievements: Achievement[];
  
  // Loading states
  loading: boolean;
  
  // Actions
  addWorkout: (workout: Omit<Workout, 'id' | 'created_at' | 'user_id'>) => void;
  updateWorkout: (id: string, workout: Partial<Workout>) => void;
  deleteWorkout: (id: string) => void;
  followUser: (userId: string) => void;
  unfollowUser: (userId: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Mock data
const mockCurrentUser: User = {
  id: '1',
  username: 'fitness_enthusiast',
  full_name: 'Alex Johnson',
  avatar_url: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
  bio: 'Passionate about fitness and helping others reach their goals 💪',
  followers_count: 1250,
  following_count: 890,
  workouts_count: 156,
};

const mockUsers: User[] = [
  {
    id: '2',
    username: 'stronglifter',
    full_name: 'Sarah Wilson',
    avatar_url: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=400',
    bio: 'Powerlifter | Personal Trainer | Nutrition Coach',
    followers_count: 2100,
    following_count: 450,
    workouts_count: 203,
  },
  {
    id: '3',
    username: 'cardio_king',
    full_name: 'Mike Chen',
    avatar_url: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400',
    bio: 'Marathon runner | Cycling enthusiast',
    followers_count: 890,
    following_count: 1200,
    workouts_count: 89,
  },
  {
    id: '4',
    username: 'yoga_master',
    full_name: 'Emma Davis',
    avatar_url: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400',
    bio: 'Yoga instructor | Mindfulness coach',
    followers_count: 1800,
    following_count: 600,
    workouts_count: 134,
  },
];

const mockWorkouts: Workout[] = [
  {
    id: '1',
    user_id: '1',
    name: 'Upper Body Strength',
    description: 'Focused on chest, shoulders, and arms',
    duration: 75,
    calories_burned: 320,
    exercises: [
      {
        id: '1',
        name: 'Bench Press',
        sets: [
          { id: '1', reps: 10, weight: 185 },
          { id: '2', reps: 8, weight: 195 },
          { id: '3', reps: 6, weight: 205 },
        ],
      },
      {
        id: '2',
        name: 'Shoulder Press',
        sets: [
          { id: '4', reps: 12, weight: 135 },
          { id: '5', reps: 10, weight: 145 },
          { id: '6', reps: 8, weight: 155 },
        ],
      },
    ],
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    user: mockCurrentUser,
  },
  {
    id: '2',
    user_id: '2',
    name: 'Deadlift Day',
    description: 'Heavy deadlifts and accessory work',
    duration: 90,
    calories_burned: 450,
    exercises: [
      {
        id: '3',
        name: 'Deadlift',
        sets: [
          { id: '7', reps: 5, weight: 315 },
          { id: '8', reps: 3, weight: 335 },
          { id: '9', reps: 1, weight: 365 },
        ],
      },
    ],
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    user: mockUsers[0],
  },
];

const mockAchievements: Achievement[] = [
  {
    id: '1',
    user_id: '1',
    title: 'First Workout',
    description: 'Completed your first workout',
    icon: '🎯',
    earned_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'milestone',
  },
  {
    id: '2',
    user_id: '1',
    title: 'Consistency Champion',
    description: 'Worked out 7 days in a row',
    icon: '🔥',
    earned_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'consistency',
  },
  {
    id: '3',
    user_id: '1',
    title: 'Strength Milestone',
    description: 'Bench pressed 200+ lbs',
    icon: '💪',
    earned_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'strength',
  },
];

export function DataProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [workouts, setWorkouts] = useState<Workout[]>(mockWorkouts);
  const [achievements, setAchievements] = useState<Achievement[]>(mockAchievements);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const addWorkout = (workoutData: Omit<Workout, 'id' | 'created_at' | 'user_id'>) => {
    const newWorkout: Workout = {
      ...workoutData,
      id: Date.now().toString(),
      user_id: mockCurrentUser.id,
      created_at: new Date().toISOString(),
      user: mockCurrentUser,
    };
    setWorkouts(prev => [newWorkout, ...prev]);
  };

  const updateWorkout = (id: string, workoutData: Partial<Workout>) => {
    setWorkouts(prev => prev.map(workout => 
      workout.id === id ? { ...workout, ...workoutData } : workout
    ));
  };

  const deleteWorkout = (id: string) => {
    setWorkouts(prev => prev.filter(workout => workout.id !== id));
  };

  const followUser = (userId: string) => {
    // Mock implementation - in real app would update backend
    console.log('Following user:', userId);
  };

  const unfollowUser = (userId: string) => {
    // Mock implementation - in real app would update backend
    console.log('Unfollowing user:', userId);
  };

  const userWorkouts = workouts.filter(workout => workout.user_id === mockCurrentUser.id);
  const userAchievements = achievements.filter(achievement => achievement.user_id === mockCurrentUser.id);

  const value: DataContextType = {
    currentUser: mockCurrentUser,
    users: mockUsers,
    workouts,
    userWorkouts,
    achievements,
    userAchievements,
    loading,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    followUser,
    unfollowUser,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
