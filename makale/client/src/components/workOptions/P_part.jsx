import { Modal, Form, Input, Button } from "antd";
import { useState, useRef } from "react";
//import { useEffect} from "react";

import { DeleteOutlined, EditOutlined } from "@ant-design/icons";

const initialCategories = [
  {
    code: "P",
    subcategories: [
    ],
  },
];
const handleDeleteWork = (workToDelete, category, setCategories) => {
  setCategories((prevCategories) => {
    const newCategories = JSON.parse(JSON.stringify(prevCategories));

    const findAndDeleteWork = (categories) => {
      for (let cat of categories) {
        if (cat.code === category.code) {
          // Çalışmayı sil
          cat.works = cat.works.filter(
            (work) => work.code !== workToDelete.code
          );

          // Kalan çalışmaları güncelle
          cat.works.forEach((work, index) => {
            //önceki çalışmalara göre sıralı olmalı
            work.code = `${cat.code}:${index + 1}`;
          });

          return true;
        }

        // Alt kategorilerde çalışmayı sil
        if (cat.subcategories) {
          if (findAndDeleteWork(cat.subcategories)) {
            return true;
          }
        }
      }
      return false;
    };

    findAndDeleteWork(newCategories); // Çalışmayı sil ve güncelle
    return newCategories;
  });
};

function CategoryItem({ category, onAddWork, onEditWork, setCategories }) {
  const [isOpen, setIsOpen] = useState(false);

  // Özel olarak çalışmaya izin verilen kodlar
  const allowedCategoryCodes = [ "P"];

  const shouldAllowWorkAddition =
    !category.subcategories ||
    category.subcategories.length === 0 ||
    allowedCategoryCodes.includes(category.code);

  return (
    <div className="border-b border-gray-300 mb-2">
      <div
        className="flex justify-between items-center p-2 cursor-pointer hover:bg-gray-100"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-lg font-medium">{category.code}</span>
        <button className="px-2 py-1 bg-blue-500 text-white rounded-lg">
          {isOpen ? "-" : "+"}
        </button>
      </div>
      {isOpen && (
        <div className="pl-4 mt-2">
          <div className="text-gray-600 text-sm italic mb-2">
            {category.description}
          </div>

          {category.works &&
            category.works.map((work, idx) => (
              <div
                key={idx}
                className="mt-3 text-sm text-blue-700 flex items-center space-x-4"
              >
                <span className="w-1/4">{work.code}:</span>
                <a
                  href={
                    work.fileName
                      ? URL.createObjectURL(new Blob([work.fileName]))
                      : "#"
                  }
                  download={work.fileName}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline flex-grow"
                >
                  {work.fileName}
                </a>
                {/* Edit Icon */}
                <EditOutlined
                  className="ml-4 text-green-600 cursor-pointer"
                  onClick={() => onEditWork(work, category)} // Düzenleme işlevi
                />
                {/* Delete Icon */}
                <DeleteOutlined
                  className="ml-4 text-red-600 cursor-pointer"
                  onClick={() =>
                    handleDeleteWork(work, category, setCategories)
                  } // Silme işlevi
                />
              </div>
            ))}

          {/* Çalışma ekleme butonu sadece istenilen durumlarda */}
          {shouldAllowWorkAddition && (
            <button
              className="w-full bg-gray-200 p-2 rounded hover:bg-gray-300 mt-2"
              onClick={() => onAddWork(category)}
            >
              + Çalışma Ekle
            </button>
          )}

          {/* Alt kategorileri varsa alt alta göster */}
          {category.subcategories &&
            category.subcategories.length > 0 &&
            category.subcategories.map((sub) => (
              <CategoryItem
                key={sub.code}
                category={sub}
                onAddWork={onAddWork}
                onEditWork={onEditWork}
                setCategories={setCategories}
              />
            ))}
        </div>
      )}
    </div>
  );
}

export default function P_part() {
  const [categories, setCategories] = useState(initialCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedWork, setSelectedWork] = useState(null);
  const [count, setCount] = useState(1);
  const [fileName, setFileName] = useState("");
  const formRef = useRef(null);

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
        P.Bilimsel/Sanatsal Kuruluşlarda Görev (Uluslararası/Ulusal) (x yıl)
      </h1>
      <div>
        {categories.map((category) => (
          <CategoryItem
            key={category.code}
            category={category}
            onAddWork={addWork}
            onEditWork={editWork}
            setCategories={setCategories}
          />
        ))}
      </div>

      <Modal
        title={selectedCategory ? selectedCategory.description : ""}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        closable={false}
      >
        {selectedCategory && (
          <Form
            ref={formRef}
            name="workForm"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            style={{ maxWidth: 600 }}
            initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
          >
            <Form.Item
              label="Künyeyi giriniz"
              name="workDescription"
              rules={[{ required: true, message: "Lütfen künyenizi giriniz!" }]}
            >
              <Input.TextArea placeholder="Künyenizi buraya giriniz" />
            </Form.Item>

            <Form.Item
              label="Yazar sayısını giriniz"
              name="authorCount"
              rules={[
                { required: true, message: "Lütfen yazar sayısını giriniz!" },
              ]}
            >
              <Input type="number" value={count} min="1" />
            </Form.Item>

            <Form.Item
              label="Belge Yükleyin"
              name="file"
              rules={[
                { required: true, message: "Lütfen bir belge yükleyin!" },
              ]}
            >
              <Input
                type="file"
                onChange={handleFileChange}
                className="w-full border p-2 rounded mb-3"
              />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
}
