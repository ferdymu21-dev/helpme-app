import {
  CalendarDays,
  Clock3,
  FileText,
  House,
  LayoutGrid,
  PackageCheck,
  Search,
  ShoppingBag,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export interface TaskCategoryDefinition {
  value: string;
  label: string;
  description: string;
  icon: LucideIcon;
  aliases: readonly string[];
  heroImage: string;
}

export const TASK_CATEGORIES: readonly TaskCategoryDefinition[] = [
  {
    value: "Antri",
    label: "Antri & Urus",
    description:
      "Antre layanan, tunggu pesanan, atau bantu urusan sederhana.",
    icon: Clock3,
    aliases: ["⏱️ Antri"],
    heroImage:
      "/images/task-categories/antri.jpg",
  },
  {
    value: "Kurir",
    label: "Antar & Ambil",
    description:
      "Ambil atau antar barang ringan, laundry, paket, dan kebutuhan lainnya.",
    icon: PackageCheck,
    aliases: [],
    heroImage:
      "/images/task-categories/kurir.jpg",
  },
  {
    value: "Dokumen",
    label: "Dokumen & Admin",
    description:
      "Bantuan mengambil, mengantar, mencetak, atau mengurus dokumen sederhana.",
    icon: FileText,
    aliases: ["📚 Dokumen"],
    heroImage:
      "/images/task-categories/dokumen.jpg",
  },
  {
    value: "Belanja",
    label: "Belanja & Titip",
    description:
      "Titip membeli kebutuhan harian dari toko, pasar, atau lokasi tertentu.",
    icon: ShoppingBag,
    aliases: [],
    heroImage:
      "/images/task-categories/belanja.jpg",
  },
  {
    value: "Rumah & Pindahan",
    label: "Rumah & Pindahan",
    description:
      "Bantuan rumah sederhana, angkat barang ringan, atau pindahan kecil.",
    icon: House,
    aliases: [],
    heroImage:
      "/images/task-categories/lainnya.jpg",
  },
  {
    value: "Cari & Cek",
    label: "Cari & Cek",
    description:
      "Cek lokasi, stok, kondisi tempat, survei sederhana, atau membantu pencarian.",
    icon: Search,
    aliases: [],
    heroImage:
      "/images/task-categories/lainnya.jpg",
  },
  {
    value: "Kondangan",
    label: "Temani & Acara",
    description:
      "Temani kegiatan, kondangan, event, atau aktivitas sosial lainnya.",
    icon: CalendarDays,
    aliases: ["🎉 Kondangan"],
    heroImage:
      "/images/task-categories/kondangan.jpg",
  },
  {
    value: "Lainnya",
    label: "Lainnya",
    description:
      "Bantuan fleksibel lainnya yang belum termasuk kategori di atas.",
    icon: Sparkles,
    aliases: [],
    heroImage:
      "/images/task-categories/lainnya.jpg",
  },
];

export const TASK_CATEGORY_FILTERS = [
  {
    value: "Semua",
    label: "Semua",
    icon: LayoutGrid,
  },
  ...TASK_CATEGORIES.map((category) => ({
    value: category.value,
    label: category.label,
    icon: category.icon,
  })),
];

const FALLBACK_CATEGORY: TaskCategoryDefinition = {
  value: "Lainnya",
  label: "Lainnya",
  description:
    "Bantuan fleksibel lainnya.",
  icon: Sparkles,
  aliases: [],
  heroImage:
    "/images/task-categories/lainnya.jpg",
};

export function getTaskCategoryDefinition(
  value: string | null | undefined,
): TaskCategoryDefinition {
  const normalized =
    value?.trim() ?? "";

  return (
    TASK_CATEGORIES.find(
      (category) =>
        category.value === normalized ||
        category.aliases.includes(
          normalized,
        ),
    ) ?? FALLBACK_CATEGORY
  );
}

export function getTaskCategoryLabel(
  value: string | null | undefined,
): string {
  return getTaskCategoryDefinition(
    value,
  ).label;
}

export function getTaskCategoryHeroImage(
  value: string | null | undefined,
): string {
  return getTaskCategoryDefinition(
    value,
  ).heroImage;
}