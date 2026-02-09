import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TestnetPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <Link href="/chain" className="absolute top-24 left-8 text-white/50 hover:text-white flex items-center gap-2 transition-colors">
        <ArrowLeft size={20} /> Back to Chain
      </Link>
      
      <div className="text-center space-y-6">
        <div className="inline-block px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono tracking-widest uppercase mb-4">
          Testnet
        </div>
        <h1 className="text-5xl md:text-7xl font-bold font-mono text-white uppercase tracking-widest italic opacity-50">
          Coming Soon
        </h1>
        <p className="text-white/40 font-light max-w-md mx-auto">
          Public Testnet access will be opening shortly for verified facilitators.
        </p>
      </div>
    </div>
  );
}
