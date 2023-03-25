import {BrowserRouter as Router, Routes, Route} from "react-router-dom";

import './App.css';
import Header from "./layout/Header";
import Footer from "./layout/Footer";
import Home from "./pages/Home";

function App() {
  return (
    <div className="container pt-3">
      <Router>
        <Header />
        <Routes>
          <Route path="" element={<Home />} />
        </Routes>
        <Footer />
      </Router>
    </div>
  );
}

export default App;
