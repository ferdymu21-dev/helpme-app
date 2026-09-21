import {
  Globe2,
  MapPin,
  Shuffle,
} from "lucide-react";

import {
  ServiceMode,
} from "../../constants/service-mode";

import type {
  ServiceModeValue,
} from "../../constants/service-mode";

interface ServiceModeSectionProps {
  serviceMode:
    ServiceModeValue;

  locationName: string;

  onServiceModeChange:
    (value: ServiceModeValue) => void;

  onLocationNameChange:
    (value: string) => void;
}

interface ModeOption {
  value:
    ServiceModeValue;

  label: string;

  description: string;

  icon:
    typeof Globe2;
}

const MODE_OPTIONS: ModeOption[] = [
  {
    value:
      ServiceMode.ONLINE,

    label:
      "Online",

    description:
      "Layanan dikerjakan jarak jauh tanpa perlu bertemu langsung dengan pelanggan.",

    icon:
      Globe2,
  },
  {
    value:
      ServiceMode.OFFLINE,

    label:
      "Offline",

    description:
      "Layanan membutuhkan pertemuan langsung atau pengerjaan di area tertentu.",

    icon:
      MapPin,
  },
  {
    value:
      ServiceMode.BOTH,

    label:
      "Keduanya",

    description:
      "Pelanggan dapat menggunakan layanan secara online maupun offline.",

    icon:
      Shuffle,
  },
];

export default function ServiceModeSection({
  serviceMode,
  locationName,
  onServiceModeChange,
  onLocationNameChange,
}: ServiceModeSectionProps) {
  function handleModeChange(
    value:
      ServiceModeValue,
  ) {
    onServiceModeChange(
      value,
    );

    if (
      value ===
      ServiceMode.ONLINE
    ) {
      onLocationNameChange(
        "",
      );
    }
  }

  const requiresLocation =
    serviceMode !==
    ServiceMode.ONLINE;

  const selectedOption =
  MODE_OPTIONS.find(
    (option) =>
      option.value ===
      serviceMode,
  ) ?? MODE_OPTIONS[0];

 const SelectedIcon =
  selectedOption.icon;

  return (
    <section
      className="
        rounded-3xl
        border
        border-slate-200/80
        bg-white
        p-5
        shadow-sm
        sm:p-6
      "
    >
      <div>
        <p
          className="
            text-[11px]
            font-bold
            uppercase
            tracking-[0.16em]
            text-indigo-600
          "
        >
          Cara Layanan
        </p>

        <h2
          className="
            mt-1
            text-lg
            font-bold
            tracking-tight
            text-slate-950
          "
        >
          Bagaimana jasa diberikan?
        </h2>

        <p
          className="
            mt-1
            text-sm
            leading-5
            text-slate-500
          "
        >
          Pilih cara yang paling sesuai
          dengan layanan Anda.
        </p>
      </div>

      <div
  className="
    mt-6
    grid
    grid-cols-3
    gap-2
    sm:gap-3
  "
>
  {MODE_OPTIONS.map(
    (option) => {
      const Icon =
        option.icon;

      const selected =
        serviceMode ===
        option.value;

      return (
        <button
          key={option.value}
          type="button"
          aria-pressed={selected}
          onClick={() =>
            handleModeChange(
              option.value,
            )
          }
          className={`
            group
            flex
            min-h-24
            flex-col
            items-center
            justify-center
            rounded-2xl
            border
            px-2
            py-3
            text-center
            transition
            sm:min-h-28
            sm:px-4
            sm:py-4

            ${
              selected
                ? `
                  border-indigo-500
                  bg-indigo-50
                  shadow-sm
                  ring-2
                  ring-indigo-100
                `
                : `
                  border-slate-200
                  bg-white
                  hover:border-indigo-200
                  hover:bg-slate-50
                `
            }
          `}
        >
          <span
            className={`
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-xl
              transition
              sm:h-10
              sm:w-10

              ${
                selected
                  ? `
                    bg-indigo-600
                    text-white
                    shadow-sm
                  `
                  : `
                    bg-slate-100
                    text-slate-600
                    group-hover:bg-indigo-50
                    group-hover:text-indigo-600
                  `
              }
            `}
          >
            <Icon
              size={18}
              strokeWidth={2}
            />
          </span>

          <span
            className={`
              mt-2.5
              block
              text-[11px]
              font-bold
              leading-tight
              sm:text-sm

              ${
                selected
                  ? "text-indigo-700"
                  : "text-slate-800"
              }
            `}
          >
            {option.label}
          </span>
        </button>
      );
    },
  )}
</div>

{/* SELECTED MODE INFORMATION */}
<div
  className="
    mt-4
    overflow-hidden
    rounded-2xl
    border
    border-indigo-100
    bg-indigo-50/50
  "
>
  <div
    className="
      flex
      items-start
      gap-3
      p-4
      sm:p-5
    "
  >
    <span
      className="
        flex
        h-9
        w-9
        shrink-0
        items-center
        justify-center
        rounded-xl
        bg-white
        text-indigo-600
        shadow-sm
        ring-1
        ring-indigo-100
      "
    >
      <SelectedIcon
        size={18}
        strokeWidth={2}
      />
    </span>

    <div className="min-w-0">
      <p
        className="
          text-sm
          font-bold
          text-slate-900
        "
      >
        {serviceMode ===
        ServiceMode.BOTH
          ? "Online & Offline"
          : selectedOption.label}
      </p>

      <p
        className="
          mt-1
          text-xs
          leading-5
          text-slate-600
          sm:text-sm
        "
      >
        {selectedOption.description}
      </p>
    </div>
  </div>

  {requiresLocation && (
    <div
      className="
        border-t
        border-indigo-100
        bg-white/70
        p-4
        sm:p-5
      "
    >
      <label className="block">
        <span
          className="
            text-sm
            font-semibold
            text-slate-800
          "
        >
          Area layanan
        </span>

        <p
          className="
            mt-1
            text-xs
            leading-5
            text-slate-500
          "
        >
          Masukkan kota atau wilayah
          tempat layanan tersedia.
        </p>

        <div
          className="
            relative
            mt-3
          "
        >
          <MapPin
            size={18}
            strokeWidth={2}
            className="
              pointer-events-none
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              text-slate-400
            "
          />

          <input
            type="text"
            value={locationName}
            onChange={(event) =>
              onLocationNameChange(
                event.target.value,
              )
            }
            required
            autoComplete="off"
            placeholder="Contoh: Surabaya"
            className="
              h-12
              w-full
              rounded-xl
              border
              border-slate-200
              bg-white
              pl-11
              pr-4
              text-sm
              text-slate-900
              outline-none
              transition
              placeholder:text-slate-400
              focus:border-indigo-400
              focus:ring-4
              focus:ring-indigo-100
            "
          />
        </div>

        <p
          className="
            mt-2
            text-[11px]
            leading-5
            text-slate-400
          "
        >
          Gunakan area umum seperti kota
          atau wilayah layanan. Jangan
          mencantumkan alamat rumah.
        </p>
      </label>
    </div>
  )}
</div>
    </section>
  );
}