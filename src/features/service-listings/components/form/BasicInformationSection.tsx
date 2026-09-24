import {
  Camera,
  FileText,
  GraduationCap,
  HandHeart,
  Home,
  MapPin,
  MoreHorizontal,
  Palette,
  ShoppingBag,
  Truck,
  Wrench,
} from "lucide-react";

import {
  getServiceCategoryDefinition,
  SERVICE_CATEGORIES,
  SERVICE_CATEGORY_VALUES,
} from "../../constants/service-categories";

const CATEGORY_ICON_BY_VALUE = {
  [SERVICE_CATEGORY_VALUES.HOME_CLEANING]:
    Home,

  [SERVICE_CATEGORY_VALUES.REPAIR_INSTALLATION]:
    Wrench,

  [SERVICE_CATEGORY_VALUES.SHOPPING_QUEUE]:
    ShoppingBag,

  [SERVICE_CATEGORY_VALUES.DELIVERY_MOVING]:
    Truck,

  [SERVICE_CATEGORY_VALUES.DAILY_ASSISTANCE]:
    HandHeart,

  [SERVICE_CATEGORY_VALUES.FIELD_ASSISTANCE]:
    MapPin,

  [SERVICE_CATEGORY_VALUES.TUTOR_EDUCATION]:
    GraduationCap,

  [SERVICE_CATEGORY_VALUES.DIGITAL_CREATIVE]:
    Palette,

  [SERVICE_CATEGORY_VALUES.ADMIN_WRITING]:
    FileText,

  [SERVICE_CATEGORY_VALUES.EVENT_DOCUMENTATION]:
    Camera,

  [SERVICE_CATEGORY_VALUES.OTHER]:
    MoreHorizontal,
};

interface BasicInformationSectionProps {
  title: string;

  category: string;

  customCategory: string;

  description: string;

  onTitleChange:
    (value: string) => void;

  onCategoryChange:
    (value: string) => void;

  onCustomCategoryChange:
    (value: string) => void;

  onDescriptionChange:
    (value: string) => void;
}

