package pixpro.vivo;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Las preguntas de las actividades y los puntos de cada estudiante.
 * El servidor es quien califica: la respuesta correcta nunca viaja al celular antes de revelar.
 */
class Juego {
    private final Map<String, JSONObject> preguntas = new LinkedHashMap<>();
    private final Map<String, Integer> puntos = new HashMap<>();
    private final Map<String, Boolean> acertoUltima = new HashMap<>();

    private JSONObject abierta;            // pregunta en curso (sin la respuesta)
    private long abiertaEn;
    private final Map<String, Integer> respuestas = new HashMap<>(); // nombre → opción

    Juego(List<JSONObject> lista) { lista.forEach(p -> preguntas.put(p.getString("id"), p)); }

    synchronized JSONObject listaParaProfesor() {
        JSONArray arr = new JSONArray();
        preguntas.values().forEach(p -> arr.put(new JSONObject()
                .put("id", p.getString("id")).put("actividad", p.optInt("actividad", 1)).put("texto", p.getString("texto"))));
        return Mensajes.de("preguntas").put("lista", arr);
    }

    synchronized JSONObject lanzar(String id) {
        JSONObject p = preguntas.get(id);
        if (p == null) return null;
        respuestas.clear();
        acertoUltima.clear();
        abiertaEn = System.currentTimeMillis();
        abierta = Mensajes.de("pregunta").put("id", id).put("actividad", p.optInt("actividad", 1))
                .put("texto", p.getString("texto")).put("opciones", p.getJSONArray("opciones"))
                .put("segundos", p.optInt("segundos", 20));
        return abierta;
    }

    synchronized JSONObject preguntaAbierta() { return abierta; }

    /** Cierra la pregunta en curso sin revelarla (por ejemplo, al empezar el juego). */
    synchronized void cerrarPregunta() { abierta = null; respuestas.clear(); }

    /** Guarda la primera respuesta de cada estudiante. Devuelve true si se aceptó. */
    synchronized boolean responder(String nombre, String id, int opcion) {
        if (abierta == null || !abierta.getString("id").equals(id) || respuestas.containsKey(nombre)) return false;
        if (opcion < 0 || opcion >= abierta.getJSONArray("opciones").length()) return false;
        respuestas.put(nombre, opcion);
        // Puntos: 500 por acertar + hasta 500 por rapidez.
        JSONObject p = preguntas.get(id);
        boolean ok = opcion == p.getInt("correcta");
        acertoUltima.put(nombre, ok);
        if (ok) {
            double segundos = p.optInt("segundos", 20);
            double usado = (System.currentTimeMillis() - abiertaEn) / 1000.0;
            sumar(nombre, 500 + (int) Math.round(500 * Math.max(0, 1 - usado / segundos)));
        }
        return true;
    }

    synchronized JSONObject conteo(int conectados) {
        return Mensajes.de("conteo").put("id", abierta == null ? "" : abierta.getString("id"))
                .put("respondieron", respuestas.size()).put("conectados", conectados);
    }

    synchronized JSONObject revelar() {
        if (abierta == null) return null;
        String id = abierta.getString("id");
        JSONObject p = preguntas.get(id);
        int[] votos = new int[p.getJSONArray("opciones").length()];
        respuestas.values().forEach(o -> votos[o]++);
        // Quien no respondió no acertó.
        abierta = null;
        return Mensajes.de("resultado").put("id", id).put("correcta", p.getInt("correcta"))
                .put("votos", new JSONArray(votos)).put("explicacion", p.optString("explicacion"));
    }

    synchronized Boolean acerto(String nombre) { return acertoUltima.getOrDefault(nombre, false); }

    synchronized void sumar(String nombre, int pts) { puntos.merge(nombre, pts, Integer::sum); }

    synchronized int puntosDe(String nombre) { return puntos.getOrDefault(nombre, 0); }

    /** Lugar en el ranking (1 = primero); 0 si no tiene puntos. */
    synchronized int lugarDe(String nombre) {
        Integer mios = puntos.get(nombre);
        if (mios == null) return 0;
        return 1 + (int) puntos.values().stream().filter(p -> p > mios).count();
    }

    synchronized JSONObject ranking(int max) {
        JSONArray top = new JSONArray();
        puntos.entrySet().stream().sorted((a, b) -> b.getValue() - a.getValue()).limit(max)
                .forEach(e -> top.put(new JSONObject().put("nombre", e.getKey()).put("puntos", e.getValue())));
        return Mensajes.de("ranking").put("top", top);
    }

    synchronized void reiniciar() { puntos.clear(); acertoUltima.clear(); respuestas.clear(); abierta = null; }
}
