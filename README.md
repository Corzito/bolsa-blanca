# Bolsa Blanca

App web (PWA) para enseñar a separar residuos en la fuente y apoyar a los recicladores.
Se instala en el celular desde el navegador y funciona sin internet después de abrirla una vez.

## Secciones
- **Inicio**: buscador "¿En qué bolsa va?", las tres bolsas, la pregunta clave y el consejo del día.
- **Guía**: qué va en cada bolsa, ayudante de "limpio, seco y transformable" e infografía.
- **Reto**: juego de 10 rondas para practicar la separación.
- **Reglas**: las 4 reglas para cuidar al reciclador y los tips.
- **Seguimiento**: el reciclador registra cada casa con el mismo formato del documento, ve el resumen
  y lo exporta a Excel (CSV), lo copia o lo envía por WhatsApp. Se guarda en el celular.

## Editar contenido
Todo el texto está en `js/data.js`. Después de cambiar archivos, sube `VERSION` en `sw.js`.

## Publicar gratis en GitHub Pages
1. Crea un repositorio (por ejemplo `bolsa-blanca`) y sube todos los archivos tal cual.
2. Settings → Pages → Source: *Deploy from a branch* → `main` / `root` → Save.
3. Queda en `https://TU_USUARIO.github.io/bolsa-blanca/`.

## Instalar en el celular
- **Android (Chrome)**: abrir el link → menú ⋮ → *Instalar aplicación*.
- **iPhone (Safari)**: abrir el link → Compartir → *Agregar a inicio*.

## Logo de la organización
Guarda el logo como `assets/logo.png` (mejor con fondo transparente). Sale en Inicio y en los stickers.
El nombre que aparece abajo en el sticker se cambia en `js/data.js` → `MARCA.nombre`.

## Insignias
Cada vivienda gana insignias por visitas seguidas que cumplen: Semilla (1), Brote (3), Árbol (6) y Guardián (10).
"Cumple parcial" mantiene la racha y "No cumple" la reinicia. Los niveles se editan en `js/data.js` → `NIVELES`.