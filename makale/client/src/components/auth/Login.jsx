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

      if (res.status !== 200) {
        // Backend’den dönen error mesajını göster
        message.error(data.error || "Giriş başarısız!");
        return;
      }

      message.success("Giriş başarılı!");
      console.log("User:", data.user);

      // Token varsa localStorage'a kaydet
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      navigate("/"); // başarılı giriş sonrası anasayfaya yönlendirme
    } catch (err) {
      console.error("Login error:", err);
      message.error("Sunucu hatası!");
    }
  };

  return (
    <div className="h-screen">
      <div className="flex justify-between h-full">
        <div className="xl:px-20 px-10 w-full flex flex-col h-full justify-center relative">
          <h1 className="text-center text-5xl font-bold mb-2">LOGO</h1>

          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item
              label="E-Mail:"
              name="email"
              rules={[{ required: true, message: "E-Mail Boş Bırakılamaz!" }]}
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
                  title="Responsive"
                  desc="Tüm Cihaz Boyutlarıyla Uyumluluk"
                />
                <AuthCarousel
                  img="/images/statistic.svg"
                  title="İstatistikler"
                  desc="Geniş Tutulan İstatistikler"
                />
                <AuthCarousel
                  img="/images/customer.svg"
                  title="Müşteri Memnuniyeti"
                  desc="Deneyim Sonunda Üründen Memnun Müşteriler"
                />
                <AuthCarousel
                  img="/images/admin.svg"
                  title="Yönetici Paneli"
                  desc="Tek Yerden Yönetim"
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
