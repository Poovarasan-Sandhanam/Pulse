import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Canvas,
  Path,
  LinearGradient,
  vec,
  Skia,
  Line,
  Group,
} from '@shopify/react-native-skia';
import { PricePoint } from '../services/market/MarketSimulator';
import { colors } from '../theme/tokens';
import { SharedValue } from 'react-native-reanimated';
import { downsampleLTTB, cullViewportData } from './utils/dataReduction';
import { ChartNativeOverlay } from './ChartNativeOverlay';

interface SkiaPriceChartProps {
  data: PricePoint[];
  width: number;
  height: number;
  lineColor?: string;
  isPositive?: boolean;
  assetSymbol?: string;
  maxTargetPoints?: number;
  minTimeDomain?: number;
  maxTimeDomain?: number;
  showOverlay?: boolean;
  onBenchmarkMetrics?: (metrics: { downsampleMs: number; pathCreationMs: number; renderedPoints: number }) => void;
  touchX?: SharedValue<number>;
  touchY?: SharedValue<number>;
  isTouchActive?: SharedValue<boolean>;
}

export const SkiaPriceChart: React.FC<SkiaPriceChartProps> = ({
  data,
  width,
  height,
  lineColor,
  isPositive = true,
  assetSymbol = 'BTC',
  maxTargetPoints = 500,
  minTimeDomain,
  maxTimeDomain,
  showOverlay,
  onBenchmarkMetrics,
}) => {
  const strokeColor = lineColor || (isPositive ? colors.positive : colors.negative);
  const paddingVertical = height < 60 ? 4 : 20;
  const paddingHorizontal = height < 60 ? 2 : 10;
  const renderOverlay = showOverlay ?? height >= 80;

  const { path, fillPath, minPrice, maxPrice, startTime, endTime } = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        path: Skia.Path.Make(),
        fillPath: Skia.Path.Make(),
        minPrice: 0,
        maxPrice: 0,
        startTime: undefined,
        endTime: undefined,
      };
    }

    const startPerf = performance.now();

    // 1. Viewport Culling
    const culledData = cullViewportData(data, minTimeDomain, maxTimeDomain);

    // 2. LTTB Downsampling if point count exceeds maxTargetPoints
    const processedData =
      culledData.length > maxTargetPoints
        ? downsampleLTTB(culledData, maxTargetPoints)
        : culledData;

    const downsampleEndPerf = performance.now();

    // Calculate min/max price bounds
    let minP = Infinity;
    let maxP = -Infinity;
    for (let i = 0; i < processedData.length; i++) {
      const p = processedData[i].price;
      if (p < minP) minP = p;
      if (p > maxP) maxP = p;
    }
    if (minP === Infinity) minP = 0;
    if (maxP === -Infinity) maxP = 1;
    const priceRange = maxP - minP || 1;

    const chartWidth = width - paddingHorizontal * 2;
    const chartHeight = height - paddingVertical * 2;

    const mappedPoints = processedData.map((d, index) => {
      const x = paddingHorizontal + (index / (processedData.length - 1 || 1)) * chartWidth;
      const normalizedPrice = (d.price - minP) / priceRange;
      const y = height - paddingVertical - normalizedPrice * chartHeight;
      return { x, y, price: d.price, timestamp: d.timestamp };
    });

    // 3. Skia Path Vector Construction
    const skPath = Skia.Path.Make();
    if (mappedPoints.length > 0) {
      skPath.moveTo(mappedPoints[0].x, mappedPoints[0].y);

      for (let i = 1; i < mappedPoints.length; i++) {
        const prev = mappedPoints[i - 1];
        const curr = mappedPoints[i];
        const cpX = (prev.x + curr.x) / 2;
        skPath.cubicTo(cpX, prev.y, cpX, curr.y, curr.x, curr.y);
      }
    }

    const skFillPath = skPath.copy();
    if (mappedPoints.length > 0) {
      skFillPath.lineTo(mappedPoints[mappedPoints.length - 1].x, height);
      skFillPath.lineTo(mappedPoints[0].x, height);
      skFillPath.close();
    }

    const pathCreationEndPerf = performance.now();

    if (onBenchmarkMetrics) {
      onBenchmarkMetrics({
        downsampleMs: parseFloat((downsampleEndPerf - startPerf).toFixed(2)),
        pathCreationMs: parseFloat((pathCreationEndPerf - downsampleEndPerf).toFixed(2)),
        renderedPoints: processedData.length,
      });
    }

    return {
      path: skPath,
      fillPath: skFillPath,
      minPrice: minP,
      maxPrice: maxP,
      startTime: processedData[0]?.timestamp,
      endTime: processedData[processedData.length - 1]?.timestamp,
    };
  }, [
    data,
    width,
    height,
    paddingHorizontal,
    paddingVertical,
    maxTargetPoints,
    minTimeDomain,
    maxTimeDomain,
    onBenchmarkMetrics,
  ]);

  return (
    <View style={[styles.container, { width, height }]}>
      {/* Skia Vector Graphics Canvas */}
      <Canvas style={{ width, height }}>
        {/* Subtle Horizontal Grid Lines for main charts */}
        {height >= 80 && (
          <Group opacity={0.15}>
            <Line p1={vec(0, height * 0.25)} p2={vec(width, height * 0.25)} color={colors.borderHighlight} strokeWidth={1} />
            <Line p1={vec(0, height * 0.5)} p2={vec(width, height * 0.5)} color={colors.borderHighlight} strokeWidth={1} />
            <Line p1={vec(0, height * 0.75)} p2={vec(width, height * 0.75)} color={colors.borderHighlight} strokeWidth={1} />
          </Group>
        )}

        {/* Gradient Fill Below Line */}
        <Path path={fillPath}>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(0, height)}
            colors={[
              isPositive ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)',
              'rgba(11, 14, 20, 0)',
            ]}
          />
        </Path>

        {/* Smooth Price Path Line */}
        <Path
          path={path}
          color={strokeColor}
          style="stroke"
          strokeWidth={height < 60 ? 1.5 : 2.5}
          strokeCap="round"
          strokeJoin="round"
        />
      </Canvas>

      {/* Native Text & Screen Reader Accessibility Overlay */}
      {renderOverlay ? (
        <ChartNativeOverlay
          width={width}
          height={height}
          minPrice={minPrice}
          maxPrice={maxPrice}
          startTime={startTime}
          endTime={endTime}
          assetSymbol={assetSymbol}
          isPositive={isPositive}
          showOverlay={renderOverlay}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});
