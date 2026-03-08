import { NextRequest, NextResponse } from 'next/server';

const PAYMENT_RECIPIENT = process.env.NEXT_PUBLIC_PAYMENT_RECIPIENT || '0x0000000000000000000000000000000000000000';
const USDC_ADDRESS = '0x5425890298aed601595a70AB815c96711a31Bc65'; // Avalanche Fuji USDC

export async function GET(request: NextRequest) {
  const paymentHeader = request.headers.get('x-payment');
  const demoMode = request.headers.get('x-demo-mode');

  // If demo mode header is present, skip verification and return data
  if (demoMode === 'true') {
    return NextResponse.json({
      status: 200,
      data: {
        forecast: 'Sunny',
        temperature: '24C',
        humidity: '45%',
        location: 'Avalanche Valley',
        timestamp: new Date().toISOString(),
      },
      x402: {
        paidVia: 'Facinet x402 Protocol',
        network: 'avalanche-fuji',
        facilitator: 'demo-simulated',
      },
    }, { status: 200 });
  }

  // If payment header is present, try to verify and return data
  if (paymentHeader) {
    // For the demo, accept any non-empty payment header as valid
    // In production, this would call the facilitator /verify endpoint
    return NextResponse.json({
      status: 200,
      data: {
        forecast: 'Sunny',
        temperature: '24C',
        humidity: '45%',
        location: 'Avalanche Valley',
        timestamp: new Date().toISOString(),
      },
      x402: {
        paidVia: 'Facinet x402 Protocol',
        network: 'avalanche-fuji',
        facilitator: 'live',
      },
    }, { status: 200 });
  }

  // No payment — return 402 Payment Required
  return NextResponse.json({
    status: 402,
    message: 'Payment Required',
    x402Version: 1,
    scheme: 'exact',
    network: 'avalanche-fuji',
    requirements: {
      maxAmountRequired: '100000',
      humanReadable: '0.10 USDC',
      payTo: PAYMENT_RECIPIENT,
      asset: USDC_ADDRESS,
      maxTimeoutSeconds: 300,
    },
  }, { status: 402 });
}
