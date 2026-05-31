import type { ReactNode } from "react";
import { Text, type StyleProp, type TextStyle } from "react-native";
import { AUTH } from "../../constants/authUi";

const MENTION_TOKEN = /@([a-zA-Z][a-zA-Z0-9_]{2,23})\b/g;

type MentionHighlightedTextProps = {
  text: string;
  userDirectory: Map<string, string>;
  onOpenProfile?: (userId: string) => void;
  style?: StyleProp<TextStyle>;
  mentionStyle?: StyleProp<TextStyle>;
};

export function MentionHighlightedText({
  text,
  userDirectory,
  onOpenProfile,
  style,
  mentionStyle,
}: MentionHighlightedTextProps) {
  if (!text) return null;

  const children: ReactNode[] = [];
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  const re = new RegExp(MENTION_TOKEN.source, MENTION_TOKEN.flags);
  while ((m = re.exec(text)) !== null) {
    const [full, username] = m;
    const start = m.index;
    if (start > lastIndex) {
      children.push(text.slice(lastIndex, start));
    }
    const userId = userDirectory.get(username.toLowerCase());
    if (userId && onOpenProfile) {
      children.push(
        <Text
          key={`${start}-${username}`}
          style={[style, mentionStyle ?? defaultMentionStyle]}
          onPress={() => onOpenProfile(userId)}
          suppressHighlighting
        >
          {full}
        </Text>
      );
    } else {
      children.push(full);
    }
    lastIndex = start + full.length;
  }
  if (lastIndex < text.length) {
    children.push(text.slice(lastIndex));
  }

  return <Text style={style}>{children}</Text>;
}

const defaultMentionStyle = {
  color: AUTH.gold,
  fontWeight: "600" as const,
};
