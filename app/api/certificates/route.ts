import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/mongodb';
import CertificateModel from '@/models/certificate';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, holderName, totalValue, balances, issueDate, verificationDate } = body;
    console.log({walletAddress, holderName, totalValue, balances, issueDate, verificationDate})

    // Validate required fields
    if (!walletAddress || !holderName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Generate certificate ID
    const newCertId = `CP-${Date.now().toString().slice(-8)}`;
    
    // Generate hash
    const hash = crypto
      .createHash('sha256')
      .update(walletAddress + holderName)
      .digest('hex')

    // Prepare certificate data
    const certificateData = {
      certificateId: newCertId,
      walletAddress,
      holderName,
      totalValue,
      balances,
      issueDate,
      verificationDate,
      certificateHash: `0x${hash.slice(0, 16)}...`,
    };

    // Store in MongoDB
    const savedCert = await CertificateModel.create(certificateData);
    
    return NextResponse.json({
      success: true,
      certificateId: newCertId,
      certificate: savedCert,
    });
  } catch (error) {
    console.error('Error creating certificate:', error);
    return NextResponse.json(
      { error: 'Failed to create certificate' },
      { status: 500 }
    );
  }
}
