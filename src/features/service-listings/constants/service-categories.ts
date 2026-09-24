export const SERVICE_CATEGORY_VALUES = {
  HOME_CLEANING: "Rumah & Kebersihan",
  REPAIR_INSTALLATION: "Perbaikan & Instalasi",
  SHOPPING_QUEUE: "Belanja, Titip & Antre",
  DELIVERY_MOVING: "Antar, Angkut & Pindahan",
  DAILY_ASSISTANCE: "Pendampingan & Bantuan Harian",
  FIELD_ASSISTANCE: "Bantuan Lapangan",
  TUTOR_EDUCATION: "Tutor & Edukasi",
  DIGITAL_CREATIVE: "Digital & Kreatif",
  ADMIN_WRITING: "Admin & Penulisan",
  EVENT_DOCUMENTATION: "Acara & Dokumentasi",
  OTHER: "Lainnya",
} as const;

export type ServiceCategoryValue =
  (typeof SERVICE_CATEGORY_VALUES)[keyof typeof SERVICE_CATEGORY_VALUES];

export interface ServiceCategoryDefinition {
  value: ServiceCategoryValue;
  label: string;
  homeLabel: string;
  description: string;
  examples: readonly string[];
  aliases: readonly string[];
  allowsCustomCategory: boolean;
}

export const SERVICE_CATEGORIES =
  [
    {
      value:
        SERVICE_CATEGORY_VALUES.HOME_CLEANING,
      label:
        "Rumah & Kebersihan",
      homeLabel:
        "Rumah",
      description:
        "Bantuan untuk menjaga rumah, kos, atau tempat tinggal tetap bersih dan rapi.",
      examples: [
        "Bersih rumah atau kos",
        "Deep cleaning",
        "Laundry",
        "Merapikan ruangan",
      ],
      aliases: [
        "rumah",
        "kebersihan",
        "cleaning",
        "home cleaning",
      ],
      allowsCustomCategory: false,
    },
    {
      value:
        SERVICE_CATEGORY_VALUES.REPAIR_INSTALLATION,
      label:
        "Perbaikan & Instalasi",
      homeLabel:
        "Perbaikan",
      description:
        "Jasa perbaikan, perawatan, dan pemasangan perlengkapan rumah atau perangkat.",
      examples: [
        "Servis AC",
        "Perbaikan listrik",
        "Perbaikan ledeng",
        "Pemasangan perangkat",
      ],
      aliases: [
        "perbaikan",
        "instalasi",
        "service",
        "servis",
        "tukang",
      ],
      allowsCustomCategory: false,
    },
    {
      value:
        SERVICE_CATEGORY_VALUES.SHOPPING_QUEUE,
      label:
        "Belanja, Titip & Antre",
      homeLabel:
        "Belanja & Antre",
      description:
        "Bantuan untuk membeli, mengambil, menitipkan, atau mengantre kebutuhan sehari-hari.",
      examples: [
        "Titip belanja",
        "Ambil pesanan",
        "Antre layanan",
        "Belikan kebutuhan",
      ],
      aliases: [
        "belanja",
        "titip",
        "titip belanja",
        "antri",
        "antre",
        "shopping",
      ],
      allowsCustomCategory: false,
    },
    {
      value:
        SERVICE_CATEGORY_VALUES.DELIVERY_MOVING,
      label:
        "Antar, Angkut & Pindahan",
      homeLabel:
        "Antar & Angkut",
      description:
        "Bantuan untuk mengantar, mengangkut, atau memindahkan barang.",
      examples: [
        "Antar barang",
        "Angkut barang",
        "Pindahan kos",
        "Pindahan barang kecil",
      ],
      aliases: [
        "antar",
        "kurir",
        "angkut",
        "pindahan",
        "delivery",
      ],
      allowsCustomCategory: false,
    },
    {
      value:
        SERVICE_CATEGORY_VALUES.DAILY_ASSISTANCE,
      label:
        "Pendampingan & Bantuan Harian",
      homeLabel:
        "Pendampingan",
      description:
        "Bantuan nonmedis untuk menemani atau membantu aktivitas sehari-hari.",
      examples: [
        "Menemani ke suatu tempat",
        "Bantuan aktivitas harian",
        "Pendamping kegiatan",
        "Bantuan kebutuhan sederhana",
      ],
      aliases: [
        "temani",
        "menemani",
        "pendampingan",
        "bantuan harian",
      ],
      allowsCustomCategory: false,
    },
    {
      value:
        SERVICE_CATEGORY_VALUES.FIELD_ASSISTANCE,
      label:
        "Bantuan Lapangan",
      homeLabel:
        "Lapangan",
      description:
        "Bantuan yang membutuhkan kehadiran langsung untuk pengecekan, survey, atau dokumentasi lokasi.",
      examples: [
        "Survey lokasi",
        "Cek kos atau tempat",
        "Dokumentasi lokasi",
        "Pengumpulan data lapangan",
      ],
      aliases: [
        "survey",
        "survei",
        "lapangan",
        "cek lokasi",
      ],
      allowsCustomCategory: false,
    },
    {
      value:
        SERVICE_CATEGORY_VALUES.TUTOR_EDUCATION,
      label:
        "Tutor & Edukasi",
      homeLabel:
        "Tutor",
      description:
        "Pendampingan belajar untuk pelajaran, bahasa, teknologi, atau keterampilan.",
      examples: [
        "Tutor sekolah",
        "Bahasa Inggris",
        "Komputer",
        "Musik",
      ],
      aliases: [
        "tutor",
        "edukasi",
        "les",
        "belajar",
        "kursus",
      ],
      allowsCustomCategory: false,
    },
    {
      value:
        SERVICE_CATEGORY_VALUES.DIGITAL_CREATIVE,
      label:
        "Digital & Kreatif",
      homeLabel:
        "Digital",
      description:
        "Jasa kreatif dan digital untuk kebutuhan pribadi, bisnis, atau media sosial.",
      examples: [
        "Desain logo",
        "Desain poster",
        "Edit foto atau video",
        "Konten media sosial",
      ],
      aliases: [
        "desain",
        "desain & kreatif",
        "digital",
        "kreatif",
        "editing",
      ],
      allowsCustomCategory: false,
    },
    {
      value:
        SERVICE_CATEGORY_VALUES.ADMIN_WRITING,
      label:
        "Admin & Penulisan",
      homeLabel:
        "Admin",
      description:
        "Bantuan administrasi, pengolahan data, dokumen, dan penulisan.",
      examples: [
        "Data entry",
        "Excel",
        "Pengetikan",
        "CV dan proofreading",
      ],
      aliases: [
        "admin",
        "administrasi",
        "penulisan",
        "data entry",
        "typing",
      ],
      allowsCustomCategory: false,
    },
    {
      value:
        SERVICE_CATEGORY_VALUES.EVENT_DOCUMENTATION,
      label:
        "Acara & Dokumentasi",
      homeLabel:
        "Acara",
      description:
        "Bantuan untuk kebutuhan acara, dokumentasi, dan pelaksanaan kegiatan.",
      examples: [
        "Fotografer",
        "Videografer",
        "Crew acara",
        "MC",
      ],
      aliases: [
        "acara",
        "event",
        "dokumentasi",
        "foto",
        "video",
      ],
      allowsCustomCategory: false,
    },
    {
      value:
        SERVICE_CATEGORY_VALUES.OTHER,
      label:
        "Lainnya",
      homeLabel:
        "Lainnya",
      description:
        "Gunakan kategori ini jika layananmu belum sesuai dengan kategori HelpMe yang tersedia.",
      examples: [
        "Pet sitting",
        "Perawatan tanaman",
        "Cuci kendaraan",
        "Jenis bantuan lainnya",
      ],
      aliases: [
        "lainnya",
        "other",
        "lain-lain",
      ],
      allowsCustomCategory: true,
    },
  ] as const satisfies readonly ServiceCategoryDefinition[];

