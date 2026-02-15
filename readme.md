# 🏎️ M8AX - Speedometer Pro (Precision GPS) 🏎️

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![HarmonyOS](https://img.shields.io/badge/HarmonyOS-000000?style=for-the-badge&logo=huawei&logoColor=white)
![GPS](https://img.shields.io/badge/GPS-Active-brightgreen?style=for-the-badge&logo=googlemaps)
![Status](https://img.shields.io/badge/Status-Estable-green?style=for-the-badge)

---

Este repositorio contiene el núcleo operativo del **M8AX Speedometer Pro**, un sistema de telemetría de alta precisión diseñado para **wearables**. No es un simple velocímetro; es un motor de cálculo geospacial que procesa datos de satélite en tiempo real para ofrecer métricas exactas de desplazamiento, velocidad y altitud.

Desarrollado en **JavaScript (HarmonyOS/LiteOS)**, el software utiliza algoritmos avanzados de trigonometría esférica para garantizar mediciones fiables incluso en condiciones de movimiento variable.

---

## 🛠️ Tecnologías y Motores de Cálculo

- **Geolocalización Avanzada:** Integración con `@system.geolocation` mediante suscripción persistente para obtener latitud, longitud, velocidad y altitud.
- **Algoritmo de Haversine:** Implementación manual de la fórmula de Haversine para calcular la distancia entre dos puntos geográficos considerando la curvatura terrestre ($R = 6371$ km).
- **Telemetría Dinámica:** Sistema de cálculo de velocidad secundaria basado en $\Delta Distancia / \Delta Tiempo$ para corregir posibles latencias del sensor GPS.
- **Gestión Energética:** Control del brillo mediante `@system.brightness` con modo `keepScreenOn` activo para monitorización continua.

---

## ◼️ Métricas y Funcionalidades Principales

El sistema ofrece un panel de control completo con las siguientes métricas:

- **Velocidad en Tiempo Real:** Visualización en Km/h con actualización constante.
- **Estadísticas de Sesión:** Cálculo automático de:
  - **Velocidad Máxima:** El pico más alto registrado en la sesión.
  - **Velocidad Mínima:** El registro más bajo durante el movimiento.
  - **Velocidad Media:** Promedio ponderado basado en el histórico de lecturas.
- **Odómetro Digital:** Seguimiento de distancia total recorrida con precisión de dos decimales.
- **Altímetro:** Monitorización de la altitud actual sobre el nivel del mar.
- **Reloj del Sistema:** Indicador de hora actual sincronizado.

---

## ◼️ Interfaz y Estética Técnica

- **Alertas Visuales:** Cambio dinámico de color en la fuente (`speedColor`) al superar los **120 Km/h**, pasando de naranja a carmesí (`#DC143C`) como advertencia de seguridad.
- **Neo-Footer Estocástico:** Sistema de personalización estética que elige aleatoriamente entre 20 colores "fuertes" (neón/eléctricos) en cada inicio para el pie de página.
- **Identidad M8AX:** Integración del año actual con conversión algorítmica a **Números Romanos**.
- **Estados de Conexión:** Notificaciones visuales sobre el estado del GPS (Buscando, Km/h, Sin Señal).

---

## ◼️ Optimización y Seguridad

- **Auto-Zero Logic:** El sistema detecta automáticamente la inactividad. Si no hay actualizaciones del satélite en 3 segundos, la velocidad vuelve a `0.00` para evitar errores de deriva.
- **Filtro de Ruido:** El algoritmo ignora desplazamientos menores a 2 metros para evitar el "baile" de números cuando el dispositivo está en reposo.
- **Ciclo de Vida Limpio:** Al cerrar la app (`onDestroy`), se cancela la suscripción al GPS y se libera el control del brillo para ahorrar batería.

---

# 🇺🇸 English Version

# 🏎️ M8AX - Speedometer Pro (Precision GPS) 🏎️

This repository hosts the source code for **M8AX Speedometer Pro**, a high-precision telemetry system engineered for **wearables**. It features a geospatial computation engine that processes real-time satellite data to provide accurate displacement, speed, and altitude metrics.

Built with **JavaScript (HarmonyOS/LiteOS)**, the software employs spherical trigonometry algorithms to ensure reliable measurements under varying motion conditions.

---

## 🛠️ Core Technologies & Engines

- **Advanced Geolocation:** Direct integration with `@system.geolocation` for persistent tracking of latitude, longitude, speed, and altitude.
- **Haversine Formula:** Manual implementation of the Haversine formula to calculate the distance between two geographic points ($R = 6371$ km).
- **Dynamic Telemetry:** Secondary speed calculation logic based on $\Delta Distance / \Delta Time$ to compensate for GPS sensor latency.
- **Energy Management:** Brightness control via `@system.brightness` with `keepScreenOn` enabled for continuous monitoring.

---

## ◼️ Key Metrics & Features

- **Real-Time Speed:** High-refresh display in Km/h.
- **Session Statistics:** Automatic tracking of:
  - **Max Speed:** Highest peak recorded during the session.
  - **Min Speed:** Lowest speed recorded while in motion.
  - **Average Speed:** Weighted average based on historical reading data.
- **Digital Odometer:** Total distance tracking with two-decimal precision.
- **Altimeter:** Real-time altitude monitoring.
- **System Clock:** Synchronized time indicator.

---

## ◼️ Interface & Technical Aesthetics

- **Visual Alerts:** Dynamic font color change (`speedColor`) when exceeding **120 Km/h**, shifting from orange to crimson (`#DC143C`) as a safety warning.
- **Stochastic Neo-Footer:** A UI customization system that randomly selects one of 20 "strong" (neon/electric) colors at startup for the footer.
- **M8AX Identity:** Current year display with an algorithmic **Roman Numeral** conversion engine.
- **Connection Status:** Visual feedback for GPS status (Searching, Km/h, No Signal).

---

## ◼️ Optimization & Reliability

- **Auto-Zero Logic:** The system detects inactivity. If no satellite updates are received within 3 seconds, speed resets to `0.00` to prevent drift errors.
- **Noise Filtering:** The algorithm ignores movements smaller than 2 meters to avoid jitter when the device is stationary.
- **Clean Lifecycle:** Upon closing (`onDestroy`), the GPS subscription is cancelled and brightness settings are restored to save battery.