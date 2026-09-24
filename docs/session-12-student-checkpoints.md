# Session 12, TV Hub V3, Favorites

> Referencia histórica de V3. Favorites está completo en la base V4. La práctica vigente deja incompleto solo el flujo Watch y está documentada en docs/practica-integradora-1-student-starter.md.

## Cómo trabajar

Complete las actividades en orden. Cada TODO cambia una pieza pequeña de una función que ya existe. Después de cada ejercicio, guarde el archivo, compile, ejecute la aplicación y observe el resultado.

El objetivo de la sesión es comprender cómo una interacción visual usa Route, middleware, Controller, Model y MongoDB. El navegador nunca accede a MongoDB directamente.

## Instructor, codificación en vivo

### TODO 1, conectar la ruta POST

Archivo:

`src/routes/favorite.routes.ts`

Objetivo:

Conectar la ruta que crea un favorito.

Qué completar:

Solo el método HTTP incompleto de la ruta que ya incluye `/:channelId`, `authenticate` y `addFavorite`.

Pista:

Piense en el método HTTP usado para crear un recurso.

Resultado visible:

La solicitud de agregar un favorito puede llegar al controlador autenticado.

Cómo verificar:

Complete el TODO 2, compile y pulse ☆ en Home.

Dificultad:

Easy

### TODO 2, crear el favorito

Archivo:

`src/controllers/favorite.controller.ts`

Objetivo:

Persistir el favorito validado en MongoDB.

Qué completar:

Solo el método de Mongoose que crea el documento `Favorite`.

Pista:

Busque el método de Mongoose usado para crear un documento nuevo.

Resultado visible:

Después de pulsar ☆, el canal queda guardado para el usuario autenticado.

Cómo verificar:

Registre una cuenta, pulse ☆ y consulte la colección `favorites` en MongoDB.

Dificultad:

Easy

## Estudiantes, requeridos

### TODO 3, quitar favorito

Archivo:

`src/controllers/favorite.controller.ts`

Objetivo:

Eliminar un favorito del usuario en una sola operación.

Qué completar:

Solo el método de Mongoose que busca y elimina el favorito.

Pista:

Mongoose ofrece un método que combina buscar y eliminar.

Resultado visible:

Al pulsar ★ en Home, el favorito se elimina y vuelve a mostrarse ☆.

Cómo verificar:

Guarde un canal, pulse ★ y confirme en MongoDB que desapareció el documento correspondiente.

Dificultad:

Medium

### TODO 4, elegir el método HTTP

Archivo:

`src/public/js/home.js`

Objetivo:

Elegir la solicitud correcta según el estado actual del favorito.

Qué completar:

Solo los dos textos del método HTTP dentro de `toggleFavorite`.

Pista:

Un favorito existente se quita. Un canal que todavía no es favorito se agrega.

Resultado visible:

Al pulsar una estrella vacía se guarda el canal. Al pulsar una estrella llena se quita.

Cómo verificar:

Pruebe las dos estrellas sobre el mismo canal y observe el cambio de estado.

Dificultad:

Easy

### TODO 5, mostrar el estado visual

Archivo:

`src/public/js/home.js`

Objetivo:

Mostrar una estrella distinta para favorito y no favorito.

Qué completar:

Solo los dos símbolos dentro de `favoriteButton.textContent`.

Pista:

La estrella llena representa un favorito; la estrella vacía representa un canal sin guardar.

Resultado visible:

Las tarjetas muestran su estado actual desde la primera carga de Home.

Cómo verificar:

Guarde un favorito, recargue Home y compruebe que conserva el símbolo correcto.

Dificultad:

Easy

### TODO 6A, navegar a Favorites

Archivo:

`src/public/index.html`

Objetivo:

Abrir la página dedicada de favoritos desde la navegación existente.

Qué completar:

Solo el valor incompleto de `href` en el enlace Favorites.

Pista:

La página es un archivo público llamado `favorites.html`.

Resultado visible:

El enlace Favorites abre una página sencilla titulada My Favorites.

Cómo verificar:

Desde Home, pulse Favorites y confirme que cambia la URL.

Dificultad:

Easy

### TODO 6B, cargar favoritos

Archivo:

`src/public/js/favorites.js`

Objetivo:

Recuperar los favoritos del usuario autenticado.

Qué completar:

