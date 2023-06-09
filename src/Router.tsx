import { HashRouter, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import GlobasStyle from "./Globalstyles";
import Articles from "./components/Articles";
import { ToastContainer } from "react-toastify";
import NewArticle from "./components/NewArticle";
import { useState } from "react";
import Chat from "./components/Chat";

export default function Router() {
  const [searchQuery, setSearchQuery] = useState<any>("");

  return (
    <>
      <HashRouter>
        <GlobasStyle />
        <ToastContainer />
        <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <Routes>
          {/* <Route path="/" element={<Header />} /> */}
          <Route path="/article/:id" element={<NewArticle />} />
          <Route path="/email" element={<Chat />} />
        </Routes>
        <Routes>
          <Route path="/" element={<Articles searchQuery={searchQuery} />} />
        </Routes>
      </HashRouter>
    </>
  );
}
