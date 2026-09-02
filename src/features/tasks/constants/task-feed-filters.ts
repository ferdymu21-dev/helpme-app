import {
  Flame,
  LayoutGrid,
} from "lucide-react";

import {
  TASK_CATEGORIES,
} from "./task-categories";

export const TASK_FEED_FILTERS = [
  {
    value: "Semua",
    label: "Semua",
    icon: LayoutGrid,
  },
  {
    value: "Mendesak",
    label: "Mendesak",
    icon: Flame,
  },
  ...TASK_CATEGORIES.map(
    ({
      value,
      label,
      icon,
    }) => ({
      value,
      label,
      icon,
    }),
  ),
];