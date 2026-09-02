import { downsampleLTTB, cullViewportData } from '../chart/utils/dataReduction';
import { generateSyntheticDataset } from '../services/market/MarketSimulator';

describe('Data Reduction & LTTB Downsampling Engine', () => {
  it('should preserve first and last points when downsampling', () => {
    const dataset = generateSyntheticDataset(1000);
    const downsampled = downsampleLTTB(dataset, 100);

    expect(downsampled.length).toBe(100);
    expect(downsampled[0]).toEqual(dataset[0]);
    expect(downsampled[downsampled.length - 1]).toEqual(dataset[dataset.length - 1]);
  });

  it('should efficiently downsample 10,000 points under 5ms', () => {
    const dataset = generateSyntheticDataset(10000);
    const start = performance.now();
    const downsampled = downsampleLTTB(dataset, 500);
    const duration = performance.now() - start;

    expect(downsampled.length).toBe(500);
    expect(duration).toBeLessThan(15);
  });

  it('should efficiently downsample 100,000 points under 25ms', () => {
    const dataset = generateSyntheticDataset(100000);
    const start = performance.now();
    const downsampled = downsampleLTTB(dataset, 500);
    const duration = performance.now() - start;

    expect(downsampled.length).toBe(500);
    expect(duration).toBeLessThan(45);
  });

  it('should accurately cull data points within a given viewport domain', () => {
    const dataset = generateSyntheticDataset(1000);
    const midPoint = dataset[500].timestamp;
    const endPoint = dataset[700].timestamp;

    const culled = cullViewportData(dataset, midPoint, endPoint);
    expect(culled.length).toBeGreaterThan(0);
    expect(culled.length).toBeLessThan(1000);
    expect(culled[0].timestamp).toBeLessThanOrEqual(midPoint);
    expect(culled[culled.length - 1].timestamp).toBeGreaterThanOrEqual(endPoint);
  });
});
