// Component Design Specifications
// Modern component patterns for GymVerse

export const ComponentSpecs = {
  // Button System
  buttons: {
    // Primary Action Button
    primary: {
      height: 48,
      borderRadius: 12,
      paddingHorizontal: 24,
      paddingVertical: 12,
      minWidth: 120,
      typography: {
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.025,
      },
      states: {
        default: {
          backgroundColor: '#9E7FFF',
          color: '#FFFFFF',
        },
        pressed: {
          backgroundColor: '#8B5FFF',
          transform: [{ scale: 0.98 }],
        },
        disabled: {
          backgroundColor: '#404040',
          color: '#737373',
        },
      },
    },
    
    // Secondary Button
    secondary: {
      height: 48,
      borderRadius: 12,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: '#404040',
      backgroundColor: 'transparent',
      typography: {
        fontSize: 16,
        fontWeight: '500',
        color: '#FFFFFF',
      },
      states: {
        pressed: {
          backgroundColor: '#1A1A1A',
          borderColor: '#525252',
        },
      },
    },
    
    // Icon Button
    icon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#1A1A1A',
      states: {
        pressed: {
          backgroundColor: '#262626',
          transform: [{ scale: 0.95 }],
        },
      },
    },
  },
  
  // Card System
  cards: {
    // Standard Card
    standard: {
      backgroundColor: '#1A1A1A',
      borderRadius: 16,
      padding: 16,
      shadow: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      },
    },
    
    // Elevated Card (for important content)
    elevated: {
      backgroundColor: '#1A1A1A',
      borderRadius: 20,
      padding: 20,
      shadow: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
      },
    },
    
    // Interactive Card
    interactive: {
      backgroundColor: '#1A1A1A',
      borderRadius: 16,
      padding: 16,
      states: {
        pressed: {
          backgroundColor: '#262626',
          transform: [{ scale: 0.98 }],
        },
      },
    },
  },
  
  // Input System
  inputs: {
    // Text Input
    textField: {
      height: 48,
      borderRadius: 12,
      paddingHorizontal: 16,
      backgroundColor: '#262626',
      borderWidth: 1,
      borderColor: 'transparent',
      typography: {
        fontSize: 16,
        color: '#FFFFFF',
      },
      states: {
        focused: {
          borderColor: '#9E7FFF',
          backgroundColor: '#1A1A1A',
        },
        error: {
          borderColor: '#EF4444',
        },
      },
    },
    
    // Search Input
    search: {
      height: 44,
      borderRadius: 22,
      paddingHorizontal: 16,
      backgroundColor: '#262626',
      typography: {
        fontSize: 16,
        color: '#FFFFFF',
      },
    },
  },
  
  // Navigation Components
  navigation: {
    // Tab Bar
    tabBar: {
      height: 90,
      backgroundColor: 'rgba(26, 26, 26, 0.95)',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingBottom: 34, // Safe area
      paddingTop: 8,
    },
    
    // Tab Item
    tabItem: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 44,
      states: {
        active: {
          color: '#9E7FFF',
        },
        inactive: {
          color: '#737373',
        },
      },
    },
    
    // Header
    header: {
      height: 56,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
  },
  
  // List Components
  lists: {
    // List Item
    item: {
      minHeight: 56,
      paddingHorizontal: 20,
      paddingVertical: 12,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#1A1A1A',
      borderRadius: 12,
      marginBottom: 8,
      states: {
        pressed: {
          backgroundColor: '#262626',
        },
      },
    },
    
    // Section Header
    sectionHeader: {
      paddingHorizontal: 20,
      paddingVertical: 8,
      backgroundColor: '#0A0A0A',
      typography: {
        fontSize: 14,
        fontWeight: '600',
        color: '#A3A3A3',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
      },
    },
  },
  
  // Status & Feedback
  status: {
    // Badge
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      backgroundColor: '#9E7FFF',
      typography: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFFFFF',
      },
    },
    
    // Progress Bar
    progressBar: {
      height: 8,
      borderRadius: 4,
      backgroundColor: '#262626',
      overflow: 'hidden',
    },
    
    // Loading Skeleton
    skeleton: {
      backgroundColor: '#262626',
      borderRadius: 8,
    },
  },
};

// Accessibility Helpers
export const AccessibilitySpecs = {
  minTouchTarget: 44,
  colorContrast: {
    normal: 4.5,  // WCAG AA
    large: 3.0,   // WCAG AA for large text
  },
  focusIndicator: {
    borderWidth: 2,
    borderColor: '#9E7FFF',
    borderRadius: 4,
  },
  semanticRoles: {
    button: 'button',
    link: 'link',
    heading: 'header',
    text: 'text',
    image: 'image',
    list: 'list',
    listItem: 'listitem',
  },
};
