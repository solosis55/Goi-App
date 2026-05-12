import { Box, Text } from "@gluestack-ui/themed";
import { useGoiTheme } from "../constants/theme";

export default function Index() {
  const { palette, typography } = useGoiTheme();

  return (
    <Box
      flex={1}
      justifyContent="center"
      alignItems="center"
      style={{ backgroundColor: palette.background }}
    >
      <Text
        style={{
          color: palette.text,
          fontSize: typography.fontSize["2xl"],
          fontWeight: typography.fontWeight.semibold,
        }}
      >
        Goi
      </Text>
    </Box>
  );
}
