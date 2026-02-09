'use client';

import { useState, useEffect } from 'react';
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatUnits, parseUnits } from 'viem';
import { USDC_FUJI, WAVAX_FUJI, TRADER_JOE_ROUTER } from '@/lib/contracts';
import { motion, AnimatePresence } from 'framer-motion';

const ROUTER_ABI = [
  {
    inputs: [
      { name: 'amountOutMin', type: 'uint256' },
      { name: 'path', type: 'address[]' },
      { name: 'to', type: 'address' },
      { name: 'deadline', type: 'uint256' },
    ],
    name: 'swapExactAVAXForTokens',
    outputs: [{ name: 'amounts', type: 'uint256[]' }],
    stateMutability: 'payable',
    type: 'function',
  },
] as const;

export function SwapWidget() {
  const { address } = useAccount();
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const { data: avaxBalance } = useBalance({
    address: address,
  });

  const { data: usdcBalance, refetch: refetchUSDC } = useBalance({
    address: address,
    token: USDC_FUJI.address,
  });

  const { data: hash, writeContract, isPending, error: writeError } = useWriteContract();

  const { isLoading: isConfirming, isSuccess, isError: txError } = useWaitForTransactionReceipt({
    hash,
  });

  // Refetch USDC balance when transaction succeeds
  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => refetchUSDC(), 2000); // Refetch after 2 seconds
    }
  }, [isSuccess, refetchUSDC]);

  const handleSwap = async () => {
    if (!address || !amount || parseFloat(amount) <= 0) return;

    // Check if user has enough AVAX
    if (avaxBalance && parseFloat(amount) > parseFloat(formatUnits(avaxBalance.value, 18))) {
      setError('Insufficient AVAX balance');
      return;
    }

    try {
      setError(''); // Clear previous errors
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20); // 20 minutes

      writeContract({
        address: TRADER_JOE_ROUTER.address,
        abi: ROUTER_ABI,
        functionName: 'swapExactAVAXForTokens',
        args: [
          parseUnits('0', 6), // minimum USDC out (0 for demo, should calculate slippage)
          [WAVAX_FUJI.address, USDC_FUJI.address],
          address,
          deadline,
        ],
        value: parseEther(amount),
      });
    } catch (error) {
      console.error('Swap error:', error);
      setError(error instanceof Error ? error.message : 'Swap failed. Please try again.');
    }
  };

  const estimatedUSDC = parseFloat(amount) * 25; // Rough estimate: 1 AVAX ≈ 25 USDC

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto p-6 border-2 border-black bg-white shadow-lg"
    >
      <h3 className="text-2xl font-bold mb-2">Swap AVAX for USDC</h3>
      <p className="text-sm mb-4 text-gray-600">
        Get USDC on Avalanche Fuji Testnet
      </p>

      {/* Testnet liquidity notice */}
      <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-400 text-blue-900">
        <p className="text-sm font-semibold mb-2">💡 Testnet Notice</p>
        <p className="text-xs leading-relaxed">
          Trader Joe pools on Fuji testnet may have limited liquidity. If the swap fails,
          you can get testnet USDC directly from faucets or by bridging from other testnets.
          Try small amounts (0.1 AVAX) first.
        </p>
      </div>

      {/* USDC Balance Display */}
      {usdcBalance && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 p-3 bg-gray-50 border-2 border-gray-200"
        >
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Your USDC Balance:</span>
            <span className="text-lg font-bold text-gray-900">
              {parseFloat(formatUnits(usdcBalance.value, 6)).toFixed(2)} USDC
            </span>
          </div>
        </motion.div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">From</label>
          <div className="border-2 border-black p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold">AVAX</span>
              {avaxBalance && (
                <span className="text-sm text-gray-600">
                  Balance: {parseFloat(formatUnits(avaxBalance.value, 18)).toFixed(4)}
                </span>
              )}
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              className="w-full text-2xl font-bold outline-none bg-transparent"
              step="0.01"
              min="0"
            />
          </div>
        </div>

        <div className="flex justify-center">
          <div className="w-10 h-10 border-2 border-black bg-white flex items-center justify-center font-bold">
            ↓
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">To (estimated)</label>
          <div className="border-2 border-black p-3 bg-gray-50">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold">USDC</span>
            </div>
            <div className="text-2xl font-bold text-gray-700">
              {amount ? `~${estimatedUSDC.toFixed(2)}` : '0.0'}
            </div>
          </div>
        </div>

        <button
          onClick={handleSwap}
          disabled={!address || !amount || parseFloat(amount) <= 0 || isPending || isConfirming}
          className="w-full py-4 bg-black text-white font-bold hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
        >
          {isPending ? 'Confirming in wallet...' : isConfirming ? 'Swapping...' : isSuccess ? '✓ Swap Successful!' : 'Swap Now'}
        </button>

        {/* Error Messages */}
        <AnimatePresence>
          {(error || writeError || txError) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-red-50 border-2 border-red-500 text-red-700"
            >
              <p className="text-sm font-medium">
                ⚠️ {error || writeError?.message || 'Transaction failed. Please try again.'}
              </p>
              <p className="text-xs mt-2 text-red-600">
                Make sure you have enough AVAX for gas fees and that the Trader Joe pool has liquidity.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Message with Transaction Link */}
        <AnimatePresence>
          {isSuccess && hash && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-4 bg-black text-white"
            >
              <p className="font-bold mb-2 text-center">✓ Swap Completed!</p>
              <p className="text-sm text-center mb-3">USDC should appear in your wallet shortly</p>
              <a
                href={`https://testnet.snowtrace.io/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-sm underline hover:text-gray-300 transition-colors"
              >
                View on Snowtrace →
              </a>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-2">
          <p className="text-xs text-gray-500 text-center">
            Using Trader Joe on Avalanche Fuji Testnet
          </p>
          <p className="text-xs text-gray-400 text-center">
            Need testnet AVAX? Visit the{' '}
            <a
              href="https://core.app/tools/testnet-faucet/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gray-600"
            >
              Fuji Faucet
            </a>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
