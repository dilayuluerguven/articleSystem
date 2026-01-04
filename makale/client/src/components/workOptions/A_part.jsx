import { useState, useEffect, useRef } from "react";
import WorkModal from "../utils/WorkModal";
import { toast } from "react-toastify";
import {
  LoadingOutlined,
  CaretDownOutlined,
  CaretRightOutlined,
} from "@ant-design/icons";

export default function A_part() {
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
        const aCategory = data.find((cat) => cat.kod === "A");
        setCategories(aCategory ? [aCategory] : []);
      } catch (err) {
        console.error("Kategori çekme hatası:", err);
      }
    };
    fetchCategories();
  }, []);

  const isAdmin = (sessionStorage.getItem("is_admin") || localStorage.getItem("is_admin")) === "1";

  const getActivityPath = (categories, targetId) => {
    const Aroot = categories.find((c) => c.kod === "A");
    if (!Aroot) return {};

    const find = (node, id) => {
      if (node.id === id) return node;
      for (const s of node.subcategories || []) {
        const f = find(s, id);
        if (f) return f;
      }
      return null;
    };

    const node = find(Aroot, targetId);
    if (!node) return {};

    if (/^A-\d+$/.test(node.kod)) {
      return {
        ust_aktivite_id: Aroot.id,
        alt_aktivite_id: node.id,
        aktivite_id: null,
      };
    }

    if (/^A-\d+[a-z]$/i.test(node.kod)) {
      const parentKod = node.kod.match(/^A-\d+/)[0];
      const parent = Aroot.subcategories.find((x) => x.kod === parentKod);
      return {
        ust_aktivite_id: Aroot.id,
        alt_aktivite_id: parent?.id || null,
        aktivite_id: node.id,
      };
    }

    if (/^A-\d+\.\d+$/.test(node.kod)) {
      const parentKod = node.kod.split(".")[0];
      const parent = Aroot.subcategories.find((x) => x.kod === parentKod);
      return {
        ust_aktivite_id: Aroot.id,
        alt_aktivite_id: parent?.id || null,
        aktivite_id: node.id,
      };
    }

    return {};
  };

  const addWork = (category) => {
    setSelectedCategory({ ...category, selectedId: category.id });
    setSelectedWork(null);
    setIsModalOpen(true);
  };

  const editWork = (work, category) => {
    setSelectedCategory(category);
    setSelectedWork(work);
    setIsModalOpen(true);
  };

const handleOk = async ({
  file,
  yazarSayisi,
  workDescription,
  authorPosition,
  mainSelection,
  subSelection,
  childSelection,
}) => {

  if (!file) return toast.error("Lütfen dosya seçin!");

  const cat = selectedCategory; // Tıklanan kategori (A-1, A-1.1, A-1a)

  let ust_id = null;
  let alt_id = null;
  let akt_id = null;

  // --- KATEGORİ ID HESAPLAMA ---
  if (/^A$/.test(cat.kod)) {
    ust_id = cat.id;
  }
  else if (/^A-\d+$/.test(cat.kod)) {
    ust_id = categories[0].id;
    alt_id = cat.id;
  }
  else {
    const parentKod = cat.kod.match(/^A-\d+/)[0];
    const parent = categories[0].subcategories.find(x => x.kod === parentKod);

    ust_id = categories[0].id;
    alt_id = parent?.id || null;
    akt_id = cat.id;
  }

  const formData = new FormData();

  formData.append("ust_aktivite_id", ust_id);
  formData.append("alt_aktivite_id", alt_id);
  formData.append("aktivite_id", akt_id);

  formData.append("main_selection", mainSelection ?? null);
  formData.append("sub_selection", subSelection ?? null);
  formData.append("child_selection", childSelection ?? null);

  formData.append("yazar_sayisi", yazarSayisi);
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

    toast.success(data.message);
    setIsModalOpen(false);
  } catch (err) {
    toast.error("Başvuru kaydedilemedi: " + err.message);
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
    const disallowedCodes = ["A", "A-1", "A-2", "A-3", "A-4"];

    return cats.map((cat) => (
      <div key={cat.id} className="mb-4 ml-2">
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-3">
            {cat.subcategories?.length > 0 && (
              <button
                onClick={() => toggleExpand(cat.id)}
                className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center"
              >
                {expanded[cat.id] ? (
                  <CaretDownOutlined />
                ) : (
                  <CaretRightOutlined />
                )}
              </button>
            )}
            <div>
              <span className="font-bold">
                {cat.kod} - {cat.tanim}
              </span>
            </div>
          </div>

          {!disallowedCodes.includes(cat.kod) && !isAdmin && (
            <button onClick={() => addWork(cat)}>Çalışma Ekle</button>
          )}
        </div>

        {expanded[cat.id] && (
          <div className="ml-8 mt-3 space-y-2 border-l-2 border-blue-200 pl-4">
            {cat.subcategories?.length > 0 &&
              renderCategories(cat.subcategories)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {isAdmin && (
          <div className="p-4 mb-4 bg-yellow-50 text-yellow-800 rounded-lg border border-yellow-200">
            Admin kullanıcılar başvuru ekleyemez.
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-8 text-center">
            <p className="text-blue-100 text-lg">
              Kategori yapısını inceleyin ve çalışmalarınızı ekleyin.
              Profilinizden görüntüleyin.
            </p>
          </div>

          <div className="p-6 sm:p-8">
            {categories.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LoadingOutlined style={{ fontSize: "2rem" }} />
                </div>
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
