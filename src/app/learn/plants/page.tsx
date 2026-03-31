"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CaretDown } from "@phosphor-icons/react";
import { resolveImageUrl } from "@/lib/resolveImageUrl";

type Plant = {
  id: string;
  slug: string;
  common_name: string;
  scientific_name: string;
  description: string | null;
  image_url: string | null;
  plant_type: string | null;
  location: string | null;
};


const TYPE_OPTIONS = ["Tree", "Palm", "Flower", "Shrub"] as const;
/** Exhibit options align with plant.location (DB). For map correlation: ensure
 * plant.location values match map POI names for exhibit-type POIs. */
const EXHIBIT_OPTIONS = ["Palm Grove", "Rainforest Exhibit"] as const;

type FilterCategory = "type" | "exhibit";

export default function BrowsePlantsPage() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<FilterCategory>("type");
  const [typeFilter, setTypeFilter] = useState("");
  const [exhibitFilter, setExhibitFilter] = useState("");
  const [allExhibits, setAllExhibits] = useState<string[]>([]);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/plants")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data.plants) {
          const locs = [...new Set(data.plants.map((p: Plant) => p.location).filter(Boolean))].sort() as string[];
          setAllExhibits(locs.length > 0 ? locs : [...EXHIBIT_OPTIONS]);
        }
      })
      .catch(() => setAllExhibits([...EXHIBIT_OPTIONS]));
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (filterCategory === "type" && typeFilter) params.set("type", typeFilter);
    if (filterCategory === "exhibit" && exhibitFilter) params.set("location", exhibitFilter);

    fetch(`/api/plants?${params}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data.plants) setPlants(data.plants);
      })
      .catch(() => setPlants([]))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [search, filterCategory, typeFilter, exhibitFilter]);

  const displayExhibits = allExhibits.length > 0 ? allExhibits : [...EXHIBIT_OPTIONS];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(target)) {
        setCategoryDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="pb-24">
      <div className="px-6 pt-4">
        <Link
          href="/learn"
          className="text-sm text-[var(--primary)] font-medium"
        >
          ← Back to Learn
        </Link>
      </div>

      <div className="px-6 pt-4 pb-6">
        <h2 className="text-2xl font-semibold mb-2">Browse Plants</h2>
        <p className="text-[var(--text-muted)] text-sm">
          Search our database to learn more about the plants at Fairchild.
          Explore an array of tropical and subtropical species.
        </p>
        <a
          href="https://www.fairchildgarden.org"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block px-5 py-2.5 rounded-xl bg-[var(--primary)] text-white font-semibold text-sm"
        >
          Fairchild Database
        </a>
      </div>

      {/* Search */}
      <div className="px-6 mb-4">
        <input
          type="search"
          placeholder="Search for a plant..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-[var(--surface)] border border-[var(--surface-border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--primary)] focus:outline-none"
        />
      </div>

      {/* Single filter row: category dropdown + pills for selected category */}
      <div className="px-6 mb-6">
        <div className="flex items-center gap-2 w-full">
          <div className="relative shrink-0" ref={categoryDropdownRef}>
            <button
              type="button"
              onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium shrink-0 bg-[var(--primary)] text-white"
            >
              {filterCategory === "type" ? "Plant Type" : "Exhibit"}
              <CaretDown size={14} weight="bold" className={categoryDropdownOpen ? "rotate-180" : ""} />
            </button>
            {categoryDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 z-10 py-1 rounded-xl bg-[var(--surface)] border border-[var(--surface-border)] shadow-lg min-w-[140px]">
                <button
                  type="button"
                  onClick={() => {
                    setFilterCategory("type");
                    setCategoryDropdownOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-2 text-sm ${
                    filterCategory === "type"
                      ? "text-[var(--primary)] font-medium"
                      : "text-[var(--text-muted)] hover:bg-[var(--surface-border)]/30"
                  }`}
                >
                  Plant Type
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFilterCategory("exhibit");
                    setCategoryDropdownOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-2 text-sm ${
                    filterCategory === "exhibit"
                      ? "text-[var(--primary)] font-medium"
                      : "text-[var(--text-muted)] hover:bg-[var(--surface-border)]/30"
                  }`}
                >
                  Exhibit
                </button>
              </div>
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 min-w-0 flex-1">
            {filterCategory === "type"
              ? TYPE_OPTIONS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTypeFilter(typeFilter === t ? "" : t)}
                    className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition ${
                      typeFilter === t
                        ? "bg-[var(--primary-light)] text-white border border-[var(--primary)]"
                        : "bg-[var(--surface)] border border-[var(--surface-border)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {t}
                  </button>
                ))
              : displayExhibits.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setExhibitFilter(exhibitFilter === loc ? "" : loc)}
                    className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition ${
                      exhibitFilter === loc
                        ? "bg-[var(--primary-light)] text-white border border-[var(--primary)]"
                        : "bg-[var(--surface)] border border-[var(--surface-border)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {loc}
                  </button>
                ))}
          </div>
        </div>
      </div>

      {/* Plant list */}
      <div className="px-6 space-y-4">
        <h3 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wide">
          Browse Plants
        </h3>
        {loading ? (
          <div className="py-12 text-center text-[var(--text-muted)]">
            Loading plants…
          </div>
        ) : plants.length === 0 ? (
          <div className="py-12 text-center text-[var(--text-muted)]">
            No plants found. Try adjusting your search or filters.
          </div>
        ) : (
          <div className="space-y-4">
            {plants.map((plant) => (
              <Link
                key={plant.id}
                href={`/learn/plants/${plant.slug}`}
                className="block p-4 rounded-2xl bg-[var(--surface)] border border-[var(--surface-border)] hover:border-[var(--primary)] transition"
              >
                <div className="flex gap-4 min-w-0">
                  <div className="shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-[var(--surface-border)]">
                    <img
                      src={resolveImageUrl(plant.image_url)}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <h4 className="font-semibold line-clamp-2 break-words">{plant.common_name}</h4>
                    <p className="text-sm text-[var(--text-muted)] italic truncate">
                      {plant.scientific_name}
                    </p>
                  </div>
                  <span className="shrink-0 text-[var(--text-muted)]">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
