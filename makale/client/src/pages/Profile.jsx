import React, { useEffect, useState } from "react";
import {
  Card,
  List,
  Spin,
  Typography,
  message,
  Button,
  Popconfirm,
} from "antd";
import axios from "axios";
import { Header } from "../header/header";

const { Title, Text } = Typography;

const Profile = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) return;
    fetchApplications(token);
  }, []);

  const fetchApplications = async (token) => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/basvuru", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setApplications(numberApplications(res.data));
    } catch (err) {
      console.error(err);
      message.error("Başvurular alınamadı!");
    } finally {
      setLoading(false);
    }
  };

  const numberApplications = (apps) => {
    const counts = {};
    const sorted = [...apps].sort(
      (a, b) => new Date(a.created_at) - new Date(b.created_at)
    );
    return sorted.map((item) => {
      const key = item.ust_aktivite || "Bilinmeyen Aktivite";
      counts[key] = (counts[key] || 0) + 1;
      return { ...item, displayTitle: `${key} :${counts[key]}` };
    });
  };

  const handleDelete = async (id) => {
    const token =
      sessionStorage.getItem("token") || localStorage.getItem("token");
    try {
      await axios.delete(`http://localhost:5000/api/basvuru/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success("Başvuru silindi");
      const updated = applications.filter((app) => app.id !== id);
      setApplications(numberApplications(updated));
    } catch (err) {
      console.error("Başvuru silinemedi:", err);
      message.error("Başvuru silinemedi. Tekrar deneyin.");
    }
  };

  //  uygun önizleme gösteren fonksiyonum
  const renderFilePreview = (fileName) => {
    if (!fileName) return null;
    const fileUrl = `http://localhost:5000/uploads/${fileName}`;
    const isImage = /\.(jpg|jpeg|png|gif)$/i.test(fileName);
    const isPDF = /\.pdf$/i.test(fileName);

    if (isImage) {
      return (
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <img
            src={fileUrl}
            alt={fileName}
            className="w-full h-48 object-cover rounded-lg border border-gray-200 hover:scale-[1.02] transition-transform"
          />
        </a>
      );
    } else if (isPDF) {
      return (
        <iframe
          src={fileUrl}
          title={fileName}
          className="w-full h-56 border rounded-lg"
        />
      );
    } else {
      return (
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg border border-blue-200"
        >
          <span>📎</span>
          {fileName}
        </a>
      );
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Title
              level={1}
              className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4"
            >
              Başvurularım
            </Title>
            <Text className="text-lg text-gray-600">
              Tüm başvurularınızı buradan görüntüleyebilir ve yönetebilirsiniz
            </Text>
          </div>

          {loading && (
            <div className="flex justify-center items-center py-16">
              <Spin size="large" className="custom-spin" />
            </div>
          )}

          {!loading && applications.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
              <div className="max-w-md mx-auto">
                <div className="text-6xl mb-4">📝</div>
                <Title level={3} className="text-gray-700 mb-2">
                  Henüz başvuru bulunmuyor
                </Title>
                <Text className="text-gray-500 text-lg">
                  Yeni bir başvuru oluşturarak başlayabilirsiniz
                </Text>
              </div>
            </div>
          )}

          {!loading && applications.length > 0 && (
            <List
              grid={{ gutter: 24, xs: 1, sm: 1, md: 2, lg: 2, xl: 3, xxl: 3 }}
              dataSource={applications}
              renderItem={(item) => (
                <List.Item>
                  <Card
                    className="h-full transition-all duration-300 hover:shadow-lg border-0 rounded-2xl overflow-hidden bg-white"
                    title={
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-800 truncate">
                          {item.displayTitle}
                        </span>
                      </div>
                    }
                    extra={
                      <Popconfirm
                        title="Bu başvuruyu silmek istediğinize emin misiniz?"
                        onConfirm={() => handleDelete(item.id)}
                        okText="Evet"
                        cancelText="Hayır"
                        okButtonProps={{
                          className: "bg-red-500 hover:bg-red-600 border-0",
                        }}
                      >
                        <Button
                          danger
                          size="small"
                          className="flex items-center gap-1 bg-red-50 border-red-200 text-red-600 hover:bg-red-100 hover:border-red-300"
                        >
                          <span>🗑️</span>
                          Sil
                        </Button>
                      </Popconfirm>
                    }
                    styles={{
                      body: { padding: "20px" },
                      header: {
                        borderBottom: "1px solid #e5e7eb",
                        padding: "16px 20px",
                        backgroundColor: "#f8fafc",
                      },
                    }}
                  >
                    {/* önizleme  */}
                    <div className="space-y-3">
                      {item.eser && renderFilePreview(item.eser)}

                      {item.category_description && (
                        <div className="flex flex-col">
                          <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                            Kategori Tanımı
                          </Text>
                          <Text className="text-gray-700 text-sm leading-relaxed">
                            {item.category_description}
                          </Text>
                        </div>
                      )}

                      {item.workDescription || item.kunye ? (
                        <div className="flex flex-col">
                          <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                            Künyesi
                          </Text>
                          <Text className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                            {item.workDescription || item.kunye}
                          </Text>
                        </div>
                      ) : null}

                      <div className="flex flex-wrap gap-4 pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">👤</span>
                          <Text className="text-sm text-gray-600">
                            {item.yazar_sayisi || "0"} yazar
                          </Text>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">📅</span>
                          <Text className="text-sm text-gray-600">
                            {item.created_at
                              ? new Date(item.created_at).toLocaleDateString(
                                  "tr-TR"
                                )
                              : "-"}
                          </Text>
                        </div>
                      </div>
                    </div>
                  </Card>
                </List.Item>
              )}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default Profile;
