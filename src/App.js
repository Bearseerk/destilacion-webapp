import { useState } from "react";
import LoginDestilacionNuevo from "./LoginDestilacionNuevo";
import DestilacionDashboard from "./DestilacionDashboard";

function App() {
  const [pantalla, setPantalla] = useState("login");
  const [usuario, setUsuario] = useState(null);

  if (pantalla === "dashboard") {
    return (
      <DestilacionDashboard
        usuario={usuario}
        onLogout={() => {
          setUsuario(null);
          setPantalla("login");
        }}
      />
    );
  }

  return (
    <LoginDestilacionNuevo
      onLogin={(user) => {
        setUsuario(user);
        setPantalla("dashboard");
      }}
    />
  );
}

export default App;
