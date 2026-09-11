import { Eye } from "lucide-react";

interface ServiceListingActionBarProps {
  formId: string;

  loading: boolean;

  disabled?: boolean;

  previewDisabled?: boolean;

  submitLabel: string;

  loadingLabel: string;

  onPreview?: () => void;
}

export default function ServiceListingActionBar({
  formId,
  loading,
  disabled = false,
  previewDisabled = false,
  submitLabel,
  loadingLabel,
  onPreview,
}: ServiceListingActionBarProps) {
  const submitDisabled = loading || disabled;

  const isPreviewDisabled = loading || previewDisabled;

  return (
    <>
      <div
        className={`
          hidden
          gap-3
          sm:grid

          ${
            onPreview
              ? "grid-cols-[1fr_2fr]"
              : "grid-cols-1"
          }
        `}
      >
        {onPreview && (
          <button
            type="button"
            disabled={isPreviewDisabled}
            onClick={onPreview}
            className="
              flex
              h-14
              items-center
              justify-center
              gap-2
              rounded-2xl
              border
              border-slate-200
              bg-white
              text-sm
              font-bold
              text-slate-700
              transition
              hover:border-indigo-200
              hover:bg-indigo-50/50
              hover:text-indigo-700
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <Eye
              size={17}
              strokeWidth={2}
            />

            Preview
          </button>
        )}

        <button
          type="submit"
          disabled={submitDisabled}
          className="
            flex
            h-14
            items-center
            justify-center
            rounded-2xl
            bg-indigo-600
            text-sm
            font-bold
            text-white
            shadow-lg
            shadow-indigo-600/20
            transition
            hover:bg-indigo-700
            disabled:cursor-not-allowed
            disabled:bg-slate-300
            disabled:shadow-none
          "
        >
          {loading
            ? loadingLabel
            : submitLabel}
        </button>
      </div>

      <div
        className="
          fixed
          inset-x-0
          bottom-0
          z-40
          border-t
          border-slate-200
          bg-white/95
          p-4
          backdrop-blur-xl
          sm:hidden
        "
      >
        <div
          className={`
            mx-auto
            grid
            max-w-3xl
            gap-3

            ${
              onPreview
                ? "grid-cols-[auto_1fr]"
                : "grid-cols-1"
            }
          `}
        >
          {onPreview && (
            <button
              type="button"
              disabled={isPreviewDisabled}
              onClick={onPreview}
              aria-label="Preview jasa"
              className="
                flex
                h-13
                min-w-13
                items-center
                justify-center
                rounded-2xl
                border
                border-slate-200
                bg-white
                px-4
                text-slate-700
                transition
                active:scale-[0.98]
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <Eye
                size={19}
                strokeWidth={2}
              />
            </button>
          )}

          <button
            type="submit"
            form={formId}
            disabled={submitDisabled}
            className="
              flex
              h-13
              w-full
              items-center
              justify-center
              rounded-2xl
              bg-indigo-600
              px-4
              text-sm
              font-bold
              text-white
              shadow-lg
              shadow-indigo-600/20
              transition
              active:scale-[0.98]
              disabled:cursor-not-allowed
              disabled:bg-slate-300
              disabled:shadow-none
            "
          >
            {loading
              ? loadingLabel
              : submitLabel}
          </button>
        </div>
      </div>
    </>
  );
}