import { Button, Carousel, Checkbox, Form, Input, message } from "antd";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthCarousel from "../../components/auth/AuthCarousel";

const Login = () => {
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        message.error(data.error || "Giriş başarısız!");
        return;
      }

      message.success("Giriş başarılı!");
      console.log("User:", data.user);

      if (data.token) {
        localStorage.setItem("token", data.token);

        if (data.user?.username) {
          localStorage.setItem("username", data.user.username);
        } else if (data.user?.email) {
          localStorage.setItem("username", data.user.email);
        }
      }

      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      message.error("Sunucu hatası!");
    }
  };

  return (
    <div className="h-screen">
      <div className="flex justify-between h-full">
        <div className="xl:px-20 px-10 w-full flex flex-col h-full justify-center relative">
          <h1 className="text-center text-5xl font-bold mb-2 ">
            <img
              src="/images/Konya_Teknik_Üniversitesi_logo.png"
              alt="Konya Teknik Üniversitesi Logosu"
              className="mt-20 h-10 w-auto transition-transform duration-300 group-hover:scale-110"
            />
            Makale Sistemi
          </h1>

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

            <Form.Item name="remember" valuePropName="checked">
              <div className="flex justify-between items-center">
                <Checkbox>Beni Hatırla</Checkbox>
                <Link>Şifrenizi mi unuttunuz?</Link>
              </div>
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
