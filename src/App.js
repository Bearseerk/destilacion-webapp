import { useState } from "react";
import LoginDestilacionNuevo from "./LoginDestilacionNuevo";
import DestilacionDashboard from "./DestilacionDashboard";

function App() {
  const [pantalla, setPantalla] = useState("login");

  if (pantalla === "dashboard") {
    return <DestilacionDashboard onLogout={() => setPantalla("login")} />;
  }

  return <LoginDestilacionNuevo onLogin={() => setPantalla("dashboard")} />;
}

export default App;
