import { BrowserRouter, Routes, Route } from "react-router-dom";
import '/node_modules/@fortawesome/fontawesome-free/css/all.min.css';

import "./App.css";
import Login from "./pages/Login";
import LandingPage from "./pages/LandingPage";
import Register from "./pages/Register";

function App() {
  return (
    // <>
    //   <h1 className="text-4xl font-bold text-blue-600">
    //     Welcome to My React App with Tailwind CSS!
    //   </h1>
    //   gfdstre
    // </>

    <BrowserRouter>
        <Routes>
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Register/>} />

        {/* * bhaneko chai / pachi jj aucha tyo mainpage le handle garcha */}
        <Route path="/*" element={<  LandingPage/>} />  
    </Routes>
    </BrowserRouter>
  );
}

export default App;
