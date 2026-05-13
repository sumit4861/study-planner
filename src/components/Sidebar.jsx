import { useNavigate, useLocation } from "react-router-dom";
import styles from "./Sidebar.module.css";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menu = [
    { name: "Dashboard", path: "/", icon: "📊" },
    { name: "Tasks", path: "/tasks", icon: "📋" },
    { name: "Plan", path: "/plan", icon: "🧠" }
  ];

  return (
    <aside className={styles.sidebar}>

      {/* LOGO */}
      <div className={styles.topSection}>
        <h2 className={styles.logo}>
          📘 StudyAI
        </h2>

        {/* MENU */}
        <div className={styles.menu}>
          {menu.map((item) => (
            <div
              key={item.path}
              className={`${styles.menuItem} ${location.pathname === item.path
                  ? styles.active
                  : ""
                }`}
              onClick={() => navigate(item.path)}
            >
              <span className={styles.icon}>
                {item.icon}
              </span>

              <span>{item.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* LOGOUT */}
      <div
        className={styles.logout}
        onClick={() => {
          localStorage.removeItem("token");
          navigate("/login");
        }}
      >
        🚪 Logout
      </div>

    </aside>
  );
}

export default Sidebar;