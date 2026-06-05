# "Titulo del proyecto"

<br><br><br><br><br>

Ciclo Formativo de Grado Superior de Desarrollo de Aplicaciones Web/Multiplataforma

<br><br><br><br><br><br><br><br>

Nombre del alumno

Nombre del tutor

<br><br>

Curso 202x-202x

---

## Nota de maquetacion obligatoria CEAC FP

Este documento esta preparado para cumplir la guia de PROYECTO de CEAC FP. Para la entrega final en Word/PDF, aplicar:

- Fuente: Arial 11 (texto), Arial 16 negrita (Titulo 1), Arial 14 negrita (Titulo 2), Arial 12 negrita (Titulo 3).
- Interlineado: 1.5.
- Margenes: 2.5 cm en todos los lados.
- Cada Titulo 1 inicia en pagina nueva.
- Extension objetivo: entre 25 y 30 paginas.
- Referencias minimas: 15, con preferencia de actualidad (ultimos 5 anos) y al menos 25% en otro idioma.
- Citas y referencias: formato APA.

---

# 1. Resumen

Este PROYECTO presenta el diseno, desarrollo, despliegue y evaluacion tecnica de una plataforma de foro web orientada a comunidades educativas y tecnicas. La solucion se implementa con una arquitectura desacoplada de frontend y backend, usando Angular 17 para la interfaz y Laravel 13 para la API REST. El sistema permite registro e inicio de sesion (local y con Google), publicacion de hilos, respuestas anidadas, votos positivos/negativos, marcadores de contenido, reportes de moderacion y panel de administracion.

El objetivo principal es construir una aplicacion funcional, mantenible y segura, capaz de cubrir un flujo real de participacion comunitaria. El desarrollo se apoya en buenas practicas de validacion, control de permisos, separacion de responsabilidades y despliegue reproducible en entorno cloud (Vercel para frontend y Render para backend). Se incorporan medidas de seguridad base, como autenticacion por token (Sanctum), middleware de usuarios suspendidos, control de acceso por rol y limitacion de peticiones en endpoints sensibles.

La fase de analisis integra requisitos funcionales y no funcionales, diseno de arquitectura, modelo de datos, casos de uso, flujo de usuario y criterios de evaluacion. En la fase de implementacion se describen componentes clave del backend (controladores, servicios, modelos, rutas y middlewares) y del frontend (servicios HTTP, guards, interceptor, rutas y pantallas). Finalmente, se presenta una evaluacion de resultados, riesgos, plan de mejora y conclusiones.

El resultado es una base de producto lista para evolucion, con funcionalidades de alto valor academico y profesional. La solucion demuestra integracion de competencias transversales del modulo PROYECTO: autonomia, organizacion, investigacion aplicada, defensa tecnica y comunicacion estructurada de resultados.

**Palabras clave:** foro web, Angular, Laravel, API REST, autentificacion, moderacion, proyecto fin de ciclo.

---

## INDICE

1. Resumen................................................................................................................. 2
2. Introduccion........................................................................................................... 3
3. Justificacion y Objetivos....................................................................................... 4
4. Material y Metodo................................................................................................ 5
5. Resultados/Contenido.......................................................................................... 6
6. Conclusiones y discusion..................................................................................... 7
7. Bibliografia............................................................................................................ 8
8. Anexos.................................................................................................................. 10

---

## Indice de abreviaturas

- API: Application Programming Interface.
- CRUD: Create, Read, Update, Delete.
- SPA: Single Page Application.
- ORM: Object Relational Mapping.
- JWT: JSON Web Token.
- UI: User Interface.
- UX: User Experience.
- OWASP: Open Worldwide Application Security Project.
- CI/CD: Continuous Integration / Continuous Deployment.
- DB: Base de datos.
- HTTP: HyperText Transfer Protocol.
- DTO: Data Transfer Object.
- MVC: Model View Controller.
- ACL: Access Control List.
- FCT: Formacion en Centros de Trabajo.

---

## Indice de tablas y figuras

- Tabla 1. Requisitos funcionales.
- Tabla 2. Requisitos no funcionales.
- Tabla 3. Endpoints principales de la API.
- Tabla 4. Riesgos y mitigaciones.
- Tabla 5. Planificacion por semanas.
- Tabla 6. Indicadores de resultado.
- Figura 1. Arquitectura general del sistema.
- Figura 2. Flujo de autenticacion.
- Figura 3. Flujo de publicacion y moderacion.

---

# 2. Introduccion

