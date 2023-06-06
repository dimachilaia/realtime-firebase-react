import { createGlobalStyle } from "styled-components";
import 'bootstrap/dist/css/bootstrap.css';
import 'font-awesome/css/font-awesome.css';
import "bootstrap/dist/css/bootstrap.css";
import "react-toastify/dist/ReactToastify.css";

const GlobasStyle = createGlobalStyle`
  *, 
  *::after,
  *::before {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
`;

export default GlobasStyle;
