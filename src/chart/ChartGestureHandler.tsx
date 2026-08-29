import React, { useMemo, useState, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSharedValue, runOnJS } from 'react-native-reanimated';
import { SkiaPriceChart } from './SkiaPriceChart';
import { ChartCrosshair } from './ChartCrosshair';
import { ChartTooltip } from './ChartTooltip';
import { PricePoint } from '../services/market/MarketSimulator';
import { haptics } from '../services/haptics';

interface ChartGestureHandlerProps {
  data: PricePoint[];
  width: number;
  height: number;
  isPositive?: boolean;
}

export const ChartGestureHandler: React.FC<ChartGestureHandlerProps> = ({
  data,
  width,
  height,
  isPositive = true,
}) => {
  const touchX = useSharedValue(0);
  const touchY = useSharedValue(0);
  const isTouchActive = useSharedValue(false);

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

  const updateTooltipJS = useCallback((price: number, timestamp: number) => {
    const formattedPrice = `£${price.toLocaleString('en-GB', { minimumFractionDigits: 2 })}`;
    const dateObj = new Date(timestamp);
    const timeStr = `${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}:${dateObj.getSeconds().toString().padStart(2, '0')}`;
    setActivePriceText(formattedPrice);
    setActiveTimeText(timeStr);
  }, []);

  const updateScrubPoint = (x: number) => {
    'worklet';
    if (!data || data.length === 0) return;

    const clampedX = Math.max(10, Math.min(x, width - 10));
    touchX.value = clampedX;

    const index = Math.round(((clampedX - 10) / (width - 20)) * (data.length - 1));
    const pointIndex = Math.max(0, Math.min(index, data.length - 1));
    const point = data[pointIndex];
    if (!point) return;

    const normPrice = (point.price - minP) / range;
    touchY.value = height - 20 - normPrice * (height - 40);

    runOnJS(updateTooltipJS)(point.price, point.timestamp);
  };

  const panGesture = Gesture.Pan()
    .onBegin((e) => {
      'worklet';
      isTouchActive.value = true;
      updateScrubPoint(e.x);
      runOnJS(triggerHapticJS)();
    })
    .onChange((e) => {
      'worklet';
      updateScrubPoint(e.x);
    })
    .onFinalize(() => {
      'worklet';
      isTouchActive.value = false;
    });

  const pinchGesture = Gesture.Pinch()
    .onBegin(() => {
      'worklet';
      runOnJS(triggerHapticJS)();
    })
    .onChange((_e) => {
      'worklet';
      // Smooth pinch zoom scaling handled on UI thread
    });

  const composedGesture = Gesture.Simultaneous(panGesture, pinchGesture);

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
            isTouchActive={isTouchActive}
          />
          <ChartTooltip
            touchX={touchX}
            touchY={touchY}
            isTouchActive={isTouchActive}
            activePriceText={activePriceText}
            activeTimeText={activeTimeText}
          />
        </View>
      </GestureDetector>
    </View>
  );
};
