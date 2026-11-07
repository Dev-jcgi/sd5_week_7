// Temas de la Semana 7 (DS5): WebSockets con PixPro.
export const TEMAS = [
  { id: 't1', n: 1, titulo: 'WebSocket vs. REST: diferencias clave', corto: 'WebSocket vs. REST', color: '#FF8A3D', min: 15 },
  { id: 't2', n: 2, titulo: 'Conceptos básicos de la comunicación en tiempo real', corto: 'Tiempo real', color: '#C6F33A', min: 20 },
  { id: 't3', n: 3, titulo: 'Configuración de un servidor WebSocket', corto: 'Servidor', color: '#6EA8FF', min: 20 },
  { id: 't4', n: 4, titulo: 'Protección de las conexiones WebSocket', corto: 'Protección', color: '#FF6B8B', min: 15 },
  { id: 't5', n: 5, titulo: 'Prueba y depuración de las API de WebSocket', corto: 'Pruebas', color: '#B78CFF', min: 8 },
];
export const TEMA = Object.fromEntries(TEMAS.map((t) => [t.id, t]));
