#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Core app files that should be integrating features
const coreAppFiles = [
  'app/(tabs)/_layout.tsx',
  'app/(tabs)/index.tsx',
  'app/(tabs)/workout.tsx',
  'app/(tabs)/progress.tsx',
  'app/(tabs)/measurements.tsx',
  'app/(tabs)/achievements.tsx',
  'app/(tabs)/social.tsx',
  'app/(tabs)/profile.tsx',
  'app/_layout.tsx'
];

// Feature modules that should be integrated
const featureModules = {
  achievements: {
    components: [
      'components/AchievementModal.tsx',
      'components/achievements/AchievementCard.tsx',
      'components/achievements/AchievementCelebration.tsx',
      'components/achievements/AchievementNotificationManager.tsx',
      'components/achievements/AchievementToast.tsx',
      'components/achievements/AchievementUnlockModal.tsx',
      'components/ui/AchievementCard.tsx'
    ],
    hooks: [
      'hooks/useAchievementNotifications.ts'
    ],
    lib: [
      'lib/achievements.ts',
      'lib/supabase/achievements.ts'
    ],
    expectedIntegration: ['app/(tabs)/achievements.tsx', 'app/(tabs)/index.tsx']
  },
  
  challenges: {
    components: [
      'components/ChallengeCard.tsx',
      'components/challenges/ChallengeCard.tsx',
      'components/challenges/ChallengeList.tsx',
      'components/challenges/ChallengeProgress.tsx',
      'components/challenges/CreateChallengeModal.tsx'
    ],
    hooks: [
      'hooks/useChallenges.ts'
    ],
    lib: [
      'lib/challengeEngine.ts',
      'lib/challenges.ts',
      'lib/challenges/challengeEngine.ts'
    ],
    expectedIntegration: ['app/(tabs)/social.tsx', 'app/(tabs)/index.tsx']
  },

  social: {
    components: [
      'components/CreatePostModal.tsx',
      'components/PostCommentsModal.tsx',
      'components/social/SocialActivityFeed.tsx',
      'components/social/SocialAnalyticsDashboard.tsx',
      'components/social/SocialAutoPostSettings.tsx',
      'components/social/SocialPrivacySettings.tsx',
      'components/social/SocialProfileCard.tsx',
      'components/SocialFeedPost.tsx',
      'components/SocialStatsCard.tsx'
    ],
    lib: [
      'lib/social/localSocialEngine.ts',
      'lib/social/socialFeed.ts',
      'lib/socialFeed.ts',
      'lib/supabase/social.ts'
    ],
    expectedIntegration: ['app/(tabs)/social.tsx', 'app/(tabs)/profile.tsx']
  },

  leaderboards: {
    components: [
      'components/LeaderboardCard.tsx',
      'components/LeaderboardList.tsx',
      'components/challenges/LeaderboardCard.tsx',
      'components/challenges/LeaderboardList.tsx',
      'components/challenges/LeaderboardStats.tsx',
      'components/challenges/LeaderboardTabs.tsx',
      'components/challenges/SocialLeaderboard.tsx',
      'components/SocialLeaderboard.tsx'
    ],
    contexts: [
      'contexts/LeaderboardContext.tsx'
    ],
    hooks: [
      'hooks/useLeaderboards.ts'
    ],
    lib: [
      'lib/leaderboardEngine.ts',
      'lib/leaderboards.ts',
      'lib/challenges/leaderboardEngine.ts',
      'lib/challenges/localLeaderboards.ts'
    ],
    expectedIntegration: ['app/(tabs)/social.tsx', 'app/(tabs)/achievements.tsx']
  },

  analytics: {
    components: [
      'components/AnalyticsChart.tsx',
      'components/ui/InteractiveChart.tsx'
    ],
    lib: [
      'lib/supabase/analytics.ts'
    ],
    expectedIntegration: ['app/(tabs)/progress.tsx', 'app/(tabs)/index.tsx']
  },

  ai: {
    lib: [
      'lib/ai/fatigueDetection.ts',
      'lib/ai/patternAnalysis.ts',
      'lib/ai/recoveryAnalysis.ts',
      'lib/ai/workoutRecommendations.ts'
    ],
    types: [
      'types/aiRecommendation.ts'
    ],
    expectedIntegration: ['app/(tabs)/workout.tsx', 'app/(tabs)/index.tsx']
  },

  photos: {
    components: [
      'components/photos/AddPhotoModal.tsx',
      'components/photos/PhotoComparisonCard.tsx'
    ],
    lib: [
      'lib/supabase/progressPhotos.ts'
    ],
    expectedIntegration: ['app/(tabs)/progress.tsx', 'app/(tabs)/measurements.tsx']
  },

  storage: {
    lib: [
      'lib/storage/adapters/RealmAdapter.ts',
      'lib/storage/adapters/SQLiteAdapter.ts',
      'lib/storage/adapters/WebAdapter.ts',
      'lib/storage/asyncStorage.ts',
      'lib/storage/database.ts',
      'lib/storage/fileStorage.ts',
      'lib/storage/StorageManager.ts'
    ],
    expectedIntegration: ['app/_layout.tsx', 'contexts/']
  },

  sync: {
    contexts: [
      'contexts/OfflineContext.tsx',
      'contexts/SyncContext.tsx'
    ],
    hooks: [
      'hooks/useDataSync.ts'
    ],
    lib: [
      'lib/migration/dataMigration.ts',
      'lib/migration/index.ts',
      'lib/migration/migrationHooks.ts',
      'lib/migration/migrationManager.ts',
      'lib/migration/migrationUtils.ts',
      'lib/migration/offlineSync.ts',
      'lib/migration/syncEngine.ts',
      'lib/sync/index.ts',
      'lib/sync/SyncScheduler.ts'
    ],
    expectedIntegration: ['app/_layout.tsx']
  },

  ui: {
    components: [
      'components/ui/Card.tsx',
      'components/ui/CircularProgress.tsx',
      'components/ui/Input.tsx',
      'components/ui/LoadingSpinner.tsx',
      'components/ui/MetricCard.tsx',
      'components/ui/Modal.tsx',
      'components/ui/OfflineIndicator.tsx',
      'components/ui/ProgressBar.tsx',
      'components/ui/SyncStatusIndicator.tsx',
      'components/ui/WorkoutCard.tsx'
    ],
    expectedIntegration: ['All screens and components']
  }
};

