package pixpro.vivo;

import org.json.JSONObject;

/**
 * Todos los mensajes que el servidor envía. Cada uno es un JSON con un campo "tipo".
 * Tenerlos en un solo lugar es el "protocolo" de la aplicación: el cliente sabe qué esperar.
 */
final class Mensajes {
    private Mensajes() {}

    static JSONObject de(String tipo) { return new JSONObject().put("tipo", tipo); }

    static JSONObject bienvenida(String rol, String nombre, int conectados) {
        return de("bienvenida").put("rol", rol).put("nombre", nombre).put("conectados", conectados);
    }

    static JSONObject conectados(int total) { return de("conectados").put("total", total); }

    static JSONObject reaccion(String emoji, String de) { return de("reaccion").put("emoji", emoji).put("de", de); }

    static JSONObject puntos(int total, Boolean acerto) {
        JSONObject m = de("puntos").put("total", total);
        if (acerto != null) m.put("acerto", acerto.booleanValue());
        return m;
    }

    static JSONObject traza(String de, JSONObject mensaje) { return de("traza").put("de", de).put("mensaje", mensaje); }

    static JSONObject error(String texto) { return de("error").put("mensaje", texto); }
}
