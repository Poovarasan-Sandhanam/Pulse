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

interface SkiaPriceChartProps {
  data: PricePoint[];
  width: number;
  height: number;
  lineColor?: string;
  isPositive?: boolean;
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
}) => {
  const strokeColor = lineColor || (isPositive ? colors.positive : colors.negative);
  const paddingVertical = 20;
  const paddingHorizontal = 10;

  const { path, fillPath, points, minPrice, maxPrice } = useMemo(() => {
    if (!data || data.length === 0) {
      return { path: Skia.Path.Make(), fillPath: Skia.Path.Make(), points: [], minPrice: 0, maxPrice: 0 };
    }

    const prices = data.map((d) => d.price);
    const minP = Math.min(...prices);
    const maxP = Math.max(...prices);
    const priceRange = maxP - minP || 1;

    const chartWidth = width - paddingHorizontal * 2;
    const chartHeight = height - paddingVertical * 2;

    const mappedPoints = data.map((d, index) => {
      const x = paddingHorizontal + (index / (data.length - 1)) * chartWidth;
      const normalizedPrice = (d.price - minP) / priceRange;
      const y = height - paddingVertical - normalizedPrice * chartHeight;
      return { x, y, price: d.price, timestamp: d.timestamp };
    });

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

    return {
      path: skPath,
      fillPath: skFillPath,
      points: mappedPoints,
      minPrice: minP,
      maxPrice: maxP,
    };
  }, [data, width, height, paddingHorizontal, paddingVertical]);

  return (
    <View style={[styles.container, { width, height }]}>
      <Canvas style={{ width, height }}>
        {/* Subtle Horizontal Grid Lines */}
        <Group opacity={0.15}>
          <Line p1={vec(0, height * 0.25)} p2={vec(width, height * 0.25)} color={colors.borderHighlight} strokeWidth={1} />
          <Line p1={vec(0, height * 0.5)} p2={vec(width, height * 0.5)} color={colors.borderHighlight} strokeWidth={1} />
          <Line p1={vec(0, height * 0.75)} p2={vec(width, height * 0.75)} color={colors.borderHighlight} strokeWidth={1} />
        </Group>

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
          strokeWidth={2.5}
          strokeCap="round"
          strokeJoin="round"
        />
      </Canvas>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});
