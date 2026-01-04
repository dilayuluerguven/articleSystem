import React, { useEffect, useState } from "react";
import { Form, Input, Button, Spin } from "antd";
import { toast } from "react-toastify";
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  SaveOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  KeyOutlined
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
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        toast.error("Oturum bulunamadı.");
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
        toast.error("Kullanıcı bilgileri alınamadı.");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [form]);

  const handleSubmit = async (values) => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) return toast.error("Oturum bulunamadı.");

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

      toast.success("Profil başarıyla güncellendi!", { 
        icon: <CheckCircleOutlined className="text-green-500" /> 
      });

      if (values.password) {
        form.setFieldsValue({ password: "", passwordConfirm: "" });
      }
    } catch (err) {
      console.error(err);
      toast.error("Güncelleme başarısız oldu!");
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

  const goToApplications = () => {
    navigate("/profile");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans antialiased text-slate-900">
      <Header />

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Spin size="large" />
            <p className="text-slate-500 font-bold text-lg animate-pulse">
              Profil bilgileriniz hazırlanıyor...
            </p>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            <div className="flex flex-col md:flex-row md:items-end md:justify-between border-b border-slate-200 pb-6">
              <div className="space-y-1">
                <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">
                  Profil Ayarları
                </h1>
                <p className="text-slate-500 font-medium italic">Hesap bilgilerinizi ve güvenliğinizi bu panelden yönetebilirsiniz.</p>
              </div>

              <Button
                icon={<FileTextOutlined />}
                onClick={goToApplications}
                className="mt-6 md:mt-0 h-12 px-6 font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl 
                bg-white hover:bg-indigo-50 text-indigo-600 border border-indigo-100 transition-all hover:scale-105 active:scale-95"
              >
                Başvurularıma Git
              </Button>
            </div>

            <div className="grid lg:grid-cols-12 gap-8">
              
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-xl shadow-slate-200/50 overflow-hidden relative group">
                  <div className="h-32 bg-gradient-to-br from-indigo-600 to-blue-700" />
                  <div className="px-6 pb-10 text-center -mt-16">
                    <div className="inline-block relative">
                      <div className="absolute inset-0 bg-white rounded-full blur-xl opacity-50" />
                      <div className="relative w-32 h-32 rounded-full bg-white p-1.5 shadow-2xl mx-auto">
                        <div className="w-full h-full rounded-full bg-slate-50 flex items-center justify-center text-indigo-600 text-5xl font-black border-4 border-slate-100">
                          {getInitial()}
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 space-y-1">
                      <h2 className="text-2xl font-black text-slate-800 truncate">
                        {userData?.fullname || userData?.username}
                      </h2>
                      <div className="flex items-center justify-center gap-2 text-slate-500 font-semibold bg-slate-100 rounded-full py-1 px-4 mx-auto w-fit">
                        <MailOutlined className="text-indigo-500" />
                        <span className="text-xs truncate max-w-[200px]">{userData?.email}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-50 border border-indigo-100 rounded-[2rem] p-6 shadow-sm border-l-8 border-l-indigo-500">
                  <div className="flex items-center gap-2 mb-3 text-indigo-700">
                    <InfoCircleOutlined className="text-xl" />
                    <span className="font-black text-xs uppercase tracking-widest">Önemli Bilgi</span>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed font-medium italic">
                    "Adı Soyadı" alanındaki değişiklikler, sistem üzerinden alacağınız tüm <strong>PDF belgeleri ve raporlara</strong> otomatik olarak yansıtılacaktır.
                  </p>
                </div>
              </div>

              <div className="lg:col-span-8 space-y-8">
                
                <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-slate-200/50">
                  <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-5">
                    <UserOutlined className="text-2xl text-indigo-600" />
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Kişisel Bilgiler</h3>
                  </div>

                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    requiredMark={false}
                    className="space-y-6"
                  >
                    <div className="grid md:grid-cols-2 gap-x-8 gap-y-2">
                      <Form.Item
                        label={<span className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">Ad Soyad</span>}
                        name="fullname"
                        rules={[
                          { required: true, message: "Lütfen adınızı giriniz" },
                          { min: 3, message: "En az 3 karakter olmalı" },
                        ]}
                      >
                        <Input
                          size="large"
                          prefix={<UserOutlined className="text-indigo-400 mr-2" />}
                          className="rounded-2xl py-3 border-slate-200 hover:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all font-semibold"
                          placeholder="Örn: Ahmet Yılmaz"
                        />
                      </Form.Item>

                      <Form.Item
                        label={<span className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">Kullanıcı Adı</span>}
                        name="username"
                        rules={[
                          { required: true, message: "Lütfen kullanıcı adı giriniz" },
                          { min: 3, message: "En az 3 karakter olmalı" },
                        ]}
                      >
                        <Input
                          size="large"
                          prefix={<UserOutlined className="text-indigo-400 mr-2" />}
                          className="rounded-2xl py-3 border-slate-200 hover:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all font-semibold"
                        />
                      </Form.Item>

                      <Form.Item
                        label={<span className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">E-posta Adresi</span>}
                        name="email"
                        className="md:col-span-2"
                        rules={[
                          { required: true, message: "E-posta gereklidir" },
                          { type: "email", message: "Geçerli bir format giriniz" },
                        ]}
                      >
                        <Input
                          size="large"
                          prefix={<MailOutlined className="text-indigo-400 mr-2" />}
                          className="rounded-2xl py-3 border-slate-200 hover:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all font-semibold"
                        />
                      </Form.Item>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button
                        type="primary"
                        htmlType="submit"
                        icon={<SaveOutlined />}
                        loading={saving}
                        className="h-14 px-10 font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-indigo-200 
                        bg-indigo-600 hover:bg-indigo-500 border-none transition-all hover:scale-105 active:scale-95"
                      >
                        {saving ? "Kaydediliyor..." : "Bilgileri Güncelle"}
                      </Button>
                    </div>
                  </Form>
                </div>

                <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-slate-200/50 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <LockOutlined style={{ fontSize: '100px' }} />
                  </div>
                  
                  <div className="flex items-center gap-3 mb-2 border-b border-slate-100 pb-5">
                    <KeyOutlined className="text-2xl text-rose-500" />
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Güvenlik Ayarları</h3>
                  </div>
                  <p className="text-slate-400 text-xs font-bold mb-8 italic">Şifrenizi değiştirmek istemiyorsanız bu alanı boş bırakabilirsiniz.</p>

                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    requiredMark={false}
                    className="space-y-6"
                  >
                    <div className="grid md:grid-cols-2 gap-x-8">
                      <Form.Item
                        label={<span className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">Yeni Şifre</span>}
                        name="password"
                      >
                        <Input.Password
                          size="large"
                          prefix={<LockOutlined className="text-rose-400 mr-2" />}
                          className="rounded-2xl py-3 border-slate-200 hover:border-rose-400 focus:ring-4 focus:ring-rose-50 transition-all"
                          placeholder="••••••••"
                        />
                      </Form.Item>

                      <Form.Item
                        label={<span className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">Şifre Tekrar</span>}
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
                          prefix={<LockOutlined className="text-rose-400 mr-2" />}
                          className="rounded-2xl py-3 border-slate-200 hover:border-rose-400 focus:ring-4 focus:ring-rose-50 transition-all"
                          placeholder="••••••••"
                        />
                      </Form.Item>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={saving}
                        className="h-14 px-10 font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-rose-200 
                        bg-slate-800 hover:bg-slate-700 border-none transition-all hover:scale-105 active:scale-95"
                      >
                        Şifreyi Güncelle
                      </Button>
                    </div>
                  </Form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;