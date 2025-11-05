import { Shield, CheckCircle2, Scan } from "lucide-react";
import React from "react";
import type { CertificateProps } from "@/types";
import { QRCodeSVG } from "qrcode.react";

const formatAddress = (address: string) =>
  `${address.slice(0, 6)}...${address.slice(-4)}`;

const Certificate: React.FC<CertificateProps> = ({
  walletAddress,
  totalValue,
  balances,
  totalBalances,
  certificateId,
  issueDate,
  verificationDate,
  certificateHash,
  companyName,
  companyUrl,
  supportEmail,
  disclaimer,
  verifications,
  holderName,
}) => {
  return (
    <div className="w-full sm:max-w-5xl mx-auto px-0">
      <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-12 text-gray-900">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start justify-between mb-6 sm:mb-8 pb-6 border-b-2 border-gray-200">
          <div className="mb-4 sm:mb-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-linear-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div>
                <h1 className=" text-2xl sm:text-3xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {companyName}
                </h1>
                <p className="text-xs sm:text-sm text-gray-600">
                  Verified Blockchain Assets
                </p>
              </div>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">
              Certificate ID
            </p>
            <p className="text-base sm:text-lg font-mono font-semibold">
              {certificateId}
            </p>
            <p className="text-xs text-gray-500 mt-2">{issueDate}</p>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">
            PROOF OF FUNDS CERTIFICATE
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            This document certifies the verified cryptocurrency holdings
          </p>
        </div>

        {/* Holder Name Section */}
        {holderName && (
          <div className="bg-linear-to-r from-indigo-50 to-blue-50 rounded-xl p-4 sm:p-6 mb-6 border-2 border-indigo-200">
            <div className="text-center">
              <p className="text-xs sm:text-sm text-gray-600 mb-1 uppercase tracking-wide">
                Certificate Holder
              </p>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                {holderName}
              </h3>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-300">
                <span className="text-xs text-amber-800">
                  ⚠️ Self-Reported Identity (Not Verified)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Wallet Info */}
        <div className="bg-linear-to-r from-blue-50 to-purple-50 rounded-xl p-4 sm:p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="text-left">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">
                Wallet Address (Verified)
              </p>
              <p className="font-mono text-xs sm:text-sm font-semibold break-all">
                {walletAddress}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">
                Verification Date
              </p>
              <p className="font-semibold text-sm sm:text-base">
                {verificationDate}
              </p>
            </div>
          </div>
        </div>

        {/* Total Value - Highlighted */}
        <div className="bg-linear-to-r from-blue-600 to-purple-600 rounded-xl p-6 sm:p-8 mb-6 text-white text-center">
          <p className="text-xs sm:text-sm opacity-90 mb-2 uppercase tracking-wide">
            Total Verified Value
          </p>
          <p className="text-4xl sm:text-5xl font-bold mb-1">
            ${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs sm:text-sm opacity-75">United States Dollars</p>
        </div>

        {/* Asset Breakdown */}
        <div className="mb-6 sm:mb-8">
          <h3 className="text-base sm:text-lg font-bold mb-4 flex items-center gap-2">
            <div className="w-1 h-5 sm:h-6 bg-linear-to-br from-blue-600 to-purple-600 rounded-full" />
            Asset Breakdown - {balances.length}/{totalBalances || balances.length}
          </h3>
          <div className="space-y-3">
            {balances.map((balance, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-3 mb-3 sm:mb-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-linear-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                    {balance.token[0]}
                  </div>
                  <div className="text-left ">
                    <p className="font-semibold text-base sm:text-lg">
                      {balance.amount.toLocaleString()} {balance.token}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {balance.chain} • {formatAddress(balance.address)}
                    </p>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xl sm:text-2xl font-bold">
                    ${balance.value.toLocaleString()}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">USD Value</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* QR Code & Verification */}
        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="flex-1">
            <h3 className="text-base sm:text-lg text-left font-bold mb-3">
              Verification
            </h3>
            <div className="space-y-2 text-xs sm:text-sm text-gray-700">
              {verifications.map((verification, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>{verification}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="text-center">
            <div className="w-30 h-30 sm:w-32 sm:h-32 bg-linear-to-br from-blue-100 to-purple-100 rounded-sm flex items-center justify-center mb-2 border-2 border-gray-300 p-1">
              {/* <Scan className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" /> */}
              <QRCodeSVG
                value={`${process.env.NEXT_PUBLIC_APP_URL}/verify/${certificateId}`}
                title={"Title for my QR Code"}
                size={128}
                bgColor={"#ffffff"}
                fgColor={"#000000"}
                level={"L"}
              
              />
            </div>
            <p className="text-xs text-gray-600">Scan to verify</p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t-2 border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs sm:text-sm text-gray-600">
            <div className="mb-3 sm:mb-0">
              <p className="font-semibold mb-1 text-left">{companyName} Inc.</p>
              <p>
                {companyUrl} • {supportEmail}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="font-mono text-xs">Certificate Hash:</p>
              <p className="font-mono text-xs">{certificateHash}</p>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <p className="text-xs text-gray-600 leading-relaxed text-left">
            <strong>Legal Disclaimer:</strong> {disclaimer}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Certificate;
