import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Header } from "./components/header/header";
import UpperPart from "./components/UpperPart";
import FormPart from "./components/FormPart"; // <- bunu ekle
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div> 
              <Header />
              <UpperPart />
              <FormPart />
            </div>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;
