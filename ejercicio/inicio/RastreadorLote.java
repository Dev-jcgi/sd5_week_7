import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.WebSocket;
import java.util.Scanner;
import java.util.concurrent.CompletionStage;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Rastreador de lotes de PixPro · EJERCICIO (completa los 4 TODO).
 * Cliente WebSocket en Java puro: solo usa el JDK (java.net.http.WebSocket, Java 11+).
 *
 * Ejecutar (Java 21):  java RastreadorLote.java Ana ws://localhost:8080
 *            o en clase: java RastreadorLote.java Ana wss://pixpro-vivo.onrender.com
 * Teclas: l = pedir un lote de prueba · c = cancelar el lote · r = reacción 🚀 · q = salir
 */
public class RastreadorLote {

    static String nombre;
    static URI servidor;
    static volatile WebSocket ws;
    static volatile boolean saliendo = false;
    static int intentos = 0;

    public static void main(String[] args) throws Exception {
        nombre = args.length > 0 ? args[0] : "JavaBot";
        servidor = URI.create(args.length > 1 ? args[1] : "ws://localhost:8080");
        conectar();

        // Lo que escribas en la consola se envía por la MISMA conexión (full-duplex).
        Scanner teclado = new Scanner(System.in);
        while (teclado.hasNextLine()) {
            String t = teclado.nextLine().strip();
            if (ws == null) { System.out.println("(sin conexión todavía)"); continue; }
            switch (t) {
                case "l" -> ws.sendText("{\"tipo\":\"pedirLote\"}", true);
                case "c" -> ws.sendText("{\"tipo\":\"cancelarLote\"}", true);
                case "r" -> ws.sendText("{\"tipo\":\"reaccion\",\"emoji\":\"🚀\"}", true);
                case "q" -> { saliendo = true; ws.sendClose(WebSocket.NORMAL_CLOSURE, "adiós").join(); return; }
                default -> System.out.println("Teclas: l = pedir lote · c = cancelar · r = reacción · q = salir");
            }
        }
    }

    // TODO 1 · Conectarse al servidor (handshake)
    static void conectar() {
        System.out.println("Conectando a " + servidor + " …");
        // Pista: HttpClient.newHttpClient().newWebSocketBuilder().buildAsync(servidor, new Oyente())
        //        y si falla (.exceptionally) llama a reconectar("no se pudo conectar").

    }

    // TODO 4 · Reconectar con espera creciente (backoff): 1 s, 2 s, 4 s, 8 s… máximo 10 s
    static void reconectar(String motivo) {
        if (saliendo) return;
        ws = null;
        System.out.println("Conexión perdida (" + motivo + ").");
        // Pista: calcula la espera (1000 ms, luego 2000, 4000… máximo 10 000), duerme en otro hilo
        //        y vuelve a llamar a conectar(). Usa la variable "intentos".

    }

    /** Recibe los eventos de la conexión: abrir, mensaje, cierre y error. */
    static class Oyente implements WebSocket.Listener {
        private final StringBuilder parcial = new StringBuilder();

        // TODO 2 · Al abrir, presentarse con un mensaje "hola"
        @Override
        public void onOpen(WebSocket webSocket) {
            ws = webSocket;
            intentos = 0;
            System.out.println("Conectado ✔");
            // Pista: webSocket.sendText("{\"tipo\":\"hola\",\"rol\":\"estudiante\",\"nombre\":\"...\"}", true);
            webSocket.request(1); // "estoy listo para el siguiente mensaje"
        }

        // (TODO 3 está más abajo, en mostrar)
        @Override
        public CompletionStage<?> onText(WebSocket webSocket, CharSequence data, boolean ultimo) {
            parcial.append(data);
            if (ultimo) { // un mensaje puede llegar en pedazos (frames)
                mostrar(parcial.toString());
                parcial.setLength(0);
            }
            webSocket.request(1);
            return null;
        }

        @Override
        public CompletionStage<?> onClose(WebSocket webSocket, int codigo, String razon) {
            System.out.println("Cerrada por el servidor: " + codigo + " " + razon);
            if (codigo != WebSocket.NORMAL_CLOSURE) reconectar("código " + codigo);
            return null;
        }

        @Override
        public void onError(WebSocket webSocket, Throwable error) {
            reconectar("error: " + error.getMessage()); // aquí cae el famoso 1006
        }
    }

    /** Decide qué hacer según el "tipo" del mensaje. */
    static void mostrar(String json) {
        switch (campo(json, "tipo")) {
            case "bienvenida" -> System.out.println("Hola, " + campo(json, "nombre") + ". Conectados: " + campo(json, "conectados"));
            case "lote" -> {
                // TODO 3 · Lee "hechas", "total", "loteId" y "evento" con campo(json, ...)
                //          e imprime algo como: L-1042 [########............] 200/500 · ImagenProcesada
            }
            case "reaccion" -> System.out.println(campo(json, "de") + " reaccionó " + campo(json, "emoji"));
            case "error" -> System.out.println("Error del servidor: " + campo(json, "mensaje"));
            default -> { } // "mundo", "pregunta", etc.: este cliente los ignora
        }
    }

    static String barra(int hechas, int total) {
        int llenos = total == 0 ? 0 : hechas * 20 / total;
        return "[" + "#".repeat(llenos) + ".".repeat(20 - llenos) + "]";
    }

    /** Lee un campo de un JSON plano sin usar librerías (suficiente para este ejercicio). */
    static String campo(String json, String nombre) {
        Matcher m = Pattern.compile("\"" + nombre + "\"\\s*:\\s*(\"((?:[^\"\\\\]|\\\\.)*)\"|[-\\d.]+|true|false)").matcher(json);
        if (!m.find()) return "";
        return m.group(2) != null ? m.group(2) : m.group(1);
    }
}
