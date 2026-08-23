"use client";

import Image from "next/image";

import type { CampaignFormController } from "../forms/campaign-form.props";

import { NotificationCategory } from "@/features/notifications/constants/notification-category";

import type { NotificationCategoryValue } from "@/features/notifications/constants/notification-category";

import { NotificationType } from "@/features/notifications/constants/notification-type";

import type { NotificationTypeValue } from "@/features/notifications/constants/notification-type";

import type { CampaignTargetValue } from "../constants/campaign-target";

import { CampaignTarget } from "../constants/campaign-target";

import { CampaignAction } from "../constants/campaign-action";

import type { CampaignActionValue } from "../constants/campaign-action";

type CampaignFormProps = {
  campaign: CampaignFormController;
};

export default function CampaignForm({ campaign }: CampaignFormProps) {
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    await campaign.uploadImage(file);
  };
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();

        await campaign.submit();
      }}
      className="
        space-y-8
        rounded-3xl
        bg-white
        p-8
        shadow-sm
    "
    >
      {/* TITLE */}

      <section className="space-y-2">
        <label
          className="
                        text-sm
                        font-semibold
                    "
        >
          Title
        </label>

        <input
          disabled={campaign.loading}
          type="text"
          placeholder="Campaign title"
          value={campaign.form.title}
          onChange={(e) => campaign.setField("title", e.target.value)}
          className="
                        w-full
                        rounded-xl
                        border
                      border-slate-300
                        px-4
                        py-3
                        outline-none
                      focus:border-indigo-500
                    "
        />

        {campaign.errors.title && (
          <p
            className="
                                text-sm
                              text-red-500
                            "
          >
            {campaign.errors.title}
          </p>
        )}
      </section>

      {/* MESSAGE */}

      <section className="space-y-2">
        <label
          className="
                        text-sm
                        font-semibold
                    "
        >
          Message
        </label>

        <textarea
          disabled={campaign.loading}
          rows={5}
          value={campaign.form.message}
          onChange={(e) => campaign.setField("message", e.target.value)}
          className="
                        w-full
                        rounded-xl
                        border
                        border-slate-300
                        px-4
                        py-3
                        outline-none
                        focus:border-indigo-500
                    "
        />
        {campaign.errors.message && (
          <p
            className="
                                text-sm
                              text-red-500
                            "
          >
            {campaign.errors.message}
          </p>
        )}
      </section>

      {/* IMAGE */}

      <section className="space-y-3">
        <label
          className="
            text-sm
            font-semibold
        "
        >
          Campaign Image
        </label>

        {campaign.form.imageUrl && (
          <div
            className="
                    overflow-hidden
                    rounded-2xl
                    border
                "
          >
            <Image
              src={campaign.form.imageUrl}
              alt="Campaign"
              width={800}
              height={450}
              className="
                        h-48
                        w-full
                        object-cover
                    "
            />
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          disabled={campaign.loading || campaign.uploadingImage}
          onChange={handleImageUpload}
          className="
            block
            w-full
            rounded-xl
            border
            border-slate-300
            p-3
        "
        />

        {campaign.uploadingImage && (
          <p
            className="
                    text-sm
                    text-indigo-600
                "
          >
            Uploading image...
          </p>
        )}
      </section>

      {/* REDIRECT */}

      <section className="space-y-2">
        <label
          className="
                        text-sm
                        font-semibold
                    "
        >
          Redirect URL
        </label>

        <input
          disabled={campaign.loading}
          type="url"
          value={campaign.form.redirectUrl}
          onChange={(e) => campaign.setField("redirectUrl", e.target.value)}
          className="
                        w-full
                        rounded-xl
                        border
                        border-slate-300
                        px-4
                        py-3
                        outline-none
                        focus:border-indigo-500
                    "
        />
      </section>

      {/* CATEGORY */}

      <section className="space-y-2">
        <label
          className="
                        text-sm
                        font-semibold
                    "
        >
          Category
        </label>

        <select
          disabled={campaign.loading}
          value={campaign.form.category}
          onChange={(e) =>
            campaign.setField(
              "category",
              e.target.value as NotificationCategoryValue,
            )
          }
          className="
                        w-full
                        rounded-xl
                        border
                        border-slate-300
                        px-4
                        py-3
                    "
        >
          {(
            Object.values(NotificationCategory) as NotificationCategoryValue[]
          ).map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </section>

      {/* TYPE */}

      <section className="space-y-2">
        <label
          className="
                        text-sm
                        font-semibold
                    "
        >
          Notification Type
        </label>

        <select
          disabled={campaign.loading}
          value={campaign.form.type}
          onChange={(e) =>
            campaign.setField("type", e.target.value as NotificationTypeValue)
          }
          className="
                        w-full
                        rounded-xl
                        border
                        border-slate-300
                        px-4
                        py-3
                    "
        >
          {(Object.values(NotificationType) as NotificationTypeValue[]).map(
            (type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ),
          )}
        </select>
      </section>

      {/* TARGET */}

      <section className="space-y-2">
        <label
          className="
                        text-sm
                        font-semibold
                    "
        >
          Target
        </label>

        <select
          disabled={campaign.loading}
          value={campaign.form.targetType}
          onChange={(e) =>
            campaign.setField(
              "targetType",
              e.target.value as CampaignTargetValue,
            )
          }
          className="
                        w-full
                        rounded-xl
                        border
                        border-slate-300
                        px-4
                        py-3
                    "
        >
          {(Object.values(CampaignTarget) as CampaignTargetValue[]).map(
            (target) => (
              <option key={target} value={target}>
                {target}
              </option>
            ),
          )}
        </select>
      </section>

      {/* TARGET VALUE */}

      <section className="space-y-2">
        <label
          className="
                        text-sm
                        font-semibold
                    "
        >
          Target Value
        </label>

        <input
          disabled={campaign.loading}
          type="text"
          value={campaign.form.targetValue}
          onChange={(e) => campaign.setField("targetValue", e.target.value)}
          className="
                        w-full
                        rounded-xl
                        border
                        border-slate-300
                        px-4
                        py-3
                    "
        />
      </section>

      {/* ACTION */}

      <section className="space-y-2">
        <label
          className="
            text-sm
            font-semibold
        "
        >
          Action
        </label>

        <select
          disabled={campaign.loading}
          value={campaign.form.action}
          onChange={(e) => {
            const action = e.target.value as CampaignActionValue;

            campaign.setField("action", action);

            if (action !== CampaignAction.SCHEDULE) {
              campaign.setField("scheduledAt", "");
            }
          }}
          className="
            w-full
            rounded-xl
            border
            border-slate-300
            px-4
            py-3
        "
        >
          {(Object.values(CampaignAction) as CampaignActionValue[]).map(
            (action) => (
              <option key={action} value={action}>
                {action}
              </option>
            ),
          )}
        </select>
      </section>

      {/* SCHEDULE */}

      {campaign.form.action === CampaignAction.SCHEDULE && (
        <section className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label
              className="
                            text-sm
                            font-semibold
                        "
            >
              Schedule
            </label>

            <input
              disabled={campaign.loading}
              type="datetime-local"
              value={campaign.form.scheduledAt ?? ""}
              onChange={(e) => campaign.setField("scheduledAt", e.target.value)}
              className="
                            w-full
                            rounded-xl
                            border
                          border-slate-300
                            px-4
                            py-3
                        "
            />
            {campaign.errors.scheduledAt && (
              <p
                className="
                                    text-sm
                                  text-red-500
                                "
              >
                {campaign.errors.scheduledAt}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              className="
                            text-sm
                            font-semibold
                        "
            >
              Expire
            </label>

            <input
              disabled={campaign.loading}
              type="datetime-local"
              value={campaign.form.expiresAt ?? ""}
              onChange={(e) => campaign.setField("expiresAt", e.target.value)}
              className="
                            w-full
                            rounded-xl
                            border
                            border-slate-300
                            px-4
                            py-3
                        "
            />
            {campaign.errors.expiresAt && (
              <p
                className="
                                    text-sm
                                  text-red-500
                                "
              >
                {campaign.errors.expiresAt}
              </p>
            )}
          </div>
        </section>
      )}

      {/* ACTION */}

      <div
        className="
                    flex
                    justify-end
                    gap-4
                    pt-6
                "
      >
        <button
          type="button"
          onClick={campaign.reset}
          className="
                        rounded-xl
                        border
                        px-5
                        py-3
                    "
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={campaign.loading}
          className="
                        rounded-xl
                        bg-indigo-600
                        px-5
                        py-3
                        font-semibold
                        text-white
                    "
        >
          {campaign.loading ? "Updating..." : "Save Campaign"}
        </button>
      </div>
    </form>
  );
}