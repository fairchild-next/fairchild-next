"use client";

import Image from "next/image";
import Link from "next/link";
import { GameController } from "@phosphor-icons/react";

const KIDS_IMAGES = {
  learnBanner: "/kids/Untitled_design-28-98162183-65dd-4067-8723-89a3cd29dd57.png",
  plantSuperpowers: "/kids/plant-superpowers.png",
  gardenQuest: "/kids/garden-quest.png",
  scanToLearn: "/kids/scan-to-learn.png",
  quizTime: "/kids/quiz-time.png",
};

export default function KidsLearn() {
  return (
    <div className="min-h-screen bg-[#F3EFEE]">
      {/* Learn banner */}
      <div className="relative overflow-hidden">
        <div className="relative h-[10rem] min-h-[180px]">
          <Image
            src={KIDS_IMAGES.learnBanner}
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-black/25" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-2xl font-bold text-white drop-shadow-lg">Learn</h1>
        </div>
      </div>

      {/* 4 cards grid */}
      <div className="px-6 mt-12 grid grid-cols-2 gap-4 pb-24">
        <Link
          href="/kids/plant-superpowers"
          className="flex flex-col rounded-2xl overflow-hidden border-2 border-[#193521] bg-[#193521] hover:opacity-95 transition min-h-[140px]"
        >
          <div className="relative flex-1 min-h-[90px]">
            <Image
              src={KIDS_IMAGES.plantSuperpowers}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 448px) 50vw, 224px"
            />
          </div>
          <div className="p-3 bg-[#193521]">
            <span className="font-semibold text-white text-sm">Plant Superpowers</span>
          </div>
        </Link>

        <Link
          href="/kids/garden-quest"
          className="flex flex-col rounded-2xl overflow-hidden border-2 border-[#193521] bg-[#193521] hover:opacity-95 transition min-h-[140px]"
        >
          <div className="relative flex-1 min-h-[90px]">
            <Image
              src={KIDS_IMAGES.gardenQuest}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 448px) 50vw, 224px"
            />
          </div>
          <div className="p-3 bg-[#193521]">
            <span className="font-semibold text-white text-sm">Garden Quest</span>
          </div>
        </Link>

        <Link
          href="/learn/scan"
          className="flex flex-col rounded-2xl overflow-hidden border-2 border-[#193521] bg-[#193521] hover:opacity-95 transition min-h-[140px]"
        >
          <div className="relative flex-1 min-h-[90px]">
            <Image
              src={KIDS_IMAGES.scanToLearn}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 448px) 50vw, 224px"
            />
          </div>
          <div className="p-3 bg-[#193521]">
            <span className="font-semibold text-white text-sm">Scan to Learn</span>
          </div>
        </Link>

        <Link
          href="/learn/quiz/play?quiz=garden-kids"
          className="flex flex-col rounded-2xl overflow-hidden border-2 border-[var(--surface-border)] bg-white hover:border-[var(--primary)] transition min-h-[140px]"
        >
          <div className="relative flex-1 min-h-[90px]">
            <Image
              src={KIDS_IMAGES.quizTime}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 448px) 50vw, 224px"
            />
          </div>
          <div className="p-3 flex items-center gap-2 bg-white">
            <GameController size={24} weight="regular" className="text-[#193521] shrink-0" />
            <span className="font-semibold text-[#193521] text-sm">Quiz Time!</span>
          </div>
        </Link>
      </div>

      <div className="px-6 py-4 text-center">
        <Link
          href="/kids/badges"
          className="text-[var(--primary)] font-medium underline text-sm"
        >
          Go to my Badges!
        </Link>
      </div>
    </div>
  );
}
