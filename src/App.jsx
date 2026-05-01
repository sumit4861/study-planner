import { useState } from "react";
import Auth from "./components/Auth";
import Dashboard from "./pages/Dashboard";


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  return (
    <div>
      {isLoggedIn ? (
        <Dashboard setIsLoggedIn={setIsLoggedIn} />) :
        (<Auth setIsLoggedIn={setIsLoggedIn} />)
      }
    </div>
  );
}

export default App;