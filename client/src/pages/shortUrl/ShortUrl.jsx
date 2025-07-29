import { getUrlClose } from "./shortUrlSlice";
import Logo from "../../components/logo/Logo";
import { motion } from "framer-motion";
import "./shortUrl.css";
import { useState } from "react";
import { useDispatch } from "react-redux";

const ShortUrl = ({ urldata }) => {
  const dispatch = useDispatch();
  const [isCopied, setIsCopied] = useState(false);
  const copyUrl = async () => {
    await navigator.permissions.query({ name: "clipboard-write" });
    await navigator.clipboard.writeText(urldata);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  const copyWhatsapp = () => {
    const sendLink = `https://wa.me/?text=${encodeURIComponent(urldata)}`;
    window.open(sendLink);
  };

  return (
    <>
      <motion.div
        className="shortUrl-main"
        initial={{ opacity: 0 }}
        animate={{ opacity: 100 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Logo />
        <div className="shortUrl-heading">Now its Tiny...</div>
        <div className="shortUrl-url">
          <a href={urldata} target="_blank">{urldata}</a>
        </div>
        <div className="shortUrl-share">
          <i key="copy-2xl" className="fa-regular fa-copy fa-2xl" onClick={copyUrl}></i>
          <i key="copy-xl" className="fa-regular fa-copy fa-xl" onClick={copyUrl}></i>
          <i key="wa-2xl" className="fa-brands fa-whatsapp fa-2xl" onClick={copyWhatsapp}></i>
          <i key="wa-xl" className="fa-brands fa-whatsapp fa-xl" onClick={copyWhatsapp}></i>
        </div>
        {isCopied && (
          <>
            <motion.p
              className="shortUrl-copy"
              initial={{ opacity: 0 }}
              animate={{ opacity: 100 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              copied!
            </motion.p>
          </>
        )}
        <div className="shortUrl-close">
          <i
            key="close-2xl"
            className="fa-solid fa-xmark fa-2xl"
            onClick={() => {
              dispatch(getUrlClose());
            }}
          ></i>
          <i
            key="close-xl"
            className="fa-solid fa-xmark fa-xl"
            onClick={() => {
              dispatch(getUrlClose());
            }}
          ></i>
        </div>
      </motion.div>
    </>
  );
};
export default ShortUrl;
