import { Button, Avatar, Tooltip, Badge } from "antd";
import {
  LogoutOutlined,
  LoginOutlined,
  UserOutlined,
  HomeOutlined,
  FileTextOutlined,
  SettingOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import React, { useState, useEffect } from "react";

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [updateNotice, setUpdateNotice] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = sessionStorage.getItem("token") || localStorage.getItem("token");
      const storedUsername = sessionStorage.getItem("username") || localStorage.getItem("username");
      const storedIsAdmin = sessionStorage.getItem("is_admin") || localStorage.getItem("is_admin");

      setIsLoggedIn(!!token);
      setUsername(storedUsername || "");
      setIsAdmin(storedIsAdmin === "1");
    };

    checkAuth();
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    const syncUsername = () => {
      checkAuth();
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

  const activeClass = (path) => 
    location.pathname === path 
      ? "text-white bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.4)]" 
      : "text-slate-400 hover:text-indigo-400 hover:bg-white/5";

  return (
    <div
      className={`sticky top-0 z-[100] transition-all duration-500 ${
        isScrolled
          ? "bg-[#0f172a]/95 backdrop-blur-xl shadow-2xl py-2"
          : "bg-[#0f172a] py-4"
      } border-b border-slate-800`}
    >
      {updateNotice && (
        <div className="fixed top-24 right-6 z-[110] animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-emerald-400/30">
            <SafetyCertificateOutlined className="text-lg" />
            <span className="font-bold text-sm">Profil Güncellendi</span>
          </div>
        </div>
      )}

      <header className="w-full px-4 md:px-8 flex justify-between items-center">
        <div 
          className="flex items-center group cursor-pointer"
          onClick={() => navigate("/home")}
        >
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-md group-hover:bg-indigo-500/40 transition-all duration-500"></div>
            <div className="bg-white p-1.5 rounded-full shadow-lg relative z-10 w-12 h-12 flex items-center justify-center border border-indigo-100/20">
              <img
                src="/images/Konya_Teknik_Üniversitesi_logo.png"
                alt="KTUN Logo"
                className="h-9 w-auto object-contain transition-transform duration-500 group-hover:scale-110"
              />
            </div>
          </div>
          <div className="ml-4 flex flex-col leading-none">
            <span className="text-white text-lg font-black tracking-tighter uppercase transition-colors group-hover:text-indigo-400">
              Konya Teknik
            </span>
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.25em] mt-1">
              Üniversitesi
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-8">
          {isLoggedIn && (
            <nav className="hidden md:flex items-center bg-slate-900/50 p-1 rounded-2xl border border-slate-800 shadow-inner">
              <Tooltip title="Ana Sayfa">
                <button
                  onClick={() => navigate("/home")}
                  className={`p-2.5 rounded-xl transition-all duration-300 flex items-center justify-center ${activeClass("/home")}`}
                >
                  <HomeOutlined className="text-lg" />
                </button>
              </Tooltip>

              <Tooltip title="Başvurularım">
                <button
                  onClick={() => navigate("/profile")}
                  className={`p-2.5 rounded-xl transition-all duration-300 flex items-center justify-center ${activeClass("/profile")}`}
                >
                  <FileTextOutlined className="text-lg" />
                </button>
              </Tooltip>

              {isAdmin && (
                <Tooltip title="Admin Paneli">
                  <button
                    onClick={() => navigate("/admin")}
                    className={`p-2.5 rounded-xl transition-all duration-300 flex items-center justify-center ${activeClass("/admin")}`}
                  >
                    <SettingOutlined className="text-lg" />
                  </button>
                </Tooltip>
              )}
            </nav>
          )}

          <div className="flex items-center gap-6">
            {isLoggedIn && (
              <div 
                className="flex items-center gap-4 pl-6 border-l border-slate-800 cursor-pointer group"
                onClick={() => navigate("/userprofile")}
              >
                <div className="flex flex-col items-end hidden sm:flex leading-none">
                  <span className="text-white text-sm font-black group-hover:text-indigo-400 transition-colors">
                    {username}
                  </span>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                    {isAdmin ? "Sistem Yöneticisi" : "Akademisyen"}
                  </span>
                </div>
                <Badge dot status={isAdmin ? "warning" : "processing"} offset={[-2, 32]}>
                  <Avatar
                    size={42}
                    icon={<UserOutlined />}
                    className="bg-indigo-600/10 border-2 border-indigo-500/50 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-lg"
                  />
                </Badge>
              </div>
            )}

            <Button
              type="primary"
              onClick={handleLoginLogout}
              className={`h-11 px-8 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 border-none flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 ${
                isLoggedIn
                  ? "bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/40"
              }`}
              icon={isLoggedIn ? <LogoutOutlined /> : <LoginOutlined />}
            >
              {isLoggedIn ? "Çıkış" : "Giriş"}
            </Button>
          </div>
        </div>
      </header>

      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent"></div>
    </div>
  );
};