import { useDispatch } from "react-redux";
import { openCredit } from "../credit/creditSlice";
import "./footer.css";
const Footer = () => {
  const dispatch = useDispatch();
  return (
    <>
      <footer className="dash-footer">
        <div className="footer-content">
          <span
            className="dash-footer-credit"
            onClick={() => {
              dispatch(openCredit());
            }}
          >
            Credits
          </span>
          <span className="footer-copyright">© Copyright 2025 AKShorter</span>
          <span className="footer-dev">
            <a href="https://github.com/mrakmondal6612" target="_blank" rel="noopener noreferrer">
              Developed By Ajay Mondal
            </a>
          </span>
        </div>
      </footer>
    </>
  );
};
export default Footer;
