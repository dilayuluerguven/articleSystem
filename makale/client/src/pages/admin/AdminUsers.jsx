import React, { useEffect, useState } from "react";
import { Table, Button, Tag } from "antd";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = sessionStorage.getItem("token") || localStorage.getItem("token");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsers(data || []);
    } catch (err) {
      console.error("Kullanıcı listesi alınamadı:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleAdmin = async (u) => {
    if (!confirm(`${u.fullname} kullanıcısına admin yetkisi ${u.is_admin ? 'kaldırılsın' : 'verilsin'}?`)) return;
    try {
      await fetch(`http://localhost:5000/api/admin/users/${u.id}/promote`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ is_admin: u.is_admin ? 0 : 1 }),
      });
      fetchUsers();
    } catch (err) { console.error(err); }
  };

  const deleteUser = async (u) => {
    if (!confirm(`${u.fullname} silinsin mi?`)) return;
    try {
      await fetch(`http://localhost:5000/api/admin/users/${u.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      fetchUsers();
    } catch (err) { console.error(err); }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id' },
    { title: 'İsim', dataIndex: 'fullname' },
    { title: 'Kullanıcı Adı', dataIndex: 'username' },
    { title: 'E-Posta', dataIndex: 'email' },
    { title: 'Admin', dataIndex: 'is_admin', render: (v) => v ? <Tag color="green">Evet</Tag> : <Tag>Hayır</Tag> },
    { title: 'Kayıt', dataIndex: 'created_at' },
    { title: 'İşlemler', key: 'actions', render: (_, record) => (
      <div className="space-x-2">
        <Button size="small" onClick={() => toggleAdmin(record)}>{record.is_admin ? 'Demote' : 'Promote'}</Button>
        <Button size="small" danger onClick={() => deleteUser(record)}>Delete</Button>
      </div>
    )}
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Kullanıcı Yönetimi</h1>
      <Table dataSource={users} columns={columns} rowKey="id" loading={loading} />
    </div>
  );
};

export default AdminUsers;
