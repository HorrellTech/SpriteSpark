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
    }
};