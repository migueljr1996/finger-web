# Finger Web (WebUSB Next.js)

Este es un proyecto experimental para lograr la detección y comunicación con lectores de huellas dactilares a través de USB directamente en el navegador, apuntando a su uso futuro en dispositivos móviles.

Este proyecto se aleja del ecosistema tradicional de Java (`dpuareu.jar`) porque la intención final es operar desde un navegador (principalmente en Android) usando la API moderna WebUSB.

## 🚀 Requisitos y Configuración

El proyecto está desarrollado sobre **Next.js** (App Router) y usa puro **TypeScript** y **CSS** (no Tailwind).

### Cómo ejecutar en desarrollo

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Correr el servidor:
   ```bash
   npm run dev
   ```
3. Visitar `http://localhost:3000` en tu navegador de PC.

### Probar desde un Celular (Android)

> [!IMPORTANT]
> WebUSB requiere un **contexto seguro**. Esto significa que solo funcionará bajo `https://` o en `localhost`.

Para probarlo desde el navegador de tu celular:
1. Conecta tu celular por USB, o asegúrate de que esté en la misma red Wi-Fi de tu PC.
2. Si están en el mismo Wi-Fi, tu PC debe exponer el servidor al celular. Sin embargo, acceder por IP local (ejemplo `http://192.168.1.50:3000`) **bloqueará WebUSB** por falta de HTTPS.
3. **Solución:** Usa herramientas gratuitas de tunelización como [Ngrok](https://ngrok.com/) o [Cloudflare Tunnel](https://developers.cloudflare.com/pages/how-to/preview-with-cloudflare-tunnel/).
   - Ejecuta `npx ngrok http 3000`
   - Abre la URL `https://xxxx.ngrok-free.app` que te genere ngrok desde el Chrome de tu celular Android.
4. Conecta tu lector de huellas al celular a través de un cable u adaptador **USB OTG**.
5. Presiona "Conectar Lector Biométrico USB", Chrome te pedirá permiso físico nativo en Android para asociar el dispositivo a la web.

## ⚠️ Limitaciones Técnicas y de Ecosistema

### 1. Bloqueo de Apple / iOS
> [!WARNING]
> WebUSB **NO FUNCIONA EN iOS**, ni en Safari, ni en Google Chrome de iPhone. Apple ha decidido de manera estricta no implementar este estándar por políticas internas de privacidad y seguridad en su motor WebKit. Al día de hoy, esta solución está restringida al ecosistema Android/PC.

### 2. Soporte en Desktop e Implementaciones
Mozilla Firefox tampoco habilita WebUSB por defecto en consideraciones al rastreo de hardware (fingerprinting).
Tu target para producción debe ser **Google Chrome, Microsoft Edge, o navegadores basados en Chromium / Opera**.

### 3. Del "Reconocimiento" a la "Lectura"
Este proyecto abarca la **fase 1**: Detectar exitosamente el lector USB y establecer un Pipe (Conexión) Web.
La **fase 2** (leer la huella real) es técnicamente más compleja ya que la web necesitará conocer el protocolo específico del fabricante (ej: los endpoints y payload exacto para decirle al sensor "enciende el LED y envía la imagen de la huella en formato RAW"). La mayoría de estas lógicas privativas vienen cerradas en SDKs en C++ o Java (justamente, como el `dpuareu.jar`).

Para lograrlo desde JavaScript puro, habrá que:
- Obtener un manual técnico USB del lector.
- Traducir los comandos hexadecimales de lectura e invocarlos usando `device.transferOut()` y recibir la imagen de la huella a través de `device.transferIn()`. 

## 📝 Validaciones Técnicas Implementadas
- [x] Conexión y solicitud mediante `navigator.usb.requestDevice()`.
- [x] Escucha automática a las conexiones y desconexiones físicas del cable USB (`onconnect`, `ondisconnect`).
- [x] Parseo del VendorID (vId) y ProductID (pId) en formato Hexadecimal nativo.
- [x] Gestión interactiva de estados WebUSB bajo ecosistema Next.js moderno renderizado en cliente (`'use client'`).
