import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Room from './pages/Room';
import { skin } from './skins';

export default function App() {
  return (
    <>
      <header className="banner">
        <h1><Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Groom Chilli</Link></h1>
        <p>{skin.tagline}</p>
      </header>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/room/:roomId" element={<Room />} />
      </Routes>
    </>
  );
}