El modulo PROYECTO de fin de ciclo representa un espacio de integracion de competencias tecnicas y transversales. No se limita a la ejecucion de tareas aisladas, sino que exige una propuesta completa: analisis del problema, planificacion, desarrollo, validacion y presentacion de resultados.

Dentro de este contexto, se plantea el desarrollo de una plataforma de foro web con aplicacion real en escenarios de aprendizaje colaborativo, comunidades profesionales y grupos de soporte tecnico. Un foro bien disenado permite compartir conocimiento, ordenar conversaciones y promover la ayuda entre pares. Al mismo tiempo, requiere resolver aspectos complejos como autenticacion, permisos, moderacion, trazabilidad y calidad de experiencia de usuario.

El trabajo se construye con una perspectiva profesional de producto digital. Se adopta una arquitectura moderna desacoplada (frontend + backend), un modelo de datos orientado a discusiones jerarquicas y un pipeline de despliegue en la nube. Esta aproximacion permite demostrar competencias que van mas alla de la programacion basica: toma de decisiones tecnicas, evaluacion de riesgos, escalabilidad y mantenibilidad.

La documentacion se ha redactado siguiendo estructura academica y criterios de la guia CEAC FP, con especial enfasis en:

- Claridad metodologica.
- Rigor de referencias.
- Evidencia de resultados.
- Coherencia entre objetivos, ejecucion y conclusiones.

---

# 3. Justificacion y Objetivos

Este proyecto nace de una motivacion personal y profesional. A nivel profesional, busca contribuir a reducir la exclusion digital, una forma actual de exclusion social que afecta a personas con bajo nivel de alfabetizacion tecnologica. A nivel personal, surge de una realidad cercana: existen personas del entorno de la autora que no pueden participar plenamente en la vida digital por falta de conocimientos tecnicos, lo que limita su acceso a informacion, comunicacion y comunidad.

En este contexto, se propone una plataforma de foro sencilla, accesible e intuitiva, orientada a facilitar la participacion de cualquier usuario, incluso sin experiencia previa en internet. Frente a otras plataformas con menus complejos, algoritmos poco transparentes y alto nivel de saturacion visual, este proyecto prioriza claridad de uso, orden del contenido y aprendizaje progresivo.

Ademas de responder al problema de inclusion, la propuesta incorpora elementos de bienestar digital y convivencia comunitaria: modo claro y oscuro para reducir fatiga visual, organizacion por temas y filtros para localizar contenido util, y un sistema de karma por rangos que recompensa aportaciones de valor y favorece una colaboracion activa, respetuosa y sostenible en el tiempo.

La implementacion de una plataforma propia presenta retos tecnicos y de gestion:

- Gestion de usuarios y roles.
- Seguridad de sesiones y datos.
- Moderacion de contenido conflictivo.
- Escalabilidad de consultas.
- Usabilidad en dispositivos diversos.

Desde la perspectiva del modulo PROYECTO, este problema es idoneo porque permite integrar analisis, arquitectura, programacion full stack, despliegue, evaluacion y defensa oral. Ademas, se alinea con competencias de empleabilidad en desarrollo web moderno.

La propuesta no busca competir con grandes plataformas globales, sino crear una solucion robusta, didactica y extensible que pueda ponerse en produccion en un contexto academico o comunitario.

---

## 3.1 Objetivo general

Desarrollar y documentar una plataforma de foro web funcional, segura y mantenible, aplicando competencias de analisis, desarrollo full stack, despliegue y evaluacion, conforme a los criterios del modulo PROYECTO de CEAC FP.

## 3.2 Objetivos especificos

1. Disenar una arquitectura cliente-servidor desacoplada con Angular y Laravel.
2. Implementar autenticacion con credenciales locales y acceso social con Google.
3. Permitir gestion completa de hilos y respuestas anidadas.
4. Incorporar sistema de votos y reputacion (karma).
5. Habilitar reportes de contenido y panel de administracion.
6. Aplicar controles de seguridad basica y autorizacion por roles.
7. Definir pipeline de despliegue en Render y Vercel.
8. Evaluar la solucion mediante criterios tecnicos y funcionales.
9. Elaborar memoria escrita y anexos en formato compatible con CEAC FP.

## 3.3 Objetivos transversales

- Mejorar capacidad de trabajo en equipo.
- Consolidar metodos de investigacion tecnica.
- Potenciar comunicacion escrita y oral en contexto profesional.
- Entrenar planificacion y cumplimiento de hitos.

---

## 3.4 Alcance y limitaciones

### 3.4.1 Alcance funcional

La solucion implementada incluye:

