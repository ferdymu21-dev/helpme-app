"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  useEffect,
  useState,
} from "react";

import type {
  AdminAnalyticsResponse,
  AnalyticsRatingValue,
} from "@/features/admin/analytics/types/admin-analytics.types";

const numberFormatter =
  new Intl.NumberFormat(
    "id-ID",
  );

const decimalFormatter =
  new Intl.NumberFormat(
    "id-ID",
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    },
  );

const generatedAtFormatter =
  new Intl.DateTimeFormat(
    "id-ID",
    {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone:
        "Asia/Jakarta",
    },
  );

function formatNumber(
  value: number,
) {
  return numberFormatter.format(
    value,
  );
}

function formatPercent(
  value: number,
) {
  return `${decimalFormatter.format(
    value,
  )}%`;
}

function formatDecimal(
  value: number,
) {
  return decimalFormatter.format(
    value,
  );
}

function formatGeneratedAt(
  value: string,
) {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "-";
  }

  return `${generatedAtFormatter.format(
    date,
  )} WIB`;
}

function clampPercentage(
  value: number,
) {
  return Math.max(
    0,
    Math.min(
      value,
      100,
    ),
  );
}

async function requestAnalytics(
  signal?: AbortSignal,
) {
  const response =
    await fetch(
      "/api/admin/analytics",
      {
        method: "GET",
        cache: "no-store",
        signal,
      },
    );

  if (!response.ok) {
    throw new Error(
      "Gagal mengambil data analytics.",
    );
  }

  const result =
    (await response.json()) as AdminAnalyticsResponse;

  return result;
}

