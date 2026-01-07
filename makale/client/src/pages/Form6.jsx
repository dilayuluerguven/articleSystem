import React, { useState, useEffect } from "react";
import axios from "axios";
import { Header } from "../header/header";
import { toast } from "react-toastify";
import MaddeRow from "../components/utils/MaddeRow";
import { useNavigate } from "react-router-dom";
import { ArrowLeftOutlined, FilePdfOutlined, CalendarOutlined } from "@ant-design/icons";
import { Button, Spin } from "antd";

const Form6 = () => {
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString("sv-SE");
  const [tarih, setTarih] = useState(today);
  const [saving, setSaving] = useState(false);

  const [fields, setFields] = useState({
    a: { kodlar: "", puanlar: "" },
    b: { kodlar: "", puanlar: "" },
    c: { kodlar: "", puanlar: "" },
    d: { kodlar: "", puanlar: "" },
    e: { kodlar: "", puanlar: "" },
    f: { kodlar: "", puanlar: "" },
    g: { kodlar: "", puanlar: "" },
    h: { kodlar: "", puanlar: "" }
  });

  const updateField = (k, t, v) => setFields(p => ({ ...p, [k]: { ...p[k], [t]: v } }));

  const autoFill = async () => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      toast.warn("Oturum bulunamadı, lütfen tekrar giriş yapın."); 
      return;
    }

    try {
      const res = await axios.get("http://localhost:5000/api/form6/auto", {
        headers: { Authorization: `Bearer ${token}` }
      });

      setTarih(res.data.tarih || today);
      setFields(p => Object.fromEntries(Object.keys(p).map(k => [k, {
        kodlar: res.data[`${k}_yayin_kodlari`] || "",
        puanlar: res.data[`${k}_puanlar`] || ""
      }])));
      
      toast.success("Veriler otomatik olarak dolduruldu."); 
    } catch (e) {
      toast.error("Veriler sunucudan çekilirken bir hata oluştu."); 
    }
  };

  useEffect(() => {
    autoFill();
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    
    if (!token) {
      toast.error("PDF oluşturmak için giriş yapmanız gerekmektedir."); 
      return;
    }

    setSaving(true);
    const toastId = toast.loading("PDF hazırlanıyor, lütfen bekleyin..."); 

    try {
      const body = {
        tarih,
        ...Object.fromEntries(Object.entries(fields).flatMap(([k, v]) => [
          [`${k}_yayin_kodlari`, v.kodlar],
          [`${k}_puanlar`, v.puanlar]
        ]))
      };

      const res = await axios.post("http://localhost:5000/api/form6/pdf", body, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob"
      });

      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "FORM-6-PROFESORLUK.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.update(toastId, { 
        render: "PDF başarıyla oluşturuldu ve indiriliyor.", 
        type: "success", 
        isLoading: false, 
        autoClose: 3000 
      }); 
    } catch (err) {
      toast.update(toastId, { 
        render: "PDF oluşturulurken sunucu hatası meydana geldi.", 
        type: "error", 
        isLoading: false, 
        autoClose: 3000 
      }); 
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] pb-20 font-sans antialiased text-slate-900">
      <Header />
      <div className="max-w-5xl mx-auto px-6 pt-10">
        <button 
          onClick={() => navigate("/home")} 
          className="group flex items-center gap-3 text-slate-500 hover:text-indigo-600 font-bold uppercase text-xs mb-8"
        >
          <div className="p-2.5 rounded-xl bg-white border shadow-sm">
            <ArrowLeftOutlined />
          </div>
          <span>Geri Dön</span>
        </button>

        <form onSubmit={handleSubmit} className="bg-white border p-8 md:p-12 rounded-[3rem] shadow-xl">
          <div className="text-center mb-12">
            <h1 className="text-2xl font-black text-slate-800 uppercase">
              KONYA TEKNİK ÜNİVERSİTESİ<br />
              <span className="text-indigo-600 text-lg">MİMARLIK, PLANLAMA, TASARIM / SOSYAL BİLİMLER</span>
            </h1>
            <div className="w-20 h-1.5 bg-indigo-600 mx-auto mt-6 rounded-full" />
          </div>

          <div className="bg-slate-800 text-white py-4 px-6 mb-10 text-center font-black rounded-2xl uppercase tracking-widest text-xs">
            PROFESÖRLÜK ASGARİ KOŞULLAR DEĞERLENDİRME FORMU (FORM-6) 
          </div>

          <div className="overflow-x-auto rounded-3xl border mb-10">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-100 text-slate-600 uppercase text-[10px] font-black">
                  <th className="p-5 w-16 text-center">Madde</th>
                  <th className="p-5">Koşul</th>
                  <th className="p-5 w-40 text-center">Yayın Kodları</th>
                  <th className="p-5 w-40 text-center">Puan</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y">
                <MaddeRow label="a" field={fields.a} updateField={updateField} text="En az bir tanesi doçentlik sonrası olmak üzere başlıca eser niteliğinde 3 adet faaliyet."  />
                <MaddeRow label="b" field={fields.b} updateField={updateField} text="Doçentlik sonrası A-1a, A-1b, A-1g, A-2a, A-2b, A-3a, C-1 veya C-2 türü en az 2 adet faaliyet."  />
                <MaddeRow label="c" field={fields.c} updateField={updateField} text="Doçentlik sonrası K, L, M kategorilerinden en az 50 puan veya A kategorisi ile telafi."  />
                <MaddeRow label="d" field={fields.d} updateField={updateField} text="Doçentlik sonrası en az 200 puan, toplamda en az 550 puan."  />
                <MaddeRow label="e" field={fields.e} updateField={updateField} text="Tüm faaliyetlerden toplamda en az 650 puan."  />
                <MaddeRow label="f" field={fields.f} updateField={updateField} text="Madde 2.6 koşulları."  />
                <MaddeRow label="g" field={fields.g} updateField={updateField} text="Madde 2.7 koşulları."  />
                <MaddeRow label="h" field={fields.h} updateField={updateField} text="Madde 2.9 koşulları."  />
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between bg-indigo-50 p-6 rounded-3xl border">
            <div className="relative">
              <CalendarOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" />
              <input 
                type="date" 
                value={tarih} 
                onChange={e => setTarih(e.target.value)} 
                className="pl-10 pr-5 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 outline-none" 
              />
            </div>
            <Button 
              htmlType="submit" 
              type="primary" 
              disabled={saving} 
              className="h-12 px-8 rounded-xl font-bold"
            >
              {saving ? <Spin /> : <><FilePdfOutlined /> PDF İndir</>}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Form6;