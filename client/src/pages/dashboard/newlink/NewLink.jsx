import { getUrlOpen } from "../../shortUrl/shortUrlSlice";
import ShortUrl from "../../shortUrl/ShortUrl";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import "./newlink.css";
import { useDispatch, useSelector } from "react-redux";
import validateUrl from "../../../validations/urlValidator";
import Loadere from "../../../components/loader/Loadere";
const NewLink = ({ userData }) => {
  const { getUrl } = useSelector((store) => store.shortUrlPage);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState("");
  const [custom, setCustom] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [error, setError] = useState("");
  const [urlError, setUrlError] = useState("");

  const newPaid = {
    longUrl: url.trim(),
    custom: custom.trim(),
    email: userData.email,
  };

  const handelSubmit = async () => {
    const validError = validateUrl(url.trim());
    if (validError) {
      setUrl("");
      setUrlError("Please enter correct URL");
      return;
    }
    setLoading(true);
    fetch(import.meta.env.VITE_URL_PAID, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newPaid),
      credentials: "include",
    })
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error("Network response was not ok");
        }
      })
      .then((data) => {
        setLoading(false);
        if (data?.error) {
          setCustom("");
          setError("Keyword not available");
          return;
        }
        setShortUrl(data.shortUrl);
        dispatch(getUrlOpen());
      });
  };
  return (
    <>
      <AnimatePresence>
        <div className="loader-box">
          <div className="loader-box">{loading && <Loadere />}</div>
        </div>
        <div className="newlink-shortUrl">
          {getUrl && <ShortUrl urldata={shortUrl} />}
        </div>
        <div className="newlink-container">
          <span className="newlink-heading">
            Link transformation for <span>limitless</span> connections
          </span>
          <span className="link-slogan">Say good bye to long urls!!</span>
          <div className="newlink-inner">
            <div className="nurl-input">
              <label htmlFor="lurl">Enter Your Long Urls</label>
              <input
                className="place"
                type="text"
                id="lurl"
                value={url ? url : urlError}
                placeholder="https://ezylink.in/xyz/..."
                onChange={(e) => {
                  setUrl(e.target.value);
                }}
                onFocus={() => {
                  setUrlError("");
                }}
                style={{
                  color: urlError ? "#cc0016" : "Black",
                  backgroundColor: urlError ? "#ffe6e9" : "#e3effb",
                }}
              />
            </div>
            <div className="custom-input">
              <span>Custom</span>
              <input
                className="place"
                type="text"
                placeholder="doc-ezylink"
                value={custom ? custom : error}
                onChange={(e) => {
                  setCustom(e.target.value);
                }}
                onFocus={() => {
                  setError("");
                }}
                style={{
                  color: error ? "#cc0016" : "Black",
                  backgroundColor: error ? "#ffe6e9" : "#e3effb",
                }}
              />
            </div>
            <div className="newlink-submit">
              <button className="border-0" onClick={handelSubmit}>
                Submit
              </button>
            </div>
          </div>
        </div>
      </AnimatePresence>
    </>
  );
};
export default NewLink;