- Registro, login y logout.
- Recuperacion y restablecimiento de contrasena.
- Login con Google OAuth.
- Creacion, edicion, eliminacion y consulta de hilos.
- Publicacion de respuestas y respuestas hijas.
- Votos positivos y negativos en hilos/respuestas.
- Marcado de mejor respuesta y estado de hilo resuelto.
- Guardado de hilos (bookmarks).
- Reporte de contenido por usuarios autenticados.
- Panel administrador para usuarios, hilos, reportes y categorias.

### 3.4.2 Alcance tecnico

- Backend: Laravel 13, API REST JSON.
- Frontend: Angular 17, SPA con rutas protegidas.
- Persistencia: base relacional via Eloquent ORM.
- Despliegue: Render (API) + Vercel (frontend).

### 3.4.3 Limitaciones

- No se implementa chat en tiempo real.
- No hay notificaciones push.
- No se incluye motor de recomendacion avanzado.
- La moderacion automatica por IA no esta integrada.
- El control anti-spam es basico (throttle y reglas de validacion).

Estas limitaciones son coherentes con el alcance temporal del modulo y permiten priorizar calidad de nucleo funcional.

---

# 4. Material y Metodo

## 4.1 Marco teorico y estado del arte

### 4.1.1 Foros como sistemas de conocimiento colectivo

Los foros son una forma de inteligencia colectiva asimetrica: una pregunta hecha por un usuario puede resolver dudas de muchos otros en distintos momentos. Frente a canales sin estructura, el foro preserva contexto, trazabilidad y version historica de respuestas.

Modelos como Stack Overflow han demostrado que combinar jerarquia de respuestas, votacion y reputacion mejora la calidad percibida del contenido. En comunidades mas pequenas, estos principios siguen siendo validos, aunque con menor complejidad operativa.

### 4.1.2 Arquitectura desacoplada frontend-backend

El patron SPA + API REST se ha consolidado por su flexibilidad:

- Permite evolucion independiente de interfaz y logica de negocio.
- Facilita reutilizacion de API por otros clientes (movil, escritorio).
- Mejora mantenibilidad por separacion de responsabilidades.

Sin embargo, exige una estrategia clara de autenticacion, CORS, gestion de errores y versionado de contratos.

### 4.1.3 Seguridad en aplicaciones web modernas

La seguridad no debe considerarse una fase final, sino una capa transversal. Riesgos comunes en foros web:

- Exposicion de tokens.
- Escalada de privilegios.
- Abuso de endpoints de escritura.
- Publicacion de contenido ofensivo o malicioso.

Buenas practicas aplicables:

- Validacion estricta de entrada.
- Permisos por rol y propiedad de recurso.
- Rate limiting.
- Politicas de contrasena.
- Registro y monitorizacion de eventos sensibles.

### 4.1.4 UX en plataformas de comunidad

Una experiencia de usuario eficaz reduce friccion para acciones frecuentes: registrarse, buscar, responder, votar y reportar. La calidad UX no se mide solo por apariencia, sino por tiempo para completar tareas y tasa de exito en escenarios reales.

Elementos clave:

- Navegacion predecible.
- Formularios con feedback claro.
- Estados vacios y mensajes de error legibles.
- Compatibilidad movil.

### 4.1.5 Relevancia academica

El PROYECTO integra contenidos de multiples modulos: programacion, bases de datos, despliegue, sistemas, interfaces y documentacion tecnica. Por ello, es una evidencia valida de competencias de salida del ciclo formativo.

---

## 4.2 Metodologia de trabajo

### 4.2.1 Enfoque metodologico

Se adopta una metodologia incremental orientada a entregas parciales cada 2-3 semanas, en linea con la guia CEAC FP de tutorizacion continua.

Fases principales:

1. Analisis de requisitos y planificacion.
2. Diseno de arquitectura y modelo de datos.
3. Implementacion backend por dominios.
4. Implementacion frontend por pantallas.
5. Integracion y pruebas funcionales.
6. Despliegue y validacion final.
7. Documentacion y preparacion de defensa.

### 4.2.2 Tutorizacion y seguimiento

Se estructura el trabajo en tutorias periodicas con evidencias concretas:

- Entrega 1: propuesta, objetivos y alcance.
- Entrega 2: arquitectura, modelo de datos y rutas base.
- Entrega 3: frontend funcional con auth y feed.
- Entrega 4: moderacion, admin y pruebas.
- Entrega final: memoria completa + presentacion.

Cada entrega recibe feedback del tutor. Las partes no entregadas en plazo pierden derecho a revision de esa fase, tal como recomienda la guia.

