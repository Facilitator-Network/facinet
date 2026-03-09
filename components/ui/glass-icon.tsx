import { cn } from "@/lib/utils"
import { type LucideIcon } from "lucide-react"

interface GlassIconProps {
  icon: LucideIcon
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  iconClassName?: string
}

const sizeMap = {
  sm: { container: "w-8 h-8", icon: "w-4 h-4" },
  md: { container: "w-10 h-10", icon: "w-5 h-5" },
  lg: { container: "w-12 h-12", icon: "w-6 h-6" },
  xl: { container: "w-14 h-14", icon: "w-7 h-7" },
}

export function GlassIcon({ icon: Icon, size = "md", className, iconClassName }: GlassIconProps) {
  const sizes = sizeMap[size]

  return (
    <div
      className={cn(
        "glass-icon shrink-0",
        sizes.container,
        className,
      )}
    >
      <Icon className={cn(sizes.icon, iconClassName)} />
    </div>
  )
}
