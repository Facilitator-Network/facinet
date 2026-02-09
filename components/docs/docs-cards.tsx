import Link from "next/link"
import { Card } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"

interface DocsCardProps {
  href: string
  title: string
  description: string
  icon?: React.ReactNode
}

export function DocsCard({ href, title, description, icon }: DocsCardProps) {
  return (
    <Link href={href} className="flex-1 min-w-[280px]">
      <Card className="h-full p-6 bg-card/30 backdrop-blur border-white/5 hover:border-primary/40 hover:bg-card/50 transition-all cursor-pointer group relative overflow-hidden">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
             <div className="p-2.5 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300">
                {icon}
             </div>
             <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-1.5 text-foreground group-hover:text-primary transition-colors">
                {title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
                {description}
            </p>
          </div>
        </div>
        
        {/* Gradient Glow Effect */}
        <div className="absolute -right-12 -top-12 w-24 h-24 bg-primary/20 blur-[50px] group-hover:bg-primary/30 transition-colors" />
      </Card>
    </Link>
  )
}
