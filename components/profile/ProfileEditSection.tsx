import { useState } from "react";
import { Platform, Pressable, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { DEFAULT_PROFILE_EDIT_SUB_TAB, type ProfileEditSubTab } from "../../constants/profileEditTabs";
import type { ProfileForm } from "../../constants/profileSchema";
import type { useProfileEditor } from "../../hooks/useProfileEditor";
import { ProfileAccountSection } from "./ProfileAccountSection";
import { ProfileAccountSecuritySection } from "./ProfileAccountSecuritySection";
import { ProfileEditSubTabBar } from "./ProfileEditSubTabBar";
import { ProfileMutedSection } from "./ProfileMutedSection";

const PAD = 16;

function SectionTitle({ children }: { children: string }) {
  return (
    <Text style={styles.sectionTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
      {children}
    </Text>
  );
}

function FieldLabel({ children }: { children: string }) {
  return (
    <Text style={styles.label} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
      {children}
    </Text>
  );
}

type ProfileFieldProps = {
  label: string;
  fieldKey: string;
  value: string;
  onChangeText: (t: string) => void;
  error?: string;
  editable: boolean;
  multiline?: boolean;
  maxLength?: number;
  placeholder?: string;
  counter?: string;
  autoCapitalize?: "none" | "sentences";
  keyboardType?: "default" | "url";
};

function ProfileField({
  label,
  fieldKey,
  value,
  onChangeText,
  error,
  editable,
  multiline,
  maxLength,
  placeholder,
  counter,
  autoCapitalize,
  keyboardType,
}: ProfileFieldProps) {
  const a11yLabel = error ? `${label}, error: ${error}` : label;

  return (
    <View style={styles.field}>
      <FieldLabel>{label}</FieldLabel>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        multiline={multiline}
        maxLength={maxLength}
        placeholder={placeholder}
        placeholderTextColor={AUTH.muted}
        selectionColor={AUTH.gold}
        autoCapitalize={autoCapitalize ?? (keyboardType === "url" ? "none" : "sentences")}
        autoCorrect={false}
        keyboardType={keyboardType}
        maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
        accessibilityLabel={a11yLabel}
        accessibilityHint={editable ? `Editar ${label.toLowerCase()}` : undefined}
        nativeID={`profile-field-${fieldKey}`}
        style={[styles.input, multiline ? styles.textArea : null, !editable ? styles.inputDisabled : null]}
      />
      {counter ? (
        <Text style={styles.counter} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          {counter}
        </Text>
      ) : null}
      {error ? (
        <Text style={styles.fieldError} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

type ProfileEditSectionProps = {
  editor: ReturnType<typeof useProfileEditor>;
  userId?: string;
};

export function ProfileEditSection({ editor, userId }: ProfileEditSectionProps) {
  const [editSubTab, setEditSubTab] = useState<ProfileEditSubTab>(DEFAULT_PROFILE_EDIT_SUB_TAB);

  if (!editor.form) return null;

  const form = editor.form;
  const patch = (p: Partial<ProfileForm>) => editor.patchForm(p);
  const fieldsDisabled = editor.restricted || editor.saving;

  return (
    <View style={styles.wrap}>
      {editor.successMessage ? (
        <Text style={styles.success} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          {editor.successMessage}
        </Text>
      ) : null}
      {editor.submitError ? (
        <Text style={styles.errorText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          {editor.submitError}
        </Text>
      ) : null}
      {editor.imageError ? (
        <Text style={styles.errorText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          {editor.imageError}
        </Text>
      ) : null}

      <ProfileEditSubTabBar active={editSubTab} onChange={setEditSubTab} />

      {editor.isDirty && !editor.restricted ? (
        <Text style={styles.dirtyBanner} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER} accessibilityLiveRegion="polite">
          Tienes cambios sin guardar. Pulsa Guardar arriba.
        </Text>
      ) : null}

      {editSubTab === "public" ? (
        <ProfileEditPublicFields
          form={form}
          patch={patch}
          fieldErrors={editor.fieldErrors}
          fieldsDisabled={fieldsDisabled}
          restricted={editor.restricted}
          isDirty={editor.isDirty}
        />
      ) : (
        <ProfileEditPrivateFields
          form={form}
          patch={patch}
          fieldsDisabled={fieldsDisabled}
          restricted={editor.restricted}
          isDirty={editor.isDirty}
          userId={userId}
          privateTabActive={editSubTab === "private"}
          email={editor.profile?.email}
        />
      )}
    </View>
  );
}

function ProfileEditPublicFields({
  form,
  patch,
  fieldErrors,
  fieldsDisabled,
  restricted,
  isDirty,
}: {
  form: ProfileForm;
  patch: (p: Partial<ProfileForm>) => void;
  fieldErrors: Record<string, string>;
  fieldsDisabled: boolean;
  restricted: boolean;
  isDirty: boolean;
}) {
  return (
    <View style={styles.panel}>
      <Text style={styles.panelIntro} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        Lo que otros usuarios ven en tu perfil y publicaciones.
      </Text>

      <ProfileField
        label="Usuario"
        fieldKey="username"
        value={form.username}
        onChangeText={(username) => patch({ username })}
        error={fieldErrors.username}
        editable={!fieldsDisabled}
        maxLength={24}
        autoCapitalize="none"
      />

      <ProfileField
        label="Objetivo deportivo"
        fieldKey="goal"
        value={form.goal}
        onChangeText={(goal) => patch({ goal })}
        editable={!fieldsDisabled}
        maxLength={60}
        placeholder="Ganar fuerza"
        counter={`${form.goal.length}/60`}
      />

      <ProfileField
        label="Bio"
        fieldKey="bio"
        value={form.bio}
        onChangeText={(bio) => patch({ bio })}
        editable={!fieldsDisabled}
        multiline
        maxLength={200}
        placeholder="Cuéntanos sobre tu entrenamiento…"
        counter={`${form.bio.length}/200`}
      />

      <ProfileField
        label="Ubicación"
        fieldKey="location"
        value={form.location}
        onChangeText={(location) => patch({ location })}
        editable={!fieldsDisabled}
        maxLength={80}
        placeholder="Ciudad, país"
      />

      <SectionTitle>Enlaces</SectionTitle>

      <ProfileField
        label="Web"
        fieldKey="website"
        value={form.websiteUrl}
        onChangeText={(websiteUrl) => patch({ websiteUrl })}
        editable={!fieldsDisabled}
        placeholder="https://…"
        keyboardType="url"
        autoCapitalize="none"
      />

      <ProfileField
        label="Instagram"
        fieldKey="instagram"
        value={form.instagramUrl}
        onChangeText={(instagramUrl) => patch({ instagramUrl })}
        editable={!fieldsDisabled}
        placeholder="@usuario o enlace"
        autoCapitalize="none"
      />

      <ProfileField
        label="Strava"
        fieldKey="strava"
        value={form.stravaUrl}
        onChangeText={(stravaUrl) => patch({ stravaUrl })}
        editable={!fieldsDisabled}
        placeholder="Enlace Strava"
        keyboardType="url"
        autoCapitalize="none"
      />

      {!isDirty && !restricted ? (
        <Text style={styles.hint} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          Toca Guardar arriba para aplicar los cambios. La foto y la cabecera se actualizan al elegirlas en el hero.
        </Text>
      ) : null}
    </View>
  );
}

function ProfileEditPrivateFields({
  form,
  patch,
  fieldsDisabled,
  restricted,
  isDirty,
  userId,
  privateTabActive,
  email,
}: {
  form: ProfileForm;
  patch: (p: Partial<ProfileForm>) => void;
  fieldsDisabled: boolean;
  restricted: boolean;
  isDirty: boolean;
  userId?: string;
  privateTabActive: boolean;
  email?: string;
}) {
  return (
    <View style={styles.panel}>
      <Text style={styles.panelIntro} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        Quién puede ver tu perfil y cómo gestionas tu cuenta en este dispositivo.
      </Text>

      <SectionTitle>Visibilidad</SectionTitle>

      <FieldLabel>Perfil visible para</FieldLabel>
      <View style={styles.chipRow}>
        {(["public", "followers"] as const).map((v) => {
          const selected = form.profileVisibility === v;
          return (
            <PressableChip
              key={v}
              label={v === "public" ? "Todos" : "Seguidores"}
              selected={selected}
              disabled={fieldsDisabled}
              onPress={() => patch({ profileVisibility: v })}
            />
          );
        })}
      </View>

      <View style={styles.switchRow}>
        <Text
          style={styles.switchLabel}
          maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
          accessibilityRole="text"
        >
          Mostrar cabecera en el feed
        </Text>
        <Switch
          value={form.bannerShowInFeed}
          onValueChange={(bannerShowInFeed) => patch({ bannerShowInFeed })}
          disabled={fieldsDisabled}
          trackColor={{ false: AUTH.fieldBorder, true: AUTH.gold }}
          thumbColor={Platform.OS === "android" ? AUTH.neutral100 : undefined}
          accessibilityLabel="Mostrar cabecera en el feed"
          accessibilityRole="switch"
        />
      </View>

      {!isDirty && !restricted ? (
        <Text style={styles.hint} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          Toca Guardar arriba cuando cambies la visibilidad o las preferencias del feed.
        </Text>
      ) : null}

      <ProfileMutedSection userId={userId} active={privateTabActive} />

      <ProfileAccountSecuritySection email={email} />

      <ProfileAccountSection />
    </View>
  );
}

function PressableChip({
  label,
  selected,
  disabled,
  onPress,
}: {
  label: string;
  selected: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected ? styles.chipSelected : null,
        disabled ? styles.chipDisabled : null,
        pressed ? styles.chipPressed : null,
      ]}
    >
      <Text
        style={[styles.chipText, selected ? styles.chipTextSelected : null]}
        maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: PAD,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 14,
  },
  panel: {
    gap: 14,
  },
  panelIntro: {
    color: AUTH.faint,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 2,
  },
  sectionTitle: {
    color: AUTH.muted,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginTop: 8,
    marginBottom: 2,
  },
  field: {
    gap: 6,
  },
  label: {
    color: AUTH.label,
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: AUTH.fieldBorder,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: AUTH.steel,
    backgroundColor: AUTH.fieldBg,
  },
  inputDisabled: {
    opacity: 0.55,
  },
  textArea: {
    minHeight: 96,
    textAlignVertical: "top",
  },
  counter: {
    color: AUTH.faint,
    fontSize: 12,
  },
  fieldError: {
    color: AUTH.danger,
    fontSize: 12,
  },
  chipRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 4,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: AUTH.fieldBorder,
    backgroundColor: "rgba(23, 23, 23, 0.6)",
  },
  chipSelected: {
    borderColor: "rgba(212, 175, 55, 0.55)",
    backgroundColor: "rgba(35, 32, 22, 0.85)",
  },
  chipDisabled: {
    opacity: 0.5,
  },
  chipPressed: {
    opacity: 0.88,
  },
  chipText: {
    color: AUTH.muted,
    fontSize: 14,
    fontWeight: "600",
  },
  chipTextSelected: {
    color: AUTH.gold,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 4,
  },
  switchLabel: {
    flex: 1,
    color: AUTH.label,
    fontSize: 14,
  },
  hint: {
    color: AUTH.faint,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  success: {
    color: AUTH.success,
    fontSize: 14,
  },
  errorText: {
    color: AUTH.danger,
    fontSize: 14,
  },
  dirtyBanner: {
    color: "#fbbf24",
    fontSize: 13,
    lineHeight: 18,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.35)",
    backgroundColor: "rgba(40, 32, 16, 0.45)",
  },
});
