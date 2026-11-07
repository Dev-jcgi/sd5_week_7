import { useEffect, useRef, useState } from 'react';

/* "¿Dónde va mi lote?" tres veces: Polling, SSE y WebSocket, lado a lado.
   Es una simulación en el navegador (no usa la red): siempre funciona en clase.
   El servidor de PixPro avanza el lote en momentos al azar; cada carril muestra
   cuántos viajes hace falta para que el navegador se entere y con cuánto retraso. */

const DURACION = 20;      // segundos de simulación
const VIAJE = 0.45;       // segundos que tarda un mensaje en cruzar la red (exagerado para verlo)
const CADA = 2;           // el polling pregunta cada 2 s
const EVENTOS = [1.3, 3.1, 3.5, 6.8, 9.2, 11.9, 12.3, 15.6, 18.1].map((t, i) => ({ t, v: (i + 1) * 50 }));
const HTTP_BYTES = 800;   // encabezados típicos de una petición + respuesta HTTP
const FRAME_BYTES = 6;    // encabezado de un frame WebSocket (2 a 14 bytes)

function valorEn(t) { let v = 0; for (const e of EVENTOS) if (e.t <= t) v = e.v; return v; }

/** Calcula todo lo que pasa en un carril hasta el segundo t. */
function carril(tipo, t, cancelarEn) {
  const viajes = []; // {de: 'c'|'s', ini, etiqueta, color}
  let visto = 0, peticiones = 0, inutiles = 0, bytes = 0;
  const retrasos = [];
  const ver = (v, cuando) => {
    if (v <= visto) return;
    EVENTOS.forEach((e) => { if (e.v > visto && e.v <= v) retrasos.push(cuando - e.t); });
    visto = v;
  };
  if (tipo === 'polling') {
    let antes = 0; // último valor que el servidor ya había contestado
    for (let p = 0; p <= t; p += CADA) {
      peticiones++; bytes += HTTP_BYTES;
      viajes.push({ de: 'c', ini: p, etiqueta: 'GET /lotes/L-1042', color: '#6EA8FF' });
      const llega = p + VIAJE, vuelve = p + 2 * VIAJE;
      const v = valorEn(llega);
      const nada = v <= visto && vuelve <= t;
      if (llega <= t) viajes.push({ de: 's', ini: llega, etiqueta: v > antes ? `200 · ${v}/450` : '200 · sin cambios', color: v > antes ? '#C6F33A' : '#7C8798' });
      antes = Math.max(antes, v);
      if (vuelve <= t) { if (nada) inutiles++; ver(v, vuelve); }
    }
    if (cancelarEn != null && cancelarEn <= t) { peticiones++; bytes += HTTP_BYTES; viajes.push({ de: 'c', ini: cancelarEn, etiqueta: 'POST /lotes/L-1042/cancelar', color: '#FF6B8B' }); }
  } else {
    // SSE y WebSocket: una sola conexión al inicio; el servidor avisa cuando hay algo.
    peticiones = 1; bytes = tipo === 'ws' ? 500 : 400;
    viajes.push({ de: 'c', ini: 0, etiqueta: tipo === 'ws' ? 'GET · Upgrade: websocket' : 'GET · Accept: text/event-stream', color: '#6EA8FF' });
    if (VIAJE <= t) viajes.push({ de: 's', ini: VIAJE, etiqueta: tipo === 'ws' ? '101 Switching Protocols' : '200 · stream abierto', color: '#6EA8FF' });
    EVENTOS.forEach((e) => {
      if (e.t > t) return;
      bytes += tipo === 'ws' ? FRAME_BYTES + 40 : 50;
      viajes.push({ de: 's', ini: e.t, etiqueta: `ImagenProcesada · ${e.v}/450`, color: '#C6F33A' });
      if (e.t + VIAJE <= t) ver(e.v, e.t + VIAJE);
    });
    if (cancelarEn != null && cancelarEn <= t) {
      if (tipo === 'ws') { bytes += FRAME_BYTES + 25; viajes.push({ de: 'c', ini: cancelarEn, etiqueta: '{"tipo":"cancelarLote"}', color: '#FF6B8B' }); }
      else { peticiones++; bytes += HTTP_BYTES; viajes.push({ de: 'c', ini: cancelarEn, etiqueta: 'POST aparte: SSE es de un solo sentido', color: '#FF6B8B' }); }
    }
  }
  const prom = retrasos.length ? retrasos.reduce((a, b) => a + b, 0) / retrasos.length : null;
  return { viajes: viajes.filter((v) => t - v.ini <= VIAJE + 0.05), visto, peticiones, inutiles, bytes, prom };
}

