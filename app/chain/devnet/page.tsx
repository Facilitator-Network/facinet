import React from "react";
import Link from "next/link";
import { ArrowLeft, Construction } from "lucide-react";

export default function DevnetPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <Link href="/chain" className="absolute top-24 left-8 text-white/50 hover:text-white flex items-center gap-2 transition-colors">
        <ArrowLeft size={20} /> Back to Chain
      </Link>
      
      <div className="text-center space-y-6">
        <div className="inline-block px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-mono tracking-widest uppercase mb-4">
          Devnet
        </div>
        <div className="flex justify-center mb-4">
            <Construction className="text-yellow-500/40" size={64} />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold font-mono text-white uppercase tracking-widest italic opacity-50">
          Under Construction
        </h1>
        <p className="text-white/40 font-light max-w-md mx-auto">
          Devnet environment is currently under active development.
        </p>
      </div>
    </div>
  );
}
