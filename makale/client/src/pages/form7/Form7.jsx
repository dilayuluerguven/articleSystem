import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Header } from "../../header/header";
import { message, Card, Empty, Spin, Button } from "antd";
import { FileTextOutlined, LoadingOutlined } from "@ant-design/icons";
import Form7Table from "./Form7Table";
import { useReactToPrint } from "react-to-print";

const Form7 = () => {
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [tarih, setTarih] = useState(new Date().toLocaleDateString("sv-SE"));
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
      } catch {
        setLoadingItems(false);
        message.error("Veriler alınamadı.");
      }
    }
    fetchData();
  }, []);

  return (
    <>
      <Header />

      <div ref={pdfRef} className="max-w-[1200px] mx-auto p-6 text-sm">
        <div className="text-center mb-8">
          <h1 className="font-semibold leading-6">
            KONYA TEKNİK ÜNİVERSİTESİ AKADEMİK <br />
            ATAMA - YÜKSELTME ÖLÇÜTLERİ ve UYGULAMA ESASLARI
          </h1>

          <div className="bg-black text-white py-2 mt-4 font-semibold">
            Tablo 1. AKADEMİK ATAMA - YÜKSELTME ÖLÇÜTLERİ PUAN TABLOSU
          </div>
        </div>

        <Card className="mb-8 shadow">
          <Form7Table data={items} />
        </Card>
      </div>

      <div className="max-w-[1200px] mx-auto p-6">
        <Button
          type="primary"
          size="large"
          className="bg-gray-900 hover:bg-gray-800"
          onClick={handlePdfPrint}
          block
        >
          PDF Olarak İndir
        </Button>
      </div>

      <div className="max-w-[1200px] mx-auto p-6">
        <Card
          title={
            <span className="flex items-center text-lg font-semibold">
              <FileTextOutlined className="mr-2 text-gray-600" /> Özet Önizleme
            </span>
          }
          className="shadow-sm"
        >
          {loadingItems ? (
            <div className="flex justify-center py-10">
              <Spin indicator={<LoadingOutlined style={{ fontSize: 32 }} spin />} />
            </div>
          ) : items.length === 0 ? (
            <Empty description="Hiç yayın eklemediniz." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.flatMap((g) => g.items).map((item, index) => (
                <Card key={index} size="small">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Kod:</span>
                    <span className="font-semibold">{item.aktivite_kod}</span>
                  </div>
                  <div className="flex justify-between mt-1 text-sm">
                    <span className="text-gray-600">Puan:</span>
                    <span className="font-bold text-blue-600">
                      {Number(item.toplamPuan ?? 0).toFixed(2)}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>

        <Card className="mt-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <label className="font-semibold text-gray-700 text-sm">Tarih:</label>
            <input
              type="date"
              className="border px-4 py-2 rounded-lg"
              value={tarih}
              onChange={(e) => setTarih(e.target.value)}
            />
          </div>

          <Button
            type="primary"
            size="large"
            className="bg-gray-900 hover:bg-gray-800"
            onClick={handlePdfPrint}
            block
          >
            Kaydet ve PDF Oluştur
          </Button>
        </Card>
      </div>
    </>
  );
};

export default Form7;
