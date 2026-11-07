import { useEffect, useState } from 'react';
import Landing from './components/Landing.jsx';
import Viewer from './components/Viewer.jsx';
import Vivo from './components/Vivo.jsx';
import Profesor from './components/Profesor.jsx';
import Ejercicio from './components/Ejercicio.jsx';

const route = () => (location.hash.split('?')[0] || '#/').replace(/^#/, '') || '/';
const NAV = [['/', 'Inicio'], ['/vivo', 'En vivo'], ['/presentacion', 'Presentación'], ['/ejercicio', 'Ejercicio']];

export default function App() {
  const [r, setR] = useState(route());
  useEffect(() => {
    const on = () => setR(route());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  const Page = { '/presentacion': Viewer, '/vivo': Vivo, '/profesor': Profesor, '/ejercicio': Ejercicio }[r] || Landing;
  return (
    <>
      {r !== '/profesor' && (
        <header className="topbar">
          <a className="logo" href="#/"><i aria-hidden="true" />DS5 · Semana 7</a>
          <nav>{NAV.map(([h, t]) => <a key={h} href={`#${h}`} aria-current={r === h ? 'page' : undefined}>{t}</a>)}</nav>
        </header>
      )}
      <Page key={r} />
    </>
  );
}
