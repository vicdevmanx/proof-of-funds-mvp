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
  totalBalances?: number;
  certificateId: string;
  issueDate: string;
  verificationDate: string;
  certificateHash: string;
  companyName: string;
  companyUrl: string;
  supportEmail: string;
  disclaimer: string;
  verifications: string[];
  holderName?: string;
};

export type PDFCertificateProps = {
  walletAddress: string;
  totalValue: number;
  balances: BalanceItem[];
  totalBalances?: number;
  certificateId: string;
  issueDate: string;
  verificationDate: string;
  certificateHash: string;
  companyName: string;
  companyUrl: string;
  supportEmail: string;
  disclaimer: string;
  verifications: string[];
  holderName?: string;
  qrCodeDataUrl?: string;
};

// MongoDB Certificate Document Type
export type CertificateDocument = {
  certificateId: string;
  walletAddress: string;
  holderName: string;
  totalValue: number;
  balances: BalanceItem[];
  issueDate: string;
  verificationDate: string;
  certificateHash: string;
  createdAt?: Date;
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
