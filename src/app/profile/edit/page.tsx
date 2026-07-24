"use client";

import {
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import MobileEditProfileView from "@/components/profile/mobile/MobileEditProfileView";

import DesktopEditProfileView from "@/components/profile/desktop/DesktopEditProfileView";

import { supabase } from "@/lib/supabase/client";

import { useCurrentUser } from "@/features/profile/hooks/useCurrentUser";

import imageCompression
  from "browser-image-compression";

interface ProfileData {
  fullName: string;
  username: string;
  bio: string;
  location: string;
  avatarUrl?: string;
}

export default function EditProfilePage() {

  const router = useRouter();

  const {
  user,
  loading: currentUserLoading,
  refresh,
} = useCurrentUser();

  const [profile, setProfile] =
    useState<ProfileData>({
      fullName: "",
      username: "",
      bio: "",
      location: "",
      avatarUrl: "",
    });

  const [loading, setLoading] =
    useState(true);

  const [
    avatarFile,
    setAvatarFile,
  ] = useState<File | null>(
    null
  );

  const [
    avatarPreview,
    setAvatarPreview,
  ] = useState("");

  useEffect(() => {

    if (currentUserLoading) return;

    if (!user) {
      setLoading(false);
      return;
    }

    setProfile({
      fullName: user.fullName || "",
      username: user.username || "",
      bio: user.bio || "",
      location: user.location || "",
      avatarUrl: user.avatarUrl || "",
    });

    setAvatarPreview(
      user.avatarUrl || ""
    );

    setLoading(false);

  }, [
    user,
    currentUserLoading,
  ]);

  function handleAvatarChange(
    file: File
  ) {

    setAvatarFile(file);

    const preview =
      URL.createObjectURL(
        file
      );

    setAvatarPreview(
      preview
    );
  }

  async function handleSaveProfile() {

    try {

      if (!user) return;

      let avatarUrl =
        profile.avatarUrl || "";

      if (avatarFile) {

        const compressedFile =
          await imageCompression(
            avatarFile,
            {
              maxSizeMB: 0.2,
              maxWidthOrHeight: 300,
              useWebWorker: true,
            }
          );

        const filePath =
          `${user.id}.jpg`;

        const {
          error: uploadError,
        } = await supabase
          .storage
          .from("avatars")
          .upload(
            filePath,
            compressedFile,
            {
              upsert: true,
            }
          );

        if (uploadError) {

          console.error(
            "UPLOAD ERROR:",
            uploadError
          );

          alert(
            JSON.stringify(
              uploadError,
              null,
              2
            )
          );

          return;
        }
        const {
          data: publicUrlData,
        } = supabase
          .storage
          .from("avatars")
          .getPublicUrl(
            filePath
          );

        avatarUrl =
          `${publicUrlData.publicUrl}?t=${Date.now()}`;
      }

      const { error } = await supabase

        .from("users")
        .update({

          full_name:
            profile.fullName,

          username:
            profile.username,

          bio:
            profile.bio,

          location:
            profile.location,

          avatar_url:
            avatarUrl,

          updated_at:
            new Date().toISOString(),
        })

        .eq("id", user.id);

      if (error) {
        console.error(error);
        return;
      }

      await refresh();

      alert(
        "Profile berhasil diperbarui!"
      );

      router.push("/profile");

    } catch (error) {
      console.error(error);
    }
  }

  return (
    <>
      <MobileEditProfileView
        profile={profile}
        setProfile={setProfile}
        loading={loading}
        avatarPreview={
          avatarPreview
        }

        onAvatarChange={
          handleAvatarChange
        }
        onSave={handleSaveProfile}
      />

      <DesktopEditProfileView
        profile={profile}
        setProfile={setProfile}
        loading={loading}
        avatarPreview={
          avatarPreview
        }

        onAvatarChange={
          handleAvatarChange
        }
        onSave={handleSaveProfile}
      />
    </>
  );
}