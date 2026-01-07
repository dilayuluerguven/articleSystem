import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Header } from "../../header/header";
import { Card, Empty, Spin, Button } from "antd";
import { toast } from "react-toastify";
import { FileTextOutlined, LoadingOutlined } from "@ant-design/icons";
import Form7Table from "./Form7Table";
import { useReactToPrint } from "react-to-print";
import { useNavigate } from "react-router-dom";
import { ArrowLeftOutlined } from "@ant-design/icons";

const Form7 = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const pdfRef = useRef(null);
  const navigate = useNavigate();

  const handlePdfPrint = useReactToPrint({
    contentRef: pdfRef,
    documentTitle: "FORM-7",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");

        const res = await axios.get("http://localhost:5000/api/form7/data", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setItems(res.data);
      } catch {
        toast.error("Veriler alınamadı.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <Header />
      <div className="max-w-[1200px] mx-auto px-6 pt-4">
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-3 text-slate-500 hover:text-indigo-600 transition-all font-bold uppercase tracking-widest text-xs mb-4"
        >
          <div className="p-2.5 rounded-xl bg-white border border-slate-200 group-hover:border-indigo-500/50 group-hover:bg-indigo-50 transition-all shadow-sm">
            <ArrowLeftOutlined className="text-base" />
          </div>
          <span>Geri Dön</span>
        </button>
      </div>
      <div ref={pdfRef} className="max-w-[1200px] mx-auto p-6 print-root">
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
