import React from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../../header/header";
import {
  UserOutlined,
  FileTextOutlined,
  DatabaseOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { Tooltip } from "antd";

const adminCardsData = [
  {
    title: "Kullanıcı Yönetimi",
    desc: "Kullanıcı listesini görüntüleyin, rollerini (admin/normal) yönetin ve hesapları pasifleştirin.",
    path: "/admin/users",
    icon: <UserOutlined />,
    accent: "from-indigo-600 to-indigo-700",
    iconColor: "text-indigo-600",
    hoverAccent: "group-hover:text-indigo-700",
  },
  {
    title: "Makale Başvuruları",
    desc: "Yeni makale başvurularını inceleyin, hakemlere atayın ve değerlendirme sürecini takip edin.",
    path: "/admin/basvuru",
    icon: <FileTextOutlined />,
    accent: "from-emerald-600 to-emerald-700",
    iconColor: "text-emerald-600",
    hoverAccent: "group-hover:text-emerald-700",
  },
  {
    title: "Veritabanı Tabloları",
    desc: "Sistem tanımları, kategoriler ve anahtar kelimeler gibi kritik veritabanı tablolarını yönetin.",
    path: "/admin/tables",
    icon: <DatabaseOutlined />,
    accent: "from-purple-600 to-purple-700",
    iconColor: "text-purple-600",
    hoverAccent: "group-hover:text-purple-700",
  },
];

const AdminCard = ({ card }) => {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(card.path)}
      className={`
        group cursor-pointer
        bg-white rounded-xl
        shadow-lg hover:shadow-2xl 
        hover:-translate-y-1
        transition-all duration-300 ease-in-out
        border border-gray-100
      `}
    >
      <div className={`h-1.5 rounded-t-xl bg-gradient-to-r ${card.accent}`} />

      <div className="p-6 flex flex-col h-full">
        <div
          className={`
            w-14 h-14 rounded-lg 
            flex items-center justify-center
            bg-gray-50
            ${card.iconColor} 
            text-2xl
            mb-4
            transition-colors duration-300
            group-hover:bg-opacity-80
          `}
        >
          {card.icon}
        </div>

        <h2 className="text-xl font-bold text-gray-800 mb-2">
          {card.title}
        </h2>

        <p className="text-sm text-gray-500 flex-1 leading-relaxed mb-4">
          {card.desc}
        </p>

        <div 
          className={`
            flex items-center gap-1 text-sm font-semibold 
            text-gray-600 transition-colors duration-300
            ${card.hoverAccent}
          `}
        >
          <Tooltip title={`${card.title} sayfasına git`}>
            <span>Yönetim Paneli</span>
          </Tooltip>
          <ArrowRightOutlined className="text-xs ml-1 transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </div>
    </div>
  );
};


const AdminDashboard = () => {
  return (
    <>
      <Header />

      <div className="min-h-screen bg-gray-50">
        <div className="border-b border-gray-200 bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-10">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
              ⚙️ Admin Paneli
            </h1>
            <p className="text-base text-gray-500 mt-2">
              Sistem yönetimi, kullanıcı denetimi ve makale süreçleri için merkezi kontrol paneli.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-6 md:p-8 lg:p-10">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {adminCardsData.map((card) => (
              <AdminCard key={card.title} card={card} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;