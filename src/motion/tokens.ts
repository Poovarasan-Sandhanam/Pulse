/**
 * Pulse Motion System Tokens
 * 
 * Documentation & Rationale:
 * - Direct Manipulation (Touch/Drag): Uses `snappy` spring for low latency and zero perceptible lag.
 * - Sheet & Modal Transitions: Uses `gentle` spring for physical settling without harsh stops.
 * - Value Changes (Numbers/Badges): Uses `fast` timing to provide instant clarity without lingering.
 * - Context Transitions (Screens/Cards): Uses `normal` timing with bezier easing for natural deceleration.
 */

export const motionDuration = {
  instant: 100,
  fast: 200,
  normal: 350,
  slow: 500,
};

export const motionSprings = {
  // Snappy spring -> Direct touch manipulation, quick feedback
  snappy: {
    mass: 0.5,
    damping: 15,
    stiffness: 180,
  },
  // Gentle spring -> Bottom sheet settling, natural physical movement
  gentle: {
    mass: 1.0,
    damping: 22,
    stiffness: 110,
  },
  // Bouncy spring -> Trade completion success, playful feedback
  bouncy: {
    mass: 0.8,
    damping: 12,
    stiffness: 150,
  },
  // Stiff spring -> Rigid snap points, rapid alignment
  stiff: {
    mass: 0.3,
    damping: 24,
    stiffness: 260,
  },
};