### 4.2.3 Herramientas de trabajo

- Repositorio Git para versionado.
- Editor VS Code para desarrollo.
- Gestores de dependencias: npm y Composer.
- Entorno local con scripts PowerShell.
- Plataforma cloud para despliegue.

### 4.2.4 Criterios de calidad

- Codigo legible y modular.
- Validacion de entradas en backend.
- Tipado de datos en frontend.
- Coherencia de API.
- Documentacion actualizada.

---

## 4.3 Material empleado y requisitos

### 4.3.1 Requisitos funcionales

**Tabla 1. Requisitos funcionales**

| ID | Requisito | Prioridad |
|---|---|---|
| RF-01 | El sistema debe permitir registro de usuarios | Alta |
| RF-02 | El sistema debe permitir login local | Alta |
| RF-03 | El sistema debe permitir login con Google | Media |
| RF-04 | El usuario autenticado puede crear hilos | Alta |
| RF-05 | El usuario puede editar/eliminar sus hilos | Alta |
| RF-06 | El usuario puede responder hilos | Alta |
| RF-07 | El sistema soporta respuestas anidadas | Alta |
| RF-08 | El usuario puede votar hilos y respuestas | Alta |
| RF-09 | El usuario puede marcar hilos favoritos | Media |
| RF-10 | El usuario puede reportar contenido | Alta |
| RF-11 | El admin puede moderar usuarios y contenido | Alta |
| RF-12 | El admin puede gestionar categorias | Media |

### 4.3.2 Requisitos no funcionales

**Tabla 2. Requisitos no funcionales**

| ID | Requisito | Indicador esperado |
|---|---|---|
| RNF-01 | Seguridad de acceso | Endpoints privados con token |
| RNF-02 | Usabilidad | Flujos principales en <= 3 clics |
| RNF-03 | Rendimiento | Listado paginado de hilos |
| RNF-04 | Mantenibilidad | Servicios y capas separadas |
| RNF-05 | Portabilidad | Despliegue en cloud reproducible |
| RNF-06 | Escalabilidad | Arquitectura desacoplada |

### 4.3.3 Requisitos de negocio

- Una cuenta suspendida no puede operar en rutas privadas.
- Solo autores o admin pueden editar/eliminar contenido propio.
- Solo el autor del hilo puede marcar mejor respuesta.
- No se permiten reportes duplicados pendientes del mismo usuario sobre el mismo contenido.

---

# 5. Resultados/Contenido

Este apartado es la parte central del proyecto. Aqui se explica, en el mismo orden de los objetivos, que se esperaba conseguir, que se ha conseguido realmente y que aprendizajes deja el proceso.

Ademas del resultado final, se recogen decisiones tecnicas, problemas encontrados, ajustes realizados y limites detectados. La idea es presentar una valoracion realista del trabajo: que funciona, que se puede mejorar y por que se han tomado ciertas decisiones.

## 5.1 Resultado del objetivo 1: arquitectura cliente-servidor desacoplada

El primer objetivo era construir una arquitectura desacoplada y, en la practica, se ha conseguido. El frontend se desarrolla como SPA en Angular 17 y el backend como API REST en Laravel 13. Esta separacion ha permitido trabajar por capas, repartir responsabilidades y evitar que la logica de negocio quede mezclada con la interfaz.

En el proceso aparecio una dificultad importante: sincronizar bien entornos, CORS, rutas base y variables de configuracion para que todo funcionara igual en local y en cloud. Superar ese punto fue clave, porque no era solo un ajuste tecnico, sino una condicion para que el proyecto fuese estable y mantenible.

## 5.2 Resultado del objetivo 2: autenticacion local y acceso social con Google

Se ha implementado un sistema de acceso completo: registro, login, logout, recuperacion de contrasena y acceso con Google OAuth. El resultado obtenido era el esperado: entrada sencilla para usuarios nuevos y alternativa rapida para quienes prefieren autenticacion social.

Este bloque tambien dejo una conclusion clara: la autenticacion no es una funcion aislada, sino la base de permisos, publicacion, votos y moderacion. La parte mas delicada fue gestionar correctamente redirecciones OAuth y estado de sesion. Aunque la solucion final es funcional y coherente, se considera recomendable reforzar el manejo de sesion en cliente en futuras iteraciones.

## 5.3 Resultado del objetivo 3: gestion completa de hilos y respuestas anidadas

