import { BrowserRouter, HashRouter, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import GlobasStyle from "./Globalstyles";

export default function Router() {
  return (
    <>
      <HashRouter>
        <GlobasStyle />
        <Routes>
          <Route path="/" element={<Header />} />
        </Routes>
      </HashRouter>
    </>
  );
}
