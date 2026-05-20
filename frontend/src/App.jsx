import { Routes, Route, Navigate } from "react-router-dom";

import { useState } from "react";

import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Plan from "./pages/Plan";
import Auth from "./components/Auth";

function App() {

  const [isLoggedIn, setIsLoggedIn] =
    useState(
      !!localStorage.getItem("token")
    );

  if (!isLoggedIn) {
    return (
      <Auth
        setIsLoggedIn={setIsLoggedIn}
      />
    );
  }

  return (

    <Routes>

      {/* DASHBOARD */}
      <Route
        path="/"
        element={
          <Dashboard
            setIsLoggedIn={setIsLoggedIn}
          />
        }
      />

      {/* TASKS */}
      <Route
        path="/tasks"
        element={<Tasks />}
      />

      {/* PLAN */}
      <Route
        path="/plan"
        element={<Plan />}
      />

      {/* LOGIN */}
      <Route
        path="/login"
        element={
          <Auth
            setIsLoggedIn={setIsLoggedIn}
          />
        }
      />

      {/* FALLBACK */}
      <Route
        path="*"
        element={<Navigate to="/" />}
      />

    </Routes>
  );
}

export default App;