import { useState, useEffect, useRef } from "react";
import WorkModal from "../utils/WorkModal";

export default function B_part() {
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedWork, setSelectedWork] = useState(null);
  const [fileName, setFileName] = useState("");
  const [expanded, setExpanded] = useState({});
  const formRef = useRef(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/categories");
        const data = await res.json();
        const bCategory = data.find((cat) => cat.kod === "B");
        setCategories(bCategory ? [bCategory] : []);
      } catch (err) {
        console.error("Kategori çekme hatası:", err);
      }
    };
    fetchCategories();
  }, []);

  const addWork = (category) => {
    setSelectedCategory(category);
    setSelectedWork(null);
    setIsModalOpen(true);
  };

  const editWork = (work, category) => {
    setSelectedCategory(category);
    setSelectedWork(work);
    setIsModalOpen(true);
  };

  // Aktivite yolunu oluştur
  const getActivityPath = (category, subSelection, childSelection) => {
    const ust_aktivite = category.kod;
    let alt_aktivite = "";
    let aktivite = "";

    if (subSelection && category.subcategories) {
      const subCat = category.subcategories.find((sc) => sc.kod === subSelection);
      if (subCat) alt_aktivite = `${category.kod}-${subCat.kod}`;
    }

    if (childSelection) {
      aktivite = alt_aktivite ? `${alt_aktivite}.${childSelection}` : childSelection;
    }

    return { ust_aktivite, alt_aktivite, aktivite };
  };

  const handleOk = async ({ mainSelection, subSelection, childSelection, file, yazarSayisi }) => {
    if (!file) return alert("Lütfen dosya seçin!");

    const { ust_aktivite, alt_aktivite, aktivite } = getActivityPath(
      selectedCategory,
      subSelection,
      childSelection
    );

    const formData = new FormData();
    formData.append("ust_aktivite", ust_aktivite);
    formData.append("alt_aktivite", alt_aktivite);
    formData.append("aktivite", aktivite);
    formData.append("yazar_sayisi", yazarSayisi); 
    formData.append("main_selection", mainSelection);
    formData.append("sub_selection", subSelection || "");
    formData.append("child_selection", childSelection || "");
    formData.append("file", file);

    const token = sessionStorage.getItem("token") || localStorage.getItem("token");

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
      console.error("Başvuru kaydedilemedi:", err);
      alert("Başvuru kaydedilemedi: " + err.message);
    }
  };

  const handleCancel = () => {
    formRef.current.resetFields();
    setIsModalOpen(false);
  };

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderCategories = (cats) => {
    return cats.map((cat) => (
      <div key={cat.id} className="mb-2 ml-2">
        <div className="flex items-center justify-between font-semibold">
          <div className="flex items-center gap-2">
            {cat.subcategories && cat.subcategories.length > 0 && (
              <button
                className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center"
                onClick={() => toggleExpand(cat.id)}
              >
                {expanded[cat.id] ? "-" : "+"}
              </button>
            )}
            <span>{cat.kod} {cat.tanim}</span>
          </div>

          <button
            className="bg-gray-200 px-2 py-1 rounded text-sm hover:bg-gray-300"
            onClick={() => addWork(cat)}
          >
            + Çalışma Ekle
          </button>
        </div>

        {expanded[cat.id] && (
          <div className="ml-6 mt-2">
            {cat.works && cat.works.map((work) => (
              <div
                key={work.code}
                className="ml-4 mt-1 flex justify-between items-center text-sm"
              >
                <span>{work.description}</span>
                <button
                  className="text-green-600 hover:underline"
                  onClick={() => editWork(work, cat)}
                >
                  Düzenle
                </button>
              </div>
            ))}

            {cat.subcategories && renderCategories(cat.subcategories)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded-lg shadow-lg m-5">
      <h1 className="text-xl font-semibold mb-6 text-center select-none">
        B. Uluslararası Bildiriler
      </h1>

      {renderCategories(categories)}

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
