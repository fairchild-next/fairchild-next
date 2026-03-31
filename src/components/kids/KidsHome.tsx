"use client";

import Image from "next/image";
import Link from "next/link";
import { MapTrifold, GameController, QrCode, Medal } from "@phosphor-icons/react";

const KIDS_IMAGES = {
  welcome: "/kids/kids-hero-banner.png",
  explore: "/kids/explore-the-garden.png",
  gardenQuest: "/kids/garden-quest-home.png",
  scanToLearn: "/kids/Untitled_design-21-524f4fe7-cdbe-4f93-9b5c-fc4545f5009e.png",
  myDiscoveries: "/kids/Untitled_design-20-075be45c-685f-426d-9c02-8aa4316ce1fe.png",
};

export default function KidsHome() {
  return (
    <div className="min-h-screen bg-[#F3EFEE]">
      {/* Welcome Explorer banner */}
      <div className="relative overflow-hidden">
        <div className="relative h-[12rem] min-h-[180px]">
          <Image
            src={KIDS_IMAGES.welcome}
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center"
            priority
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-2xl font-bold text-white drop-shadow-lg text-center px-4">
            Welcome Explorer!
          </h1>
        </div>
      </div>

      {/* 4 cards grid - fixed image height for cohesive layout */}
      <div className="px-6 mt-12 grid grid-cols-2 gap-4 pb-24">
        <Link
          href="/map"
          className="flex flex-col rounded-2xl overflow-hidden border-2 border-[#193521] bg-white hover:border-[var(--primary)] transition"
        >
          <div className="relative h-[90px] shrink-0">
            <Image
              src={KIDS_IMAGES.explore}
              alt=""
              fill
              className="object-cover object-center"
              sizes="(max-width: 448px) 50vw, 224px"
            />
          </div>
          <div className="p-3 flex items-center gap-2 bg-white min-h-[52px]">
            <MapTrifold size={24} weight="regular" className="text-[#193521] shrink-0" />
            <span className="font-semibold text-[#193521] text-sm leading-tight line-clamp-2">Explore the Garden</span>
          </div>
        </Link>

        <Link
          href="/kids/garden-quest"
          className="flex flex-col rounded-2xl overflow-hidden border-2 border-[#6A8468] bg-[#193521] hover:opacity-95 transition"
        >
          <div className="relative h-[90px] shrink-0">
            <Image
              src={KIDS_IMAGES.gardenQuest}
              alt=""
              fill
              className="object-cover object-center"
              sizes="(max-width: 448px) 50vw, 224px"
            />
          </div>
          <div className="p-3 flex items-center gap-2 bg-[#193521] min-h-[52px]">
            <GameController size={24} weight="regular" className="text-white shrink-0" />
            <span className="font-semibold text-white text-sm">Garden Quest</span>
          </div>
        </Link>

        <Link
          href="/learn/scan"
          className="flex flex-col rounded-2xl overflow-hidden border-2 border-[#6A8468] bg-[#193521] hover:opacity-95 transition"
        >
          <div className="relative h-[90px] shrink-0 bg-[#193521]">
            <Image
              src={KIDS_IMAGES.scanToLearn}
              alt=""
              fill
              className="object-cover object-center"
              sizes="(max-width: 448px) 50vw, 224px"
            />
          </div>
          <div className="p-3 flex items-center gap-2 bg-[#193521] min-h-[52px]">
            <QrCode size={24} weight="regular" className="text-white shrink-0" />
            <span className="font-semibold text-white text-sm">Scan to Learn</span>
          </div>
        </Link>

        <Link
          href="/badges?tab=discoveries"
          className="flex flex-col rounded-2xl overflow-hidden border-2 border-[#193521] bg-white hover:border-[var(--primary)] transition"
        >
          <div className="relative h-[90px] shrink-0">
            <Image
              src={KIDS_IMAGES.myDiscoveries}
              alt=""
              fill
              className="object-cover object-center"
              sizes="(max-width: 448px) 50vw, 224px"
            />
          </div>
          <div className="p-3 flex items-center gap-2 bg-white min-h-[52px]">
            <Medal size={24} weight="regular" className="text-[#193521] shrink-0" />
            <span className="font-semibold text-[#193521] text-sm leading-tight line-clamp-2">My Discoveries</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