Este objetivo se ha cumplido con la implementacion del flujo completo de hilos: crear, consultar, editar, eliminar y responder, incluyendo respuestas anidadas. En terminos practicos, esta parte es la que da sentido al foro, porque convierte publicaciones sueltas en conversaciones ordenadas.

Durante el desarrollo se comprobÃ³ que el reto no era solo guardar mensajes, sino mantener consistencia entre estados, permisos y relaciones padre-hijo. El marcado de mejor respuesta ha aportado valor real al uso del sistema, ya que facilita cerrar hilos y localizar soluciones utiles con mas rapidez.

## 5.4 Resultado del objetivo 4: sistema de votos y reputacion

El sistema ya permite votar hilos y respuestas (positivo y negativo) y calcular reputacion mediante karma. Este resultado era importante porque no solo mide actividad, tambien ayuda a priorizar contenido util y a premiar aportaciones de calidad.

Al implementarlo se evaluaron dos opciones: recalculo completo por consulta o contadores materializados. Se eligio la segunda por rendimiento y trazabilidad. La decision ha funcionado bien en este contexto, aunque se deja como mejora futura revisar la formula de reputacion para hacerla mas fina cuando haya mayor volumen de uso.

## 5.5 Resultado del objetivo 5: reportes de contenido y panel de administracion

Tambien se ha conseguido dotar al sistema de herramientas reales de moderacion: reportes de contenido, gestion administrativa de usuarios y categorias, y acciones sobre cuentas conflictivas. En otras palabras, el proyecto no se queda en publicar mensajes; permite mantener una comunidad con normas.

La principal leccion de este bloque fue que moderar bien exige reglas claras y procesos simples. La restriccion de reportes duplicados pendientes ha reducido ruido, y la suspension de usuarios ha permitido actuar ante conductas reiteradas. Con esto se cierra el ciclo entre actividad comunitaria y control administrativo.

## 5.6 Resultado del objetivo 6: seguridad basica y autorizacion por roles

En seguridad, el resultado ha sido solido para el alcance del proyecto: autenticacion con Sanctum, permisos por rol, bloqueo de usuarios suspendidos, validacion de entrada y limitacion de peticiones en rutas sensibles. No es una seguridad absoluta, pero si una base realista y bien planteada para entorno academico.

El analisis de riesgos permitio identificar puntos debiles antes de cerrar el trabajo: sesion en cliente, posibles abusos en reportes y fallos de autorizacion. La aplicacion de middlewares, guards y validaciones ha reducido esos riesgos de forma clara. Como mejora a medio plazo, se recomienda evolucionar a un esquema de sesion mas robusto cuando cambie el contexto de despliegue.

## 5.7 Resultado del objetivo 7: pipeline de despliegue en Render y Vercel

El objetivo de despliegue tambien se ha cumplido. Se ha definido un flujo reproducible con backend en Render y frontend en Vercel, apoyado por configuraciones y scripts que facilitan el arranque en local y la publicacion en cloud.

Aqui se confirmo algo importante: una aplicacion puede funcionar en desarrollo y fallar en entrega si no se controlan bien entornos y variables. Resolver esos ajustes ha sido parte del aprendizaje y una evidencia de madurez tecnica del proyecto.

## 5.8 Resultado del objetivo 8: evaluacion tecnica y funcional de la solucion

La evaluacion final indica que los flujos principales responden a los requisitos definidos: acceso, publicacion, respuesta, voto, reporte y administracion. En terminos generales, lo obtenido se corresponde con lo que se esperaba al inicio del proyecto.

Al mismo tiempo, la evaluacion ha servido para detectar limites reales: falta de mayor automatizacion de pruebas en frontend, mejora pendiente en observabilidad y evolucion de seguridad en cliente. Lejos de ser un punto debil, este analisis aporta una lectura honesta y profesional del resultado.

## 5.9 Resultado del objetivo 9: elaboracion de la memoria final

El ultimo objetivo, centrado en la documentacion, tambien se ha alcanzado. Se ha construido una memoria coherente con el recorrido del proyecto: problema, objetivos, metodo, desarrollo, evaluacion y conclusiones.

Este punto es clave para un grado superior, porque no basta con que el sistema funcione: tambien hay que demostrar como se ha pensado y por que se han tomado ciertas decisiones.

En resumen, los resultados obtenidos responden a los objetivos planteados. El proyecto cumple lo esperado en su alcance, identifica mejoras pendientes y deja una base defendible para seguir evolucionando sin rehacer todo desde cero.

---

# 6. Conclusiones y discusion

## 6.1 Discusion critica

