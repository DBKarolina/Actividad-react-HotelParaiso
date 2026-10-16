import { useState } from "react"
import Home from "./pages/Home"
import Dashboard from "./components/Dashboard"
 
function App() {
  const [autenticado, setAutenticado] = useState(false)
 
  return autenticado ? (
<Dashboard onLogout={() => setAutenticado(false)} />
  ) : (
<Home onLogin={() => setAutenticado(true)} />
  )
}
 
export default App