export default function AnalyticsPage() {
  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  const [
    data,
    setData,
  ] =
    useState<AdminAnalyticsResponse | null>(
      null,
    );

  useEffect(() => {
    const controller =
      new AbortController();

    requestAnalytics(
      controller.signal,
    )
      .then((result) => {
        setData(result);
        setError(null);
      })
      .catch((requestError) => {
        if (
          requestError instanceof
            DOMException &&
          requestError.name ===
            "AbortError"
        ) {
          return;
        }

        console.error(
          "Analytics error:",
          requestError,
        );

        setError(
          requestError instanceof
            Error
            ? requestError.message
            : "Terjadi kesalahan.",
        );
      })
      .finally(() => {
        if (
          !controller.signal
            .aborted
        ) {
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, []);

  async function handleRefresh() {
    try {
      setRefreshing(true);
      setError(null);

      const result =
        await requestAnalytics();

      setData(result);
    } catch (
      requestError
    ) {
      console.error(
        "Analytics refresh error:",
        requestError,
      );

      setError(
        requestError instanceof
          Error
          ? requestError.message
          : "Terjadi kesalahan.",
      );
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }

  if (
    loading &&
    !data
  ) {
    return (
      <AnalyticsLoading />
    );
  }

  if (
    error &&
    !data
  ) {
    return (
      <AnalyticsError
        error={error}
        onRetry={
          handleRefresh
        }
      />
    );
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-slate-500">
          Belum ada data
          analytics.
        </p>
      </div>
    );
  }

  const {
    overview,
    marketplace,
    supplyDemand,
    quality,
    moderation,
    growth,
    categories,
    topHelpers,
    attentionUsers,
  } = data;

  const insights =
    buildInsights(data);

  return (
    <div className="space-y-8">
      {/* HEADER */}

      <header className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600">
            Growth &
            Operations
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
            Analytics HelpMe
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Pantau pertumbuhan,
            kesehatan marketplace,
            kualitas layanan, dan
            area yang membutuhkan
            perhatian admin.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-2.5">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
              Terakhir diperbarui
            </p>

            <p className="mt-0.5 text-xs font-bold text-slate-700">
              {formatGeneratedAt(
                data.generatedAt,
              )}
            </p>
          </div>

          <button
            type="button"
            disabled={
              refreshing
            }
            onClick={() => {
              void handleRefresh();
            }}
            className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {refreshing
              ? "Memperbarui..."
              : "Perbarui Data"}
          </button>
        </div>
      </header>

      {error && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
          <p className="text-sm font-bold text-amber-800">
            Data terakhir tetap
            ditampilkan, tetapi
            pembaruan terbaru gagal.
          </p>

          <p className="mt-1 text-xs text-amber-700">
            {error}
          </p>
        </div>
      )}

      {/* EXECUTIVE OVERVIEW */}

      <section>
        <SectionHeader
          eyebrow="Executive Overview"
          title="Kondisi platform saat ini"
          description="Empat indikator utama untuk membaca kesehatan HelpMe secara cepat."
        />

        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Total Pengguna"
            value={formatNumber(
              overview.totalUsers,
            )}
            description={`${formatPercent(
              overview.verificationRate,
            )} sudah terverifikasi`}
            tone="indigo"
          />

          <MetricCard
            label="Task Marketplace"
            value={formatNumber(
              overview.marketplaceTasks,
            )}
            description={`${formatNumber(
              overview.totalTasks,
            )} termasuk task moderasi`}
            tone="slate"
          />

          <MetricCard
            label="Completion Rate"
            value={formatPercent(
              overview.completionRate,
            )}
            description={`${formatNumber(
              overview.completedTasks,
            )} task berhasil diselesaikan`}
            tone="emerald"
          />

          <MetricCard
            label="Application Coverage"
            value={formatPercent(
              overview.applicationCoverageRate,
            )}
            description="Task yang pernah mendapatkan pelamar"
            tone="blue"
          />
        </div>
      </section>

      {/* GROWTH */}

      <section>
        <SectionHeader
          eyebrow="Growth"
          title="Aktivitas platform"
          description="Pergerakan pengguna baru, task baru, dan laporan selama 7 hari terakhir dalam waktu WIB."
        />

        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-slate-900">
                Tren 7 Hari
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Data harian, bukan
                cumulative total.
              </p>
            </div>

            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
              7 Hari Terakhir
            </span>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart
                data={growth}
                margin={{
                  top: 5,
                  right: 10,
                  left: -20,
                  bottom: 0,
                }}
              >
                <CartesianGrid
                  strokeDasharray="4 4"
                  stroke="#e2e8f0"
                  vertical={false}
                />

                <XAxis
                  dataKey="day"
                  tick={{
                    fill: "#64748b",
                    fontSize: 12,
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  allowDecimals={false}
                  tick={{
                    fill: "#64748b",
                    fontSize: 12,
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  contentStyle={{
                    borderRadius:
                      "12px",
                    border:
                      "1px solid #e2e8f0",
                    boxShadow:
                      "0 10px 25px rgba(15, 23, 42, 0.08)",
                  }}
                />

                <Legend />

                <Line
                  type="monotone"
                  dataKey="users"
                  name="Pengguna"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  dot={{
                    r: 3,
                  }}
                  activeDot={{
                    r: 5,
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="tasks"
                  name="Task"
                  stroke="#0ea5e9"
                  strokeWidth={3}
                  dot={{
                    r: 3,
                  }}
                  activeDot={{
                    r: 5,
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="reports"
                  name="Laporan"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{
                    r: 3,
                  }}
                  activeDot={{
                    r: 5,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* MARKETPLACE HEALTH */}

      <section>
        <SectionHeader
          eyebrow="Marketplace Health"
          title="Kesehatan lifecycle task"
          description="Pantau outcome task dan risiko utama yang memengaruhi keberhasilan marketplace."
        />

        <div className="mt-4 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-black text-slate-900">
              Status Marketplace
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Snapshot seluruh
              lifecycle task HelpMe.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <StatusCard
                label="Terbuka"
                value={
                  marketplace.openTasks
                }
                tone="blue"
              />

              <StatusCard
                label="Dalam Proses"
                value={
                  marketplace.inProgressTasks
                }
                tone="amber"
              />

              <StatusCard
                label="Berhasil"
                value={
                  marketplace.successfulTasks
                }
                tone="emerald"
              />

              <StatusCard
                label="Kedaluwarsa"
                value={
                  marketplace.expiredTasks
                }
                tone="rose"
              />

              <StatusCard
                label="Dibatalkan"
                value={
                  marketplace.cancelledTasks
                }
                tone="amber"
              />

              <StatusCard
                label="Dihapus Admin"
                value={
                  marketplace.removedTasks
                }
                tone="slate"
              />
            </div>

            <div className="mt-5 rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-xs leading-5 text-slate-600">
                <span className="font-black text-slate-900">
                  {formatNumber(
                    marketplace.finalizedTasks,
                  )}
                </span>{" "}
                task sudah mencapai
                outcome final.
                Task yang sedang
                berjalan tidak
                dihitung sebagai
                kegagalan.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-black text-slate-900">
              Health Indicators
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Rasio dihitung dari
              task yang sudah
              mencapai outcome
              final.
            </p>

            <div className="mt-6 space-y-6">
              <ProgressMetric
                label="Completion Rate"
                value={
                  marketplace.completionRate
                }
                tone="emerald"
              />

              <ProgressMetric
                label="Expiry Rate"
                value={
                  marketplace.expiryRate
                }
                tone="rose"
              />

              <ProgressMetric
                label="Cancellation Rate"
                value={
                  marketplace.cancellationRate
                }
                tone="amber"
              />

              <ProgressMetric
                label="Completed Share"
                value={
                  marketplace.completedShare
                }
                tone="blue"
                description="Share task berhasil dari seluruh task marketplace."
              />
            </div>
          </div>
        </div>
      </section>

      {/* DEMAND & SUPPLY */}

      <section>
        <SectionHeader
          eyebrow="Demand & Supply"
          title="Ketersediaan helper"
          description="Lihat apakah demand task memperoleh supply pelamar yang cukup."
        />

        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SmallMetric
            label="Total Aplikasi"
            value={formatNumber(
              supplyDemand.totalApplications,
            )}
            description={`${formatNumber(
              supplyDemand.uniqueApplicants,
            )} helper unik`}
          />

          <SmallMetric
            label="Punya Pelamar"
            value={formatNumber(
              supplyDemand.tasksWithApplications,
            )}
            description={`${formatPercent(
              supplyDemand.applicationCoverageRate,
            )} coverage`}
          />

          <SmallMetric
            label="Tanpa Pelamar"
            value={formatNumber(
              supplyDemand.tasksWithoutApplications,
            )}
            description="Task belum pernah menerima aplikasi"
            warning
          />

          <SmallMetric
            label="Helper Terpilih"
            value={formatNumber(
              supplyDemand.tasksWithSelectedHelper,
            )}
            description={`${formatPercent(
              supplyDemand.helperSelectionRate,
            )} dari task marketplace`}
          />
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-black text-slate-900">
              Marketplace Funnel
              Snapshot
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Snapshot kondisi
              historis marketplace,
              bukan cohort conversion
              funnel.
            </p>

            <div className="mt-6 space-y-5">
              <FunnelRow
                label="Task Marketplace"
                value={
                  marketplace.marketplaceTasks
                }
                percentage={100}
              />

              <FunnelRow
                label="Mendapat Pelamar"
                value={
                  supplyDemand.tasksWithApplications
                }
                percentage={
                  supplyDemand.applicationCoverageRate
                }
              />

              <FunnelRow
                label="Helper Terpilih"
                value={
                  supplyDemand.tasksWithSelectedHelper
                }
                percentage={
                  supplyDemand.helperSelectionRate
                }
              />

              <FunnelRow
                label="Task Berhasil"
                value={
                  marketplace.successfulTasks
                }
                percentage={
                  marketplace.completedShare
                }
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-black text-slate-900">
              Aktivitas Aplikasi
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Gambaran volume dan
              status aplikasi helper.
            </p>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <ApplicationStatus
                label="Pending"
                value={
                  supplyDemand.pendingApplications
                }
                tone="amber"
              />

              <ApplicationStatus
                label="Diterima"
                value={
                  supplyDemand.acceptedApplications
                }
                tone="emerald"
              />

              <ApplicationStatus
                label="Ditolak"
                value={
                  supplyDemand.rejectedApplications
                }
                tone="rose"
              />
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <RatioCard
                label="Rata-rata / Task"
                value={formatDecimal(
                  supplyDemand.averageApplicationsPerTask,
                )}
              />

              <RatioCard
                label="Rata-rata / Covered Task"
                value={formatDecimal(
                  supplyDemand.averageApplicationsPerCoveredTask,
                )}
              />
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY PERFORMANCE */}

      <section>
        <SectionHeader
          eyebrow="Demand Analysis"
          title="Performa kategori"
          description="Kategori dengan demand terbesar beserta coverage pelamar dan keberhasilan penyelesaiannya."
        />

        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {categories.length ===
          0 ? (
            <EmptyState />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-190">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200">
                    <TableHeader>
                      Kategori
                    </TableHeader>

                    <TableHeader align="right">
                      Task
                    </TableHeader>

                    <TableHeader align="right">
                      Aplikasi
                    </TableHeader>

                    <TableHeader align="right">
                      Punya Pelamar
                    </TableHeader>

                    <TableHeader align="right">
                      Coverage
                    </TableHeader>

                    <TableHeader align="right">
                      Completed
                    </TableHeader>

                    <TableHeader align="right">
                      Completion
                    </TableHeader>
                  </tr>
                </thead>

                <tbody>
                  {categories.map(
                    (
                      category,
                      index,
                    ) => (
                      <tr
                        key={
                          category.name
                        }
                        className="border-b border-slate-100 last:border-b-0"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-xs font-black text-indigo-600">
                              {index +
                                1}
                            </span>

                            <p className="font-bold text-slate-800">
                              {
                                category.name
                              }
                            </p>
                          </div>
                        </td>

                        <TableValue>
                          {
                            category.totalTasks
                          }
                        </TableValue>

                        <TableValue>
                          {
                            category.totalApplications
                          }
                        </TableValue>

                        <TableValue>
                          {
                            category.tasksWithApplications
                          }
                        </TableValue>

                        <TableValue>
                          {formatPercent(
                            category.coverageRate,
                          )}
                        </TableValue>

                        <TableValue>
                          {
                            category.completedTasks
                          }
                        </TableValue>

                        <TableValue>
                          {formatPercent(
                            category.completionRate,
                          )}
                        </TableValue>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* TRUST & SAFETY */}

      <section>
        <SectionHeader
          eyebrow="Trust & Safety"
          title="Kualitas dan moderasi"
          description="Pantau pengalaman layanan sekaligus beban operasional keamanan platform."
        />

        <div className="mt-4 grid gap-5 xl:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Kualitas Layanan
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Berdasarkan review
                  pengguna.
                </p>
              </div>

              <div className="text-right">
                <p className="text-3xl font-black text-slate-950">
                  {formatDecimal(
                    quality.averageRating,
                  )}
                </p>

                <p className="text-xs font-bold text-amber-500">
                  / 5.0
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {(
                [
                  5,
                  4,
                  3,
                  2,
                  1,
                ] as const
              ).map(
                (rating) => (
                  <RatingRow
                    key={rating}
                    rating={
                      rating
                    }
                    total={
                      quality
                        .ratingDistribution[
                        rating
                      ]
                    }
                    overall={
                      quality.totalReviews
                    }
                  />
                ),
              )}
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3 border-t border-slate-100 pt-5">
              <MiniStat
                label="Reviews"
                value={
                  quality.totalReviews
                }
              />

              <MiniStat
                label="Task Dinilai"
                value={
                  quality.reviewedTasks
                }
              />

              <MiniStat
                label="Penerima"
                value={
                  quality.uniqueReviewees
                }
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-black text-slate-900">
              Moderation Health
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Status penanganan
              laporan dan akun.
            </p>

            <div className="mt-6">
              <ProgressMetric
                label="Report Handling Rate"
                value={
                  moderation.handlingRate
                }
                tone="emerald"
                description={`${formatNumber(
                  moderation.handledReports,
                )} dari ${formatNumber(
                  moderation.totalReports,
                )} laporan sudah ditangani`}
              />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <ModerationStat
                label="Pending"
                value={
                  moderation.pendingReports
                }
                tone="amber"
              />

              <ModerationStat
                label="Resolved"
                value={
                  moderation.resolvedReports
                }
                tone="emerald"
              />

              <ModerationStat
                label="Suspended"
                value={
                  moderation.suspendedUsers
                }
                tone="amber"
              />

              <ModerationStat
                label="Banned"
                value={
                  moderation.bannedUsers
                }
                tone="rose"
              />
            </div>

            <div className="mt-5 rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-xs leading-5 text-slate-600">
                Verification rate
                pengguna saat ini{" "}
                <span className="font-black text-slate-900">
                  {formatPercent(
                    overview.verificationRate,
                  )}
                </span>
                .
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PEOPLE */}

      <section>
        <SectionHeader
          eyebrow="People"
          title="Kontributor dan akun yang perlu diperhatikan"
          description="Gunakan data ini sebagai sinyal operasional, bukan keputusan moderasi otomatis."
        />

        <div className="mt-4 grid gap-5 xl:grid-cols-2">
          <RankingPanel
            title="Helper dengan Penyelesaian Terbanyak"
            description="Berdasarkan jumlah task berstatus COMPLETED atau REVIEWED."
          >
            {topHelpers.length ===
            0 ? (
              <EmptyState compact />
            ) : (
              topHelpers.map(
                (
                  helper,
                  index,
                ) => (
                  <RankingRow
                    key={
                      helper.id
                    }
                    rank={
                      index + 1
                    }
                    name={
                      helper.fullName
                    }
                    value={`${formatNumber(
                      helper.completedTasks,
                    )} task`}
                    positive
                  />
                ),
              )
            )}
          </RankingPanel>

          <RankingPanel
            title="Perlu Perhatian Admin"
            description="Akun dengan jumlah report terbanyak. Tetap lakukan pemeriksaan manual sebelum tindakan moderasi."
          >
            {attentionUsers.length ===
            0 ? (
              <EmptyState compact />
            ) : (
              attentionUsers.map(
                (
                  user,
                  index,
                ) => (
                  <RankingRow
                    key={
                      user.id
                    }
                    rank={
                      index + 1
                    }
                    name={
                      user.fullName
                    }
                    value={`${formatNumber(
                      user.totalReports,
                    )} report`}
                  />
                ),
              )
            )}
          </RankingPanel>
        </div>
      </section>

      {/* INSIGHTS */}

      <section>
        <SectionHeader
          eyebrow="Actionable Insights"
          title="Apa yang perlu diperhatikan?"
          description="Insight rule-based dari data aktual HelpMe. Tidak ada angka yang dibuat atau diprediksi."
        />

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {insights.map(
            (insight) => (
              <InsightCard
                key={
                  insight.title
                }
                title={
                  insight.title
                }
                description={
                  insight.description
                }
                tone={
                  insight.tone
                }
              />
            ),
          )}
        </div>
      </section>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
        {eyebrow}
      </p>

      <h2 className="mt-1 text-xl font-black text-slate-950">
        {title}
      </h2>

      <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

type Tone =
  | "slate"
  | "indigo"
  | "blue"
  | "emerald"
  | "amber"
  | "rose";

function getToneClasses(
  tone: Tone,
) {
  switch (tone) {
    case "indigo":
      return {
        value:
          "text-indigo-600",
        soft:
          "bg-indigo-50 text-indigo-700",
        bar: "bg-indigo-500",
      };

    case "blue":
      return {
        value:
          "text-sky-600",
        soft:
          "bg-sky-50 text-sky-700",
        bar: "bg-sky-500",
      };

    case "emerald":
      return {
        value:
          "text-emerald-600",
        soft:
          "bg-emerald-50 text-emerald-700",
        bar: "bg-emerald-500",
      };

    case "amber":
      return {
        value:
          "text-amber-600",
        soft:
          "bg-amber-50 text-amber-700",
        bar: "bg-amber-500",
      };

    case "rose":
      return {
        value:
          "text-rose-600",
        soft:
          "bg-rose-50 text-rose-700",
        bar: "bg-rose-500",
      };

    default:
      return {
        value:
          "text-slate-900",
        soft:
          "bg-slate-100 text-slate-700",
        bar: "bg-slate-500",
      };
  }
}

function MetricCard({
  label,
  value,
  description,
  tone,
}: {
  label: string;
  value: string;
  description: string;
  tone: Tone;
}) {
  const colors =
    getToneClasses(tone);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-slate-600">
          {label}
        </p>

        <span
          className={`h-2.5 w-2.5 rounded-full ${colors.bar}`}
        />
      </div>

      <p
        className={`mt-4 text-3xl font-black tracking-tight ${colors.value}`}
      >
        {value}
      </p>

      <p className="mt-2 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </article>
  );
}

function SmallMetric({
  label,
  value,
  description,
  warning = false,
}: {
  label: string;
  value: string;
  description: string;
  warning?: boolean;
}) {
  return (
    <article
      className={`rounded-2xl border p-5 shadow-sm ${
        warning
          ? "border-amber-200 bg-amber-50/60"
          : "border-slate-200 bg-white"
      }`}
    >
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p
        className={`mt-3 text-3xl font-black ${
          warning
            ? "text-amber-700"
            : "text-slate-950"
        }`}
      >
        {value}
      </p>

      <p className="mt-2 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </article>
  );
}

function StatusCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: Tone;
}) {
  const colors =
    getToneClasses(tone);

  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <p className="text-xs font-bold text-slate-500">
        {label}
      </p>

      <p
        className={`mt-2 text-2xl font-black ${colors.value}`}
      >
        {formatNumber(
          value,
        )}
      </p>
    </div>
  );
}

function ProgressMetric({
  label,
  value,
  tone,
  description,
}: {
  label: string;
  value: number;
  tone: Tone;
  description?: string;
}) {
  const colors =
    getToneClasses(tone);

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-bold text-slate-700">
          {label}
        </p>

        <p
          className={`text-sm font-black ${colors.value}`}
        >
          {formatPercent(
            value,
          )}
        </p>
      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${colors.bar}`}
          style={{
            width: `${clampPercentage(
              value,
            )}%`,
          }}
        />
      </div>

      {description && (
        <p className="mt-2 text-xs leading-5 text-slate-400">
          {description}
        </p>
      )}
    </div>
  );
}

function FunnelRow({
  label,
  value,
  percentage,
}: {
  label: string;
  value: number;
  percentage: number;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4">
        <p className="text-sm font-bold text-slate-700">
          {label}
        </p>

        <div className="text-right">
          <span className="text-sm font-black text-slate-900">
            {formatNumber(
              value,
            )}
          </span>

          <span className="ml-2 text-xs font-bold text-slate-400">
            {formatPercent(
              percentage,
            )}
          </span>
        </div>
      </div>

      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-indigo-500"
          style={{
            width: `${clampPercentage(
              percentage,
            )}%`,
          }}
        />
      </div>
    </div>
  );
}

function ApplicationStatus({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: Tone;
}) {
  const colors =
    getToneClasses(tone);

  return (
    <div
      className={`rounded-xl p-4 text-center ${colors.soft}`}
    >
      <p className="text-2xl font-black">
        {formatNumber(
          value,
        )}
      </p>

      <p className="mt-1 text-xs font-bold">
        {label}
      </p>
    </div>
  );
}

function RatioCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <p className="text-xs font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-black text-slate-900">
        {value}
      </p>
    </div>
  );
}

function RatingRow({
  rating,
  total,
  overall,
}: {
  rating: AnalyticsRatingValue;
  total: number;
  overall: number;
}) {
  const percentage =
    overall > 0
      ? (total /
          overall) *
        100
      : 0;

  return (
    <div className="grid grid-cols-[48px_1fr_38px] items-center gap-3">
      <p className="text-xs font-bold text-slate-600">
        {rating} ★
      </p>

      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-amber-400"
          style={{
            width: `${clampPercentage(
              percentage,
            )}%`,
          }}
        />
      </div>

      <p className="text-right text-xs font-black text-slate-700">
        {total}
      </p>
    </div>
  );
}

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div>
      <p className="text-xl font-black text-slate-900">
        {formatNumber(
          value,
        )}
      </p>

      <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>
    </div>
  );
}

function ModerationStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: Tone;
}) {
  const colors =
    getToneClasses(tone);

  return (
    <div
      className={`rounded-xl p-3 ${colors.soft}`}
    >
      <p className="text-xl font-black">
        {formatNumber(
          value,
        )}
      </p>

      <p className="mt-1 text-[11px] font-bold">
        {label}
      </p>
    </div>
  );
}

function TableHeader({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className={`px-5 py-3 text-xs font-black uppercase tracking-wide text-slate-400 ${
        align === "right"
          ? "text-right"
          : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

function TableValue({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <td className="px-5 py-4 text-right text-sm font-bold text-slate-700">
      {children}
    </td>
  );
}

function RankingPanel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-base font-black text-slate-900">
        {title}
      </h3>

      <p className="mt-1 text-xs leading-5 text-slate-500">
        {description}
      </p>

      <div className="mt-5 space-y-2">
        {children}
      </div>
    </div>
  );
}

function RankingRow({
  rank,
  name,
  value,
  positive = false,
}: {
  rank: number;
  name: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-black text-slate-600">
          {rank}
        </span>

        <p className="truncate text-sm font-bold text-slate-800">
          {name}
        </p>
      </div>

      <span
        className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ${
          positive
            ? "bg-emerald-50 text-emerald-700"
            : "bg-rose-50 text-rose-700"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

type InsightTone =
  | "critical"
  | "warning"
  | "positive"
  | "info";

interface Insight {
  title: string;
  description: string;
  tone: InsightTone;
}

function buildInsights(
  data: AdminAnalyticsResponse,
): Insight[] {
  const insights: Insight[] =
    [];

  if (
    data.marketplace
      .expiryRate >= 40
  ) {
    insights.push({
      title:
        "Expiry task perlu menjadi prioritas",
      description: `${formatPercent(
        data.marketplace
          .expiryRate,
      )} dari task yang sudah mencapai outcome final berakhir kedaluwarsa (${formatNumber(
        data.marketplace
          .expiredTasks,
      )} task).`,
      tone: "critical",
    });
  } else {
    insights.push({
      title:
        "Expiry task relatif terkendali",
      description: `Expiry rate saat ini ${formatPercent(
        data.marketplace
          .expiryRate,
      )}.`,
      tone: "positive",
    });
  }

  if (
    data.supplyDemand
      .applicationCoverageRate <
    70
  ) {
    insights.push({
      title:
        "Coverage pelamar masih dapat ditingkatkan",
      description: `${formatNumber(
        data.supplyDemand
          .tasksWithoutApplications,
      )} task belum pernah mendapatkan pelamar. Coverage saat ini ${formatPercent(
        data.supplyDemand
          .applicationCoverageRate,
      )}.`,
      tone: "warning",
    });
  } else {
    insights.push({
      title:
        "Coverage pelamar cukup kuat",
      description: `${formatPercent(
        data.supplyDemand
          .applicationCoverageRate,
      )} task sudah mendapatkan minimal satu pelamar.`,
      tone: "positive",
    });
  }

  if (
    data.moderation
      .pendingReports > 0
  ) {
    insights.push({
      title:
        "Ada laporan menunggu tindakan",
      description: `${formatNumber(
        data.moderation
          .pendingReports,
      )} laporan masih berstatus pending. Handling rate saat ini ${formatPercent(
        data.moderation
          .handlingRate,
      )}.`,
      tone: "warning",
    });
  } else {
    insights.push({
      title:
        "Tidak ada report pending",
      description:
        "Seluruh laporan saat ini sudah masuk proses penanganan atau memiliki outcome.",
      tone: "positive",
    });
  }

  if (
    data.quality
      .totalReviews > 0
  ) {
    insights.push({
      title:
        "Kualitas layanan mendapat sinyal positif",
      description: `Rating rata-rata platform ${formatDecimal(
        data.quality
          .averageRating,
      )}/5 dari ${formatNumber(
        data.quality
          .totalReviews,
      )} review.`,
      tone:
        data.quality
          .averageRating >=
        4
          ? "positive"
          : "warning",
    });
  }

  if (
    data.overview
      .verificationRate <
    50
  ) {
    insights.push({
      title:
        "Adopsi verifikasi masih rendah",
      description: `Baru ${formatPercent(
        data.overview
          .verificationRate,
      )} pengguna yang terverifikasi (${formatNumber(
        data.overview
          .verifiedUsers,
      )} dari ${formatNumber(
        data.overview
          .totalUsers,
      )}).`,
      tone: "info",
    });
  }

  const leadingCategory =
    data.categories[0];

  if (leadingCategory) {
    insights.push({
      title: `${leadingCategory.name} menjadi kategori dengan demand terbesar`,
      description: `${formatNumber(
        leadingCategory.totalTasks,
      )} task dengan coverage pelamar ${formatPercent(
        leadingCategory.coverageRate,
      )} dan completion rate ${formatPercent(
        leadingCategory.completionRate,
      )}.`,
      tone: "info",
    });
  }

  return insights.slice(
    0,
    6,
  );
}

function InsightCard({
  title,
  description,
  tone,
}: Insight) {
  const classes =
    tone === "critical"
      ? "border-rose-200 bg-rose-50"
      : tone ===
          "warning"
        ? "border-amber-200 bg-amber-50"
        : tone ===
            "positive"
          ? "border-emerald-200 bg-emerald-50"
          : "border-indigo-200 bg-indigo-50";

  const dot =
    tone === "critical"
      ? "bg-rose-500"
      : tone ===
          "warning"
        ? "bg-amber-500"
        : tone ===
            "positive"
          ? "bg-emerald-500"
          : "bg-indigo-500";

  return (
    <article
      className={`rounded-2xl border p-5 ${classes}`}
    >
      <div className="flex gap-3">
        <span
          className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${dot}`}
        />

        <div>
          <h3 className="text-sm font-black text-slate-900">
            {title}
          </h3>

          <p className="mt-1 text-xs leading-5 text-slate-600">
            {description}
          </p>
        </div>
      </div>
    </article>
  );
}

function EmptyState({
  compact = false,
}: {
  compact?: boolean;
}) {
  return (
    <div
      className={
        compact
          ? "py-4 text-center"
          : "p-8 text-center"
      }
    >
      <p className="text-sm font-medium text-slate-500">
        Belum ada data.
      </p>
    </div>
  );
}

function AnalyticsLoading() {
  return (
    <div className="space-y-6">
      <div className="h-24 animate-pulse rounded-2xl bg-white" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          1,
          2,
          3,
          4,
        ].map(
          (item) => (
            <div
              key={item}
              className="h-36 animate-pulse rounded-2xl bg-white"
            />
          ),
        )}
      </div>

      <div className="h-96 animate-pulse rounded-2xl bg-white" />
    </div>
  );
}

function AnalyticsError({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8">
      <h1 className="text-xl font-black text-rose-800">
        Gagal memuat analytics
      </h1>

      <p className="mt-2 text-sm text-rose-700">
        {error}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-5 rounded-xl bg-rose-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-rose-700"
      >
        Coba Lagi
      </button>
    </div>
  );
}