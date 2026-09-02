"use client";

import Link from "next/link";

import {
  useMemo,
  useState,
} from "react";

import {
  CampaignStatus,
} from "../constants/campaign-status";

import type {
  NotificationCampaign,
} from "../types/campaign.types";

import CampaignToolbar from "../components/CampaignToolbar";

import CampaignList from "../components/CampaignList";

import {
  formatCampaignPercent,
} from "../utils/campaign-display";

interface Props {
  campaigns: NotificationCampaign[];
}

export default function CampaignManagementPage({
  campaigns,
}: Props) {
  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [target, setTarget] =
    useState("");

  const summary = useMemo(() => {
    const scheduled =
      campaigns.filter(
        (campaign) =>
          campaign.status ===
          CampaignStatus.SCHEDULED,
      ).length;

    const totalSent =
      campaigns.reduce(
        (total, campaign) =>
          total +
          campaign.total_sent,
        0,
      );

    const totalOpened =
      campaigns.reduce(
        (total, campaign) =>
          total +
          campaign.total_opened,
        0,
      );

    const openRate =
      totalSent > 0
        ? (totalOpened /
            totalSent) *
          100
        : 0;

    return {
      total:
        campaigns.length,

      scheduled,

      totalSent,

      openRate,
    };
  }, [campaigns]);

  const filteredCampaigns =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      return campaigns.filter(
        (campaign) => {
          const matchSearch =
            normalizedSearch
              .length === 0 ||
            campaign.title
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            campaign.message
              .toLowerCase()
              .includes(
                normalizedSearch,
              );

          const matchStatus =
            !status ||
            campaign.status ===
              status;

          const matchTarget =
            !target ||
            campaign.target_type ===
              target;

          return (
            matchSearch &&
            matchStatus &&
            matchTarget
          );
        },
      );
    }, [
      campaigns,
      search,
      status,
      target,
    ]);

  function resetFilters() {
    setSearch("");
    setStatus("");
    setTarget("");
  }

  return (
    <main className="space-y-6 p-2">
      {/* HEADER */}

      <section className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
            Communication
          </p>

          <h1 className="text-3xl font-black tracking-tight text-slate-950">
            Manajemen Campaign
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Buat, jadwalkan, dan
            pantau komunikasi
            broadcast kepada
            pengguna HelpMe.
          </p>
        </div>

        <Link
          href="/admin/campaigns/new"
          className="
            inline-flex
            w-fit
            items-center
            justify-center
            rounded-xl
            bg-indigo-600
            px-5
            py-3
            text-sm
            font-bold
            text-white
            shadow-sm
            transition
            hover:bg-indigo-700
            focus:outline-none
            focus:ring-4
            focus:ring-indigo-100
          "
        >
          + Buat Campaign
        </Link>
      </section>

      {/* SUMMARY */}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Total Campaign
          </p>

          <div className="mt-3 flex items-end justify-between gap-4">
            <p className="text-3xl font-black tracking-tight text-slate-950">
              {summary.total.toLocaleString(
                "id-ID",
              )}
            </p>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              Semua data
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Campaign Terjadwal
          </p>

          <div className="mt-3 flex items-end justify-between gap-4">
            <p className="text-3xl font-black tracking-tight text-slate-950">
              {summary.scheduled.toLocaleString(
                "id-ID",
              )}
            </p>

            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              Menunggu publikasi
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Total Terkirim
          </p>

          <div className="mt-3">
            <p className="text-3xl font-black tracking-tight text-slate-950">
              {summary.totalSent.toLocaleString(
                "id-ID",
              )}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Akumulasi seluruh
              penerima
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Open Rate
          </p>

          <div className="mt-3">
            <p className="text-3xl font-black tracking-tight text-slate-950">
              {formatCampaignPercent(
                summary.openRate,
              )}
              %
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Rasio campaign
              yang dibuka
            </p>
          </div>
        </div>
      </section>

      {/* FILTER */}

      <CampaignToolbar
        search={search}
        status={status}
        target={target}
        totalCount={
          campaigns.length
        }
        filteredCount={
          filteredCampaigns.length
        }
        onSearchChange={
          setSearch
        }
        onStatusChange={
          setStatus
        }
        onTargetChange={
          setTarget
        }
        onReset={
          resetFilters
        }
      />

      {/* CONTENT */}

      {campaigns.length === 0 ? (
        <CampaignList
          campaigns={[]}
        />
      ) : filteredCampaigns.length ===
        0 ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <h2 className="text-base font-black text-slate-900">
            Campaign tidak
            ditemukan
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Coba ubah kata
            pencarian atau filter
            yang digunakan.
          </p>

          <button
            type="button"
            onClick={
              resetFilters
            }
            className="mt-5 text-sm font-bold text-indigo-600 transition hover:text-indigo-700"
          >
            Reset semua filter
          </button>
        </section>
      ) : (
        <CampaignList
          campaigns={
            filteredCampaigns
          }
        />
      )}
    </main>
  );
}