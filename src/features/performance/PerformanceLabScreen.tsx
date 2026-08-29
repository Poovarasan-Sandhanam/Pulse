import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing, typography } from '../../theme/tokens';
import { AnimatedPressable } from '../../motion/primitives/AnimatedPressable';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { springConfig } from '../../motion/springs';
import { Activity, Cpu, Zap, Flame } from 'lucide-react-native';

export const PerformanceLabScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [fps, setFps] = useState(60);
  const [jsRenderCount, setJsRenderCount] = useState(0);
  const [stressActive, setStressActive] = useState(false);

  // JS Thread Demo State
  const [jsBoxPos, setJsBoxPos] = useState({ x: 0, y: 0 });

  // UI Thread Shared Value
  const uiBoxX = useSharedValue(0);
  const uiBoxY = useSharedValue(0);

  // FPS Estimator Loop
  useEffect(() => {
    let lastTime = Date.now();
    let frames = 0;
    const interval = setInterval(() => {
      const now = Date.now();
      const delta = (now - lastTime) / 1000;
      setFps(Math.round(frames / delta) || 60);
      frames = 0;
      lastTime = now;
    }, 1000);

    const frameLoop = () => {
      frames++;
      requestAnimationFrame(frameLoop);
    };
    const frameId = requestAnimationFrame(frameLoop);

    return () => {
      clearInterval(interval);
      cancelAnimationFrame(frameId);
    };
  }, []);

  // JS Thread Gesture (Intentionally expensive setState loop)
  const jsPanGesture = Gesture.Pan().onChange((e) => {
    setJsRenderCount((c) => c + 1);
    // Simulating heavy JS work
    for (let i = 0; i < 5000; i++) {
      Math.sin(i) * Math.cos(i);
    }
    setJsBoxPos((prev) => ({
      x: Math.max(-100, Math.min(100, prev.x + e.changeX)),
      y: Math.max(-50, Math.min(50, prev.y + e.changeY)),
    }));
  }).onEnd(() => {
    setJsBoxPos({ x: 0, y: 0 });
  });

  // UI Thread Worklet Gesture
  const uiPanGesture = Gesture.Pan().onChange((e) => {
    'worklet';
    uiBoxX.value = Math.max(-100, Math.min(100, uiBoxX.value + e.changeX));
    uiBoxY.value = Math.max(-50, Math.min(50, uiBoxY.value + e.changeY));
  }).onEnd(() => {
    'worklet';
    uiBoxX.value = withSpring(0, springConfig.snappy);
    uiBoxY.value = withSpring(0, springConfig.snappy);
  });

  const uiBoxAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: uiBoxX.value }, { translateY: uiBoxY.value }],
  }));

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.md },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Performance Lab</Text>
        <Text style={styles.subtitle}>JS Thread vs Reanimated UI Thread Engineering</Text>
      </View>

      {/* Metrics Dashboard */}
      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Activity size={18} color={colors.positive} />
          <Text style={styles.metricValue}>{fps} FPS</Text>
          <Text style={styles.metricLabel}>Target 60/120 Hz</Text>
        </View>

        <View style={styles.metricCard}>
          <Cpu size={18} color={colors.accent} />
          <Text style={styles.metricValue}>{jsRenderCount}</Text>
          <Text style={styles.metricLabel}>JS Renders</Text>
        </View>
      </View>

      {/* Interactive Demos Section */}
      <Text style={styles.sectionTitle}>Interactive Benchmark Demos</Text>

      {/* Demo 1: JS Thread */}
      <View style={styles.demoCard}>
        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: colors.negativeMuted }]}>
            <Flame size={12} color={colors.negative} />
            <Text style={[styles.badgeText, { color: colors.negative }]}>
              JS THREAD DEMO
            </Text>
          </View>
        </View>
        <Text style={styles.demoDesc}>
          Gesture updates React state on JS thread. High latency, causes React re-renders & frame drops.
        </Text>

        <GestureDetector gesture={jsPanGesture}>
          <View style={styles.gestureTrack}>
            <View
              style={[
                styles.demoBox,
                {
                  transform: [
                    { translateX: jsBoxPos.x },
                    { translateY: jsBoxPos.y },
                  ],
                },
              ]}
            >
              <Text style={styles.boxText}>JS Drag</Text>
            </View>
          </View>
        </GestureDetector>
      </View>

      {/* Demo 2: UI Thread */}
      <View style={styles.demoCard}>
        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: colors.positiveMuted }]}>
            <Zap size={12} color={colors.positive} />
            <Text style={[styles.badgeText, { color: colors.positive }]}>
              UI THREAD DEMO
            </Text>
          </View>
        </View>
        <Text style={styles.demoDesc}>
          Gesture handled entirely via Reanimated Worklet on UI thread. Zero JS thread overhead, 120 FPS response.
        </Text>

        <GestureDetector gesture={uiPanGesture}>
          <View style={styles.gestureTrack}>
            <Animated.View style={[styles.demoBox, styles.uiBox, uiBoxAnimatedStyle]}>
              <Text style={styles.boxText}>UI Drag</Text>
            </Animated.View>
          </View>
        </GestureDetector>
      </View>

      {/* Stress Test Controls */}
      <AnimatedPressable
        style={[styles.stressBtn, stressActive && styles.stressBtnActive]}
        onPress={() => setStressActive(!stressActive)}
      >
        <Text style={styles.stressBtnText}>
          {stressActive ? 'STOP STRESS TEST' : 'RUN HEAVY RENDER STRESS TEST'}
        </Text>
      </AnimatedPressable>

      {stressActive && (
        <View style={styles.particleGrid}>
          {Array.from({ length: 120 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.particle,
                { backgroundColor: i % 2 === 0 ? colors.accent : colors.positive },
              ]}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingTop: spacing.xl,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: colors.primaryText,
  },
  subtitle: {
    ...typography.caption,
    color: colors.secondaryText,
    marginTop: 2,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    gap: 4,
  },
  metricValue: {
    ...typography.h2,
    color: colors.primaryText,
  },
  metricLabel: {
    ...typography.caption,
    color: colors.secondaryText,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.primaryText,
    marginBottom: spacing.md,
  },
  demoCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    gap: 4,
  },
  badgeText: {
    ...typography.caption,
    fontWeight: '700',
  },
  demoDesc: {
    ...typography.caption,
    color: colors.secondaryText,
    marginBottom: spacing.md,
  },
  gestureTrack: {
    height: 120,
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  demoBox: {
    width: 90,
    height: 48,
    borderRadius: radius.xs,
    backgroundColor: colors.negative,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uiBox: {
    backgroundColor: colors.positive,
  },
  boxText: {
    ...typography.caption,
    color: colors.primaryText,
    fontWeight: '700',
  },
  stressBtn: {
    height: 52,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.borderHighlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  stressBtnActive: {
    backgroundColor: colors.negativeMuted,
    borderColor: colors.negative,
  },
  stressBtnText: {
    ...typography.bodyBold,
    color: colors.primaryText,
    letterSpacing: 0.5,
  },
  particleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  particle: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
