import { useSafeAreaInsets } from "react-native-safe-area-context";
import { APP_HEADER_HEIGHT } from "@/components/AppHeader";

export function useHeaderOffset() {
  const insets = useSafeAreaInsets();
  return insets.top + APP_HEADER_HEIGHT;
}
