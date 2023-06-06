import { BrowserRouter, HashRouter, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import GlobasStyle from "./Globalstyles";
import Articles from "./components/Articles";
import AddNewArticle from "./components/AddNewArticle";
import SignIn from "./components/Login";
import { ToastContainer } from "react-toastify";
import SignUp from "./components/SignUp";

export default function Router() {
  return (
    <>
      <HashRouter>
        <GlobasStyle />
        <ToastContainer />
        <Routes>
          <Route path="/" element={<Header />} />

          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
        </Routes>
        <Routes>
          <Route path="/" element={<Articles />} />
        </Routes>
        {/* <AddNewArticle /> */}
      </HashRouter>
    </>
  );
}
