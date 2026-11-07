import { useEffect, useState, useSyncExternalStore } from 'react';

/* Conexión WebSocket con el servidor Java de la clase (PixPro en vivo).
   - Una sola conexión por pestaña, compartida por toda la página.
   - Se reconecta sola con espera creciente: 1 s, 2 s, 4 s… máximo 10 s (backoff).
   - Guarda los últimos mensajes enviados (↑) y recibidos (↓) para mostrarlos como en DevTools.

   Dirección del servidor, en este orden:
     1. ?ws=ws://localhost:8080 en la URL (se recuerda en este navegador)
     2. la variable VITE_WS_URL al compilar
     3. wss://pixpro-vivo.onrender.com */
const DEFAULT = import.meta.env.VITE_WS_URL || 'wss://pixpro-vivo.onrender.com';
function urlServidor() {
  const q = new URLSearchParams(location.hash.split('?')[1] || location.search).get('ws');
  try { if (q) localStorage.setItem('pixpro7-ws', q); } catch { /* */ }
  let guardada = null;
  try { guardada = localStorage.getItem('pixpro7-ws'); } catch { /* */ }
  return q || guardada || DEFAULT;
}
export function olvidarServidor() { try { localStorage.removeItem('pixpro7-ws'); } catch { /* */ } }

const MAX_LOG = 80;
let ws = null;
let hola = null;          // primer mensaje que se reenvía al reconectar
let intentos = 0;
let reintento = null;
let cerrandoAdrede = false;
const oyentes = new Set();
let estado = { fase: 'desconectado', url: urlServidor(), siguienteEn: null, cierre: null, log: [], seq: 0 };
const subs = new Set();
const setEstado = (p) => { estado = { ...estado, ...p, seq: estado.seq + 1 }; subs.forEach((f) => f()); };
const anotar = (dir, texto) => setEstado({ log: [{ dir, texto, t: Date.now() }, ...estado.log].slice(0, MAX_LOG) });

function abrir() {
  clearTimeout(reintento);
  cerrandoAdrede = false;
  const url = urlServidor();
  setEstado({ fase: intentos ? 'reconectando' : 'conectando', url, siguienteEn: null });
  try { ws = new WebSocket(url); } catch (e) { programar(); return; }
  ws.onopen = () => {
    intentos = 0;
    setEstado({ fase: 'conectado', cierre: null });
    if (hola) enviar(hola);
  };
  ws.onmessage = (ev) => {
    let m; try { m = JSON.parse(ev.data); } catch { return; }
    if (m.tipo !== 'mundo' && !(m.tipo === 'lote' && m.evento === 'ImagenProcesada' && m.hechas % 50)) anotar('↓', ev.data);
    oyentes.forEach((f) => f(m));
  };
  ws.onclose = (ev) => {
    setEstado({ cierre: { codigo: ev.code, razon: ev.reason } });
    ws = null;
    // 1008 = el servidor nos rechazó (clave, exceso de mensajes): no insistir solos.
    if (cerrandoAdrede || ev.code === 1008) { setEstado({ fase: 'desconectado' }); return; }
    programar();
  };
}

function programar() {
  const espera = Math.min(10000, 1000 * 2 ** Math.min(intentos++, 4));
  setEstado({ fase: 'esperando', siguienteEn: Date.now() + espera });
  reintento = setTimeout(abrir, espera);
}

export function conectar(primerMensaje) {
  hola = primerMensaje;
  if (ws && ws.readyState <= 1) { if (ws.readyState === 1) enviar(hola); return; }
  intentos = 0;
  abrir();
}

export function desconectar() {
  cerrandoAdrede = true;
  clearTimeout(reintento);
  hola = null;
  if (ws) ws.close(1000, 'adiós');
  setEstado({ fase: 'desconectado' });
}

export function enviar(msg) {
  if (!ws || ws.readyState !== 1) return false;
  const texto = JSON.stringify(msg);
  ws.send(texto);
  if (msg.tipo !== 'mover') anotar('↑', msg.clave ? texto.replace(JSON.stringify(msg.clave), '"••••••"') : texto);
  return true;
}

/** Cliente "tramposo" para la demostración de seguridad: manda n mensajes de golpe. */
export function rafaga(n = 30) {
  for (let i = 0; i < n; i++) enviar({ tipo: 'reaccion', emoji: '🚀' });
}

export function escuchar(f) { oyentes.add(f); return () => oyentes.delete(f); }

export function useConexion() {
  return useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f); }, () => estado);
}

/** Estado de la clase que el servidor nos va contando (se arma con los mensajes recibidos). */
export function useClase() {
  const [c, setC] = useState({ conectados: 0, yo: null, puntos: 0, acerto: null, lote: null, pregunta: null, resultado: null,
    ranking: [], juego: null, mundo: null, reacciones: [], preguntas: [], conteo: null, trazas: [], error: null, atrapado: null });
  useEffect(() => escuchar((m) => setC((s) => {
    switch (m.tipo) {
      case 'bienvenida': return { ...s, yo: m, conectados: m.conectados, error: null };
      case 'conectados': return { ...s, conectados: m.total };
      case 'puntos': return { ...s, puntos: m.total, acerto: m.acerto ?? s.acerto };
      case 'lote': return { ...s, lote: m };
      case 'pregunta': return { ...s, pregunta: { ...m, recibidaEn: Date.now() }, resultado: null, acerto: null, miRespuesta: null, conteo: null };
      case 'resultado': return { ...s, resultado: m };
      case 'ranking': return { ...s, ranking: m.top };
      case 'juego': return m.estado === 'jugando' ? { ...s, juego: m, pregunta: null, resultado: null } : { ...s, juego: m };
      case 'mundo': return { ...s, mundo: m };
      case 'atrapado': return { ...s, atrapado: { ...m, t: Date.now() } };
      case 'reaccion': return { ...s, reacciones: [...s.reacciones.slice(-30), { ...m, id: Math.random() }] };
      case 'preguntas': return { ...s, preguntas: m.lista };
      case 'conteo': return { ...s, conteo: m };
      case 'traza': return { ...s, trazas: [{ ...m, t: Date.now() }, ...s.trazas].slice(0, 40) };
      case 'error': return { ...s, error: m.mensaje };
      default: return s;
    }
  })), []);
  return [c, setC];
}

/** Texto en español para cada código de cierre (tema 5: depuración). */
export const CODIGOS = {
  1000: 'cierre normal',
  1001: 'el otro lado se fue (pestaña cerrada o servidor reiniciando)',
  1006: 'se cortó sin despedirse: red caída o servidor dormido/caído',
  1008: 'violación de política: clave incorrecta o demasiados mensajes',
  1009: 'mensaje demasiado grande',
  1011: 'error interno del servidor',
};
