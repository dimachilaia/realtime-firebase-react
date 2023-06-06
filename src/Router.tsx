import { BrowserRouter, HashRouter, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import GlobasStyle from "./Globalstyles";
import Articles from "./components/Articles";
import AddNewArticle from "./components/AddNewArticle";

export default function Router() {
  return (
    <>
      <HashRouter>
        <GlobasStyle />
        <Routes>
          <Route path="/" element={<Header />} />
          <Route path="/art" element={<Articles />} />
        </Routes>
      </HashRouter>
    </>
  );
}
