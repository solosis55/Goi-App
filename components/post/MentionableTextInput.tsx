import { useCallback, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import type { MentionPickUser } from "../../utils/mentionAutocomplete";
import { filterMentionCandidates, getActiveMention } from "../../utils/mentionAutocomplete";
import { UserAvatar } from "../ui/UserAvatar";

type MentionableTextInputProps = Omit<TextInputProps, "value" | "onChangeText"> & {
  value: string;
  onChangeText: (text: string) => void;
  candidates: MentionPickUser[];
  onMentionPick?: (picked: MentionPickUser) => void;
  listPlacement?: "above" | "below";
};

function MentionSuggestionRow({
  user,
  onPress,
}: {
  user: MentionPickUser;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.suggestionRow, pressed ? styles.suggestionPressed : null]}
      accessibilityRole="button"
      accessibilityLabel={`Mencionar a ${user.username}`}
    >
      <UserAvatar src={user.avatarUrl} username={user.username} size={32} />
      <View style={styles.suggestionBody}>
        <Text style={styles.suggestionUser} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          @{user.username}
        </Text>
        {user.isFollowing ? (
          <Text style={styles.suggestionMeta} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Siguiendo
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

export function MentionableTextInput({
  value,
  onChangeText,
  candidates,
  onMentionPick,
  listPlacement = "below",
  style,
  ...rest
}: MentionableTextInputProps) {
  const inputRef = useRef<TextInput>(null);
  const selectionRef = useRef({ start: value.length, end: value.length });
  const [caretTick, setCaretTick] = useState(0);

  const mentionState = useMemo(() => {
    void caretTick;
    return getActiveMention(value, selectionRef.current.start);
  }, [value, caretTick]);

  const filtered = useMemo(
    () => filterMentionCandidates(candidates, mentionState?.query ?? ""),
    [candidates, mentionState?.query]
  );

  const showList = mentionState !== null && filtered.length > 0;

  const bumpCaret = useCallback(() => setCaretTick((n) => n + 1), []);

  const insertMention = useCallback(
    (picked: MentionPickUser) => {
      if (!mentionState) return;
      const { triggerIndex } = mentionState;
      const caret = selectionRef.current.start;
      const before = value.slice(0, triggerIndex);
      const tail = value.slice(caret);
      const insert = `@${picked.username} `;
      const next = `${before}${insert}${tail}`;
      const pos = triggerIndex + insert.length;
      onChangeText(next);
      onMentionPick?.(picked);
      selectionRef.current = { start: pos, end: pos };
      bumpCaret();
      requestAnimationFrame(() => {
        inputRef.current?.setNativeProps?.({ selection: { start: pos, end: pos } });
        inputRef.current?.focus();
      });
    },
    [mentionState, value, onChangeText, onMentionPick, bumpCaret]
  );

  const suggestionList = showList ? (
    <View style={[styles.listWrap, listPlacement === "above" ? styles.listAbove : styles.listBelow]}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="always"
        style={styles.list}
        renderItem={({ item }) => (
          <MentionSuggestionRow user={item} onPress={() => insertMention(item)} />
        )}
      />
    </View>
  ) : null;

  return (
    <View style={styles.wrap}>
      {listPlacement === "above" ? suggestionList : null}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(text) => {
          onChangeText(text);
          bumpCaret();
        }}
        onSelectionChange={(e) => {
          selectionRef.current = e.nativeEvent.selection;
          bumpCaret();
        }}
        style={style}
        {...rest}
      />
      {listPlacement === "below" ? suggestionList : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "relative",
    zIndex: 1,
  },
  listWrap: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.35)",
    backgroundColor: "rgba(12, 12, 14, 0.98)",
    maxHeight: 168,
    overflow: "hidden",
  },
  listAbove: {
    marginBottom: 8,
  },
  listBelow: {
    marginTop: 8,
  },
  list: {
    flexGrow: 0,
  },
  suggestionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  suggestionPressed: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  suggestionBody: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  suggestionUser: {
    color: AUTH.neutral100,
    fontSize: 14,
    fontWeight: "600",
  },
  suggestionMeta: {
    color: AUTH.gold,
    fontSize: 11,
    fontWeight: "600",
  },
});