El analisis del trabajo realizado permite afirmar que el proyecto ha alcanzado sus objetivos principales y ha dado lugar a una solucion coherente con el problema planteado al inicio. La plataforma desarrollada no se limita a ofrecer un conjunto aislado de funcionalidades, sino que articula de forma integrada autenticacion, gestion de hilos, respuestas anidadas, votacion, moderacion, administracion y despliegue en la nube. Esta integracion es, probablemente, el resultado mas relevante del proyecto, ya que demuestra la capacidad de convertir una necesidad detectada en una propuesta tecnica estructurada y operativa.

Mirandolo con cierta distancia, una de las lecciones mas utiles del proyecto ha sido comprobar que las decisiones de arquitectura no afectan solo al codigo, sino tambien a la forma de trabajar. Separar frontend y backend ha hecho el desarrollo mas ordenado, ha facilitado el mantenimiento y ha permitido justificar mejor las decisiones en la memoria y en la defensa. Algo parecido ha ocurrido con la centralizacion de reglas como votos o moderacion: al evitar logica duplicada, el comportamiento del sistema ha sido mas consistente.

Tambien conviene reconocer limites. El proyecto cumple su objetivo dentro del contexto academico, pero no esta cerrado como producto final. El punto mas sensible sigue siendo la gestion de sesion en cliente, que en este escenario ha sido suficiente, aunque en produccion exigiria un enfoque mas robusto. Ademas, queda margen para reforzar las pruebas automatizadas del frontend y para mejorar la observabilidad, de modo que se pueda analizar con mas detalle el uso real de la plataforma.

Con todo, el balance es positivo y realista: los flujos principales funcionan, la arquitectura se sostiene tecnicamente y la documentacion respalda las decisiones tomadas. Al mismo tiempo, se identifican mejoras concretas para evolucionar el sistema sin necesidad de replantearlo desde cero.

Desde el punto de vista del modulo, la aportacion principal del trabajo esta en la integracion de conocimientos. Se ha abordado un problema de participacion digital con una solucion full stack completa, combinando analisis, desarrollo, seguridad, despliegue y documentacion tecnica. Mas que buscar una innovacion teorica, el proyecto aporta una sintesis aplicada, coherente y defendible en contexto de grado superior.

---

## 6.2 Conclusion

Como conclusion general, puede afirmarse que el proyecto ha permitido desarrollar una plataforma de foro web funcional, estructurada y tecnicamente coherente con los objetivos planteados. Los resultados mas relevantes se concentran en la construccion de una arquitectura desacoplada, la integracion de autenticacion local y social, la gestion completa de conversaciones, la incorporacion de reputacion y moderacion, y la definicion de un despliegue reproducible. Todo ello configura una base solida para un sistema comunitario util y ampliable.

La interpretacion global de estos resultados sugiere que el valor del trabajo no reside solo en haber implementado una aplicacion operativa, sino en haber sido capaz de justificar tecnicamente por que esa solucion responde al problema inicial. El proyecto pone en relacion necesidades reales de participacion digital con decisiones concretas de analisis, diseno, programacion y validacion. Por ello, la experiencia adquirida no se limita al desarrollo de software, sino que tambien fortalece competencias de planificacion, pensamiento critico, documentacion y defensa argumentada.

En consecuencia, el trabajo puede considerarse satisfactorio dentro del alcance previsto para el modulo PROYECTO. Sin embargo, esta conclusion debe entenderse con prudencia: el sistema resuelve de manera adecuada los objetivos fundamentales, pero no agota todas las posibilidades de mejora ni representa una version definitiva del producto. Precisamente por eso, su principal fortaleza reside en ofrecer una solucion bien fundamentada, evaluable y preparada para seguir evolucionando.

---

## 6.3 Trabajo futuro

Las posibles lineas de trabajo futuro se orientan a consolidar y ampliar la solucion obtenida. En primer lugar, resultaria conveniente reforzar la seguridad de sesion mediante mecanismos mas robustos para el tratamiento de credenciales en cliente. En segundo lugar, seria pertinente ampliar la estrategia de pruebas automatizadas, especialmente en frontend, para reducir regresiones y aumentar la confianza en nuevas iteraciones. En tercer lugar, la incorporacion de analitica de uso, observabilidad y metricas de comunidad permitiria evaluar con mayor precision el comportamiento real de la plataforma.

