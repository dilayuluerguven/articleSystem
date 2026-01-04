import React, { useEffect, useState } from "react";
import { Table, Button, Tag, Popconfirm } from "antd";
import { toast } from "react-toastify";
import {
  UserAddOutlined,
  UserDeleteOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { Header } from "../../header/header";
import { useNavigate } from "react-router-dom";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const token =
    sessionStorage.getItem("token") || localStorage.getItem("token");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsers(data || []);
    } catch {
      toast.error("Kullanıcılar yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleAdmin = async (u) => {
    try {
      await fetch(`http://localhost:5000/api/admin/users/${u.id}/promote`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_admin: u.is_admin ? 0 : 1 }),
      });
      toast.success(
        u.is_admin ? "Admin yetkisi kaldırıldı" : "Admin yetkisi verildi"
      );
      fetchUsers();
    } catch {
      toast.error("Yetki güncellenemedi");
    }
  };

  const deleteUser = async (u) => {
    try {
      await fetch(`http://localhost:5000/api/admin/users/${u.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Kullanıcı silindi");
      fetchUsers();
    } catch {
      toast.error("Kullanıcı silinemedi");
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", width: 70 },
    { title: "Ad Soyad", dataIndex: "fullname" },
    { title: "Kullanıcı Adı", dataIndex: "username" },
    { title: "E-Posta", dataIndex: "email" },
    {
      title: "Rol",
      dataIndex: "is_admin",
      render: (v) =>
        v ? <Tag color="green">ADMIN</Tag> : <Tag>KULLANICI</Tag>,
    },
    {
      title: "Kayıt Tarihi",
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
      render: (_, record) => (
        <div className="flex gap-2">
          <Popconfirm
            title={
              record.is_admin
                ? "Admin yetkisi kaldırılsın mı?"
                : "Admin yetkisi verilsin mi?"
            }
            okText="Evet"
            cancelText="Vazgeç"
            onConfirm={() => toggleAdmin(record)}
          >
            <Button
              size="small"
              icon={
                record.is_admin ? <UserDeleteOutlined /> : <UserAddOutlined />
              }
            >
              {record.is_admin ? "Yetkiyi Kaldır" : "Yetki Ver"}
            </Button>
          </Popconfirm>

          <Popconfirm
            title="Kullanıcı silinsin mi?"
            okText="Sil"
            cancelText="Vazgeç"
            onConfirm={() => deleteUser(record)}
          >
            <Button size="small" danger icon={<DeleteOutlined />}>
              Sil
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => navigate("/admin")}
            className="text-gray-500 hover:text-gray-800 transition"
            title="Dashboard'a dön"
          >
            <ArrowLeftOutlined className="text-lg" />
          </button>

          <h1 className="text-2xl font-semibold">👤 Kullanıcı Yönetimi</h1>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <Table
            dataSource={users}
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

export default AdminUsers;
