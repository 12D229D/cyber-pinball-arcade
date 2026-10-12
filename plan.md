# Plan: cyber-pinball-arcade

## Resumen
Videojuego de pinball retro-futurista con estética arcade cyberpunk, desarrollado en HTML5 Canvas 2D, CSS3 Dark Glassmorphism y Vanilla JavaScript con sintetizador de audio procedimental Web Audio API y motor físico vectorial 2D.

## Objetivos
- Renderizar mesa de pinball jugable en el navegador a 60 FPS.
- Estética cyberpunk/arcade con marquesina luminosa, paneles de puntuación digital y animaciones neón.
- Simular física vectorial precisa: gravedad en plano inclinado, colisiones elásticas, momento angular en flippers y resorte de lanzamiento.
- Implementar mecánicas completas: 3 bumpers reactivos, 2 slingshots, dianas abatibles (*drop targets* con modo *Cyber Jackpot*), carriles de multiplicador (*L-E-V-E-L*), salva-bolas láser y sistema de *Tilt* (sacudida).
- Sintetizador procedimental de efectos de sonido Web Audio API (cero dependencias externas).
- Soporte universal de controles (teclado + controles táctiles en pantalla para móviles y ranuras de moneda interactivas).

## 🏗️ Arquitectura

- **Patrón**: Single Page Application (SPA) con renderizado Canvas 2D + Game Loop a 60 FPS + Arquitectura Modular Orientada a Componentes y Eventos.

```text
cyber-pinball-arcade/
├── index.html             # Gabinete arcade, marquesina, HUD de puntuación, slots de monedas y canvas
├── style.css              # Estilos Dark Neon Glassmorphism, animaciones de sacudida y controles móviles
├── script.js              # Motor de física vectorial, audio synth procedural, partículas y lógica de juego
├── README.md              # Documentación técnica completa y guía de controles
└── plan.md                # Bitácora de desarrollo y estado del proyecto
```

- **Flujo de datos**:
  1. `InputManager` captura eventos de teclado / táctiles / clics en slots de moneda.
  2. `CyberAudioEngine` sintetiza ondas de sonido en tiempo real en respuesta a eventos del juego.
  3. `PhysicsEngine` ejecuta 4 sub-pasos por frame calculando fuerzas, colisiones y transferencias de momento angular.
  4. `ParticleSystem` actualiza chispas, popups de puntuación y la estela luminosa de la bola.
  5. `RenderPass` dibuja la mesa, guías, bumpers iluminados, flippers, dianas y elementos en el Canvas 2D.
  6. `GameState` actualiza vidas, multiplicadores, consola de eventos y almacena el récord en `localStorage`.

## 🧠 Paradigma de Programación

- **Híbrido: Orientado a Objetos (POO) + Event-Driven + Imperativo**:
  - **POO**: Clases dedicadas y encapsuladas para componentes (`CyberAudioEngine`, `Vec2`, `ParticleSystem`, `Flipper`, `Bumper`, `Slingshot`, `DropTarget`, `RolloverLane`, `CyberPinballGame`).
  - **Event-Driven**: Manejadores de teclado, toques táctiles móviles y clics en ranuras de monedas que reaccionan asíncronamente y activan créditos o impulsos.
  - **Imperativo / Game Loop**: Ciclo continuo a 60 FPS (`requestAnimationFrame`) que actualiza la posición e interacciones físicas y redibuja el fotograma en el lienzo.

---

## 🌐 Propósito de Visibilidad y Destino Remoto

- **Visibilidad**: `Público (Open Source / Portafolio)`.
- **Plataforma Remota Asignada**: `GitHub`.
- **Plataforma de Despliegue CI/CD**: `GitHub Pages` / `Cloudflare Pages`.
- **Justificación**: Arcade retro-futurista de pinball 2D con Web Audio Synth sin dependencias ni servidor backend; ideal para exhibición en el portafolio público y despliegue estático.

---

## Estado actual
- **Estado**: ✅ **Completado (100%)**.
- Todos los objetivos y mecánicas del juego están implementados y verificados.
- Se incluye sintetizador de sonido Web Audio API, sistema de partículas neón, soporte móvil y persistencia de récords.

## Tareas realizadas
- [x] Implementar la lógica del pinball en JS (física de bola con sub-stepping, vector reflection, gravedad y fricción).
- [x] Crear los flippers y bumpers con detección de colisiones e impulso angular dinámico.
- [x] Sistema de puntuación, multiplicador de carril (*L-E-V-E-L*), dianas abatibles (*CYBER DROP TARGETS*) y modo Jackpot.
- [x] Lanzador por resorte (*Plunger*) con indicador de potencia y salva-bolas láser temporal.
- [x] Pantallas superpuestas de Start Screen (Insert Coin), Pausa, Game Over y bloqueo por Tilt.
- [x] Soporte de teclado, ranuras interactivas de monedas y controles táctiles en pantalla para dispositivos móviles.
- [x] Sintetizador procedimental de efectos de sonido con Web Audio API (cero dependencias externas).
- [x] Sistema de partículas neón, estela de la bola y popups de texto flotante.
- [x] Persistencia de puntuación máxima (*High Score*) en `localStorage`.
- [x] Creación de `README.md` y actualización de documentación.

## Stack / Tecnologías
- HTML5 (Canvas 2D para renderizado del tablero + layout semántico)
- CSS3 (Variables CSS HSL/HEX, Google Fonts Orbitron & Share Tech Mono, efectos neón glassmorphism)
- Vanilla JavaScript (ES6+ Classes, Web Audio API, RequestAnimationFrame)
