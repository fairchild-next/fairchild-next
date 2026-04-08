"use client";

import { useState } from "react";
import { vendorCategories } from "@/lib/couple/vendorData";
import type { VendorCategory } from "@/lib/couple/vendorData";

export default function VendorsPage() {
  const [activeTab, setActiveTab] = useState(vendorCategories[0].id);
  const category = vendorCategories.find((c) => c.id === activeTab) as VendorCategory;

  return (
    <div style={{ background: "#f0f3ee", minHeight: "100%" }}>
      <div className="px-4 pt-5 pb-3">
        <h1 className="font-serif text-2xl font-bold" style={{ color: "#2a3d2a" }}>Preferred Vendors</h1>
        <p className="text-sm mt-0.5" style={{ color: "#9aab9a" }}>
          Fairchild-approved and trusted by our team
        </p>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-hide">
        {vendorCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id)}
            className="flex items-center px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors shrink-0"
            style={
              activeTab === cat.id
                ? { background: "#4a6741", color: "#fff" }
                : { background: "#fff", color: "#7a8a7a", border: "1.5px solid #e4ebe4" }
            }
          >
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Vendor cards */}
      <div className="px-4 space-y-3 pb-4">
        {category.vendors.map((vendor) => (
          <div key={vendor.name} className="rounded-2xl bg-white shadow-sm p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-serif text-base font-bold leading-snug" style={{ color: "#2a3d2a" }}>
                {vendor.name}
              </h3>
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap"
                style={{ background: "#e8efe6", color: "#4a6741" }}
              >
                ✦ Preferred
              </span>
            </div>
            <p className="text-sm mb-3 leading-relaxed" style={{ color: "#7a8a7a" }}>{vendor.description}</p>
            {vendor.note && (
              <p className="text-xs italic mb-3" style={{ color: "#9a7020" }}>{vendor.note}</p>
            )}
            <div className="flex flex-wrap gap-3">
              {vendor.website && (
                <a href={vendor.website} target="_blank" rel="noopener noreferrer"
                   className="text-xs font-semibold flex items-center gap-1" style={{ color: "#4a6741" }}>
                  <span>🌐</span> Website
                </a>
              )}
              {vendor.phone && (
                <a href={`tel:${vendor.phone}`} className="text-xs flex items-center gap-1" style={{ color: "#7a8a7a" }}>
                  <span>📞</span> {vendor.phone}
                </a>
              )}
              {vendor.email && (
                <a href={`mailto:${vendor.email}`} className="text-xs flex items-center gap-1" style={{ color: "#7a8a7a" }}>
                  <span>✉️</span> {vendor.email}
                </a>
              )}
            </div>
          </div>
        ))}
        <p className="text-xs text-center pb-2" style={{ color: "#b4c4b4" }}>
          Have a vendor to request? Message your coordinator.
        </p>
        <div className="h-2" />
      </div>
    </div>
  );
}
