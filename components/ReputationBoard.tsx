'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface FacilitatorReputation {
  facilitatorId: number;
  count: number;
  averageScore: number;
}

export default function ReputationBoard() {
  const [facilitators, setFacilitators] = useState<FacilitatorReputation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReputation();
  }, []);

  const fetchReputation = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/facilitator/reputation?all=true');
      const data = await response.json();

      if (data.success) {
        // Sort by average score descending
        const sorted = data.facilitators.sort(
          (a: FacilitatorReputation, b: FacilitatorReputation) =>
            b.averageScore - a.averageScore
        );
        setFacilitators(sorted);
      } else {
        setError(data.error || 'Failed to load reputation data');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch reputation');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 75) return 'text-blue-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return '🏆 Excellent';
    if (score >= 75) return '⭐ Great';
    if (score >= 50) return '✓ Good';
    return '⚠️ Fair';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading reputation data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500 rounded-lg p-6 text-center">
        <p className="text-red-500 font-semibold">Error loading reputation</p>
        <p className="text-gray-400 text-sm mt-2">{error}</p>
        <button
          onClick={fetchReputation}
          className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition"
        >
          Retry
        </button>
      </div>
    );
  }

  if (facilitators.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">No facilitators with reputation yet</p>
        <p className="text-gray-500 text-sm mt-2">
          Facilitators will appear here after receiving feedback
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Facilitator Reputation Leaderboard</h2>
        <button
          onClick={fetchReputation}
          className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500 rounded-lg transition text-sm"
        >
          🔄 Refresh
        </button>
      </div>

      <div className="grid gap-4">
        {facilitators.map((facilitator, index) => (
          <motion.div
            key={facilitator.facilitatorId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-blue-500/50 transition-all"
          >
            <div className="flex items-center justify-between">
              {/* Rank */}
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${
                    index === 0
                      ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black'
                      : index === 1
                      ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-black'
                      : index === 2
                      ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-black'
                      : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  #{index + 1}
                </div>

                {/* Facilitator Info */}
                <div>
                  <h3 className="text-xl font-semibold">
                    Facilitator #{facilitator.facilitatorId}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {facilitator.count} review{facilitator.count !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Score */}
              <div className="text-right">
                <div
                  className={`text-4xl font-bold ${getScoreColor(
                    facilitator.averageScore
                  )}`}
                >
                  {facilitator.averageScore}
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  {getScoreBadge(facilitator.averageScore)}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4 bg-gray-700 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${facilitator.averageScore}%` }}
                transition={{ delay: index * 0.05 + 0.2, duration: 0.6 }}
                className={`h-full ${
                  facilitator.averageScore >= 90
                    ? 'bg-gradient-to-r from-green-400 to-green-600'
                    : facilitator.averageScore >= 75
                    ? 'bg-gradient-to-r from-blue-400 to-blue-600'
                    : facilitator.averageScore >= 50
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                    : 'bg-gradient-to-r from-red-400 to-red-600'
                }`}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <p className="text-sm text-gray-300">
          💡 <strong>How it works:</strong> Reputation scores are stored on-chain using{' '}
          <a
            href="https://eips.ethereum.org/EIPS/eip-8004"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            ERC-8004
          </a>
          . Merchants can rate facilitators after each payment, creating a transparent
          trust network.
        </p>
      </div>
    </div>
  );
}
