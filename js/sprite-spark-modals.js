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
    }
};