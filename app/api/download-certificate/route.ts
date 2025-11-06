import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CertificateModel from '@/models/certificate';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const certId = searchParams.get('id');

    if (!certId) {
      return NextResponse.json(
        { error: 'Certificate ID is required' },
        { status: 400 }
      );
    }

    // Connect to database and fetch certificate
    await connectDB();
    const certificate = await CertificateModel.findOne({ certificateId: certId });

    if (!certificate) {
      return NextResponse.json(
        { error: 'Certificate not found' },
        { status: 404 }
      );
    }

    // Return certificate data as JSON for the client to generate PDF
    return NextResponse.json({
      success: true,
      certificate: {
        certificateId: certificate.certificateId,
        walletAddress: certificate.walletAddress,
        holderName: certificate.holderName,
        totalValue: certificate.totalValue,
        balances: certificate.balances,
        issueDate: certificate.issueDate,
        verificationDate: certificate.verificationDate,
        certificateHash: certificate.certificateHash,
      },
    });
  } catch (error) {
    console.error('Error fetching certificate:', error);
    return NextResponse.json(
      { error: 'Failed to fetch certificate' },
      { status: 500 }
    );
  }
}
