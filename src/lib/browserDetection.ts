/**
 * Detects if the user is using an in-app browser from Web3 wallets
 * These browsers often have restrictions on file downloads
 */
export function isInAppBrowser(): boolean {
  if (typeof window === 'undefined') return false;
  
  const ua = navigator.userAgent || navigator.vendor || (window as any).opera || '';
  
  // Detect common Web3 wallet in-app browsers
  const walletBrowsers = [
    'Phantom',
    'MetaMask',
    'Trust',
    'Coinbase',
    'Rainbow',
    'Zerion',
    'imToken',
    'TokenPocket',
    'SafePal',
  ];
  
  return walletBrowsers.some(wallet => ua.includes(wallet));
}

/**
 * Gets a user-friendly name for the detected wallet browser
 */
export function getWalletBrowserName(): string {
  if (typeof window === 'undefined') return 'Wallet';
  
  const ua = navigator.userAgent || navigator.vendor || (window as any).opera || '';
  
  if (ua.includes('Phantom')) return 'Phantom';
  if (ua.includes('MetaMask')) return 'MetaMask';
  if (ua.includes('Trust')) return 'Trust Wallet';
  if (ua.includes('Coinbase')) return 'Coinbase Wallet';
  if (ua.includes('Rainbow')) return 'Rainbow';
  
  return 'Wallet';
}
