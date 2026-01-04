import { Button, Carousel, Checkbox, Form, Input, Alert } from "antd";
import { toast } from "react-toastify";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthCarousel from "../../components/auth/AuthCarousel";

const Login = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");

  const onFinish = async (values) => {
    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error("Login response error:", data);

        setErrorMessage(
          data.error || "Giriş başarısız! Lütfen bilgilerinizi kontrol edin."
        );

        toast.error(data.error || "Giriş başarısız!");
        return;
      }

      setErrorMessage("");
      toast.success("Giriş başarılı!");

      if (data.token) {
        const storage = values.remember ? localStorage : sessionStorage;
        storage.setItem("token", data.token);
        storage.setItem(
          "username",
          data.user?.username || data.user?.email || ""
        );
        storage.setItem("is_admin", data.user?.is_admin ? "1" : "0");
        storage.setItem("role", data.user?.is_admin ? "admin" : "user");

      }

      if (setIsAuthenticated) {
        setIsAuthenticated(true);
      }

      // Redirect admins to the admin panel, others to home
      if (data.user?.is_admin) {
        navigate("/admin");
      } else {
        navigate("/home");
      }
    } catch (err) {
      console.error("Login fetch error:", err);
      setErrorMessage(
        "Sunucuya bağlanılamadı veya beklenmedik hata oluştu!"
      );
      toast.error("Sunucuya bağlanılamadı!");
    }
  };

  return (
    <div className="h-screen">
      <div className="flex justify-between h-full">
        <div className="xl:px-20 px-10 w-full flex flex-col h-full justify-center relative">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img
                src="/images/Konya_Teknik_Üniversitesi_logo.png"
                alt="Konya Teknik Üniversitesi Logosu"
                className="h-16 w-auto transition-all duration-300 hover:scale-105"
              />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Makale Sistemi
            </h1>
            <p className="text-gray-600 text-lg">
              Akademik Yönetim Platformu
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4">
              <Alert
                message={errorMessage}
                type="error"
                showIcon
                closable
                onClose={() => setErrorMessage("")}
              />
            </div>
          )}

          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item
              label="E-Mail:"
              name="email"
              rules={[
                { required: true, message: "E-Mail Boş Bırakılamaz!" },
                { type: "email", message: "Geçerli bir e-mail girin!" },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Şifre:"
              name="password"
              rules={[{ required: true, message: "Şifre Boş Bırakılamaz!" }]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item
              name="remember"
              valuePropName="checked"
              initialValue={false}
            >
              <div className="flex justify-between items-center">
                <Checkbox>Beni Hatırla</Checkbox>
                <Link>Şifrenizi mi unuttunuz?</Link>
              </div>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="w-full"
                size="large"
              >
                Giriş Yap
              </Button>
            </Form.Item>
          </Form>

          <div className="flex justify-center absolute left-0 bottom-10 w-full">
            Henüz bir hesabınız yok mu? &nbsp;
            <Link className="text-blue-600" to="/register">
              Şimdi Kaydol
            </Link>
          </div>
        </div>

        <div className="xl:w-4/6 lg:w-3/5 md:w-1/2 md:flex hidden bg-[#6c63ff] h-full">
          <div className="w-full h-full flex items-center">
            <div className="w-full">
              <Carousel className="!h-full px-6" autoplay>
                <AuthCarousel
                  img="/images/responsive.svg"
                  title="Akademik Uyum"
                  desc="Tüm Akademik Platformlarda Kullanılabilir"
                />
                <AuthCarousel
                  img="/images/statistic.svg"
                  title="Puanlama Sistemi"
                  desc="Makale ve Aktivite Puanlarını Takip Edin"
                />
                <AuthCarousel
                  img="/images/customer.svg"
                  title="Akademisyen Memnuniyeti"
                  desc="Şeffaf ve Hızlı Değerlendirme Süreci"
                />
                <AuthCarousel
                  img="/images/admin.svg"
                  title="Yönetim Paneli"
                  desc="Makaleleri ve Puanlamaları Tek Noktadan Yönetin"
                />
              </Carousel>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
