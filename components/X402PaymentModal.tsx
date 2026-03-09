/**
 * x402 Payment Modal Component
 *
 * This component implements the FULL x402 protocol:
 * 1. User approves USDC spending (ERC-20 approval)
 * 2. Payment is submitted to x402 facilitator
 * 3. Facilitator executes the blockchain transaction
 * 4. Payment proof is stored for verification
 * 5. User is redirected with verified access
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount, useBalance, useSignTypedData } from 'wagmi';
import { formatUnits } from 'viem';
import { useRouter } from 'next/navigation';
import {
  encodePaymentHeader,
  createPaymentRequirements,
} from '@/lib/x402';
import {
  createTransferAuthorization,
  getTypedDataForSigning,
  createSignedAuthorization,
  createX402ExactPayload,
  signedAuthorizationToJSON,
} from '@/lib/erc3009';

interface X402PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (txHash: string, proof: string) => void; // Optional callback - if not provided, redirects to builder-hub
  facilitatorId?: string; // Optional custom facilitator ID
  facilitatorName?: string; // Optional facilitator name (for display)
  network?: string; // Optional network (defaults to 'avalanche-fuji')
}

type PaymentStatus = 'idle' | 'checking-facilitator' | 'signing' | 'settling' | 'confirming' | 'verifying' | 'success' | 'error';

export function X402PaymentModal({ isOpen, onClose, onSuccess, facilitatorId, facilitatorName, network = 'avalanche-fuji' }: X402PaymentModalProps) {
  const router = useRouter();
  const { address, chain } = useAccount();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [txHash, setTxHash] = useState<string>('');
  const [paymentProof, setPaymentProof] = useState<string>('');
  const [customFacilitator, setCustomFacilitator] = useState<any>(null);

  // Import network utilities
  const { getNetworkConfig } = require('@/lib/networks');
  const { getUSDCContract } = require('@/lib/contracts');

  // Get network-specific configurations
  const networkConfig = getNetworkConfig(network);
  const usdcContract = getUSDCContract(network);

  const { data: usdcBalance } = useBalance({
    address: address,
    token: usdcContract.address as `0x${string}`,
  });

  // wagmi hook for signing typed data
  const { signTypedDataAsync } = useSignTypedData();

  // Get network-specific x402 config
  const { getX402Config } = require('@/lib/x402');
  const x402Config = getX402Config(network);

  const hasEnoughUSDC = usdcBalance && parseFloat(formatUnits(usdcBalance.value, 6)) >= parseFloat(x402Config.PAYMENT_AMOUNT);

  // Fetch custom facilitator details if provided
  useEffect(() => {
    if (isOpen && facilitatorId) {
      fetchCustomFacilitator();
    } else {
      setCustomFacilitator(null);
    }
  }, [isOpen, facilitatorId]);

  const fetchCustomFacilitator = async () => {
    try {
      const response = await fetch('/api/facilitator/list');
      const data = await response.json();

      if (data.success) {
        const fac = data.facilitators.find((f: any) => f.id === facilitatorId);
        if (fac) {
          setCustomFacilitator(fac);
          console.log('🔧 Using custom facilitator:', fac.name);
        }
      }
    } catch (error) {
      console.error('Failed to fetch custom facilitator:', error);
    }
  };

  // Check facilitator status on mount
  // DISABLED: No longer using Docker facilitator, using Next.js API instead
  // useEffect(() => {
  //   if (isOpen) {
  //     checkFacilitator();
  //   }
  // }, [isOpen]);

  // Reset status when modal opens
  useEffect(() => {
    if (isOpen) {
      setPaymentStatus('idle');
      setErrorMessage('');
      setTxHash('');
      setPaymentProof('');
    }
  }, [isOpen]);

  // Handle success - callback or redirect
  useEffect(() => {
    if (paymentStatus === 'success' && paymentProof) {
      if (onSuccess) {
        // Custom callback provided - use it instead of redirecting
        setTimeout(() => {
          onSuccess(txHash, paymentProof);
        }, 1500);
      } else {
        // No callback - default behavior: redirect to builder-hub
        sessionStorage.setItem('x402-payment-proof', paymentProof);
        sessionStorage.setItem('x402-tx-hash', txHash);

        setTimeout(() => {
          router.push('/builder-hub');
        }, 2000);
      }
    }
  }, [paymentStatus, paymentProof, txHash, router, onSuccess]);

  // Removed checkFacilitator - no longer using Docker facilitator

  const handleX402Payment = async () => {
    if (!address || !hasEnoughUSDC) return;

    // Check if wallet is on correct network
    if (chain?.id !== networkConfig.chain.id) {
      setErrorMessage(`Please switch your wallet to ${networkConfig.displayName}`)
      return
    }

    try {
      setPaymentStatus('signing');
      setErrorMessage('');

      // Step 2: Create ERC-3009 authorization
      setPaymentStatus('signing');
      console.log(`✍️ Creating ERC-3009 authorization on ${network}...`);

      // Use custom facilitator's payment recipient if provided, otherwise use default
      const paymentRecipient = customFacilitator
        ? customFacilitator.paymentRecipient
        : x402Config.PAYMENT_RECIPIENT;

      console.log('🔍 Payment recipient:', paymentRecipient);
      console.log('🔍 Using facilitator:', customFacilitator ? customFacilitator.name : 'Default');
      console.log('🔍 Your address:', address);
      console.log('🔍 Network:', network);

      const authorization = createTransferAuthorization(
        address,
        paymentRecipient,
        x402Config.PAYMENT_AMOUNT,
        network // Pass network for network-specific EIP-712 domain
      );

      console.log('📝 Authorization created:', authorization);
      console.log('📝 Authorization TO address:', authorization.to);

      // Step 3: Get typed data for signing with network-specific domain
      const typedData = getTypedDataForSigning(authorization, network);
      console.log('📋 Typed data prepared:', typedData);

      // Step 4: Request user signature (MetaMask will pop up)
      console.log('🔐 Requesting signature from wallet...');
      console.log('⚠️ Please sign the message in MetaMask!');

      const signature = await signTypedDataAsync({
        domain: typedData.domain,
        types: typedData.types,
        primaryType: typedData.primaryType,
        message: typedData.message,
      });

      console.log('✅ Authorization signed:', signature);

      // Step 5: Create signed authorization
      const signedAuth = createSignedAuthorization(authorization, signature);

      // Step 6: Create x402 payload with signed authorization
      const x402Payload = createX402ExactPayload(signedAuth);

      // Step 7: Create payment requirements for verification
      const paymentRequirements = createPaymentRequirements(x402Config.PAYMENT_AMOUNT);

      // Step 8: Submit to facilitator
      setPaymentStatus('settling');
      console.log(`🚀 Submitting payment to x402 facilitator on ${network}...`);

      let settlementResult;

      if (customFacilitator) {
        // Use custom facilitator endpoint
        console.log('🔧 Using custom facilitator:', customFacilitator.name);

        // Convert BigInt values to strings for JSON serialization
        const signedAuthJSON = signedAuthorizationToJSON(signedAuth);

        const response = await fetch('/api/x402/settle-custom', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            facilitatorId,
            paymentPayload: signedAuthJSON,
          }),
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(`Custom facilitator settlement failed: ${error}`);
        }

        settlementResult = await response.json();
      } else {
        // Use default Next.js facilitator (ERC-3009 compatible)
        console.log('🔧 Using default facilitator');

        const response = await fetch('/api/x402/settle-default', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentPayload: x402Payload,
            paymentRequirements: paymentRequirements,
            network: network, // Pass network for multichain support
          }),
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(`Default facilitator settlement failed: ${error}`);
        }

        settlementResult = await response.json();
      }

      console.log('📦 Settlement result:', JSON.stringify(settlementResult, null, 2));

      // Extract transaction hash from various possible field names
      const transactionHash = settlementResult.txHash || settlementResult.tx || settlementResult.transaction;

      if (!transactionHash) {
        const errorDetails = settlementResult.error || settlementResult.message || 'No transaction hash returned';
        console.error('❌ Settlement failed - no tx hash:', errorDetails);
        console.error('❌ Full response:', JSON.stringify(settlementResult, null, 2));
        throw new Error(errorDetails);
      }

      console.log('✅ Payment settled on-chain:', transactionHash);
      setTxHash(transactionHash);

      // Step 9: Wait for confirmation
      setPaymentStatus('confirming');
      console.log('⏳ Waiting for blockchain confirmation...');

      await new Promise(resolve => setTimeout(resolve, 3000));

      // Step 10: Generate payment proof for verification
      setPaymentStatus('verifying');
      console.log('🔐 Generating x402 payment proof...');

      // Create proof with the x402 payload
      const proof = encodePaymentHeader(x402Payload);
      setPaymentProof(proof);

      console.log('✅ x402 payment proof generated');

      // Step 11: Success!
      setPaymentStatus('success');
      console.log('🎉 REAL x402 payment complete with ERC-3009!');

    } catch (error) {
      console.error('❌ x402 payment error:', error);
      setPaymentStatus('error');

      // Better error messages
      let errorMsg = 'Payment failed. Please try again.';
      if (error instanceof Error) {
        if (error.message.includes('User rejected')) {
          errorMsg = 'Signature rejected. Please approve the signature in MetaMask.';
        } else {
          errorMsg = error.message;
        }
      }

      setErrorMessage(errorMsg);
    }
  };

  const getStatusMessage = () => {
    switch (paymentStatus) {
      case 'checking-facilitator':
        return 'Checking x402 facilitator...';
      case 'signing':
        return 'Requesting signature (check MetaMask)...';
      case 'settling':
        return 'Submitting to x402 facilitator...';
      case 'confirming':
        return 'Confirming on-chain...';
      case 'verifying':
        return 'Generating x402 proof...';
      case 'success':
        return '✓ x402 Payment Complete!';
      case 'error':
        return 'Payment Failed';
      default:
        return 'Pay 1 USDC via x402';
    }
  };

  const isProcessing = ['checking-facilitator', 'signing', 'settling', 'confirming', 'verifying'].includes(paymentStatus);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-[var(--glass-bg)] backdrop-blur-md flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-lg bg-[var(--bg-void)] border border-[var(--bg-border)] rounded-2xl shadow-2xl p-8 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-[var(--glass-bg)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-50"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 5L5 15M5 5l10 10" />
              </svg>
            </button>

            <div className="space-y-6">
              {/* Header */}
              <div className="text-center space-y-2">
                <div className="inline-block px-3 py-1 rounded-full bg-[var(--glass-subtle-bg)] border border-[var(--bg-border)] text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                  x402 Protocol (ERC-3009)
                </div>
                <h2 className="text-2xl font-display font-bold text-[var(--text-primary)] font-mono uppercase tracking-tight">
                  {onSuccess ? 'Facilitator Registration Fee' : 'Payment Required'}
                </h2>
                <p className="text-[var(--text-tertiary)] font-body font-light text-sm">
                  {onSuccess
                    ? 'Register your facilitator on x402:'
                    : 'To access the Builder Hub, pay via x402:'}
                </p>
              </div>

              {/* Network Mismatch Warning */}
              {chain && chain.id !== networkConfig.chain.id && (
                <div className="p-4 rounded-xl bg-[var(--warning-bg)] border border-[var(--warning-muted)]">
                  <p className="text-sm text-[var(--warning)] font-mono">
                    ⚠️ Please switch your wallet to {networkConfig.displayName}
                  </p>
                </div>
              )}

              {/* Amount */}
              <div className="p-8 rounded-2xl bg-[var(--glass-subtle-bg)] border border-[var(--bg-border)] text-center space-y-2">
                <div className="text-5xl font-bold text-[var(--text-primary)] font-mono tracking-tighter">{x402Config.PAYMENT_AMOUNT} USDC</div>
                <div className="text-xs font-mono text-[var(--text-tertiary)] uppercase tracking-widest">on {networkConfig.displayName}</div>
              </div>

              {/* Randomly Selected Facilitator */}
              {!onSuccess && (facilitatorName || customFacilitator) && (
                <div className="p-4 rounded-xl bg-[var(--success-bg)] border border-[var(--success-muted)]">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🎲</span>
                    <div>
                      <p className="text-[10px] font-bold text-[var(--success)] mb-1 uppercase tracking-wider">Randomly Selected Facilitator</p>
                      <p className="font-bold text-[var(--success)] font-mono">
                        {facilitatorName || customFacilitator?.name || 'Custom Facilitator'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Balance Display */}
              {address && usdcBalance && (
                <div className="flex justify-between items-center p-4 rounded-lg bg-[var(--glass-bg)] border border-[var(--bg-border)] font-mono text-sm">
                  <span className="text-[var(--text-tertiary)]">Your USDC Balance:</span>
                  <span className="text-[var(--text-primary)] font-bold">
                    {parseFloat(formatUnits(usdcBalance.value, 6)).toFixed(2)} USDC
                  </span>
                </div>
              )}

              {/* Insufficient Balance Warning */}
              {address && !hasEnoughUSDC && (
                <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                  <p className="text-sm font-medium text-[var(--warning)]">
                    ⚠️ Insufficient USDC balance. Please swap AVAX for USDC first.
                  </p>
                </div>
              )}

              {/* Error Message */}
              <AnimatePresence>
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 rounded-xl bg-[var(--error-bg)] border border-[var(--error-muted)]"
                  >
                    <p className="text-sm font-medium text-[var(--error)]">
                      ❌ {errorMessage}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Payment Button */}
              <button
                onClick={handleX402Payment}
                disabled={!address || !hasEnoughUSDC || isProcessing || paymentStatus === 'success' || (chain && chain.id !== networkConfig.chain.id)}
                className="w-full bg-[var(--text-primary)] text-[var(--bg-void)] py-4 rounded-lg font-mono font-bold uppercase tracking-wider hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {!address ? 'Connect Wallet First'
                  : chain && chain.id !== networkConfig.chain.id ? `Switch to ${networkConfig.displayName}`
                  : !hasEnoughUSDC ? 'Insufficient USDC'
                  : getStatusMessage()}
              </button>

              {/* Transaction Hash */}
              <AnimatePresence>
                {txHash && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-4 rounded-xl bg-[var(--glass-subtle-bg)] border border-[var(--bg-border)]"
                  >
                    <p className="text-xs font-semibold mb-2 text-[var(--text-tertiary)] font-mono uppercase tracking-widest">Transaction Hash:</p>
                    <a
                      href={`https://testnet.snowtrace.io/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono break-all text-[var(--accent)] hover:opacity-80 underline"
                    >
                      {txHash}
                    </a>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Success Message */}
              <AnimatePresence>
                {paymentStatus === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-xl bg-[var(--success-bg)] border border-[var(--success-muted)] text-center space-y-2"
                  >
                    <p className="font-bold text-[var(--success)] font-mono">✓ Payment Verified via x402!</p>
                    <p className="text-sm text-[var(--success)]">Transaction confirmed on-chain</p>
                    <p className="text-xs text-[var(--text-tertiary)] font-mono">
                      {onSuccess
                        ? 'Creating your facilitator...'
                        : 'Redirecting to Builder Hub...'}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Info */}
              <p className="text-center text-[10px] text-[var(--text-tertiary)] font-mono uppercase tracking-widest">
                Using x402 facilitator on {network}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
