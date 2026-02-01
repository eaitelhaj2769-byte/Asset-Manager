import { Platform } from "react-native";

const primaryColor = "#1E3A8A";
const secondaryColor = "#0EA5E9";

export const Colors = {
  light: {
    text: "#0F172A",
    textSecondary: "#64748B",
    buttonText: "#FFFFFF",
    tabIconDefault: "#64748B",
    tabIconSelected: primaryColor,
    link: primaryColor,
    primary: primaryColor,
    secondary: secondaryColor,
    backgroundRoot: "#FFFFFF",
    backgroundDefault: "#F8FAFC",
    backgroundSecondary: "#F1F5F9",
    backgroundTertiary: "#E2E8F0",
    success: "#10B981",
    error: "#EF4444",
    warning: "#F59E0B",
    disabled: "#9CA3AF",
    border: "#E2E8F0",
  },
  dark: {
    text: "#F1F5F9",
    textSecondary: "#94A3B8",
    buttonText: "#FFFFFF",
    tabIconDefault: "#64748B",
    tabIconSelected: secondaryColor,
    link: secondaryColor,
    primary: secondaryColor,
    secondary: primaryColor,
    backgroundRoot: "#0F172A",
    backgroundDefault: "#1E293B",
    backgroundSecondary: "#334155",
    backgroundTertiary: "#475569",
    success: "#10B981",
    error: "#EF4444",
    warning: "#F59E0B",
    disabled: "#6B7280",
    border: "#334155",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  inputHeight: 48,
  buttonHeight: 52,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 18,
  lg: 24,
  xl: 30,
  "2xl": 40,
  "3xl": 50,
  full: 9999,
};

export const Typography = {
  title1: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "700" as const,
  },
  title2: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: "600" as const,
  },
  title3: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "600" as const,
  },
  h1: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "700" as const,
  },
  h2: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "700" as const,
  },
  h3: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "600" as const,
  },
  h4: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400" as const,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "400" as const,
  },
  link: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400" as const,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "IBMPlexSans_400Regular",
    sansBold: "IBMPlexSans_700Bold",
    sansSemiBold: "IBMPlexSans_600SemiBold",
    arabic: "IBMPlexSansArabic_400Regular",
    arabicBold: "IBMPlexSansArabic_700Bold",
  },
  default: {
    sans: "IBMPlexSans_400Regular",
    sansBold: "IBMPlexSans_700Bold",
    sansSemiBold: "IBMPlexSans_600SemiBold",
    arabic: "IBMPlexSansArabic_400Regular",
    arabicBold: "IBMPlexSansArabic_700Bold",
  },
  web: {
    sans: "'IBM Plex Sans', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    sansBold: "'IBM Plex Sans', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    sansSemiBold: "'IBM Plex Sans', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    arabic: "'IBM Plex Sans Arabic', 'IBM Plex Sans', system-ui, sans-serif",
    arabicBold: "'IBM Plex Sans Arabic', 'IBM Plex Sans', system-ui, sans-serif",
  },
});

export const Shadows = {
  sm: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
    android: {
      elevation: 1,
    },
    default: {},
  }),
  md: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    android: {
      elevation: 3,
    },
    default: {},
  }),
  lg: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
    },
    android: {
      elevation: 6,
    },
    default: {},
  }),
  fab: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    android: {
      elevation: 4,
    },
    default: {},
  }),
};
