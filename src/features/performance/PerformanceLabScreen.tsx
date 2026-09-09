import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
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
import { Activity, Cpu, Zap, Flame, BarChart2, Layers } from 'lucide-react-native';
import { SkiaPriceChart } from '../../chart/SkiaPriceChart';
import { PricePoint, generateSyntheticDataset } from '../../services/market/MarketSimulator';
import { fetchCoinGeckoMarketData } from '../../services/market/CoinGeckoService';
import { Loader } from '../../components/Loader';

const SCREEN_WIDTH = Dimensions.get('window').width;

type BenchmarkSource = 'coingecko' | 'synthetic-10k' | 'synthetic-50k' | 'synthetic-100k';

export const PerformanceLabScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [fps, setFps] = useState(60);
  const [jsRenderCount, setJsRenderCount] = useState(0);
  const [stressActive, setStressActive] = useState(false);

  // Large Dataset Benchmark State
  const [activeSource, setActiveSource] = useState<BenchmarkSource>('synthetic-10k');
  const [chartData, setChartData] = useState<PricePoint[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [benchmarkMetrics, setBenchmarkMetrics] = useState<{
    downsampleMs: number;
    pathCreationMs: number;
    renderedPoints: number;
  }>({ downsampleMs: 0, pathCreationMs: 0, renderedPoints: 0 });

  // JS Thread Demo State
  const [jsBoxPos, setJsBoxPos] = useState({ x: 0, y: 0 });

  // UI Thread Shared Value
  const uiBoxX = useSharedValue(0);
  const uiBoxY = useSharedValue(0);

  // Load Data based on activeSource selection
  useEffect(() => {
    let isMounted = true;
    setIsLoadingData(true);

    const loadDataset = async () => {
      if (activeSource === 'coingecko') {
        const data = await fetchCoinGeckoMarketData('bitcoin', 30);
        if (isMounted) {
          setChartData(data);
          setIsLoadingData(false);
        }
      } else if (activeSource === 'synthetic-10k') {
        const data = generateSyntheticDataset(10000);
        if (isMounted) {
          setChartData(data);
          setIsLoadingData(false);
        }
      } else if (activeSource === 'synthetic-50k') {
        const data = generateSyntheticDataset(50000);
        if (isMounted) {
          setChartData(data);
          setIsLoadingData(false);
        }
      } else if (activeSource === 'synthetic-100k') {
        const data = generateSyntheticDataset(100000);
        if (isMounted) {
          setChartData(data);
          setIsLoadingData(false);
        }
      }
    };

    loadDataset();
    return () => {
      isMounted = false;
    };
  }, [activeSource]);

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

  const chartWidth = SCREEN_WIDTH - spacing.md * 2 - spacing.md * 2;

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
        <Text style={styles.subtitle}>Rendering Engineering, Data Downsampling & Thread Isolation</Text>
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

      {/* BENCHMARK MODULE: Large Dataset Skia Renderer */}
      <Text style={styles.sectionTitle}>Large Dataset Rendering Benchmark</Text>
      <View style={styles.demoCard}>
        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: colors.accentMuted }]}>
            <BarChart2 size={12} color={colors.accent} />
            <Text style={[styles.badgeText, { color: colors.accent }]}>
              SKIA PATH & DATA REDUCTION PIPELINE
            </Text>
          </View>
        </View>
        <Text style={styles.demoDesc}>
          Benchmarking LTTB downsampling and viewport culling on 1k–100k raw point streams before Skia GPU path vector assembly.
        </Text>

        {/* Source Switcher Buttons */}
        <View style={styles.sourceBtnRow}>
          <AnimatedPressable
            style={[styles.sourceBtn, activeSource === 'coingecko' && styles.sourceBtnActive]}
            onPress={() => setActiveSource('coingecko')}
          >
            <Text style={[styles.sourceBtnText, activeSource === 'coingecko' && styles.sourceBtnTextActive]}>
              CoinGecko BTC
            </Text>
          </AnimatedPressable>

          <AnimatedPressable
            style={[styles.sourceBtn, activeSource === 'synthetic-10k' && styles.sourceBtnActive]}
            onPress={() => setActiveSource('synthetic-10k')}
          >
            <Text style={[styles.sourceBtnText, activeSource === 'synthetic-10k' && styles.sourceBtnTextActive]}>
              Synthetic 10k
            </Text>
          </AnimatedPressable>

          <AnimatedPressable
            style={[styles.sourceBtn, activeSource === 'synthetic-50k' && styles.sourceBtnActive]}
            onPress={() => setActiveSource('synthetic-50k')}
          >
            <Text style={[styles.sourceBtnText, activeSource === 'synthetic-50k' && styles.sourceBtnTextActive]}>
              50k
            </Text>
          </AnimatedPressable>

          <AnimatedPressable
            style={[styles.sourceBtn, activeSource === 'synthetic-100k' && styles.sourceBtnActive]}
            onPress={() => setActiveSource('synthetic-100k')}
          >
            <Text style={[styles.sourceBtnText, activeSource === 'synthetic-100k' && styles.sourceBtnTextActive]}>
              100k
            </Text>
          </AnimatedPressable>
        </View>

        {/* Chart Viewport Canvas */}
        <View style={styles.chartContainer}>
          {isLoadingData ? (
            <View style={styles.loadingContainer}>
              <Loader text={`Generating ${activeSource} dataset...`} />
            </View>
          ) : (
            <SkiaPriceChart
              data={chartData}
              width={chartWidth}
              height={180}
              assetSymbol={activeSource === 'coingecko' ? 'BTC' : 'SYNTH'}
              isPositive={true}
              onBenchmarkMetrics={setBenchmarkMetrics}
            />
          )}
        </View>

        {/* Telemetry Metrics Panel */}
        <View style={styles.telemetryCard}>
          <View style={styles.telemetryRow}>
            <Text style={styles.telemetryLabel}>Raw Dataset Points:</Text>
            <Text style={styles.telemetryVal}>{chartData.length.toLocaleString()}</Text>
          </View>
          <View style={styles.telemetryRow}>
            <Text style={styles.telemetryLabel}>LTTB Reduction Time:</Text>
            <Text style={[styles.telemetryVal, { color: colors.positive }]}>
              {benchmarkMetrics.downsampleMs} ms
            </Text>
          </View>
          <View style={styles.telemetryRow}>
            <Text style={styles.telemetryLabel}>Skia Path Build Time:</Text>
            <Text style={[styles.telemetryVal, { color: colors.accent }]}>
              {benchmarkMetrics.pathCreationMs} ms
            </Text>
          </View>
          <View style={styles.telemetryRow}>
            <Text style={styles.telemetryLabel}>Rendered Skia Points:</Text>
            <Text style={styles.telemetryVal}>{benchmarkMetrics.renderedPoints}</Text>
          </View>
          <View style={styles.telemetryRow}>
            <Text style={styles.telemetryLabel}>Labels & Accessibility:</Text>
            <Text style={[styles.telemetryVal, { color: colors.positive }]}>Native RN Overlay</Text>
          </View>
        </View>
      </View>

      {/* Interactive Thread Demos Section */}
      <Text style={styles.sectionTitle}>Thread Isolation Demos</Text>

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
  sourceBtnRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  sourceBtn: {
    flex: 1,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.xs,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  sourceBtnActive: {
    backgroundColor: colors.accentMuted,
    borderColor: colors.accent,
  },
  sourceBtnText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.secondaryText,
    fontWeight: '600',
  },
  sourceBtnTextActive: {
    color: colors.accent,
    fontWeight: '700',
  },
  chartContainer: {
    height: 180,
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  loadingText: {
    ...typography.caption,
    color: colors.secondaryText,
  },
  telemetryCard: {
    backgroundColor: colors.surfaceElevated,
    padding: spacing.sm,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  telemetryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  telemetryLabel: {
    ...typography.caption,
    color: colors.secondaryText,
  },
  telemetryVal: {
    ...typography.caption,
    color: colors.primaryText,
    fontWeight: '700',
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
