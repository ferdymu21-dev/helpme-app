"use client";

import {
  CampaignStatus,
} from "../constants/campaign-status";

import {
  CampaignStatusConfig,
} from "../constants/campaign-status-config";

import {
  CampaignTarget,
} from "../constants/campaign-target";

import {
  formatCampaignTarget,
} from "../utils/campaign-display";

interface Props {
  search: string;

  status: string;

  target: string;

  totalCount: number;

  filteredCount: number;

  onSearchChange(
    value: string,
  ): void;

  onStatusChange(
    value: string,
  ): void;

  onTargetChange(
    value: string,
  ): void;

  onReset(): void;
}

export default function CampaignToolbar({
  search,
  status,
  target,
  totalCount,
  filteredCount,
  onSearchChange,
  onStatusChange,
  onTargetChange,
  onReset,
}: Props) {
  const hasFilter =
    search.length > 0 ||
    status.length > 0 ||
    target.length > 0;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 xl:grid-cols-[minmax(280px,1fr)_190px_220px]">
        <div>
          <label
            htmlFor="campaign-search"
            className="sr-only"
          >
            Cari campaign
          </label>

          <input
            id="campaign-search"
            type="search"
            value={search}
            placeholder="Cari judul atau pesan campaign..."
            onChange={(
              event,
            ) =>
              onSearchChange(
                event.target
                  .value,
              )
            }
            className="
              h-12
              w-full
              rounded-xl
              border
              border-slate-200
              bg-slate-50
              px-4
              text-sm
              text-slate-900
              outline-none
              transition
              placeholder:text-slate-400
              focus:border-indigo-400
              focus:bg-white
              focus:ring-4
              focus:ring-indigo-50
            "
          />
        </div>

        <select
          value={status}
          onChange={(
            event,
          ) =>
            onStatusChange(
              event.target
                .value,
            )
          }
          className="
            h-12
            rounded-xl
            border
            border-slate-200
            bg-white
            px-4
            text-sm
            font-medium
            text-slate-700
            outline-none
            focus:border-indigo-400
            focus:ring-4
            focus:ring-indigo-50
          "
        >
          <option value="">
            Semua Status
          </option>

          {Object.values(
            CampaignStatus,
          ).map((item) => (
            <option
              key={item}
              value={item}
            >
              {
                CampaignStatusConfig[
                  item
                ].label
              }
            </option>
          ))}
        </select>

        <select
          value={target}
          onChange={(
            event,
          ) =>
            onTargetChange(
              event.target
                .value,
            )
          }
          className="
            h-12
            rounded-xl
            border
            border-slate-200
            bg-white
            px-4
            text-sm
            font-medium
            text-slate-700
            outline-none
            focus:border-indigo-400
            focus:ring-4
            focus:ring-indigo-50
          "
        >
          <option value="">
            Semua Target
          </option>

          {Object.values(
            CampaignTarget,
          ).map((item) => (
            <option
              key={item}
              value={item}
            >
              {formatCampaignTarget(
                item,
              )}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          Menampilkan{" "}
          <span className="font-bold text-slate-900">
            {filteredCount}
          </span>{" "}
          dari{" "}
          <span className="font-bold text-slate-900">
            {totalCount}
          </span>{" "}
          campaign
        </p>

        {hasFilter && (
          <button
            type="button"
            onClick={onReset}
            className="w-fit text-sm font-bold text-indigo-600 transition hover:text-indigo-700"
          >
            Reset filter
          </button>
        )}
      </div>
    </section>
  );
}