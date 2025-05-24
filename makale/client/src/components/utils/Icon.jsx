import { DeleteOutlined, EditOutlined } from "@ant-design/icons";

const Icons = ({ onEdit, onDelete }) => {
  return (
    <div className="space-x-35 mt-2">
      {/* Edit Icon */}
      <button
        className="p-1 text-green-600 hover:text-green-700 rounded transition-colors"
        onClick={onEdit}
        title="Düzenle"
      >
        <EditOutlined className="text-base" />
      </button>
      {/* Delete Icon */}
      <button
        className="p-1 text-red-600 hover:text-red-700 rounded transition-colors"
        onClick={onDelete}
        title="Sil"
      >
        <DeleteOutlined className="text-base" />
      </button>
    </div>
  );
};

export default Icons;