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
      <select
        value={selectedNetwork}
        onChange={(e) => handleNetworkSelect(e.target.value)}
        disabled={disabled || isSwitching}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {SUPPORTED_NETWORKS.map((network) => {
          const config = NETWORK_CONFIGS[network];
          const isCurrentChain = chain?.id === config.chain.id;

          return (
            <option key={network} value={network}>
              {config.displayName} ({config.nativeCurrency.symbol}
              {isCurrentChain ? ' - Connected' : ''})
            </option>
          );
        })}
      </select>
      {isSwitching && (
        <div className="text-xs text-white/60 font-mono text-center">
          Switching network...
        </div>
      )}
    </div>
  );
}
