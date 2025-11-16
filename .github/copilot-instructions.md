# Instrucciones para agentes (GitHub Copilot / AI)

Breve: Este repositorio es una pequeña API en FastAPI que sirve una SPA estática. El objetivo de un agente es ser productivo rápidamente: entender la arquitectura, saber cómo ejecutar y dónde cambiar comportamiento.

- **Arquitectura (big picture):**
  - `src/app.py`: FastAPI app principal (variable `app`). Monta ficheros estáticos en `/static` y expone la API.
  - `src/static/`: frontend estático (HTML, CSS, JS) que consume la API. `index.html` carga `app.js` que hace fetch a `/activities` y POST a `/activities/{name}/signup`.
  - Datos: almacenados en memoria en la variable `activities` dentro de `src/app.py`. No hay persistencia.

- **Endpoints clave (ejemplos reales):**
  - `GET /activities` — devuelve el diccionario `activities` (ver `src/app.py`, función `get_activities`).
  - `POST /activities/{activity_name}/signup?email=...` — añade el email al array `participants` (ver `signup_for_activity`).
  - `GET /` — redirige a `/static/index.html` (frontend montado con `app.mount("/static", ...)`).

- **Cómo ejecutar localmente (comandos reproducibles):**
  - Instala dependencias (desde la raíz del repo):

    ```bash
    pip install -r requirements.txt
    ```

  - Ejecutar servidor (recomendado con `uvicorn`):

    ```bash
    uvicorn src.app:app --reload --host 0.0.0.0 --port 8000
    ```

    > Nota: el `README` en `src/` sugiere `python app.py`, pero `src/app.py` no contiene un bloque `if __name__ == "__main__"` para arrancar el servidor. Usar `uvicorn` como arriba.

  - Accesos útiles mientras corre el servidor:
    - API docs (OpenAPI): `http://localhost:8000/docs`
    - ReDoc: `http://localhost:8000/redoc`
    - Frontend: `http://localhost:8000/static/index.html` (o `http://localhost:8000/`)

- **Ejemplos rápidos de pruebas (curl):**

  - Obtener actividades:

    ```bash
    curl http://localhost:8000/activities
    ```

  - Inscribirse en "Chess Club" con email:

    ```bash
    curl -X POST "http://localhost:8000/activities/Chess%20Club/signup?email=student@mergington.edu"
    ```

- **Patrones y convenciones de este repo (observables):**
  - Identificadores: las actividades se indexan por nombre (string), no por id numérico.
  - Validación: mínima — `signup_for_activity` solo comprueba existencia de la actividad y luego `append` del email. No hay verificación de duplicados ni límites.
  - Frontend ↔ API: la SPA asume respuestas JSON directas de `/activities` y que el POST devuelve JSON con `message` o `detail`.

- **Áreas donde un agente puede actuar productivamente (sugerencias concretas):**
  - Añadir validación de email o evitar duplicados en `src/app.py` (edita `signup_for_activity`).
  - Implementar límites: respetar `max_participants` antes de añadir un participante.
  - Añadir un `if __name__ == "__main__"` y `uvicorn.run(...)` si se quiere permitir `python src/app.py`.
  - Añadir pruebas simples (pytest) que llamen a la app con `TestClient` de FastAPI para `GET /activities` y `POST /activities/...`.

- **Dependencias e integración:**
  - `requirements.txt` contiene `fastapi` y `uvicorn`.
  - No hay servicios externos (BD, cola, etc.) — todo es in-memory.

- **Dónde mirar para cambios concretos:**
  - Lógica API: `src/app.py` (todas las rutas y la estructura `activities`).
  - Frontend examples: `src/static/app.js` para ver cómo se consumen los endpoints y qué formatos espera.
  - Documentación de referencia: `src/README.md` (describe el comportamiento esperado y endpoints).

- **Notas para PRs y estilo:**
  - Hacer PRs pequeños: cambiar validación o añadir tests en PRs separados.
  - Cuando modifiques `activities` en memoria, recuerda que los cambios no persisten entre reinicios; los tests deben crear su propio estado o usar `TestClient` para aislar pruebas.

Si quieres, aplico estos cambios creando/actualizando el fichero ahora. ¿Deseas que añada ejemplos de tests unitarios y el `if __name__ == "__main__"` sugerido en `src/app.py` como próximos pasos?
