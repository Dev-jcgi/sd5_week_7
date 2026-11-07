package pixpro.vivo;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Carga las preguntas de las actividades.
 * Las respuestas son un SECRETO: el archivo real (preguntas.json) no se sube a GitHub.
 * En Render se carga como "Secret File" y aparece en /etc/secrets/preguntas.json.
 */
final class Preguntas {
    private Preguntas() {}

    static final List<Path> RUTAS = List.of(
            Path.of("/etc/secrets/preguntas.json"), // Render (Secret File)
            Path.of("preguntas.json"),              // en tu computadora
            Path.of("preguntas.ejemplo.json"));     // ejemplo público, sin las respuestas reales

    static List<JSONObject> cargar() throws Exception {
        for (Path ruta : RUTAS) {
            if (Files.exists(ruta)) {
                Log.info("Preguntas cargadas de " + ruta);
                return leer(Files.readString(ruta));
            }
        }
        Log.info("AVISO: no hay archivo de preguntas.");
        return List.of();
    }

    static List<JSONObject> leer(String json) {
        JSONArray arr = new JSONArray(json);
        List<JSONObject> lista = new ArrayList<>();
        for (int i = 0; i < arr.length(); i++) lista.add(arr.getJSONObject(i));
        return lista;
    }
}