export default function BasicInformationSection({
  title,
  category,
  customCategory,
  description,
  onTitleChange,
  onCategoryChange,
  onCustomCategoryChange,
  onDescriptionChange,
}: BasicInformationSectionProps) {
  const selectedCategory =
    getServiceCategoryDefinition(
      category,
    );

  return (
    <section
      className="
    rounded-2xl
    border
    border-slate-200
    bg-white
    p-5
    sm:p-6
  "
    >
      <div
        className="
      flex
      items-start
      justify-between
      gap-4
    "
      >
        <div>
          <p
            className="
          text-[10px]
          font-black
          tracking-[0.14em]
          text-indigo-600
          uppercase
        "
          >
            Informasi Jasa
          </p>

          <h2
            className="
          mt-1
          text-[13px]
          font-black
          tracking-tight
          text-slate-950
        "
          >
            Informasi utama layanan
          </h2>
        </div>
      </div>

      <div
        className="
      mt-6
      space-y-5
    "
      >
        <label className="block">
          <div
            className="
          mb-2
          flex
          items-center
          justify-between
          gap-3
        "
          >
            <span
              className="
            text-sm
            font-bold
            text-slate-800
          "
            >
              Judul jasa
            </span>

            <span
              className="
            text-[10px]
            font-medium
            text-slate-400
          "
            >
              Wajib
            </span>
          </div>

          <input
            type="text"
            value={title}
            onChange={(event) => onTitleChange(event.target.value)}
            required
            autoComplete="off"
            placeholder="Contoh: Jasa Bersih Rumah & Kos"
            className="
          h-12
          w-full
          rounded-xl
          border
          border-slate-200
          bg-white
          px-4
          text-[13px]
          font-semibold
          text-slate-950
          outline-none
          transition
          placeholder:text-sm
          placeholder:font-normal
          placeholder:text-slate-400
          focus:border-indigo-400
          focus:ring-4
          focus:ring-indigo-100
        "
          />

          <p
            className="
          mt-1
          text-[9.5px]
          leading-4
          text-slate-400
        "
          >
            Buat judul yang langsung menjelaskan layanan yang Anda tawarkan.
          </p>
        </label>

        <div className="block">
          <div
            className="
              mb-2
              flex
              items-start
              justify-between
              gap-3
            "
          >
            <div>
              <span
                className="
                  block
                  text-sm
                  font-bold
                  text-slate-800
                "
              >
                Kategori
              </span>

              <p
                className="
                  mt-1
                  text-[9.5px]
                  leading-4
                  text-slate-400
                "
              >
                Pilih satu kategori yang paling sesuai dengan layanan Anda.
              </p>
            </div>

            <span
              className="
                shrink-0
                text-[10px]
                font-medium
                text-slate-400
              "
            >
              Wajib
            </span>
          </div>

          <div
            className="
              grid
              grid-cols-3
              gap-2
            "
          >
            {SERVICE_CATEGORIES.map(
              (
                categoryDefinition,
              ) => {
                const Icon =
                  CATEGORY_ICON_BY_VALUE[
                    categoryDefinition.value
                  ];

                const isSelected =
                  selectedCategory?.value ===
                  categoryDefinition.value;

                return (
                  <button
                    key={
                      categoryDefinition.value
                    }
                    type="button"
                    aria-pressed={
                      isSelected
                    }
                    onClick={() =>
                      onCategoryChange(
                        categoryDefinition.value,
                      )
                    }
                    className={
                      isSelected
                        ? `
                          flex
                          min-h-16
                          min-w-0
                          flex-col
                          items-center
                          justify-center
                          gap-1.5
                          rounded-xl
                          border
                          border-indigo-500
                          bg-indigo-50
                          px-2
                          py-2
                          text-center
                          shadow-sm
                          ring-1
                          ring-indigo-100
                          transition
                        `
                        : `
                          flex
                          min-h-16
                          min-w-0
                          flex-col
                          items-center
                          justify-center
                          gap-1.5
                          rounded-xl
                          border
                          border-slate-200
                          bg-white
                          px-2
                          py-2
                          text-center
                          transition
                          hover:border-indigo-200
                          hover:bg-indigo-50/40
                        `
                    }
                  >
                    <span
                      className={
                        isSelected
                          ? `
                            flex
                            h-7
                            w-7
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            bg-indigo-600
                            text-white
                          `
                          : `
                            flex
                            h-7
                            w-7
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            bg-slate-100
                            text-slate-600
                          `
                      }
                    >
                      <Icon
                        className="
                          h-4
                          w-4
                        "
                        aria-hidden="true"
                      />
                    </span>

                    <span
                      className={
                        isSelected
                          ? `
                            line-clamp-2
                            w-full
                            text-[10px]
                            font-bold
                            leading-3.25
                            text-indigo-950
                            sm:text-[11px]
                          `
                          : `
                            line-clamp-2
                            w-full
                            text-[10px]
                            font-bold
                            leading-3.25
                            text-slate-700
                            sm:text-[11px]
                          `
                      }
                    >
                      {
                        categoryDefinition.label
                      }
                    </span>
                  </button>
                );
              },
            )}
          </div>

          <div
            className="
              mt-3
              min-h-28
              rounded-xl
              border
              border-slate-200
              bg-slate-50/80
              p-4
            "
          >
            {selectedCategory ? (
              <>
                <div
                  className="
                    flex
                    items-start
                    justify-between
                    gap-3
                  "
                >
                  <div>
                    <p
                      className="
                        text-xs
                        font-black
                        text-slate-900
                      "
                    >
                      {
                        selectedCategory.label
                      }
                    </p>

                    <p
                      className="
                        mt-1
                        text-[11px]
                        leading-5
                        text-slate-500
                      "
                    >
                      {
                        selectedCategory.description
                      }
                    </p>
                  </div>

                  <span
                    className="
                      shrink-0
                      rounded-full
                      bg-indigo-100
                      px-2.5
                      py-1
                      text-[9px]
                      font-black
                      tracking-wide
                      text-indigo-700
                      uppercase
                    "
                  >
                    Dipilih
                  </span>
                </div>

                <div
                  className="
                    mt-3
                    flex
                    flex-wrap
                    gap-1.5
                  "
                >
                  {selectedCategory.examples.map(
                    (example) => (
                      <span
                        key={example}
                        className="
                          rounded-full
                          border
                          border-slate-200
                          bg-white
                          px-2.5
                          py-1
                          text-[10px]
                          font-medium
                          text-slate-500
                        "
                      >
                        {example}
                      </span>
                    ),
                  )}
                </div>

                {selectedCategory.allowsCustomCategory && (
                  <label
                    className="
                      mt-4
                      block
                      border-t
                      border-slate-200
                      pt-4
                    "
                  >
                    <div
                      className="
                        mb-2
                        flex
                        items-center
                        justify-between
                        gap-3
                      "
                    >
                      <span
                        className="
                          text-xs
                          font-bold
                          text-slate-800
                        "
                      >
                        Jenis jasa lainnya
                      </span>

                      <span
                        className="
                          text-[10px]
                          font-medium
                          text-slate-400
                        "
                      >
                        Wajib
                      </span>
                    </div>

                    <input
                      type="text"
                      value={
                        customCategory
                      }
                      onChange={(
                        event,
                      ) =>
                        onCustomCategoryChange(
                          event.target.value,
                        )
                      }
                      required
                      autoComplete="off"
                      placeholder="Contoh: Pet Sitting"
                      className="
                        h-11
                        w-full
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        px-3.5
                        text-sm
                        font-medium
                        text-slate-950
                        outline-none
                        transition
                        placeholder:font-normal
                        placeholder:text-slate-400
                        focus:border-indigo-400
                        focus:ring-4
                        focus:ring-indigo-100
                      "
                    />

                    <p
                      className="
                        mt-2
                        text-[10px]
                        leading-4
                        text-slate-400
                      "
                    >
                      Tulis jenis layanan yang belum tersedia pada kategori HelpMe.
                    </p>
                  </label>
                )}
              </>
            ) : (
              <div
                className="
                  flex
                  min-h-19.5
                  items-center
                "
              >
                <div>
                  <p
                    className="
                      text-xs
                      font-bold
                      text-slate-700
                    "
                  >
                    Belum ada kategori dipilih
                  </p>

                  <p
                    className="
                      mt-1
                      text-[11px]
                      leading-5
                      text-slate-400
                    "
                  >
                    Pilih salah satu kategori di atas untuk melihat informasi dan contoh layanan.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <label className="block">
          <span
            className="
          mb-2
          block
          text-sm
          font-bold
          text-slate-800
        "
          >
            Tentang jasa
          </span>

          <textarea
            value={description}
            onChange={(event) => onDescriptionChange(event.target.value)}
            required
            rows={6}
            placeholder="Jelaskan layanan, cara kerja, pengalaman, dan informasi penting yang perlu diketahui pelanggan."
            className="
          w-full
          resize-y
          rounded-xl
          border
          border-slate-200
          bg-white
          px-4
          py-3.5
          text-sm
          leading-6
          text-slate-950
          outline-none
          transition
          placeholder:text-slate-400
          focus:border-indigo-400
          focus:ring-4
          focus:ring-indigo-100
        "
          />

          <p
            className="
          mt-1
          text-[10px]
          leading-4
          text-slate-400
        "
          >
            Jelaskan dengan cukup detail agar pelanggan memahami layanan sebelum
            membuat permintaan.
          </p>
        </label>
      </div>
    </section>
  );
}