// SpriteSparkModals: Effects modals for blur/sharpen
window.SpriteSparkModals = {
    showBlurModal(app) {
        let modal = document.getElementById('effectBlurModal');
        if (modal) modal.remove();
        modal = document.createElement('div');
        modal.id = 'effectBlurModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="min-width:320px;">
                <h2>Blur Effect</h2>
                <label>
                    Blur Radius:
                    <input type="range" id="blurRadius" min="1" max="32" value="4" style="width:120px;">
                    <span id="blurRadiusValue">4</span> px
                </label>
                <div class="modal-actions" style="margin-top:16px;">
                    <button id="blurApplyBtn" class="modal-btn accent">Apply</button>
                    <button id="blurCancelBtn" class="modal-btn">Cancel</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('#blurRadius').addEventListener('input', function () {
            modal.querySelector('#blurRadiusValue').textContent = this.value;
        });

        modal.querySelector('#blurApplyBtn').onclick = () => {
            const radius = parseInt(modal.querySelector('#blurRadius').value, 10);
            app.applyBlurEffect(radius);
            modal.remove();
        };
        modal.querySelector('#blurCancelBtn').onclick = () => modal.remove();
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    },

    showSharpenModal(app) {
        let modal = document.getElementById('effectSharpenModal');
        if (modal) modal.remove();
        modal = document.createElement('div');
        modal.id = 'effectSharpenModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="min-width:320px;">
                <h2>Sharpen Effect</h2>
                <label>
                    Sharpen Amount:
                    <input type="range" id="sharpenAmount" min="1" max="5" value="2" style="width:120px;">
                    <span id="sharpenAmountValue">2</span>
                </label>
                <div class="modal-actions" style="margin-top:16px;">
                    <button id="sharpenApplyBtn" class="modal-btn accent">Apply</button>
                    <button id="sharpenCancelBtn" class="modal-btn">Cancel</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('#sharpenAmount').addEventListener('input', function () {
            modal.querySelector('#sharpenAmountValue').textContent = this.value;
        });

        modal.querySelector('#sharpenApplyBtn').onclick = () => {
            const amount = parseInt(modal.querySelector('#sharpenAmount').value, 10);
            app.applySharpenEffect(amount);
            modal.remove();
        };
        modal.querySelector('#sharpenCancelBtn').onclick = () => modal.remove();
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    },

    showHSLModal(app) {
        let modal = document.getElementById('effectHSLModal');
        if (modal) modal.remove();
        modal = document.createElement('div');
        modal.id = 'effectHSLModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="min-width:320px;">
                <h2>HSL Adjustment</h2>
                <label>
                    Hue:
                    <input type="range" id="hueValue" min="-180" max="180" value="0" style="width:120px;">
                    <span id="hueValueLabel">0</span>
                </label>
                <label>
                    Saturation:
                    <input type="range" id="saturationValue" min="-100" max="100" value="0" style="width:120px;">
                    <span id="saturationValueLabel">0</span>
                </label>
                <label>
                    Lightness:
                    <input type="range" id="lightnessValue" min="-100" max="100" value="0" style="width:120px;">
                    <span id="lightnessValueLabel">0</span>
                </label>
                <div class="modal-actions" style="margin-top:16px;">
                    <button id="hslApplyBtn" class="modal-btn accent">Apply</button>
                    <button id="hslCancelBtn" class="modal-btn">Cancel</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Update labels
        modal.querySelector('#hueValue').addEventListener('input', function () {
            modal.querySelector('#hueValueLabel').textContent = this.value;
        });
        modal.querySelector('#saturationValue').addEventListener('input', function () {
            modal.querySelector('#saturationValueLabel').textContent = this.value;
        });
        modal.querySelector('#lightnessValue').addEventListener('input', function () {
            modal.querySelector('#lightnessValueLabel').textContent = this.value;
        });

        modal.querySelector('#hslApplyBtn').onclick = () => {
            const hue = parseInt(modal.querySelector('#hueValue').value, 10);
            const sat = parseInt(modal.querySelector('#saturationValue').value, 10);
            const light = parseInt(modal.querySelector('#lightnessValue').value, 10);
            app.applyHSLEffect(hue, sat, light);
            modal.remove();
        };
        modal.querySelector('#hslCancelBtn').onclick = () => modal.remove();
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    },

    showRecolorModal(app) {
        let modal = document.getElementById('effectRecolorModal');
        if (modal) modal.remove();
        modal = document.createElement('div');
        modal.id = 'effectRecolorModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="min-width:320px;">
                <h2>Recolor</h2>
                <label>
                    From: <input type="color" id="recolorFrom" value="#000000">
                </label>
                <label>
                    To: <input type="color" id="recolorTo" value="#ffffff">
                </label>
                <label>
                    Tolerance: <input type="range" id="recolorTolerance" min="0" max="64" value="0">
                    <span id="recolorToleranceValue">0</span>
                </label>
                <div class="modal-actions" style="margin-top:16px;">
                    <button id="recolorApplyBtn" class="modal-btn accent">Apply</button>
                    <button id="recolorCancelBtn" class="modal-btn">Cancel</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('#recolorTolerance').addEventListener('input', function () {
            modal.querySelector('#recolorToleranceValue').textContent = this.value;
        });

        modal.querySelector('#recolorApplyBtn').onclick = () => {
            const from = modal.querySelector('#recolorFrom').value;
            const to = modal.querySelector('#recolorTo').value;
            const tolerance = parseInt(modal.querySelector('#recolorTolerance').value, 10);
            app.applyRecolorEffect(from, to, tolerance);
            modal.remove();
        };
        modal.querySelector('#recolorCancelBtn').onclick = () => modal.remove();
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    },
    showGlowModal(app) {
        let modal = document.getElementById('effectGlowModal');
        if (modal) modal.remove();
        modal = document.createElement('div');
        modal.id = 'effectGlowModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="min-width:320px;">
                <h2>Glow Effect</h2>
                <label>
                    Glow Color:
                    <input type="color" id="glowColor" value="#ffffff" style="width:60px;">
                </label>
                <label>
                    Thickness:
                    <input type="range" id="glowThickness" min="1" max="32" value="8" style="width:120px;">
                    <span id="glowThicknessValue">8</span> px
                </label>
                <label>
                    Opacity:
                    <input type="range" id="glowOpacity" min="0" max="100" value="80" style="width:120px;">
                    <span id="glowOpacityValue">80</span>%
                </label>
                <div class="modal-actions" style="margin-top:16px;">
                    <button id="glowApplyBtn" class="modal-btn accent">Apply</button>
                    <button id="glowCancelBtn" class="modal-btn">Cancel</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Update value labels
        modal.querySelector('#glowThickness').addEventListener('input', function () {
            modal.querySelector('#glowThicknessValue').textContent = this.value;
        });
        modal.querySelector('#glowOpacity').addEventListener('input', function () {
            modal.querySelector('#glowOpacityValue').textContent = this.value;
        });

        modal.querySelector('#glowApplyBtn').onclick = () => {
            const color = modal.querySelector('#glowColor').value;
            const thickness = parseInt(modal.querySelector('#glowThickness').value, 10);
            const opacity = parseInt(modal.querySelector('#glowOpacity').value, 10) / 100;
            app.applyGlowEffect(color, thickness, opacity);
            modal.remove();
        };
        modal.querySelector('#glowCancelBtn').onclick = () => modal.remove();
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    },

    // Outline effect
    applyOutlineEffect(color = '#000000', thickness = 2) {
        this.undoAdd();
        
        const frame = this.frames[this.currentFrame];
        if (!frame || !this.activeLayerId) return;
        
        const layerIndex = this.layers.findIndex(l => l.id === this.activeLayerId);
        if (layerIndex === -1) return;
        
        const layer = frame.layers[layerIndex];
        if (!layer || !layer.isVisible) return;
        
        const ctx = layer.canvas.getContext('2d');
        const original = document.createElement('canvas');
        original.width = layer.canvas.width;
        original.height = layer.canvas.height;
        original.getContext('2d').drawImage(layer.canvas, 0, 0);
        
        // Create outline by drawing the shape multiple times in different positions
        ctx.globalCompositeOperation = 'destination-over';
        ctx.fillStyle = color;
        
        for (let dx = -thickness; dx <= thickness; dx++) {
            for (let dy = -thickness; dy <= thickness; dy++) {
                if (dx === 0 && dy === 0) continue;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist <= thickness) {
                    ctx.globalAlpha = 1 - (dist / thickness) * 0.5; // Fade edges
                    ctx.drawImage(original, dx, dy);
                }
            }
        }
        
        // Draw original on top
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(original, 0, 0);
        
        this.syncGlobalLayersToCurrentFrame();
        this.renderCurrentFrameToMainCanvas();
    }

    // Drop shadow effect
    applyDropShadowEffect(color = '#000000', offsetX = 4, offsetY = 4, blur = 4, opacity = 0.5) {
        this.undoAdd();
        
        const frame = this.frames[this.currentFrame];
        if (!frame || !this.activeLayerId) return;
        
        const layerIndex = this.layers.findIndex(l => l.id === this.activeLayerId);
        if (layerIndex === -1) return;
        
        const layer = frame.layers[layerIndex];
        if (!layer || !layer.isVisible) return;
        
        const ctx = layer.canvas.getContext('2d');
        const original = document.createElement('canvas');
        original.width = layer.canvas.width;
        original.height = layer.canvas.height;
        original.getContext('2d').drawImage(layer.canvas, 0, 0);
        
        // Create shadow
        const shadow = document.createElement('canvas');
        shadow.width = layer.canvas.width;
        shadow.height = layer.canvas.height;
        const shadowCtx = shadow.getContext('2d');
        
        shadowCtx.drawImage(layer.canvas, 0, 0);
        shadowCtx.globalCompositeOperation = 'source-in';
        shadowCtx.fillStyle = color;
        shadowCtx.fillRect(0, 0, shadow.width, shadow.height);
        
        if (blur > 0) {
            shadowCtx.filter = `blur(${blur}px)`;
            shadowCtx.drawImage(shadow, 0, 0);
        }
        
        ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
        
        // Draw shadow first
        ctx.globalAlpha = opacity;
        ctx.drawImage(shadow, offsetX, offsetY);
        
        // Draw original on top
        ctx.globalAlpha = 1;
        ctx.drawImage(original, 0, 0);
        
        this.syncGlobalLayersToCurrentFrame();
        this.renderCurrentFrameToMainCanvas();
    }

    // Pixelate effect
    applyPixelateEffect(pixelSize = 8) {
        this.undoAdd();
        
        const frame = this.frames[this.currentFrame];
        if (!frame || !this.activeLayerId) return;
        
        const layerIndex = this.layers.findIndex(l => l.id === this.activeLayerId);
        if (layerIndex === -1) return;
        
        const layer = frame.layers[layerIndex];
        if (!layer || !layer.isVisible) return;
        
        const ctx = layer.canvas.getContext('2d');
        const w = layer.canvas.width, h = layer.canvas.height;
        
        // Turn off image smoothing for pixelated look
        ctx.imageSmoothingEnabled = false;
        
        // Scale down then scale back up
        const tempCanvas = document.createElement('canvas');
        const newW = Math.max(1, Math.floor(w / pixelSize));
        const newH = Math.max(1, Math.floor(h / pixelSize));
        tempCanvas.width = newW;
        tempCanvas.height = newH;
        
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.imageSmoothingEnabled = false;
        tempCtx.drawImage(layer.canvas, 0, 0, w, h, 0, 0, newW, newH);
        
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(tempCanvas, 0, 0, newW, newH, 0, 0, w, h);
        
        this.syncGlobalLayersToCurrentFrame();
        this.renderCurrentFrameToMainCanvas();
    }
};