Solo la URL incompleta de `fetch` dentro de `loadFavorites`.

Pista:

Use el endpoint de favoritos ya disponible en el backend.

Resultado visible:

La lista My Favorites muestra los canales guardados.

Cómo verificar:

Guarde uno o más canales desde Home y abra la página Favorites.

Dificultad:

Easy

### TODO 6C, mostrar el canal favorito

Archivo:

`src/public/js/favorites.js`

Objetivo:

Mostrar el nombre del Channel recuperado por el backend.

Qué completar:

Solo la propiedad incompleta dentro de `favorite.channelId`.

Pista:

El objeto `channelId` contiene el documento Channel porque el controlador ya recupera la referencia.

Resultado visible:

Cada elemento de My Favorites muestra el nombre de su canal.

Cómo verificar:

Abra Favorites después de completar el TODO 6B.

Dificultad:

Easy

### TODO 6D, quitar desde Favorites

Archivo:

`src/public/js/favorites.js`

Objetivo:

Eliminar un favorito desde la página dedicada.

Qué completar:

Solo el método HTTP de `removeFavorite`.

Pista:

Seleccione el método HTTP que elimina un recurso existente.

Resultado visible:

Al pulsar ★, el canal desaparece de la lista después de actualizarla.

Cómo verificar:

Abra Favorites, pulse ★ en un canal y confirme que la lista se vuelve a cargar sin ese canal.

Dificultad:

Easy / Medium

## Opcionales

### Opcional A, consulta de favoritos

Archivo:

`src/controllers/favorite.controller.ts`

Objetivo:

Localizar la consulta que obtiene los favoritos del usuario autenticado.

Qué completar:

No cambie código. Explique al docente qué filtro recibe `Favorite.find`.

Pista:

Observe el valor que identifica al usuario autenticado.

Resultado visible:

Puede explicar por qué cada usuario recibe solo sus propios favoritos.

Cómo verificar:

Compare la consulta con el usuario contenido en `request.auth`.

Dificultad:

Easy

### Opcional B, Channel poblado

Archivo:

`src/controllers/favorite.controller.ts`

Objetivo:

Identificar cómo Mongoose recupera el Channel relacionado.

Qué completar:

No cambie código. Identifique el argumento de `populate` y explíquelo.

Pista:

El nombre coincide con el campo que almacena la referencia al Channel.

Resultado visible:

Puede explicar por qué `favorites.js` recibe el nombre del canal sin una segunda consulta.

Cómo verificar:

Revise la respuesta de `GET /api/favorites` en las herramientas del navegador.

Dificultad:

Easy

### Opcional C, filtro de favoritos en Home

Archivo:

`src/public/js/home.js`

Objetivo:

Identificar cómo Home decide qué canales pertenecen a la fila personal.

Qué completar:

No cambie código. Explique la operación aplicada a `favoriteChannelIds`.

Pista:

Un `Set` permite comprobar si un identificador está guardado.

Resultado visible:

Puede explicar por qué la fila Your favorites contiene solo los canales del usuario.

Cómo verificar:

Guarde dos canales y compare sus identificadores con los elementos mostrados en la fila.

Dificultad:

Easy

## Notas para el instructor

Secuencia sugerida:

1. Comience en la UI y pulse ☆.
2. Siga la solicitud desde Home hasta la ruta de favoritos.
3. Muestre el middleware `authenticate` antes del controlador.
4. Complete la creación y consulte MongoDB.
5. Repita el recorrido al quitar un favorito.
6. Abra `favorites.html` y siga la consulta de listado.
7. Quite un favorito desde la página dedicada.
8. Refuerce que el frontend no accede directamente a MongoDB.

Pregunta clave:

¿Quién puede comunicarse directamente con MongoDB?

Respuesta conceptual esperada:

Los Models de Mongoose, usados por el código backend de la aplicación. `home.js` y `favorites.js` solo se comunican con endpoints HTTP.

## Estado inicial esperado

Los TODOs 1, 2 y 3 son expresiones TypeScript intencionalmente incompletas. Antes de resolverlos, `npm run build` falla y las pruebas que importan `app.ts` no pueden iniciar. Esto es esperado para el starter; no cambie ni elimine las pruebas para ocultarlo. Después de completar esos TODOs, continúe con los ejercicios visuales 4, 5 y 6.
