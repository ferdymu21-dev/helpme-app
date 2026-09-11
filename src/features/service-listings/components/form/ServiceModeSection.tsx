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
      "Dikerjakan tanpa harus bertemu langsung.",

    icon:
      Globe2,
  },
  {
    value:
      ServiceMode.OFFLINE,

    label:
      "Offline",

    description:
      "Membutuhkan lokasi atau pertemuan langsung.",

    icon:
      MapPin,
  },
  {
    value:
      ServiceMode.BOTH,

    label:
      "Online & Offline",

    description:
      "Bisa dilakukan dengan kedua cara.",

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
          gap-3
          sm:grid-cols-3
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
                  rounded-2xl
                  border
                  p-4
                  text-left
                  transition

                  ${
                    selected
                      ? `
                        border-indigo-400
                        bg-indigo-50
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
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl

                    ${
                      selected
                        ? `
                          bg-indigo-600
                          text-white
                        `
                        : `
                          bg-slate-100
                          text-slate-600
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
                  className="
                    mt-3
                    block
                    text-sm
                    font-bold
                    text-slate-900
                  "
                >
                  {option.label}
                </span>

                <span
                  className="
                    mt-1
                    block
                    text-xs
                    leading-5
                    text-slate-500
                  "
                >
                  {option.description}
                </span>
              </button>
            );
          },
        )}
      </div>

      {requiresLocation && (
        <label className="mt-5 block">
          <span
            className="
              mb-2
              block
              text-sm
              font-semibold
              text-slate-800
            "
          >
            Area layanan
          </span>

          <div className="relative">
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
                h-13
                w-full
                rounded-2xl
                border
                border-slate-200
                bg-slate-50/70
                pl-11
                pr-4
                text-sm
                text-slate-900
                outline-none
                transition
                placeholder:text-slate-400
                focus:border-indigo-400
                focus:bg-white
                focus:ring-4
                focus:ring-indigo-100
              "
            />
          </div>

          <p
            className="
              mt-2
              text-xs
              leading-5
              text-slate-400
            "
          >
            Gunakan area umum seperti kota
            atau wilayah layanan. Jangan
            mencantumkan alamat rumah.
          </p>
        </label>
      )}
    </section>
  );
}