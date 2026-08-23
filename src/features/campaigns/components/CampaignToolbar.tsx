"use client";

import Link from "next/link";

import { CampaignStatus } from "../constants/campaign-status";

import { CampaignTarget } from "../constants/campaign-target";

interface Props {
  search: string;

  status: string;

  target: string;

  onSearchChange(value: string): void;

  onStatusChange(value: string): void;

  onTargetChange(value: string): void;
}

export default function CampaignToolbar({
  search,

  status,

  target,

  onSearchChange,

  onStatusChange,

  onTargetChange,
}: Props) {
  return (
    <div
      className="
                mb-8
                flex
                flex-col
                gap-4
                rounded-3xl
                border
                border-slate-200
                bg-white
                p-5
                lg:flex-row
                lg:items-center
            "
    >
      <input
        type="text"
        value={search}
        placeholder="Cari campaign..."
        onChange={(event) => onSearchChange(event.target.value)}
        className="
                    h-11
                    flex-1
                    rounded-xl
                    border
                    border-slate-300
                    px-4
                    text-sm
                    outline-none
                    transition
                    focus:border-indigo-500
                "
      />

      <select
        value={status}
        onChange={(event) => onStatusChange(event.target.value)}
        className="
                    h-11
                    rounded-xl
                    border
                    border-slate-300
                    px-4
                    text-sm
                "
      >
        <option value="">Semua Status</option>

        {Object.values(CampaignStatus).map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>

      <select
        value={target}
        onChange={(event) => onTargetChange(event.target.value)}
        className="
                    h-11
                    rounded-xl
                    border
                    border-slate-300
                    px-4
                    text-sm
                "
      >
        <option value="">Semua Target</option>

        {Object.values(CampaignTarget).map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>

      <Link
        href="/admin/campaigns/new"
        className="
                    inline-flex
                    h-11
                    items-center
                    justify-center
                    rounded-xl
                    bg-indigo-600
                    px-5
                    text-sm
                    font-semibold
                    text-white
                    transition
                    hover:bg-indigo-700
                "
      >
        + Create Campaign
      </Link>
    </div>
  );
}