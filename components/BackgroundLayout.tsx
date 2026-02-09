'use client';

import { usePathname } from 'next/navigation';
import ColorBends from '@/components/ui/ColorBends';

export function BackgroundLayout() {
  const pathname = usePathname();

  // Show ColorBends on all pages EXCEPT home ('/') and docs ('/docs/*')
  const showColorBends = pathname !== '/' && !pathname.startsWith('/docs');
  console.log('BackgroundLayout:', { pathname, showColorBends });

  // 1. Docs: Plain Black (No shader, no stars)
  if (pathname?.startsWith('/docs')) {
    return <div className="fixed inset-0 bg-black z-[-1]" />;
  }

  // 2. Default Pages: ColorBends Shader
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
            "#FF0000", "#FF0000", // Red Red
            "#000000", // Black (Separator)
            "#0000FF", "#0000FF", // Blue Blue
            "#000000", // Black (Separator)
            "#00FF00", "#00FF00", // Green Green
            "#000000"  // Black (Separator)
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

  // Fallback / Default Background (e.g. Stars for Home)
  return (
    <div className="fixed inset-0 w-full h-full stars-bg z-0 pointer-events-none"></div>
  );
}
