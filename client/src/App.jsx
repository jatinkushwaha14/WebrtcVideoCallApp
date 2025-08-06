import Lobby from './screens/lobby';
import './App.css'
import { Route, Routes } from 'react-router-dom';
import { Roompage } from './screens/room';
function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/room/:room" element={<Roompage/>} />
      </Routes>
    </>
  )
}

export default App;
