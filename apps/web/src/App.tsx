import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Room from './pages/Room';

export default function App() {
  return (
    <>
      <header className="banner">
        <h1><Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Groom Chilli</Link></h1>
        <p>Rate the spiciness of your tasks!</p>
      </header>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/room/:roomId" element={<Room />} />
      </Routes>
    </>
  );
}