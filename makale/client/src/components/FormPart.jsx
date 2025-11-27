import React, { useEffect, useState } from "react";
import { Checkbox, message, Spin, Button } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import A_part from "./workOptions/A_part";
import B_part from "./workOptions/B_part";
import C_part from "./workOptions/C_part";
import D_part from "./workOptions/D_part";
import E_part from "./workOptions/E_part";
import F_part from "./workOptions/F_part";
import G_part from "./workOptions/G_part";
import H_part from "./workOptions/H_part";
import I_part from "./workOptions/I_part";
import J_part from "./workOptions/J_part";
import K_part from "./workOptions/K_part";
import L_part from "./workOptions/L_part";
import M_part from "./workOptions/M_part";
import N_part from "./workOptions/N_part";
import O_part from "./workOptions/O_part";
import P_part from "./workOptions/P_part";
import R_part from "./workOptions/R_part";
import S_part from "./workOptions/S_part";
import { FileOutlined, FilePdfOutlined, FormOutlined } from "@ant-design/icons";
const componentMap = {
  A: A_part,
  B: B_part,
  C: C_part,
  D: D_part,
  E: E_part,
  F: F_part,
  G: G_part,
  H: H_part,
  I: I_part,
  J: J_part,
  K: K_part,
  L: L_part,
  M: M_part,
  N: N_part,
  O: O_part,
  P: P_part,
  R: R_part,
  S: S_part,
};

const FormPart = () => {
  const [categories, setCategories] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5000/api/categories");
        if (!res.data || !Array.isArray(res.data)) {
          throw new Error("Beklenmeyen veri formatı");
        }

        const formatted = res.data.map((item) => ({
          key: item.kod,
          activity: item.tanim,
          component: componentMap[item.kod] || null,
        }));

        setCategories(formatted);
      } catch (err) {
        console.error("Kategori çekme hatası:", err);
        message.error("Kategoriler alınırken hata oluştu!");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCheckboxChange = (key) => {
    setSelectedItems((prev) =>
      prev.includes(key) ? prev.filter((i) => i !== key) : [...prev, key]
    );
  };

  const handleToggleAll = (e) => {
    setSelectedItems(
      e.target.checked ? categories.map((item) => item.key) : []
    );
  };

  const handleForm7PDF = () => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      message.error("Oturum bulunamadı, lütfen tekrar giriş yapın.");
      return;
    }

    fetch(`http://localhost:5000/api/form7/pdf`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("PDF oluşturulamadı");
        return res.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, "_blank");
      })
      .catch(() => {
        message.error("Form-7 PDF indirilemedi");
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 text-center">
          <p className="text-2xl font-bold text-gray-800 text-center select-none mb-6">
            <FilePdfOutlined /> Otomatik doldurmak istediğiniz Formu seçiniz .
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 justify-center mt-6">
           <Button
              className="bg-green-600 hover:bg-green-700 text-white font-medium h-14 rounded-lg shadow-md"
              onClick={() => navigate("/form7")}
            >
              <FormOutlined /> Form-7 PDF Oluştur
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium h-14 rounded-lg shadow-md"
              onClick={() => navigate("/form1")}
            >
              <FormOutlined /> Form-1 PDF Oluştur
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white font-medium h-14 rounded-lg shadow-md"
              onClick={() => navigate("/form3")}
            >
              <FormOutlined /> Form-3 PDF Oluştur
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white font-medium h-14 rounded-lg shadow-md"
              onClick={() => navigate("/form4")}
            >
              <FormOutlined /> Form-4 PDF Oluştur
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white font-medium h-14 rounded-lg shadow-md"
              onClick={() => navigate("/form5")}
            >
              <FormOutlined /> Form-5 PDF Oluştur
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white font-medium h-14 rounded-lg shadow-md"
              onClick={() => navigate("/form6")}
            >
              <FormOutlined /> Form-6 PDF Oluştur
            </Button>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-400 to-green-500 text-white p-6 rounded-2xl shadow-lg text-center select-none">
          <p className="text-xl font-semibold mb-3">
            Çalışmanızın kod numarasını seçmek için kutucuğu
            işaretleyebilirsiniz
          </p>
          <p className="text-amber-50 text-sm opacity-90">
            İlgili kutucuğun alt seçimlerine eklemek istediğiniz belge türünü
            seçerek ilerleyiniz.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          {loading ? (
            <div className="flex justify-center py-12">
              <Spin size="large" />
            </div>
          ) : (
            <>
              <div className="flex items-center mb-6 p-3 bg-gray-50 rounded-lg">
                <Checkbox
                  onChange={handleToggleAll}
                  checked={selectedItems.length === categories.length}
                  className="mr-3 transform scale-125"
                />
                <span className="text-lg font-bold text-gray-800 px-2">
                  Tümünü seç
                </span>
                <span className="ml-auto text-sm text-gray-500 bg-white px-3 py-1 rounded-full border">
                  {selectedItems.length} / {categories.length} seçili
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {categories.map((item) => (
                  <div
                    key={item.key}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      selectedItems.includes(item.key)
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                    }`}
                  >
                    <Checkbox
                      checked={selectedItems.includes(item.key)}
                      onChange={() => handleCheckboxChange(item.key)}
                      className="w-full"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold text-sm">
                          {item.key}
                        </div>
                        <span className="text-gray-700 text-sm leading-tight flex-1">
                          {item.activity}
                        </span>
                      </div>
                    </Checkbox>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {selectedItems.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
              <h2 className="text-2xl font-bold text-gray-800">
                Seçili Kategoriler
              </h2>
              <span className="ml-auto bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                {selectedItems.length} kategori seçildi
              </span>
            </div>

            <div className="space-y-6">
              {categories.map(
                (item) =>
                  selectedItems.includes(item.key) &&
                  item.component && (
                    <div
                      key={item.key}
                      className="border-2 border-gray-200 rounded-2xl overflow-hidden bg-gradient-to-br from-white to-gray-50 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-3">
                          <span className="w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center text-sm">
                            {item.key}
                          </span>
                          {item.activity}
                        </h3>
                      </div>
                      <div className="p-6">
                        <item.component />
                      </div>
                    </div>
                  )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormPart;
