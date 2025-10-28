import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import React from 'react';

type BalanceItem = {
  token: string;
  amount: number;
  chain: string;
  address: string;
  value: number;
};

type PDFCertificateProps = {
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

// Helper to format address (same as before)
const formatAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;

// Styles (mirroring your Tailwind design)
const styles = StyleSheet.create({
  page: {
    backgroundColor: 'white',
    padding: 40,
    fontSize: 12,
    color: '#333',
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#e5e7eb',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    backgroundColor: '#4f46e5',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  logoText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  companySubtitle: {
    fontSize: 10,
    color: '#6b7280',
  },
  certInfo: {
    textAlign: 'right',
  },
  certLabel: {
    fontSize: 10,
    color: '#6b7280',
  },
  certId: {
    fontSize: 14,
    fontFamily: 'Courier',
    fontWeight: 'bold',
  },
  certDate: {
    fontSize: 9,
    color: '#9ca3af',
    marginTop: 5,
  },
  titleSection: {
    textAlign: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  walletInfo: {
    backgroundColor: '#eef2ff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  walletGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  walletLabel: {
    fontSize: 10,
    color: '#6b7280',
  },
  walletValue: {
    fontSize: 10,
    fontFamily: 'Courier',
    fontWeight: 'bold',
  },
  totalValue: {
    backgroundColor: '#4f46e5',
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    color: 'white',
    textAlign: 'center',
  },
  totalLabel: {
    fontSize: 10,
    opacity: 0.9,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  totalAmount: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  totalUnit: {
    fontSize: 10,
    opacity: 0.75,
  },
  assetSection: {
    marginBottom: 20,
  },
  assetTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  assetBar: {
    width: 2,
    height: 20,
    backgroundColor: '#4f46e5',
    borderRadius: 2,
    marginRight: 5,
  },
  assetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 10,
    marginBottom: 8,
  },
  assetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assetIcon: {
    width: 30,
    height: 30,
    backgroundColor: '#4f46e5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  assetIconText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  assetDetails: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  assetSub: {
    fontSize: 10,
    color: '#6b7280',
  },
  assetValue: {
    textAlign: 'right',
  },
  assetValueAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  assetValueLabel: {
    fontSize: 10,
    color: '#6b7280',
  },
  verificationSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  verificationList: {
    flex: 1,
  },
  verificationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  verificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    fontSize: 10,
    color: '#4b5563',
  },
  check: {
    color: '#16a34a',
    marginRight: 5,
  },
  qrContainer: {
    alignItems: 'center',
  },
  qrBox: {
    width: 100,
    height: 100,
    backgroundColor: '#e0e7ff',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  qrText: {
    fontSize: 9,
    color: '#6b7280',
  },
  footer: {
    paddingTop: 15,
    borderTopWidth: 2,
    borderTopColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 10,
    color: '#6b7280',
  },
  footerLeft: {
    fontWeight: 'bold',
  },
  footerRight: {
    textAlign: 'right',
    fontFamily: 'Courier',
    fontSize: 9,
  },
  disclaimer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    fontSize: 9,
    color: '#6b7280',
    lineHeight: 1.5,
  },
});

const PDFCertificate: React.FC<PDFCertificateProps> = ({
  walletAddress,
  totalValue,
  balances,
  certificateId,
  issueDate,
  verificationDate,
  certificateHash,
  companyName,
  companyUrl,
  supportEmail,
  disclaimer,
  verifications,
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>S</Text>
          </View>
          <View>
            <Text style={styles.companyName}>{companyName}</Text>
            <Text style={styles.companySubtitle}>Verified Blockchain Assets</Text>
          </View>
        </View>
        <View style={styles.certInfo}>
          <Text style={styles.certLabel}>Certificate ID</Text>
          <Text style={styles.certId}>{certificateId}</Text>
          <Text style={styles.certDate}>{issueDate}</Text>
        </View>
      </View>

      {/* Title */}
      <View style={styles.titleSection}>
        <Text style={styles.title}>PROOF OF FUNDS CERTIFICATE</Text>
        <Text style={styles.subtitle}>This document certifies the verified cryptocurrency holdings</Text>
      </View>

      {/* Wallet Info */}
      <View style={styles.walletInfo}>
        <View style={styles.walletGrid}>
          <View>
            <Text style={styles.walletLabel}>Wallet Address</Text>
            <Text style={styles.walletValue}>{walletAddress}</Text>
          </View>
          <View style={{ textAlign: 'right' }}>
            <Text style={styles.walletLabel}>Verification Date</Text>
            <Text style={styles.walletValue}>{verificationDate}</Text>
          </View>
        </View>
      </View>

      {/* Total Value */}
      <View style={styles.totalValue}>
        <Text style={styles.totalLabel}>Total Verified Value</Text>
        <Text style={styles.totalAmount}>${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
        <Text style={styles.totalUnit}>United States Dollars</Text>
      </View>

      {/* Asset Breakdown */}
      <View style={styles.assetSection}>
        <View style={styles.assetTitle}>
          <View style={styles.assetBar} />
          <Text>Asset Breakdown</Text>
        </View>
        {balances.map((balance, idx) => (
          <View key={idx} style={styles.assetItem}>
            <View style={styles.assetLeft}>
              <View style={styles.assetIcon}>
                <Text style={styles.assetIconText}>{balance.token[0]}</Text>
              </View>
              <View>
                <Text style={styles.assetDetails}>{balance.amount.toLocaleString()} {balance.token}</Text>
                <Text style={styles.assetSub}>{balance.chain} • {formatAddress(balance.address)}</Text>
              </View>
            </View>
            <View style={styles.assetValue}>
              <Text style={styles.assetValueAmount}>${balance.value.toLocaleString()}</Text>
              <Text style={styles.assetValueLabel}>USD Value</Text>
            </View>
          </View>
        ))}
      </View>

      {/* QR Code & Verification */}
      <View style={styles.verificationSection}>
        <View style={styles.verificationList}>
          <Text style={styles.verificationTitle}>Verification</Text>
          {verifications.map((verification, idx) => (
            <View key={idx} style={styles.verificationItem}>
              <Text style={styles.check}>✓</Text>
              <Text>{verification}</Text>
            </View>
          ))}
        </View>
        <View style={styles.qrContainer}>
          <View style={styles.qrBox}>
            <Text style={{ fontSize: 40, color: '#9ca3af' }}>QR</Text>
          </View>
          <Text style={styles.qrText}>Scan to verify</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.footerLeft}>{companyName} Inc.</Text>
          <Text>{companyUrl} • {supportEmail}</Text>
        </View>
        <View style={styles.footerRight}>
          <Text>Certificate Hash:</Text>
          <Text>{certificateHash}</Text>
        </View>
      </View>

      {/* Disclaimer */}
      <View style={styles.disclaimer}>
        <Text><Text style={{ fontWeight: 'bold' }}>Legal Disclaimer:</Text> {disclaimer}</Text>
      </View>
    </Page>
  </Document>
);

export default PDFCertificate;