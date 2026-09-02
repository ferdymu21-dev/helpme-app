import "server-only";

import { requireAdmin } from "@/features/admin/server/requireAdmin";

import {
  getAdminAnalyticsRepository,
  type AnalyticsTaskRow,
} from "../repositories/getAdminAnalytics.repository";

import type {
  AdminAnalyticsCategory,
  AdminAnalyticsGrowthPoint,
  AdminAnalyticsResponse,
  AdminAnalyticsTopHelper,
  AdminAnalyticsAttentionUser,
  AnalyticsRatingValue,
} from "../types/admin-analytics.types";

const JAKARTA_TIME_ZONE =
  "Asia/Jakarta";

const SUCCESSFUL_TASK_STATUSES =
  new Set([
    "COMPLETED",
    "REVIEWED",
  ]);

const FINALIZED_TASK_STATUSES =
  new Set([
    "COMPLETED",
    "REVIEWED",
    "CANCELLED",
    "EXPIRED",
  ]);

function percentage(
  value: number,
  total: number,
) {
  if (total <= 0) {
    return 0;
  }

  return Math.round(
    (value / total) *
      1000,
  ) / 10;
}

function decimal(
  value: number,
  precision = 2,
) {
  const multiplier =
    10 ** precision;

  return (
    Math.round(
      value * multiplier,
    ) / multiplier
  );
}

function countTaskStatus(
  tasks: AnalyticsTaskRow[],
  status: string,
) {
  return tasks.filter(
    (task) =>
      task.status === status,
  ).length;
}

function isRatingValue(
  value: number,
): value is AnalyticsRatingValue {
  return (
    value === 1 ||
    value === 2 ||
    value === 3 ||
    value === 4 ||
    value === 5
  );
}

const jakartaDateFormatter =
  new Intl.DateTimeFormat(
    "en-US",
    {
      timeZone:
        JAKARTA_TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    },
  );

function getJakartaDateParts(
  value: Date,
) {
  const parts =
    jakartaDateFormatter.formatToParts(
      value,
    );

  const year =
    parts.find(
      (part) =>
        part.type === "year",
    )?.value;

  const month =
    parts.find(
      (part) =>
        part.type ===
        "month",
    )?.value;

  const day =
    parts.find(
      (part) =>
        part.type === "day",
    )?.value;

  if (
    !year ||
    !month ||
    !day
  ) {
    return null;
  }

  return {
    year,
    month,
    day,
  };
}

function getJakartaDateKey(
  value: string | null,
) {
  if (!value) {
    return null;
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return null;
  }

  const parts =
    getJakartaDateParts(
      date,
    );

  if (!parts) {
    return null;
  }

  return `${parts.year}-${parts.month}-${parts.day}`;
}

function getLast7JakartaDays() {
  const now =
    new Date();

  const currentParts =
    getJakartaDateParts(
      now,
    );

  if (!currentParts) {
    return [];
  }

  const baseDate =
    new Date(
      Date.UTC(
        Number(
          currentParts.year,
        ),
        Number(
          currentParts.month,
        ) - 1,
        Number(
          currentParts.day,
        ),
        12,
        0,
        0,
      ),
    );

  const days: {
    date: string;
    day: string;
  }[] = [];

  for (
    let offset = 6;
    offset >= 0;
    offset -= 1
  ) {
    const date =
      new Date(
        baseDate.getTime() -
          offset *
            24 *
            60 *
            60 *
            1000,
      );

    const year =
      String(
        date.getUTCFullYear(),
      );

    const month =
      String(
        date.getUTCMonth() +
          1,
      ).padStart(
        2,
        "0",
      );

    const day =
      String(
        date.getUTCDate(),
      ).padStart(
        2,
        "0",
      );

    days.push({
      date: `${year}-${month}-${day}`,
      day: `${day}/${month}`,
    });
  }

  return days;
}

function incrementDateCount(
  map: Map<string, number>,
  date: string | null,
) {
  if (!date) {
    return;
  }

  map.set(
    date,
    (map.get(date) ??
      0) + 1,
  );
}

