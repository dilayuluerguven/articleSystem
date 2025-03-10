//import './App.css'
import "tailwindcss";
import { Header } from "./components/header/header";
import FormPart from "./components/FormPart";
import UpperPart from "./components/UpperPart";

function App() {
  return (
    <div>
      <Header/>
      <UpperPart/>
      <FormPart/>
    </div>
  )
}

export default App
