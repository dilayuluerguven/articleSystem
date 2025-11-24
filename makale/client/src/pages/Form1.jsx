import React, { useEffect, useState } from "react";
import axios from "axios";
import { Header } from "../header/header";
import { message } from "antd";

const Form1 = () => {
  const [formRecord, setFormRecord] = useState(null);
  const [tarih, setTarih] = useState("");
  const [aItems, setAItems] = useState([]);
  const [loadingA, setLoadingA] = useState(true);
  const [saving, setSaving] = useState(false);

  const [doctorC, setDoctorC] = useState(null);
  const [loadingDoctorC, setLoadingDoctorC] = useState(false);

  useEffect(() => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) return;

    const fetchDoctorC = async () => {
      try {
        setLoadingDoctorC(true);
        const res = await axios.get(
          "http://localhost:5000/api/form1/doktor/c",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setDoctorC(res.data);
      } catch (err) {
        console.error(err);
        message.error("D-1/D-2 ve B-1/E-1 şartı alınırken hata oluştu.");
      } finally {
        setLoadingDoctorC(false);
      }
    };

    fetchDoctorC();
  }, []);

  useEffect(() => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) return;

    const headers = { Authorization: `Bearer ${token}` };

    axios
      .get("http://localhost:5000/api/form1", { headers })
      .then((res) => {
        if (res.data) {
          setFormRecord(res.data);
          setTarih(res.data.tarih ? res.data.tarih.substring(0, 10) : "");
        }
      })
      .catch((err) => console.error(err));

    axios
      .get("http://localhost:5000/api/form1/doktor/a", { headers })
      .then((res) => {
        setAItems(res.data.items || []);
        setLoadingA(false);
      })
      .catch((err) => {
        console.error(err);
        setLoadingA(false);
      });
  }, []);

  const downloadPdf = async (id) => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    const res = await axios.get(`http://localhost:5000/api/form1/${id}/pdf`, {
      responseType: "blob",
      headers: { Authorization: `Bearer ${token}` },
    });

    const blob = new Blob([res.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `FORM-1-${id}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      alert("Lütfen giriş yapın.");
      return;
    }

    if (!tarih) {
      alert("Lütfen tarih seçin.");
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };
    const payload = { tarih };

    try {
      setSaving(true);
      let saved;

      if (formRecord) {
        const res = await axios.put(
          `http://localhost:5000/api/form1/${formRecord.id}`,
          payload,
          { headers }
        );
        saved = res.data;
      } else {
        const res = await axios.post(
          "http://localhost:5000/api/form1",
          payload,
          { headers }
        );
        saved = res.data;
      }

      setFormRecord(saved);
      alert("Form kaydedildi. PDF hazırlanıyor...");
      await downloadPdf(saved.id);
    } catch (err) {
      console.error(err);
      alert("Form kaydedilirken bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Header />
      <div className="max-w-4xl mx-auto p-6 text-sm">
        <form onSubmit={handleSubmit}>
          {/* ÜST BAŞLIK */}
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

          <table className="w-full mt-4 border border-black text-sm">
            <thead>
              <tr className="border border-black bg-gray-100">
                <th className="border border-black py-2" colSpan={4}>
                  DOKTOR ÖĞRETİM ÜYELİĞİ
                </th>
              </tr>
              <tr className="border border-black">
                <th className="border border-black w-10">8.</th>
                <th className="border border-black text-left px-2">
                  Madde: Ön değerlendirme – Aşağıda sıralanmış olan maddelerdeki
                  koşulları sağlamadıkları saptanan başvurular değerlendirmeye
                  alınmaz.
                </th>
                <th className="border border-black w-40 text-center">
                  Tablo 1’deki Yayın Kodları
                </th>
                <th className="border border-black w-40 text-center">
                  Her Faaliyetin Puanı
                </th>
              </tr>
            </thead>

            <tbody>
              {/* a) maddesi */}
              <tr>
                <td className="border border-black p-2 w-10 align-top">a)</td>
                <td className="border border-black p-2 align-top">
                  Aday, <strong>başlıca eser</strong> niteliğinde en az 1 adet
                  faaliyet yapmış olmalı.
                  <div className="mt-2 p-2 border border-gray-300 bg-gray-50 text-xs">
                    <strong>Sizin İçin (Önizleme):</strong>
                    {loadingA ? (
                      <div>Yükleniyor...</div>
                    ) : aItems.length === 0 ? (
                      <div>Başlıca eser bulunamadı.</div>
                    ) : (
                      <ul className="list-disc pl-4 mt-1 space-y-1">
                        {aItems.map((item) => (
                          <li key={item.basvuru_id}>
                            Kod: <strong>{item.yayin_kodu}</strong>{" "}
                            {item.alt_kategori && `(${item.alt_kategori})`}
                            {item.puan != null && (
                              <>
                                {" "}
                                | Puan:{" "}
                                <strong>{Number(item.puan).toFixed(2)}</strong>
                              </>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </td>

                <td className="border border-black p-2 align-top text-xs">
                  {loadingA
                    ? "..."
                    : aItems.length === 0
                    ? "Başlıca eser yok"
                    : aItems.map((item) => {
                        let kodStr = item.yayin_kodu || "";
                        if (item.alt_kategori) {
                          kodStr += ` (${item.alt_kategori})`;
                        }
                        return <div key={item.basvuru_id}>{kodStr}</div>;
                      })}
                </td>
                <td className="border border-black p-2 align-top text-xs text-center">
                  {loadingA
                    ? "..."
                    : aItems.length === 0
                    ? "-"
                    : aItems.map((item) => (
                        <div key={item.basvuru_id}>
                          {item.puan != null
                            ? Number(item.puan).toFixed(2)
                            : "-"}
                        </div>
                      ))}
                </td>
              </tr>

              {/* b) maddesi */}
              <tr>
                <td className="border border-black p-2">b)</td>
                <td className="border border-black p-2">
                  Tablo 1’deki puanlama sistemine göre A-1a / A-1b / A-2a / A-2b
                  türü yayınlardan toplam <strong>60 puan</strong> almış olmalı.
                </td>
                <td className="border border-black"></td>
                <td className="border border-black"></td>
              </tr>

              {/* c) maddesi */}
              <tr>
                <td className="border border-black p-2">c)</td>
                <td className="border border-black p-2 align-top">
                  En az bir adeti <strong>D-1</strong> olmak üzere{" "}
                  <strong>D-1 / D-2</strong> türü iki adet araştırma makalesi ve
                  iki adet <strong>B-1 / E-1</strong> türü bildiri faaliyeti
                  yapmış olmalı.
                  <div className="mt-2 p-2 border border-gray-300 bg-gray-50 text-xs">
                    <strong>Sizin İçin (Önizleme):</strong>
                    {loadingDoctorC ? (
                      <div>Yükleniyor...</div>
                    ) : !doctorC ? (
                      <div>Veri alınamadı.</div>
                    ) : (
                      <div className="space-y-1">
                        <div>
                          D-1/D-2 makale sayısı:{" "}
                          <strong>{doctorC.dTotal}</strong> (D-1:{" "}
                          <strong>{doctorC.d1Count}</strong>)
                        </div>
                        <div>
                          B-1/E-1 bildiri sayısı:{" "}
                          <strong>{doctorC.beTotal}</strong>
                        </div>
                        <div>
                          Durum:{" "}
                          <strong
                            className={
                              doctorC.meetsCondition
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {doctorC.meetsCondition
                              ? "Şart sağlanıyor"
                              : "Şart sağlanmıyor"}
                          </strong>
                        </div>
                      </div>
                    )}
                  </div>
                </td>

                {/* Yayın Kodu Sütunu */}
                <td className="border border-black p-2 align-top text-xs">
                  {loadingDoctorC ? (
                    "..."
                  ) : !doctorC ? (
                    "-"
                  ) : (
                    <>
                      {doctorC.dItems &&
                        doctorC.dItems.map((item) => (
                          <div key={`d-${item.basvuru_id}`}>
                            {item.yayin_kodu}
                          </div>
                        ))}

                      {doctorC.beItems &&
                        doctorC.beItems.map((item) => (
                          <div key={`be-${item.basvuru_id}`}>
                            {item.yayin_kodu}
                          </div>
                        ))}
                    </>
                  )}
                </td>

                {/* Faaliyet Puanı Sütunu */}
                <td className="border border-black p-2 align-top text-xs text-center">
                  {loadingDoctorC ? (
                    "..."
                  ) : !doctorC ? (
                    "-"
                  ) : (
                    <>
                      {/* D-1/D-2 puanları */}
                      {doctorC.dItems &&
                        doctorC.dItems.map((item) => (
                          <div key={`dp-${item.basvuru_id}`}>
                            {item.hamPuan != null
                              ? Number(item.hamPuan).toFixed(2)
                              : "-"}
                          </div>
                        ))}

                      {/* B-1/E-1 puanları */}
                      {doctorC.beItems &&
                        doctorC.beItems.map((item) => (
                          <div key={`bep-${item.basvuru_id}`}>
                            {item.hamPuan != null
                              ? Number(item.hamPuan).toFixed(2)
                              : "-"}
                          </div>
                        ))}
                    </>
                  )}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="mt-6 flex items-center gap-4">
            <label className="font-semibold">Tarih:</label>
            <input
              type="date"
              className="border px-2 py-1 rounded"
              value={tarih}
              onChange={(e) => setTarih(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-6 bg-black text-white px-4 py-2 rounded hover:opacity-80 disabled:opacity-50"
          >
            {saving ? "Kaydediliyor..." : "Kaydet ve PDF Oluştur"}
          </button>
        </form>
      </div>
    </>
  );
};

export default Form1;
