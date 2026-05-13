import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Dashboard from "../pages/Dashboard";
import Tasks from "../pages/Tasks";
import Plan from "../pages/Plan";

function Main() {
  return (
    <BrowserRouter>
      <div className="app">
        {/* <Sidebar /> */}

        <div className="main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/plan" element={<Plan />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default Main;