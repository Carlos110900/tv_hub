## Cómo trabajar

Completa las misiones en orden. Cada una cambia una pieza pequeña del código que ya está implementado. Los marcadores visibles como `TODO 2` y el logo temporal indican el lugar de trabajo sin impedir que continúes con las demás misiones. Después de cada TODO, guarda el archivo, ejecuta o recarga la aplicación y observa el resultado antes de continuar.

No implementes funciones completas desde cero. El objetivo es seguir este flujo:

```text
MongoDB
→ Channel Model
→ Controller
→ GET /api/channels
→ JSON
→ Frontend
→ tarjetas de canales
```

## TODO 1 — Recuperar canales

Archivo:

`src/controllers/channel.controller.ts`

Objetivo:

Obtener desde MongoDB los canales que cumplen el filtro ya construido.

Qué completar:

Completa únicamente el método de Mongoose en la consulta de canales.

Pista:

Busca el método de Mongoose que obtiene varios documentos.

Resultado visible:

La API vuelve a responder con la lista de canales.

Cómo verificar:

Abre `GET /api/channels` en el navegador o recarga Home después de iniciar sesión.

Dificultad:

Easy

## TODO 2 — Mostrar el nombre del canal

Archivo:

`src/public/js/home.js`

Objetivo:

Mostrar el nombre de cada canal en su tarjeta.

Qué completar:

Completa solo el valor asignado al encabezado de la tarjeta.

Pista:

Inspecciona un elemento del arreglo `channels` que devuelve la API.

Resultado visible:

Cada tarjeta muestra el nombre de su canal.

Cómo verificar:

Recarga Home después de completar el TODO 1.

Dificultad:

Easy

## TODO 3 — Mostrar el logo del canal

Archivo:

`src/public/js/home.js`

Objetivo:

Mostrar la imagen asociada con cada canal.

Qué completar:

Completa solo el valor usado como origen de la imagen.

Pista:

Revisa las propiedades disponibles en cada canal.

Resultado visible:

Cada tarjeta muestra su logo.

Cómo verificar:

Recarga Home y comprueba que las imágenes aparecen en las tarjetas.

Dificultad:

Easy

## TODO 4 — Mostrar categorías

Archivo:

`src/public/js/home.js`

Objetivo:

Convertir las categorías de cada canal en texto separado por `·`.

Qué completar:

Completa únicamente la operación aplicada al arreglo de categorías.

Pista:

Busca el método de arreglos que une varios textos usando un separador.

Resultado visible:

Las categorías se leen como texto, por ejemplo `News · General`.

Cómo verificar:

Recarga Home y compara las categorías de varias tarjetas.

Dificultad:

Easy

## TODO 5 — Conectar la búsqueda

Archivo:

`src/public/js/home.js`

Objetivo:

Enviar el valor escrito al endpoint de canales ya existente.

Qué completar:

Completa solo el valor de búsqueda dentro de los parámetros de la URL.

Pista:

El backend ya acepta el parámetro `?search=...`.

Resultado visible:

Al escribir en el buscador, las tarjetas se actualizan con los canales que coinciden.

Cómo verificar:

Escribe parte de un nombre, país o categoría en el buscador de Home.

Dificultad:

Medium

## Misión opcional A — Mostrar país

Archivo:

`src/public/js/home.js`

Objetivo:

Mostrar el país de cada canal.

Qué completar:

Completa solo el valor asignado al texto de país.

Pista:

Revisa los datos de un canal devueltos por la API.

Resultado visible:

Cada tarjeta muestra un país.

Cómo verificar:

Recarga Home y revisa el texto bajo el nombre del canal.

Dificultad:

Easy

## Misión opcional C — Ordenar por nombre

Archivo:

`src/controllers/channel.controller.ts`

Objetivo:

Restaurar el campo usado por el ordenamiento alfabético predeterminado.

Qué completar:

Completa únicamente el texto del campo de ordenamiento predeterminado.

Pista:

Consulta los campos definidos por el modelo Channel.

Resultado visible:

Sin `sort=country`, la API devuelve los canales en orden alfabético.

Cómo verificar:

Abre `GET /api/channels` y compara los primeros nombres devueltos.

Dificultad:

Easy

## Misiones opcionales no incluidas

La misión de estado vacío y la de filtro por categoría no se agregan en este starter: el frontend actual no tiene su estructura de interfaz. Crearlas requeriría añadir una funcionalidad nueva, fuera del objetivo de estas misiones pequeñas.

## Estado de validación del starter

Antes de completar el TODO 1, `npm run build` falla porque el método de Mongoose todavía está incompleto. Una vez completado, la compilación puede continuar y los marcadores del frontend permiten realizar las demás misiones una por una.

Los tests de autenticación y health siguen pasando. Los dos tests de `tests/channels.test.ts` fallan intencionalmente antes de completar el TODO 1: el endpoint no puede recuperar canales mientras el método de Mongoose está pendiente. No se modificaron los tests para ocultar ese resultado.
