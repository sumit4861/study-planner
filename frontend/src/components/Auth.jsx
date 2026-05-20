import { useState } from "react";
import styles from "./Auth.module.css";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;
function Auth({ setIsLoggedIn }) {

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] =
    useState(false);

  const [isLogin, setIslogin] =
    useState(true);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {

    setError("");

    const url = isLogin
      ? `${API}/api/auth/login`
      : `${API}/api/auth/signup`

    const body = isLogin
      ? {
        email: form.email,
        password: form.password
      }
      : form;

    try { 
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) {
        setError(
          data.msg || "Something went wrong."
        );
        return;
      }
      if (isLogin) {
        localStorage.setItem(
          "token",
          data.token
        );
        setIsLoggedIn(true);
        navigate("/");
      } else {
        setError("");
        setIslogin(true);
      }
    } catch (err) {
      setError("Server error. Try again.");
    }
  };

  return (
    <div className={styles.authPage}>

      {/* LEFT SIDE */}
      <div className={styles.leftPanel}>

        <div className={styles.overlay} />

        <div className={styles.leftContent}>
          <h1>📚 StudyAI</h1>

          <p>
            Smart planning for focused students.
          </p>
        </div>

      </div>

      {/* RIGHT SIDE */}
      <div className={styles.rightPanel}>

        <form
          className={styles.authCard}
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >

          <h2>
            {isLogin
              ? "Welcome Back 👋"
              : "Create Account"}
          </h2>

          <p className={styles.subtitle}>
            {isLogin
              ? "Login to continue your productivity journey"
              : "Start organizing smarter today"}
          </p>

          {/* NAME */}
          {!isLogin && (
            <div className={styles.inputGroup}>
              <label>Name</label>

              <input
                name="name"
                placeholder="Enter your name"
                onChange={handleChange}
                className={styles.input}
              />
            </div>
          )}

          {/* EMAIL */}
          <div className={styles.inputGroup}>
            <label>Email</label>

            <input
              name="email"
              type="email"
              placeholder="Enter your email"
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          {/* PASSWORD */}
          <div className={styles.inputGroup}>
            <label>Password</label>

            <div className={styles.passwordBox}>

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }

                name="password"

                placeholder="Enter password"

                onChange={handleChange}

                className={styles.input}
              />

              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
              >
                {showPassword ? "🙈" : "👁"}
              </button>

            </div>
          </div>

          {/* ERROR */}
          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          {/* BUTTON */}
          <button
            className={styles.submitBtn}
            type="submit"
          >
            {isLogin
              ? "Login"
              : "Create Account"}
          </button>

          {/* SWITCH */}
          <p
            className={styles.switchText}
            onClick={() =>
              setIslogin(!isLogin)
            }
          >
            {isLogin
              ? "Don't have an account? Signup"
              : "Already have an account? Login"}
          </p>

        </form>

      </div>

    </div>
  );
}

export default Auth;