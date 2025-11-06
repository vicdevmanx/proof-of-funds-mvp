'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CertificateDocument } from '@/types';
import Certificate from '@/components/certificate';
import { Shield, CheckCircle, XCircle } from 'lucide-react';

export default function Verify() {
  const params = useParams();
  const id = params.id;
  const [certificate, setCertificate] = useState<CertificateDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const response = await fetch(`/api/certificates/${id}`);
        const data = await response.json();
        
        if (response.ok && data.success) {
          setCertificate(data.certificate);
        } else {
          setError(data.error || 'Certificate not found');
        }
      } catch (err) {
        setError('Error fetching certificate');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCertificate();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700 dark:text-gray-300">Verifying certificate...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Verification Failed</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Return Home
          </a>
        </div>
      </div>
    );
  }

  if (!certificate) return null;

  // Prepare certificate props for the Certificate component
  const certificateProps = {
    walletAddress: certificate.walletAddress,
    totalValue: certificate.totalValue,
    balances: certificate.balances,
    certificateId: certificate.certificateId,
    issueDate: certificate.issueDate,
    verificationDate: certificate.verificationDate,
    certificateHash: certificate.certificateHash,
    companyName: 'WalletScan',
    companyUrl: 'wallet-scan.io',
    supportEmail: 'support@walletscan.io',
    disclaimer:
      'This certificate represents a snapshot of verified cryptocurrency holdings at the time of generation. Cryptocurrency values fluctuate and this document does not constitute financial advice. The holder maintains full custody of all assets. This certificate is for informational purposes only.',
    verifications: [
      'Blockchain data verified',
      'Wallet ownership confirmed',
      'Real-time balance snapshot',
      'Cryptographically secured',
    ],
    holderName: certificate.holderName,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      {/* Verification Badge */}
      <div className="max-w-5xl mx-auto mb-6">
        <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-500 rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-green-900 dark:text-green-100 mb-1">
              ✓ Certificate Verified Successfully
            </h2>
            <p className="text-sm text-green-700 dark:text-green-300">
              This certificate has been verified on the blockchain and is authentic.
            </p>
          </div>
        </div>
      </div>

      {/* Certificate Component */}
      <Certificate {...certificateProps} />

      {/* Additional Info */}
      <div className="max-w-5xl mx-auto mt-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                About This Verification
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                This page displays a verified proof of funds certificate. The wallet address and holdings have been
                verified on the blockchain. Note that the holder name is self-reported and not verified. Always
                conduct your own due diligence.
              </p>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}