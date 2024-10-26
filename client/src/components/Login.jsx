import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { createContext } from "react";

import "../style/FormStyles.css";

const UserContext = createContext();

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:7000/api/login",
        formData,
        { withCredentials: true }
      );
      console.log("Вход выполнен успешно:", response.data);

      const userId = response.data.userId;

      navigate(`/user/${userId}`); // Перенаправление на главную страницу пользователя

      return (
        <UserContext.Provider value={userId}>
          <div>Вы вошли в систему!</div>
        </UserContext.Provider>
      );
    } catch (error) {
      console.error("Ошибка при входе в систему:", error);
    }
  };

  return (
    <div className="form-container">
      <h2>Вход в систему</h2>
      <form onSubmit={handleLogin}>
        <div className="input-group">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
          />
        </div>
        <div className="input-group">
          <input
            type="password"
            name="password"
            placeholder="Пароль"
            value={formData.password}
            onChange={handleInputChange}
          />
        </div>
        <div className="input-group">
          <button type="submit">Войти</button>
        </div>
      </form>
    </div>
  );
};

export { UserContext };
export default Login;
