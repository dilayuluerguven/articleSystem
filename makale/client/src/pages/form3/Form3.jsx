import React, { useState, useEffect } from "react";
import axios from "axios";
import { Header } from "../../header/header";
import MaddeRow from "../../components/utils/MaddeRow";

const Form3 = () => {
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
  if (!token) return alert("Giriş yapın");

  setSaving(true);

  try {
    const apiUrl =
      formRecord && formRecord.id
        ? `http://localhost:5000/api/form3/${formRecord.id}/pdf`
        : "http://localhost:5000/api/form3/pdf";

    const body =
      formRecord && formRecord.id
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
    const blobUrl = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = "FORM-3.pdf";
    a.click();

    window.URL.revokeObjectURL(blobUrl);
  } catch (err) {
    console.error("PDF error:", err);
    alert("PDF oluşturulamadı");
  } finally {
    setSaving(false);
  }
};


  const handleSave = async () => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) return alert("Giriş yapın");

    const payload = {
      tarih,
      ...Object.fromEntries(Object.entries(fields).flatMap(([k, v]) => [[`${k}_yayin_kodlari`, v.kodlar], [`${k}_puanlar`, v.puanlar]])),
    };

    try {
      let res;
      if (formRecord && formRecord.id) {
        res = await axios.put(`http://localhost:5000/api/form3/${formRecord.id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        res = await axios.post("http://localhost:5000/api/form3", payload, { headers: { Authorization: `Bearer ${token}` } });
      }

      setFormRecord(res.data);
      alert("Form kaydedildi.");
    } catch (err) {
      console.error("Save error:", err);
      alert("Form kaydedilemedi.");
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
      setTarih(data.tarih || today);

      setFields((prev) => ({
        ...prev,
        a: { kodlar: data.a_yayin_kodlari || prev.a.kodlar, puanlar: data.a_puanlar || prev.a.puanlar },
        b: { kodlar: data.b_yayin_kodlari || prev.b.kodlar, puanlar: data.b_puanlar || prev.b.puanlar },
        c: { kodlar: data.c_yayin_kodlari || prev.c.kodlar, puanlar: data.c_puanlar || prev.c.puanlar },
        d: { kodlar: data.d_yayin_kodlari || prev.d.kodlar, puanlar: data.d_puanlar || prev.d.puanlar },
        e: { kodlar: data.e_yayin_kodlari || prev.e.kodlar, puanlar: data.e_puanlar || prev.e.puanlar },
        f: { kodlar: data.f_yayin_kodlari || prev.f.kodlar, puanlar: data.f_puanlar || prev.f.puanlar },
        g: { kodlar: data.g_yayin_kodlari || prev.g.kodlar, puanlar: data.g_puanlar || prev.g.puanlar },
        h: { kodlar: data.h_yayin_kodlari || prev.h.kodlar, puanlar: data.h_puanlar || prev.h.puanlar },
        i: { kodlar: data.i_yayin_kodlari || prev.i.kodlar, puanlar: data.i_puanlar || prev.i.puanlar },
        j: { kodlar: data.j_yayin_kodlari || prev.j.kodlar, puanlar: data.j_puanlar || prev.j.puanlar },
      }));
    } catch (err) {
      console.error("Otomatik doldurma hatası:", err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) autoFill();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) return;

    const loadSaved = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/form3", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data;
        if (!data) return;
        setFormRecord(data);
        setTarih(data.tarih ? data.tarih.slice(0, 10) : today);
        setFields((prev) => ({
          ...prev,
          a: { kodlar: data.a_yayin_kodlari || prev.a.kodlar, puanlar: data.a_puanlar || prev.a.puanlar },
          b: { kodlar: data.b_yayin_kodlari || prev.b.kodlar, puanlar: data.b_puanlar || prev.b.puanlar },
          c: { kodlar: data.c_yayin_kodlari || prev.c.kodlar, puanlar: data.c_puanlar || prev.c.puanlar },
          d: { kodlar: data.d_yayin_kodlari || prev.d.kodlar, puanlar: data.d_puanlar || prev.d.puanlar },
          e: { kodlar: data.e_yayin_kodlari || prev.e.kodlar, puanlar: data.e_puanlar || prev.e.puanlar },
          f: { kodlar: data.f_yayin_kodlari || prev.f.kodlar, puanlar: data.f_puanlar || prev.f.puanlar },
          g: { kodlar: data.g_yayin_kodlari || prev.g.kodlar, puanlar: data.g_puanlar || prev.g.puanlar },
          h: { kodlar: data.h_yayin_kodlari || prev.h.kodlar, puanlar: data.h_puanlar || prev.h.puanlar },
          i: { kodlar: data.i_yayin_kodlari || prev.i.kodlar, puanlar: data.i_puanlar || prev.i.puanlar },
          j: { kodlar: data.j_yayin_kodlari || prev.j.kodlar, puanlar: data.j_puanlar || prev.j.puanlar },
        }));
      } catch (err) {
        console.error("Saved form load error:", err);
      }
    };

    loadSaved();
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
                  className=" font-bold border border-black p-2 text-center bg-gray-100"
                >
                  DOÇENTLİK
                </th>

                <th
                  rowSpan={2}
                  className="border border-black p-2 text-center font-semibold w-40"
                >
                  Tablo 1’deki
                  <br />
                  Yayın Kodları
                </th>

                <th
                  rowSpan={2}
                  className="border border-black p-2 text-center font-semibold w-40"
                >
                  Her Faaliyetin
                  <br />
                  Puanı
                </th>
              </tr>

              <tr>
                <th
                  colSpan={2}
                  className="border border-black p-2 text-left font-semibold"
                >
                  <span className="font-bold">10. Madde:</span> Ön değerlendirme
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
                text="Doktor unvanı aldıktan sonra, 10a maddesinde puanlanmamış, Tablo 1’e göre A-1a, A-1b, A-2a, C-1 kategorilerinde (kendi lisansüstü tezlerinden üretilmemiş) en az 1 adet faaliyet yapmış olmalı,"
              />

              <MaddeRow
                label="c"
                field={fields.c}
                updateField={updateField}
                text="Tablo 1’deki puanlama sistemine göre A-1a, A-1b, A-2a, A-2b, A-3a, C-1, C-2 türündeki faaliyetlerden 10a, b maddelerinde puanlanmamış olmak kaydı ile en az 80 puan almış olmalı,"
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
                text="Doktor unvanı aldıktan sonra yapılması koşuluyla; Tablo 1’deki K, L ve M faaliyetlerinden en az 30 puan almış olmalı veya bu kategorilerde faaliyet puanı yoksa / eksikse A kategorisinden telafi etmiş olmalı."
              />

              <MaddeRow
                label="f"
                field={fields.f}
                updateField={updateField}
                text="Başvurduğu alanda lisans / lisansüstü ders veriyor olmalı veya danışman olarak yüksek lisans veya doktora tezi yönetmiş / yönetiyor olmalı."
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

          <div className="mt-4">
            <label className="font-semibold">Tarih:</label>
            <input
              type="date"
              className="border ml-2 px-2 py-1"
              value={tarih}
              onChange={(e) => setTarih(e.target.value)}
            />
            <button
              type="button"
              className="ml-4 bg-gray-200 px-3 py-1 rounded text-sm"
              onClick={autoFill}
            >
              Otomatik Doldur
            </button>
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

export default Form3;
