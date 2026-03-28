# Diagnóstico y Plan de Integración: EasyBroker CRM en Homepty

Este documento detalla el análisis de la integración actual de EasyBroker en `HomeptyWebApp`, el diagnóstico de la nueva estructura en `Homepty-new` y el plan detallado para migrar esta funcionalidad, corrigiendo errores previos de pérdida de datos.

---

## 1. Análisis de la Integración Actual (HomeptyWebApp)

### 1.1. Funcionamiento del Token (API Key)
En el proyecto original, el usuario ingresa su **API Key** desde la interfaz de configuración. Este token permite a Homepty autenticarse ante la API de EasyBroker (v1) mediante el header `X-Authorization`.

### 1.2. Hallazgo Crítico: Causa de la Pérdida de Datos
Tras investigar el flujo de datos, se identificó que la pérdida de información (amenidades, descripciones completas, etc.) se debe a un **error en la lógica de sincronización**, no a una limitación de la API de EasyBroker.

#### El problema detectado:
1.  **Petición Incompleta:** El sistema primero llama a `/properties` (listado general), el cual devuelve un resumen básico de las propiedades.
2.  **Falla en el Detalle:** Aunque el código intenta llamar a `/properties/{id}` para obtener el detalle completo (donde vienen las amenidades y descripciones largas), si esta petición falla o no se procesa correctamente, el sistema **cae en un "fallback"** que usa solo los datos básicos del listado.
3.  **Mapeo de Amenidades:** Las amenidades de EasyBroker vienen en un array de strings (`features`). HomeptyWebApp intenta guardarlas en un campo JSON `easybroker_features`, pero **no las vincula con la tabla de amenidades local** (`amenidadespropiedades`), lo que impide que se filtren o muestren correctamente en la interfaz estándar.
4.  **Ubicación:** La ciudad y el estado dependen totalmente de la geocodificación de Mapbox. Si Mapbox no devuelve el estado o ciudad exactos, el sistema deja esos campos como `null`.

---

## 2. Diagnóstico de Homepty-new

### 2.1. Estructura de Base de Datos (Supabase)
La tabla `propiedades` en el nuevo proyecto es más estricta:
*   Campos como `area`, `precio` y `habitaciones` son obligatorios.
*   **Mejora:** La nueva estructura está preparada para manejar `is_unit`, lo que permitirá importar desarrollos completos de EasyBroker de forma jerárquica.

### 2.2. Oportunidad de Mejora
En `Homepty-new`, podemos implementar un **Mapper Bidireccional** que no solo guarde el JSON de EasyBroker, sino que sincronice activamente las tablas relacionales de amenidades y ubicación.

---

## 3. Plan de Integración Paso a Paso (Corregido)

### Fase 1: Base de Datos y Tipos
1.  **Tablas de Integración:** Crear `easybroker_integrations` y `easybroker_sync_logs`.
2.  **Extensiones de Propiedades:** Asegurar que la tabla `propiedades` tenga:
    *   `easybroker_id`: Identificador único del CRM.
    *   `easybroker_images_json`: Para las URLs de imágenes.
    *   `easybroker_source_data`: Campo JSONB para guardar el objeto original completo (para auditoría).

### Fase 2: Lógica de Sincronización Robusta
1.  **Procesamiento en dos pasos:**
    *   **Paso A:** Obtener IDs de propiedades actualizadas recientemente.
    *   **Paso B:** Obtener el detalle **obligatorio** de cada una para asegurar que `features`, `description` y `images` estén completos.
2.  **Mapeo Inteligente de Amenidades:**
    *   Crear una función que compare los `features` de EasyBroker con la tabla `amenidades` de Homepty.
    *   Si existe coincidencia, insertar en `amenidades_propiedades`.
3.  **Geocodificación con Respaldo:** Si Mapbox falla, intentar extraer Ciudad/Estado directamente del texto de EasyBroker como plan de contingencia.

### Fase 3: Interfaz de Usuario (Frontend)
1.  **Ubicación:** Configuración > Integraciones > EasyBroker.
2.  **Componentes:**
    *   `EasyBrokerConfigCard`: Input de token y estado de conexión.
    *   `SyncControl`: Botón de sincronización manual con barra de progreso real.
    *   `SyncHistory`: Tabla con los últimos logs de importación.

---

## Resumen de Errores a Evitar en Homepty-new

| Dato Perdido | Causa en Proyecto Anterior | Solución en Homepty-new |
| :--- | :--- | :--- |
| **Amenidades** | No se vinculaban a la tabla relacional. | Crear script de matching de strings a IDs de amenidades. |
| **Descripción** | Se truncaba o se usaba la del listado básico. | Forzar la descarga del detalle `/properties/{id}`. |
| **Ubicación** | Dependencia absoluta de Mapbox. | Usar Mapbox + Extracción de texto de la API de EB. |
| **Imágenes** | Solo se traía la imagen de portada. | Mapear el array `property_images` completo del detalle. |
