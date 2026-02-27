"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useParams } from "next/navigation"

type TimeSlot = {
  id: string
  date: string
  start_time: string
  end_time: string
}

type TicketType = {
  id: string
  name: string
  price: number
}

export default function TicketTypePage() {
  const { slotId } = useParams()

  const [slot, setSlot] = useState<TimeSlot | null>(null)
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([])
  const [quantities, setQuantities] = useState<Record<string, number>>({})

  useEffect(() => {
    const fetchData = async () => {
      const { data: slotData } = await supabase
        .from("time_slots")
        .select("*")
        .eq("id", slotId)
        .single()

      if (slotData) setSlot(slotData)

      const { data: typesData } = await supabase
        .from("ticket_types")
        .select("id, name, price")
        .eq("is_active", true)

      if (typesData) {
        setTicketTypes(typesData)

        const initial: Record<string, number> = {}
        typesData.forEach((t) => {
          initial[t.id] = 0
        })

        setQuantities(initial)
      }
    }

    if (slotId) fetchData()
  }, [slotId])

  const changeQuantity = (id: string, change: number) => {
  setQuantities(prev => {
    const current = prev[id] ?? 0
    const updated = Math.max(0, current + change)

    return {
      ...prev,
      [id]: updated,
    }
  })
}

  const totalItems = Object.values(quantities).reduce(
    (sum, qty) => sum + qty,
    0
  )

  const total = ticketTypes.reduce(
    (sum, t) => sum + t.price * (quantities[t.id] || 0),
    0
  )

  if (!slot) return null
console.log("Quantities:", quantities)
  return (
    <div className="max-w-md mx-auto px-6 pt-6 space-y-8">

      {/* Slot Header */}
      <div>
        <h2 className="text-xl font-semibold">
          {slot.date} | {slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}
        </h2>
      </div>

      {/* Ticket Cards */}
      <div className="space-y-6">
        {ticketTypes.map((type) => (
          <div
            key={type.id}
            className="border border-gray-700 rounded-2xl p-6 transition hover:border-green-500"
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="text-lg font-medium">
                  {type.name}
                </div>
                <div className="text-gray-400 mt-1">
                  ${type.price}
                </div>
              </div>

              <div className="flex items-center gap-4">
  <button
    onClick={() => changeQuantity(type.id, -1)}
    className="w-10 h-10 rounded-full bg-gray-700 text-white flex items-center justify-center text-lg"
  >
    –
  </button>

  <span className="w-8 text-center text-lg">
    {quantities[type.id] ?? 0}
  </span>

  <button
    onClick={() => changeQuantity(type.id, 1)}
    className="w-10 h-10 rounded-full bg-green-500 text-black flex items-center justify-center text-lg"
  >
    +
  </button>
</div>
            </div>
          </div>
        ))}
      </div>

     {/* Bottom CTA */}
<div className="sticky bottom-0 bg-black border-t border-gray-700 px-6 py-5">
  <div className="flex justify-between text-sm text-gray-400 mb-3">
    <span>{totalItems} Tickets</span>
    <span className="font-medium text-white">${total}</span>
  </div>

  <button
    disabled={totalItems === 0}
    className={`w-full py-4 rounded-2xl font-semibold text-lg transition ${
      totalItems === 0
        ? "bg-gray-700 text-gray-400"
        : "bg-green-500 text-black hover:opacity-90"
    }`}
  >
    Continue to Checkout
  </button>
</div>

    </div>
  )
}