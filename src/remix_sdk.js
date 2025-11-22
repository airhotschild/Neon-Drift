// Stub Remix.gg SDK module
// This is a placeholder implementation used while the real SDK is unavailable.
// It provides a minimal API that the game code can call.

export function openPurchaseModal(options) {
  console.log('Remix.gg purchase modal opened with options:', options);
  // Simulate a successful purchase after a short delay
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Simulated purchase success');
      resolve({ success: true, receipt: 'dummy-receipt' });
    }, 500);
  });
}
