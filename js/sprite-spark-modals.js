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

    showNeonModal(app) {
        let modal = document.getElementById('effectNeonModal');
        if (modal) modal.remove();
        modal = document.createElement('div');
        modal.id = 'effectNeonModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="min-width:320px;">
                <h2>Neon Effect</h2>
                <label>
                    Neon Color:
                    <input type="color" id="neonColor" value="#00ffff" style="width:60px;">
                </label>
                <label>
                    Intensity:
                    <input type="range" id="neonIntensity" min="1" max="16" value="8" style="width:120px;">
                    <span id="neonIntensityValue">8</span> px
                </label>
                <label>
                    Brightness:
                    <input type="range" id="neonBrightness" min="100" max="300" value="120" style="width:120px;">
                    <span id="neonBrightnessValue">1.2</span>
                </label>
                <div class="modal-actions" style="margin-top:16px;">
                    <button id="neonApplyBtn" class="modal-btn accent">Apply</button>
                    <button id="neonCancelBtn" class="modal-btn">Cancel</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('#neonIntensity').addEventListener('input', function () {
            modal.querySelector('#neonIntensityValue').textContent = this.value;
        });
        modal.querySelector('#neonBrightness').addEventListener('input', function () {
            modal.querySelector('#neonBrightnessValue').textContent = (this.value / 100).toFixed(1);
        });

        modal.querySelector('#neonApplyBtn').onclick = () => {
            const color = modal.querySelector('#neonColor').value;
            const intensity = parseInt(modal.querySelector('#neonIntensity').value, 10);
            const brightness = parseInt(modal.querySelector('#neonBrightness').value, 10) / 100;
            app.applyNeonEffect(color, intensity, brightness);
            modal.remove();
        };
        modal.querySelector('#neonCancelBtn').onclick = () => modal.remove();
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    },

    showOutlineModal(app) {
        let modal = document.getElementById('effectOutlineModal');
        if (modal) modal.remove();
        modal = document.createElement('div');
        modal.id = 'effectOutlineModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="min-width:320px;">
                <h2>Outline Effect</h2>
                <label>
                    Outline Color:
                    <input type="color" id="outlineColor" value="#000000" style="width:60px;">
                </label>
                <label>
                    Thickness:
                    <input type="range" id="outlineThickness" min="1" max="8" value="2" style="width:120px;">
                    <span id="outlineThicknessValue">2</span> px
                </label>
                <div class="modal-actions" style="margin-top:16px;">
                    <button id="outlineApplyBtn" class="modal-btn accent">Apply</button>
                    <button id="outlineCancelBtn" class="modal-btn">Cancel</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('#outlineThickness').addEventListener('input', function () {
            modal.querySelector('#outlineThicknessValue').textContent = this.value;
        });

        modal.querySelector('#outlineApplyBtn').onclick = () => {
            const color = modal.querySelector('#outlineColor').value;
            const thickness = parseInt(modal.querySelector('#outlineThickness').value, 10);
            app.applyOutlineEffect(color, thickness);
            modal.remove();
        };
        modal.querySelector('#outlineCancelBtn').onclick = () => modal.remove();
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    },

    showDropShadowModal(app) {
        let modal = document.getElementById('effectDropShadowModal');
        if (modal) modal.remove();
        modal = document.createElement('div');
        modal.id = 'effectDropShadowModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="min-width:320px;">
                <h2>Drop Shadow Effect</h2>
                <label>
                    Shadow Color:
                    <input type="color" id="shadowColor" value="#000000" style="width:60px;">
                </label>
                <label>
                    Offset X:
                    <input type="range" id="shadowOffsetX" min="-16" max="16" value="4" style="width:120px;">
                    <span id="shadowOffsetXValue">4</span> px
                </label>
                <label>
                    Offset Y:
                    <input type="range" id="shadowOffsetY" min="-16" max="16" value="4" style="width:120px;">
                    <span id="shadowOffsetYValue">4</span> px
                </label>
                <label>
                    Blur:
                    <input type="range" id="shadowBlur" min="0" max="16" value="4" style="width:120px;">
                    <span id="shadowBlurValue">4</span> px
                </label>
                <label>
                    Opacity:
                    <input type="range" id="shadowOpacity" min="0" max="100" value="50" style="width:120px;">
                    <span id="shadowOpacityValue">50</span>%
                </label>
                <div class="modal-actions" style="margin-top:16px;">
                    <button id="shadowApplyBtn" class="modal-btn accent">Apply</button>
                    <button id="shadowCancelBtn" class="modal-btn">Cancel</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('#shadowOffsetX').addEventListener('input', function () {
            modal.querySelector('#shadowOffsetXValue').textContent = this.value;
        });
        modal.querySelector('#shadowOffsetY').addEventListener('input', function () {
            modal.querySelector('#shadowOffsetYValue').textContent = this.value;
        });
        modal.querySelector('#shadowBlur').addEventListener('input', function () {
            modal.querySelector('#shadowBlurValue').textContent = this.value;
        });
        modal.querySelector('#shadowOpacity').addEventListener('input', function () {
            modal.querySelector('#shadowOpacityValue').textContent = this.value;
        });

        modal.querySelector('#shadowApplyBtn').onclick = () => {
            const color = modal.querySelector('#shadowColor').value;
            const offsetX = parseInt(modal.querySelector('#shadowOffsetX').value, 10);
            const offsetY = parseInt(modal.querySelector('#shadowOffsetY').value, 10);
            const blur = parseInt(modal.querySelector('#shadowBlur').value, 10);
            const opacity = parseInt(modal.querySelector('#shadowOpacity').value, 10) / 100;
            app.applyDropShadowEffect(color, offsetX, offsetY, blur, opacity);
            modal.remove();
        };
        modal.querySelector('#shadowCancelBtn').onclick = () => modal.remove();
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    },

    showEmbossModal(app) {
        let modal = document.getElementById('effectEmbossModal');
        if (modal) modal.remove();
        modal = document.createElement('div');
        modal.id = 'effectEmbossModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="min-width:320px;">
                <h2>Emboss Effect</h2>
                <label>
                    Strength:
                    <input type="range" id="embossStrength" min="1" max="5" value="2" style="width:120px;">
                    <span id="embossStrengthValue">2</span>
                </label>
                <div class="modal-actions" style="margin-top:16px;">
                    <button id="embossApplyBtn" class="modal-btn accent">Apply</button>
                    <button id="embossCancelBtn" class="modal-btn">Cancel</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('#embossStrength').addEventListener('input', function () {
            modal.querySelector('#embossStrengthValue').textContent = this.value;
        });

        modal.querySelector('#embossApplyBtn').onclick = () => {
            const strength = parseInt(modal.querySelector('#embossStrength').value, 10);
            app.applyEmbossEffect(strength);
            modal.remove();
        };
        modal.querySelector('#embossCancelBtn').onclick = () => modal.remove();
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    },

    showContrastModal(app) {
        let modal = document.getElementById('effectContrastModal');
        if (modal) modal.remove();
        modal = document.createElement('div');
        modal.id = 'effectContrastModal';
        modal.className = 'modal';
        modal.innerHTML = `
        <div class="modal-content" style="min-width:320px;">
            <h2>Contrast Effect</h2>
            <label>
                Contrast Level:
                <input type="range" id="contrastLevel" min="0.1" max="3" step="0.1" value="1.2" style="width:120px;">
                <span id="contrastLevelValue">1.2</span>
            </label>
            <div class="modal-actions" style="margin-top:16px;">
                <button id="contrastApplyBtn" class="modal-btn accent">Apply</button>
                <button id="contrastCancelBtn" class="modal-btn">Cancel</button>
            </div>
        </div>
    `;
        document.body.appendChild(modal);

        modal.querySelector('#contrastLevel').addEventListener('input', function () {
            modal.querySelector('#contrastLevelValue').textContent = this.value;
        });

        modal.querySelector('#contrastApplyBtn').onclick = () => {
            const contrast = parseFloat(modal.querySelector('#contrastLevel').value);
            app.applyContrastEffect(contrast);
            modal.remove();
        };
        modal.querySelector('#contrastCancelBtn').onclick = () => modal.remove();
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    },

    showBrightnessModal(app) {
        let modal = document.getElementById('effectBrightnessModal');
        if (modal) modal.remove();
        modal = document.createElement('div');
        modal.id = 'effectBrightnessModal';
        modal.className = 'modal';
        modal.innerHTML = `
        <div class="modal-content" style="min-width:320px;">
            <h2>Brightness Effect</h2>
            <label>
                Brightness Level:
                <input type="range" id="brightnessLevel" min="0.1" max="3" step="0.1" value="1.2" style="width:120px;">
                <span id="brightnessLevelValue">1.2</span>
            </label>
            <div class="modal-actions" style="margin-top:16px;">
                <button id="brightnessApplyBtn" class="modal-btn accent">Apply</button>
                <button id="brightnessCancelBtn" class="modal-btn">Cancel</button>
            </div>
        </div>
    `;
        document.body.appendChild(modal);

        modal.querySelector('#brightnessLevel').addEventListener('input', function () {
            modal.querySelector('#brightnessLevelValue').textContent = this.value;
        });

        modal.querySelector('#brightnessApplyBtn').onclick = () => {
            const brightness = parseFloat(modal.querySelector('#brightnessLevel').value);
            app.applyBrightnessEffect(brightness);
            modal.remove();
        };
        modal.querySelector('#brightnessCancelBtn').onclick = () => modal.remove();
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    },

    showVignetteModal(app) {
        let modal = document.getElementById('effectVignetteModal');
        if (modal) modal.remove();
        modal = document.createElement('div');
        modal.id = 'effectVignetteModal';
        modal.className = 'modal';
        modal.innerHTML = `
        <div class="modal-content" style="min-width:320px;">
            <h2>Vignette Effect</h2>
            <label>
                Strength:
                <input type="range" id="vignetteStrength" min="0" max="1" step="0.1" value="0.5" style="width:120px;">
                <span id="vignetteStrengthValue">0.5</span>
            </label>
            <label>
                Falloff:
                <input type="range" id="vignetteFalloff" min="0.1" max="2" step="0.1" value="0.7" style="width:120px;">
                <span id="vignetteFalloffValue">0.7</span>
            </label>
            <div class="modal-actions" style="margin-top:16px;">
                <button id="vignetteApplyBtn" class="modal-btn accent">Apply</button>
                <button id="vignetteCancelBtn" class="modal-btn">Cancel</button>
            </div>
        </div>
    `;
        document.body.appendChild(modal);

        modal.querySelector('#vignetteStrength').addEventListener('input', function () {
            modal.querySelector('#vignetteStrengthValue').textContent = this.value;
        });

        modal.querySelector('#vignetteFalloff').addEventListener('input', function () {
            modal.querySelector('#vignetteFalloffValue').textContent = this.value;
        });

        modal.querySelector('#vignetteApplyBtn').onclick = () => {
            const strength = parseFloat(modal.querySelector('#vignetteStrength').value);
            const falloff = parseFloat(modal.querySelector('#vignetteFalloff').value);
            app.applyVignetteEffect(strength, falloff);
            modal.remove();
        };
        modal.querySelector('#vignetteCancelBtn').onclick = () => modal.remove();
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    },

    showFishEyeModal(app) {
        let modal = document.getElementById('effectFishEyeModal');
        if (modal) modal.remove();
        modal = document.createElement('div');
        modal.id = 'effectFishEyeModal';
        modal.className = 'modal';
        modal.innerHTML = `
        <div class="modal-content" style="min-width:320px;">
            <h2>Fish Eye Effect</h2>
            <label>
                Distortion Strength:
                <input type="range" id="fishEyeStrength" min="0" max="2" step="0.1" value="0.5" style="width:120px;">
                <span id="fishEyeStrengthValue">0.5</span>
            </label>
            <div class="modal-actions" style="margin-top:16px;">
                <button id="fishEyeApplyBtn" class="modal-btn accent">Apply</button>
                <button id="fishEyeCancelBtn" class="modal-btn">Cancel</button>
            </div>
        </div>
    `;
        document.body.appendChild(modal);

        modal.querySelector('#fishEyeStrength').addEventListener('input', function () {
            modal.querySelector('#fishEyeStrengthValue').textContent = this.value;
        });

        modal.querySelector('#fishEyeApplyBtn').onclick = () => {
            const strength = parseFloat(modal.querySelector('#fishEyeStrength').value);
            app.applyFishEyeEffect(strength);
            modal.remove();
        };
        modal.querySelector('#fishEyeCancelBtn').onclick = () => modal.remove();
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    },

    showPixelateModal(app) {
        let modal = document.getElementById('effectPixelateModal');
        if (modal) modal.remove();
        modal = document.createElement('div');
        modal.id = 'effectPixelateModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="min-width:320px;">
                <h2>Pixelate Effect</h2>
                <label>
                    Pixel Size:
                    <input type="range" id="pixelateSize" min="2" max="32" value="8" style="width:120px;">
                    <span id="pixelateSizeValue">8</span> px
                </label>
                <div class="modal-actions" style="margin-top:16px;">
                    <button id="pixelateApplyBtn" class="modal-btn accent">Apply</button>
                    <button id="pixelateCancelBtn" class="modal-btn">Cancel</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('#pixelateSize').addEventListener('input', function () {
            modal.querySelector('#pixelateSizeValue').textContent = this.value;
        });

        modal.querySelector('#pixelateApplyBtn').onclick = () => {
            const pixelSize = parseInt(modal.querySelector('#pixelateSize').value, 10);
            app.applyPixelateEffect(pixelSize);
            modal.remove();
        };
        modal.querySelector('#pixelateCancelBtn').onclick = () => modal.remove();
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    }
};