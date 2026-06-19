export interface UserBadge {

  label: string;

  icon: string;

  className: string;
}

export function getUserBadges(
  completedTasks: number,
  rating: number,
  verified: boolean
): UserBadge[] {

  const badges: UserBadge[] = [];

  /* =========================
     VERIFIED
  ========================= */

  if (verified) {

    badges.push({

      label: "Verified",

      icon: "✔",

      className:
        "bg-emerald-100 text-emerald-600",
    });
  }

  /* =========================
     ACTIVE HELPER
  ========================= */

  if (
    completedTasks >= 3
  ) {

    badges.push({

      label: "Active Helper",

      icon: "⚡",

      className:
        "bg-indigo-100 text-indigo-600",
    });
  }

  /* =========================
     TRUSTED
  ========================= */

  if (
    completedTasks >= 10 &&
    rating >= 4.5
  ) {

    badges.push({

      label: "Trusted",

      icon: "🛡️",

      className:
        "bg-cyan-100 text-cyan-600",
    });
  }

  /* =========================
     TOP HELPER
  ========================= */

  if (
    completedTasks >= 30 &&
    rating >= 4.8
  ) {

    badges.push({

      label: "Top Helper",

      icon: "👑",

      className:
        "bg-amber-100 text-amber-600",
    });
  }

  /* =========================
     DEFAULT
  ========================= */

  if (
    badges.length === 0
  ) {

    badges.push({

      label: "New Helper",

      icon: "🌱",

      className:
        "bg-slate-100 text-slate-600",
    });
  }

  return badges;
}