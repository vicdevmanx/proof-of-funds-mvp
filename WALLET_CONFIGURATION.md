# Wallet Configuration Guide

## Featured Wallets

The application is configured to show popular wallets first in the connection modal, making it easier for users (especially on mobile) to find and connect their preferred wallet.

### Current Featured Wallets (in order)

1. **MetaMask** - Most popular EVM wallet
2. **Trust Wallet** - Multi-chain support (EVM, Solana, Bitcoin)
3. **Phantom** - Leading Solana wallet (also supports Ethereum)
4. **Coinbase Wallet** - User-friendly EVM wallet
5. **Rainbow** - Modern EVM wallet with great UX
6. **Solflare** - Solana-focused wallet with excellent mobile UX
7. **Ledger Live** - Hardware wallet support (multi-chain)

### Multi-Chain Coverage

- **EVM Chains**: MetaMask, Trust Wallet, Coinbase, Rainbow, Phantom, Ledger
- **Solana**: Trust Wallet, Phantom, Solflare
- **Bitcoin**: Trust Wallet, Ledger

## Desktop vs Mobile Experience

### Desktop Behavior

On desktop, the wallet modal shows:
- **Featured Wallets Only** (7 wallets listed above)
- **No Duplication** - Installed browser extensions won't appear twice
- **Clean Interface** - Focused on the most popular wallets
- **Extensions Still Work** - Installed wallets connect instantly even if not in featured list

### Mobile Behavior

On mobile, the wallet modal shows:
- **Featured Wallets First** (7 wallets at the top)
- **All Available Wallets** (full list below featured ones)
- **Deep Linking** - Taps open wallet apps directly
- **Better Discovery** - Users can find any wallet they have installed

### How It Works

The wallet connection is optimized for mobile devices with proper deep linking:

- **MetaMask Mobile**: Opens in-app browser with WalletConnect support
- **Trust Wallet Mobile**: Native deep linking with multi-chain support
- **Phantom Mobile**: Native Solana wallet with smooth app integration
- **Coinbase Wallet Mobile**: Native app integration
- **Solflare Mobile**: Excellent Solana-focused mobile experience

### Mobile User Flow

1. User clicks "Connect Wallet"
2. Featured wallets appear at the top (no searching needed)
3. User selects their wallet
4. App deep links to the wallet app (if installed)
5. User approves connection in wallet app
6. Returns to your app with connection established

## Adding More Featured Wallets

To add more wallets to the featured list, edit `lib/multichain.ts`:

```typescript
export const featuredWalletIds = [
  'wallet-id-here', // Wallet Name
  // Add more wallet IDs below
];
```

### How to Find Wallet IDs

1. Visit [WalletConnect Explorer](https://walletconnect.com/explorer)
2. Search for the wallet
3. Copy the wallet ID from the URL or details page

### Popular Wallet IDs Reference

```typescript
// EVM Wallets
'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96' // MetaMask
'4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0' // Trust Wallet
'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa' // Coinbase Wallet
'1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369' // Rainbow
'19177a98252e07ddfc9af2083ba8e07ef627cb6103467ffebb3f8f4205fd7927' // Ledger Live

// Solana Wallets (now featured!)
'a797aa35c0fadbfc1a53e7f675162ed5226968b44a19ee3d24385c64d1d3c393' // Phantom
'971e689d0a5be527bac79629b4ee9b925e82208e5168b733496a09c0faed0709' // Solflare

// Bitcoin Wallets (auto-detected)
// Unisat - automatically appears when Bitcoin network is selected
// Xverse - automatically appears when Bitcoin network is selected
```

## Configuration Options

### Current Settings

```typescript
features: {
  analytics: true,        // Track wallet connections
  email: false,          // Disabled for privacy
  socials: false,        // Disabled for privacy
  allWallets: true,      // Show all available wallets
}

allWallets: 'ONLY_MOBILE', // Full list on mobile, featured only on desktop
enableWalletGuide: true,   // Show wallet installation guides
```

**Why `ONLY_MOBILE`?**
- **Desktop**: Shows only featured wallets (no duplication, cleaner UI)
- **Mobile**: Shows all wallets (better discovery for users)
- **Extensions**: Installed browser extensions still work on desktop even if not featured

### Customization

You can customize the wallet modal in `lib/multichain.ts`:

- **Theme**: Change colors and styling
- **Featured Wallets**: Reorder or add/remove wallets
- **Networks**: Add or remove blockchain networks
- **Features**: Enable/disable email, social logins, etc.

## Testing on Mobile

### iOS Testing
1. Install MetaMask, Trust Wallet, or Phantom from App Store
2. Open your app in Safari
3. Connect wallet - should deep link to the wallet app
4. Approve connection
5. Should return to your app automatically

### Android Testing
1. Install wallets from Google Play Store
2. Open your app in Chrome
3. Connect wallet - should deep link to the wallet app
4. Approve connection
5. Should return to your app automatically

## Troubleshooting

### Wallet Not Appearing
- Check if wallet ID is correct
- Ensure wallet supports the selected network
- Verify wallet is installed (mobile) or extension is active (desktop)

### Deep Linking Not Working (Mobile)
- Ensure wallet app is installed
- Try closing and reopening the wallet app
- Check if wallet app is up to date
- Some wallets may open in-app browser instead of deep linking

### Multi-Chain Issues
- Trust Wallet: Best for multi-chain (EVM + Solana + Bitcoin)
- MetaMask: EVM only
- Phantom: Solana only (also supports Ethereum now)
- Ensure correct network is selected before connecting

## Best Practices

1. **Keep Featured List Short**: 5-7 wallets maximum for best UX
2. **Order by Popularity**: Most used wallets first
3. **Test on Real Devices**: Always test mobile deep linking
4. **Update Regularly**: Keep wallet IDs and configurations current
5. **Monitor Analytics**: Track which wallets users prefer

## Support

For wallet-specific issues:
- MetaMask: https://support.metamask.io
- Trust Wallet: https://support.trustwallet.com
- Phantom: https://help.phantom.app
- Coinbase Wallet: https://help.coinbase.com/wallet

For WalletConnect/AppKit issues:
- Documentation: https://docs.reown.com/appkit
- GitHub: https://github.com/reown-com/appkit
