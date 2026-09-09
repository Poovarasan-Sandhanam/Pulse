import { PricePoint } from '../../services/market/MarketSimulator';

/**
 * Largest-Triangle-Three-Buckets (LTTB) Downsampling Algorithm
 * Efficiently reduces large series (e.g., 10,000 – 100,000 points) to target threshold
 * while preserving visual peaks, troughs, and trend fidelity.
 */
export function downsampleLTTB(data: PricePoint[], threshold: number): PricePoint[] {
  const dataLength = data.length;
  if (threshold >= dataLength || threshold <= 0) {
    return data;
  }

  if (threshold <= 2) {
    return [data[0], data[dataLength - 1]];
  }

  const sampled: PricePoint[] = new Array(threshold);
  sampled[0] = data[0]; // Always keep the first point

  // Bucket size for intermediate points (excluding first and last)
  const bucketSize = (dataLength - 2) / (threshold - 2);

  let a = 0; // Index of previously selected point
  let maxAreaPointIndex = 0;

  for (let i = 0; i < threshold - 2; i++) {
    // Calculate average point for next bucket (bucket C)
    let avgX = 0;
    let avgY = 0;
    const avgRangeStart = Math.floor((i + 1) * bucketSize) + 1;
    const avgRangeEnd = Math.min(Math.floor((i + 2) * bucketSize) + 1, dataLength);
    const avgRangeLength = avgRangeEnd - avgRangeStart;

    for (let j = avgRangeStart; j < avgRangeEnd; j++) {
      avgX += data[j].timestamp;
      avgY += data[j].price;
    }

    avgX /= avgRangeLength || 1;
    avgY /= avgRangeLength || 1;

    // Range for current bucket (bucket B)
    const rangeOffs = Math.floor((i + 0) * bucketSize) + 1;
    const rangeTo = Math.min(Math.floor((i + 1) * bucketSize) + 1, dataLength);

    // Point A coordinates
    const pointAX = data[a].timestamp;
    const pointAY = data[a].price;

    let maxArea = -1;

    for (let j = rangeOffs; j < rangeTo; j++) {
      // Calculate triangle area between Point A, current Point B (data[j]), and Average Point C
      const area =
        Math.abs(
          (pointAX - avgX) * (data[j].price - pointAY) -
            (pointAX - data[j].timestamp) * (avgY - pointAY)
        ) * 0.5;

      if (area > maxArea) {
        maxArea = area;
        maxAreaPointIndex = j;
      }
    }

    sampled[i + 1] = data[maxAreaPointIndex]; // Pick point B with max triangle area
    a = maxAreaPointIndex; // Next point A is current selected point B
  }

  sampled[threshold - 1] = data[dataLength - 1]; // Always keep the last point
  return sampled;
}

/**
 * Viewport Culling: Slices data to visible time domain bounds
 */
export function cullViewportData(
  data: PricePoint[],
  minTime?: number,
  maxTime?: number
): PricePoint[] {
  if (!data || data.length === 0) return [];
  if (minTime === undefined && maxTime === undefined) return data;

  const startBound = minTime ?? -Infinity;
  const endBound = maxTime ?? Infinity;

  // Binary search for start index
  let low = 0;
  let high = data.length - 1;
  let startIndex = 0;

  while (low <= high) {
    const mid = (low + high) >> 1;
    if (data[mid].timestamp >= startBound) {
      startIndex = mid;
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }

  // Binary search for end index
  low = 0;
  high = data.length - 1;
  let endIndex = data.length - 1;

  while (low <= high) {
    const mid = (low + high) >> 1;
    if (data[mid].timestamp <= endBound) {
      endIndex = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  // Expand bounds by 1 point on each side to ensure smooth boundary lines
  const slicedStart = Math.max(0, startIndex - 1);
  const slicedEnd = Math.min(data.length - 1, endIndex + 1);

  return data.slice(slicedStart, slicedEnd + 1);
}
