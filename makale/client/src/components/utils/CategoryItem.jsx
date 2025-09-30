import { useState } from "react";
import Icons from "./Icon";
import { handleDeleteWork } from "./DeleteWork";

export default function CategoryItem({ category, onAddWork, onEditWork, setCategories, allowedCategoryCodes }) {
  const [isOpen, setIsOpen] = useState(false);

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
                className="mt-3 text-sm text-blue-700 flex flex-wrap items-center  space-x-4"
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
                  className="text-blue-600 underline  break-words max-w-20"
                >
                  {work.fileName}
                </a>
                <Icons
                  onEdit={() => onEditWork(work, category)}
                  onDelete={() =>
                    handleDeleteWork(work, category, setCategories)
                  }
                />
              </div>
            ))}

          {shouldAllowWorkAddition && (
            <button
              className="w-full bg-gray-200 p-2 rounded hover:bg-gray-300 mt-2"
              onClick={() => onAddWork(category)}
            >
              + Çalışma Ekle
            </button>
          )}

          {category.subcategories &&
            category.subcategories.length > 0 &&
            category.subcategories.map((sub) => (
              <CategoryItem
                key={sub.code}
                category={sub}
                onAddWork={onAddWork}
                onEditWork={onEditWork}
                setCategories={setCategories}
                allowedCategoryCodes={allowedCategoryCodes}
              />
            ))}
        </div>
      )}
    </div>
  );
}