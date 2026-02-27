"use client"

import { useRouter } from "next/navigation"
import TicketSelector from "@/components/TicketSelector"

export default function FlexTicketPage() {
  const router = useRouter()

  return (
    <TicketSelector
      title="Flex Ticket"
      tickets={[
        { id: "adult", label: "Adult (18–64)", price: 30 },
        { id: "child", label: "Child (6–17)", price: 20 },
        { id: "student", label: "Student", price: 25 },
        { id: "senior", label: "Senior (65+)", price: 22 },
      ]}
      onContinue={(total, quantities) => {
        // In real app we would store cart state here
        console.log("Flex checkout:", total, quantities)
        router.push("/tickets/checkout")
      }}
    />
  )
}