// src/config/features.ts

/**
 * =====================================================
 * HelpMe Feature Flags
 * =====================================================
 *
 * Seluruh fitur aplikasi dikontrol dari sini.
 * Tidak mengubah logic, hanya menjadi pusat konfigurasi.
 */

export const FeatureConfig = {
  /**
   * Core
   */
  auth: true,

  profile: true,

  verification: true,

  tasks: true,

  chat: true,

  notifications: true,

  reviews: true,

  reports: true,

  badges: true,

  /**
   * Payment
   */
  payment: true,

  donation: true,

  urgentTask: true,

  paymentHistory: true,

  /**
   * Campaign
   */
  campaigns: true,

  /**
   * Admin
   */
  adminPanel: true,

  moderation: true,

  /**
   * Future Features
   */
  escrow: false,

  withdraw: false,

  refund: false,

  subscription: false,

  wallet: false,

  aiModeration: false,

  analytics: false,

  affiliate: false,

  advertisements: false,
} as const;