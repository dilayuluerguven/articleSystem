import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import PrivateRoute from "./components/PrivateRoute";
import UserProfile from "./pages/UserProfile";
import Form1 from "./pages/Form1";
import Form7 from "./pages/form7/Form7";
import Form3 from "./pages/form3/Form3";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminBasvuru from "./pages/admin/AdminBasvuru";
import AdminRoute from "./components/AdminRoute";
import AdminTables from "./pages/admin/AdminTables";
import Form4 from "./pages/form4/Form4";
import Form5 from "./pages/Form5";
import Form6 from "./pages/Form6";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) setIsAuthenticated(true);
    setAuthChecked(true); 
  }, []);

  if (!authChecked) {
    return null; 
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={<Login setIsAuthenticated={setIsAuthenticated} />}
        />
        <Route path="/register" element={<Register />} />

        <Route
          path="/home"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <Home />
            </PrivateRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <Profile />
            </PrivateRoute>
          }
        />

        <Route
          path="/userprofile"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <UserProfile />
            </PrivateRoute>
          }
        />
         <Route
          path="/form1"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <Form1 />
            </PrivateRoute>
          }
        />
        <Route
          path="/form3"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <Form3 />
            </PrivateRoute>
          }
        />
        <Route
          path="/form4"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <Form4 />
            </PrivateRoute>
          }
        />
        <Route
          path="/form5"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <Form5 />
            </PrivateRoute>
          }
        />
         <Route
          path="/form6"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <Form6 />
            </PrivateRoute>
          }
        />
         <Route
          path="/form7"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <Form7 />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminRoute isAuthenticated={isAuthenticated}>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <AdminRoute isAuthenticated={isAuthenticated}>
              <AdminUsers />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/basvuru"
          element={
            <AdminRoute isAuthenticated={isAuthenticated}>
              <AdminBasvuru />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/tables"
          element={
            <AdminRoute isAuthenticated={isAuthenticated}>
              <AdminTables />
            </AdminRoute>
          }
        />

        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Home />
            ) : (
              <Login setIsAuthenticated={setIsAuthenticated} />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
