import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Popconfirm,
} from "antd";
import { toast } from "react-toastify";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { Header } from "../../header/header";
import { useNavigate } from "react-router-dom";

const TABLES = {
  ust_aktiviteler: {
    label: "Üst Aktiviteler",
    fields: ["kod", "tanim"],
  },
  alt_aktiviteler: {
    label: "Alt Aktiviteler",
    fields: ["aktivite_id", "kod", "tanim", "puan_id"],
  },
  aktivite: {
    label: "Aktiviteler",
    fields: ["alt_aktivite_id", "kod", "tanim", "puan_id"],
  },
  akademik_puanlar: {
    label: "Akademik Puanlar",
    fields: [
      "ana_aktivite_id",
      "alt_aktivite_id",
      "aktivite_id",
      "alt_kategori",
      "puan",
    ],
  },
  yazar_puanlar: {
    label: "Yazar Puanları",
    fields: ["yazar_sayisi", "ilk_isim", "digerleri"],
  },
};

const AdminTables = () => {
  const [table, setTable] = useState("ust_aktiviteler");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form] = Form.useForm();
  const navigate = useNavigate();

  const token =
    sessionStorage.getItem("token") || localStorage.getItem("token");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/ref/${table}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          toast.error("Admin yetkiniz yok");
          navigate("/admin");
          return;
        }
        throw new Error("Veri alınamadı");
      }

      const json = await res.json();
      setData(Array.isArray(json) ? json : []);
    } catch {
      toast.error("Veriler yüklenemedi");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [table]);

  const openModal = (record = null) => {
    setEditing(record);
    form.setFieldsValue(record || {});
    setOpen(true);
  };

  const submit = async () => {
    try {
      const values = await form.validateFields();
      const method = editing ? "PUT" : "POST";
      const url = editing
        ? `http://localhost:5000/api/admin/ref/${table}/${editing.id}`
        : `http://localhost:5000/api/admin/ref/${table}`;

      await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });

      toast.success(editing ? "Güncellendi" : "Eklendi");
      setOpen(false);
      setEditing(null);
      fetchData();
    } catch {
      toast.error("İşlem başarısız");
    }
  };

  const remove = async (id) => {
    try {
      await fetch(
        `http://localhost:5000/api/admin/ref/${table}/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Silindi");
      fetchData();
    } catch {
      toast.error("Silinemedi");
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", width: 70 },
    ...TABLES[table].fields.map((f) => ({
      title: f,
      dataIndex: f,
    })),
    {
      title: "İşlemler",
      render: (_, r) => (
        <div className="flex gap-2">
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => openModal(r)}
          >
            Düzenle
          </Button>

          <Popconfirm
            title="Silinsin mi?"
            okText="Sil"
            cancelText="Vazgeç"
            onConfirm={() => remove(r.id)}
          >
            <Button danger size="small" icon={<DeleteOutlined />}>
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
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/admin")}
              className="text-gray-500 hover:text-gray-800 transition"
              title="Dashboard'a dön"
            >
              <ArrowLeftOutlined className="text-lg" />
            </button>
            <h1 className="text-2xl font-semibold">
              Sistem Tabloları
            </h1>
          </div>

          <Select
            value={table}
            onChange={setTable}
            style={{ width: 260 }}
            options={Object.entries(TABLES).map(([k, v]) => ({
              value: k,
              label: v.label,
            }))}
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex justify-end mb-4">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => openModal()}
            >
              Yeni Kayıt
            </Button>
          </div>

          <Table
            rowKey="id"
            dataSource={data}
            columns={columns}
            loading={loading}
          />
        </div>
      </div>

      <Modal
        open={open}
        title={editing ? "Kayıt Güncelle" : "Yeni Kayıt"}
        onCancel={() => setOpen(false)}
        onOk={submit}
        okText="Kaydet"
        cancelText="Vazgeç"
      >
        <Form form={form} layout="vertical">
          {TABLES[table].fields.map((f) => (
            <Form.Item key={f} name={f} label={f}>
              {f.includes("puan") || f.includes("id") ? (
                <InputNumber className="w-full" />
              ) : (
                <Input />
              )}
            </Form.Item>
          ))}
        </Form>
      </Modal>
    </>
  );
};

export default AdminTables;
