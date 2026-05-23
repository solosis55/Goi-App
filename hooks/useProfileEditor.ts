import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";
import { Alert, Platform } from "react-native";
import { getProfile, updateProfile, uploadProfileAvatar, uploadProfileBanner } from "../api/auth";
import { ApiError } from "../api/client";
import { profileFormSchema, type ProfileForm } from "../constants/profileSchema";
import { useAuth } from "../context/AuthContext";
import type { ProfileUser, SafeUser } from "../types/auth";
import { getErrorMessage } from "../utils/errorMessages";
import { pickProfileImage } from "../utils/profileImagePick";

export function profileToForm(user: ProfileUser): ProfileForm {
  return {
    username: user.username ?? "",
    bio: user.bio ?? "",
    goal: user.goal ?? "",
    location: user.location ?? "",
    websiteUrl: user.websiteUrl ?? "",
    instagramUrl: user.instagramUrl ?? "",
    stravaUrl: user.stravaUrl ?? "",
    profileVisibility: user.profileVisibility === "followers" ? "followers" : "public",
    bannerShowInFeed: user.bannerShowInFeed !== false,
  };
}

function formsEqual(a: ProfileForm, b: ProfileForm): boolean {
  return (
    a.username === b.username &&
    a.bio === b.bio &&
    a.goal === b.goal &&
    a.location === b.location &&
    a.websiteUrl === b.websiteUrl &&
    a.instagramUrl === b.instagramUrl &&
    a.stravaUrl === b.stravaUrl &&
    a.profileVisibility === b.profileVisibility &&
    a.bannerShowInFeed === b.bannerShowInFeed
  );
}

export function useProfileEditor() {
  const { user, updateSessionUser } = useAuth();

  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [form, setForm] = useState<ProfileForm | null>(null);
  const [baseline, setBaseline] = useState<ProfileForm | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setLoadError(null);
    try {
      const res = await getProfile(user.id);
      setProfile(res.user);
      const next = profileToForm(res.user);
      setForm(next);
      setBaseline(next);
    } catch (e) {
      setLoadError(getErrorMessage(e, "No se pudo cargar el perfil."));
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      if (!user?.id) return;
      void loadProfile();
    }, [user?.id, loadProfile])
  );

  const patchForm = useCallback((patch: Partial<ProfileForm>) => {
    setForm((prev) => (prev ? { ...prev, ...patch } : prev));
    setSubmitError(null);
    setSuccessMessage(null);
  }, []);

  const isDirty = useMemo(() => {
    if (!form || !baseline) return false;
    return !formsEqual(form, baseline);
  }, [form, baseline]);

  const restricted = profile?.restrictedToFollowers === true;
  const busy = saving || uploadingAvatar || uploadingBanner;

  const applyProfile = useCallback(
    async (nextUser: SafeUser) => {
      const nextProfile: ProfileUser = {
        ...nextUser,
        email: profile?.email ?? nextUser.email,
      };
      setProfile(nextProfile);
      const nextForm = profileToForm(nextProfile);
      setForm(nextForm);
      setBaseline(nextForm);
      await updateSessionUser(nextUser);
    },
    [updateSessionUser, profile?.email]
  );

  const onSave = useCallback(async () => {
    if (!user?.id || !form || restricted) return;
    setFieldErrors({});
    setSubmitError(null);
    setSuccessMessage(null);

    const parsed = profileFormSchema.safeParse(form);
    if (!parsed.success) {
      const out: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "_root");
        if (!out[key]) out[key] = issue.message;
      }
      setFieldErrors(out);
      return;
    }

    setSaving(true);
    try {
      const res = await updateProfile(user.id, {
        username: parsed.data.username,
        bio: parsed.data.bio,
        goal: parsed.data.goal,
        location: parsed.data.location,
        websiteUrl: parsed.data.websiteUrl,
        instagramUrl: parsed.data.instagramUrl,
        stravaUrl: parsed.data.stravaUrl,
        profileVisibility: parsed.data.profileVisibility,
        bannerShowInFeed: parsed.data.bannerShowInFeed,
      });
      await applyProfile(res.user);
      setSuccessMessage("Perfil guardado");
    } catch (e) {
      setSubmitError(getErrorMessage(e, "No se pudo guardar el perfil."));
    } finally {
      setSaving(false);
    }
  }, [user?.id, form, restricted, applyProfile, profile?.email]);

  const uploadImage = useCallback(
    async (kind: "avatar" | "banner") => {
      if (!user?.id || restricted || busy) return;

      const picked = await pickProfileImage(kind);
      if (!picked.ok) {
        if ("cancelled" in picked && picked.cancelled) return;
        const msg = "error" in picked ? picked.error : "No se pudo elegir la imagen.";
        setImageError(msg);
        return;
      }

      setImageError(null);
      const setUploading = kind === "avatar" ? setUploadingAvatar : setUploadingBanner;
      setUploading(true);

      try {
        const { url } =
          kind === "avatar"
            ? await uploadProfileAvatar(user.id, picked.uri, picked.mimeType)
            : await uploadProfileBanner(user.id, picked.uri, picked.mimeType);

        const patch = kind === "avatar" ? { avatarUrl: url } : { bannerUrl: url };
        const res = await updateProfile(user.id, patch);
        await applyProfile(res.user);

        if (Platform.OS !== "web") {
          Alert.alert("Goi", kind === "avatar" ? "Foto actualizada." : "Cabecera actualizada.");
        }
      } catch (e) {
        const fallback = kind === "avatar" ? "No se pudo subir la foto." : "No se pudo subir la cabecera.";
        setImageError(e instanceof ApiError ? getErrorMessage(e, fallback) : fallback);
      } finally {
        setUploading(false);
      }
    },
    [user?.id, restricted, busy, applyProfile, profile?.email]
  );

  return {
    user,
    profile,
    form,
    fieldErrors,
    loading,
    saving,
    uploadingAvatar,
    uploadingBanner,
    loadError,
    submitError,
    successMessage,
    imageError,
    isDirty,
    restricted,
    busy,
    patchForm,
    onSave,
    loadProfile,
    changeAvatar: () => void uploadImage("avatar"),
    changeBanner: () => void uploadImage("banner"),
  };
}
