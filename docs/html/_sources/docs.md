# **Documentación de Optichat**

**Versión:** 1.0
**Autor:** Equipo de Tecnología de Optichat
**Fecha:** 25 de junio de 2025

---

## **Introducción**

Optichat representa la evolución de las soluciones de mensajería empresarial, combinando una interfaz web avanzada con un motor de backend robusto para procesar grandes volúmenes de datos y orquestar envíos precisos a través de WhatsApp Business. Desde su concepción, nuestros objetivos centrales fueron garantizar la modularidad del sistema y la trazabilidad de cada transacción, así como facilitar la labor de los equipos de desarrollo, operaciones y auditoría.

La aplicación React, construida sobre Vite y React 18, integra de manera nativa un micro-servicio FastAPI que expone las rutas necesarias para autenticación, configuración y envío de mensajes. Esta aproximación “full-stack dentro de un mismo repositorio” permite a los desarrolladores iterar de forma ágil tanto en frontend como en backend, compartiendo la misma base de código y configuraciones de entorno. De este modo, se reducen los costos de contexto y se unifican los procesos de despliegue.

De manera paralela, el proyecto incluye un conjunto de scripts y notebooks Python dedicados al análisis y modelado de datos históricos de mensajería. Aunque estos artefactos no están conectados directamente con la SPA, sientan las bases para futuras funcionalidades de analítica avanzada, detección de anomalías y generación de reportes internos. La separación de esta lógica garantiza que los ciclos de desarrollo de producto y de data science puedan avanzar de manera independiente.

A lo largo de este documento, se detallan con un nivel de profundidad propio de equipos de tecnología de primer nivel cada uno de los módulos que componen Optichat. Se abordarán las decisiones arquitectónicas, los patrones de diseño aplicados y los flujos de datos críticos, así como las recomendaciones para extender y mantener el sistema en entornos productivos.

---

## **React App y micro-backend (Optichat-Redesign)**

La carpeta `backend/` contiene el micro-servicio FastAPI que se levanta en paralelo con la SPA y está diseñado para atender exclusivamente las llamadas necesarias desde React, sin fungir como un servicio independiente. Esta estrategia reduce la latencia y facilita el desarrollo full-stack.

El archivo `database.py` centraliza la configuración de la capa de persistencia. Al importarse, carga de manera automática el archivo `.env` mediante `python-dotenv`, creando un `MongoClient` único que aprovecha el pool de conexiones nativo para optimizar la eficiencia en consultas concurrentes. A partir de este cliente, se exponen tres colecciones de alto nivel (`usuarios_collection`, `empresas_collection` y `configuracion_collection`), que encapsulan las operaciones CRUD y aseguran una única fuente de verdad para los datos en toda la aplicación.

En `models.py` se definen los esquemas Pydantic que validan y documentan las estructuras de datos que fluyen entre el cliente y el servidor. Estas definiciones no solo imponen restricciones de tipo y formato, sino que también generan la documentación OpenAPI automáticamente, permitiendo a los desarrolladores conocer de forma precisa los contratos de cada endpoint.

El archivo `meta_api.py` aísla el vínculo con servicios externos: su función principal construye los encabezados de autenticación necesarios, lanza peticiones HTTP al endpoint de plantillas, parsea las respuestas y aplica lógica de reintentos y manejo de errores. Al separar esta lógica, cualquier cambio en el proveedor de plantillas queda completamente desacoplado de la lógica de negocio interna.

El corazón del micro-servicio reside en `main.py`, donde se inicializa FastAPI con middleware de CORS y se definen los endpoints `/login`, `/plantillas-meta` y `/enviar-mensajes`. Cada ruta implementa validaciones tempranas de parámetros (como la verificación de `ObjectId`), transforma los documentos de Mongo a JSON mediante una función recursiva de serialización y orquesta las tareas de negocio: autenticación, recuperación de configuraciones y envíos atómicos de mensajes. La atención a los códigos HTTP y los registros de log contribuyen a ofrecer una experiencia de depuración efectiva.

Finalmente, `requirements.txt` congela versiones específicas de las dependencias críticas (FastAPI, Uvicorn, Pymongo, Pandas, Requests, Validators), asegurando que los despliegues sean reproducibles y que las actualizaciones de librerías se realicen de forma controlada.

### **Carpeta `src/`**
El directorio `src/` contiene la Single-Page Application (SPA) de Optichat y asume la responsabilidad de toda la interacción del usuario con la plataforma. Está diseñada con React 18 y Vite para garantizar tiempos de arranque rápidos, recarga en caliente durante el desarrollo y un bundle optimizado en producción. La organización de este directorio obedece a criterios de modularidad, separación de preocupaciones y escalabilidad.

A continuación se presenta un resumen de la función y el cometido de cada agrupación dentro de `src/`, seguido de descripciones detalladas de los archivos principales.

