"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  PLANT_SUPERPOWERS,
  PLANT_SUPERPOWER_DETAILS,
  type PlantSuperpower,
  type PlantSuperpowerDetail,
} from "@/lib/kids/plantSuperpowersData";

const HERO_IMAGE = "/kids/plant-superpowers.png";

export default function KidsPlantSuperpowersPage() {
  const [selected, setSelected] = useState<PlantSuperpowerDetail | null>(null);

  if (selected) {
    return (
      <div className="min-h-screen bg-[#F3EFEE] pb-24">
        <div className="px-6 pt-6">
          <button
            onClick={() => setSelected(null)}
            className="text-[var(--primary)] text-sm font-medium mb-4"
          >
            ← Go Back
          </button>
          <h1 className="text-2xl font-bold text-[#193521] mb-4">{selected.question}</h1>
        </div>

        <div className="px-6">
          <div className="rounded-2xl border-2 border-[var(--surface-border)] bg-white overflow-hidden mb-4">
            <div className="relative aspect-video">
              <Image
                src={HERO_IMAGE}
                alt=""
                fill
                className="object-cover"
                sizes="100vw"
                unoptimized
              />
            </div>
          </div>
          <div className="rounded-xl border border-[var(--surface-border)] bg-[#F8F8F8] p-4 mb-6">
            <p className="text-[#193521] leading-relaxed">{selected.description}</p>
          </div>

          <div className="space-y-4">
            {selected.examples.map((ex) => (
              <div
                key={ex.name}
                className="rounded-2xl border border-gray-200 bg-white overflow-hidden flex shadow-sm min-h-[100px]"
              >
                <div className="relative w-[38%] min-w-[100px] shrink-0 self-stretch">
                  <Image
                    src={ex.image}
                    alt={ex.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 448px) 40vw, 140px"
                    unoptimized
                  />
                </div>
                <div className="flex-1 min-w-0 p-4 flex flex-col justify-center">
                  <p className="font-semibold text-[#193521]">{ex.name}</p>
                  <p className="text-sm text-[var(--text-muted)] mt-0.5 leading-snug">{ex.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3EFEE] pb-24">
      <div className="px-6 pt-6">
        <Link href="/learn" className="text-[var(--primary)] text-sm font-medium mb-4 inline-block">
          ← Go Back
        </Link>
        <h1 className="text-2xl font-bold text-[#193521] mb-4">Plant Superpowers</h1>
      </div>

      <div className="px-6">
        <div className="rounded-2xl border-2 border-[var(--surface-border)] bg-white overflow-hidden mb-6">
          <div className="relative aspect-video">
            <Image
              src={HERO_IMAGE}
              alt=""
              fill
              className="object-cover"
              sizes="100vw"
              unoptimized
            />
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-[var(--surface-border)]" />
          <p className="text-[#193521] font-medium text-center shrink-0 px-2 max-w-[240px] leading-snug">
            Which plant superpower do you want to learn about?
          </p>
          <div className="flex-1 h-px bg-[var(--surface-border)]" />
        </div>

        <div className="space-y-4">
          {PLANT_SUPERPOWERS.map((sp) => (
            <button
              key={sp.id}
              onClick={() => setSelected(PLANT_SUPERPOWER_DETAILS[sp.id])}
              className="w-full rounded-2xl border border-gray-200 bg-white overflow-hidden flex shadow-sm min-h-[100px] text-left hover:border-[#6A8468] transition"
            >
              <div className="relative w-[38%] min-w-[100px] shrink-0 self-stretch">
                <Image
                  src={sp.image}
                  alt={sp.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 448px) 40vw, 140px"
                  unoptimized
                />
              </div>
              <div className="flex-1 min-w-0 p-4 flex flex-col justify-center">
                <span className="font-semibold text-[#193521]">{sp.title}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
