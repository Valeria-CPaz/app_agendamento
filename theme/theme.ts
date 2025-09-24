const light = {
  primary: "#7D8D86",
  secondary: "#3F3F29",
  accent: "#BCA88D",
  background: "#F1F0E4",
  surface: "#fff",
  text: "#263238",
  textLight: "#5c7268ff",
  border: "#698d7dff",
  error: "#a80e0eff",
  success: "#189418ff",
  warning: "#d1aa0cff",
};
const dark = {
  ...light,
  primary: "#204544ff",
  secondary: "#ffffffff",
  accent: "#52412cff",
  background: "#9a9a9aff",
  surface: "#c1c1c1ff",
  text: "#2c3438ff",
  textLight: "#d3d3d3ff",
  border: "#b4b4b4ff",  
};

export function getTheme(themeName: "light" | "dark" = "light") {
  return themeName === "dark" ? dark : light;
}

