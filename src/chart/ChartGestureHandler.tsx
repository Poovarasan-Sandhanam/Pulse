import React, { useMemo, useState, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  useSharedValue,
  runOnJS,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { SkiaPriceChart } from './SkiaPriceChart';
import { ChartCrosshair } from './ChartCrosshair';
import { ChartTooltip } from './ChartTooltip';
import { PricePoint } from '../services/market/MarketSimulator';
import { haptics } from '../services/haptics';

/** How long the tooltip lingers after a tap before fading out. */
const TAP_LINGER_MS = 2000;
const FADE_MS = 180;

interface ChartGestureHandlerProps {
  data: PricePoint[];
  width: number;
  height: number;
  isPositive?: boolean;
  onPointScrubbed?: (point: PricePoint | null) => void;
}

export const ChartGestureHandler: React.FC<ChartGestureHandlerProps> = ({
  data,
  width,
  height,
  isPositive = true,
  onPointScrubbed,
}) => {
  const touchX = useSharedValue(0);
  const touchY = useSharedValue(0);
  // 0 = hidden, 1 = fully visible. A number (not a boolean) so the auto-hide
  // after a tap can run as a UI-thread animation instead of a JS timer.
  const activeOpacity = useSharedValue(0);

  const [activePriceText, setActivePriceText] = useState('');
  const [activeTimeText, setActiveTimeText] = useState('');

  const { minP, range } = useMemo(() => {
    if (!data || data.length === 0) {
      return { minP: 0, range: 1 };
    }
    const prices = data.map((d) => d.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return { minP: min, range: max - min || 1 };
  }, [data]);

  const triggerHapticJS = useCallback(() => {
    haptics.selection();
  }, []);

  const updateTooltipJS = useCallback(
    (point: PricePoint) => {
      const price = point.price;
      const timestamp = point.timestamp;

      const formattedPrice = `$${
        price >= 1000
          ? price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          : price.toFixed(4)
      }`;

      const dateObj = new Date(timestamp);
      // Format full date & time (e.g. Sep 2, 2026, 14:23:05)
      const dateStr = dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      const timeStr = dateObj.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });

      setActivePriceText(formattedPrice);
      setActiveTimeText(`${dateStr} • ${timeStr}`);

      if (onPointScrubbed) {
        onPointScrubbed(point);
      }
    },
    [onPointScrubbed]
  );

  const clearScrubJS = useCallback(() => {
    if (onPointScrubbed) {
      onPointScrubbed(null);
    }
  }, [onPointScrubbed]);

  const updateScrubPoint = (x: number) => {
    'worklet';
    if (!data || data.length === 0) return;
    if (!Number.isFinite(x) || width <= 20 || height <= 40) return;

    const clampedX = Math.max(10, Math.min(x, width - 10));
    touchX.value = clampedX;

    const index = Math.round(((clampedX - 10) / (width - 20)) * (data.length - 1));
    const pointIndex = Math.max(0, Math.min(index, data.length - 1));
    const point = data[pointIndex];
    if (!point || !Number.isFinite(point.price)) return;

    const normPrice = (point.price - minP) / range;
    const y = height - 20 - normPrice * (height - 40);
    touchY.value = Number.isFinite(y) ? y : height / 2;

    runOnJS(updateTooltipJS)(point);
  };

  const tapGesture = Gesture.Tap()
    .onBegin((e) => {
      'worklet';
      activeOpacity.value = 1;
      updateScrubPoint(e.x);
      runOnJS(triggerHapticJS)();
    })
    .onFinalize(() => {
      'worklet';
      // Keep the tooltip visible briefly after a tap, then fade it out.
      // This runs on the UI thread: no JS timer to leak or to fire after
      // unmount, and Reanimated cancels it automatically if the view goes away.
      activeOpacity.value = withDelay(
        TAP_LINGER_MS,
        withTiming(0, { duration: FADE_MS }, (finished) => {
          'worklet';
          if (finished) {
            runOnJS(clearScrubJS)();
          }
        })
      );
    });

  const panGesture = Gesture.Pan()
    .onBegin((e) => {
      'worklet';
      activeOpacity.value = 1;
      updateScrubPoint(e.x);
      runOnJS(triggerHapticJS)();
    })
    .onChange((e) => {
      'worklet';
      updateScrubPoint(e.x);
    })
    .onFinalize(() => {
      'worklet';
      activeOpacity.value = withTiming(0, { duration: FADE_MS });
      runOnJS(clearScrubJS)();
    });

  const composedGesture = Gesture.Race(tapGesture, panGesture);

  return (
    <View style={{ width, height }}>
      <GestureDetector gesture={composedGesture}>
        <View style={StyleSheet.absoluteFill}>
          <SkiaPriceChart
            data={data}
            width={width}
            height={height}
            isPositive={isPositive}
          />
          <ChartCrosshair
            width={width}
            height={height}
            touchX={touchX}
            touchY={touchY}
            activeOpacity={activeOpacity}
          />
          <ChartTooltip
            chartWidth={width}
            touchX={touchX}
            touchY={touchY}
            activeOpacity={activeOpacity}
            activePriceText={activePriceText}
            activeTimeText={activeTimeText}
          />
        </View>
      </GestureDetector>
    </View>
  );
};