| Ruta / Archivo           | Propósito clave                                                                                |
| ------------------------ | ---------------------------------------------------------------------------------------------- |
| `main.jsx`               | Punto de entrada de la aplicación React; monta el componente raíz y aplica providers globales. |
| `App.jsx`                | Define el layout base y el enrutamiento de la SPA con código diferido para optimización.       |
| `assets/`                | Carpeta de recursos estáticos (imágenes, logos) gestionados por Vite para caching y hashing.   |
| `components/Sidebar.jsx` | Navegación lateral persistente; gestiona estado de colapso y selección de ruta activa.         |
| `pages/*`                | Conjunto de vistas de negocio; cada archivo corresponde a una pantalla específica.             |
| `styles/`                | Estilos SCSS modulares; `global.scss` establece variables de tema y mixins de uso general.     |

### **`main.jsx`**

El archivo `main.jsx` actúa como la semilla de la aplicación. Dentro de él, React se vincula al elemento DOM especificado en `index.html` y se instancian los proveedores a nivel de aplicación, entre los que destacan el enrutador (`BrowserRouter`) y el contexto de autenticación. Gracias a esta capa de proveedores, todos los componentes anidados pueden acceder a la configuración global de rutas y al estado de sesión sin necesidad de prop drilling, lo que simplifica la estructura y mejora la mantenibilidad.

### **`App.jsx`**

En `App.jsx` se concentra la lógica de navegación y la disposición general de la interfaz. Este archivo importa un arreglo de objetos de ruta que define la correspondencia entre URL y componente, y registra cada uno con `<Route>` de React Router. Se incorpora `React.Suspense` junto a `React.lazy` para habilitar el code-splitting, de modo que cada vista se cargue únicamente cuando el usuario navega a ella, reduciendo el peso del bundle inicial. Asimismo, `App.jsx` incluye el componente `Sidebar` como parte del layout fijo, envolviendo el contenido principal en un contenedor que responde automáticamente a los cambios de tamaño de pantalla para asegurar una experiencia responsive.

### **Carpeta `assets/`**

Los recursos estáticos residen en `assets/`, donde se almacenan imágenes como `optichat-logo.png`, banners y fondos de pantalla. Vite procesa estos archivos durante el build, aplicando hashing a sus nombres para permitir un caching agresivo en el navegador y acelerar la entrega de contenidos. El uso de imágenes SVG y PNG optimizadas garantiza compatibilidad cross-browser y una carga eficiente en conexiones de baja latencia.

### **Carpeta `components/Sidebar.jsx`**

El componente `Sidebar.jsx` implementa la navegación lateral que acompaña a todas las vistas. Su lógica consiste en iterar sobre una lista de rutas definida en un módulo de configuración, renderizando un enlace por cada entrada y aplicando estilos condicionales según la ruta activa detectada con el hook `useLocation`. Además, maneja un estado booleano `collapsed` que controla su ancho y la visibilidad de las etiquetas, permitiendo un modo compacto para pantallas pequeñas o cuando el usuario desea maximizar el espacio de contenido.

### **Carpeta `pages/`**

La carpeta `pages/` agrupa las pantallas de negocio que componen el flujo de la aplicación:

* **Login.jsx**: encapsula un formulario controlado donde el usuario ingresa sus credenciales. Emplea validaciones sincrónicas para garantizar que ambos campos estén completos y utiliza el endpoint `POST /login` del micro-backend para autenticar, gestionando errores y redirecciones posteriores.

* **Home.jsx**: muestra un dashboard con indicadores clave de rendimiento (KPIs), gráficos implementados con `recharts` y una tabla de actividad reciente. Este componente orquesta múltiples llamadas concurrentes a la API, unifica estados de carga mediante hooks personalizados (`usePlantillas`) y ofrece un diseño adaptable a diferentes resoluciones.

* **AdministrarPlantillas.jsx** y **ProgramarMensajeria.jsx**: estas vistas comparten patrones de diseño de formularios y tablas. El primero permite CRUD completo de plantillas, combinando formularios y tablas interactivas; el segundo extiende esa lógica para permitir la subida de archivos Excel, validación de columnas y programación de envíos, invocando `POST /enviar-mensajes`.

* **CalendarioMensajeria.jsx**: despliega un calendario basado en `fullcalendar`, adaptado a la estética corporativa. Ofrece vistas mensual, semanal y diaria, así como la capacidad de filtrar eventos según criterios de plantilla o estado.

* **Configuracion.jsx** y **ComingSoon.jsx**: la primera proporciona formularios de actualización de perfil y parámetros de empresa usando `react-hook-form`; la segunda muestra un placeholder para futuras funcionalidades, manteniendo el estilo visual del resto de la aplicación.

Cada componente de página carga su propio archivo SCSS correspondiente desde `styles/`, manteniendo el principio de co-locación de código y estilos. Esto facilita la trazabilidad y reduce la posibilidad de colisiones en los estilos.

### **Carpeta `styles/`**

