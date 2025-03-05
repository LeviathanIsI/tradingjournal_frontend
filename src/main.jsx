import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// TEMPORARY FIX - Override environment variables and router
window.router = window.router || { post: () => {} };
window.OVERRIDE_API_URL = "https://rivyl-backend-607db80115ac.herokuapp.com";

createRoot(document.getElementById("root")).render(<App />);
