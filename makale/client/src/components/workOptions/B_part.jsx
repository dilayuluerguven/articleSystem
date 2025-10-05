import { useState, useEffect, useRef } from "react";
import WorkModal from "../utils/WorkModal";

export default function B_part() {
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedWork, setSelectedWork] = useState(null);
  const [count, setCount] = useState(1);
  const [fileName, setFileName] = useState("");
  const [expanded, setExpanded] = useState({});
  const formRef = useRef(null);

  // ✅ B kategorisini backend'den çek
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/categories");
        const data = await res.json();

        // Sadece B kategorisini al
        const bCategory = data.find((cat) => cat.kod === "B");
        setCategories(bCategory ? [bCategory] : []);
      } catch (err) {
        console.error("Kategori çekme hatası:", err);
      }
    };
    fetchCategories();
  }, []);

  // Çalışma ekleme modalını aç
  const addWork = (category) => {
    setSelectedCategory(category);
    setSelectedWork(null);
    setIsModalOpen(true);
    setCount(1);
    setFileName("");
  };

  // Çalışma düzenleme modalını aç
  const editWork = (work, category) => {
    setSelectedCategory(category);
    setSelectedWork(work);
    setIsModalOpen(true);
    setCount(work.count);
    setFileName(work.fileName);
  };

  // Modal onay
  const handleOk = async () => {
    try {
      await formRef.current.validateFields();
      setIsModalOpen(false);

      setCategories((prev) => {
        const newCategories = JSON.parse(JSON.stringify(prev));

        const addOrUpdate = (cats) => {
          for (let cat of cats) {
            if (cat.id === selectedCategory.id) {
              if (!cat.works) cat.works = [];

              if (selectedWork) {
                selectedWork.description = fileName;
                selectedWork.count = count;
                selectedWork.fileName = fileName;
              } else {
                const nextNumber = cat.works.length + 1;
                const newWorkCode = `${cat.kod}:${nextNumber}`;
                cat.works.push({
                  code: newWorkCode,
                  description: `Çalışma-${nextNumber}`,
                  count: count,
                  fileName: fileName,
                });
              }
              return true;
            }
            if (cat.subcategories && addOrUpdate(cat.subcategories)) return true;
          }
          return false;
        };

        addOrUpdate(newCategories);
        return newCategories;
      });
    } catch (err) {
      console.log("Validation failed:", err);
    }
  };

  const handleCancel = () => {
    formRef.current.resetFields();
    setIsModalOpen(false);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) setFileName(selectedFile.name);
  };

  // Alt kategorileri aç/kapa
  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // ✅ Recursive hiyerarşik kategori render
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
            {/* Bu kategoriye ait çalışmalar */}
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

            {/* Alt kategorileri recursive render et */}
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
        count={count}
        handleFileChange={handleFileChange}
      />
    </div>
  );
}
