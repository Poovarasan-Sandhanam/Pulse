import React, { memo, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { colors, radius, spacing, typography } from '../../theme/tokens';
import { AnimatedPressable } from '../../motion/primitives/AnimatedPressable';
import { useMarketStore } from '../../store/useMarketStore';
import { CryptoAsset } from '../../services/market/MarketSimulator';
import { Search, Star } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { SkiaPriceChart } from '../../chart/SkiaPriceChart';
import { Skeleton } from '../../components/Skeleton';

const MarketAssetRowSkeleton = memo(() => {
  return (
    <View style={styles.row}>
      {/* Icon */}
      <Skeleton width={40} height={40} borderRadius={20} style={{ marginRight: spacing.md }} />

      {/* Info */}
      <View style={styles.infoCol}>
        <Skeleton width={80} height={18} style={{ marginBottom: 4 }} />
        <Skeleton width={40} height={14} />
      </View>

      {/* Sparkline (roughly 70x32) */}
      <View style={[styles.sparklineCol, { width: 70, height: 32, justifyContent: 'center' }]}>
        <Skeleton width={70} height={20} />
      </View>

      {/* Price & Change */}
      <View style={styles.priceCol}>
        <Skeleton width={60} height={18} style={{ marginBottom: 4 }} />
        <Skeleton width={40} height={14} />
      </View>

      {/* Watchlist Star */}
      <View style={styles.starButton}>
        <Skeleton width={18} height={18} borderRadius={9} />
      </View>
    </View>
  );
});

const MarketAssetRow = memo(({ asset, onPress }: { asset: CryptoAsset; onPress: () => void }) => {
  const toggleWatchlist = useMarketStore((s) => s.toggleWatchlist);
  const isPositive = asset.change24h >= 0;

  return (
    <AnimatedPressable style={styles.row} onPress={onPress}>
      {/* Icon */}
      <View style={[styles.iconContainer, { backgroundColor: asset.color + '22' }]}>
        <Text style={[styles.symbolBadge, { color: asset.color }]}>{asset.symbol.slice(0, 3)}</Text>
      </View>

      {/* Info */}
      <View style={styles.infoCol}>
        <Text style={styles.name}>{asset.name}</Text>
        <Text style={styles.symbol}>{asset.symbol}</Text>
      </View>

      {/* Sparkline */}
      <View style={styles.sparklineCol}>
        <SkiaPriceChart
          data={asset.sparkline.map((price, i) => ({ timestamp: i, price }))}
          width={70}
          height={32}
          isPositive={isPositive}
          showOverlay={false}
        />
      </View>

      {/* Price & Change */}
      <View style={styles.priceCol}>
        <Text style={styles.price}>
          ${asset.currentPrice >= 1000
            ? asset.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : asset.currentPrice >= 1
            ? asset.currentPrice.toFixed(2)
            : asset.currentPrice.toFixed(4)}
        </Text>
        <Text style={[styles.change, { color: isPositive ? colors.positive : colors.negative }]}>
          {isPositive ? '+' : ''}{asset.change24h.toFixed(2)}%
        </Text>
      </View>

      {/* Watchlist Star */}
      <AnimatedPressable
        style={styles.starButton}
        onPress={() => toggleWatchlist(asset.id)}
        enableHaptic
      >
        <Star
          size={18}
          color={asset.isWatchlisted ? colors.amber : colors.tertiaryText}
          fill={asset.isWatchlisted ? colors.amber : 'transparent'}
        />
      </AnimatedPressable>
    </AnimatedPressable>
  );
});

export const MarketsScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    assets,
    searchQuery,
    setSearchQuery,
    watchlistOnly,
    setWatchlistOnly,
    isLoadingRealData,
    fetchRealMarketPrices,
  } = useMarketStore();

  useEffect(() => {
    fetchRealMarketPrices();
  }, [fetchRealMarketPrices]);

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesWatchlist = watchlistOnly ? asset.isWatchlisted : true;
    return matchesSearch && matchesWatchlist;
  });

  const showSkeletons = assets.length === 0 && isLoadingRealData;
  const skeletonData = Array.from({ length: 8 }).map((_, i) => ({ id: `skeleton-${i}` }));
  const listData = showSkeletons ? skeletonData : filteredAssets;

  return (
    <View style={styles.container}>
      {/* Search & Watchlist Filter Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <View style={styles.searchBar}>
          <Search size={18} color={colors.secondaryText} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search markets..."
            placeholderTextColor={colors.tertiaryText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <AnimatedPressable
          style={[styles.filterPill, watchlistOnly && styles.filterPillActive]}
          onPress={() => setWatchlistOnly(!watchlistOnly)}
        >
          <Star
            size={16}
            color={watchlistOnly ? colors.primaryText : colors.secondaryText}
            fill={watchlistOnly ? colors.amber : 'transparent'}
          />
          <Text style={[styles.filterText, watchlistOnly && styles.filterTextActive]}>
            Watchlist
          </Text>
        </AnimatedPressable>
      </View>

      {/* FlashList Asset Rows */}
      <FlashList
        data={listData}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item: any) => item.id}
        estimatedItemSize={72}
        refreshControl={
          <RefreshControl
            refreshing={isLoadingRealData && assets.length > 0}
            onRefresh={fetchRealMarketPrices}
            tintColor={colors.accent}
          />
        }
        renderItem={({ item }: { item: any }) => {
          if (showSkeletons) {
            return <MarketAssetRowSkeleton />;
          }
          return (
            <MarketAssetRow
              asset={item as CryptoAsset}
              onPress={() => router.push({ pathname: '/(tabs)/markets/[id]', params: { id: item.id } })}
            />
          );
        }}
        contentContainerStyle={{
          padding: spacing.md,
          paddingBottom: insets.bottom + spacing.md,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.md,
    paddingTop: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    height: 44,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: colors.primaryText,
    ...typography.body,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    height: 44,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  filterPillActive: {
    backgroundColor: colors.accentMuted,
    borderColor: colors.accent,
  },
  filterText: {
    ...typography.caption,
    color: colors.secondaryText,
  },
  filterTextActive: {
    color: colors.primaryText,
    fontWeight: '700',
  },
  listContent: {
    padding: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  symbolBadge: {
    ...typography.caption,
    fontWeight: '700',
  },
  infoCol: {
    flex: 1,
  },
  name: {
    ...typography.bodyBold,
    color: colors.primaryText,
  },
  symbol: {
    ...typography.caption,
    color: colors.secondaryText,
  },
  sparklineCol: {
    marginHorizontal: spacing.sm,
  },
  priceCol: {
    alignItems: 'flex-end',
    marginRight: spacing.sm,
  },
  price: {
    ...typography.mono,
    color: colors.primaryText,
    fontWeight: '600',
  },
  change: {
    ...typography.caption,
    fontWeight: '600',
  },
  starButton: {
    padding: 4,
  },
});
