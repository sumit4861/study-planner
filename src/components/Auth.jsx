import { useState } from "react";

function Auth({setIsLoggedIn}) {
  const [error, setError] = useState("");
  const [isLogin, setIslogin] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setError("");
    const url = isLogin ? 
    "http://localhost:5000/api/auth/login"
    : "http://localhost:5000/api/auth/signup";
    
    const body = isLogin ?
    {email: form.email, password: form.password} 
    : form;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
    
    const data = await res.json();

    if(!res.ok) {
      setError(data.msg || "Something went wrong.");
      return ;
    }
    if(isLogin) {
      localStorage.setItem("token", data.token);
      setIsLoggedIn(true);
    } else {
      alert("Signup successful! Now login.");
      setIslogin(true);
    }
    
  };

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <h2>{isLogin ? "Login" : "Signup"}</h2>
      {!isLogin && (
        <input 
          name="name"
          placeholder="Name"
          onChange={handleChange}
        />
      )}

      <input
        name = "email"
        placeholder = "Email"
        onChange={handleChange}
      />

      <input
        type="Password"
        name = "password"
        placeholder="Password"
        onChange={handleChange}
      />

      <button onClick={handleSubmit}>
        {isLogin ? "Login" : "Signup"}
      </button>
      {error && (
        <p style={{color: "red", marginTop: "10px"}}>{error}</p>
      )}
      <p onClick={() => setIslogin(!isLogin)} style={{ cursor: "pointer" }}>
        {isLogin ? 
        "Don't have an account? Signup"
        : "Already have an account? Login"}
      </p>
    </form>
  )
}

export default Auth;