import { useState, useEffect } from "react";
import axios from "axios";
import { Header } from "../../header/header";
import { toast } from "react-toastify";
import MaddeRow from "../../components/utils/MaddeRow";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeftOutlined,
  FilePdfOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { Button, Spin } from "antd";

const Form3 = () => {
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString("sv-SE");

  const [tarih, setTarih] = useState(today);
  const [saving, setSaving] = useState(false);
  const [formRecord, setFormRecord] = useState(null);

  const [fields, setFields] = useState({
    a: { kodlar: "", puanlar: "" },
    b: { kodlar: "", puanlar: "" },
    c: { kodlar: "", puanlar: "" },
    d: { kodlar: "", puanlar: "" },
    e: { kodlar: "", puanlar: "" },
    f: { kodlar: "", puanlar: "" },
    g: { kodlar: "", puanlar: "" },
    h: { kodlar: "", puanlar: "" },
    i: { kodlar: "", puanlar: "" },
    j: { kodlar: "", puanlar: "" },
  });

  const updateField = (key, type, value) => {
    setFields((prev) => ({
      ...prev,
      [key]: { ...prev[key], [type]: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) return toast.error("Giriş yapın");

    setSaving(true);
    try {
      const payload = {
        tarih,
        ...Object.fromEntries(
          Object.entries(fields).flatMap(([k, v]) => [
            [`${k}_yayin_kodlari`, v.kodlar || ""],
            [`${k}_puanlar`, v.puanlar || ""],
          ])
        ),
      };

      const apiUrl = formRecord?.id
        ? `http://localhost:5000/api/form3/${formRecord.id}/pdf`
        : "http://localhost:5000/api/form3/pdf";

      const res = await axios.post(apiUrl, payload, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
      });

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = globalThis.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "FORM-3-DOCENTLIK.pdf";
      a.click();
      globalThis.URL.revokeObjectURL(url);
      toast.success("PDF başarıyla oluşturuldu.");
    } catch (err) {
      console.error(err);
      toast.error("PDF oluşturulamadı.");
    } finally {
      setSaving(false);
    }
  };
  const autoFill = async () => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) return;

    try {
      const res = await axios.get("http://localhost:5000/api/form3/auto", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data || {};
      if (data.id) setFormRecord(data);
      setTarih(data.tarih || today);

      setFields((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((key) => {
          updated[key] = {
            kodlar: data[`${key}_yayin_kodlari`] || "",
            puanlar: data[`${key}_puanlar`] || "",
          };
        });
        return updated;
      });
      toast.info("Veriler otomatik dolduruldu.");
    } catch (err) {
      console.error("Otomatik doldurma hatası:", err);
      toast.error("Otomatik doldurma sırasında hata oluştu.");
    }
  };

  useEffect(() => {
    autoFill();
  }, []);

  return (
    <div className="min-h-screen bg-[#f1f5f9] pb-20 font-sans antialiased text-slate-900">
      <Header />

      <div className="max-w-5xl mx-auto px-6 pt-10">
        <button
          onClick={() => navigate("/home")}
          className="group flex items-center gap-3 text-slate-500 hover:text-indigo-600 transition-all duration-300 font-bold uppercase tracking-widest text-xs mb-8"
        >
          <div className="p-2.5 rounded-xl bg-white border border-slate-200 group-hover:border-indigo-500/50 group-hover:bg-indigo-50 transition-all shadow-sm">
            <ArrowLeftOutlined />
          </div>
          <span>Geri Dön</span>
        </button>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-slate-200 p-8 md:p-12 rounded-[3rem] shadow-xl shadow-slate-200/50"
        >
          <div className="text-center mb-12">
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tighter uppercase leading-tight">
              KONYA TEKNİK ÜNİVERSİTESİ <br />
              <span className="text-indigo-600 text-lg font-bold uppercase">
                AKADEMİK ATAMA - YÜKSELTME ÖLÇÜTLERİ
              </span>
            </h1>
            <div className="w-20 h-1.5 bg-indigo-600 mx-auto rounded-full mt-6 shadow-lg shadow-indigo-200" />
          </div>

          <div className="bg-slate-800 text-white py-4 px-6 mb-10 text-center font-black rounded-2xl uppercase tracking-widest text-xs shadow-md">
            DOÇENTLİK ASGARİ KOŞULLAR DEĞERLENDİRME FORMU
          </div>

          <p className="text-slate-500 text-sm mb-8 italic px-4 border-l-4 border-indigo-500/50 leading-relaxed font-medium">
            İlgili Yasa ve Yönetmelik hükümleriyle öngörülen asgari koşulları sağlamanın yanı sıra;
          </p>

          <div className="overflow-x-auto rounded-3xl border border-slate-200 mb-10 bg-slate-50/30">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-100 text-slate-600 uppercase text-[10px] font-black tracking-widest">
                  <th className="p-5 w-16 text-center">Madde</th>
                  <th className="p-5">Değerlendirme Koşulu</th>
                  <th className="p-5 w-40 text-center">Yayın Kodları</th>
                  <th className="p-5 w-40 text-center">Puan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                <MaddeRow
                  label="a"
                  field={fields.a}
                  updateField={updateField}
                  text="Aday, Doktor unvanı aldıktan sonra kendi lisansüstü çalışmalarından üretilmemiş başlıca eser niteliğinde en az 2 adet faaliyet yapmış olmalı."
                />
                <MaddeRow
                  label="b"
                  field={fields.b}
                  updateField={updateField}
                  text="Doktor unvanı aldıktan sonra, 10a maddesinde puanlanmamış, Tablo 1’e göre A-1a, A-1b, A-2a, C-1 kategorilerinde (lisansüstü tezlerden üretilmemiş) en az 1 adet faaliyet yapmış olmalı."
                />
                <MaddeRow
                  label="c"
                  field={fields.c}
                  updateField={updateField}
                  text="Tablo 1’e göre A-1a, A-1b, A-2a, A-2b, A-3a, C-1, C-2 türündeki faaliyetlerden (10a, b hariç) en az 80 puan almış olmalı."
                />
                <MaddeRow
                  label="d"
                  field={fields.d}
                  updateField={updateField}
                  text="B, C, D, E, F kategorisinde en az yarısı doktor unvanı sonrası olmak üzere toplamda 70 puan almış olmalı (veya A kategorisi telafisi)."
                />
                <MaddeRow
                  label="e"
                  field={fields.e}
                  updateField={updateField}
                  text="Doktor unvanı sonrası; Tablo 1’deki K, L ve M faaliyetlerinden en az 30 puan almış olmalı (veya A-1a/b, A-2a telafisi)."
                />
                <MaddeRow
                  label="f"
                  field={fields.f}
                  updateField={updateField}
                  text="Başvurduğu alanda lisans / lisansüstü ders veriyor olmalı veya danışman olarak yüksek lisans/doktora tezi yönetmiş / yönetiyor olmalı."
                />
                <MaddeRow
                  label="g"
                  field={fields.g}
                  updateField={updateField}
                  text="Tablo 1 puanlama sistemine göre (A-G arası) + (K+L+M) faaliyetleri için toplam 370 puanı sağlamalı."
                />
                <MaddeRow
                  label="h"
                  field={fields.h}
                  updateField={updateField}
                  text="Başvurduğu bilim alanındaki tüm faaliyetlerden olmak üzere toplamda en az 500 puan almış olmalı."
                />
                <MaddeRow
                  label="i"
                  field={fields.i}
                  updateField={updateField}
                  text="Madde 2.6’yı sağlamalı."
                />
                <MaddeRow
                  label="j"
                  field={fields.j}
                  updateField={updateField}
                  text="Madde 2.9’u sağlamalı."
                />
              </tbody>
            </table>
          </div>

          <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-8 bg-indigo-50/50 p-8 rounded-[2.5rem] border border-indigo-100 shadow-inner">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest ml-1">
                Belge Tarihi
              </label>
              <div className="relative">
                <CalendarOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" />
                <input
                  type="date"
                  value={tarih}
                  onChange={(e) => setTarih(e.target.value)}
                  className="bg-white border border-slate-200 pl-10 pr-5 py-3 rounded-2xl outline-none focus:border-indigo-500 font-bold text-slate-700 w-full md:w-auto shadow-sm"
                />
              </div>
            </div>

            <Button
              type="primary"
              htmlType="submit"
              disabled={saving}
              className="h-16 px-12 rounded-[1.5rem] bg-indigo-600 hover:bg-indigo-700 border-none font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-200 flex items-center gap-3 w-full md:w-auto justify-center transition-all hover:scale-105"
            >
              {saving ? <Spin size="small" /> : <><FilePdfOutlined /> PDF Oluştur</>}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Form3;