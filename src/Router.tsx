import { HashRouter, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import GlobasStyle from "./Globalstyles";
import Articles from "./components/Articles";
import { ToastContainer } from "react-toastify";
import NewArticle from "./components/NewArticle";
import Email from "./components/Email";
export default function Router() {
  return (
    <>
      <HashRouter>
        <GlobasStyle />
        <ToastContainer />
        <Header />
        <Routes>
          {/* <Route path="/" element={<Header />} /> */}
          <Route path="/article/:id" element={<NewArticle />} />
          <Route path="/email" element={<Email />} />
        </Routes>
        <Routes>
          <Route path="/" element={<Articles />} />
        </Routes>

        {/* <AddNewArticle /> */}
      </HashRouter>
    </>
  );
}