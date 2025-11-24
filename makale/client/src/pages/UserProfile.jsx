import React, { useEffect, useState } from "react";
import { Form, Input, Button, message, Spin } from "antd";
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  SaveOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  InfoCircleOutlined
} from "@ant-design/icons";
import axios from "axios";
import { Header } from "../header/header";
import { useNavigate } from "react-router-dom";

const UserProfile = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        message.error("Oturum bulunamadı.");
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get("http://localhost:5000/api/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUserData(res.data);
        form.setFieldsValue({
          fullname: res.data.fullname || "",
          username: res.data.username,
          email: res.data.email,
          password: "",
        });
      } catch (err) {
        console.error(err);
        message.error("Kullanıcı bilgileri alınamadı.");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [form]);

  const handleSubmit = async (values) => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) return message.error("Oturum bulunamadı.");

    try {
      setSaving(true);

      const { passwordConfirm, ...payload } = values;

      await axios.put("http://localhost:5000/api/user/update", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUserData((prev) => ({
        ...prev,
        fullname: values.fullname,
        username: values.username,
        email: values.email,
      }));

      if (values.username) {
        localStorage.setItem("username", values.username);
        sessionStorage.setItem("username", values.username);
        window.dispatchEvent(new Event("storage"));
      }

      message.success({
        content: "Profil başarıyla güncellendi!",
        icon: <CheckCircleOutlined className="text-green-500" />,
      });

      if (values.password) {
        form.setFieldsValue({ password: "", passwordConfirm: "" });
      }
    } catch (err) {
      console.error(err);
      message.error("Güncelleme başarısız oldu!");
    } finally {
      setSaving(false);
    }
  };

  const getInitial = () => {
    return (
      userData?.fullname?.charAt(0)?.toUpperCase() ||
      userData?.username?.charAt(0)?.toUpperCase() ||
      "U"
    );
  };
