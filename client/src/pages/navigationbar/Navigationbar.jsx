import Logo from "../../components/logo/Logo";
import Sidebar from "../sidebar/Sidebar";
import { sidebarActive } from "../sidebar/sidebarSlice";
import { openPage } from "../login-signup/loginSlice";
import { useDispatch } from "react-redux";
import { NavLink, Outlet } from "react-router-dom";
import "./navigation.css";
import { useContext } from "react";
import { ThemeContext } from "../../App";
const Navigationbar = ({ user }) => {
  const dispatch = useDispatch();
  const { theme, setTheme } = useContext(ThemeContext);
  const handleThemeToggle = () => setTheme(theme === "light" ? "dark" : "light");
  return (
    <>
      <div className="navigation-main">
        <div className="navigation-brand">
          <span
            className="material-icons-outlined"
            onClick={() => {
              dispatch(sidebarActive());
            }}
          >
            menu
          </span>
          <NavLink to={"/"}>
            <Logo />
          </NavLink>
          <div className="nav-beta">Beta</div>
        </div>
        <button
          onClick={handleThemeToggle}
          style={{
            marginRight: 24,
            background: theme === "dark" ? "#232a36" : "#fff",
            color: theme === "dark" ? "#f1f1f1" : "#232a36",
            border: "1px solid #e0e6ed",
            borderRadius: 8,
            padding: "6px 16px",
            fontWeight: 600,
            fontSize: 15,
            boxShadow: "0 2px 8px #0001",
            cursor: "pointer",
            transition: "all 0.2s"
          }}
          aria-label="Switch theme"
        >
          {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
        </button>
        <div className="navigation-links">
          <NavLink to={""} className={"navigation-item"}>
            Home
          </NavLink>
          <NavLink to={"about"} className={"navigation-item"}>
            About
          </NavLink>
          {!user && (
            <button
              className="navigation-item"
              style={{ background: "none", border: "none", color: theme === "dark" ? "#f1f1f1" : "#232a36", fontSize: 20, cursor: "pointer" }}
              onClick={() => dispatch(openPage())}
            >
              Login
            </button>
          )}
          <NavLink
            className={"navigation-item nav-sign-up"}
            onClick={() => {
              dispatch(openPage());
            }}
          >
            Sign Up
          </NavLink>
        </div>
        <div className="sm-navigation-links">
          <NavLink
            className={"navigation-item nav-sign-up"}
            onClick={() => {
              dispatch(openPage());
            }}
          >
            Sign Up
          </NavLink>
        </div>
      </div>
      <div className="sidebar-menu">
        <Sidebar />
      </div>
    </>
  );
};
export default Navigationbar;
