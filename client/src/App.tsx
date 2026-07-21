import { GoogleOAuthProvider } from "@react-oauth/google";
import { AppRouter } from "@/routes/AppRouter";
import { useThemeStore } from "@/store/themeStore";
import { useEffect } from "react";

function App() {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AppRouter />
    </GoogleOAuthProvider>
  );
}

export default App;
