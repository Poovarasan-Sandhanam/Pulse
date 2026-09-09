import React from 'react';
import { StyleSheet, View, Text, Switch, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing, typography } from '../../theme/tokens';
import { useSettingsStore, PerformanceMode } from '../../store/useSettingsStore';
import { AnimatedPressable } from '../../motion/primitives/AnimatedPressable';
import { useRouter } from 'expo-router';
import { Volume2, Smartphone, Cpu, Eye, Gauge } from 'lucide-react-native';

export const SettingsScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    hapticsEnabled,
    soundEnabled,
    reduceMotion,
    performanceMode,
    setHapticsEnabled,
    setSoundEnabled,
    setReduceMotion,
    setPerformanceMode,
  } = useSettingsStore();

  const performanceModes: PerformanceMode[] = ['quality', 'balanced', 'performance'];

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
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Preferences & Motion System Controls</Text>
      </View>

      {/* Developer Performance Lab Link Banner */}
      <AnimatedPressable
        style={styles.labCard}
        onPress={() => router.push('/(tabs)/settings/performance-lab')}
      >
        <View style={styles.labIconContainer}>
          <Gauge size={24} color={colors.accent} />
        </View>
        <View style={styles.labTextCol}>
          <Text style={styles.labTitle}>Developer Performance Lab</Text>
          <Text style={styles.labSub}>
            Inspect FPS, JS vs UI thread demos & benchmark stress test
          </Text>
        </View>
      </AnimatedPressable>

      {/* Motion & Feedback Section */}
      <Text style={styles.sectionTitle}>Motion & Feedback</Text>

      <View style={styles.settingRow}>
        <View style={styles.rowLeft}>
          <Smartphone size={20} color={colors.secondaryText} />
          <View>
            <Text style={styles.rowLabel}>Haptic Feedback</Text>
            <Text style={styles.rowSub}>Vibrations on gestures & trades</Text>
          </View>
        </View>
        <Switch
          value={hapticsEnabled}
          onValueChange={setHapticsEnabled}
          trackColor={{ false: colors.border, true: colors.accent }}
        />
      </View>

      <View style={styles.settingRow}>
        <View style={styles.rowLeft}>
          <Volume2 size={20} color={colors.secondaryText} />
          <View>
            <Text style={styles.rowLabel}>Sound Effects</Text>
            <Text style={styles.rowSub}>Subtle audio feedback on actions</Text>
          </View>
        </View>
        <Switch
          value={soundEnabled}
          onValueChange={setSoundEnabled}
          trackColor={{ false: colors.border, true: colors.accent }}
        />
      </View>

      <View style={styles.settingRow}>
        <View style={styles.rowLeft}>
          <Eye size={20} color={colors.secondaryText} />
          <View>
            <Text style={styles.rowLabel}>Reduce Motion</Text>
            <Text style={styles.rowSub}>Simplify complex spring transitions</Text>
          </View>
        </View>
        <Switch
          value={reduceMotion}
          onValueChange={setReduceMotion}
          trackColor={{ false: colors.border, true: colors.accent }}
        />
      </View>

      {/* Performance Mode Section */}
      <Text style={styles.sectionTitle}>Rendering Performance</Text>
      <View style={styles.modeCard}>
        <View style={styles.modeHeader}>
          <Cpu size={20} color={colors.secondaryText} />
          <Text style={styles.rowLabel}>Quality Mode</Text>
        </View>

        <View style={styles.modeSelector}>
          {performanceModes.map((mode) => (
            <AnimatedPressable
              key={mode}
              style={[
                styles.modeBtn,
                performanceMode === mode && styles.modeBtnActive,
              ]}
              onPress={() => setPerformanceMode(mode)}
            >
              <Text
                style={[
                  styles.modeBtnText,
                  performanceMode === mode && styles.modeBtnTextActive,
                ]}
              >
                {mode.toUpperCase()}
              </Text>
            </AnimatedPressable>
          ))}
        </View>
      </View>
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
  labCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentMuted,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.accent,
    marginBottom: spacing.xl,
  },
  labIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  labTextCol: {
    flex: 1,
  },
  labTitle: {
    ...typography.bodyBold,
    color: colors.primaryText,
  },
  labSub: {
    ...typography.caption,
    color: colors.secondaryText,
    marginTop: 2,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.primaryText,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  rowLabel: {
    ...typography.bodyBold,
    color: colors.primaryText,
  },
  rowSub: {
    ...typography.caption,
    color: colors.secondaryText,
  },
  modeCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  modeSelector: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceElevated,
    padding: 4,
    borderRadius: radius.xs,
    gap: 4,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    borderRadius: radius.xs,
  },
  modeBtnActive: {
    backgroundColor: colors.accent,
  },
  modeBtnText: {
    ...typography.caption,
    color: colors.secondaryText,
    fontWeight: '700',
  },
  modeBtnTextActive: {
    color: colors.primaryText,
  },
});
