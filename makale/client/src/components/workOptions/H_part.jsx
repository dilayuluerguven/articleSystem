import { useState, useEffect, useRef } from "react";
import WorkModal from "../utils/WorkModal";
import {
  PlusOutlined,
  EditOutlined,
  LoadingOutlined,
  CaretDownOutlined,
  CaretRightOutlined,
} from "@ant-design/icons";

export default function H_part() {
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedWork, setSelectedWork] = useState(null);
  const [expanded, setExpanded] = useState({});
  const formRef = useRef(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/categories");
        const data = await res.json();
        const hCategory = data.find((cat) => cat.kod === "H");
        setCategories(hCategory ? [hCategory] : []);
      } catch (err) {
        console.error("Kategori çekme hatası:", err);
      }
    };
    fetchCategories();
  }, []);

  const getActivityPath = (allCategories, targetId) => {
    const findPath = (node, targetId, path = []) => {
      if (node.id === targetId) return [...path, node];
      for (let sub of node.subcategories || []) {
        const found = findPath(sub, targetId, [...path, node]);
        if (found.length) return found;
      }
      return [];
    };

    for (let root of allCategories) {
      const path = findPath(root, targetId);
      if (path.length) {
        const ust_aktivite_id = path[0]?.id ?? null;
        const alt_aktivite_id = path.length >= 2 ? path[1].id : null;
        const aktivite_id = path.length >= 3 ? path[2].id : null;
        return { ust_aktivite_id, alt_aktivite_id, aktivite_id };
      }
    }

    return { ust_aktivite_id: null, alt_aktivite_id: null, aktivite_id: null };
  };

  const addWork = (category, categoryId) => {
    setSelectedCategory({ ...category, selectedId: categoryId });
    setSelectedWork(null);
    setIsModalOpen(true);
  };

  const editWork = (work, category) => {
    setSelectedCategory(category);
    setSelectedWork(work);
    setIsModalOpen(true);
  };

  const handleOk = async ({
    mainSelection,
    subSelection,
    childSelection,
    file,
    yazarSayisi,
    workDescription,
    authorPosition,
  }) => {
    if (!file) return alert("Lütfen dosya seçin!");

    const { ust_aktivite_id, alt_aktivite_id, aktivite_id } = getActivityPath(
      categories,
      selectedCategory.selectedId
    );

    const formData = new FormData();
    formData.append("ust_aktivite_id", ust_aktivite_id);
    formData.append("alt_aktivite_id", alt_aktivite_id);
    formData.append("aktivite_id", aktivite_id);
    formData.append("yazar_sayisi", yazarSayisi);
    formData.append("main_selection", mainSelection);
    formData.append("sub_selection", subSelection || "");
    formData.append("child_selection", childSelection || "");
    formData.append("file", file);
    formData.append("workDescription", workDescription);
    formData.append("authorPosition", authorPosition);

    const token =
      sessionStorage.getItem("token") || localStorage.getItem("token");

    try {
      const res = await fetch("http://localhost:5000/api/basvuru", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "DB Hatası");

      alert(data.message);
      setIsModalOpen(false);
    } catch (err) {
      alert("Başvuru kaydedilemedi: " + err.message);
    }
  };

  const handleCancel = () => {
    formRef.current?.resetFields();
    setIsModalOpen(false);
  };

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderCategories = (cats) => {
    const disallowedCodes = ["H"];
    return cats.map((cat) => (
      <div key={cat.id} className="mb-4 ml-2">
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-3">
            {cat.subcategories && cat.subcategories.length > 0 && (
              <button
                className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                onClick={() => toggleExpand(cat.id)}
              >
                {expanded[cat.id] ? (
                  <CaretDownOutlined />
                ) : (
                  <CaretRightOutlined />
                )}
              </button>
            )}
            <div className="flex flex-col">
              <span className="font-bold text-gray-800 text-medium">
                {cat.kod} - {cat.tanim}
              </span>
              {cat.subcategories && (
                <span className="text-xs text-gray-500 mt-1">
                  {cat.subcategories.length} alt kategori
                </span>
              )}
            </div>
          </div>

          {!disallowedCodes.includes(cat.kod) && (
            <button
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
              onClick={() => addWork(cat, cat.id)}
            >
              <PlusOutlined />
              Çalışma Ekle
            </button>
          )}
        </div>

        {expanded[cat.id] && (
          <div className="ml-8 mt-3 space-y-2 border-l-2 border-blue-200 pl-4">
            {cat.works &&
              cat.works.map((work) => (
                <div
                  key={work.code}
                  className="ml-2 mt-2 flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700 font-normal">
                      {work.description}
                    </span>
                  </div>
                  <button
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-3 py-1 rounded-lg text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-1"
                    onClick={() => editWork(work, cat)}
                  >
                    <EditOutlined />
                    Düzenle
                  </button>
                </div>
              ))}

            {cat.subcategories && (
              <div className="mt-4 space-y-3">{renderCategories(cat.subcategories)}</div>
            )}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-8 text-center">
            <p className="text-blue-100 text-lg">
              Kategorileri genişletin, "Çalışma Ekle" butonu ile yeni çalışmalar
              ekleyin, ve profilinizden görüntüleyin.
            </p>
          </div>

          <div className="p-6 sm:p-8">
            {categories.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LoadingOutlined style={{ fontSize: "2rem", color: "#9ca3af" }} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Kategoriler yükleniyor...
                </h3>
                <p className="text-gray-500">Lütfen bekleyin</p>
              </div>
            ) : (
              <div className="space-y-4">{renderCategories(categories)}</div>
            )}
          </div>
        </div>
      </div>

      <WorkModal
        isModalOpen={isModalOpen}
        handleOk={handleOk}
        handleCancel={handleCancel}
        formRef={formRef}
        selectedCategory={selectedCategory}
      />
    </div>
  );
}
