import React from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../../header/header";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const cards = [
    {
      title: "Kullanıcı Yönetimi",
      desc: "Kullanıcıları görüntüle, admin yetkisi ver veya kaldır.",
      path: "/admin/users",
      icon: "👤",
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Makale Başvuruları",
      desc: "Yapılan makale başvurularını incele ve düzenle.",
      path: "/admin/basvuru",
      icon: "📄",
      color: "from-green-500 to-green-600",
    },
    {
      title: "Form-3 Kayıtları",
      desc: "Akademik Form-3 bilgilerini kontrol et.",
      path: "/admin/form3",
      icon: "🧾",
      color: "from-purple-500 to-purple-600",
    },
  ];

  return (
    <>
    <Header/>
    <div className="min-h-screen bg-gray-100">
      <div className="bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-semibold tracking-tight">
            Admin Paneli
          </h1>
          <p className="text-gray-300 text-sm mt-1">
            Makale Yükleme ve Değerlendirme Sistemi
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card) => (
            <div
              key={card.title}
              onClick={() => navigate(card.path)}
              className="group cursor-pointer bg-white rounded-xl shadow-sm border border-gray-200
                         hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
            >
              <div
                className={`h-2 rounded-t-xl bg-gradient-to-r ${card.color}`}
              />

              <div className="p-6">
                <div className="text-4xl mb-4">{card.icon}</div>

                <h2 className="text-lg font-semibold text-gray-800 mb-1">
                  {card.title}
                </h2>

                <p className="text-sm text-gray-600 mb-4">
                  {card.desc}
                </p>

                <span className="inline-block text-sm font-medium text-gray-700 group-hover:text-black">
                  Yönet →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </>
  );
};

export default AdminDashboard;
