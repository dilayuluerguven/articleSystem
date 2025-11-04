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
import {
  CalendarOutlined,
  CloudOutlined,
  DeleteOutlined,
  FilePdfOutlined,
  FormOutlined,
  TeamOutlined,
  UserOutlined,
  StarOutlined,
  BookOutlined,
} from "@ant-design/icons";
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
      if (!Array.isArray(res.data)) {
        console.error("Beklenmeyen veri formatı:", res.data);
        message.error("Veri alınırken hata oluştu.");
        return;
      }
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
      (a, b) =>
        new Date(b.created_at || 0).getTime() -
        new Date(a.created_at || 0).getTime()
    );

    return sorted.map((item) => {
      const key =
        item.aktivite_kod || item.alt_kod || item.ust_kod || "Bilinmeyen";
      counts[key] = (counts[key] || 0) + 1;
      return { ...item, displayTitle: `${key}:${counts[key]}` };
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

  const renderFilePreview = (fileName) => {
    if (!fileName) return null;
    const fileUrl = `http://localhost:5000/uploads/${fileName}`;
    const isImage = /\.(jpg|jpeg|png|gif)$/i.test(fileName);
    const isPDF = /\.pdf$/i.test(fileName);

    if (isImage) {
      return (
        <a href={fileUrl} target="_blank" rel="noopener noreferrer">
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

  const handleForm7PDF = () => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      message.error("Oturum bulunamadı, lütfen tekrar giriş yapın.");
      return;
    }

    fetch(`http://localhost:5000/api/form7/pdf`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("PDF oluşturulamadı");
        return res.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, "_blank");
      })
      .catch(() => {
        message.error("Form-7 PDF indirilemedi");
      });
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
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

          <div className="flex justify-center mb-8">
            <Button
              type="primary"
              size="large"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg shadow-md"
              onClick={handleForm7PDF}
            >
              <FormOutlined /> Form-7 PDF Oluştur
            </Button>
          </div>

          {loading && (
            <div className="flex justify-center items-center py-16">
              <Spin size="large" />
            </div>
          )}

          {!loading && applications.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
              <div className="max-w-md mx-auto">
                <div className="text-6xl mb-4">
                  <CloudOutlined />
                </div>
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
              grid={{ gutter: 20, xs: 1, sm: 1, md: 2, lg: 2, xl: 3, xxl: 3 }}
              dataSource={applications}
              renderItem={(item) => (
                <List.Item>
                  <Card
                    className="h-full transition-all duration-300 hover:shadow-lg border-0 rounded-2xl overflow-hidden bg-white"
                    title={
                      <div className="flex flex-col">
                        <h3 className="text-lg font-bold text-gray-800 leading-tight mb-1 mt-4">
                          {item.displayTitle}
                        </h3>

                        {(item.aktivite_tanim ||
                          item.alt_tanim ||
                          item.ust_tanim) && (
                          <p
                            className="
                              text-sm text-gray-600 italic
                              leading-snug 
                              break-words
                              overflow-hidden
                              text-ellipsis
                              line-clamp-2
                              min-h-[2.8em]
                            "
                          >
                            {item.aktivite_tanim ||
                              item.alt_tanim ||
                              item.ust_tanim}
                          </p>
                        )}
                      </div>
                    }
                    extra={
                      <Popconfirm
                        title="Bu başvuruyu silmek istediğinize emin misiniz?"
                        onConfirm={() => handleDelete(item.id)}
                        okText="Evet"
                        cancelText="Hayır"
                        okButtonProps={{
                          className:
                            "bg-red-500 hover:bg-red-600 border-0 text-white",
                        }}
                      >
                        <Button
                          danger
                          size="small"
                          className="flex items-center gap-1 bg-red-50 border-red-200 text-red-600 hover:bg-red-100 hover:border-red-300"
                        >
                          <DeleteOutlined />
                        </Button>
                      </Popconfirm>
                    }
                  >
                    <div className="p-5 bg-white rounded-xl border border-gray-200 h-[500px] flex flex-col shadow-sm">
                      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                        {item.eser && (
                          <div className="h-[150px] flex justify-center items-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                            {renderFilePreview(item.eser)}
                          </div>
                        )}

                        <div className="flex-1 flex flex-col gap-4">
                          {item.workDescription && (
                            <div className="flex-1 min-h-[80px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pr-2">
                              <h4 className="text-sm font-semibold text-gray-800 mb-2 pb-1 border-b border-gray-100">
                                Künye
                              </h4>
                              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                                {item.workDescription}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-4 mt-2 border-t border-gray-200">
                        <div className="grid grid-cols-5 gap-3 text-center">
                          <div className="space-y-1">
                            <div className="flex flex-col items-center text-gray-600">
                              <UserOutlined className="text-lg mb-1" />
                              <span className="text-xs font-semibold">
                                Yazarlar
                              </span>
                            </div>
                            <p className="text-lg font-bold text-gray-900">
                              {item.yazar_sayisi || "0"}
                            </p>
                          </div>

                          <div className="space-y-1">
                            <div className="flex flex-col items-center text-gray-600">
                              <CalendarOutlined className="text-lg mb-1" />
                              <span className="text-xs font-semibold">
                                Tarih
                              </span>
                            </div>
                            <p className="text-sm font-semibold text-gray-900">
                              {item.created_at
                                ? new Date(item.created_at).toLocaleDateString(
                                    "tr-TR"
                                  )
                                : "-"}
                            </p>
                          </div>

                          <div className="space-y-1">
                            <div className="flex flex-col items-center text-gray-600">
                              <BookOutlined className="text-lg mb-1" />
                              <span className="text-xs font-semibold">Ham</span>
                            </div>
                            <p className="text-lg font-bold text-blue-700">
                              {item.hamPuan ?? "-"}
                            </p>
                          </div>

                          <div className="space-y-1">
                            <div className="flex flex-col items-center text-gray-600">
                              <TeamOutlined className="text-lg mb-1" />
                              <span className="text-xs font-semibold">
                                Yazar
                              </span>
                            </div>
                            <p className="text-lg font-bold text-indigo-700">
                              {item.yazarpuanı ?? "-"}
                            </p>
                          </div>

                          <div className="space-y-1">
                            <div className="flex flex-col items-center text-gray-600">
                              <StarOutlined className="text-lg mb-1" />
                              <span className="text-xs font-semibold">
                                Toplam
                              </span>
                            </div>
                            <p className="text-lg font-bold text-green-700">
                              {item.toplamPuan ?? "-"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4">
                        <Button
                          type="primary"
                          icon={<FilePdfOutlined />}
                          className="w-full h-10 text-white font-medium bg-blue-600 hover:bg-blue-700 rounded-lg"
                          onClick={() => {
                            const token =
                              localStorage.getItem("token") ||
                              sessionStorage.getItem("token");
                            if (!token) {
                              message.error(
                                "Oturum bulunamadı, lütfen tekrar giriş yapın."
                              );
                              return;
                            }

                            window.open(
                              `http://localhost:5000/api/form8/${item.id}/pdf?token=${token}`,
                              "_blank"
                            );
                          }}
                        >
                          Form-8 PDF Oluştur
                        </Button>
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