const CARRILES = [
  { id: 'polling', nombre: 'Polling (REST)', sub: 'el navegador pregunta cada 2 s', color: '#FF8A3D' },
  { id: 'sse', nombre: 'SSE', sub: 'el servidor avisa · un solo sentido', color: '#FFD166' },
  { id: 'ws', nombre: 'WebSocket', sub: 'una conexión · los dos hablan', color: '#C6F33A' },
];

export default function Comparador({ compacto = false }) {
  const [t, setT] = useState(0);
  const [corriendo, setCorriendo] = useState(false);
  const [cancelarEn, setCancelarEn] = useState(null);
  const ini = useRef(0);
  useEffect(() => {
    if (!corriendo) return;
    let id;
    ini.current = performance.now() - t * 1000;
    const tick = (now) => {
      const nt = Math.min(DURACION, (now - ini.current) / 1000);
      setT(nt);
      if (nt < DURACION) id = requestAnimationFrame(tick); else setCorriendo(false);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [corriendo]);
  const reiniciar = () => { setT(0); setCancelarEn(null); setCorriendo(true); };
  const W = 1000, X1 = 150, X2 = 850;

  return (
    <div className={`comparador ${compacto ? 'compacto' : ''}`}>
      <div className="comp-ctrl">
        <button className="btn" onClick={corriendo ? () => setCorriendo(false) : t >= DURACION || t === 0 ? reiniciar : () => setCorriendo(true)}>
          {corriendo ? 'Pausa' : t === 0 ? '▶ Iniciar' : t >= DURACION ? '↺ Repetir' : '▶ Seguir'}
        </button>
        <button className="btn ghost" disabled={!corriendo || cancelarEn != null} onClick={() => setCancelarEn(t)}>El usuario toca “Cancelar lote”</button>
        <span className="mono comp-t">t = {t.toFixed(1)} s · servidor: {valorEn(t)}/450 fotos</span>
      </div>
      {CARRILES.map((c) => {
        const r = carril(c.id, t, cancelarEn);
        return (
          <div key={c.id} className="comp-carril" style={{ '--c': c.color }}>
            <div className="comp-nom"><b>{c.nombre}</b><span>{c.sub}</span></div>
            <svg viewBox={`0 0 ${W} 120`} className="comp-svg" role="img" aria-label={`Carril ${c.nombre}`}>
              <rect x="10" y="30" width="130" height="60" rx="10" className="nodo" />
              <text x="75" y="56" className="nodo-t">Navegador</text>
              <text x="75" y="76" className="nodo-v">{r.visto}/450</text>
              <rect x={W - 140} y="30" width="130" height="60" rx="10" className="nodo srv" />
              <text x={W - 75} y="56" className="nodo-t">Servidor</text>
              <text x={W - 75} y="76" className="nodo-v">PixPro</text>
              {c.id !== 'polling' && t > VIAJE && <line x1={X1} y1="60" x2={X2} y2="60" className="tubo" />}
              {r.viajes.map((v, i) => {
                const p = Math.min(1, (t - v.ini) / VIAJE);
                const x = v.de === 'c' ? X1 + (X2 - X1) * p : X2 - (X2 - X1) * p;
                const y = v.de === 'c' ? 42 : 80;
                return (
                  <g key={i} transform={`translate(${x},${y})`}>
                    <rect x="-9" y="-7" width="18" height="14" rx="3" fill={v.color} />
                    <text y={v.de === 'c' ? -14 : 26} className="viaje-t" fill={v.color}>{v.etiqueta}</text>
                  </g>
                );
              })}
            </svg>
            <div className="comp-num mono">
              <span><b>{r.peticiones}</b> peticiones HTTP</span>
              {c.id === 'polling' && <span><b>{r.inutiles}</b> “sin cambios”</span>}
              <span><b>{(r.bytes / 1000).toFixed(1)}</b> KB de encabezados</span>
              <span>se entera en <b>{r.prom == null ? '—' : r.prom.toFixed(2)}</b> s</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
