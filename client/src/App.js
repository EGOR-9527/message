// App.js
import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Login from "./components/Login";
import Registr from "./components/Registr";
import Logout from "./components/Logout";
import MyPageMessag from "./components/myPageMessag";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registration" element={<Registr />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/user/:id" element={<MyPageMessag />} />
      </Routes>
    </Router>
  );
};

export default App;
