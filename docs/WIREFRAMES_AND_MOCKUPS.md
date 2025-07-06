# GymVerse Home Screen Wireframes & Visual Mockups

## Visual Design System

### Color Palette
- **Primary Background**: #0a0a0a (Deep Black)
- **Secondary Background**: #1a1a1a (Dark Gray)
- **Card Background**: #2a2a2a (Medium Gray)
- **Primary Text**: #ffffff (White)
- **Secondary Text**: #999999 (Light Gray)
- **Accent Colors**:
  - Orange: #FF6B35 (Energy/Action)
  - Teal: #00D4AA (Health/Calculation)  
  - Purple: #9E7FFF (Achievement)
  - Yellow: #FFB800 (Success/Trophy)

### Typography Hierarchy
- **H1 (Greeting)**: 24px, Inter-Bold, #ffffff
- **H2 (Section Titles)**: 20px, Inter-Bold, #ffffff
- **H3 (Card Titles)**: 18px, Inter-SemiBold, #ffffff
- **Body (Descriptions)**: 14px, Inter-Regular, #999999
- **Caption (Stats)**: 12px, Inter-Regular, #999999

## Home Screen Layout Structure

```
┌─────────────────────────────────────┐
│ HEADER SECTION                      │
│ ┌─────────────────┐ ┌─────────────┐ │
│ │ Good morning!   │ │ 🔥 7 day    │ │
│ │ Ready to crush  │ │   streak    │ │
│ │ your goals?     │ │             │ │
│ └─────────────────┘ └─────────────┘ │
├─────────────────────────────────────┤
│ WEEKLY STATS (Condensed)            │
│ ┌─────┐ ┌─────┐ ┌─────┐            │
│ │ 🏆  │ │ ⏰  │ │ 🔥  │            │
│ │  4  │ │ 240 │ │1200 │            │
│ │Work │ │ Min │ │Cal  │            │
│ └─────┘ └─────┘ └─────┘            │
├─────────────────────────────────────┤
│ QUICK ACTIONS (Primary Only)        │
│ ┌─────────────┐ ┌─────────────┐    │
│ │ ⚡ Quick    │ │ 🧮 TDEE     │    │
│ │   Workout   │ │   Calc      │    │
│ │ 15 min HIIT │ │ Daily cals  │    │
│ └─────────────┘ └─────────────┘    │
│ ┌─────────────┐ ┌─────────────┐    │
│ │ 🎯 Today's  │ │ ➕ More     │    │
│ │   Goal      │ │   Actions   │    │
│ │ 3 exercises │ │ View all    │    │
│ └─────────────┘ └─────────────┘    │
├─────────────────────────────────────┤
│ TODAY'S WORKOUTS (Streamlined)      │
│ Today's Workouts        See All >   │
│ ┌─────────────────────────────────┐ │
│ │ Upper Body Strength       5 ex  │ │
│ │ Focus on chest and back         │ │
│ │ ⏰ 45 min  🎯 Chest, Back      │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ RECENT ACHIEVEMENTS (Condensed)     │
│ Recent Achievements    View All >   │
│ ┌─────────────────────────────────┐ │
│ │ 🏆 First Week Complete    1/15  │ │
│ │    Completed 7 workouts         │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ 🏆 Consistency King       1/12  │ │
│ │    5 days in a row              │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## Modal Overlay Design

### "More Actions" Modal Layout

```
┌─────────────────────────────────────┐
│ All Features                    ✕   │
├─────────────────────────────────────┤
│                                     │
│ WORKOUT & TRAINING                  │
│ ┌─────────────┐ ┌─────────────┐    │
│ │ 🏋️ Custom   │ │ ⏲️ Rest     │    │
│ │   Workout   │ │   Timer     │    │
│ │ Create own  │ │ Track break │    │
│ └─────────────┘ └─────────────┘    │
│ ┌─────────────┐ ┌─────────────┐    │
│ │ 📖 Exercise │ │ 📅 Schedule │    │
│ │   Library   │ │   Workout   │    │
│ │ Browse all  │ │ Plan ahead  │    │
│ └─────────────┘ └─────────────┘    │
│                                     │
│ PROGRESS & ANALYTICS                │
│ ┌─────────────┐ ┌─────────────┐    │
│ │ 📈 Progress │ │ 📊 Detailed │    │
│ │   Charts    │ │   Stats     │    │
│ │ View growth │ │ Advanced    │    │
│ └─────────────┘ └─────────────┘    │
│ ┌─────────────┐ ┌─────────────┐    │
│ │ 🏆 Achieve  │ │ 📷 Progress │    │
│ │   ments     │ │   Photos    │    │
│ │ Milestones  │ │ Visual track│    │
│ └─────────────┘ └─────────────┘    │
│                                     │
│ SOCIAL & COMMUNITY                  │
│ ┌─────────────┐ ┌─────────────┐    │
│ │ 👥 Find     │ │ 📤 Share    │    │
│ │   Friends   │ │   Progress  │    │
│ │ Connect     │ │ Post achieve│    │
│ └─────────────┘ └─────────────┘    │
│ ┌─────────────┐ ┌─────────────┐    │
│ │ 🏆 Leader   │ │ ❤️ Chall    │    │
│ │   boards    │ │   enges     │    │
│ │ See ranking │ │ Join comps  │    │
│ └─────────────┘ └─────────────┘    │
│                                     │
│ TOOLS & SETTINGS                    │
│ ┌─────────────┐ ┌─────────────┐    │
│ │ ⚙️ Settings │ │ 🔔 Notif    │    │
│ │             │ │   ications  │    │
│ │ App prefs   │ │ Manage      │    │
│ └─────────────┘ └─────────────┘    │
│ ┌─────────────┐ ┌─────────────┐    │
│ │ 📍 Gym      │ │ 🔍 Search   │    │
│ │   Locator   │ │             │    │
│ │ Find nearby │ │ Find any    │    │
│ └─────────────┘ └─────────────┘    │
└─────────────────────────────────────┘
```

## Visual Hierarchy Improvements

### Before vs After Comparison

#### BEFORE (Overcrowded)
- 12+ icons visible simultaneously
- Equal visual weight for all actions
- No clear information hierarchy
- Cognitive overload for users
- Poor scannability

#### AFTER (Optimized)
- 4 primary actions prominently displayed
- Clear visual hierarchy with size and color
- Categorized secondary actions in modal
- Reduced cognitive load
- Improved scannability and focus

## Interaction Design

### Touch Targets & Accessibility
- **Minimum Touch Target**: 44x44pt (iOS) / 48x48dp (Android)
- **Card Padding**: 20px for comfortable interaction
- **Icon Size**: 24px for primary actions, 20px for secondary
- **Button Spacing**: 12px minimum between interactive elements

### Animation & Transitions
- **Modal Entry**: Slide up from bottom (300ms ease-out)
- **Modal Exit**: Slide down to bottom (250ms ease-in)
- **Card Interactions**: Subtle scale (0.95) on press
- **Loading States**: Skeleton screens for content loading

## Responsive Design Considerations

### Mobile Portrait (Primary)
- 2x2 grid for quick actions
- Full-width cards for workouts/achievements
- Modal covers full screen

### Mobile Landscape
- 4x1 grid for quick actions
- Side-by-side layout for content cards
- Modal as overlay (not full screen)

### Tablet Adaptations
- 4x2 grid for quick actions
- Multi-column layout for content
- Modal as centered overlay

## Implementation Notes

### Performance Optimizations
- Lazy load modal content
- Image optimization for workout thumbnails
- Efficient list rendering for achievements
- Minimal re-renders through proper state management

### Accessibility Features
- Screen reader support for all interactive elements
- High contrast mode compatibility
- Dynamic type scaling support
- Voice control compatibility
- Keyboard navigation support

This wireframe and mockup documentation provides a comprehensive visual guide for implementing the redesigned home screen while maintaining all existing functionality in a more organized and user-friendly manner.