export const HOME_SERVICE_CATEGORY_VALUES =
  [
    SERVICE_CATEGORY_VALUES.HOME_CLEANING,
    SERVICE_CATEGORY_VALUES.REPAIR_INSTALLATION,
    SERVICE_CATEGORY_VALUES.SHOPPING_QUEUE,
    SERVICE_CATEGORY_VALUES.DELIVERY_MOVING,
    SERVICE_CATEGORY_VALUES.DAILY_ASSISTANCE,
    SERVICE_CATEGORY_VALUES.TUTOR_EDUCATION,
    SERVICE_CATEGORY_VALUES.DIGITAL_CREATIVE,
    SERVICE_CATEGORY_VALUES.OTHER,
  ] as const;

function normalizeCategoryLookupValue(
  value: string,
): string {
  return value
    .trim()
    .toLocaleLowerCase("id-ID");
}

export function getServiceCategoryDefinition(
  value: string,
): ServiceCategoryDefinition | null {
  const normalized =
    normalizeCategoryLookupValue(
      value,
    );

  if (!normalized) {
    return null;
  }

  return (
    SERVICE_CATEGORIES.find(
      (category) =>
        normalizeCategoryLookupValue(
          category.value,
        ) === normalized ||
        category.aliases.some(
          (alias) =>
            normalizeCategoryLookupValue(
              alias,
            ) === normalized,
        ),
    ) ?? null
  );
}

export function getCanonicalServiceCategory(
  value: string,
): ServiceCategoryValue | null {
  return (
    getServiceCategoryDefinition(
      value,
    )?.value ?? null
  );
}

export function isServiceCategoryValue(
  value: string,
): value is ServiceCategoryValue {
  return SERVICE_CATEGORIES.some(
    (category) =>
      category.value === value,
  );
}