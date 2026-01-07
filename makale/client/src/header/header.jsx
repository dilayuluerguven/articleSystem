import React, { useState, useEffect } from "react";
import { Button, Avatar, Tooltip, Divider } from "antd";
import {
  LogoutOutlined,
  LoginOutlined,
  UserOutlined,
  HomeOutlined,
  FileTextOutlined,
  MenuOutlined,
  CloseOutlined,
  DashboardOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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
    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

 const handleLoginLogout = () => {
  if (isLoggedIn) {
    toast.success("Çıkış yapıldı, giriş sayfasına yönlendiriliyorsunuz...", {
      autoClose: 2000,
    });

    sessionStorage.clear();
    localStorage.clear();
    setIsLoggedIn(false);
    setMenuOpen(false);

    setTimeout(() => {
      navigate("/login");
    }, 2000);
  } else {
    navigate("/login");
  }
};


  const NavItem = ({ path, icon, label, mobile = false }) => {
    const isActive = location.pathname === path;
    const activeStyles = isActive
      ? "text-indigo-400 bg-indigo-500/10"
      : "text-slate-400 hover:text-white hover:bg-slate-800/50";

    return (
      <button
        onClick={() => {
          navigate(path);
          setMenuOpen(false);
        }}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 font-medium ${activeStyles} ${
          mobile ? "w-full text-lg py-4 px-6" : "text-[13px]"
        }`}
      >
        {icon}
        <span>{label}</span>
      </button>
    );
  };

  return (
    <>
      <div
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
          isScrolled
            ? "bg-[#0f172a]/85 backdrop-blur-md py-2 shadow-2xl border-b border-slate-800/50"
            : "bg-[#0f172a] py-4 border-b border-transparent"
        }`}
      >
        <header className="max-w-[1400px] mx-auto px-6 flex items-center">
          <div
            className="flex items-center group cursor-pointer shrink-0"
            onClick={() => navigate("/home")}
          >
            <img
              src="/images/Konya_Teknik_Üniversitesi_logo.png"
              alt="KTUN"
              className="h-10 transition-transform duration-300 group-hover:scale-105"
            />
            <div className="ml-3 border-l border-slate-700 pl-3 hidden lg:block">
              <div className="text-white font-bold text-sm tracking-tight leading-tight">
                KONYA TEKNİK
              </div>
              <div className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest">
                Üniversitesi
              </div>
            </div>
          </div>

          {isLoggedIn && (
            <nav className="hidden md:flex items-center gap-1 ml-8 flex-1">
              <NavItem path="/home" icon={<HomeOutlined />} label="Ana Sayfa" />
              <NavItem path="/profile" icon={<FileTextOutlined />} label="Başvurularım" />
              {isAdmin && (
                <NavItem path="/admin" icon={<DashboardOutlined />} label="Panel" />
              )}
            </nav>
          )}

          <div className="flex items-center gap-4 ml-auto">
            {isLoggedIn && (
              <div
                className="flex items-center gap-2 cursor-pointer group"
                onClick={() => navigate("/userprofile")}
              >
                <div className="flex flex-col items-end mr-1 hidden sm:flex">
                  <span className="text-slate-200 text-xs font-semibold group-hover:text-indigo-400 transition-colors">
                    {username}
                  </span>
                  <span className="text-[9px] text-slate-500 uppercase tracking-tighter">
                    {isAdmin ? "Sistem Yöneticisi" : "Akademisyen"}
                  </span>
                </div>
                <Avatar
                  size={36}
                  icon={<UserOutlined />}
                  className="bg-slate-800 border border-slate-700 group-hover:border-indigo-500 transition-all shadow-lg"
                />
              </div>
            )}

            <button
              onClick={handleLoginLogout}
              className={`hidden sm:flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-xs transition-all active:scale-95 ${
                isLoggedIn
                  ? "text-slate-400 hover:text-red-400 bg-slate-800/50 hover:bg-red-500/10 border border-slate-700 hover:border-red-500/20"
                  : "text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/20"
              }`}
            >
              {isLoggedIn ? <LogoutOutlined /> : <LoginOutlined />}
              <span>{isLoggedIn ? "ÇIKIŞ" : "GİRİŞ YAP"}</span>
            </button>

            <button
              className="md:hidden p-2 text-slate-300 hover:text-white transition-colors"
              onClick={() => setMenuOpen(true)}
            >
              <MenuOutlined className="text-2xl" />
            </button>
          </div>
        </header>
      </div>

      <div className={isScrolled ? "h-16" : "h-20"}></div>

      <div
        className={`fixed inset-0 z-[201] transition-all duration-500 ${
          menuOpen ? "visible" : "invisible"
        }`}
      >
        <div
          className={`absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-500 ${
            menuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMenuOpen(false)}
        ></div>

        <div
          className={`absolute right-0 top-0 h-full w-72 bg-[#0f172a] shadow-2xl border-l border-slate-800/50 transform transition-transform duration-500 ease-in-out ${
            menuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full p-6">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-2">
                <div className="w-2 h-6 bg-indigo-500 rounded-full"></div>
                <span className="text-white font-bold text-lg">Menü</span>
              </div>
              <button
                onClick={() => setMenuOpen(false)}
                className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <CloseOutlined />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <NavItem mobile path="/home" icon={<HomeOutlined />} label="Ana Sayfa" />
              <NavItem mobile path="/profile" icon={<FileTextOutlined />} label="Başvurularım" />
              {isAdmin && (
                <NavItem mobile path="/admin" icon={<DashboardOutlined />} label="Admin Paneli" />
              )}
            </div>

            <div className="mt-auto">
              <Divider className="border-slate-800" />
              <button
                onClick={handleLoginLogout}
                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 ${
                  isLoggedIn
                    ? "bg-slate-800/40 hover:bg-red-500/10 text-slate-300 hover:text-red-400 border border-slate-700 hover:border-red-500/30"
                    : "bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 hover:bg-indigo-500"
                }`}
              >
                <div className="flex items-center gap-3">
                  {isLoggedIn ? <LogoutOutlined className="text-lg" /> : <LoginOutlined className="text-lg" />}
                  <span className="font-bold tracking-wide">
                    {isLoggedIn ? "Oturumu Kapat" : "Giriş Yap"}
                  </span>
                </div>
                <div className="opacity-40">→</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};