import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "/node_modules/@fortawesome/fontawesome-free/css/all.min.css";
import LandingPage from "./pages/LandingPage";
import Register from "./pages/Register";
import AboutUs from "./pages/AboutUs";
import Header from "./pages/Header";
import Footer from "./pages/Footer";
import TeamPage from "./pages/TeamPage";
import ContactUsPage from "./pages/ContactUsPage";

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/*" element={<LandingPage />} />
        <Route path="/team" element={<TeamPage />} />   
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/contact-us" element={<ContactUsPage />} />
        <Route path="/register" element={<Register />} />
        
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
