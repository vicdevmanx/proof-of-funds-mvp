# Portfolio Fetching Architecture

## Overview
The portfolio fetching logic has been refactored to properly separate concerns for different blockchain networks (EVM, Solana, Bitcoin) with clean, maintainable code following best practices.

## Structure

### 1. **fetchEVMPortfolio(evmAddress: string)**
- **Purpose**: Fetches portfolio data for Ethereum and EVM-compatible chains
- **API**: Zapper GraphQL API
- **Status**: ✅ Fully implemented and working
- **Returns**: `{ balances: PortfolioBalance[], totalValue: number }`
- **Supports**: Ethereum, Polygon, Base, Arbitrum, Optimism, etc.

### 2. **fetchSolanaPortfolio(solAddress: string)**
- **Purpose**: Fetches portfolio data for Solana wallets
- **API**: Demo implementation (ready for integration)
- **Status**: 🟡 Demo mode with placeholder data
- **Returns**: `{ balances: PortfolioBalance[], totalValue: number }`
- **TODO**: Integrate with Helius, Moralis, or Solana RPC

### 3. **fetchBitcoinPortfolio(btcAddress: string)**
- **Purpose**: Fetches portfolio data for Bitcoin wallets
- **API**: Demo implementation (ready for integration)
- **Status**: 🟡 Demo mode with placeholder data
- **Returns**: `{ balances: PortfolioBalance[], totalValue: number }`
- **TODO**: Integrate with blockchain.com API or similar

## Main Portfolio Effect

The main `useEffect` hook automatically:
1. Detects which chain is selected (`ethereum`, `solana`, or `bitcoin`)
2. Calls the appropriate fetch function with the correct address
3. Updates the UI with portfolio data
4. Handles loading states and errors gracefully

```typescript
useEffect(() => {
  if (step !== 2) return;

  const fetchPortfolioData = async () => {
    setIsPortfolioLoading(true);
    
    try {
      let result;

      switch (selectedChain) {
        case 'ethereum':
          if (!address) return;
          result = await fetchEVMPortfolio(address);
          break;

        case 'solana':
          if (!solanaAddress) return;
          result = await fetchSolanaPortfolio(solanaAddress);
          break;

        case 'bitcoin':
          // TODO: Implement
          return;
      }

      setBalances(result.balances);
      setTotalValue(result.totalValue);

    } catch (error) {
      console.error('Failed to fetch portfolio:', error);
      setBalances([]);
      setTotalValue(0);
    } finally {
      setIsPortfolioLoading(false);
    }
  };

  fetchPortfolioData();
}, [address, solanaAddress, selectedChain, step]);
```

## Data Structure

All fetch functions return the same standardized structure:

```typescript
{
  balances: PortfolioBalance[],  // Array of token balances
  totalValue: number              // Total portfolio value in USD
}
```

### PortfolioBalance Type
```typescript
{
  token: string;      // Token name (e.g., "Solana", "USD Coin")
  amount: number;     // Token amount (e.g., 2.5)
  imgUrl: string;     // Token logo URL
  value: number;      // USD value (e.g., 250.00)
  chain: string;      // Chain name (e.g., "Solana", "Ethereum")
  symbol: string;     // Token symbol (e.g., "SOL", "USDC")
  address: string;    // Token contract address
}
```

## Key Improvements

### ✅ Separation of Concerns
- Each blockchain has its own dedicated fetch function
- No mixing of EVM and Solana addresses
- Clear, maintainable code structure

### ✅ Type Safety
- Proper TypeScript types throughout
- Return types explicitly defined
- Type-safe error handling

### ✅ Error Handling
- Comprehensive try-catch blocks
- Specific error messages for each chain
- Graceful fallbacks on failure

### ✅ Best Practices
- JSDoc comments for documentation
- Consistent naming conventions
- Single Responsibility Principle
- DRY (Don't Repeat Yourself)

### ✅ Extensibility
- Easy to add new chains
- Demo implementations ready for real API integration
- Consistent interface across all fetch functions

## Next Steps for Solana Integration

To replace the demo Solana implementation with real data:

### Option 1: Helius API
```typescript
const fetchSolanaPortfolio = async (solAddress: string) => {
  const response = await fetch(
    `https://api.helius.xyz/v0/addresses/${solAddress}/balances?api-key=${HELIUS_API_KEY}`
  );
  const data = await response.json();
  // Transform data to PortfolioBalance[]
};
```

### Option 2: Moralis Solana API
```typescript
const fetchSolanaPortfolio = async (solAddress: string) => {
  await Moralis.start({ apiKey: process.env.NEXT_PUBLIC_MORALIS_API_KEY });
  const response = await Moralis.SolApi.account.getPortfolio({ 
    address: solAddress 
  });
  // Transform data to PortfolioBalance[]
};
```

### Option 3: Solana RPC + Jupiter
```typescript
const fetchSolanaPortfolio = async (solAddress: string) => {
  // Use @solana/web3.js to get token accounts
  // Use Jupiter API for pricing
  // Combine and transform to PortfolioBalance[]
};
```

## Testing

### Current Behavior
- **Ethereum**: Real data from Zapper API ✅
- **Solana**: Demo data (2.5 SOL + 100 USDC) 🟡
- **Bitcoin**: Not yet implemented ⏳

### To Test
1. Connect Ethereum wallet → See real portfolio
2. Connect Solana wallet → See demo portfolio
3. Switch between chains → Data updates correctly
4. Disconnect → State resets properly

## Code Location

All portfolio fetching logic is in:
```
/app/page.tsx
Lines 89-307
```

## Environment Variables Required

```env
NEXT_PUBLIC_ZAPPER_API_KEY=your_zapper_key        # For EVM
NEXT_PUBLIC_MORALIS_API_KEY=your_moralis_key      # Optional for Solana
NEXT_PUBLIC_HELIUS_API_KEY=your_helius_key        # Optional for Solana
```
