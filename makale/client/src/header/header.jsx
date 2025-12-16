import { Button, Avatar, Tooltip } from "antd";
import {
  LogoutOutlined,
  LoginOutlined,
  UserOutlined,
  HomeOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { SettingOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";

export const Header = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [updateNotice, setUpdateNotice] = useState(false); 

  useEffect(() => {
    const token =
      sessionStorage.getItem("token") || localStorage.getItem("token");
    const storedUsername =
      sessionStorage.getItem("username") || localStorage.getItem("username");
    const storedIsAdmin =
      sessionStorage.getItem("is_admin") || localStorage.getItem("is_admin");

    setIsLoggedIn(!!token);
    setUsername(storedUsername || "");
    setIsAdmin(storedIsAdmin === "1");

    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);

    const syncUsername = () => {
      const updatedUsername =
        sessionStorage.getItem("username") || localStorage.getItem("username");
      const updatedIsAdmin =
        sessionStorage.getItem("is_admin") || localStorage.getItem("is_admin");
      setUsername(updatedUsername || "");
      setIsAdmin(updatedIsAdmin === "1");

      setUpdateNotice(true);
      setTimeout(() => setUpdateNotice(false), 2000);
    };

    window.addEventListener("storage", syncUsername);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("storage", syncUsername);
    };
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

  const goToHome = () => navigate("/home");
  const goToProfile = () => navigate("/profile");
  const goToUserProfile = () => navigate("/userprofile");

  return (
    <div
      className={`sticky top-0 z-50 transition-all duration-300 border-b 
      ${
        isScrolled
          ? "bg-black/80 backdrop-blur-md border-gray-700 shadow-2xl"
          : "bg-black border-gray-800 shadow-lg"
      }`}
    >
      {updateNotice && (
        <div className="fixed top-20 right-6 z-50 bg-green-500/90 text-white px-4 py-2 rounded-lg shadow-lg backdrop-blur-sm border border-white/20 animate-fade-in-out">
          Profil bilgileri güncellendi
        </div>
      )}

      <header className="py-3 px-6 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div
            className="flex items-center group cursor-pointer transition-transform duration-300 hover:scale-105"
            onClick={goToHome}
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
        </div>

        <div className="flex items-center space-x-4">
          {isLoggedIn && (
            <>
              <Tooltip title="Ana Sayfa">
                <HomeOutlined
                  style={{ color: "white" }}
                  className="text-lg cursor-pointer hover:text-blue-400 transition-colors"
                  onClick={goToHome}
                />
              </Tooltip>

              <Tooltip title="Başvurularım">
                <FileTextOutlined
                  style={{ color: "white" }}
                  className="text-lg cursor-pointer hover:text-blue-400 transition-colors"
                  onClick={goToProfile}
                />
              </Tooltip>
              <Tooltip title="Kullanıcı Bilgilerim">
                <div
                  className="flex items-center space-x-2 cursor-pointer group"
                  onClick={goToUserProfile}
                >
                  <Avatar
                    icon={<UserOutlined />}
                    className="bg-blue-500 group-hover:bg-blue-600 transition-colors text-lg"
                  />
                  <span className="text-white font-medium hidden sm:block group-hover:text-blue-400 transition-colors">
                    {username}
                  </span>
                </div>
              </Tooltip>
              {isAdmin && (
                <Tooltip title="Admin Paneli">
                  <SettingOutlined
                    style={{ color: "white" }}
                    className="text-lg cursor-pointer hover:text-yellow-400 transition-colors ml-2"
                    onClick={() => navigate("/admin")}
                  />
                </Tooltip>
              )}
            </>
          )}

          <Button
            type="primary"
            onClick={handleLoginLogout}
            className={`flex items-center space-x-2 font-semibold transition-all duration-300 
              backdrop-blur-md border-0 shadow-lg hover:shadow-xl 
              ${
                isLoggedIn
                  ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                  : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              }
              h-10 px-6 rounded-full
            `}
            icon={
              isLoggedIn ? (
                <LogoutOutlined className="text-sm" />
              ) : (
                <LoginOutlined className="text-sm" />
              )
            }
          >
            <span>{isLoggedIn ? "Çıkış Yap" : "Giriş Yap"}</span>
          </Button>
        </div>
      </header>

      <div className="h-0.5 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-60"></div>
    </div>
  );
};
