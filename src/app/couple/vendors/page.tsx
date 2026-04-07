"use client";

import { useState } from "react";
import { vendorCategories } from "@/lib/couple/vendorData";
import type { VendorCategory } from "@/lib/couple/vendorData";

export default function VendorsPage() {
  const [activeTab, setActiveTab] = useState(vendorCategories[0].id);
  const category = vendorCategories.find((c) => c.id === activeTab) as VendorCategory;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-stone-700 mb-1">Preferred Vendors</h1>
        <p className="text-stone-400 text-sm">
          Fairchild-approved vendors who know our garden and are trusted by our team.
        </p>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {vendorCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id)}
            className={`
              flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm whitespace-nowrap transition-colors
              ${activeTab === cat.id
                ? "bg-amber-600 text-white font-medium"
                : "text-stone-500 hover:bg-stone-100"
              }
            `}
            style={activeTab !== cat.id ? { background: "#fff", border: "1px solid #e8dfd0" } : undefined}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Vendor cards */}
      <div className="space-y-4">
        {category.vendors.map((vendor) => (
          <div
            key={vendor.name}
            className="rounded-2xl p-5"
            style={{ background: "#fff", border: "1px solid #e8dfd0" }}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="font-serif text-stone-700 text-lg leading-snug">{vendor.name}</h3>
              <span
                className="text-xs px-2 py-0.5 rounded-full whitespace-nowrap shrink-0"
                style={{ background: "#fdf6e3", color: "#92400e" }}
              >
                ✦ Preferred by Fairchild
              </span>
            </div>
            <p className="text-stone-500 text-sm mb-3">{vendor.description}</p>
            {vendor.note && (
              <p className="text-amber-700 text-xs mb-3 italic">{vendor.note}</p>
            )}
            <div className="flex flex-wrap gap-3">
              {vendor.website && (
                <a
                  href={vendor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-amber-700 hover:underline"
                >
                  🌐 Website
                </a>
              )}
              {vendor.phone && (
                <a href={`tel:${vendor.phone}`} className="text-xs text-stone-500 hover:text-stone-700">
                  📞 {vendor.phone}
                </a>
              )}
              {vendor.email && (
                <a href={`mailto:${vendor.email}`} className="text-xs text-stone-500 hover:text-stone-700">
                  ✉️ {vendor.email}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-stone-400 text-center pb-2">
        Have a vendor you'd like to request? Message your coordinator.
      </p>
    </div>
  );
}