export async function getAdminAnalyticsService(): Promise<AdminAnalyticsResponse> {
  await requireAdmin();

  const {
    users,
    tasks,
    applications,
    reviews,
    reports,
  } =
    await getAdminAnalyticsRepository();

  /*
   * ======================================================
   * USERS
   * ======================================================
   */

  const totalUsers =
    users.length;

  const verifiedUsers =
    users.filter(
      (user) =>
        user.verification_status ===
        "VERIFIED",
    ).length;

  const suspendedUsers =
    users.filter(
      (user) =>
        user.is_suspended ===
        true,
    ).length;

  const bannedUsers =
    users.filter(
      (user) =>
        user.is_banned ===
        true,
    ).length;

  const usersById =
    new Map(
      users.map(
        (user) => [
          user.id,
          user.full_name?.trim() ||
            "Tanpa nama",
        ],
      ),
    );

  /*
   * ======================================================
   * MARKETPLACE TASKS
   * ======================================================
   *
   * REMOVED tidak dipakai untuk denominator marketplace
   * karena itu merupakan moderation outcome.
   */

  const totalTasks =
    tasks.length;

  const marketplaceTasks =
    tasks.filter(
      (task) =>
        task.status !==
        "REMOVED",
    );

  const marketplaceTaskIds =
    new Set(
      marketplaceTasks.map(
        (task) => task.id,
      ),
    );

  const openTasks =
    countTaskStatus(
      tasks,
      "OPEN",
    );

  const acceptedTasks =
    countTaskStatus(
      tasks,
      "ACCEPTED",
    );

  const onProgressTasks =
    countTaskStatus(
      tasks,
      "ON_PROGRESS",
    );

  const waitingConfirmationTasks =
    countTaskStatus(
      tasks,
      "WAITING_CONFIRMATION",
    );

  const completedTasks =
    countTaskStatus(
      tasks,
      "COMPLETED",
    );

  const reviewedTasks =
    countTaskStatus(
      tasks,
      "REVIEWED",
    );

  const cancelledTasks =
    countTaskStatus(
      tasks,
      "CANCELLED",
    );

  const expiredTasks =
    countTaskStatus(
      tasks,
      "EXPIRED",
    );

  const removedTasks =
    countTaskStatus(
      tasks,
      "REMOVED",
    );

  const inProgressTasks =
    acceptedTasks +
    onProgressTasks +
    waitingConfirmationTasks;

  const successfulTasks =
    completedTasks +
    reviewedTasks;

  const finalizedTasks =
    marketplaceTasks.filter(
      (task) =>
        task.status !== null &&
        FINALIZED_TASK_STATUSES.has(
          task.status,
        ),
    ).length;

  const completionRate =
    percentage(
      successfulTasks,
      finalizedTasks,
    );

  const expiryRate =
    percentage(
      expiredTasks,
      finalizedTasks,
    );

  const cancellationRate =
    percentage(
      cancelledTasks,
      finalizedTasks,
    );

  const completedShare =
    percentage(
      successfulTasks,
      marketplaceTasks.length,
    );

  /*
   * ======================================================
   * APPLICATIONS / SUPPLY
   * ======================================================
   */

  const marketplaceApplications =
    applications.filter(
      (application) =>
        marketplaceTaskIds.has(
          application.task_id,
        ),
    );

  const totalApplications =
    marketplaceApplications.length;

  const pendingApplications =
    marketplaceApplications.filter(
      (application) =>
        application.status ===
        "PENDING",
    ).length;

  const acceptedApplications =
    marketplaceApplications.filter(
      (application) =>
        application.status ===
        "ACCEPTED",
    ).length;

  const rejectedApplications =
    marketplaceApplications.filter(
      (application) =>
        application.status ===
        "REJECTED",
    ).length;

  const taskIdsWithApplications =
    new Set(
      marketplaceApplications.map(
        (application) =>
          application.task_id,
      ),
    );

  const tasksWithApplications =
    taskIdsWithApplications.size;

  const tasksWithoutApplications =
    marketplaceTasks.length -
    tasksWithApplications;

  const uniqueApplicants =
    new Set(
      marketplaceApplications.map(
        (application) =>
          application.helper_id,
      ),
    ).size;

  const tasksWithSelectedHelper =
    marketplaceTasks.filter(
      (task) =>
        task.selected_helper_id !==
        null,
    ).length;

  const tasksWithoutSelectedHelper =
    marketplaceTasks.length -
    tasksWithSelectedHelper;

  const applicationCoverageRate =
    percentage(
      tasksWithApplications,
      marketplaceTasks.length,
    );

  const helperSelectionRate =
    percentage(
      tasksWithSelectedHelper,
      marketplaceTasks.length,
    );

  const averageApplicationsPerTask =
    marketplaceTasks.length >
    0
      ? decimal(
          totalApplications /
            marketplaceTasks.length,
        )
      : 0;

  const averageApplicationsPerCoveredTask =
    tasksWithApplications >
    0
      ? decimal(
          totalApplications /
            tasksWithApplications,
        )
      : 0;

  /*
   * ======================================================
   * REVIEWS / QUALITY
   * ======================================================
   */

  const ratingDistribution: Record<
    AnalyticsRatingValue,
    number
  > = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  let ratingTotal = 0;

  reviews.forEach(
    (review) => {
      ratingTotal +=
        review.rating;

      if (
        isRatingValue(
          review.rating,
        )
      ) {
        ratingDistribution[
          review.rating
        ] += 1;
      }
    },
  );

  const totalReviews =
    reviews.length;

  const averageRating =
    totalReviews > 0
      ? decimal(
          ratingTotal /
            totalReviews,
        )
      : 0;

  const tasksWithReviews =
  new Set(
    reviews.map(
      (review) =>
        review.task_id,
    ),
  ).size;

  const uniqueReviewers =
    new Set(
      reviews.map(
        (review) =>
          review.reviewer_id,
      ),
    ).size;

  const uniqueReviewees =
    new Set(
      reviews.map(
        (review) =>
          review.reviewee_id,
      ),
    ).size;

  /*
   * ======================================================
   * REPORTS / MODERATION
   * ======================================================
   */

  const totalReports =
    reports.length;

  const pendingReports =
    reports.filter(
      (report) =>
        report.status ===
        "PENDING",
    ).length;

  const reviewedReports =
    reports.filter(
      (report) =>
        report.status ===
        "REVIEWED",
    ).length;

  const resolvedReports =
    reports.filter(
      (report) =>
        report.status ===
        "RESOLVED",
    ).length;

  const rejectedReports =
    reports.filter(
      (report) =>
        report.status ===
        "REJECTED",
    ).length;

  const handledReports =
    reviewedReports +
    resolvedReports +
    rejectedReports;

  const handlingRate =
    percentage(
      handledReports,
      totalReports,
    );

  /*
   * ======================================================
   * 7-DAY GROWTH — WIB
   * ======================================================
   */

  const userGrowthMap =
    new Map<
      string,
      number
    >();

  const taskGrowthMap =
    new Map<
      string,
      number
    >();

  const reportGrowthMap =
    new Map<
      string,
      number
    >();

  users.forEach(
    (user) => {
      incrementDateCount(
        userGrowthMap,
        getJakartaDateKey(
          user.created_at,
        ),
      );
    },
  );

  tasks.forEach(
    (task) => {
      incrementDateCount(
        taskGrowthMap,
        getJakartaDateKey(
          task.created_at,
        ),
      );
    },
  );

  reports.forEach(
    (report) => {
      incrementDateCount(
        reportGrowthMap,
        getJakartaDateKey(
          report.created_at,
        ),
      );
    },
  );

  const growth: AdminAnalyticsGrowthPoint[] =
    getLast7JakartaDays().map(
      (item) => ({
        date: item.date,
        day: item.day,

        users:
          userGrowthMap.get(
            item.date,
          ) ?? 0,

        tasks:
          taskGrowthMap.get(
            item.date,
          ) ?? 0,

        reports:
          reportGrowthMap.get(
            item.date,
          ) ?? 0,
      }),
    );

  /*
   * ======================================================
   * CATEGORY PERFORMANCE
   * ======================================================
   */

  interface CategoryAccumulator {
    name: string;

    totalTasks: number;
    totalApplications: number;

    tasksWithApplications: number;

    completedTasks: number;
    finalizedTasks: number;
  }

  const categoryMap =
    new Map<
      string,
      CategoryAccumulator
    >();

  const taskCategoryById =
    new Map<
      string,
      string
    >();

  marketplaceTasks.forEach(
    (task) => {
      const category =
        task.category?.trim() ||
        "OTHER";

      taskCategoryById.set(
        task.id,
        category,
      );

      const current =
        categoryMap.get(
          category,
        ) ?? {
          name: category,

          totalTasks: 0,
          totalApplications: 0,

          tasksWithApplications: 0,

          completedTasks: 0,
          finalizedTasks: 0,
        };

      current.totalTasks +=
        1;

      if (
        taskIdsWithApplications.has(
          task.id,
        )
      ) {
        current.tasksWithApplications +=
          1;
      }

      if (
        task.status !== null &&
        SUCCESSFUL_TASK_STATUSES.has(
          task.status,
        )
      ) {
        current.completedTasks +=
          1;
      }

      if (
        task.status !== null &&
        FINALIZED_TASK_STATUSES.has(
          task.status,
        )
      ) {
        current.finalizedTasks +=
          1;
      }

      categoryMap.set(
        category,
        current,
      );
    },
  );

  marketplaceApplications.forEach(
    (application) => {
      const category =
        taskCategoryById.get(
          application.task_id,
        );

      if (!category) {
        return;
      }

      const current =
        categoryMap.get(
          category,
        );

      if (!current) {
        return;
      }

      current.totalApplications +=
        1;
    },
  );

  const categories: AdminAnalyticsCategory[] =
    Array.from(
      categoryMap.values(),
    )
      .map(
        (
          category,
        ) => ({
          name:
            category.name,

          totalTasks:
            category.totalTasks,

          totalApplications:
            category.totalApplications,

          tasksWithApplications:
            category.tasksWithApplications,

          completedTasks:
            category.completedTasks,

          coverageRate:
            percentage(
              category.tasksWithApplications,
              category.totalTasks,
            ),

          completionRate:
            percentage(
              category.completedTasks,
              category.finalizedTasks,
            ),
        }),
      )
      .sort(
        (a, b) =>
          b.totalTasks -
          a.totalTasks,
      )
      .slice(0, 5);

  /*
   * ======================================================
   * HELPERS WITH MOST COMPLETED TASKS
   * ======================================================
   */

  const helperCompletionMap =
    new Map<
      string,
      number
    >();

  marketplaceTasks.forEach(
    (task) => {
      if (
        task.status === null ||
        !SUCCESSFUL_TASK_STATUSES.has(
          task.status,
        ) ||
        !task.selected_helper_id
      ) {
        return;
      }

      const helperId =
        task.selected_helper_id;

      helperCompletionMap.set(
        helperId,
        (
          helperCompletionMap.get(
            helperId,
          ) ?? 0
        ) + 1,
      );
    },
  );

  const topHelpers: AdminAnalyticsTopHelper[] =
    Array.from(
      helperCompletionMap.entries(),
    )
      .map(
        ([
          id,
          helperCompletedTasks,
        ]) => ({
          id,

          fullName:
            usersById.get(
              id,
            ) ??
            "Tanpa nama",

          completedTasks:
            helperCompletedTasks,
        }),
      )
      .sort(
        (a, b) =>
          b.completedTasks -
          a.completedTasks,
      )
      .slice(0, 5);

  /*
   * ======================================================
   * USERS REQUIRING ADMIN ATTENTION
   * ======================================================
   */

  const reportedUserMap =
    new Map<
      string,
      number
    >();

  reports.forEach(
    (report) => {
      if (
        !report.reported_user_id
      ) {
        return;
      }

      const userId =
        report.reported_user_id;

      reportedUserMap.set(
        userId,
        (
          reportedUserMap.get(
            userId,
          ) ?? 0
        ) + 1,
      );
    },
  );

  const attentionUsers: AdminAnalyticsAttentionUser[] =
    Array.from(
      reportedUserMap.entries(),
    )
      .map(
        ([
          id,
          userReports,
        ]) => ({
          id,

          fullName:
            usersById.get(
              id,
            ) ??
            "Tanpa nama",

          totalReports:
            userReports,
        }),
      )
      .sort(
        (a, b) =>
          b.totalReports -
          a.totalReports,
      )
      .slice(0, 5);

  /*
   * ======================================================
   * RESPONSE
   * ======================================================
   */

  return {
    generatedAt:
      new Date().toISOString(),

    overview: {
      totalUsers,
      verifiedUsers,

      verificationRate:
        percentage(
          verifiedUsers,
          totalUsers,
        ),

      totalTasks,

      marketplaceTasks:
        marketplaceTasks.length,

      completedTasks:
        successfulTasks,

      completionRate,

      applicationCoverageRate,

      pendingReports,
    },

    marketplace: {
      totalTasks,

      marketplaceTasks:
        marketplaceTasks.length,

      openTasks,
      acceptedTasks,
      onProgressTasks,
      waitingConfirmationTasks,

      completedTasks,
      reviewedTasks,

      cancelledTasks,
      expiredTasks,
      removedTasks,

      inProgressTasks,
      successfulTasks,
      finalizedTasks,

      completionRate,
      expiryRate,
      cancellationRate,
      completedShare,
    },

    supplyDemand: {
      totalApplications,

      pendingApplications,
      acceptedApplications,
      rejectedApplications,

      tasksWithApplications,
      tasksWithoutApplications,

      uniqueApplicants,

      tasksWithSelectedHelper,
      tasksWithoutSelectedHelper,

      applicationCoverageRate,
      helperSelectionRate,

      averageApplicationsPerTask,
      averageApplicationsPerCoveredTask,
    },

    quality: {
  totalReviews,
  averageRating,

  reviewedTasks:
    tasksWithReviews,

  uniqueReviewers,
  uniqueReviewees,

  ratingDistribution,
},

    moderation: {
      totalReports,

      pendingReports,
      reviewedReports,
      resolvedReports,
      rejectedReports,

      handledReports,
      handlingRate,

      suspendedUsers,
      bannedUsers,
    },

    growth,

    categories,

    topHelpers,

    attentionUsers,
  };
}