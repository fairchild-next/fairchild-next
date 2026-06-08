"use client";

import { useEffect, useState } from "react";
import { vendorCategories as fallbackCategories } from "@/lib/couple/vendorData";
import type { VendorCategory } from "@/lib/couple/vendorData";

export default function VendorsPage() {
  const [categories, setCategories] = useState<VendorCategory[]>(fallbackCategories);
  const [activeTab, setActiveTab] = useState(fallbackCategories[0]?.id ?? "catering");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch("/api/couple/vendors")
      .then((r) => r.json())
      .then((d: { categories?: VendorCategory[] }) => {
        if (d.categories?.length) {
          setCategories(d.categories);
          setActiveTab(d.categories[0].id);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const category = categories.find((c) => c.id === activeTab) ?? categories[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24" style={{ background: "#f0f3ee" }}>
        <div className="w-6 h-6 rounded-full border-2 border-[#4a6741] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!category) return null;

  return (
    <div style={{ background: "#f0f3ee", minHeight: "100%" }}>
      <div className="px-4 pt-5 pb-3">
        <h1 className="font-serif text-2xl font-bold" style={{ color: "#2a3d2a" }}>Preferred Vendors</h1>
        <p className="text-sm mt-0.5" style={{ color: "#9aab9a" }}>
          Fairchild-approved and trusted by our team
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-hide">
        {categories.map((cat) => (
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

      <div className="px-4 space-y-3 pb-4">
        {category.vendors.map((vendor) => (
          <div key={vendor.name} className="rounded-2xl bg-white shadow-sm p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-serif text-base font-bold leading-snug" style={{ color: "#2a3d2a" }}>
                {vendor.name}
              </h3>
              <span
                className="text-xs font-semibold px-2.5 py-0.5 rounded-full shrink-0 whitespace-nowrap"
                style={{ background: "#e8efe6", color: "#4a6741" }}
              >
                ✦ Preferred
              </span>
            </div>
            <p className="text-sm mb-3 leading-relaxed" style={{ color: "#7a8a7a" }}>{vendor.description}</p>
            {vendor.note && (
              <p className="text-sm italic mb-3" style={{ color: "#9a7020" }}>{vendor.note}</p>
            )}
            <div className="flex flex-wrap gap-3">
              {vendor.website && (
                <a href={vendor.website} target="_blank" rel="noopener noreferrer"
                   className="text-sm font-semibold flex items-center gap-1" style={{ color: "#4a6741" }}>
                  <span>🌐</span> Website
                </a>
              )}
              {vendor.phone && (
                <a href={`tel:${vendor.phone}`} className="text-sm flex items-center gap-1" style={{ color: "#7a8a7a" }}>
                  <span>📞</span> {vendor.phone}
                </a>
              )}
              {vendor.email && (
                <a href={`mailto:${vendor.email}`} className="text-sm flex items-center gap-1" style={{ color: "#7a8a7a" }}>
                  <span>✉️</span> {vendor.email}
                </a>
              )}
            </div>
          </div>
        ))}
        <p className="text-sm text-center pb-2" style={{ color: "#b4c4b4" }}>
          Have a vendor to request? Message your coordinator.
        </p>
        <div className="h-2" />
      </div>
    </div>
  );
}
