import defaultPic from "../../../assets/default.svg";
import Logo from "../../../components/logo/Logo";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { lgMenuToggle } from "./dlmSlice";
import "./dnavbar.css";
import { smMenuOpen } from "./dsmSlice";
import { useContext } from "react";
import { ThemeContext } from "../../../App";
const DNavbar = ({ userData, user }) => {
  const { theme, setTheme } = useContext(ThemeContext);
  const handleThemeToggle = () => setTheme(theme === "light" ? "dark" : "light");
  const { isLargeMenu } = useSelector((store) => store.lgMenuPage);
  const dispatch = useDispatch();
  return (
    <div className="dnavbar">
      <div className="dnav-logo">
        <div className="dlg">
          <span
            className="material-icons-outlined md-18 dnav-menu"
            onClick={() => {
              dispatch(lgMenuToggle(!isLargeMenu));
            }}
          >
            menu
          </span>
        </div>
        <div className="dsm">
          <span
            className="material-icons-outlined md-18 dnav-menu"
            onClick={() => {
              dispatch(smMenuOpen());
            }}
          >
            menu
          </span>
        </div>

        <Link to={"/"}>
          <Logo />
        </Link>
        <div className="nav-beta">
          Beta
        </div>
      </div>
      <div className="dnav-links">
        {user && (
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
        )}
        <div className="dnav-user">
          <span>{userData.name}</span>
          <img src={userData.picture} alt={userData.name} />
        </div>
      </div>
    </div>
  );
};
export default DNavbar;