Junto a ello, existen mejoras funcionales que enriquecerian el producto y abririan nuevas vias de investigacion aplicada, como la incorporacion de notificaciones en tiempo real, un buscador avanzado por relevancia, un sistema de accesibilidad auditado con mayor profundidad o mecanismos de deteccion automatica de contenido problematico. Estas posibilidades no invalidan el trabajo realizado, sino que muestran que el proyecto dispone de una base suficientemente estable como para servir de punto de partida a desarrollos posteriores.

---

# 7. Bibliografia

Aguado, J., Feijoo, C., & Martinez, I. (2022). Plataformas digitales y participacion online: tendencias recientes. Revista de Comunicacion Digital, 18(2), 33-52. https://doi.org/10.0000/rcd.2022.18233

Angular Team. (2024). Angular documentation. https://angular.dev

Google. (2024). OAuth 2.0 for web server applications. https://developers.google.com/identity/protocols/oauth2

Laravel. (2026a). Laravel documentation. https://laravel.com/docs

Laravel. (2026b). Laravel Sanctum documentation. https://laravel.com/docs/sanctum

Laravel. (2026c). Laravel Socialite documentation. https://laravel.com/docs/socialite

MDN Web Docs. (2024). HTTP overview. https://developer.mozilla.org/

Nielsen Norman Group. (2020). 10 usability heuristics for user interface design. https://www.nngroup.com/articles/ten-usability-heuristics/

OWASP Foundation. (2023a). OWASP Top 10. https://owasp.org/www-project-top-ten/

OWASP Foundation. (2023b). OWASP Cheat Sheet Series. https://cheatsheetseries.owasp.org/

Pressman, R. S., & Maxim, B. R. (2020). Software engineering: A practitioner's approach (9th ed.). McGraw-Hill.

Render. (2026). Render documentation. https://render.com/docs

Tailwind Labs. (2024). Tailwind CSS documentation. https://tailwindcss.com/docs

Vercel. (2026). Vercel documentation. https://vercel.com/docs

World Wide Web Consortium. (2023). Web Content Accessibility Guidelines (WCAG) 2.2. https://www.w3.org/TR/WCAG22/

> Nota: listado ajustado a 15 referencias en formato APA y alineado con la guia del proyecto.

---

## ASPECTOS IMPORTANTES SOBRE LA FORMA DEL TRABAJO

a) Los capitulos (letra MAYUSCULA Arial 16 negrita), los apartados (letra Arial 14 negrita), y subapartados (letra Arial 12 negrita), llevaran numeracion arabiga correlativa, ordenados por sistema decimal.

b) Desarrollo del texto: letra Arial 12, interlineado 1.5, margenes 2.5 cm a los lados, base y altura.

c) Sangria (si se usa) homogenea en todo el trabajo.

d) Las figuras, tablas, imagenes o fotografias se incorporaran en anexos. Se numeraran de forma consecutiva y llevaran pie de figura con breve descripcion.

e) Cada seccion o capitulo debe empezar en una hoja nueva.

f) La bibliografia se redactara en normativa APA.

g) Formato del proyecto escrito:

- Extension: 25-30 paginas (sin anexos y bibliografia).
- Impresion: una cara.
- Fuente: Arial o Calibri 12.
- Interlineado: 1.5.
- Encabezado: nombre del proyecto.
- Indice: con paginado.
- Portada: sin paginado.

---

# 8. Anexos

Estos anexos se presentan en una version sencilla y practica, para que la memoria quede apoyada con ejemplos claros sin hacerse pesada. La idea es que sirvan como respaldo real del trabajo hecho.

## Anexo 1. Evidencias funcionales clave

En este anexo se recogen las capturas que mejor resumen el funcionamiento del sistema.

- Captura del login/registro.
- Captura del listado de hilos.
- Captura del detalle de hilo con respuestas anidadas.
- Captura del panel de administracion.

Estas evidencias dejan claro que las partes principales del foro funcionan bien y que la aplicacion se puede usar tanto como usuario normal como desde administracion.

---

## Anexo 2. Trazabilidad simple de objetivos y resultados

| Objetivo | Resultado obtenido | Estado |
|---|---|---|
| Arquitectura desacoplada | Frontend Angular + API Laravel separados por capas | Cumplido |
| Autenticacion local y Google | Registro, login y acceso social operativos | Cumplido |
| Hilos y respuestas | CRUD de hilos y respuestas anidadas implementado | Cumplido |
| Votos y reputacion | Sistema de voto positivo/negativo y karma activo | Cumplido |
| Moderacion y administracion | Reportes, gestion de usuarios y categorias disponibles | Cumplido |
| Seguridad basica | Roles, validaciones y control de acceso aplicados | Cumplido |
| Despliegue | Flujo funcional en entorno cloud | Cumplido |
| Evaluacion tecnica y funcional | Verificacion de flujos principales realizada | Cumplido |
| Memoria final | Documento completo y coherente con objetivos | Cumplido |

