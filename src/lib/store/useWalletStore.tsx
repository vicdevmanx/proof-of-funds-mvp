// src/store/useBearStore.js
import { create } from 'zustand'

type WalletStoreType = 
{ 
    walletAddress: string; 
    setWalletAddress: (address: string) => void 
}

const useWalletStore = create<WalletStoreType>((set) => ({
  walletAddress: '',
  setWalletAddress: (address: string) => set({ walletAddress: address }),
}))

export default useWalletStore
