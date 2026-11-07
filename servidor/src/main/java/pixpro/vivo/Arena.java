package pixpro.vivo;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;
import java.util.function.Consumer;

import org.json.JSONArray;
import org.json.JSONObject;

/**
 * "Caza de píxeles": un videojuego en tiempo real para entender WebSockets.
 *
 * Reglas del servidor (servidor AUTORITATIVO):
 *  - El celular solo manda su INTENCIÓN: {"tipo":"mover","dx":-1,"dy":0}.
 *  - El servidor calcula las posiciones 15 veces por segundo (tick) y manda a todos una
 *    "foto" del mundo: {"tipo":"mundo", ...}. Nadie puede teletransportarse ni hacer trampa.
 *  - Quien toca el píxel gana 100 puntos y aparece otro píxel.
 */
class Arena {
    static final int ANCHO = 1000, ALTO = 560, TICKS_POR_SEGUNDO = 15, VELOCIDAD = 14, RADIO = 34;
    private static final String[] COLORES = { "#FF8A3D", "#C6F33A", "#6EA8FF", "#B78CFF", "#7FE3C4", "#FFD166", "#FF6B8B", "#5ED0FF" };

    private final Consumer<JSONObject> broadcast;
    private final Juego juego;
    private final ScheduledExecutorService reloj = Executors.newSingleThreadScheduledExecutor(r -> {
        Thread t = new Thread(r, "reloj-" + getClass().getSimpleName());
        t.setDaemon(true); // no impide que el programa termine
        return t;
    });
    private final Random azar = new Random();
    private final Map<String, Jugador> jugadores = new LinkedHashMap<>();
    private ScheduledFuture<?> tarea;
    private int pixelX, pixelY;

    static class Jugador {
        int x, y, dx, dy, atrapados;
        final String color;
        Jugador(int x, int y, String color) { this.x = x; this.y = y; this.color = color; }
    }

    Arena(Consumer<JSONObject> broadcast, Juego juego) { this.broadcast = broadcast; this.juego = juego; }

    synchronized boolean activa() { return tarea != null; }

    synchronized void iniciar() {
        if (activa()) return;
        jugadores.clear();
        nuevoPixel();
        broadcast.accept(estado("jugando", null));
        tarea = reloj.scheduleAtFixedRate(this::tick, 0, 1000 / TICKS_POR_SEGUNDO, TimeUnit.MILLISECONDS);
    }

    synchronized void detener() {
        if (!activa()) return;
        tarea.cancel(false);
        tarea = null;
        String ganador = jugadores.entrySet().stream().max((a, b) -> a.getValue().atrapados - b.getValue().atrapados)
                .filter(e -> e.getValue().atrapados > 0).map(Map.Entry::getKey).orElse(null);
        broadcast.accept(estado("terminado", ganador));
    }

    /** Guarda la intención del jugador. Se aceptan solo -1, 0 o 1: cualquier otro valor se recorta. */
    synchronized void mover(String nombre, int dx, int dy) {
        if (!activa()) return;
        Jugador j = jugadores.computeIfAbsent(nombre,
                n -> new Jugador(60 + azar.nextInt(ANCHO - 120), 60 + azar.nextInt(ALTO - 120), COLORES[jugadores.size() % COLORES.length]));
        j.dx = Integer.signum(dx);
        j.dy = Integer.signum(dy);
    }

    /** Un "tick": mover a todos, revisar si alguien tocó el píxel y mandar la foto del mundo. */
    private synchronized void tick() {
        if (!activa()) return;
        for (Map.Entry<String, Jugador> e : jugadores.entrySet()) {
            Jugador j = e.getValue();
            j.x = Math.max(0, Math.min(ANCHO, j.x + j.dx * VELOCIDAD));
            j.y = Math.max(0, Math.min(ALTO, j.y + j.dy * VELOCIDAD));
            if (Math.hypot(j.x - pixelX, j.y - pixelY) < RADIO) {
                j.atrapados++;
                juego.sumar(e.getKey(), 100);
                broadcast.accept(Mensajes.de("atrapado").put("nombre", e.getKey()));
                nuevoPixel();
            }
        }
        JSONArray lista = new JSONArray();
        jugadores.forEach((n, j) -> lista.put(new JSONArray().put(n).put(j.x).put(j.y).put(j.color).put(j.atrapados)));
        broadcast.accept(Mensajes.de("mundo").put("jugadores", lista).put("pixel", new JSONArray().put(pixelX).put(pixelY)));
    }

    synchronized JSONObject estado(String estado, String ganador) {
        JSONObject m = Mensajes.de("juego").put("estado", estado).put("ancho", ANCHO).put("alto", ALTO);
        if (ganador != null) m.put("ganador", ganador);
        return m;
    }

    private void nuevoPixel() {
        pixelX = 40 + azar.nextInt(ANCHO - 80);
        pixelY = 40 + azar.nextInt(ALTO - 80);
    }
}
