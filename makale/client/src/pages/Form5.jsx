import React, { useState, useEffect } from "react";
import axios from "axios";
import { Header } from "../header/header";
import { toast } from "react-toastify";
import MaddeRow from "../components/utils/MaddeRow";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeftOutlined,
  FilePdfOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { Button, Spin } from "antd";

const Form5 = () => {
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
    h: { kodlar: "", puanlar: "" },
  });

  const updateField = (k, t, v) => {
    setFields((p) => ({ ...p, [k]: { ...p[k], [t]: v } }));
  };

  const autoFill = async () => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) return;

    const res = await axios.get("http://localhost:5000/api/form5/auto", {
      headers: { Authorization: `Bearer ${token}` },
    });

    setTarih(res.data.tarih || today);

    setFields((p) =>
      Object.fromEntries(
        Object.keys(p).map((k) => [
          k,
          {
            kodlar: res.data[`${k}_yayin_kodlari`] || "",
            puanlar: res.data[`${k}_puanlar`] || "",
          },
        ])
      )
    );
  };

  useEffect(() => {
    autoFill();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) return toast.error("Giriş yapın");

    setSaving(true);
    try {
      const body = {
        tarih,
        ...Object.fromEntries(
          Object.entries(fields).flatMap(([k, v]) => [
            [`${k}_yayin_kodlari`, v.kodlar],
            [`${k}_puanlar`, v.puanlar],
          ])
        ),
      };

      const res = await axios.post(
        "http://localhost:5000/api/form5/pdf",
        body,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "FORM-5-PROFESORLUK.pdf";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF başarıyla oluşturuldu.");
    } catch {
      toast.error("PDF oluşturulamadı");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) return toast.error("Giriş yapın");
    setSaving(true);
    try {
      const payload = {
        tarih,
        ...Object.fromEntries(
          Object.entries(fields).flatMap(([k, v]) => [
            [`${k}_yayin_kodlari`, v.kodlar],
            [`${k}_puanlar`, v.puanlar],
          ])
        ),
      };
      const res = await axios.post("http://localhost:5000/api/form5", payload, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Form kaydedildi.");
    } catch {
      toast.error("Form kaydedilemedi.");
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
          className="group flex items-center gap-3 text-slate-500 hover:text-indigo-600 font-bold uppercase tracking-widest text-xs mb-8"
        >
          <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm">
            <ArrowLeftOutlined />
          </div>
          <span>Geri Dön</span>
        </button>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-slate-200 p-8 md:p-12 rounded-[3rem] shadow-xl"
        >
          <div className="text-center mb-12">
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 uppercase">
              KONYA TEKNİK ÜNİVERSİTESİ
              <br />
              <span className="text-indigo-600 text-lg">
                AKADEMİK ATAMA – YÜKSELTME ÖLÇÜTLERİ
              </span>
            </h1>
            <div className="w-20 h-1.5 bg-indigo-600 mx-auto mt-6 rounded-full" />
          </div>

          <div className="bg-slate-800 text-white py-4 px-6 mb-10 text-center font-black rounded-2xl uppercase tracking-widest text-xs">
            PROFESÖRLÜK ASGARİ KOŞULLAR DEĞERLENDİRME FORMU
          </div>

          <div className="overflow-x-auto rounded-3xl border border-slate-200 mb-10 bg-slate-50/30">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-100 text-slate-600 uppercase text-[10px] font-black">
                  <th className="p-5 w-16 text-center">Madde</th>
                  <th className="p-5">Değerlendirme Koşulu</th>
                  <th className="p-5 w-40 text-center">Yayın Kodları</th>
                  <th className="p-5 w-40 text-center">Puan</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y">
                <MaddeRow
                  label="a"
                  field={fields.a}
                  updateField={updateField}
                  text="Adayın, profesörlük başvurusu kapsamında sunulan faaliyetleri arasında, en az bir tanesi doçentlik unvanını aldıktan sonra gerçekleştirilmiş olmak kaydıyla, başlıca eser niteliğinde toplam en az üç (3) adet bilimsel, sanatsal veya mesleki faaliyeti bulunmalıdır."
                />
                <MaddeRow
                  label="b"
                  field={fields.b}
                  updateField={updateField}
                  text="Adayın, doçentlik unvanını aldıktan sonra gerçekleştirdiği faaliyetler arasından, Tablo 1 kapsamında yer alan A-1a, A-1b, A-2a, A-2b, C-1 veya C-2 türündeki faaliyetlerden en az iki (2) adet gerçekleştirmiş olması gerekmektedir."
                />
                <MaddeRow
                  label="c"
                  field={fields.c}
                  updateField={updateField}
                  text="Adayın, doçentlik unvanı sonrasında yaptığı çalışmalardan olmak üzere; Tablo 1’de yer alan K-1, K-2, K-3, L ve M kategorilerindeki faaliyetlerden toplamda en az elli (50) puan elde etmiş olması veya ilgili mevzuat çerçevesinde A kategorisi faaliyetleri ile bu şartı telafi etmiş olması gerekmektedir."
                />
                <MaddeRow
                  label="d"
                  field={fields.d}
                  updateField={updateField}
                  text="Doçentlik unvanı alındıktan sonra Tablo 1’de belirtilen puanlama sistemine 
                  göre (A-G arası) + (K+L+M) faaliyetlerden en az 200 puan olmak üzere, (A
                  G arası) + (K+L+M) faaliyetlerinden toplamda 550 puan almış olmalı"
                />
                <MaddeRow
                  label="e"
                  field={fields.e}
                  updateField={updateField}
                  text="Başvurduğu bilim alanındaki tüm faaliyetlerden olmak üzere toplamda en 
az 650 puan almış olmalı"
                />
                <MaddeRow
                  label="f"
                  field={fields.f}
                  updateField={updateField}
                  text=" Madde 2.6’yı sağlamalı."
                />
                <MaddeRow
                  label="g"
                  field={fields.g}
                  updateField={updateField}
                  text="Madde 2.7’yi sağlamalı"
                />
                <MaddeRow
                  label="h"
                  field={fields.h}
                  updateField={updateField}
                  text="Madde 2.9’u sağlamalı."
                />
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between bg-indigo-50 p-6 rounded-3xl border">
            <div className="relative">
              <CalendarOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" />
              <input
                type="date"
                value={tarih}
                onChange={(e) => setTarih(e.target.value)}
                className="pl-10 pr-5 py-3 rounded-xl border"
              />
            </div>

            <Button htmlType="submit" type="primary" disabled={saving}>
              {saving ? (
                <Spin />
              ) : (
                <>
                  <FilePdfOutlined /> PDF İndir
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Form5;
