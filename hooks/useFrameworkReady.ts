import { useEffect, useState } from 'react';
import { initDatabase, seedDefaultExercises } from '@/lib/storage/database';
import { initializeFileStorage } from '@/lib/storage/fileStorage';
import { getProfile, createDefaultProfile } from '@/lib/storage/asyncStorage';

export const useFrameworkReady = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('Initializing GymVerse app...');
        
        // Initialize database
        await initDatabase();
        console.log('✅ Database initialized');
        
        // Seed default exercises
        await seedDefaultExercises();
        console.log('✅ Default exercises seeded');
        
        // Initialize file storage
        await initializeFileStorage();
        console.log('✅ File storage initialized');
        
        // Check if profile exists, create default if not
        const profile = await getProfile();
        if (!profile) {
          await createDefaultProfile();
          console.log('✅ Default profile created');
        }
        
        console.log('🎉 GymVerse app initialized successfully');
        setIsReady(true);
      } catch (error) {
        console.error('❌ Error initializing app:', error);
        // Still set ready to true to prevent infinite loading
        setIsReady(true);
      }
    };

    initializeApp();
  }, []);

  return isReady;
};
