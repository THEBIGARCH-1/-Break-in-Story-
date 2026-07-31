* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    user-select: none;
}

body, html {
    width: 100%;
    height: 100%;
    overflow: hidden;
    background-color: #000;
    font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

#game-container {
    position: relative;
    width: 100vw;
    height: 100vh;
}

/* Crosshair Reticle */
#crosshair {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 8px;
    height: 8px;
    background: rgba(255, 255, 255, 0.9);
    border: 2px solid rgba(0, 0, 0, 0.5);
    border-radius: 50%;
    pointer-events: none;
    z-index: 10;
}

/* Smooth Fade Overlay */
#fade-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: #000;
    opacity: 0;
    pointer-events: none;
    transition: opacity 1s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 30;
}

#fade-overlay.active {
    opacity: 1;
}

/* Key Display Styling */
.key {
    background: #2196f3;
    color: #fff;
    padding: 3px 8px;
    border-radius: 5px;
    font-weight: bold;
    font-size: 13px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.4);
}

/* Interaction Prompt */
#interaction-prompt {
    position: absolute;
    top: 58%;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(12, 16, 26, 0.9);
    color: #fff;
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 15px;
    display: none;
    border: 1px solid #2196f3;
    box-shadow: 0 0 15px rgba(33, 150, 243, 0.4);
    z-index: 10;
}

/* Stamina HUD */
#stamina-container {
    position: absolute;
    bottom: 110px;
    left: 30px;
    width: 200px;
    z-index: 10;
}

#stamina-label {
    color: #64b5f6;
    font-size: 11px;
    font-weight: bold;
    letter-spacing: 1px;
    margin-bottom: 4px;
    text-shadow: 0 1px 3px rgba(0,0,0,0.8);
}

#stamina-bar-bg {
    width: 100%;
    height: 10px;
    background: rgba(0, 0, 0, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    overflow: hidden;
}

#stamina-bar {
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, #1e88e5, #00e676);
    transition: width 0.1s linear;
}

/* Dialogue Box UI */
#dialogue-box {
    position: absolute;
    top: 30px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(10, 14, 23, 0.95);
    border: 2px solid #2196f3;
    color: white;
    padding: 20px 28px;
    border-radius: 12px;
    text-align: center;
    width: 90%;
    max-width: 540px;
    z-index: 10;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8), 0 0 20px rgba(33, 150, 243, 0.3);
}

#npc-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-bottom: 10px;
}

#npc-badge {
    font-size: 20px;
}

#npc-name {
    color: #64b5f6;
    font-size: 16px;
    font-weight: bold;
    letter-spacing: 1px;
}

#dialogue-text {
    font-size: 15px;
    line-height: 1.5;
    color: #e0e6ed;
    min-height: 45px;
}

#dialogue-hint {
    margin-top: 12px;
    font-size: 12px;
    color: #90a4ae;
}

/* Interactive Bottom Hotbar */
#hotbar {
    position: absolute;
    bottom: 25px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 12px;
    z-index: 20;
}

.slot {
    position: relative;
    width: 70px;
    height: 70px;
    background: rgba(15, 20, 30, 0.85);
    border: 2px solid #37474f;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    outline: none;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.slot:hover {
    border-color: #64b5f6;
    transform: translateY(-2px);
}

.slot.collected {
    border-color: #00e676;
    background: rgba(0, 230, 118, 0.12);
}

.slot.active {
    border-color: #ffeb3b !important;
    box-shadow: 0 0 15px rgba(255, 235, 59, 0.5);
    transform: translateY(-4px);
}

.slot-number {
    position: absolute;
    top: 4px;
    left: 6px;
    font-size: 11px;
    color: #90a4ae;
    font-weight: bold;
}

.slot-label {
    position: absolute;
    bottom: 4px;
    font-size: 10px;
    color: #b0bec5;
    font-weight: 500;
}

.item-icon {
    font-size: 26px;
    opacity: 0.25;
    filter: grayscale(100%);
    transition: all 0.3s ease;
}

.slot.collected .item-icon {
    opacity: 1;
    filter: grayscale(0%);
}
