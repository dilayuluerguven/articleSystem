import React, { useEffect, useState } from "react";
import { Form, Input, Button, message, Spin } from "antd";
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  SaveOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
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
      await axios.put("http://localhost:5000/api/user/update", values, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (values.username) {
        localStorage.setItem("username", values.username);
        sessionStorage.setItem("username", values.username);
        setUserData((prev) => ({ ...prev, username: values.username }));
        window.dispatchEvent(new Event("storage"));
      }

      message.success({
        content: "Profil başarıyla güncellendi!",
        icon: <CheckCircleOutlined className="text-green-500" />,
      });

      if (values.password) form.setFieldsValue({ password: "" });
    } catch (err) {
      console.error(err);
      message.error("Güncelleme başarısız oldu!");
    } finally {
      setSaving(false);
    }
  };

  const getInitial = () => {
    return userData?.username?.charAt(0)?.toUpperCase() || "U";
  };

  const goToApplications = () => {
    navigate("/profile");
  };

  return (
    <>
      <Header />
      <div className="min-h-screen overflow-hidden bg-gradient-to-br from-indigo-100 via-white to-blue-50 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-lg relative overflow-hidden rounded-3xl">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-3xl blur-lg opacity-30 animate-pulse"></div>

          <div className="relative bg-white/70 backdrop-blur-xl border border-white/20 shadow-xl rounded-3xl p-8 overflow-hidden">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-3">
                <Spin size="large" className="text-blue-500" />
                <p className="text-gray-500 font-medium">
                  Profil bilgileri yükleniyor...
                </p>
              </div>
            ) : (
              <>
                <div className="flex flex-col items-center mb-8">
                  <div className="relative w-28 h-28 mb-4">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 animate-spin-slow opacity-30"></div>
                    <div className="relative flex items-center justify-center w-full h-full rounded-full bg-white shadow-md text-4xl font-bold text-indigo-600">
                      {getInitial()}
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {userData?.username}
                  </h2>
                  <p className="text-gray-500">{userData?.email}</p>
                </div>

                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSubmit}
                  className="space-y-6"
                >
                  <Form.Item
                    label={
                      <span className="font-medium text-gray-700">
                        Kullanıcı Adı
                      </span>
                    }
                    name="username"
                    rules={[
                      { required: true, message: "Kullanıcı adı zorunludur" },
                      { min: 3, message: "En az 3 karakter olmalı" },
                    ]}
                  >
                    <Input
                      size="large"
                      prefix={<UserOutlined className="text-blue-400 mr-2" />}
                      className="rounded-xl py-2 border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-300"
                      placeholder="Kullanıcı adınızı girin"
                    />
                  </Form.Item>

                  <Form.Item
                    label={
                      <span className="font-medium text-gray-700">
                        E-posta Adresi
                      </span>
                    }
                    name="email"
                    rules={[
                      { required: true, message: "E-posta zorunludur" },
                      { type: "email", message: "Geçerli bir e-posta girin" },
                    ]}
                  >
                    <Input
                      size="large"
                      prefix={<MailOutlined className="text-blue-400 mr-2" />}
                      className="rounded-xl py-2 border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-300"
                      placeholder="E-posta adresiniz"
                    />
                  </Form.Item>

                  <Form.Item
                    label={
                      <span className="font-medium text-gray-700">
                        Yeni Şifre
                      </span>
                    }
                    name="password"
                    extra={
                      <span className="text-xs text-gray-500">
                        Şifrenizi değiştirmek istemiyorsanız boş bırakın
                      </span>
                    }
                  >
                    <Input.Password
                      size="large"
                      prefix={<LockOutlined className="text-blue-400 mr-2" />}
                      className="rounded-xl py-2 border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-300"
                      placeholder="Yeni şifre (isteğe bağlı)"
                    />
                  </Form.Item>

                  <Form.Item
                    label="Yeni Şifre Tekrar"
                    name="passwordConfirm"
                    dependencies={["password"]}
                    hasFeedback
                    rules={[
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue("password") === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject("Şifreler eşleşmiyor!");
                        },
                      }),
                    ]}
                  >
                    <Input.Password
                      size="large"
                      prefix={<LockOutlined className="text-blue-400 mr-2" />}
                      placeholder="Yeni şifreyi tekrar girin"
                      className="rounded-xl border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-300"
                    />
                  </Form.Item>

                  <div className="flex flex-col sm:flex-row gap-4 mt-6">
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<SaveOutlined />}
                      loading={saving}
                      className="flex-1 h-12 text-lg font-semibold rounded-xl shadow-md bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:-translate-y-0.5"
                    >
                      {saving ? "Güncelleniyor..." : "Bilgilerimi Güncelle"}
                    </Button>

                    <Button
                      icon={<FileTextOutlined />}
                      onClick={goToApplications}
                      className="flex-1 h-12 text-lg font-semibold rounded-xl shadow-md bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800 transition-all duration-300 transform hover:-translate-y-0.5"
                    >
                      Başvurularımı Görüntüle
                    </Button>
                  </div>
                </Form>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default UserProfile;
