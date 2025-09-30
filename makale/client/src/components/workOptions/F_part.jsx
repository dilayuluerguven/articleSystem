
import { useState, useRef } from "react";
import WorkModal from "../utils/WorkModal";
import CategoryItem from "../utils/CategoryItem";


const initialCategories = [
  {
    code: "F",
    description: "F. Ulusal kitap",
    subcategories: [
      {
        code: "F-1",
        description: "Kitap yazarlığı",
        subcategories: [],
      },
      {
        code: "F-2",
        description: "Kitap içinde bölüm yazarlığı",
        subcategories: [
          {
            code: "f-2.1",
            description:
              "Kongre ve sempozyum bildirilerinden seçilmiş kitap bölüm yazarlığı (Kongre kitapçığı hariç)",
            subcategories: [],
          },
        ],
      },
      {
        code: "F-3",
        description: "Editörlük",
        subcategories: [],
      },
      {
        code: "F-4",
        description: "Yabancı dilden çevrilmiş kitap yazarlığı",
        subcategories: [
          {
            code: "F-4.1",
            description: "Yabancı dilden kitap çeviri editörlüğü",
            subcategories: [],
          },
          {
            code: "F-4.2",
            description: "Yabancı dilden kitap bölümü çevirisi",
            subcategories: [],
          },
        ],
      },
    ],
  },
];

export default function F_part() {
const [categories, setCategories] = useState(initialCategories); // Kategoriler listesi
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal görünürlük durumu
  const [selectedCategory, setSelectedCategory] = useState(null); // Seçilen kategori
  const [selectedWork, setSelectedWork] = useState(null); // Düzenlenen çalışma 
  const [count, setCount] = useState(1); // Puan/değer bilgisi
  const [fileName, setFileName] = useState(""); // Dosya adı
  const formRef = useRef(null); // Form referansı
  const allowedCategoryCodes = ["F-1", "F-2", "F-3", "F-4"]; // Eklenmesine izin verilen kategoriler

  const addWork = (parentCategory) => {
    setSelectedCategory(parentCategory);
    setSelectedWork(null);
    setIsModalOpen(true);
    setCount(1);
    setFileName("");
  };

  const editWork = (work, category) => {
    setSelectedCategory(category);
    setSelectedWork(work);
    setIsModalOpen(true);
    setCount(work.count);
    setFileName(work.fileName);
  };

    // Modal onaylandığında çağrılıyıo
  const handleOk = async () => {
    try {
      // validasyon kısmı
      await formRef.current.validateFields();

      // Validasyon tamamsa ekleme yapıyorum
      setIsModalOpen(false);

      setCategories((prevCategories) => {
        const newCategories = JSON.parse(JSON.stringify(prevCategories));

        const findAndAddOrUpdateWork = (categories) => {
          for (let cat of categories) {
            if (cat.code === selectedCategory.code) {
              const nextNumber = (cat.works ? cat.works.length : 0) + 1;
              const newWorkCode = `${cat.code}:${nextNumber}`;

              if (!cat.works) cat.works = [];

              if (selectedWork) {
                selectedWork.description = fileName;
                selectedWork.count = count;
                selectedWork.fileName = fileName;
              } else {
                cat.works.push({
                  code: newWorkCode,
                  description: `Çalışma-${nextNumber}`,
                  count: count,
                  fileName: fileName,
                });
              }
              return;
            }
            if (cat.subcategories) {
              findAndAddOrUpdateWork(cat.subcategories);
            }
          }
        };

        findAndAddOrUpdateWork(newCategories);
        return newCategories;
      });
    } catch (error) {
      console.log("Validation failed:", error);
    }
  };
  /*
  const handleOk = async () => {
  try {
    await formRef.current.validateFields();
    setIsModalOpen(false);

    const formData = new FormData();
    formData.append("categoryCode", selectedCategory.code);
    formData.append("count", count);
    formData.append("file", fileRef.current); // dosya referansı

    // Server'a gönder
    await axios.post("http://localhost:5000/api/add-work", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    // Kategorilere ekleme işlemi (frontend tarafında)
    setCategories((prevCategories) => {
      const newCategories = JSON.parse(JSON.stringify(prevCategories));
      const findAndAddOrUpdateWork = (categories) => {
        for (let cat of categories) {
          if (cat.code === selectedCategory.code) {
            const nextNumber = (cat.works ? cat.works.length : 0) + 1;
            const newWorkCode = ${cat.code}:${nextNumber};
            if (!cat.works) cat.works = [];

            if (selectedWork) {
              selectedWork.description = fileName;
              selectedWork.count = count;
              selectedWork.fileName = fileName;
            } else {
              cat.works.push({
                code: newWorkCode,
                description: Çalışma-${nextNumber},
                count: count,
                fileName: fileName,
              });
            }
            return;
          }
          if (cat.subcategories) {
            findAndAddOrUpdateWork(cat.subcategories);
          }
        }
      };
      findAndAddOrUpdateWork(newCategories);
      return newCategories;
    });
  } catch (error) {
    console.log("Validation failed or upload error:",error);
}
};
  */

  const handleCancel = () => {
    //formRef.current.resetFields(); // Formu sıfırlayın
    setIsModalOpen(false); // Modal'ı kapatın
  };

const handleFileChange = (e) => {
  const selectedFile = e.target.files?.[0] || e.file;
  if (selectedFile) {
    setFileName(selectedFile.name);
  }
};


  const onFinish = (values) => {
    console.log("Success:", values);
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded-lg shadow-lg m-5">
      <h1 className="text-xl font-semibold mb-6 text-center select-none">
        F.Ulusal Kitap
      </h1>
      <div>
        {categories.map((category) => (
          <CategoryItem
            key={category.code}
            category={category}
            onAddWork={addWork}
            onEditWork={editWork}
            setCategories={setCategories}
            allowedCategoryCodes={allowedCategoryCodes}
          />
        ))}
      </div>
      <WorkModal
        isModalOpen={isModalOpen}
        handleOk={handleOk}
        handleCancel={handleCancel}
        formRef={formRef}
        selectedCategory={selectedCategory}
        count={count}
        handleFileChange={handleFileChange}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      />
    </div>
  );
}
