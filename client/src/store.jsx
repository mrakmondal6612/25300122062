import { configureStore } from "@reduxjs/toolkit";
import loginReducer from "./pages/login-signup/loginSlice";
import shortUrlReducer from "./pages/shortUrl/shortUrlSlice";
import limitReducer from "./components/Limit/limitSlice";
import largeMenuReducer from "./pages/dashboard/dnavbar/dlmSlice";
import smallMenuReducer from "./pages/dashboard/dnavbar/dsmSlice";
import sidebarReducer from "./pages/sidebar/sidebarSlice";
import creditReducer from "./pages/credit/creditSlice";
export const store = configureStore({
  reducer: {
    loginPage: loginReducer,
    shortUrlPage: shortUrlReducer,
    limitPage: limitReducer,
    lgMenuPage: largeMenuReducer,
    smMenuPage: smallMenuReducer,
    sidebar: sidebarReducer,
    creditPage: creditReducer,
  },
});