class IntegrationAnalyzer {
  constructor() {
    this.results = {
      coreAppAnalysis: {},
      featureIntegrationGaps: {},
      missingConnections: [],
      architecturalIssues: [],
      integrationRecommendations: []
    };
  }

  // Read file content safely
  readFileContent(filePath) {
    try {
      return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      return null;
    }
  }

  // Check if file exists
  fileExists(filePath) {
    try {
      return fs.existsSync(filePath);
    } catch (error) {
      return false;
    }
  }

  // Extract imports from file content
  extractImports(content) {
    if (!content) return [];
    
    const importRegex = /import\s+(?:{[^}]*}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:{[^}]*}|\*\s+as\s+\w+|\w+))*\s+from\s+['"`]([^'"`]+)['"`]/g;
    const imports = [];
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      imports.push({
        statement: match[0],
        path: match[1],
        line: content.substring(0, match.index).split('\n').length
      });
    }
    
    return imports;
  }

  // Analyze what each core app file is importing
  analyzeCoreAppFiles() {
    console.log('🔍 Analyzing core app files...\n');
    
    coreAppFiles.forEach(filePath => {
      const content = this.readFileContent(filePath);
      const exists = this.fileExists(filePath);
      
      this.results.coreAppAnalysis[filePath] = {
        exists,
        imports: exists ? this.extractImports(content) : [],
        content: content ? content.substring(0, 500) + '...' : null,
        missingFeatures: []
      };
      
      if (exists) {
        console.log(`✅ ${filePath}`);
        const imports = this.results.coreAppAnalysis[filePath].imports;
        console.log(`   📦 Imports: ${imports.length} total`);
        
        // Check for feature-specific imports
        const featureImports = imports.filter(imp => 
          imp.path.includes('achievement') || 
          imp.path.includes('challenge') || 
          imp.path.includes('social') || 
          imp.path.includes('leaderboard') ||
          imp.path.includes('analytics') ||
          imp.path.includes('ai/')
        );
        
        if (featureImports.length > 0) {
          console.log(`   🎯 Feature imports: ${featureImports.map(imp => imp.path).join(', ')}`);
        } else {
          console.log(`   ⚠️  No advanced feature imports detected`);
        }
      } else {
        console.log(`❌ ${filePath} - FILE MISSING`);
      }
      console.log('');
    });
  }

  // Analyze each feature module for integration gaps
  analyzeFeatureIntegration() {
    console.log('🔍 Analyzing feature integration gaps...\n');
    
    Object.entries(featureModules).forEach(([featureName, feature]) => {
      console.log(`📋 Feature: ${featureName.toUpperCase()}`);
      
      const analysis = {
        totalFiles: 0,
        existingFiles: 0,
        missingFiles: [],
        integratedFiles: [],
        unintegratedFiles: [],
        expectedIntegrationPoints: feature.expectedIntegration,
        actualIntegrationPoints: [],
        integrationGap: 0
      };
      
      // Check all files in this feature
      const allFeatureFiles = [
        ...(feature.components || []),
        ...(feature.hooks || []),
        ...(feature.contexts || []),
        ...(feature.lib || []),
        ...(feature.services || []),
        ...(feature.types || [])
      ];
      
      analysis.totalFiles = allFeatureFiles.length;
      
      allFeatureFiles.forEach(filePath => {
        if (this.fileExists(filePath)) {
          analysis.existingFiles++;
          
          // Check if this file is imported anywhere in core app
          const isIntegrated = this.isFileIntegratedInCoreApp(filePath);
          if (isIntegrated.integrated) {
            analysis.integratedFiles.push({
              file: filePath,
              integratedIn: isIntegrated.integratedIn
            });
          } else {
            analysis.unintegratedFiles.push(filePath);
          }
        } else {
          analysis.missingFiles.push(filePath);
        }
      });
      
      // Check actual integration points
      feature.expectedIntegration.forEach(expectedFile => {
        if (this.fileExists(expectedFile)) {
          const content = this.readFileContent(expectedFile);
          const imports = this.extractImports(content);
          
          const hasFeatureImports = imports.some(imp => 
            allFeatureFiles.some(featureFile => 
              imp.path.includes(featureFile.replace('.tsx', '').replace('.ts', '')) ||
              imp.path.includes(featureName)
            )
          );
          
          if (hasFeatureImports) {
            analysis.actualIntegrationPoints.push(expectedFile);
          }
        }
      });
      
      analysis.integrationGap = analysis.expectedIntegrationPoints.length - analysis.actualIntegrationPoints.length;
      
      // Report findings
      console.log(`   📊 Files: ${analysis.existingFiles}/${analysis.totalFiles} exist`);
      console.log(`   🔗 Integrated: ${analysis.integratedFiles.length}/${analysis.existingFiles}`);
      console.log(`   ❌ Missing integration: ${analysis.unintegratedFiles.length} files`);
      console.log(`   🎯 Integration gap: ${analysis.integrationGap}/${analysis.expectedIntegrationPoints.length} expected points missing`);
      
      if (analysis.missingFiles.length > 0) {
        console.log(`   📁 Missing files: ${analysis.missingFiles.slice(0, 3).join(', ')}${analysis.missingFiles.length > 3 ? '...' : ''}`);
      }
      
      if (analysis.unintegratedFiles.length > 0) {
        console.log(`   🔌 Unintegrated: ${analysis.unintegratedFiles.slice(0, 3).map(f => path.basename(f)).join(', ')}${analysis.unintegratedFiles.length > 3 ? '...' : ''}`);
      }
      
      this.results.featureIntegrationGaps[featureName] = analysis;
      console.log('');
    });
  }

  // Check if a file is integrated in core app
  isFileIntegratedInCoreApp(filePath) {
    const fileName = path.basename(filePath, path.extname(filePath));
    const relativePath = filePath.replace(/\.(tsx?|jsx?)$/, '');
    
    for (const coreFile of coreAppFiles) {
      if (!this.fileExists(coreFile)) continue;
      
      const content = this.readFileContent(coreFile);
      const imports = this.extractImports(content);
      
      const hasImport = imports.some(imp => 
        imp.path.includes(fileName) || 
        imp.path.includes(relativePath) ||
        imp.path.endsWith(fileName)
      );
      
      if (hasImport) {
        return { integrated: true, integratedIn: [coreFile] };
      }
    }
    
    return { integrated: false, integratedIn: [] };
  }

  // Identify missing connections and architectural issues
  identifyArchitecturalIssues() {
    console.log('🏗️  Identifying architectural issues...\n');
    
    // Check for missing context providers
    const rootLayoutContent = this.readFileContent('app/_layout.tsx');
    if (rootLayoutContent) {
      const missingContexts = [];
      
      if (!rootLayoutContent.includes('LeaderboardContext') && !rootLayoutContent.includes('LeaderboardProvider')) {
        missingContexts.push('LeaderboardContext/Provider');
      }
      
      if (!rootLayoutContent.includes('OfflineContext') && !rootLayoutContent.includes('OfflineProvider')) {
        missingContexts.push('OfflineContext/Provider');
      }
      
      if (!rootLayoutContent.includes('SyncContext') && !rootLayoutContent.includes('SyncProvider')) {
        missingContexts.push('SyncContext/Provider');
      }
      
      if (missingContexts.length > 0) {
        this.results.architecturalIssues.push({
          type: 'Missing Context Providers',
          description: `Root layout missing: ${missingContexts.join(', ')}`,
          impact: 'High - Features cannot function without context',
          file: 'app/_layout.tsx'
        });
      }
    }
    
    // Check for missing tab screens
    const missingScreens = [];
    if (!this.fileExists('app/(tabs)/achievements.tsx')) {
      missingScreens.push('achievements.tsx');
    }
    
    if (missingScreens.length > 0) {
      this.results.architecturalIssues.push({
        type: 'Missing Tab Screens',
        description: `Missing screens: ${missingScreens.join(', ')}`,
        impact: 'High - Users cannot access features',
        files: missingScreens.map(s => `app/(tabs)/${s}`)
      });
    }
    
    // Check for unused UI components
    const uiComponents = featureModules.ui.components;
    const unusedUIComponents = uiComponents.filter(comp => 
      this.fileExists(comp) && !this.isFileIntegratedInCoreApp(comp).integrated
    );
    
    if (unusedUIComponents.length > 0) {
      this.results.architecturalIssues.push({
        type: 'Unused UI Components',
        description: `${unusedUIComponents.length} UI components built but not used`,
        impact: 'Medium - Code bloat and maintenance overhead',
        files: unusedUIComponents
      });
    }
    
    console.log(`Found ${this.results.architecturalIssues.length} architectural issues`);
    this.results.architecturalIssues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.type}: ${issue.description}`);
      console.log(`   Impact: ${issue.impact}`);
    });
    console.log('');
  }

  // Generate integration recommendations
  generateRecommendations() {
    console.log('💡 Generating integration recommendations...\n');
    
    Object.entries(this.results.featureIntegrationGaps).forEach(([featureName, analysis]) => {
      if (analysis.integrationGap > 0 || analysis.unintegratedFiles.length > 0) {
        const recommendation = {
          feature: featureName,
          priority: this.calculatePriority(featureName, analysis),
          actions: []
        };
        
        // Missing screen recommendations
        if (featureName === 'achievements' && !this.fileExists('app/(tabs)/achievements.tsx')) {
          recommendation.actions.push({
            type: 'Create Screen',
            description: 'Create app/(tabs)/achievements.tsx to display achievements',
            files: ['app/(tabs)/achievements.tsx']
          });
        }
        
        // Context integration recommendations
        if (analysis.unintegratedFiles.some(f => f.includes('Context'))) {
          recommendation.actions.push({
            type: 'Integrate Context',
            description: `Add ${featureName} context providers to app/_layout.tsx`,
            files: ['app/_layout.tsx']
          });
        }
        
        // Component integration recommendations
        const unintegratedComponents = analysis.unintegratedFiles.filter(f => f.includes('components/'));
        if (unintegratedComponents.length > 0) {
          recommendation.actions.push({
            type: 'Import Components',
            description: `Import and use ${unintegratedComponents.length} ${featureName} components`,
            files: analysis.expectedIntegrationPoints
          });
        }
        
        // Hook integration recommendations
        const unintegratedHooks = analysis.unintegratedFiles.filter(f => f.includes('hooks/'));
        if (unintegratedHooks.length > 0) {
          recommendation.actions.push({
            type: 'Use Hooks',
            description: `Integrate ${unintegratedHooks.length} ${featureName} hooks in screens`,
            files: analysis.expectedIntegrationPoints
          });
        }
        
        this.results.integrationRecommendations.push(recommendation);
      }
    });
    
    // Sort by priority
    this.results.integrationRecommendations.sort((a, b) => b.priority - a.priority);
    
    console.log('📋 INTEGRATION RECOMMENDATIONS (by priority):\n');
    this.results.integrationRecommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec.feature.toUpperCase()} (Priority: ${rec.priority}/10)`);
      rec.actions.forEach(action => {
        console.log(`   • ${action.type}: ${action.description}`);
      });
      console.log('');
    });
  }

  // Calculate integration priority
  calculatePriority(featureName, analysis) {
    let priority = 5; // Base priority
    
    // Higher priority for user-facing features
    if (['achievements', 'social', 'challenges'].includes(featureName)) {
      priority += 3;
    }
    
    // Higher priority for features with more existing files
    if (analysis.existingFiles > 5) {
      priority += 1;
    }
    
    // Higher priority for features with bigger integration gaps
    if (analysis.integrationGap > 0) {
      priority += analysis.integrationGap;
    }
    
    return Math.min(priority, 10);
  }

  // Main analysis method
  async analyze() {
    console.log('🔍 INTEGRATION GAP ANALYSIS\n');
    console.log('=' .repeat(80));
    console.log('Analyzing why feature modules aren\'t integrated into your app...\n');
    
    // Step 1: Analyze core app files
    this.analyzeCoreAppFiles();
    
    // Step 2: Analyze feature integration
    this.analyzeFeatureIntegration();
    
    // Step 3: Identify architectural issues
    this.identifyArchitecturalIssues();
    
    // Step 4: Generate recommendations
    this.generateRecommendations();
    
    // Summary
    console.log('📊 INTEGRATION SUMMARY\n');
    console.log('=' .repeat(50));
    
    const totalFeatures = Object.keys(featureModules).length;
    const featuresWithGaps = Object.values(this.results.featureIntegrationGaps)
      .filter(analysis => analysis.integrationGap > 0 || analysis.unintegratedFiles.length > 0).length;
    
    console.log(`• Total feature modules: ${totalFeatures}`);
    console.log(`• Features with integration gaps: ${featuresWithGaps}`);
    console.log(`• Architectural issues found: ${this.results.architecturalIssues.length}`);
    console.log(`• Integration recommendations: ${this.results.integrationRecommendations.length}`);
    
    // Save detailed report
    const reportPath = 'integration-analysis-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
    console.log('\n✅ Integration analysis complete!');
    
    return this.results;
  }
}

// Run the analysis
const analyzer = new IntegrationAnalyzer();
analyzer.analyze().catch(console.error);
