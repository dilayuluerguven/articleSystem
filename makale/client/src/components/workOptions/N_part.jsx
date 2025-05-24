import { Modal, Form, Input, Button } from "antd";
import { useState, useRef } from "react";
//import { useEffect} from "react";

import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import WorkModal from "../utils/WorkModal";
import CategoryItem from "../utils/CategoryItem";

const initialCategories = [
  {
    code: "N",
    description:
      "N.Danışmanlık (Mesleki) veya Üniversite-Sanayi İşbirliği Faaliyetleri",
    subcategories: [
      {
        code: "N-1",
        description:
          "Kamu ve/veya özel sektörde, Teknoparklarda ve/veya sanayi kuruluşlarının Ar-ge birimlerinde en az 3 ay süreli danışmanlık hizmeti ve eğiticilik (x Ay)",
        subcategories: [],
      },
      {
        code: "N-2",
        description:
          "Teknopark ve benzeri alanlarda şirket kurucusu/ortağı olmak ve şirket faaliyetlerine devam ediyor olmak",
        subcategories: [],
      },
      {
        code: "N-3",
        description:
          "Üniversite – Sanayi / Kamu Kurumları işbirliği kapsamında tamamlanmış proje tasarım faaliyetleri",
        subcategories: [],
      },
      {
        code: "N-4",
        description: "Bilirkişilik faaliyeti (x adet)",
        subcategories: [],
      },
    ],
  },
];



export default function N_part() {
  const [categories, setCategories] = useState(initialCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedWork, setSelectedWork] = useState(null);
  const [count, setCount] = useState(1);
  const [fileName, setFileName] = useState("");
  const formRef = useRef(null);
const allowedCategoryCodes = ["N-1", "N-2", "N-3", "N-4"];

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

  const handleOk = async () => {
    try {
      // validasyon kısmı
      await formRef.current.validateFields();

      // Validasyon tamamsa ekle
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

  const handleCancel = () => {
    formRef.current.resetFields(); // Formu sıfırlayın
    setIsModalOpen(false); // Modal'ı kapatın
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
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
  // useEffect(() => {
  //   if (isModalOpen) {
  //     formRef.current.resetFields();
  //   }
  // }, [isModalOpen]);
  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded-lg shadow-lg m-5">
      <h1 className="text-xl font-semibold mb-6 text-center select-none">
        N.Danışmanlık (Mesleki) veya Üniversite-Sanayi İşbirliği Faaliyetleri
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
