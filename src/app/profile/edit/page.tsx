"use client";

import {
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import MobileEditProfileView from "@/components/profile/mobile/MobileEditProfileView";

import DesktopEditProfileView from "@/components/profile/desktop/DesktopEditProfileView";

import { supabase } from "@/lib/supabase/client";

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
    async function loadUser() {
      try {

        const {
          data: { user },
        } =
          await supabase.auth.getUser();

        if (!user) return;

        const { data: profileData } =
          await supabase
            .from("users")
            .select(`
              full_name,
              username,
              bio,
              location,
              avatar_url
            `)
            .eq("id", user.id)
            .single();

        setProfile({
          fullName:
            profileData?.full_name || "",

          username:
            profileData?.username || "",

          bio:
            profileData?.bio || "",

          location:
            profileData?.location || "",

          avatarUrl:
            profileData?.avatar_url || "",
        });

        setAvatarPreview(
          profileData?.avatar_url || ""
        );

      } catch (error) {
        console.error(error);

      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

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

      const {
        data: { user },
      } =
        await supabase.auth.getUser();

      if (!user) return;

      let avatarUrl =
        profile.avatarUrl || "";

      if (avatarFile) {

        console.log(
          "Avatar dipilih:",
          avatarFile.name
        );

        const compressedFile =
          await imageCompression(
            avatarFile,
            {
              maxSizeMB: 0.2,
              maxWidthOrHeight: 300,
              useWebWorker: true,
            }
          );

        console.log(
          "Compressed:",
          compressedFile
        );

        const filePath =
          `${user.id}.jpg`;

          console.log(
  "Upload path:",
  filePath
);

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

      console.log(
  "Avatar URL:",
  avatarUrl
);

      const { error } =
        await supabase
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