La carpeta `styles/` contiene un archivo `global.scss` que define variables de color corporativo (#1a4160), la fuente Poppins y mixins reutilizables para espacios y tipografías. Además, cada página o componente dispone de un archivo SCSS específico que aplica estilos locales usando la convención BEM. Durante el build, PostCSS y Autoprefixer aseguran compatibilidad con navegadores antiguos, mientras que la minificación de CSS reduce el tamaño final del bundle.

---

## **Código Funcional Base (Backend)**

En este único notebook Python, se entrega un prototipo completo que aglutina las rutinas de construcción de plantillas, envío masivo de mensajes y recepción de notificaciones de WhatsApp Business, sirviendo como base para futuras integraciones. El flujo comienza con la configuración inicial, donde se importan los módulos `requests`, `pandas`, `time`, `datetime` y `pytz` para gestionar llamadas HTTP, procesamiento de datos tabulares y control de zonas horarias. A continuación, se definen constantes de entorno que ilustran los parámetros necesarios en producción: `ACCESS_TOKEN`, `WABA_ID`, `PHONE_NUMBER_ID`, `TEMPLATE_NAME` y la ruta al archivo Excel de prueba.

La función `get_template_details(template_name)` realiza una petición GET al endpoint de plantillas de Meta usando el token de acceso. Si la respuesta es satisfactoria, recorre la lista de plantillas disponibles hasta encontrar la que coincide con el nombre proporcionado, devolviendo su esquema completo; en caso contrario, registra un mensaje de error. Esta rutina aísla la obtención y validación de metadatos, permitiendo reutilizarla en diferentes contextos.

Para manejar plantillas con componentes multimedia, la función `prompt_for_component(component_type, format_type)` solicita interactivamente al usuario las URLs o coordenadas necesarias (imagen, video, documento o ubicación). Esta aproximación garantiza que todos los componentes dinámicos de tipo HEADER disponen de la información requerida antes de enviar cualquier mensaje.

La construcción del contenido de cada mensaje se realiza en `build_message(template_data, recipient, name, additional_params)`. Este método itera sobre los componentes definidos en la plantilla, omitiendo secciones FOOTER, y genera un listado de parámetros según su tipo: texto para BODY, objetos con enlaces o coordenadas para HEADER multimedia. El resultado es un objeto JSON listo para enviarse a la API de WhatsApp Business.

La función `get_additional_params(template_data)` recorre los mismos componentes para detectar aquellos que requieren información adicional y utiliza `prompt_for_component` para obtenerla, devolviendo un diccionario que alimenta la construcción del mensaje.

El envío masivo se orquesta mediante `send_bulk_messages(file_path, template_data, additional_params)`, que carga el Excel en un DataFrame de pandas y extrae listas de números de teléfono y nombres. Para cada par, invoca `build_message` y realiza un POST individual al endpoint, capturando y registrando en una lista los posibles errores sin interrumpir el ciclo de envío.

Para programar envíos en una fecha y hora específicas, `schedule_messages(file_path, template_data, schedule_time)` utiliza el módulo `schedule` en combinación con `pytz` para comparar instantes locales. Tras verificar que la hora solicitada sea futura, bloquea la ejecución en un bucle hasta el momento indicado y luego lanza el envío masivo, mostrando un registro detallado del proceso y de cualquier fallo.

Complementan estas funcionalidades las rutinas auxiliares: `get_schedule_time()` permite al usuario introducir la fecha y hora mediante un prompt validado con `datetime.strptime`, y `validate_media_url(url)` efectúa una petición HEAD para asegurar la accesibilidad de URLs de medios antes de ser incluidas.

Adicionalmente, el notebook incluye secciones de prueba que muestran la creación y corrección de plantillas mediante peticiones POST a la Graph API de Meta, con distintos payloads adaptados a escenarios de marketing o utilidad. Estas células de ejemplo documentan cómo estructurar componentes de tipo HEADER, BODY, FOOTER y BUTTONS, y sirven como referencia inmediata para generar nuevos templates.

Al final, se define un servidor Flask minimalista con un endpoint `/webhook` que cumple la verificación inicial de Meta (respondiendo al desafío de suscripción) y procesa mensajería entrante. Este servidor ilustra el patrón de webhook para recibir notificaciones de eventos y permite extender la lógica de respuesta automática o integración con sistemas de análisis.

Este prototipo debe trasladarse al entorno de producción extrayendo las constantes a un sistema de configuración seguro, separando el código en módulos Python y exponiendo las funciones de envío y webhook como endpoints FastAPI o tareas programadas. De este modo, se garantizará la coherencia con la SPA de React y la robustez necesaria para un servicio empresarial.

---

## **Conclusión**

El prototipo entregado en este repositorio reúne los componentes esenciales de Optichat: una aplicación React con su micro-servicio FastAPI para gestionar autenticación, plantillas y envíos de mensajería, y un módulo de código base en Python que ilustra las rutinas de construcción de plantillas, envíos masivos y recepción de notificaciones mediante webhooks. Cada pieza ha sido diseñada para facilitar el desarrollo posterior, con flujos de datos claros, contratos de servicio definidos y una estructura modular que permite evolucionar cada capa de forma independiente. El siguiente equipo dispondrá de una visión completa del sistema y de los fundamentos técnicos necesarios para completar, corregir y optimizar el producto.


