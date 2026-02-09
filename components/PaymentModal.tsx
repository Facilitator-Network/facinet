'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { USDC_FUJI, ERC20_ABI } from '@/lib/contracts';
import { useRouter } from 'next/navigation';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PaymentModal({ isOpen, onClose }: PaymentModalProps) {
  const router = useRouter();
  const { address } = useAccount();
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'approving' | 'paying' | 'verifying' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const PAYMENT_AMOUNT = '1'; // 1 USDC

  if (!process.env.NEXT_PUBLIC_PAYMENT_RECIPIENT) {
    throw new Error('NEXT_PUBLIC_PAYMENT_RECIPIENT not set in environment variables!');
  }

  const PAYMENT_RECIPIENT = process.env.NEXT_PUBLIC_PAYMENT_RECIPIENT as `0x${string}`;

  const { data: usdcBalance } = useBalance({
    address: address,
    token: USDC_FUJI.address,
  });

  const { data: hash, writeContract, isPending, error: writeError } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Handle successful transaction
  useEffect(() => {
    if (isSuccess && paymentStatus === 'paying') {
      setPaymentStatus('success');
      // Wait 2 seconds then redirect
      setTimeout(() => {
        router.push('/builder-hub');
      }, 2000);
    }
  }, [isSuccess, paymentStatus, router]);

  // Handle transaction errors
  useEffect(() => {
    if (writeError && paymentStatus === 'paying') {
      setPaymentStatus('error');
      setErrorMessage(writeError.message || 'Transaction failed. Please try again.');
    }
  }, [writeError, paymentStatus]);

  // Reset status when modal opens
  useEffect(() => {
    if (isOpen) {
      setPaymentStatus('idle');
      setErrorMessage('');
    }
  }, [isOpen]);

  const hasEnoughUSDC = usdcBalance && parseFloat(formatUnits(usdcBalance.value, 6)) >= parseFloat(PAYMENT_AMOUNT);

  const handlePayment = async () => {
    if (!address || !hasEnoughUSDC) return;

    try {
      setPaymentStatus('paying');
      setErrorMessage('');

      // Transfer USDC to recipient
      writeContract({
        address: USDC_FUJI.address,
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [PAYMENT_RECIPIENT as `0x${string}`, parseUnits(PAYMENT_AMOUNT, USDC_FUJI.decimals)],
      });
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Payment failed');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white border-4 border-black p-8 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="float-right text-2xl font-bold hover:text-gray-600"
            >
              ×
            </button>

            <div className="clear-both">
              {/* x402 Badge */}
              <div className="inline-block px-3 py-1 bg-black text-white text-xs font-bold mb-4">
                x402 PROTOCOL
              </div>

              <h2 className="text-3xl font-bold mb-4">Payment Required</h2>

              <div className="mb-6">
                <p className="text-lg mb-2">To access the Builder Hub, you need to pay:</p>
                <div className="text-4xl font-bold mb-2">{PAYMENT_AMOUNT} USDC</div>
                <p className="text-sm text-gray-600">on Avalanche Fuji Testnet</p>
              </div>

              {/* Balance Display */}
              {address && usdcBalance && (
                <div className="mb-6 p-4 border-2 border-black">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Your USDC Balance:</span>
                    <span className="font-bold text-lg">
                      {parseFloat(formatUnits(usdcBalance.value, 6)).toFixed(2)} USDC
                    </span>
                  </div>
                </div>
              )}

              {/* Insufficient Balance Warning */}
              {address && !hasEnoughUSDC && (
                <div className="mb-4 p-4 bg-gray-100 border-2 border-black">
                  <p className="text-sm font-medium">
                    ⚠️ Insufficient USDC balance. Please swap AVAX for USDC first.
                  </p>
                </div>
              )}

              {/* Error Message */}
              {errorMessage && (
                <div className="mb-4 p-4 bg-red-100 border-2 border-red-500">
                  <p className="text-sm font-medium text-red-700">
                    Error: {errorMessage}
                  </p>
                </div>
              )}

              {/* Payment Button */}
              <button
                onClick={handlePayment}
                disabled={!address || !hasEnoughUSDC || isPending || isConfirming || paymentStatus === 'success'}
                className="w-full py-4 bg-black text-white font-bold hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors mb-4"
              >
                {!address ? 'Connect Wallet First'
                  : !hasEnoughUSDC ? 'Insufficient USDC'
                  : isPending ? 'Confirm in Wallet...'
                  : isConfirming ? 'Confirming Transaction...'
                  : paymentStatus === 'success' ? '✓ Payment Successful!'
                  : paymentStatus === 'error' ? 'Try Again'
                  : 'Pay 1 USDC'}
              </button>

              {/* Success Message */}
              {paymentStatus === 'success' && hash && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-black text-white text-center"
                >
                  <p className="font-bold mb-2">✓ Payment Successful!</p>
                  <p className="text-sm mb-3">Redirecting to Builder Hub...</p>
                  <a
                    href={`https://testnet.snowtrace.io/tx/${hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs underline hover:text-gray-300 transition-colors"
                  >
                    View transaction on Snowtrace →
                  </a>
                </motion.div>
              )}

              {/* Info */}
              <p className="text-xs text-gray-500 text-center">
                Powered by x402 payment protocol on Avalanche
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
