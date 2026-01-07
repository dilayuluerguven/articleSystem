import React, { useEffect, useState } from "react";
import axios from "axios";
import { Header } from "../header/header";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  FilePdfOutlined
} from "@ant-design/icons";
import { Button, Spin, Typography } from "antd";
import MaddeRow from "../components/utils/MaddeRow";

const { Text } = Typography;

const Form1 = () => {
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString("sv-SE");

  const [formRecord, setFormRecord] = useState(null);
  const [tarih, setTarih] = useState(today);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [fields, setFields] = useState({
    a: { kodlar: "", puanlar: "" },
    b: { kodlar: "", puanlar: "" },
    c: { kodlar: "", puanlar: "" },
    d: { kodlar: "", puanlar: "" },
    e: { kodlar: "", puanlar: "" },
    f: { kodlar: "", puanlar: "" },
    g: { kodlar: "", puanlar: "" },
    h: { kodlar: "", puanlar: "" },
  });

  const updateField = (key, type, value) => {
    setFields((prev) => ({
      ...prev,
      [key]: { ...prev[key], [type]: value },
    }));
  };

  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };

    const fetchAllData = async () => {
      try {
        const [resForm, resA, resB, resC] = await Promise.all([
          axios.get("http://localhost:5000/api/form1", { headers }),
          axios.get("http://localhost:5000/api/form1/doktor/a", { headers }),
          axios.get("http://localhost:5000/api/form1/doktor/b", { headers }),
          axios.get("http://localhost:5000/api/form1/doktor/c", { headers })
        ]);

        if (resForm.data) {
          setFormRecord(resForm.data);
          setTarih(resForm.data.tarih?.substring(0, 10) || today);
        }

        setFields(prev => ({
          ...prev,
          a: {
            kodlar: resA.data.items?.map(i => i.yayin_kodu).join("\n") || "",
            puanlar: resA.data.items?.map(i => Number(i.puan || 0).toFixed(2)).join("\n") || ""
          },
          b: {
            kodlar: resB.data.items?.map(i => i.yayin_kodu).join("\n") || "",
            puanlar: resB.data.items?.map(i => Number(i.hamPuan || 0).toFixed(2)).join("\n") || ""
          },
          c: {
            kodlar: [
              ...(resC.data.dItems?.map(i => i.yayin_kodu) || []),
              ...(resC.data.beItems?.map(i => i.yayin_kodu) || [])
            ].join("\n") || "",
            puanlar: [
              ...(resC.data.dItems?.map(i => Number(i.hamPuan || 0).toFixed(2)) || []),
              ...(resC.data.beItems?.map(i => Number(i.hamPuan || 0).toFixed(2)) || [])
            ].join("\n") || ""
          }
        }));
      } catch (err) {
        toast.error("Veriler çekilirken hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [today]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) return;

    try {
      setSaving(true);
      const headers = { Authorization: `Bearer ${token}` };

      const res = formRecord
        ? await axios.put(`http://localhost:5000/api/form1/${formRecord.id}`, { tarih }, { headers })
        : await axios.post("http://localhost:5000/api/form1", { tarih }, { headers });

      const currentFormId = res.data.id;

      const pdfPayload = Object.keys(fields).reduce((acc, key) => {
        acc[`${key}_yayin_kodlari`] = fields[key].kodlar || "";
        acc[`${key}_puanlar`] = fields[key].puanlar || "";
        return acc;
      }, {});

      const pdfRes = await axios.post(
        `http://localhost:5000/api/form1/${currentFormId}/pdf`,
        pdfPayload,
        { headers, responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([pdfRes.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `FORM-1-${currentFormId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setFormRecord(res.data);
      toast.success("Form kaydedildi ve PDF oluşturuldu.");
    } catch (err) {
      toast.error("İşlem sırasında hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spin size="large" /></div>;

  return (
    <div className="min-h-screen bg-[#f1f5f9] pb-20 font-sans antialiased text-slate-900">
      <Header />
      <div className="max-w-5xl mx-auto px-6 pt-10">
        <button
          onClick={() => navigate("/home")}
          className="group flex items-center gap-3 text-slate-500 hover:text-indigo-600 transition-all duration-300 font-bold uppercase tracking-widest text-xs mb-8"
        >
          <div className="p-2.5 rounded-xl bg-white border border-slate-200 group-hover:border-indigo-500/50 group-hover:bg-indigo-50 transition-all shadow-sm">
            <ArrowLeftOutlined className="text-base" />
          </div>
          <span>Geri Dön</span>
        </button>

        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 p-8 md:p-12 rounded-[3rem] shadow-xl shadow-slate-200/50 relative overflow-hidden">
          <div className="text-center mb-12">
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tighter uppercase leading-tight">
              KONYA TEKNİK ÜNİVERSİTESİ <br />
              <span className="text-indigo-600 text-lg tracking-normal font-bold uppercase">AKADEMİK ATAMA - YÜKSELTME ÖLÇÜTLERİ </span>
            </h1>
            <div className="w-20 h-1.5 bg-indigo-600 mx-auto rounded-full mt-6 shadow-lg shadow-indigo-200" />
          </div>

          <div className="bg-slate-800 text-white py-4 px-6 mb-10 text-center font-black rounded-2xl uppercase tracking-widest text-xs shadow-md">
            DOKTOR ÖĞRETİM ÜYELİĞİ ÖN DEĞERLENDİRME FORMU 
          </div>

          <p className="text-slate-500 text-sm mb-8 italic px-4 border-l-4 border-indigo-500/50 leading-relaxed font-medium">
            İlgili Yasa ve Yönetmelik hükümleriyle öngörülen asgari koşulları sağlamanın yanı sıra; 
          </p>

          <div className="overflow-x-auto rounded-3xl border border-slate-200 mb-10 bg-slate-50/30">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-100 text-slate-600 uppercase text-[10px] font-black tracking-widest">
                  <th className="p-5 border-b border-slate-200 w-16 text-center">Madde</th>
                  <th className="p-5 border-b border-slate-200">Değerlendirme Koşulu</th>
                  <th className="p-5 border-b border-slate-200 w-40 text-center">Yayın Kodları</th>
                  <th className="p-5 border-b border-slate-200 w-40 text-center">Puan</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 bg-white">
                <MaddeRow label="a" field={fields.a} updateField={updateField} text="Aday, başlıca eser niteliğinde en az 1 adet faaliyet yapmış olmalı. " isAuto />
                <MaddeRow label="b" field={fields.b} updateField={updateField} text="A-1a / A-1b / A-2a / A-2b türü yayınlardan toplam 60 puan almış olmalı. " isAuto />
                <MaddeRow label="c" field={fields.c} updateField={updateField} text="En az bir adeti D-1 olmak üzere D-1/D-2 türü iki adet araştırma makalesi ve iki adet B-1 / E-1 türü bildiri. " isAuto />
                <MaddeRow label="d" field={fields.d} updateField={updateField} text="Yüksek lisans ve/veya doktora tezinden A türü, B-1, B-2, D-1 veya K kapsamındaki en az iki faaliyet. " />
                <MaddeRow label="e" field={fields.e} updateField={updateField} text="Tablo 1’deki K, L ve M faaliyetlerinden en az 15 puan almış olmalı. " />
                <MaddeRow label="f" field={fields.f} updateField={updateField} text="(A-G arası) + (K+L+M) faaliyetleri için 130 puanı sağlamalı. " />
                <MaddeRow label="g" field={fields.g} updateField={updateField} text="Başvurduğu bilim alanındaki tüm faaliyetlerden toplamda en az 190 puan sağlamalı. " />
                <MaddeRow label="h" field={fields.h} updateField={updateField} text="Madde 2.6’yı sağlamalı. " />
              </tbody>
            </table>
          </div>

          <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-8 bg-indigo-50/50 p-8 rounded-[2.5rem] border border-indigo-100 shadow-inner">
            <div className="flex flex-col gap-2 w-full md:w-auto">
              <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest ml-1">Belge Tarihi</label>
              <div className="relative">
                <CalendarOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" />
                <input
                  type="date"
                  className="bg-white border border-slate-200 pl-10 pr-5 py-3 rounded-2xl outline-none focus:border-indigo-500 text-slate-700 font-bold transition-all w-full shadow-sm"
                  value={tarih}
                  onChange={(e) => setTarih(e.target.value)}
                />
              </div>
            </div>

            <Button
              type="primary"
              htmlType="submit"
              disabled={saving}
              className="h-16 px-10 rounded-[1.5rem] bg-indigo-600 hover:bg-indigo-700 border-none font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-200 transition-all hover:scale-105 active:scale-95 flex items-center gap-3 w-full md:w-auto justify-center"
            >
              {saving ? <Spin size="small" /> : <><FilePdfOutlined /> Kaydet ve PDF Oluştur</>}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Form1;