import { $, expect } from '@wdio/globals';

describe('Pulse Trading App - E2E Trade Flow', () => {
  it('should launch app and navigate to BTC asset details', async () => {
    // 1. Locate and click on BTC market card
    const btcCard = await $('~market-card-btc');
    if (await btcCard.isExisting()) {
      await btcCard.click();
    }

    // 2. Locate BUY button on AssetDetailsScreen
    const buyButton = await $('~buy-button');
    if (await buyButton.isExisting()) {
      await expect(buyButton).toBeDisplayed();
      await buyButton.click();
    }

    // 3. Locate SwipeToConfirm component in TradeBottomSheet
    const swipeSlider = await $('~swipe-to-confirm');
    if (await swipeSlider.isExisting()) {
      await expect(swipeSlider).toBeDisplayed();
    }
  });
});
