import { T, Portada, Arch, Code, Cards, Card, YPixPro, QR } from './piezas.jsx';
import { Receso, Agenda } from './extras.jsx';
import Comparador from '../components/Comparador.jsx';
import { useClase, useConexion } from '../lib/conexion.js';

/* Presentación de la Semana 7 · DS5 · WebSockets con PixPro.
   Cada columna (→) es un tema o una actividad; sus diapositivas (↓) profundizan.
   Banderas de columna que usa la página del profesor:
     act: N   → botón "Lanzar actividad N"
     juego    → botón "Iniciar Caza de píxeles"
     lote     → botón "Iniciar lote en vivo"
     podio    → botón "Mostrar podio" */

const REPO = 'https://github.com/Dev-jcgi/sd5_week_7/tree/main';
const Lista = ({ items, frag }) => <ul className="d-list">{items.map((x, i) => <li key={i} className={frag ? 'fragment' : ''}>{x}</li>)}</ul>;
const Tabla = ({ head, rows, small }) => (
  <table className={`d-tabla ${small ? 'sm' : ''}`}><thead><tr>{head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
    <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody></table>
);
const Dos = ({ children, r = '1fr 1fr' }) => <div className="d-dos" style={{ gridTemplateColumns: r }}>{children}</div>;
const Analogia = ({ titulo, children }) => <div className="d-analogia"><span className="mono">Analogía</span><h3>{titulo}</h3>{children}</div>;

/** Contador de conectados (solo se ve en la pantalla del profesor, que sí está conectada). */
function Conectados() {
  const [c] = useClase();
  const con = useConexion();
  if (con.fase === 'desconectado' && !c.conectados) return null;
  return <p className="d-vivo mono"><i /> {c.conectados} celulares conectados ahora mismo</p>;
}

function Actividad({ n, nombre, momento, min, temas }) {
  return (
    <div className="d-act" style={{ '--c': ['#FF8A3D', '#C6F33A', '#6EA8FF', '#B78CFF'][n - 1] }}>
      <p className="d-eti"><span className="pill">ACTIVIDAD {n} DE 4</span> {momento} · {min} min</p>
      <h1>{nombre}</h1>
      <Dos r="1.3fr 1fr">
        <div className="d-act-modos">
          <div><span className="mono">Cómo funciona</span><p>Las preguntas viajan del servidor a su celular por WebSocket. Respondan rápido: acertar da 500 puntos y la rapidez hasta 500 más.</p></div>
          <div><span className="mono">Dato curioso</span><p>La respuesta correcta <b>nunca</b> viaja a su celular antes de revelarla: la califica el servidor Java.</p></div>
          <div><span className="mono">Temas</span><p>{temas}</p></div>
        </div>
        <div className="d-act-qr"><QR ruta="#/vivo" size={230} /><p className="mono">#/vivo · PixPro en vivo</p><Conectados /></div>
      </Dos>
    </div>
  );
}

export const COLS = [
  /* ───────────── INICIO ───────────── */
  { id: 'inicio', titulo: 'Inicio', slides: [
    <div className="d-hero" key="p">
      <p className="d-eti">Desarrollo de Software 5 · Semana 7</p>
      <h1>Tiempo real con <em>WebSockets</em></h1>
      <p className="d-preg">Hoy PixPro deja de esperar a que le pregunten: <b>el servidor también puede hablar primero</b>.</p>
      <div className="d-hero-tags mono"><span>WebSocket vs. REST</span><span>Tiempo real</span><span>Servidor en Java</span><span>Protección</span><span>Pruebas</span></div>
      <p className="d-nav mono">→ avanzar · ↓ profundizar · ESC vista general</p>
    </div>,
    <>
      <T eti="Agenda">Dos horas: primero un juego, después PixPro</T>
      <Agenda />
      <p className="d-sub">Receso de 10 minutos a la mitad. Las actividades suman puntos y al final hay podio.</p>
    </>,
    <>
      <T eti="Conéctate ya">Su celular será parte del sistema</T>
      <Dos r="1fr 1.1fr">
        <div className="d-act-qr"><QR ruta="#/vivo" size={300} /><p className="mono">#/vivo</p><Conectados /></div>
        <Lista items={[
          <>Escaneen el código y escriban su nombre.</>,
          <>Su celular abre <b>una</b> conexión WebSocket con un servidor Java en Render… y <b>no la cierra</b> en toda la clase.</>,
          <>Por esa misma conexión les llegarán un videojuego, el avance de un lote de PixPro y las preguntas.</>,
          <>Toquen “Ver mensajes”: es lo que viaja por la conexión, como en DevTools.</>,
        ]} />
      </Dos>
    </>,
  ] },

  { id: 'a1', titulo: 'Actividad 1', act: 1, kind: 'act', slides: [
    <Actividad key="a" n={1} nombre="Despegue en tiempo real" momento="inicio" min={5} temas="Qué necesita tiempo real y por qué REST no alcanza." />,
  ] },

  /* ───────────── TEMA 1 · WEBSOCKET VS REST ───────────── */
  { id: 't1', tema: 't1', titulo: 'WebSocket vs. REST', slides: [
    <Portada key="p" tema="t1" pregunta="¿Cómo se entera tu navegador de que el lote de fotos avanzó… si nadie le avisa?" />,
    <>
      <T tema="t1" eti="Analogía">Cartas contra llamada telefónica</T>
      <Dos>
        <Analogia titulo="REST = mandar cartas">
          <p>Cada pregunta es un sobre nuevo y cada respuesta es otro sobre. El servidor <b>nunca</b> escribe primero: solo contesta.</p>
          <p className="fragment">Si quieres saber si algo cambió, tienes que volver a escribir: “¿ya?”, “¿ya?”, “¿ya?”. Eso se llama <b>polling</b>.</p>
        </Analogia>
        <Analogia titulo="WebSocket = llamada telefónica">
          <p>Se marca una vez (el <b>handshake</b>) y la línea queda abierta.</p>
          <p className="fragment">Cualquiera de los dos habla cuando quiere, incluso al mismo tiempo: eso es <b>full-duplex</b>. Nadie cuelga hasta que alguien dice adiós.</p>
        </Analogia>
      </Dos>
    </>,
    <>
      <T tema="t1" eti="Simulación">El mismo caso, tres veces</T>
      <Comparador />
    </>,
    <>
      <T tema="t1" eti="Archify">Polling contra WebSocket, paso a paso</T>
      <Arch src="rest-vs-ws" h={650} nota="Arriba REST con polling; abajo una sola conexión WebSocket" />
    </>,
    <>
      <T tema="t1" eti="Diferencias clave">REST y WebSocket, lado a lado</T>
      <Tabla head={['', 'REST (HTTP)', 'WebSocket']} rows={[
        ['Conexión', 'Una petición, una respuesta y se termina', 'Se abre una vez y se queda abierta'],
        ['¿Quién habla?', 'Solo el cliente pregunta', 'Los dos, cuando quieran (full-duplex)'],
        ['Mensajes', 'Verbos y rutas: GET /lotes/42', 'Mensajes libres: tú defines el formato (JSON)'],
        ['Estado', 'Sin estado: cada petición es independiente', 'Con estado: el servidor recuerda cada conexión'],
        ['Encabezados', '~800 bytes en cada petición', '2 a 14 bytes por mensaje'],
        ['Caché y escalado', 'Fácil (caché HTTP, balanceador)', 'Más difícil: hay conexiones vivas'],
        ['Ideal para', 'CRUD, comandos, consultas', 'Juegos, chats, avance en vivo, colaboración'],
      ]} />
    </>,
    <>
      <T tema="t1" eti="Cuándo usar cuál">No es “uno u otro”: es la herramienta correcta</T>
      <Cards cols={3}>
        <Card t="REST" c="#6EA8FF">El usuario pide algo y espera la respuesta: subir un lote, ver la factura, cambiar la contraseña.</Card>
        <Card t="SSE (Server-Sent Events)" c="#FFD166">Solo el servidor manda datos y basta un sentido: notificaciones, un tablero que se actualiza.</Card>
        <Card t="WebSocket" c="#C6F33A">Los dos lados hablan seguido y rápido: un videojuego, un chat, ver el lote y cancelarlo al instante.</Card>
      </Cards>
      <p className="d-sub fragment">En PixPro conviven: <b>REST</b> para los comandos (POST /lotes) y <b>WebSocket</b> para avisar el avance.</p>
    </>,
    <YPixPro key="y" tema="t1" items={[
      ['…mil usuarios hacen polling cada 2 segundos para ver su lote?', 'Son 500 peticiones por segundo que casi siempre responden “sin cambios”. Con WebSocket son mil conexiones quietas que solo hablan cuando hay un evento.'],
      ['…queremos que el usuario cancele un lote a la mitad?', 'Con WebSocket el aviso sube por la misma conexión al instante. Con SSE haría falta un POST aparte.'],
      ['…alguien propone pasar TODA la API de PixPro a WebSocket?', 'No conviene: REST tiene caché, códigos de estado y es fácil de escalar. WebSocket se agrega solo donde hace falta tiempo real.'],
    ]} cierre="WebSocket no reemplaza a REST: lo complementa en la última milla, hacia el navegador." />,
  ] },

  /* ───────────── TEMA 2 · TIEMPO REAL ───────────── */
  { id: 't2', tema: 't2', titulo: 'Tiempo real', juego: true, lote: true, slides: [
    <Portada key="p" tema="t2" pregunta="¿Qué tienen en común un videojuego en línea y la barra de progreso de PixPro?" />,
    <>
      <T tema="t2" eti="Vocabulario">Seis palabras para hablar de tiempo real</T>
      <Cards cols={3}>
        <Card t="Conexión persistente" c="#C6F33A">La conexión no se cierra después de cada mensaje: queda abierta minutos u horas.</Card>
        <Card t="Full-duplex" c="#C6F33A">Los dos lados pueden enviar al mismo tiempo, como en una llamada.</Card>
        <Card t="Push" c="#C6F33A">El servidor manda datos sin que se los pidan. Lo contrario es pull (preguntar).</Card>
        <Card t="Latencia" c="#FFD166">Lo que tarda un mensaje en llegar. En tiempo real se mide en milisegundos.</Card>
        <Card t="Mensaje (frame)" c="#FFD166">Cada envío viaja en un frame: texto, binario o de control (ping, pong, cierre).</Card>
        <Card t="Broadcast" c="#FFD166">Mandar el mismo mensaje a todas las conexiones a la vez.</Card>
      </Cards>
    </>,
    <>
      <T tema="t2" eti="El handshake · Archify">Empieza como HTTP y se convierte en WebSocket</T>
      <Dos r="1.25fr 1fr">
        <Arch src="handshake" h={600} />
        <div>
          <Code small lang="http" titulo="1 · el navegador pide el cambio">{`
GET /  HTTP/1.1
Host: pixpro-vivo.onrender.com
Upgrade: websocket
Connection: Upgrade
Origin: https://jcgi.lat
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13`}</Code>
          <Code small lang="http" titulo="2 · el servidor acepta">{`
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=`}</Code>
        </div>
      </Dos>
    </>,
    <>
      <T tema="t2" eti="Frames y cierre">Qué viaja por la conexión</T>
      <Dos>
        <Tabla small head={['Frame', 'Para qué']} rows={[
          ['Texto', 'Nuestros mensajes JSON: {"tipo":"mover","dx":1}'],
          ['Binario', 'Imágenes, audio, datos comprimidos'],
          ['Ping / Pong', 'Latido: “¿sigues ahí?” “sí”. Detecta conexiones muertas'],
          ['Close', 'Despedida con un código y una razón'],
        ]} />
        <Tabla small head={['Código', 'Significa']} rows={[
          ['1000', 'Cierre normal: “adiós”'],
          ['1001', 'Me voy: pestaña cerrada o servidor reiniciando'],
          ['1006', 'Se cortó sin despedirse (red o servidor caído)'],
          ['1008', 'Rompiste una regla (clave, demasiados mensajes)'],
          ['1009', 'Mensaje demasiado grande'],
        ]} />
      </Dos>
      <p className="d-sub">Referencia: RFC 6455, The WebSocket Protocol (IETF, 2011).</p>
    </>,
    <>
      <T tema="t2" eti="A jugar · 5 min">Caza de píxeles</T>
      <Dos r="1fr 1fr">
        <Lista items={[
          <>En su celular aparecen <b>cuatro flechas</b>. Manténganlas presionadas para moverse.</>,
          <>En el proyector están todos los jugadores. Atrapen el <b>píxel blanco</b>: +100 puntos.</>,
          <>Fíjense: nadie recarga nada y todos ven lo mismo al mismo tiempo.</>,
          <>Pregunta para después: ¿quién decide dónde está su punto, su celular o el servidor?</>,
        ]} />
        <div className="d-act-qr"><QR ruta="#/vivo" size={260} /><p className="mono">#/vivo</p><Conectados /></div>
      </Dos>
    </>,
    <>
      <T tema="t2" eti="Lo que acaba de pasar · Archify">Un servidor que manda en el juego</T>
      <Dos r="1.4fr 1fr">
        <Arch src="juego" h={560} />
        <Lista frag items={[
          <><b>Intención, no posición:</b> el celular solo dice “voy a la izquierda”.</>,
          <><b>Tick:</b> el servidor calcula el mundo 15 veces por segundo.</>,
          <><b>Broadcast:</b> manda la misma “foto del mundo” a todos.</>,
          <><b>Autoritativo:</b> como el servidor decide, nadie puede hacer trampa.</>,
        ]} />
      </Dos>
    </>,
    <>
      <T tema="t2" eti="Patrones de mensajes">¿A quién le mando cada mensaje?</T>
      <Cards cols={3}>
        <Card t="Uno a uno (unicast)" c="#6EA8FF">Solo a una conexión. Juego: “tus puntos son 700”. PixPro: “tu lote L-1042 va en 300/450”.</Card>
        <Card t="A todos (broadcast)" c="#C6F33A">A todas las conexiones. Juego: la foto del mundo. PixPro: “mantenimiento en 5 minutos”.</Card>
        <Card t="Por sala o tema (pub/sub)" c="#B78CFF">Solo a los suscritos. PixPro: solo quien sigue el lote L-1042 recibe sus eventos.</Card>
      </Cards>
    </>,
    <>
      <T tema="t2" eti="Ahora en PixPro · Archify">¿En qué parte de la arquitectura va el WebSocket?</T>
      <Arch src="pixpro-tiempo-real" h={650} nota="Usa las vistas 1, 2 y 3: comandos, eventos y última milla" />
    </>,
    <>
      <T tema="t2" eti="Demostración · Archify">Un lote de PixPro en vivo</T>
      <Dos r="1.4fr 1fr">
        <Arch src="lote-vivo" h={600} />
        <Lista items={[
          <>El profesor lanza un lote de 450 fotos.</>,
          <>El servidor imita al Digester: publica <span className="mono">ImagenProcesada</span> cada 250 ms.</>,
          <>Todos ven la barra avanzar <b>a la vez</b>.</>,
          <>Cualquiera puede tocar <b>Cancelar lote</b>: el aviso sube por la misma conexión y a todos les llega <span className="mono">LoteCancelado</span>.</>,
        ]} />
      </Dos>
    </>,
    <YPixPro key="y" tema="t2" items={[
      ['…el usuario tiene PixPro abierto en dos pestañas?', 'Son dos conexiones. El servicio de notificaciones manda el evento a las dos: es un broadcast a la “sala” del usuario.'],
      ['…el Digester procesa 5 000 fotos en 10 segundos?', 'No hace falta un mensaje por foto: se agrupan (una actualización cada 250 ms). Así no saturamos el navegador.'],
      ['…el usuario cierra la laptop y la abre una hora después?', 'La conexión murió (1006). Al reconectar, el cliente pide el estado actual por REST o el servidor se lo manda al saludar.'],
    ]} cierre="El juego y PixPro usan lo mismo: una conexión abierta, eventos que empuja el servidor y mensajes con un “tipo”." />,
  ] },

  { id: 'a2', titulo: 'Actividad 2', act: 2, kind: 'act', slides: [
    <Actividad key="a" n={2} nombre="Detrás del juego" momento="antes del receso" min={10} temas="Handshake, servidor autoritativo y cuándo basta SSE." />,
    <Receso key="r" />,
  ] },

  /* ───────────── TEMA 3 · SERVIDOR ───────────── */
  { id: 't3', tema: 't3', titulo: 'Servidor WebSocket', slides: [
    <Portada key="p" tema="t3" pregunta="¿Cuántas líneas de Java hacen falta para el servidor que acaban de usar?" />,
    <>
      <T tema="t3" eti="Opciones en Java">Cuatro formas de hacer un servidor WebSocket en Java</T>
      <Tabla head={['Opción', 'Qué es', '¿Cuándo?']} rows={[
        [<b>Java-WebSocket</b>, 'Librería pequeña: heredas una clase y escribes 4 métodos', 'Aprender y proyectos pequeños · la usamos hoy'],
        ['Jakarta WebSocket', 'El estándar de Java EE: @ServerEndpoint, @OnMessage', 'Si ya usas Tomcat, Payara o WildFly'],
        ['Spring WebSocket + STOMP', 'Integrado con Spring Boot; salas y suscripciones listas', 'Proyectos Spring grandes'],
        ['Netty', 'Red de bajo nivel, muy rápido', 'Miles de conexiones y control total'],
      ]} />
      <p className="d-sub">Las cuatro hablan el mismo protocolo (RFC 6455): el navegador no nota la diferencia.</p>
    </>,
    <>
      <T tema="t3" eti="Paso 1 · Maven">Agregar la librería</T>
      <Dos r="1.2fr 1fr">
        <Code lang="xml" titulo="servidor/pom.xml">{`
<dependency>
  <groupId>org.java-websocket</groupId>
  <artifactId>Java-WebSocket</artifactId>
  <version>1.6.0</version>
</dependency>
<dependency>
  <groupId>org.json</groupId>
  <artifactId>json</artifactId>
  <version>20250517</version>
</dependency>`}</Code>
        <Lista items={[
          <><b>Java-WebSocket</b>: se encarga del protocolo (handshake, frames, ping/pong).</>,
          <><b>org.json</b>: para leer y escribir los mensajes JSON.</>,
          <>Java 21. Sin Spring y sin servidor de aplicaciones: un <span className="mono">main</span> y listo.</>,
        ]} />
      </Dos>
    </>,
    <>
      <T tema="t3" eti="Paso 2 · Los 4 métodos">Un servidor de eco en 20 líneas</T>
      <Dos r="1.2fr 1fr">
        <Code titulo="EcoServer.java · lo mínimo">{`
public class EcoServer extends WebSocketServer {

  public EcoServer(int puerto) { super(new InetSocketAddress(puerto)); }

  @Override public void onOpen(WebSocket conn, ClientHandshake h) {
    conn.send("Bienvenido");             // solo a esta conexión
  }
  @Override public void onMessage(WebSocket conn, String texto) {
    broadcast("Alguien dijo: " + texto); // a TODAS las conexiones
  }
  @Override public void onClose(WebSocket conn, int codigo, String razon, boolean remoto) {
    System.out.println("Se fue: " + codigo);
  }
  @Override public void onError(WebSocket conn, Exception ex) { ex.printStackTrace(); }
  @Override public void onStart() { System.out.println("Escuchando"); }

  public static void main(String[] args) { new EcoServer(8080).start(); }
}`}</Code>
        <Cards cols={1}>
          <Card t="onOpen" c="#6EA8FF">Alguien se conectó.</Card>
          <Card t="onMessage" c="#C6F33A">Llegó un mensaje.</Card>
          <Card t="onClose" c="#FF6B8B">Alguien se fue (con un código).</Card>
          <Card t="send / broadcast" c="#FFD166">Hablarle a uno o a todos.</Card>
        </Cards>
      </Dos>
    </>,
    <>
      <T tema="t3" eti="Paso 3 · Protocolo">Nuestro idioma: mensajes JSON con un “tipo”</T>
      <Dos>
        <Tabla small head={['Celular → servidor', 'Ejemplo']} rows={[
          ['hola', '{"tipo":"hola","rol":"estudiante","nombre":"Ana"}'],
          ['mover', '{"tipo":"mover","dx":-1,"dy":0}'],
          ['respuesta', '{"tipo":"respuesta","id":"p4","opcion":1}'],
          ['cancelarLote', '{"tipo":"cancelarLote"}'],
          ['reaccion', '{"tipo":"reaccion","emoji":"🔥"}'],
        ]} />
        <Tabla small head={['Servidor → celular', 'Cuándo']} rows={[
          ['bienvenida', 'Al presentarse'],
          ['conectados', 'Alguien entra o sale (broadcast)'],
          ['mundo', '15 veces por segundo durante el juego'],
          ['lote', 'Cada evento del lote (LoteSubido, ImagenProcesada…)'],
          ['pregunta · resultado · puntos', 'En las actividades'],
        ]} />
      </Dos>
      <p className="d-sub">WebSocket no dice qué hay dentro de los mensajes: el protocolo de la aplicación lo inventamos nosotros.</p>
    </>,
    <>
      <T tema="t3" eti="Paso 4 · onMessage real">Un switch decide qué hacer con cada mensaje</T>
      <Code titulo="servidor/src/main/java/pixpro/vivo/PixProServer.java">{`
@Override
public synchronized void onMessage(WebSocket conn, String texto) {
    Cliente cliente = conn.getAttachment();          // quién es esta conexión
    JSONObject msg = new JSONObject(texto);          // el JSON que llegó
    switch (msg.optString("tipo")) {
        case "hola"         -> hola(conn, cliente, msg);
        case "mover"        -> arena.mover(cliente.nombre, msg.optInt("dx"), msg.optInt("dy"));
        case "respuesta"    -> responder(cliente, msg);
        case "cancelarLote" -> lote.cancelar(cliente.nombre);
        case "reaccion"     -> reaccion(cliente, msg);
        default -> enviar(conn, Mensajes.error("Tipo de mensaje desconocido"));
    }
}`}</Code>
    </>,
    <>
      <T tema="t3" eti="Por dentro · Archify">Las clases del servidor</T>
      <Arch src="servidor-clases" h={650} nota="Una clase heredada de la librería y clases pequeñas con una sola tarea" />
    </>,
    <>
      <T tema="t3" eti="Paso 5 · Probar en tu computadora">Correrlo y conectarse</T>
      <Dos>
        <Code lang="bash" titulo="terminal">{`
cd servidor
mvn package
PROFESOR_CLAVE=una-clave java -jar target/pixpro-vivo.jar
# 10:00:01  PixPro en vivo escuchando en el puerto 8080`}</Code>
        <Lista items={[
          <>Abre la página En vivo agregando <span className="mono">?ws=ws://localhost:8080</span> a la dirección.</>,
          <>O conéctate con el cliente Java del ejercicio: <span className="mono">java RastreadorLote.java Ana</span>.</>,
          <>En local se usa <b>ws://</b> (sin cifrar). En internet, <b>wss://</b>.</>,
        ]} />
      </Dos>
    </>,
    <>
      <T tema="t3" eti="Paso 6 · Publicar en Render · Archify">De tu computadora a internet</T>
      <Dos r="1.3fr 1fr">
        <Arch src="despliegue" h={560} />
        <Code small lang="dockerfile" titulo="servidor/Dockerfile">{`
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn -q -B -DskipTests package

FROM eclipse-temurin:21-jre
COPY --from=build /app/target/pixpro-vivo.jar .
ENV PORT=10000
CMD ["java", "-jar", "pixpro-vivo.jar"]`}</Code>
      </Dos>
      <p className="d-sub">GitHub Pages solo sirve archivos: un servidor WebSocket necesita un proceso encendido. Render (gratis) lo duerme tras 15 min sin tráfico y tarda ~1 min en despertar.</p>
    </>,
    <YPixPro key="y" tema="t3" items={[
      ['…el servicio de notificaciones de PixPro se reinicia?', 'Todas las conexiones se cierran (1001 o 1006). Los navegadores se reconectan solos con espera creciente y piden el estado actual.'],
      ['…ponemos dos copias del servidor detrás de un balanceador?', 'Un evento que llega a la copia 1 no alcanza a quien está conectado a la copia 2. Se resuelve con el broker: las dos copias se suscriben a lote.events.'],
      ['…PixPro ya usa Spring Boot?', 'Spring WebSocket con STOMP da salas y suscripciones listas. La idea es la misma: abrir, recibir, enviar, cerrar.'],
    ]} cierre="Un servidor WebSocket es un programa que guarda conexiones abiertas y reacciona a cuatro eventos." />,
  ] },

  /* ───────────── TEMA 4 · PROTECCIÓN ───────────── */
  { id: 't4', tema: 't4', titulo: 'Protección', slides: [
    <Portada key="p" tema="t4" pregunta="Si cualquiera puede abrir una conexión con tu servidor… ¿qué puede salir mal?" />,
    <>
      <T tema="t4" eti="Amenazas">Seis cosas que pueden salir mal</T>
      <Cards cols={3}>
        <Card t="Espiar" c="#FF6B8B">Con ws:// los mensajes viajan sin cifrar: cualquiera en el Wi-Fi los lee.</Card>
        <Card t="Página ajena (CSWSH)" c="#FF6B8B">Otra página abre una conexión a tu servidor desde el navegador de tu usuario.</Card>
        <Card t="Suplantar" c="#FF6B8B">Alguien dice “soy el profesor” sin serlo.</Card>
        <Card t="Inundar" c="#FFD166">Un cliente manda miles de mensajes por segundo y tumba el servidor.</Card>
        <Card t="Mensaje gigante" c="#FFD166">Un mensaje de 100 MB que llena la memoria.</Card>
        <Card t="Datos maliciosos" c="#FFD166">Un nombre con &lt;script&gt; o un movimiento dx = 9999 (trampa).</Card>
      </Cards>
    </>,
    <>
      <T tema="t4" eti="Archify">Seis capas, una por amenaza</T>
      <Arch src="seguridad" h={600} nota="Si falla una capa, la conexión se rechaza o se cierra con un código" />
    </>,
    <>
      <T tema="t4" eti="Capas 1 y 2 · wss y Origin">Cifrar y revisar de dónde viene</T>
      <Dos r="1.45fr 1fr">
        <Code titulo="PixProServer · antes de aceptar la conexión">{`
@Override
public ServerHandshakeBuilder onWebsocketHandshakeReceivedAsServer(
        WebSocket conn, Draft draft, ClientHandshake request)
        throws InvalidDataException {
    String origen = request.getFieldValue("Origin");
    if (!origen.isEmpty() && !origenesPermitidos.contains(origen)) {
        throw new InvalidDataException(
            CloseFrame.POLICY_VALIDATION, "Origen no permitido");
    }
    return super.onWebsocketHandshakeReceivedAsServer(conn, draft, request);
}
// Render: ORIGENES_PERMITIDOS=https://jcgi.lat,...`}</Code>
        <Lista items={[
          <><b>wss://</b> = WebSocket + TLS, como https. En Render el certificado lo pone Render.</>,
          <>El navegador <b>siempre</b> manda el header <span className="mono">Origin</span> y una página no lo puede falsificar.</>,
          <>Si no es nuestra página, se rechaza <b>antes</b> del 101.</>,
        ]} />
      </Dos>
    </>,
    <>
      <T tema="t4" eti="Capa 3 · Autenticar">¿Quién eres? La clave vive en el servidor</T>
      <Dos r="1.35fr 1fr">
        <Code titulo="PixProServer · hola">{`
if ("profesor".equals(msg.optString("rol"))) {
    if (!claveProfesor.equals(msg.optString("clave"))) {
        conn.close(CloseFrame.POLICY_VALIDATION, "Clave incorrecta"); // 1008
        return;
    }
    cliente.rol = Rol.PROFESOR;
}

// main: la clave sale de una variable de entorno de Render
String clave = System.getenv("PROFESOR_CLAVE");`}</Code>
        <Lista items={[
          <>La clave <b>no</b> está en el código ni en GitHub: es una variable de entorno.</>,
          <>No va en la URL (<span className="mono">?clave=</span>): las URL quedan en historiales y logs.</>,
          <>Lo mismo con las respuestas de las preguntas: viven en un <b>Secret File</b> de Render.</>,
          <>En PixPro: el token (JWT) del usuario se valida en el handshake.</>,
        ]} />
      </Dos>
    </>,
    <>
      <T tema="t4" eti="Capas 4, 5 y 6 · Límites">Poner límites a cada conexión</T>
      <Dos>
        <Code titulo="4 y 5 · límite de mensajes y tamaño">{`
// 4 · máximo 15 mensajes por segundo
if (!cliente.limite.permitir()) {
    conn.close(CloseFrame.POLICY_VALIDATION,
        "Demasiados mensajes por segundo"); // 1008
    return;
}

// 5 · máximo 16 KB por mensaje
// (la librería cierra con 1009)
new Draft_6455(Collections.emptyList(),
               16 * 1024);`}</Code>
        <Code titulo="6 · validar los datos">{`
// nombre: sin HTML, máx. 20 caracteres
String t = s.replaceAll("[<>\\"'&]", "")
            .strip();

// el juego: dx = 9999 se convierte en 1
j.dx = Integer.signum(dx);

// solo emojis conocidos
if (EMOJIS.contains(emoji)) broadcast(...);`}</Code>
      </Dos>
    </>,
    <>
      <T tema="t4" eti="Demostración">Sean un cliente tramposo</T>
      <Dos r="1fr 1fr">
        <Lista items={[
          <>En su celular abran <b>Laboratorio de seguridad</b>.</>,
          <>Toquen <b>Enviar 30 mensajes de golpe</b>.</>,
          <>El servidor los desconecta con el código <b>1008</b>: así se protege de una inundación.</>,
          <>Y en el juego: aunque manden <span className="mono">dx = 9999</span>, el servidor solo los mueve un paso.</>,
        ]} />
        <div className="d-act-qr"><QR ruta="#/vivo" size={250} /><p className="mono">#/vivo · Laboratorio</p><Conectados /></div>
      </Dos>
    </>,
    <YPixPro key="y" tema="t4" items={[
      ['…un usuario intenta seguir el lote de OTRA agencia?', 'Autorización por sala: el servicio revisa que el lote sea suyo antes de suscribirlo. Autenticar (quién eres) no es lo mismo que autorizar (qué puedes ver).'],
      ['…el token del usuario expira con la conexión abierta?', 'El servidor revisa la expiración y cierra con 1008; el cliente obtiene un token nuevo y se reconecta.'],
      ['…un bot abre 10 000 conexiones?', 'Límite de conexiones por IP o por usuario en el gateway, además del límite de mensajes por conexión.'],
    ]} cierre="Trata cada mensaje como datos de un desconocido: valida, limita y nunca confíes en el cliente." />,
  ] },

  { id: 'a3', titulo: 'Actividad 3', act: 3, kind: 'act', slides: [
    <Actividad key="a" n={3} nombre="Guardianes del servidor" momento="después de protección" min={5} temas="onMessage, Origin y códigos de cierre." />,
  ] },

  /* ───────────── TEMA 5 · PRUEBAS ───────────── */
  { id: 't5', tema: 't5', titulo: 'Pruebas', slides: [
    <Portada key="p" tema="t5" pregunta="Cuando “no llega nada”, ¿por dónde empiezas a buscar?" />,
    <>
      <T tema="t5" eti="DevTools">El navegador ya trae un depurador de WebSockets</T>
      <Dos r="1fr 1fr">
        <Lista items={[
          <><b>F12</b> → pestaña <b>Network</b> → filtro <b>WS</b>.</>,
          <>Elige la conexión: en <b>Headers</b> ves el handshake y el <b>101</b>.</>,
          <>En <b>Messages</b> ves cada mensaje: ↑ los que envías, ↓ los que recibes.</>,
          <>Si se cerró, ahí aparece el <b>código de cierre</b>.</>,
        ]} />
        <Arch src="depuracion" h={520} />
      </Dos>
    </>,
    <>
      <T tema="t5" eti="Códigos de cierre">El código te dice dónde buscar</T>
      <Tabla head={['Ves…', 'Probablemente…', 'Revisa…']} rows={[
        ['No hay 101 (403)', 'El servidor rechazó el Origin', 'ORIGENES_PERMITIDOS en Render'],
        ['La página no conecta desde https', 'Usaste ws:// en lugar de wss:// (contenido mixto)', 'La URL del servidor'],
        ['1006 al inicio de la clase', 'Render estaba dormido o reiniciando', 'Espera 1 min: el cliente reintenta solo'],
        ['1008', 'Rompiste una regla: clave o demasiados mensajes', 'El mensaje de cierre y los logs'],
        ['1009', 'Mensaje de más de 16 KB', 'Lo que estás enviando'],
        ['Conecta pero no pasa nada', 'El "tipo" del mensaje está mal escrito', 'La pestaña Messages: ¿llega un {"tipo":"error"}?'],
      ]} />
    </>,
    <>
      <T tema="t5" eti="Herramientas">Probar sin la página web</T>
      <Dos>
        <Code lang="bash" titulo="desde la terminal">{`
# Cliente Java del ejercicio (solo el JDK)
java RastreadorLote.java Ana wss://pixpro-vivo.onrender.com

# websocat: escribe JSON y ve las respuestas
websocat wss://pixpro-vivo.onrender.com
{"tipo":"hola","rol":"estudiante","nombre":"Terminal"}`}</Code>
        <Lista items={[
          <><b>Postman</b>: New → WebSocket, pegas la URL y mandas mensajes.</>,
          <><b>Logs de Render</b>: cada “Conexión abierta”, “Hola de…” y “Cerrada (código)”.</>,
          <><b>Pruebas automáticas</b> con JUnit: siguiente diapositiva.</>,
        ]} />
      </Dos>
    </>,
    <>
      <T tema="t5" eti="Prueba automática">JUnit levanta el servidor y se conecta de verdad</T>
      <Code small titulo="servidor/src/test/java/pixpro/vivo/PixProServerTest.java">{`
@Test
void demasiadosMensajesCierranLaConexion() throws Exception {
    ClientePrueba ana = estudiante("Ana");           // cliente del JDK: java.net.http.WebSocket
    for (int i = 0; i < 30; i++) ana.enviar("{\\"tipo\\":\\"reaccion\\",\\"emoji\\":\\"🚀\\"}");
    assertEquals(1008, ana.codigoDeCierre());
}

@Test
void laRespuestaCorrectaNoViajaHastaRevelar() throws Exception {
    ClientePrueba prof = profesor(), ana = estudiante("Ana");
    prof.enviar("{\\"tipo\\":\\"lanzar\\",\\"id\\":\\"p1\\"}");
    assertFalse(ana.esperar("pregunta").has("correcta"));
}`}</Code>
      <p className="d-sub">11 pruebas: bienvenida, broadcast, Origin, clave, límite, tamaño, preguntas, permisos, lote, lote de prueba y juego. <span className="mono">mvn test</span></p>
    </>,
    <>
      <T tema="t5" eti="Ejercicio de la semana">Rastreador de lotes en Java puro</T>
      <Dos r="1.2fr 1fr">
        <div>
          <Lista items={[
            <><span className="mono">ejercicio/inicio/RastreadorLote.java</span>: un cliente con <b>4 TODO</b>.</>,
            <>TODO 1 conectarse · TODO 2 presentarse con “hola” · TODO 3 mostrar la barra del lote · TODO 4 reconectar con espera creciente.</>,
            <>Solo el JDK: <span className="mono">java RastreadorLote.java TuNombre</span>. Sin Maven.</>,
            <>Pruébenlo contra su propio servidor local y contra el de la clase.</>,
          ]} />
          <p className="d-sub">Entrega: captura de su consola con la barra del lote y un lote cancelado desde su cliente.</p>
        </div>
        <div className="d-act-qr"><QR ruta="#/ejercicio" size={230} /><p className="mono"><a href={`${REPO}/ejercicio`} target="_blank" rel="noreferrer">github · ejercicio ↗</a></p></div>
      </Dos>
    </>,
  ] },

  { id: 'a4', titulo: 'Actividad 4', act: 4, kind: 'act', slides: [
    <Actividad key="a" n={4} nombre="Detectives del tiempo real" momento="antes de terminar" min={5} temas="DevTools, 1006, contenido mixto y dónde va el WebSocket en PixPro." />,
  ] },

  /* ───────────── CIERRE ───────────── */
  { id: 'cierre', titulo: 'Cierre', podio: true, slides: [
    <>
      <T eti="Cierre">Cinco ideas para llevarse</T>
      <div className="d-ocho cinco">
        {[
          ['01', 'REST pregunta y espera; WebSocket deja la línea abierta y los dos hablan.', '#FF8A3D'],
          ['02', 'Tiempo real = conexión persistente + push + mensajes con un “tipo”.', '#C6F33A'],
          ['03', 'Un servidor WebSocket son 4 eventos: onOpen, onMessage, onClose, onError.', '#6EA8FF'],
          ['04', 'wss, Origin, autenticación, límites y validación: nunca confíes en el cliente.', '#FF6B8B'],
          ['05', 'DevTools → WS → Messages, el código de cierre y una prueba que lo reproduzca.', '#B78CFF'],
        ].map(([n, t, c]) => <div key={n} className="fragment" style={{ borderColor: c }}><span className="mono" style={{ color: c }}>{n}</span><p>{t}</p></div>)}
      </div>
    </>,
    <>
      <T eti="Para la semana">Entregables y referencias</T>
      <Dos>
        <Lista items={[
          <>Ejercicio: el Rastreador de lotes funcionando (los 4 TODO).</>,
          <>En el diagrama de PixPro: marquen dónde iría el servicio de notificaciones y qué eventos escucha.</>,
          <>Una amenaza del tema 4 aplicada a PixPro y cómo la evitarían.</>,
        ]} />
        <div>
          <p className="d-eti">Referencias</p>
          <ul className="d-refs">
            <li>Fette, I. y Melnikov, A. (2011). RFC 6455: The WebSocket Protocol. IETF.</li>
            <li>MDN Web Docs. The WebSocket API (WebSockets).</li>
            <li>OWASP. WebSocket Security Cheat Sheet.</li>
            <li>TooTallNate. Java-WebSocket (GitHub).</li>
            <li>Valve. Source Multiplayer Networking (servidor autoritativo y ticks).</li>
            <li>Render Docs. Deploy for Free (inactividad de 15 minutos).</li>
          </ul>
        </div>
      </Dos>
    </>,
    <div className="d-final" key="f">
      <p className="d-eti">Marcador final</p>
      <h1>¡Gracias! <em>Podio</em> de la clase</h1>
      <p className="d-preg">El profesor toca “Mostrar podio”: el ranking lo calcula el servidor y llega a todos por WebSocket.</p>
    </div>,
  ] },
];

export const TEMA_COL = Object.fromEntries(COLS.map((c, i) => [c.tema, i]).filter(([k]) => k));
