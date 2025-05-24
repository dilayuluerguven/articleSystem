import { Modal, Form, Input, Button } from "antd";
import { useState, useRef } from "react";
//import { useEffect} from "react";

import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import WorkModal from "../utils/WorkModal";
import CategoryItem from "../utils/CategoryItem";

const initialCategories = [
  {
    code: "K",
    description: "K.AR-GE Projeleri ve Araştırma",
    subcategories: [
      {
        code: "K-1",
        description:
          "AB Çerçeve Programı (FP, Horizon 2020) / NIH / NSF / ERC bilimsel araştırma projeleri (Koordinatör/yürütücü / araştırmacı / bursiyer)",
        subcategories: [],
      },
      {
        code: "K-2",
        description:
          "AB Çerçeve Programı / NIH / NSF / ERC bilimsel araştırma projeleri dışındaki Uluslararası destekli/ortaklı araştırma ve uygulama projeleri (Koordinatör/yürütücü / araştırmacı / bursiyer)",
        subcategories: [],
      },
      {
        code: "K-3",
        description:
          "Ulusal destekli/ortaklı araştırma – geliştirme projeleri (yürütücü / araştırmacı / bursiyer)",
        subcategories: [],
      },
      {
        code: "K-4",
        description: "Uluslararası / Ulusal projelerde danışmanlık",
        subcategories: [],
      },
      {
        code: "K-5",
        description:
          "Uluslararası / Ulusal Araştırma (Ar-Ge projeler hariç) her ay için ",
        subcategories: [],
      },
    ],
  },
];


export default function K_part() {
  const [categories, setCategories] = useState(initialCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedWork, setSelectedWork] = useState(null);
  const [count, setCount] = useState(1);
  const [fileName, setFileName] = useState("");
  const formRef = useRef(null);
    const allowedCategoryCodes = ["K-1", "K-2", "K-3", "K-4", "K-5"];


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
  
  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded-lg shadow-lg m-5">
      <h1 className="text-xl font-semibold mb-6 text-center select-none">
        K.AR-GE Projeleri ve Araştırma
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
