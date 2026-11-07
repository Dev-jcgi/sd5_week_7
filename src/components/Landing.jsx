import { TEMAS } from '../data/temas.js';

const BASE = import.meta.env.BASE_URL;
const DIAGRAMAS = [
  ['rest-vs-ws', 'Polling contra WebSocket'], ['handshake', 'Vida de una conexión'], ['juego', 'Caza de píxeles'],
  ['pixpro-tiempo-real', 'PixPro · dónde va el WebSocket'], ['lote-vivo', 'Un lote en vivo'], ['servidor-clases', 'El servidor por dentro'],
  ['despliegue', 'GitHub Pages + Render'], ['seguridad', 'Seis capas de protección'], ['depuracion', 'Ruta de depuración'],
];

export default function Landing() {
  return (
    <div className="page landing7">
      <section className="hero7">
        <p className="eyebrow">Desarrollo de Software 5 · Semana 7 · PixPro</p>
        <h1 className="h-xl">Tiempo real con <em>WebSockets</em></h1>
        <p className="exp">Un videojuego, un lote de fotos que avanza en vivo y un servidor Java que escribiste tú: así se entiende por qué el servidor también puede hablar primero.</p>
        <div className="row-btns">
          <a className="btn" href="#/vivo">Entrar a la clase en vivo</a>
          <a className="btn ghost" href="#/presentacion">Ver la presentación</a>
          <a className="btn ghost" href="#/ejercicio">Ejercicio</a>
        </div>
      </section>
      <section>
        <p className="eyebrow">Temas</p>
        <div className="temas7">{TEMAS.map((t) => <a key={t.id} href={`#/presentacion?t=${t.id}`} style={{ '--c': t.color }}><span className="mono">{t.n}</span>{t.titulo}</a>)}</div>
      </section>
      <section>
        <p className="eyebrow">Diagramas (Archify)</p>
        <div className="diags7">{DIAGRAMAS.map(([id, t]) => <a key={id} href={`${BASE}diagramas/${id}.html`} target="_blank" rel="noreferrer">{t} ↗</a>)}</div>
      </section>
    </div>
  );
}
