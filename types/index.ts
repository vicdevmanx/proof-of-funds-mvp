// Blockchain Types
export type ChainType = 'ethereum' | 'solana' | 'bitcoin';

// Portfolio & Balance Types
export type PortfolioBalance = {
  token: string;
  amount: number;
  imgUrl: string;
  value: number;
  chain: string;
  symbol: string;
  address: string;
};

export type BalanceItem = {
  token: string;
  amount: number;
  imgUrl: string;
  value: number;
  chain: string;
  symbol: string;
  address: string;
};

// Certificate Types
export type CertificateProps = {
  walletAddress: string;
  totalValue: number;
  balances: BalanceItem[];
  certificateId: string;
  issueDate: string;
  verificationDate: string;
  certificateHash: string;
  companyName: string;
  companyUrl: string;
  supportEmail: string;
  disclaimer: string;
  verifications: string[];
};

export type PDFCertificateProps = {
  walletAddress: string;
  totalValue: number;
  balances: BalanceItem[];
  certificateId: string;
  issueDate: string;
  verificationDate: string;
  certificateHash: string;
  companyName: string;
  companyUrl: string;
  supportEmail: string;
  disclaimer: string;
  verifications: string[];
};


// Provider Types
export interface ProviderProps {
  children: React.ReactNode;
}

// Dialog Types
export interface ChainSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChainSelect: (chain: ChainType) => void;
}
