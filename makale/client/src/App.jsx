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

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false); // ✅ yeni

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
          path="/form7"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <Form7 />
            </PrivateRoute>
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
