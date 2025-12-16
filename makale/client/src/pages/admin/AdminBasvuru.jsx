import React, { useEffect, useState } from "react";
import { Table, Button } from "antd";

const AdminBasvuru = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = sessionStorage.getItem("token") || localStorage.getItem("token");

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/admin/basvuru", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setItems(data || []);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const deleteItem = async (id) => {
    if (!confirm('Silinsin mi?')) return;
    try {
      await fetch(`http://localhost:5000/api/admin/basvuru/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      fetchItems();
    } catch (err) { console.error(err); }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id' },
    { title: 'Eser', dataIndex: 'eser' },
    { title: 'Kod', dataIndex: 'ust_kod' },
    { title: 'Puan', dataIndex: 'toplamPuan' },
    { title: 'Tarih', dataIndex: 'created_at' },
    { title: 'İşlemler', render: (_, r) => <Button danger size="small" onClick={() => deleteItem(r.id)}>Sil</Button> }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Başvurular</h1>
      <Table dataSource={items} columns={columns} rowKey="id" loading={loading} />
    </div>
  );
};

export default AdminBasvuru;
