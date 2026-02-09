
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  title: string;
  description?: string;
  eyebrow?: string;
  icon?: LucideIcon;
  iconColor?: string;
  badge?: React.ReactNode;
  rightElement?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'hero';
}

export function SectionHeading({
  title,
  description,
  eyebrow,
  icon: Icon,
  iconColor = "text-primary",
  badge,
  rightElement,
  className,
  variant = 'default'
}: SectionHeadingProps) {
  const isHero = variant === 'hero';

  return (
    <div className={cn("flex flex-col mb-12", className)}>
      {eyebrow && (
        <div className="flex items-center gap-3 text-primary mb-4">
           <div className="h-px w-12 bg-primary" />
           <span className="text-sm font-mono uppercase tracking-widest text-primary font-bold">{eyebrow}</span>
        </div>
      )}
      
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-4">
          {Icon && (
            <div className={cn(
              "flex items-center justify-center transition-colors",
              isHero ? "p-4 rounded-2xl bg-white/5 border border-white/10" : "p-3 rounded-xl bg-white/5 border border-white/10 group-hover:bg-white/10"
            )}>
              <Icon className={cn(iconColor)} size={isHero ? 32 : 24} />
            </div>
          )}
          
          <div>
            <h2 className={cn(
              "font-bold font-mono text-white uppercase tracking-tight flex items-center gap-3",
              isHero ? "text-4xl md:text-5xl" : "text-2xl md:text-3xl"
            )}>
              {title}
              {badge && (
                <span className={cn(
                  "rounded bg-primary/20 text-primary border border-primary/30 font-mono tracking-wider",
                  isHero ? "text-sm px-3 py-1" : "text-xs px-2 py-0.5"
                )}>
                  {badge}
                </span>
              )}
            </h2>
            {description && (
              <p className={cn(
                "text-white/50 font-light mt-1",
                isHero ? "text-lg md:text-xl max-w-2xl" : "text-sm"
              )}>{description}</p>
            )}
          </div>
        </div>

        {rightElement && (
          <div className="hidden md:block">
            {rightElement}
          </div>
        )}
      </div>
    </div>
  );
}