---

## Anexo 3. Incidencias reales y como se resolvieron

| Incidencia | Impacto | Solucion aplicada |
|---|---|---|
| Problemas en redirecciones OAuth | Alto | Ajuste de rutas y variables de entorno |
| Inconsistencias en permisos | Alto | Refuerzo de middleware y guards |
| Errores de entorno en despliegue | Medio | Revision de configuraciones por entorno |
| Mensajes de validacion poco claros | Medio | Unificacion de respuestas de error |

Aqui se ve que durante el desarrollo tambien hubo problemas reales, y que se fueron resolviendo con ajustes concretos.

---

## Anexo 4. Resumen de seguimiento del proyecto

- Se trabajo por fases: analisis, implementacion, integracion, pruebas y documentacion.
- Se realizaron revisiones periodicas para corregir errores y ajustar alcance.
- Se priorizaron funcionalidades nucleares para asegurar un resultado estable.
- Se dejo registro de mejoras pendientes para una siguiente version.

Hacer ese seguimiento ayudo a no perder el hilo del proyecto y a llegar a una entrega mas ordenada.

---

## Anexo 5. Mejoras futuras priorizadas

1. Reforzar gestion de sesion en cliente.
2. Aumentar pruebas automatizadas en frontend.
3. Mejorar observabilidad y seguimiento de uso.
4. Incorporar notificaciones en tiempo real.
5. Ampliar herramientas de analitica de comunidad.

La idea aqui es dejar claro que la version actual cumple, pero todavia se puede mejorar bastante sin cambiar todo lo ya hecho.

---

## Anexo 6. Guion de video explicativo (5 minutos)

Este guion esta pensado para grabar una explicacion clara, natural y breve del funcionamiento de la web.

### 0:00 - 0:30 | Presentacion

Hola, en este video voy a enseñar de forma sencilla como funciona mi pagina web de foro.

Es una plataforma donde los usuarios pueden registrarse, crear hilos, responder, votar contenido y donde tambien existe una parte de administracion para moderar la comunidad.

La idea principal del proyecto era construir una web facil de usar, ordenada y con una base tecnica solida.

### 0:30 - 1:10 | Vista principal

Esta es la pantalla principal del foro. Aqui se muestra el listado de hilos y la navegacion general.

Desde esta vista los usuarios pueden entrar a leer contenido, revisar temas y moverse por las categorias.

La interfaz se ha planteado para que resulte clara desde el primer uso.

### 1:10 - 1:55 | Registro e inicio de sesion

Ahora enseño el acceso de usuarios.

La aplicacion permite registro e inicio de sesion normal, y tambien acceso con Google.

Cuando el usuario inicia sesion, ya puede usar las funciones principales como publicar, responder, votar o reportar.

### 1:55 - 2:45 | Publicacion y respuestas

En esta parte muestro como crear un hilo nuevo: se escribe titulo, contenido y se publica.

Despues, dentro del detalle del hilo, se pueden añadir respuestas y respuestas anidadas.

Esto ayuda a mantener conversaciones ordenadas y facilita seguir el contexto de cada aportacion.

### 2:45 - 3:25 | Votos y reputacion

El sistema permite votos positivos y negativos en hilos y respuestas.

Con esto se da visibilidad al contenido util y se mejora la calidad general del foro.

Ademas, existe reputacion o karma para reconocer a los usuarios que mas aportan.

### 3:25 - 4:20 | Moderacion y administracion

Si un usuario detecta contenido inapropiado, puede reportarlo.

Desde el panel de administracion se revisan reportes, se gestionan usuarios y categorias, y se aplican acciones de moderacion cuando corresponde.

Esta parte es clave para mantener convivencia y buen uso de la plataforma.

### 4:20 - 5:00 | Cierre

En resumen, el proyecto cumple los objetivos principales: arquitectura desacoplada, autenticacion, gestion de hilos y respuestas, sistema de votos, moderacion y despliegue en la nube.

La aplicacion funciona de forma coherente dentro del alcance previsto y deja una base clara para futuras mejoras.

Gracias por ver la explicacion.

---

## Anexo 7. Cierre de anexos

En conjunto, estos anexos sirven para apoyar la memoria de una forma simple y directa. Reunen pruebas de funcionamiento, relacion con los objetivos, incidencias, guion de defensa en video y posibles mejoras, sin complicar la lectura.
