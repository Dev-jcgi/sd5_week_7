const REPO = 'https://github.com/Dev-jcgi/sd5_week_7/tree/main';

export default function Ejercicio() {
  const pasos = [
    ['Descarga', <>Copia <span className="mono">ejercicio/inicio/RastreadorLote.java</span> del repositorio. Solo necesitas Java 21 (sin Maven).</>],
    ['TODO 1 · Conectarse', <>Usa <span className="mono">HttpClient.newHttpClient().newWebSocketBuilder().buildAsync(servidor, new Oyente())</span>. Eso hace el handshake.</>],
    ['TODO 2 · Presentarse', <>En <span className="mono">onOpen</span>, envía <span className="mono">{'{"tipo":"hola","rol":"estudiante","nombre":"…"}'}</span> con <span className="mono">sendText</span>.</>],
    ['TODO 3 · Mostrar el lote', <>En <span className="mono">mostrar</span>, cuando el tipo sea <span className="mono">lote</span>, imprime la barra: <span className="mono">L-1042 [########....] 200/450 · ImagenProcesada</span>.</>],
    ['TODO 4 · Reconectar', <>Si se cae la conexión, espera 1 s, 2 s, 4 s, 8 s… (máximo 10 s) y vuelve a llamar a <span className="mono">conectar()</span>.</>],
    ['Probar', <><span className="mono">java RastreadorLote.java TuNombre wss://pixpro-vivo.onrender.com</span>. Teclas: <b>l</b> pide un lote de prueba, <b>c</b> lo cancela, <b>r</b> manda una reacción, <b>q</b> sale.</>],
  ];
  return (
    <div className="page ejercicio7">
      <p className="eyebrow">Ejercicio de la semana 7</p>
      <h1 className="h-lg">Rastreador de lotes en Java puro</h1>
      <p className="exp">Un cliente WebSocket de consola que se conecta al servidor de la clase, muestra el avance de los lotes de PixPro y puede cancelarlos.</p>
      <ol className="pasos7">{pasos.map(([t, d], i) => <li key={i}><b>{t}</b><p>{d}</p></li>)}</ol>
      <p className="note">¿Ves signos raros en vez de acentos o emojis en Windows? Ejecuta antes <span className="mono">chcp 65001</span> o agrega <span className="mono">-Dstdout.encoding=UTF-8</span>.</p>
      <div className="row-btns">
        <a className="btn" href={`${REPO}/ejercicio`} target="_blank" rel="noreferrer">Abrir el ejercicio en GitHub ↗</a>
        <a className="btn ghost" href={`${REPO}/servidor`} target="_blank" rel="noreferrer">Ver el servidor ↗</a>
      </div>
    </div>
  );
}
