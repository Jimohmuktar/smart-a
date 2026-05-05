import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = __dirname;

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": root,
      "react-native": path.resolve(root, "src/lib/rn-web.jsx"),
      "expo-router": path.resolve(root, "src/lib/router.jsx"),
      "@expo/vector-icons": path.resolve(root, "src/lib/icons.jsx"),
      "expo-linear-gradient": path.resolve(root, "src/lib/linear-gradient.jsx"),
      "react-native-safe-area-context": path.resolve(root, "src/lib/safe-area.jsx"),
      "expo-haptics": path.resolve(root, "src/lib/haptics.js"),
      "expo-notifications": path.resolve(root, "src/lib/expo-notifications.js"),
      "@react-native-async-storage/async-storage": path.resolve(root, "src/lib/async-storage.js"),
      "expo/fetch": path.resolve(root, "src/lib/expo-fetch.js"),
      "expo-splash-screen": path.resolve(root, "src/lib/splash-screen.js"),
      "@expo-google-fonts/inter": path.resolve(root, "src/lib/google-fonts.jsx"),
      "react-native-gesture-handler": path.resolve(root, "src/lib/noop.jsx"),
      "react-native-keyboard-controller": path.resolve(root, "src/lib/noop.jsx"),
      "@workspace/api-client-react": path.resolve(root, "src/lib/api-client.js"),
    },
  },
  server: {
    host: true,
    port: parseInt(process.env.PORT) || 5000,
    allowedHosts: true,
  },
});
