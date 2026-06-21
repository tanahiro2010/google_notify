import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#1967d2",
      light: "#e8f0fe",
    },
    error: {
      main: "#d93025",
    },
    text: {
      primary: "#202124",
      secondary: "#5f6368",
    },
    divider: "#e0e0e0",
    background: {
      default: "#ffffff",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: "1.5rem", fontWeight: 600 },
    h2: { fontSize: "1rem", fontWeight: 600 },
    body2: { fontSize: "0.875rem" },
    caption: { fontSize: "0.75rem" },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 8,
        },
      },
    },
  },
});
