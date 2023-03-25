import {BrowserRouter as Router, Routes, Route} from "react-router-dom";

import './App.css';
import Header from "./layout/Header";
import Footer from "./layout/Footer";

function App() {
  return (
    <div className="container pt-3">
      <Router>
        <Header />
        <Footer />
      </Router>
    </div>
  );
}

export default App;
