![Uploading gridwatch_logo_dark-Dwjg7zJE.png…]()


**GridWatch** es una solución web moderna para la monitorización y visualización en tiempo real de datos eléctricos provenientes de dispositivos físicos propios. Desarrollado como Trabajo de Fin de Grado (TFG) en Desarrollo de Aplicaciones Web (DAW), GridWatch integra tecnologías de frontend y backend actuales, proporcionando una plataforma robusta, escalable y segura.

## Tabla de Contenidos

- [Resumen](#resumen)
- [Tecnologías](#tecnologías)
- [Características Principales](#características-principales)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Arquitectura y Componentes](#arquitectura-y-componentes)
- [Mapa Web (Sitemap)](#mapa-web-sitemap)
- [Pruebas](#pruebas)
- [Despliegue y Mantenimiento](#despliegue-y-mantenimiento)
- [Mejoras Futuras](#mejoras-futuras)
- [Referencias y Glosario](#referencias-y-glosario)

---

## Resumen

GridWatch reemplaza una plataforma anterior y permite visualizar, analizar y gestionar datos eléctricos de dispositivos en campo. La interfaz web facilita el monitoreo y análisis eficiente del consumo eléctrico a través de dashboards interactivos, mapas, gráficos y sistemas de alertas.

- **Frontend:** React, Vite, Tailwind CSS, TypeScript
- **Backend:** ASP.NET 9 (C#)
- **Autenticación:** Microsoft Active Directory (MSAL)
- **Mapas:** Microsoft Azure Maps

---

## Tecnologías

- React
- Vite
- Tailwind CSS
- TypeScript
- ASP.NET 9 (C#)
- Microsoft Azure Maps
- MSAL (Microsoft Authentication Library)
- Bitbucket (control de versiones)
- Jira (gestión de tareas)

---

## Características Principales

- **Dashboard interactivo**: Visualización en tiempo real de métricas clave como voltaje, intensidad y consumo.
- **Mapas geoespaciales**: Ubicación y estado de dispositivos en campo.
- **Filtrado avanzado**: Por fechas, tipo de dispositivo y ubicación.
- **Alertas y notificaciones**: Detección de valores anómalos o picos de consumo.
- **Autenticación segura**: Acceso mediante cuentas Microsoft.
- **Interfaz adaptable**: Responsive y accesible desde cualquier navegador.
- **Escalabilidad**: Arquitectura preparada para futuras mejoras.

---

## Estructura del Proyecto
/src/ ├── components/ # Componentes reutilizables (ej: AppSidebar, Navbar, AzureMapCard) 
├── pages/ # Páginas principales (Dashboard, NotificationsPage, etc.) 
├── services/ # Lógica de APIs y autenticación (authService.ts) 
├── lib/ # Utilidades y funciones auxiliares 
├── types/ # Definiciones TypeScript 
├── Maps/ # Módulo de mapas interactivos (Azure Maps) 
├── App.tsx # Componente principal 
├── main.tsx # Entrada de la app 
└── index.css # Estilos globales (Tailwind CSS)

---

## Arquitectura y Componentes

- **AppSidebar**: Barra lateral configurable y flexible.
- **Navbar**: Navegación superior con breadcrumbs y menú de usuario.
- **Dashboard/DynamicDashboard**: Panel interactivo y persistente.
- **AzureMapCard / MapContainer**: Visualización y filtrado geoespacial avanzado.
- **ThemeProvider**: Gestión global del tema claro/oscuro.
- **Servicios**: Integración con APIs y autenticación.

---

## Mapa Web (Sitemap)

- `/` — Dashboard principal
- `/test` — Pruebas generales
- `/notifications` — Notificaciones
- `/grid-testing` — Visualización de red eléctrica
- `/devices/batch` — Gestión masiva de dispositivos
- `/devices/manage` — Gestión individual de dispositivos
- `/dynamic-dashboard` — Dashboard dinámico y configurable

---

## Pruebas

El sistema ha sido validado mediante:

- **Pruebas funcionales**: Visualización y filtrado de datos, mapas, gráficos, alertas.
- **Pruebas de integración**: Comunicación frontend-backend, autenticación MSAL.
- **Pruebas de interfaz (UI/UX)**: Diseño responsive, navegación fluida, accesibilidad.
- **Pruebas de seguridad**: Autenticación, acceso restringido, validaciones básicas.
- **Pruebas de rendimiento**: Manejo de múltiples dispositivos y grandes volúmenes de datos.

---

## Despliegue y Mantenimiento

- **Frontend**: Build optimizado con Vite, desplegado en Azure/IIS.
- **Backend**: ASP.NET operativo, integración vía API.
- **Mantenimiento**: Mejoras continuas, corrección de errores y escalabilidad modular.

---

## Mejoras Futuras

- Integración completa de base de datos corporativa.
- Optimización para dispositivos móviles.
- Sistema avanzado de alertas y analítica.
- Pruebas automatizadas.
- Internacionalización (i18n).
- Modo offline temporal.

---

## Referencias y Glosario

**Documentación técnica:**
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [ASP.NET](https://learn.microsoft.com/en-us/aspnet/core/?view=aspnetcore-9.0)
- [Azure Maps](https://azure.microsoft.com/en-us/products/azure-maps/)
- [MSAL Auth](https://docs.microsoft.com/en-us/azure/active-directory/develop/msal-overview)

**Herramientas:** JetBrains Rider, Bitbucket, Jira

**Glosario:**  
Consulta en la documentación términos como Dashboard, Sidebar, Navbar, API, Frontend, Backend, Escalabilidad, Mantenibilidad, etc.

---

> **Autor:** [Enraxk](https://github.com/Enraxk)  
> **Empresa:** MAC – The National Microelectronics Applications Centre Ltd.

