# Tetris Game (Browser Version)

A fully functional browser-based Tetris game built using **HTML, CSS, and Vanilla JavaScript**.

This version includes textured blocks, arena background, score tracking, speed ramp-up, pause functionality, and game overlays.

---

## Features

* Classic Tetris gameplay
* Speed increases progressively as lines are cleared
* Score tracking
* Next piece preview
* Pause and Resume functionality
* Game Over screen with final score display
* Textured blocks
* Arena background texture
* Keyboard controls
* Fully playable in modern browsers

---

## Controls

| Key          | Action         |
| ------------ | -------------- |
| ←            | Move Left      |
| →            | Move Right     |
| ↓            | Soft Drop      |
| ↑            | Rotate         |
| Pause Button | Pause / Resume |

---

## Project Structure

```
project-folder/
│
├── index.html
├── style.css
├── script.js
└── assets/
    ├── squaretile-block.png
    └── arena-background.jpg
```

---

## How to Run

1. Clone the repository:

```
git clone <your-repo-url>
```

2. Navigate to the project folder:

```
cd <project-folder>
```

3. Open `index.html` in any modern browser.

No server setup or installation required.

---

## Gameplay Logic

* The arena size is fixed at 12 columns x 25 rows.
* Each cleared row increases score by 1.
* Game speed increases progressively after line clears.
* Collision detection prevents overlap and boundary overflow.
* Game ends when new piece collides at spawn position.

---

## Technical Details

* No external libraries
* Pure JavaScript (ES6)
* Canvas-based rendering
* Texture-based block rendering using images
* Responsive layout adjustments
* Modular game loop using `requestAnimationFrame`

---

## Future Enhancements (Optional Ideas)

* High score using Local Storage
* Sound effects
* Mobile touch controls
* Hard drop feature
* Ghost piece preview
* Level system
* Mobile app wrapper (PWA or WebView)

---

## Browser Compatibility

Tested on:

* Chrome
* Edge
* Firefox

Any modern browser supporting HTML5 Canvas should work.

---
