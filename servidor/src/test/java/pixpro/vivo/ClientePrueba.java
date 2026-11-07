package pixpro.vivo;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.WebSocket;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionStage;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;

import org.json.JSONObject;

/** Cliente WebSocket de prueba hecho solo con el JDK (java.net.http). Guarda lo que recibe en una cola. */
class ClientePrueba implements WebSocket.Listener {
    final BlockingQueue<JSONObject> recibidos = new LinkedBlockingQueue<>();
    final CompletableFuture<Integer> cerrado = new CompletableFuture<>();
    private final StringBuilder parcial = new StringBuilder();
    WebSocket ws;

    static ClientePrueba conectar(int puerto, String origen) {
        ClientePrueba c = new ClientePrueba();
        WebSocket.Builder b = HttpClient.newHttpClient().newWebSocketBuilder();
        if (origen != null) b.header("Origin", origen);
        c.ws = b.buildAsync(URI.create("ws://localhost:" + puerto), c).join();
        return c;
    }

    void enviar(String json) { ws.sendText(json, true).join(); }

    /** Espera (máximo 3 s) el primer mensaje con ese "tipo"; descarta los demás. */
    JSONObject esperar(String tipo) throws InterruptedException {
        long limite = System.currentTimeMillis() + 3000;
        while (System.currentTimeMillis() < limite) {
            JSONObject m = recibidos.poll(100, TimeUnit.MILLISECONDS);
            if (m != null && tipo.equals(m.optString("tipo"))) return m;
        }
        throw new AssertionError("No llegó ningún mensaje de tipo " + tipo);
    }

    int codigoDeCierre() throws Exception { return cerrado.get(3, TimeUnit.SECONDS); }

    @Override
    public CompletionStage<?> onText(WebSocket webSocket, CharSequence data, boolean last) {
        parcial.append(data);
        if (last) { recibidos.add(new JSONObject(parcial.toString())); parcial.setLength(0); }
        webSocket.request(1);
        return null;
    }

    @Override
    public CompletionStage<?> onClose(WebSocket webSocket, int statusCode, String reason) {
        cerrado.complete(statusCode);
        return null;
    }

    @Override
    public void onError(WebSocket webSocket, Throwable error) { cerrado.complete(1006); }
}
