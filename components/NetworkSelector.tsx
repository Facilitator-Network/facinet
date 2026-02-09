'use client';

import { useState } from 'react';
import { NETWORK_CONFIGS, SUPPORTED_NETWORKS } from '@/lib/networks';
import { useAccount, useSwitchChain } from 'wagmi';

interface NetworkSelectorProps {
  selectedNetwork: string;
  onNetworkChange: (network: string) => void;
  disabled?: boolean;
}

export function NetworkSelector({ selectedNetwork, onNetworkChange, disabled }: NetworkSelectorProps) {
  const { chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const [isSwitching, setIsSwitching] = useState(false);

  const handleNetworkSelect = async (network: string) => {
    if (disabled || isSwitching) return;

    const networkConfig = NETWORK_CONFIGS[network];

    // Update selected network immediately
    onNetworkChange(network);

    // Switch wallet to this network if different
    if (chain?.id !== networkConfig.chain.id && switchChain) {
      setIsSwitching(true);
      try {
        await switchChain({ chainId: networkConfig.chain.id });
      } catch (error) {
        console.error('Failed to switch network:', error);
      } finally {
        setIsSwitching(false);
      }
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-xs font-mono text-white/40 uppercase tracking-widest">
        Select Network
      </label>
      <div className="grid grid-cols-2 gap-3">
        {SUPPORTED_NETWORKS.map((network) => {
          const config = NETWORK_CONFIGS[network];
          const isSelected = selectedNetwork === network;
          const isCurrentChain = chain?.id === config.chain.id;

          return (
            <button
              key={network}
              onClick={() => handleNetworkSelect(network)}
              disabled={disabled || isSwitching}
              className={`p-4 rounded-lg border transition-all text-left ${
                isSelected
                  ? 'border-white bg-white/10'
                  : 'border-white/10 bg-white/5 hover:bg-white/10'
              } ${disabled || isSwitching ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="font-bold text-white text-sm font-mono mb-1">
                {config.displayName}
              </div>
              <div className="text-xs text-white/40 font-mono">
                {config.nativeCurrency.symbol}
              </div>
              {isCurrentChain && (
                <div className="mt-2 text-[10px] text-green-400 font-mono">
                  ✓ Connected
                </div>
              )}
              {isSelected && !isCurrentChain && (
                <div className="mt-2 text-[10px] text-yellow-400 font-mono">
                  ⚠ Switch wallet
                </div>
              )}
            </button>
          );
        })}
      </div>
      {isSwitching && (
        <div className="text-xs text-white/60 font-mono text-center">
          Switching network...
        </div>
      )}
    </div>
  );
}
