import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Header } from "../../header/header";
import { message } from "antd";
import Form7Table from "./Form7Table";
import { useReactToPrint } from "react-to-print";

const Form7 = () => {
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [tarih, setTarih] = useState(new Date().toLocaleDateString("sv-SE"));
  const [saving, setSaving] = useState(false);

  const pdfRef = useRef(null);

  const handlePdfPrint = useReactToPrint({
    contentRef: pdfRef,
    documentTitle: "FORM-7",
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");

        const res = await axios.get("http://localhost:5000/api/form7/data", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setItems(res.data);
        setLoadingItems(false);
      } catch (err) {
        setLoadingItems(false);
      }
    }
    fetchData();
  }, []);

  return (
    <>
      <Header />

     

      <div ref={pdfRef} className="max-w-[1200px] mx-auto p-6 text-sm">
        <div className="text-center mb-8">
          <h1 className="text-center font-semibold">
            KONYA TEKNİK ÜNİVERSİTESİ AKADEMİK <br />
            ATAMA - YÜKSELTME ÖLÇÜTLERİ ve UYGULAMA ESASLARI
          </h1>

          <div className="bg-black text-white py-2 mt-4 text-center font-semibold">
            Tablo 1. AKADEMİK ATAMA - YÜKSELTME ÖLÇÜTLERİ PUAN TABLOSU
          </div>
        </div>

        <div className="bg-white shadow p-4 mb-8">
          <Form7Table data={items} />
        </div>
      </div>
       <div className="max-w-[1200px] mx-auto p-6 text-sm">
        <button
          onClick={handlePdfPrint}
            className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-8 rounded-lg"
        >
          PDF Olarak İndir
        </button>
      </div>

      <div className="max-w-[1200px] mx-auto p-6 text-sm">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="font-semibold text-gray-800 text-lg mb-4 flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Özet Önizleme
          </h3>

          {loadingItems ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
              Hiç yayın eklemediniz.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {items
                .flatMap((g) => g.items)
                .map((item, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Kod:</span>
                      <span className="font-semibold text-gray-800">
                        {item.aktivite_kod}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm text-gray-600">Puan:</span>
                      <span className="font-bold text-blue-600">
                        {Number(item.toplamPuan ?? 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        <form className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <label className="font-semibold text-gray-700 text-sm whitespace-nowrap">
              Tarih:
            </label>
            <input
              type="date"
              className="border border-gray-300 rounded-lg px-4 py-2"
              value={tarih}
              onChange={(e) => setTarih(e.target.value)}
            />
          </div>

          <button
            type="button"
            onClick={handlePdfPrint}
            className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-8 rounded-lg"
          >
            Kaydet ve PDF Oluştur
          </button>
        </form>
      </div>
    </>
  );
};

export default Form7;
