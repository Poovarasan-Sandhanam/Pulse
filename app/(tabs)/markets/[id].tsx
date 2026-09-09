import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AssetDetailsScreen } from '../../../src/features/asset/AssetDetailsScreen';

export default function AssetDetailsRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  return (
    <AssetDetailsScreen
      assetId={id || 'btc'}
      onBack={() => router.back()}
    />
  );
}
