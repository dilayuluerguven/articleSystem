import React, { useEffect, useState } from "react";
import axios from "axios";
import { Header } from "../../header/header";
import { message } from "antd";
import Form7Table from "./Form7Table";

const Form7 = () => {
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [tarih, setTarih] = useState(new Date().toLocaleDateString("sv-SE"));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");

        const res = await axios.get("http://localhost:5000/api/form7/data", {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("FORM7 DATA:", res.data);

        setItems(res.data);

        setLoadingItems(false);
      } catch (err) {
        setLoadingItems(false);
      }
    }
    fetchData();
  }, []);

  const downloadPdf = async () => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      const res = await axios.get(`http://localhost:5000/api/form7/pdf`, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
      });

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `FORM-7.pdf`;
      link.click();
    } catch (err) {
      message.error("PDF oluşturulamadı");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await downloadPdf();
  };

  return (
    <>
      <Header />

      <div className="max-w-[1200px] mx-auto p-6 text-sm">
        <h1 className="text-center font-semibold text-lg mb-6">
          FORM - 7 ÖNİZLEME
        </h1>

        <div className="p-4 border bg-gray-50 mb-6">
          <strong>Sizin İçin (Önizleme):</strong>

          {loadingItems ? (
            <div>Yükleniyor...</div>
          ) : items.length === 0 ? (
            <div>Hiç yayın eklemediniz.</div>
          ) : (
            <ul className="list-disc pl-4 mt-2 space-y-1">
              {items
                .flatMap((g) => g.items)
                .map((item, index) => (
                  <li key={index}>
                    Kod: <strong>{item.aktivite_kod}</strong> | Puan:{" "}
                    <strong>{Number(item.toplamPuan ?? 0).toFixed(2)}</strong>
                  </li>
                ))}
            </ul>
          )}
        </div>

        <div className="bg-white shadow p-4">
          <Form7Table data={items} />
        </div>

        <form onSubmit={handleSubmit} className="mt-8">
          <div className="flex items-center gap-4">
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
            className="mt-6 bg-black text-white px-4 py-2 rounded hover:opacity-80"
            disabled={saving}
          >
            Kaydet ve PDF Oluştur
          </button>
        </form>
      </div>
    </>
  );
};

export default Form7;
