export type AnalyticsRatingValue = 1 | 2 | 3 | 4 | 5;

export interface AdminAnalyticsOverview {
  totalUsers: number;
  verifiedUsers: number;
  verificationRate: number;

  totalTasks: number;
  marketplaceTasks: number;
  completedTasks: number;
  completionRate: number;

  applicationCoverageRate: number;

  pendingReports: number;
}

export interface AdminAnalyticsMarketplace {
  totalTasks: number;
  marketplaceTasks: number;

  openTasks: number;
  acceptedTasks: number;
  onProgressTasks: number;
  waitingConfirmationTasks: number;

  completedTasks: number;
  reviewedTasks: number;

  cancelledTasks: number;
  expiredTasks: number;
  removedTasks: number;

  inProgressTasks: number;
  successfulTasks: number;
  finalizedTasks: number;

  completionRate: number;
  expiryRate: number;
  cancellationRate: number;
  completedShare: number;
}

export interface AdminAnalyticsSupplyDemand {
  totalApplications: number;

  pendingApplications: number;
  acceptedApplications: number;
  rejectedApplications: number;

  tasksWithApplications: number;
  tasksWithoutApplications: number;

  uniqueApplicants: number;

  tasksWithSelectedHelper: number;
  tasksWithoutSelectedHelper: number;

  applicationCoverageRate: number;
  helperSelectionRate: number;

  averageApplicationsPerTask: number;
  averageApplicationsPerCoveredTask: number;
}

export interface AdminAnalyticsQuality {
  totalReviews: number;
  averageRating: number;

  reviewedTasks: number;
  uniqueReviewers: number;
  uniqueReviewees: number;

  ratingDistribution: Record<
    AnalyticsRatingValue,
    number
  >;
}

export interface AdminAnalyticsModeration {
  totalReports: number;

  pendingReports: number;
  reviewedReports: number;
  resolvedReports: number;
  rejectedReports: number;

  handledReports: number;
  handlingRate: number;

  suspendedUsers: number;
  bannedUsers: number;
}

export interface AdminAnalyticsGrowthPoint {
  date: string;
  day: string;

  users: number;
  tasks: number;
  reports: number;
}

export interface AdminAnalyticsCategory {
  name: string;

  totalTasks: number;
  totalApplications: number;

  tasksWithApplications: number;
  completedTasks: number;

  coverageRate: number;
  completionRate: number;
}

export interface AdminAnalyticsTopHelper {
  id: string;
  fullName: string;
  completedTasks: number;
}

export interface AdminAnalyticsAttentionUser {
  id: string;
  fullName: string;
  totalReports: number;
}

export interface AdminAnalyticsResponse {
  generatedAt: string;

  overview: AdminAnalyticsOverview;

  marketplace: AdminAnalyticsMarketplace;

  supplyDemand: AdminAnalyticsSupplyDemand;

  quality: AdminAnalyticsQuality;

  moderation: AdminAnalyticsModeration;

  growth: AdminAnalyticsGrowthPoint[];

  categories: AdminAnalyticsCategory[];

  topHelpers: AdminAnalyticsTopHelper[];

  attentionUsers: AdminAnalyticsAttentionUser[];
}