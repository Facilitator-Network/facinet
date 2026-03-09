'use client';

import { usePathname } from 'next/navigation';
import ColorBends from '@/components/ui/ColorBends';

export function BackgroundLayout() {
  const pathname = usePathname();

  const showColorBends = pathname !== '/' && !pathname.startsWith('/docs');

  // Docs: Solid background
  if (pathname?.startsWith('/docs')) {
    return <div className="fixed inset-0 bg-[var(--bg-void)] z-[-1]" />;
  }

  // Default Pages: ColorBends Shader
  if (showColorBends) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          zIndex: -1,
          pointerEvents: 'none',
          filter: 'blur(80px)',
          opacity: 0.4
        }}
      >
        <ColorBends
          colors={[
            "#0000FF", "#0066FF",
            "#000000",
            "#00AAFF", "#00FFFF",
            "#000000",
            "#0033FF", "#0088FF",
            "#000000"
          ]}
          rotation={0}
          autoRotate={0}
          speed={0.1}
          scale={1}
          frequency={1}
          warpStrength={1}
          mouseInfluence={0.4}
          parallax={0.6}
          noise={0.06}
          transparent={true}
        />
      </div>
    );
  }

  // Home: Subtle accent glow instead of rainbow gradient
  return (
    <div className="fixed inset-0 w-full h-full z-0 pointer-events-none">
      <div className="absolute inset-0 bg-[var(--bg-void)]" />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(ellipse at 50% 80%, oklch(65% 0.2 250 / 4%), transparent 50%)',
        }}
      />
      <div className="absolute inset-0 stars-bg" />
    </div>
  );
}
