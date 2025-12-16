import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Header } from "../../header/header";
import { message, Card, Empty, Spin, Button } from "antd";
import { FileTextOutlined, LoadingOutlined } from "@ant-design/icons";
import Form7Table from "./Form7Table";
import { useReactToPrint } from "react-to-print";

const Form7 = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const pdfRef = useRef(null);

  const handlePdfPrint = useReactToPrint({
    contentRef: pdfRef,
    documentTitle: "FORM-7",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token =
          localStorage.getItem("token") ||
          sessionStorage.getItem("token");

        const res = await axios.get(
          "http://localhost:5000/api/form7/data",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setItems(res.data);
      } catch {
        message.error("Veriler alınamadı.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <Header />

      <div ref={pdfRef} className="max-w-[1200px] mx-auto p-6">
        <div className="text-center mb-6 text-sm font-calibri">
          <h1 className="font-medium leading-6">
            KONYA TEKNİK ÜNİVERSİTESİ AKADEMİK <br />
            ATAMA - YÜKSELTME ÖLÇÜTLERİ ve UYGULAMA ESASLARI
          </h1>

          <div className="bg-black text-white py-2 mt-3 font-semibold">
            Tablo 1. AKADEMİK ATAMA - YÜKSELTME ÖLÇÜTLERİ PUAN TABLOSU
          </div>
        </div>

        <Card className="shadow">
          {loading ? (
            <div className="flex justify-center py-10">
              <Spin indicator={<LoadingOutlined spin />} />
            </div>
          ) : items.length === 0 ? (
            <Empty description="Hiç başvuru yok." />
          ) : (
            <Form7Table data={items} />
          )}
        </Card>
      </div>

      <div className="max-w-[1200px] mx-auto p-6">
        <Button
          type="primary"
          size="large"
          className="bg-gray-900"
          onClick={handlePdfPrint}
          block
        >
          PDF Olarak İndir
        </Button>
      </div>
    </>
  );
};

export default Form7;
