import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function Login() {
  const [isActive, setIsActive] = useState(false);

  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup fields
  const [signUpName, setSignUpName] = useState("");
  const [signUpUsername, setSignUpUsername] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");

  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();
  const { login: authLogin, signup: authSignup } = useAuth();

  // Load theme
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  // ✅ API SIGNUP
  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!signUpUsername || !signUpEmail || !signUpPassword) {
      return alert("Please fill all fields");
    }

    const result = await authSignup({
      name: signUpName || signUpUsername,
      username: signUpUsername,
      email: signUpEmail,
      password: signUpPassword,
    });

    if (result.success) {
      alert("Signup successful! Welcome to RoofScout 🎉");
      navigate(result.role === "admin" ? "/AdminDashboard" : "/userdashboard");
    } else {
      alert(result.message || "Signup failed");
    }
  };

  // ✅ API LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();

    const result = await authLogin(loginEmail, loginPassword);

    if (result.success) {
      navigate(result.role === "admin" ? "/AdminDashboard" : "/userdashboard");
    } else {
      alert(result.message || "Login failed");
    }
  };

  // UI animation classes
  const signUpClasses = `
    absolute inset-y-0 left-0 w-1/2 transition-all duration-700 ease-in-out
    flex flex-col items-center justify-center p-10
    bg-white dark:bg-gray-800 dark:text-white
    ${isActive ? "opacity-100 translate-x-full z-30" : "opacity-0 pointer-events-none"}
  `;

  const signInClasses = `
    absolute inset-y-0 left-0 w-1/2 transition-all duration-700 ease-in-out
    flex flex-col items-center justify-center p-10
    bg-white dark:bg-gray-800 dark:text-white
    ${isActive ? "translate-x-full" : ""}
  `;

  const toggleContainerClasses = `
    absolute top-0 left-1/2 w-1/2 h-full overflow-hidden
    transition-all duration-700 ease-in-out
    ${isActive ? "-translate-x-full rounded-[0_150px_100px_0]" : "rounded-[150px_0_0_100px]"}
  `;

  const toggleClasses = `
    absolute left-[-100%] top-0 h-full w-[200%]
    transition-all duration-700 ease-in-out
    bg-gradient-to-r from-indigo-600 to-teal-500 text-white
    ${isActive ? "translate-x-1/2" : ""}
  `;

  return (
    <div className="min-h-screen flex flex-col bg-gray-200 dark:bg-gray-900">

      {/* HEADER */}
      <header className="sticky top-0 z-10 shadow-lg p-4 flex justify-between items-center bg-white dark:bg-gray-800">
        <div className="flex items-center ml-12">
          <img src="/LogoRS.png" className="h-16 w-16 mr-2 hidden sm:block" alt="logo" />
          <h1 className="font-bold text-2xl text-yellow-500"><Link to="/">Roof</Link></h1>
          <h1 className="font-bold text-2xl text-blue-600 dark:text-teal-400"><Link to="/">Scout</Link></h1>
        </div>

        <button
          onClick={() => {
            const newMode = !darkMode;
            setDarkMode(newMode);

            if (newMode) {
              document.documentElement.classList.add("dark");
              localStorage.setItem("theme", "dark");
            } else {
              document.documentElement.classList.remove("dark");
              localStorage.setItem("theme", "light");
            }
          }}
          className="mr-6 p-2 rounded-full bg-gray-200 dark:bg-gray-700"
        >
          {darkMode ? <span className="text-yellow-300 text-xl">☀️</span> : <span className="text-gray-800 text-xl">🌙</span>}
        </button>
      </header>

      {/* MAIN */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="relative overflow-hidden w-[768px] max-w-full min-h-[480px]
          bg-white dark:bg-gray-800 dark:text-white rounded-[30px]
          shadow-[0_5px_15px_rgba(0,0,0,0.35)]">

          {/* SIGN UP */}
          <div className={signUpClasses}>
            <form className="w-full max-w-xs" onSubmit={handleSignUp}>
              <h1 className="text-3xl font-semibold">Create Account</h1>

              <input type="text" placeholder="Name"
                className="mt-3 w-full bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2"
                value={signUpName} onChange={(e) => setSignUpName(e.target.value)} />

              <input type="text" placeholder="Username"
                className="mt-2 w-full bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2"
                value={signUpUsername} onChange={(e) => setSignUpUsername(e.target.value)} />

              <input type="email" placeholder="Email"
                className="mt-2 w-full bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2"
                value={signUpEmail} onChange={(e) => setSignUpEmail(e.target.value)} />

              <input type="password" placeholder="Password"
                className="mt-2 w-full bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2"
                value={signUpPassword} onChange={(e) => setSignUpPassword(e.target.value)} />

              <button className="mt-4 bg-teal-500 hover:bg-teal-600 text-white uppercase px-10 py-2 rounded-md w-full">
                Sign Up
              </button>
            </form>
          </div>

          {/* SIGN IN */}
          <div className={signInClasses}>
            <form className="w-full max-w-xs" onSubmit={handleLogin}>
              <h1 className="text-3xl font-semibold">Sign In</h1>

              <input
                type="email"
                placeholder="Email"
                className="mt-3 w-full bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />

              <input
                type="password"
                placeholder="Password"
                className="mt-2 w-full bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />

              <button
                type="submit"
                className="mt-4 bg-teal-500 hover:bg-teal-600 text-white uppercase px-10 py-2 rounded-md w-full"
              >
                Sign In
              </button>
            </form>
          </div>

          {/* TOGGLE PANELS */}
          <div className={toggleContainerClasses}>
            <div className={toggleClasses}>

              <div className="absolute top-0 left-0 w-1/2 h-full flex flex-col items-center justify-center px-8 text-center">
                <h1 className="text-3xl font-semibold">Welcome Back!</h1>
                <button
                  onClick={() => setIsActive(false)}
                  className="mt-6 border border-white text-white px-10 py-2 rounded-md"
                >
                  Sign In
                </button>
              </div>

              <div className="absolute top-0 right-0 w-1/2 h-full flex flex-col items-center justify-center px-8 text-center">
                <h1 className="text-3xl font-semibold">Hello, Friend!</h1>
                <button
                  onClick={() => setIsActive(true)}
                  className="mt-6 border border-white text-white px-10 py-2 rounded-md"
                >
                  Sign Up
                </button>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default Login;
