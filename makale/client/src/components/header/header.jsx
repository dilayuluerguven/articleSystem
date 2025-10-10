import { Button } from "antd";
import { LogoutOutlined, LoginOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";

export const Header = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    const storedUsername =
      sessionStorage.getItem("username") || localStorage.getItem("username");

    setIsLoggedIn(!!token);
    setUsername(storedUsername || "");

    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLoginLogout = () => {
    if (isLoggedIn) {
      sessionStorage.clear();
      localStorage.clear();
      setIsLoggedIn(false);
      setUsername("");
      navigate("/login");
    } else {
      navigate("/login");
    }
  };

  return (
    <div
      className={`border-b bg-black sticky top-0 z-50 transition-all duration-300
      ${isScrolled
        ? "border-gray-700 shadow-2xl bg-black/95 backdrop-blur-sm"
        : "border-gray-800 shadow-lg"
      }`}
    >
      <header className="py-3 px-6 flex justify-between items-center">
        <div
          className="flex items-center group cursor-pointer transition-transform duration-300 hover:scale-105"
          onClick={() => navigate("/")}
        >
          <div className="bg-white p-2 rounded-2xl mr-3 flex items-center justify-center shadow-lg ring-2 ring-white/20 transition-all duration-300 group-hover:ring-white/40 group-hover:shadow-xl">
            <img
              src="/images/Konya_Teknik_Üniversitesi_logo.png"
              alt="Konya Teknik Üniversitesi Logosu"
              className="h-10 w-auto transition-transform duration-300 group-hover:scale-110"
            />
          </div>
          <span className="text-white text-xl font-bold hidden md:block bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent tracking-tight">
            Konya Teknik Üniversitesi
          </span>
        </div>

        <div className="flex items-center space-x-3">
          {isLoggedIn && username && (
            <span className="text-white font-medium hidden sm:block">
              {username}
            </span>
          )}

          <Button
            type="primary"
            onClick={handleLoginLogout}
            className={`flex items-center space-x-2 font-semibold transition-all duration-300
              ${isLoggedIn
                ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 border-red-500 shadow-lg hover:shadow-xl"
                : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-blue-500 shadow-lg hover:shadow-xl"
              }
              h-10 px-6 rounded-full border-0
            `}
            icon={isLoggedIn ? <LogoutOutlined className="text-sm" /> : <LoginOutlined className="text-sm" />}
          >
            <span>{isLoggedIn ? "Çıkış Yap" : "Giriş Yap"}</span>
          </Button>
        </div>
      </header>

      <div className="h-0.5 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-60"></div>
    </div>
  );
};
