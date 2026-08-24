"use client";

import {
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

import { useRouter } from "next/navigation";

import MobileEditProfileView from "@/components/profile/mobile/MobileEditProfileView";
import DesktopEditProfileView from "@/components/profile/desktop/DesktopEditProfileView";

import { supabase } from "@/lib/supabase/client";

import { useCurrentUser } from "@/features/profile/hooks/useCurrentUser";

import imageCompression from "browser-image-compression";

interface ProfileData {
  fullName: string;
  username: string;
  bio: string;
  location: string;
  avatarUrl?: string;
}

function createProfileData(user: {
  fullName?: string | null;
  username?: string | null;
  bio?: string | null;
  location?: string | null;
  avatarUrl?: string | null;
}): ProfileData {
  return {
    fullName: user.fullName || "",
    username: user.username || "",
    bio: user.bio || "",
    location: user.location || "",
    avatarUrl: user.avatarUrl || "",
  };
}

export default function EditProfilePage() {
  const router = useRouter();

  const {
    user,
    loading: currentUserLoading,
    refresh,
  } = useCurrentUser();

  const [profile, setProfile] = useState<ProfileData | null>(null);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [avatarPreview, setAvatarPreview] = useState("");

  const [saving, setSaving] = useState(false);

  /**
   * Form dianggap loading selama current user
   * belum tersedia.
   */
  const loading =
    currentUserLoading || !user || !profile;

  /**
   * Ketika user sudah tersedia tetapi profile state
   * belum pernah diinisialisasi, gunakan data user
   * sebagai initial form value.
   *
   * Catatan:
   * Ini bukan useEffect sehingga tidak memicu
   * cascading render dari effect.
   */
  if (user && !profile) {
    const initialProfile = createProfileData(user);

    setProfile(initialProfile);
    setAvatarPreview(initialProfile.avatarUrl || "");
  }

  function handleAvatarChange(file: File) {
    setAvatarFile(file);

    const preview = URL.createObjectURL(file);

    setAvatarPreview(preview);
  }

  async function handleSaveProfile() {
    try {
      if (!user || !profile || saving) return;

      setSaving(true);

      let avatarUrl = profile.avatarUrl || "";

      if (avatarFile) {
        const compressedFile = await imageCompression(
          avatarFile,
          {
            maxSizeMB: 0.2,
            maxWidthOrHeight: 300,
            useWebWorker: true,
          },
        );

        const filePath = `${user.id}.jpg`;

        const { error: uploadError } =
          await supabase.storage
            .from("avatars")
            .upload(filePath, compressedFile, {
              upsert: true,
            });

        if (uploadError) {
          console.error(
            "UPLOAD ERROR:",
            uploadError,
          );

          alert(
            JSON.stringify(
              uploadError,
              null,
              2,
            ),
          );

          return;
        }

        const { data: publicUrlData } =
          supabase.storage
            .from("avatars")
            .getPublicUrl(filePath);

        avatarUrl =
          `${publicUrlData.publicUrl}?t=${Date.now()}`;
      }

      const { error } = await supabase
        .from("users")
        .update({
          full_name: profile.fullName,
          username: profile.username,
          bio: profile.bio,
          location: profile.location,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) {
        console.error(
          "UPDATE PROFILE ERROR:",
          error,
        );

        return;
      }

      await refresh();

      alert("Profile berhasil diperbarui!");

      router.push("/profile");
    } catch (error) {
      console.error(
        "SAVE PROFILE ERROR:",
        error,
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading || !profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">
          Memuat profile...
        </p>
      </main>
    );
  }

  return (
    <>
      <MobileEditProfileView
        profile={profile}
        setProfile={
          setProfile as Dispatch<
            SetStateAction<ProfileData>
          >
        }
        loading={saving}
        avatarPreview={avatarPreview}
        onAvatarChange={handleAvatarChange}
        onSave={handleSaveProfile}
      />

      <DesktopEditProfileView
        profile={profile}
        setProfile={
          setProfile as Dispatch<
            SetStateAction<ProfileData>
          >
        }
        loading={saving}
        avatarPreview={avatarPreview}
        onAvatarChange={handleAvatarChange}
        onSave={handleSaveProfile}
      />
    </>
  );
}