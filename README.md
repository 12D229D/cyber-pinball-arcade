# 🎮 CYBER PINBALL ARCADE (2026 Edition)

Un videojuego arcade de pinball retro-futurista con estética *Cyberpunk / Synthwave*, construido íntegramente en **HTML5 Canvas 2D**, **CSS3 Dark Glassmorphism** y **Vanilla JavaScript**.

---

## 🌟 Características Principales

- **Física 2D Vectorial Precisa**:
  - Simulación de gravedad en plano inclinado y fricción superficial.
  - Colisiones elásticas contra paredes, arcos y elementos con sub-stepping (4 iteraciones por frame) para evitar el efecto de atravesar objetos a alta velocidad (*anti-tunneling*).
  - Momento angular en palas/flippers: la velocidad e inclinación de la pala transfieren impulso cinético real a la bola según el punto de impacto.
- **Sintetizador Procedimental Web Audio API**:
  - Efectos de sonido retro/arcade 100% sintetizados en tiempo real mediante osciladores (*sine, triangle, square, sawtooth*) y envolventes ADSR.
  - Cero dependencias externas ni archivos de audio pesados.
- **Mecánicas de Tablero Completas**:
  - **Lanzador por Resorte (Plunger)**: Acumulación de potencia al mantener pulsado el lanzador.
  - **Bumpers Reactivos con Luces Neón**: 3 bumpers (*CYBER, MATRIX, NEON*) con animación de recoil y partículas.
  - **Slingshots Activos**: 2 esquinas elásticas con impulso diagonal rápido.
  - **Dianas Abatibles (Drop Targets)**: Banco de dianas *C-Y-B*. Al derribar las tres, se activa el modo especial **★ CYBER JACKPOT ★** (+2.500 puntos).
  - **Carriles Rollover (L-E-V-E-L)**: Sensores de paso superiores que otorgan bonificación y aumentan el multiplicador de puntuación (hasta x5).
  - **Salva-bolas Láser Temporal**: Barrera protectora activa durante los primeros 10 segundos tras el lanzamiento.
  - **Mecánica de Sacudida (Tilt)**: Posibilidad de empujar la mesa con detección de exceso de sacudidas (*Tilt Lockout*).
- **Sistema de Partículas y Estelas**:
  - Chispas neón en cada impacto, estela luminosa continua de la bola (*motion trail*) y marcadores de puntuación flotantes.
- **Controles Universales y Modo Móvil**:
  - Soporte completo para teclado físico (A/D, Flechas, Espacio, N, P).
  - Controles táctiles integrados en pantalla para smartphones y tablets.
  - Ranuras de monedas interactivas (25¢ *Insert Coin*).
- **Persistencia**:
  - Guardado automático de la máxima puntuación (*High Score*) en `localStorage`.

---

## 🕹️ Controles

| Acción | Teclado | Controles Táctiles (Móvil) |
|---|---|---|
| **Pala Izquierda** | <kbd>A</kbd> o <kbd>←</kbd> | Botón **PALA IZQ** |
| **Pala Derecha** | <kbd>D</kbd> o <kbd>→</kbd> | Botón **PALA DER** |
| **Lanzador de Bola** | <kbd>Espacio</kbd> (Mantener y soltar) | Botón **LANZAR** |
| **Sacudir Mesa (Tilt)** | <kbd>N</kbd> o <kbd>Shift</kbd> | Botón **TILT** |
| **Pausar / Reanudar** | <kbd>P</kbd> | — |
| **Insertar Moneda** | Clic en la ranura de 25¢ | Clic en ranura de 25¢ |

---

## 🏗️ Arquitectura y Tecnologías

- **HTML5**: Canvas 2D (`500x800`), layout semántico de gabinete arcade.
- **CSS3**: Variables CSS (colores HSL/HEX Neón), Flexbox, sombras con resplandor (*box-shadow glow*), tipografías de Google Fonts (*Orbitron* y *Share Tech Mono*).
- **Vanilla JavaScript**:
  - `CyberAudioEngine`: Generación de sonido procedural Web Audio API.
  - `Vec2` & `PhysicsEngine`: Álgebra vectorial 2D y detección/resolución de colisiones.
  - `ParticleSystem`: Emisor de chispas, estelas y popups de texto.
  - `CyberPinballGame`: Ciclo de juego a 60 FPS mediante `requestAnimationFrame`.

---

## 🚀 Cómo Ejecutar

Abre el archivo `index.html` en cualquier navegador web moderno (Chrome, Edge, Firefox, Safari). No requiere servidores locales ni instalación de paquetes npm.