const currentGetInitial = getInitial;
  const goToApplications = () => {
    navigate("/profile");
  };

  return (
    <>
      <div className="h-screen flex flex-col overflow-hidden">
        <Header />

        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-blue-50 mt-2">
          <div className="w-full max-w-7xl px-4 md:px-10 relative">
            <div
              className="absolute -inset-3 bg-gradient-to-r from-blue-500/50 via-indigo-600/50 to-sky-500/50 
            rounded-4xl blur-3xl opacity-30 pointer-events-none"
            />

            <div
              className="relative bg-white/90 backdrop-blur-xl border border-white/60 shadow-3xl rounded-4xl 
            p-8 md:p-12 overflow-hidden h-[90vh] flex flex-col"
            >
              <div className="flex-1 overflow-hidden">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-16 space-y-4">
                    <Spin size="large" />
                    <p className="text-gray-500 font-medium text-lg">
                      Profil bilgileri yükleniyor...
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 md:mb-10">
                      <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">
                          Hesap Ayarları
                        </h1>
                      </div>

                      <Button
                        icon={<FileTextOutlined />}
                        onClick={goToApplications}
                        className="mt-4 md:mt-0 h-12 px-6 text-base font-semibold rounded-xl shadow-lg
                        bg-white hover:bg-gray-50
                        text-indigo-600 border border-gray-200 transition duration-200"
                      >
                        Başvurularımı Görüntüle
                      </Button>
                    </div>

                    <div className="grid lg:grid-cols-4 gap-8 h-[calc(90vh-160px)] overflow-hidden">
                      <div className="lg:col-span-1 space-y-6 overflow-hidden">
                        <div className="rounded-3xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white p-6 shadow-2xl h-auto flex flex-col justify-center items-center transform hover:scale-[1.02] transition duration-300">
                          <div className="relative w-32 h-32 mb-4">
                            <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse-slow opacity-50" />
                            <div className="relative flex items-center justify-center w-full h-full rounded-full bg-white text-indigo-700 text-5xl font-extrabold shadow-xl border-4 border-white">
                              {currentGetInitial()}
                            </div>
                          </div>
                          <h2 className="text-2xl font-bold text-center mt-1">
                            {userData?.fullname || userData?.username}
                          </h2>
                          <p className="text-sm mt-1 text-indigo-100 text-center font-light break-all px-2">
                            {userData?.email}
                          </p>
                        </div>

                        <div className="rounded-3xl bg-white/70 border border-indigo-100 p-6 text-sm text-gray-600 shadow-lg border-l-4 border-l-indigo-500">
                          <p className="font-bold text-indigo-700 mb-2 flex items-center">
                            <InfoCircleOutlined className="mr-2 text-lg" />{" "}
                            İpucu
                          </p>
                          <p>
                            Adı Soyadı alanını güncellediğinizde tüm sistem
                            çıktıları (PDF, raporlar) için bu yeni isim
                            kullanılacaktır. Lütfen doğru giriniz.
                          </p>
                        </div>
                      </div>

                      <div className="lg:col-span-3 overflow-y-auto pr-4">
                        <div className="rounded-3xl bg-white/95 border border-gray-100 p-8 shadow-xl mb-3">
                          <h3 className="text-2xl font-extrabold text-gray-800 mb-6 border-b pb-3">
                            <UserOutlined className="mr-2 text-blue-500" />{" "}
                            Hesap Bilgileri
                          </h3>

                          <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleSubmit}
                            className="space-y-6"
                          >
                            <div className="grid md:grid-cols-3 gap-6">
                              <Form.Item
                                label={
                                  <span className="font-semibold text-gray-700">
                                    Adı Soyadı
                                  </span>
                                }
                                name="fullname"
                                rules={[
                                  {
                                    required: true,
                                    message: "Adı Soyadı zorunludur",
                                  },
                                  {
                                    min: 3,
                                    message: "En az 3 karakter olmalı",
                                  },
                                ]}
                              >
                                <Input
                                  size="large"
                                  prefix={
                                    <UserOutlined className="text-blue-400 mr-2" />
                                  }
                                  className="rounded-xl py-3 border-gray-300 hover:border-indigo-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-300 transition"
                                  placeholder="Adınızı ve soyadınızı girin"
                                />
                              </Form.Item>

                              <Form.Item
                                label={
                                  <span className="font-semibold text-gray-700">
                                    Kullanıcı Adı
                                  </span>
                                }
                                name="username"
                                rules={[
                                  {
                                    required: true,
                                    message: "Kullanıcı adı zorunludur",
                                  },
                                  {
                                    min: 3,
                                    message: "En az 3 karakter olmalı",
                                  },
                                ]}
                              >
                                <Input
                                  size="large"
                                  prefix={
                                    <UserOutlined className="text-blue-400 mr-2" />
                                  }
                                  className="rounded-xl py-3 border-gray-300 hover:border-indigo-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-300 transition"
                                  placeholder="Kullanıcı adınızı girin"
                                />
                              </Form.Item>

                              <Form.Item
                                label={
                                  <span className="font-semibold text-gray-700">
                                    E-posta Adresi
                                  </span>
                                }
                                name="email"
                                rules={[
                                  {
                                    required: true,
                                    message: "E-posta zorunludur",
                                  },
                                  {
                                    type: "email",
                                    message: "Geçerli bir e-posta girin",
                                  },
                                ]}
                              >
                                <Input
                                  size="large"
                                  prefix={
                                    <MailOutlined className="text-blue-400 mr-2" />
                                  }
                                  className="rounded-xl py-3 border-gray-300 hover:border-indigo-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-300 transition"
                                  placeholder="E-posta adresiniz"
                                />
                              </Form.Item>
                            </div>

                            <div className="flex justify-end mt-8">
                              <Button
                                type="primary"
                                htmlType="submit"
                                icon={<SaveOutlined />}
                                loading={saving}
                                className="h-12 px-8 text-base font-bold rounded-xl shadow-lg 
                                bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 
                                transition-all duration-300 transform hover:-translate-y-0.5 border-none"
                              >
                                {saving
                                  ? "Güncelleniyor..."
                                  : "Bilgileri Kaydet"}
                              </Button>
                            </div>
                          </Form>
                        </div>

                        <div className="rounded-3xl bg-white/95 border border-gray-100 p-8 shadow-xl">
                          <h3 className="text-2xl font-extrabold text-gray-800 mb-6 border-b pb-3">
                            <LockOutlined className="mr-2 text-red-500" /> Şifre
                            Güncelleme
                          </h3>
                          <p className="text-sm text-gray-500 mb-6">
                            Şifreyi değiştirmek **isteğe bağlıdır**. Eğer yeni
                            şifre girmeyecekseniz alanları boş bırakınız.
                          </p>

                          <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleSubmit}
                            className="space-y-6"
                          >
                            <div className="grid md:grid-cols-2 gap-6">
                              <Form.Item
                                label={
                                  <span className="font-semibold text-gray-700">
                                    Yeni Şifre
                                  </span>
                                }
                                name="password"
                              >
                                <Input.Password
                                  size="large"
                                  prefix={
                                    <LockOutlined className="text-red-400 mr-2" />
                                  }
                                  className="rounded-xl py-3 border-gray-300 hover:border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-300 transition"
                                  placeholder="Yeni şifre (isteğe bağlı)"
                                />
                              </Form.Item>

                              <Form.Item
                                label={
                                  <span className="font-semibold text-gray-700">
                                    Yeni Şifre Tekrar
                                  </span>
                                }
                                name="passwordConfirm"
                                dependencies={["password"]}
                                hasFeedback
                                rules={[
                                  ({ getFieldValue }) => ({
                                    validator(_, value) {
                                      if (
                                        !value ||
                                        getFieldValue("password") === value
                                      ) {
                                        return Promise.resolve();
                                      }
                                      return Promise.reject(
                                        "Şifreler eşleşmiyor!"
                                      );
                                    },
                                  }),
                                ]}
                              >
                                <Input.Password
                                  size="large"
                                  prefix={
                                    <LockOutlined className="text-red-400 mr-2" />
                                  }
                                  placeholder="Yeni şifreyi tekrar girin"
                                  className="rounded-xl py-3 border-gray-300 hover:border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-300 transition"
                                />
                              </Form.Item>
                            </div>

                            <div className="flex justify-end mt-8">
                              <Button
                                type="primary"
                                htmlType="submit"
                                icon={<SaveOutlined />}
                                loading={saving}
                                className="h-12 px-8 text-base font-bold rounded-xl shadow-lg 
                                bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 
                                transition-all duration-300 transform hover:-translate-y-0.5 border-none"
                              >
                                {saving
                                  ? "Şifre Güncelleniyor..."
                                  : "Şifreyi Güncelle"}
                              </Button>
                            </div>
                          </Form>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserProfile;
