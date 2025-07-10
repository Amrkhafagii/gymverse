// Design System Tokens for GymVerse
// Based on Material Design 3.0 and iOS HIG principles

export const DesignTokens = {
  // Color System - Modern Dark Theme with Accessibility
  colors: {
    // Primary Brand Colors
    primary: {
      50: '#F3F0FF',   // Lightest tint
      100: '#E9E2FF',  // Light tint
      200: '#D6C7FF',  // Medium light
      300: '#C4A9FF',  // Medium
      400: '#B18BFF',  // Medium dark
      500: '#9E7FFF',  // Primary (current)
      600: '#8B5FFF',  // Dark
      700: '#7C3AED',  // Darker (current secondary)
      800: '#6D28D9',  // Very dark
      900: '#5B21B6',  // Darkest
    },
    border: {
      primary:  {     600: '#8B5FFF'},  // Dark

      secondary:  {     700: '#7C3AED'},  // Darker (current secondary)

      accent:   {    500: '#9E7FFF'},  // Primary (current)

      error: {     500: '#EF4444'},

    },

    background: {
      primary:  {     600: '#8B5FFF'},  // Dark

   

    },
    // Semantic Colors
    success: {
      50: '#ECFDF5',
      500: '#10B981',
      600: '#059669',
      900: '#064E3B',
    },
    
    warning: {
      50: '#FFFBEB',
      500: '#F59E0B',
      600: '#D97706',
      900: '#78350F',
    },
    
    error: {
      50: '#FEF2F2',
      500: '#EF4444',
      600: '#DC2626',
      900: '#7F1D1D',
    },
    
    // Neutral System - Enhanced for dark theme
    neutral: {
      0: '#FFFFFF',     // Pure white
      50: '#FAFAFA',    // Off white
      100: '#F5F5F5',   // Light gray
      200: '#E5E5E5',   // Medium light gray
      300: '#D4D4D4',   // Medium gray
      400: '#A3A3A3',   // Current light text
      500: '#737373',   // Medium dark gray
      600: '#525252',   // Dark gray
      700: '#404040',   // Very dark gray
      800: '#262626',   // Almost black
      850: '#1F1F1F',   // Card background
      900: '#171717',   // Current dark background
      950: '#0A0A0A',   // Pure black (current)
    },
    
    // Surface Colors for Dark Theme
    surface: {
      primary: '#0A0A0A',      // Main background
      secondary: '#1A1A1A',    // Card/elevated surfaces
      tertiary: '#262626',     // Input fields, disabled states
      overlay: 'rgba(0, 0, 0, 0.8)', // Modal overlays
    },
    
    // Text Colors with WCAG AA Compliance
    text: {
      primary: '#FFFFFF',      // High emphasis text
      secondary: '#A3A3A3',    // Medium emphasis text
      tertiary: '#737373',     // Low emphasis text
      disabled: '#525252',     // Disabled text
      inverse: '#0A0A0A',      // Text on light backgrounds
    },
  },
  
  // Typography Scale - Modern, Readable Hierarchy
  typography: {
    // Font Families
    fontFamily: {
      primary: 'Inter',        // Current system font
      display: 'Inter',        // For headlines
      mono: 'SF Mono',         // For code/numbers
    },
    
    // Font Weights
    fontWeight: {
      light: '300',
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    
    // Type Scale (1.25 ratio for mobile)
    fontSize: {
      xs: 12,      // Captions, labels
      sm: 14,      // Body small, secondary text
      base: 16,    // Body text, primary content
      lg: 18,      // Subheadings
      xl: 20,      // Section titles
      '2xl': 24,   // Page titles
      '3xl': 28,   // Display small
      '4xl': 32,   // Display medium
      '5xl': 36,   // Display large
    },
    
    // Line Heights
    lineHeight: {
      tight: 1.2,
      normal: 1.4,
      relaxed: 1.6,
    },
    
    // Letter Spacing
    letterSpacing: {
      tight: -0.025,
      normal: 0,
      wide: 0.025,
    },
  },
  
  // Spacing System - 8pt Grid
  spacing: {
    0: 0,
    1: 4,     // 0.25rem
    2: 8,     // 0.5rem
    3: 12,    // 0.75rem
    4: 16,    // 1rem
    5: 20,    // 1.25rem
    6: 24,    // 1.5rem
    8: 32,    // 2rem
    10: 40,   // 2.5rem
    12: 48,   // 3rem
    16: 64,   // 4rem
    20: 80,   // 5rem
    24: 96,   // 6rem
  },
  
  // Border Radius System
  borderRadius: {
    none: 0,
    sm: 4,
    base: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    full: 9999,
  },
  
  // Shadow System for Depth
  shadow: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    base: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },
  
  // Animation & Timing
  animation: {
    duration: {
      fast: 150,
      normal: 250,
      slow: 350,
    },
    easing: {
      easeOut: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0.0, 1, 1)',
      easeInOut: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    },
  },
  
  // Layout & Breakpoints
  layout: {
    containerPadding: 20,
    sectionSpacing: 32,
    cardPadding: 16,
    minTouchTarget: 44,
  },
};

// Utility functions for consistent usage
export const getColor = (path: string) => {
  const keys = path.split('.');
  let value: any = DesignTokens.colors;
  
  for (const key of keys) {
    value = value[key];
    if (value === undefined) return '#000000';
  }
  
  return value;
};

export const getSpacing = (multiplier: number) => {
  return DesignTokens.spacing[multiplier as keyof typeof DesignTokens.spacing] || 0;
};

export const getTypography = (size: keyof typeof DesignTokens.typography.fontSize) => {
  return {
    fontSize: DesignTokens.typography.fontSize[size],
    lineHeight: DesignTokens.typography.fontSize[size] * DesignTokens.typography.lineHeight.normal,
  };
};
