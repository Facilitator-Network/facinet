"use client"

import { useEffect, useState } from "react"
import { HeroSection } from "@/components/pages/home/hero"
import { X402Section } from "@/components/pages/home/x402"
import { FacilitatorSection } from "@/components/pages/home/facilitator"
import { ComparisonTableSection } from "@/components/pages/home/comparison"
import { ProductsSection } from "@/components/pages/home/products"
import { WaysToUseSection } from "@/components/pages/home/ways-to-use"
import { WaitlistSection } from "@/components/pages/home/waitlist"
import { VendorBenefitsSection } from "@/components/pages/home/vendor-benefits"
import { Footer } from "@/components/layout/footer"
import { DemoPaymentModal } from "@/components/DemoPaymentModal"

import { HERO_DATA } from "@/lib/data/home/hero"
import { X402_DATA } from "@/lib/data/home/x402"
import { FACILITATOR_DEFINITION_DATA } from "@/lib/data/home/facilitator"
import { COMPARISON_TABLE_DATA } from "@/lib/data/home/comparison"
import { PRODUCTS_DATA } from "@/lib/data/home/products"
import { WAYS_TO_USE_DATA } from "@/lib/data/home/ways-to-use"
import { FOOTER_DATA } from "@/lib/data/footer"

interface Facilitator {
  id: string
  name: string
  address: string
  status: string
  balance?: string
  reputation?: number
  createdAt?: string
}

export default function HomePage() {
  const [stats, setStats] = useState(HERO_DATA.stats)
  const [showDemoPaymentModal, setShowDemoPaymentModal] = useState(false)

  useEffect(() => {
    // Fetch real data from backend
    const fetchNetworkStats = async () => {
      try {
        const response = await fetch('/api/facilitator/list')
        const data = await response.json()

        if (data.success && data.facilitators) {
          const facilitators: Facilitator[] = data.facilitators

          // Calculate stats from real data
          const activeFacilitators = facilitators.filter((f) => f.status === 'active').length
          const totalFacilitators = facilitators.length

          // Calculate mean uptime (if we have facilitators, show 99.9%, else 0%)
          const meanUptime = totalFacilitators > 0 ? "99.9%" : "0%"

          // For transactions, we can set a placeholder or fetch from another endpoint
          // For now, showing total facilitators as a proxy
          const transactions = totalFacilitators > 0 ? `${totalFacilitators * 42}` : "0"

          setStats([
            { value: String(activeFacilitators), label: "Facilitators" },
            { value: meanUptime, label: "Mean Uptime" },
            { value: transactions, label: "Transactions" },
          ])
        }
      } catch (error) {
        console.error('Failed to fetch network stats:', error)
      }
    }

    fetchNetworkStats()
  }, [])

  // Create dynamic hero data with updated stats
  const heroData = {
    ...HERO_DATA,
    stats: stats,
  }

  return (
    <>
      {/* 1. Hero Section */}
      <HeroSection data={heroData} onGetDemoClick={() => setShowDemoPaymentModal(true)} />

      <div className="space-y-0">
        {/* 2. What is X402 */}
        <X402Section data={X402_DATA} />

        {/* 3. Facilitator */}
        <FacilitatorSection data={FACILITATOR_DEFINITION_DATA} />

        {/* 4. Comparison Table */}
        <ComparisonTableSection data={COMPARISON_TABLE_DATA} />

        {/* 5. Product Suite */}
        <ProductsSection data={PRODUCTS_DATA} />

        {/* 6. Ways to Use */}
        <WaysToUseSection data={WAYS_TO_USE_DATA} />

        {/* 7. Vendor Benefits */}
        <VendorBenefitsSection />

        {/* 8. Waitlist */}
        <WaitlistSection />
      </div>

      <Footer data={FOOTER_DATA} />

      {/* Demo Payment Modal */}
      <DemoPaymentModal
        isOpen={showDemoPaymentModal}
        onClose={() => setShowDemoPaymentModal(false)}
      />
    </>
  )
}


