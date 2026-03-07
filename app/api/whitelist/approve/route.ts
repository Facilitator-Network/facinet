/**
 * POST /api/whitelist/approve
 * Admin-only: Approve a whitelist application
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRedis } from '@/lib/redis';

const ADMIN_WALLET = (process.env.ADMIN_WALLET || '').toLowerCase();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wallet, admin } = body;

    if (!admin || admin.toLowerCase() !== ADMIN_WALLET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      );
    }

    const redis = getRedis();
    const walletLower = wallet.toLowerCase();

    // Get pending application
    const pendingData = await redis.get(`whitelist:pending:${walletLower}`);
    if (!pendingData) {
      return NextResponse.json(
        { error: 'No pending application found for this wallet' },
        { status: 404 }
      );
    }

    const application = typeof pendingData === 'string' ? JSON.parse(pendingData) : pendingData;

    // Move to approved
    const approvedData = {
      ...application,
      approvedAt: new Date().toISOString(),
      approvedBy: admin,
    };

    await redis.set(`whitelist:approved:${walletLower}`, JSON.stringify(approvedData));
    await redis.sadd('whitelist:approved_set', walletLower);

    // Remove from pending
    await redis.del(`whitelist:pending:${walletLower}`);
    await redis.srem('whitelist:pending_set', walletLower);

    // Send approval email via SendGrid
    let emailSent = false;
    if (process.env.SENDGRID_API_KEY && application.email) {
      try {
        const emailRes = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            personalizations: [
              {
                to: [{ email: application.email, name: application.name || '' }],
                subject: "You're Whitelisted — Welcome to Facinet!",
              },
            ],
            from: {
              email: process.env.SENDGRID_FROM_EMAIL || 'noreply@facinet.xyz',
              name: 'Facinet',
            },
            content: [
              {
                type: 'text/html',
                value: `
                  <div style="font-family: monospace; background: #000; color: #fff; padding: 40px; border-radius: 12px;">
                    <h1 style="color: #fff; font-size: 24px;">Welcome to Facinet, ${application.name}!</h1>
                    <p style="color: #ccc; line-height: 1.8;">
                      Your wallet <code style="background: #222; padding: 2px 6px; border-radius: 4px;">${wallet}</code> has been whitelisted.
                    </p>
                    <p style="color: #ccc; line-height: 1.8;">
                      You can now create a facilitator node on Facinet and start earning fees by processing gasless USDC payments.
                    </p>
                    <div style="margin: 30px 0;">
                      <a href="https://facinet.vercel.app/facilitator" style="background: #fff; color: #000; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-family: monospace;">
                        Deploy Your Facilitator
                      </a>
                    </div>
                    <p style="color: #666; font-size: 12px;">
                      Facinet — The payment infrastructure for the agent economy.
                    </p>
                  </div>
                `,
              },
            ],
          }),
        });

        if (emailRes.status === 202) {
          console.log(`Approval email sent to ${application.email}`);
          emailSent = true;
        } else {
          console.error('Failed to send email:', emailRes.status, await emailRes.text());
        }
      } catch (emailError) {
        console.error('Email send error:', emailError);
        // Don't fail the approval if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: `Wallet ${wallet} has been approved.`,
      emailSent,
    });
  } catch (error) {
    console.error('Whitelist approve error:', error);
    return NextResponse.json(
      { error: 'Failed to approve application' },
      { status: 500 }
    );
  }
}
