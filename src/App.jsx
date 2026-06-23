import { AppProvider } from "./store/AppProvider";
import { Shell } from "./components/Shell";
import "./styles.css";

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
