import React, { useEffect, useState } from "react";
import { Table, Button, Popconfirm, message } from "antd";
import { Header } from "../../header/header";
import { useNavigate } from "react-router-dom";
import { ArrowLeftOutlined, DeleteOutlined } from "@ant-design/icons";

const AdminBasvuru = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const token =
    sessionStorage.getItem("token") || localStorage.getItem("token");

  const navigate = useNavigate();

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/admin/basvuru", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setItems(data || []);
    } catch {
      message.error("Başvurular yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const deleteItem = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/admin/basvuru/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success("Başvuru silindi");
      fetchItems();
    } catch {
      message.error("Silme işlemi başarısız");
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", width: 70 },
    { title: "Eser", dataIndex: "eser" },
    { title: "Kod", dataIndex: "ust_kod" },
    { title: "Toplam Puan", dataIndex: "toplamPuan" },
    {
      title: "Tarih",
      dataIndex: "created_at",
      render: (value) =>
        value
          ? new Date(value).toLocaleString("tr-TR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "-",
    },
    {
      title: "İşlemler",
      render: (_, r) => (
        <Popconfirm
          title="Başvuru silinsin mi?"
          okText="Sil"
          cancelText="Vazgeç"
          onConfirm={() => deleteItem(r.id)}
        >
          <Button danger size="small" icon={<DeleteOutlined />}>
            Sil
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <>
      <Header />
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => navigate("/admin")}
            className="text-gray-500 hover:text-gray-800 transition"
            title="Dashboard'a dön"
          >
            <ArrowLeftOutlined className="text-lg" />
          </button>

          <h1 className="text-2xl font-semibold">📄 Başvurular</h1>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <Table
            dataSource={items}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 8 }}
          />
        </div>
      </div>
    </>
  );
};

export default AdminBasvuru;
