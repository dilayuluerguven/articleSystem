import React, { useState, useEffect } from "react";
import axios from "axios";
import { Header } from "../../header/header";
import { toast } from "react-toastify";
import MaddeRow from "../../components/utils/MaddeRow";

const Form4 = () => {
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

    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) return toast.error("Giriş yapın");

    setSaving(true);

    try {
      const apiUrl = formRecord?.id
        ? `http://localhost:5000/api/form4/${formRecord.id}/pdf`
        : "http://localhost:5000/api/form4/pdf";

      const body = formRecord?.id
        ? {}
        : {
            tarih,
            ...Object.fromEntries(
              Object.entries(fields).flatMap(([k, v]) => [
                [`${k}_yayin_kodlari`, v.kodlar],
                [`${k}_puanlar`, v.puanlar],
              ])
            ),
          };

      const res = await axios.post(apiUrl, body, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
      });

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "FORM-4.pdf";
      a.click();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF error:", err);
      toast.error("PDF oluşturulamadı");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) return toast.error("Giriş yapın");

    const payload = {
      tarih,
      ...Object.fromEntries(
        Object.entries(fields).flatMap(([k, v]) => [
          [`${k}_yayin_kodlari`, v.kodlar],
          [`${k}_puanlar`, v.puanlar],
        ])
      ),
    };

    try {
      const res = formRecord?.id
        ? await axios.put(
            `http://localhost:5000/api/form4/${formRecord.id}`,
            payload,
            { headers: { Authorization: `Bearer ${token}` } }
          )
        : await axios.post("http://localhost:5000/api/form4", payload, {
            headers: { Authorization: `Bearer ${token}` },
          });

      setFormRecord(res.data);
      toast.success("Form kaydedildi.");
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Form kaydedilemedi.");
    }
  };

  const autoFill = async () => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) return;

    try {
      const res = await axios.get("http://localhost:5000/api/form4/auto", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data || {};
      setTarih(data.tarih || today);

      setFields((prev) =>
        Object.fromEntries(
          Object.keys(prev).map((k) => [
            k,
            {
              kodlar: data[`${k}_yayin_kodlari`] ?? prev[k].kodlar,
              puanlar: data[`${k}_puanlar`] ?? prev[k].puanlar,
            },
          ])
        )
      );
    } catch (err) {
      console.error("Autofill error:", err);
    }
  };

  useEffect(() => {
    autoFill();
  }, []);

  return (
    <>
      <Header />

      <div className="max-w-5xl mx-auto p-6 text-sm">
        <form onSubmit={handleSubmit}>
          <h1 className="text-center font-semibold">
            KONYA TEKNİK ÜNİVERSİTESİ AKADEMİK <br />
            ATAMA - YÜKSELTME ÖLÇÜTLERİ ve UYGULAMA ESASLARI
          </h1>

          <div className="bg-black text-white py-2 mt-4 text-center font-semibold">
            AKADEMİK ATAMA - YÜKSELTME İÇİN ASGARİ KOŞULLAR
          </div>

          <p className="mt-4">
            İlgili Yasa ve Yönetmelik hükümleriyle öngörülen asgari koşulları
            sağlamanın yanı sıra;
          </p>

          <table className="w-full mt-4 border border-black">
            <thead>
              <tr>
                <th
                  colSpan={2}
                  className="border border-black p-2 font-bold text-center"
                >
                  MİMARLIK, PLANLAMA VE TASARIM TEMEL ALANI / <br />
                  SOSYAL, BEŞERİ VE İDARİ BİLİMLER TEMEL ALANI İÇİN <br />
                  DOÇENTLİK
                </th>

                <th className="border border-black p-2 w-40 text-center font-semibold">
                  Tablo 1’deki <br /> Yayın Kodları
                </th>

                <th className="border border-black p-2 w-40 text-center font-semibold">
                  Her Faaliyetin <br /> Puanı
                </th>
              </tr>

              <tr>
                <th
                  colSpan={4}
                  className="border border-black p-2 text-left font-semibold"
                >
                  <span className="font-bold">11. Madde:</span> Ön değerlendirme
                  – Aşağıda sıralanmış olan maddelerde belirtilen koşulları
                  sağlamadıkları saptanan başvurular değerlendirmeye alınmaz.
                </th>
              </tr>
            </thead>

            <tbody>
              <MaddeRow
                label="a"
                field={fields.a}
                updateField={updateField}
                text="Aday, Doktor unvanı aldıktan sonra kendi lisansüstü çalışmalarından üretilmemiş başlıca eser niteliğinde en az 2 adet faaliyet yapmış olmalı,"
              />

              <MaddeRow
                label="b"
                field={fields.b}
                updateField={updateField}
                text="Doktor unvanı aldıktan sonra, 11a maddesinde puanlanmamış, Tablo 1’e göre A-1a / A-1b / A-1g / A-2a / A-2b / A-3a / C-1 / C-2 türündeki faaliyetlerden (kendi lisansüstü tezlerinden üretilmemiş) en az 1 adet faaliyet yapmış olmalı,"
              />

              <MaddeRow
                label="c"
                field={fields.c}
                updateField={updateField}
                text="Tablo 1’deki puanlama sistemine göre A-1a / A-1b / A-1g / A-2a / A-2b / A-3a / A-4a / D-1 / B / C-1 / C-2 türündeki faaliyetlerden 11a, b maddelerinde puanlanmamış olmak kaydı ile en az 80 puan almış olmalı,"
              />

              <MaddeRow
                label="d"
                field={fields.d}
                updateField={updateField}
                text="B, C, D, E, F kategorisinde en az yarısı doktor unvanı aldıktan sonra olmak üzere toplamda 70 puan almış olmalı."
              />

              <MaddeRow
                label="e"
                field={fields.e}
                updateField={updateField}
                text="Doktor unvanı aldıktan sonra yapılması koşuluyla; Tablo 1’deki K, L ve M faaliyetlerinden en az 30 puan almış olmalı veya bu kategorilerde faaliyet puanı yoksa / eksikse bu faaliyetler için belirlenen puan karşılığı kadar A kategorisindeki faaliyetlerden puan almış olmalı."
              />

              <MaddeRow
                label="f"
                field={fields.f}
                updateField={updateField}
                text="Başvurduğu alanda lisans / lisansüstü ders veriyor olmalı veya danışman olarak yüksek lisans veya doktora tezi yönetmiş / yönetiyor olmalı ve bunu belgelemeli,"
              />

              <MaddeRow
                label="g"
                field={fields.g}
                updateField={updateField}
                text="Tablo 1’de belirtilen puanlama sistemine göre (A-G arası) + (K+L+M) faaliyetleri için 370 puanı sağlamalı,"
              />

              <MaddeRow
                label="h"
                field={fields.h}
                updateField={updateField}
                text="Başvurduğu bilim alanındaki tüm faaliyetlerden olmak üzere toplamda en az 500 puan almış olmalı,"
              />

              <MaddeRow
                label="i"
                field={fields.i}
                updateField={updateField}
                text="Madde 2.6’yı sağlamalı,"
              />

              <MaddeRow
                label="j"
                field={fields.j}
                updateField={updateField}
                text="Madde 2.9’u sağlamalı."
              />
            </tbody>
          </table>

          <p className="mt-6">
            Yukarıda belirtilen Doçentlik Başvuru Şartlarını yerine getirdiğimi
            ve etik ihlali yapmadığımı beyan ederim.
          </p>

          <div className="mt-4">
            <label className="font-semibold">Tarih:</label>
            <input
              type="date"
              className="border ml-2 px-2 py-1"
              value={tarih}
              onChange={(e) => setTarih(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-6 bg-black text-white px-4 py-2 rounded"
          >
            {saving ? "PDF hazırlanıyor..." : "PDF Oluştur"}
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="mt-6 ml-4 bg-blue-600 text-white px-4 py-2 rounded"
          >
            Kaydet
          </button>
        </form>
      </div>
    </>
  );
};

export default Form4;
