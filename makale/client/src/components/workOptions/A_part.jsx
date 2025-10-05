import { useState, useEffect, useRef } from "react";
import { AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
import WorkModal from "../utils/WorkModal";

export default function A_part() {
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedWork, setSelectedWork] = useState(null);
  const [count, setCount] = useState(1);
  const [fileName, setFileName] = useState("");
  const [expanded, setExpanded] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const formRef = useRef(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/categories");
        const data = await res.json();

        // sadece A kategorisi
        const aCategory = data.find((cat) => cat.kod === "A");
        setCategories(aCategory ? [aCategory] : []);
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
    setCount(1);
    setFileName("");
    setSelectedFile(null);
  };

  const editWork = (work, category) => {
    setSelectedCategory(category);
    setSelectedWork(work);
    setIsModalOpen(true);
    setCount(work.count);
    setFileName(work.fileName);
    setSelectedFile(null);
  };

  const deleteWork = (work, category) => {
    if (!window.confirm("Bu çalışmayı silmek istediğine emin misin?")) return;

    setCategories((prev) => {
      const newCategories = JSON.parse(JSON.stringify(prev));

      const removeWork = (cats) => {
        for (let cat of cats) {
          if (cat.id === category.id) {
            cat.works = cat.works.filter((w) => w.code !== work.code);
            return true;
          }
          if (cat.subcategories && removeWork(cat.subcategories)) return true;
        }
        return false;
      };

      removeWork(newCategories);
      return newCategories;
    });
  };

  const handleOk = async (selections) => {
    try {
      const values = await formRef.current.validateFields();
      setIsModalOpen(false);

      // Ana kategori kodunu bul
      const ustKod = selectedCategory.parentKod
        ? categories[0].kod // A kategorisi
        : selectedCategory.kod;
      const altKod = selectedCategory.kod;

      const newWork = {
        code: `${altKod}:${Date.now()}`,
        description: values.workDescription,
        count: values.authorCount,
        fileName: fileName,
        ...selections,
      };

      // kategori state güncelle
      setCategories((prev) => {
        const newCategories = JSON.parse(JSON.stringify(prev));
        const addWorkToCat = (cats) => {
          for (let cat of cats) {
            if (cat.id === selectedCategory.id) {
              if (!cat.works) cat.works = [];
              cat.works.push(newWork);
              return true;
            }
            if (cat.subcategories && addWorkToCat(cat.subcategories)) return true;
          }
          return false;
        };
        addWorkToCat(newCategories);
        return newCategories;
      });

      // FormData oluştur
      const formData = new FormData();

      const loggedUserId = localStorage.getItem("userId") || 1;
      formData.append("user_id", loggedUserId);

      formData.append("ust_aktivite", ustKod);
      formData.append("alt_aktivite", altKod);
      formData.append("aktivite", selectedCategory.description);
      formData.append("yazar_sayisi", values.authorCount);
      formData.append("main_selection", selections.mainSelection || "");
      formData.append("sub_selection", selections.subSelection || "");
      formData.append("child_selection", selections.childSelection || "");

      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      await fetch("http://localhost:5000/api/basvuru", {
        method: "POST",
        body: formData,
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
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
    }
  };

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderCategories = (cats, level = 0) => {
    const disallowedCodes = ["A", "A-1","A-2","A-3","A-4"]; 

    return cats.map((cat) => (
      <div key={cat.id} className={`mb-4 ml-${level * 4}`}>
        <div className="flex items-center justify-between font-semibold">
          <div className="flex items-center gap-2">
            {cat.subcategories && cat.subcategories.length > 0 && (
              <button
                className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition"
                onClick={() => toggleExpand(cat.id)}
              >
                {expanded[cat.id] ? "-" : "+"}
              </button>
            )}
            {/* <span className="select-none">{cat.kod} {cat.tanim}</span> */}
            <span className="select-none">{cat.kod} </span>
          </div>

          {!disallowedCodes.includes(cat.kod) && (
            <button
              className="bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 transition text-xs"
              onClick={() => addWork(cat)}
            >
              + Çalışma Ekle
            </button>
          )}
        </div>

        {expanded[cat.id] && (
          <div className="mt-2 ml-6">
            {cat.tanim && (
              <p className="text-gray-500 italic mb-2">{cat.tanim}</p>
            )}

            {cat.works &&
              cat.works.map((work) => (
                <div
                  key={work.code}
                  className="flex items-center justify-between bg-gray-50 p-2 rounded mb-2 shadow-sm"
                >
                  <span className="text-sm text-blue-600 underline cursor-pointer">
                    {work.code}: {work.fileName || "Dosya Yok"}
                  </span>

                  <div className="flex gap-2">
                    <button
                      onClick={() => editWork(work, cat)}
                      className="text-green-600 hover:text-green-800"
                    >
                      <AiOutlineEdit />
                    </button>
                    <button
                      onClick={() => deleteWork(work, cat)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <AiOutlineDelete />
                    </button>
                  </div>
                </div>
              ))}

            {cat.subcategories && renderCategories(cat.subcategories, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow-lg mt-6">
      <h1 className="text-2xl font-bold mb-6 text-center select-none">
        A. Uluslararası Çalışmalar
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
