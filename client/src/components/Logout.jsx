import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import "../style/FormStyles.css";

const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await axios.delete("http://localhost:7000/api/logout", {
        withCredentials: true,
      });
      console.log("Выход выполнен успешно: ", response.data);
      navigate("/login");
    } catch (error) {
      console.error("Ошибка при выходе из системы:", error);
    }
  };

  return (
    <div className="form-container">
      <h2>Выход из системы</h2>
      <div className="input-group">
        <button onClick={handleLogout}>Выйти</button>
      </div>
    </div>
  );
};

export default Logout;
