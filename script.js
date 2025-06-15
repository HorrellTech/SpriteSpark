// SpriteSpark Animation Studio - Main JavaScript
class SpriteSpark {
    constructor() {
        this.initializeProperties();
        this.initializeCanvases();
        this.initializeEventListeners();
        this.initializeColorPalette();
        this.initializeFrames();
        this.initializeLayers();
        this.initializeTheme();
        this.updateZoomLevel();
        this.drawGrid();
    }

    initializeProperties() {
        // Animation properties
        this.frames = [];
        this.currentFrame = 0;
        this.layers = [];
        this.currentLayer = 0;
        this.isPlaying = false;
        this.fps = 12;
        this.playInterval = null;

        // Canvas properties
        this.canvasWidth = 320;
        this.canvasHeight = 240;
        this.zoom = 1;
        this.showGrid = true;
        this.isDrawing = false;

        // Drawing properties
        this.currentTool = 'pen';
        this.primaryColor = '#000000';
        this.secondaryColor = '#ffffff';
        this.brushSize = 1;
        this.opacity = 100;

        // UI properties
        this.theme = 'dark';
        this.leftPanelWidth = 280;
        this.rightPanelWidth = 280;

        // Mouse properties
        this.mouseX = 0;
        this.mouseY = 0;
        this.lastX = 0;
        this.lastY = 0;

        // Undo/Redo system
        this.undoStack = [];
        this.redoStack = [];
        this.maxUndoSteps = 50;
    }

    initializeCanvases() {
        this.mainCanvas = document.getElementById('mainCanvas');
        this.gridCanvas = document.getElementById('gridCanvas');
        this.ghostCanvas = document.getElementById('ghostCanvas');

        this.mainCtx = this.mainCanvas.getContext('2d');
        this.gridCtx = this.gridCanvas.getContext('2d');
        this.ghostCtx = this.ghostCanvas.getContext('2d');

        // Set canvas sizes
        this.resizeCanvases();

        // Configure context settings
        this.mainCtx.imageSmoothingEnabled = false;
        this.gridCtx.imageSmoothingEnabled = false;
        this.ghostCtx.imageSmoothingEnabled = false;
    }

    initializeEventListeners() {
        // Menu and toolbar actions
        document.addEventListener('click', this.handleMenuClick.bind(this));
        document.addEventListener('change', this.handleInputChange.bind(this));

        // Canvas events
        this.mainCanvas.addEventListener('mousedown', this.startDrawing.bind(this));
        this.mainCanvas.addEventListener('mousemove', this.draw.bind(this));
        this.mainCanvas.addEventListener('mouseup', this.stopDrawing.bind(this));
        this.mainCanvas.addEventListener('mouseleave', this.stopDrawing.bind(this));
        this.mainCanvas.addEventListener('contextmenu', e => e.preventDefault());

        // Ghost cursor
        this.mainCanvas.addEventListener('mousemove', this.updateGhostCursor.bind(this));
        this.mainCanvas.addEventListener('mouseenter', this.showGhostCursor.bind(this));
        this.mainCanvas.addEventListener('mouseleave', this.hideGhostCursor.bind(this));

        // Panel resizing
        this.initializePanelResizing();

        // Keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyboard.bind(this));

        // Window resize
        window.addEventListener('resize', this.handleResize.bind(this));

        // File input
        const fileInput = document.getElementById('fileInput');
        fileInput.addEventListener('change', this.handleFileLoad.bind(this));

        // Color picker
        const colorPicker = document.getElementById('colorPicker');
        colorPicker.addEventListener('change', this.handleColorChange.bind(this));

        // Tool properties
        this.initializeToolProperties();
    }

    initializeToolProperties() {
        const brushSize = document.getElementById('brushSize');
        const opacity = document.getElementById('opacity');
        const brushSizeValue = document.getElementById('brushSizeValue');
        const opacityValue = document.getElementById('opacityValue');

        brushSize.addEventListener('input', (e) => {
            this.brushSize = parseInt(e.target.value);
            brushSizeValue.textContent = this.brushSize;
            this.updateGhostCursor();
        });

        opacity.addEventListener('input', (e) => {
            this.opacity = parseInt(e.target.value);
            opacityValue.textContent = this.opacity;
        });
    }

    initializePanelResizing() {
        const leftResize = document.querySelector('.left-resize');
        const rightResize = document.querySelector('.right-resize');
        const leftPanel = document.getElementById('leftPanel');
        const rightPanel = document.getElementById('rightPanel');

        let isResizing = false;
        let resizePanel = null;

        const startResize = (e, panel) => {
            isResizing = true;
            resizePanel = panel;
            document.body.style.cursor = 'ew-resize';
            e.preventDefault();
        };

        const resize = (e) => {
            if (!isResizing) return;

            if (resizePanel === 'left') {
                const newWidth = e.clientX;
                if (newWidth >= 200 && newWidth <= 400) {
                    leftPanel.style.width = newWidth + 'px';
                    leftResize.style.left = newWidth + 'px';
                    this.leftPanelWidth = newWidth;
                }
            } else if (resizePanel === 'right') {
                const newWidth = window.innerWidth - e.clientX;
                if (newWidth >= 200 && newWidth <= 400) {
                    rightPanel.style.width = newWidth + 'px';
                    rightResize.style.right = newWidth + 'px';
                    this.rightPanelWidth = newWidth;
                }
            }
        };

        const stopResize = () => {
            isResizing = false;
            resizePanel = null;
            document.body.style.cursor = '';
        };

        leftResize.addEventListener('mousedown', (e) => startResize(e, 'left'));
        rightResize.addEventListener('mousedown', (e) => startResize(e, 'right'));
        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', stopResize);
    }

    initializeColorPalette() {
        const palette = document.getElementById('colorPalette');
        const defaultColors = [
            '#000000', '#404040', '#808080', '#c0c0c0',
            '#ffffff', '#ff0000', '#00ff00', '#0000ff',
            '#ffff00', '#ff00ff', '#00ffff', '#800000',
            '#008000', '#000080', '#808000', '#800080',
            '#008080', '#ffa500', '#ffc0cb', '#a52a2a',
            '#dda0dd', '#98fb98', '#f0e68c', '#87ceeb',
            '#ff6347', '#40e0d0', '#ee82ee', '#90ee90',
            '#ffd700', '#ff69b4', '#cd853f', '#4682b4'
        ];

        defaultColors.forEach(color => {
            const swatch = document.createElement('div');
            swatch.className = 'color-swatch';
            swatch.style.backgroundColor = color;
            swatch.title = color;
            swatch.addEventListener('click', () => {
                this.primaryColor = color;
                document.getElementById('primaryColor').style.backgroundColor = color;
                document.getElementById('colorPicker').value = color;
            });
            palette.appendChild(swatch);
        });

        // Set initial colors
        document.getElementById('primaryColor').style.backgroundColor = this.primaryColor;
        document.getElementById('secondaryColor').style.backgroundColor = this.secondaryColor;
    }

    initializeFrames() {
        // Create initial frame
        this.frames = [this.createEmptyFrame()];
        this.updateFramesList();
    }

    initializeLayers() {
        // Create initial layer
        this.layers = [{
            name: 'Layer 1',
            visible: true,
            opacity: 100,
            canvas: this.createLayerCanvas()
        }];
        this.updateLayersList();
    }

    initializeTheme() {
        // Apply default theme
        this.applyTheme(this.theme);
    }

    createEmptyFrame() {
        const canvas = document.createElement('canvas');
        canvas.width = this.canvasWidth;
        canvas.height = this.canvasHeight;
        return {
            canvas: canvas,
            layers: [this.createLayerCanvas()]
        };
    }

    createLayerCanvas() {
        const canvas = document.createElement('canvas');
        canvas.width = this.canvasWidth;
        canvas.height = this.canvasHeight;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        return canvas;
    }

    handleMenuClick(e) {
        const action = e.target.getAttribute('data-action');
        if (!action) return;

        switch (action) {
            case 'new':
                this.newProject();
                break;
            case 'open':
                this.openProject();
                break;
            case 'save':
                this.saveProject();
                break;
            case 'save-as':
                this.saveProjectAs();
                break;
            case 'export':
                this.exportAnimation();
                break;
            case 'undo':
                this.undo();
                break;
            case 'redo':
                this.redo();
                break;
            case 'copy':
                this.copyFrame();
                break;
            case 'paste':
                this.pasteFrame();
                break;
            case 'clear':
                this.clearFrame();
                break;
            case 'flip-h':
                this.flipHorizontal();
                break;
            case 'flip-v':
                this.flipVertical();
                break;
            case 'rotate':
                this.rotate();
                break;
            case 'zoom-in':
                this.zoomIn();
                break;
            case 'zoom-out':
                this.zoomOut();
                break;
            case 'zoom-fit':
                this.zoomFit();
                break;
            case 'toggle-grid':
                this.toggleGrid();
                break;
            case 'prev-frame':
                this.previousFrame();
                break;
            case 'next-frame':
                this.nextFrame();
                break;
            case 'play':
                this.togglePlayback();
                break;
            case 'add-frame':
                this.addFrame();
                break;
            case 'delete-frame':
                this.deleteFrame();
                break;
            case 'duplicate-frame':
                this.duplicateFrame();
                break;
            case 'add-layer':
                this.addLayer();
                break;
            case 'delete-layer':
                this.deleteLayer();
                break;
            case 'duplicate-layer':
                this.duplicateLayer();
                break;
            default:
                if (action.startsWith('theme-')) {
                    const theme = action.replace('theme-', '');
                    this.applyTheme(theme);
                }
                break;
        }

        // Handle tool selection
        if (e.target.classList.contains('drawing-tool')) {
            this.selectTool(action);
        }

        // Handle layer selection
        if (e.target.closest('.layer-item')) {
            const layerIndex = parseInt(e.target.closest('.layer-item').getAttribute('data-layer'));
            this.selectLayer(layerIndex);
        }

        // Handle frame selection
        if (e.target.closest('.frame-item')) {
            const frameIndex = parseInt(e.target.closest('.frame-item').getAttribute('data-frame'));
            this.selectFrame(frameIndex);
        }
    }

    handleInputChange(e) {
        if (e.target.id === 'fpsInput') {
            this.fps = parseInt(e.target.value);
        }
    }

    handleColorChange(e) {
        this.primaryColor = e.target.value;
        document.getElementById('primaryColor').style.backgroundColor = this.primaryColor;
    }

    selectTool(tool) {
        this.currentTool = tool;
        document.querySelectorAll('.drawing-tool').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-tool="${tool}"]`).classList.add('active');
        
        // Update cursor based on tool
        this.updateCursor();
    }

    updateCursor() {
        const canvas = this.mainCanvas;
        switch (this.currentTool) {
            case 'pen':
                canvas.style.cursor = 'crosshair';
                break;
            case 'eraser':
                canvas.style.cursor = 'crosshair';
                break;
            case 'bucket':
                canvas.style.cursor = 'crosshair';
                break;
            case 'eyedropper':
                canvas.style.cursor = 'crosshair';
                break;
            default:
                canvas.style.cursor = 'default';
        }
    }

    startDrawing(e) {
        if (this.currentTool === 'eyedropper') {
            this.pickColor(e);
            return;
        }

        this.isDrawing = true;
        this.saveToUndoStack();
        
        const rect = this.mainCanvas.getBoundingClientRect();
        this.lastX = Math.floor((e.clientX - rect.left) / this.zoom);
        this.lastY = Math.floor((e.clientY - rect.top) / this.zoom);

        if (this.currentTool === 'bucket') {
            this.floodFill(this.lastX, this.lastY);
        } else {
            this.drawPixel(this.lastX, this.lastY);
        }
    }

    draw(e) {
        if (!this.isDrawing) return;
        if (this.currentTool === 'bucket' || this.currentTool === 'eyedropper') return;

        const rect = this.mainCanvas.getBoundingClientRect();
        const currentX = Math.floor((e.clientX - rect.left) / this.zoom);
        const currentY = Math.floor((e.clientY - rect.top) / this.zoom);

        this.drawLine(this.lastX, this.lastY, currentX, currentY);
        
        this.lastX = currentX;
        this.lastY = currentY;
    }

    stopDrawing() {
        this.isDrawing = false;
        this.updateFrameThumbnail();
    }

    drawPixel(x, y) {
        if (x < 0 || x >= this.canvasWidth || y < 0 || y >= this.canvasHeight) return;

        const ctx = this.mainCtx;
        const color = this.currentTool === 'eraser' ? 'transparent' : this.primaryColor;
        
        ctx.globalCompositeOperation = this.currentTool === 'eraser' ? 'destination-out' : 'source-over';
        ctx.globalAlpha = this.opacity / 100;
        
        if (this.currentTool === 'eraser') {
            ctx.clearRect(x, y, this.brushSize, this.brushSize);
        } else {
            ctx.fillStyle = color;
            ctx.fillRect(x, y, this.brushSize, this.brushSize);
        }
        
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
    }

    drawLine(x0, y0, x1, y1) {
        // Bresenham's line algorithm for pixel-perfect lines
        const dx = Math.abs(x1 - x0);
        const dy = Math.abs(y1 - y0);
        const sx = x0 < x1 ? 1 : -1;
        const sy = y0 < y1 ? 1 : -1;
        let err = dx - dy;

        let x = x0;
        let y = y0;

        while (true) {
            this.drawPixel(x, y);

            if (x === x1 && y === y1) break;

            const e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x += sx;
            }
            if (e2 < dx) {
                err += dx;
                y += sy;
            }
        }
    }

    floodFill(x, y) {
        // Simple flood fill implementation
        const imageData = this.mainCtx.getImageData(0, 0, this.canvasWidth, this.canvasHeight);
        const data = imageData.data;
        const targetColor = this.getPixelColor(data, x, y);
        const fillColor = this.hexToRgb(this.primaryColor);

        if (this.colorsEqual(targetColor, fillColor)) return;

        const stack = [[x, y]];
        const visited = new Set();

        while (stack.length > 0) {
            const [currentX, currentY] = stack.pop();
            const key = `${currentX},${currentY}`;

            if (visited.has(key)) continue;
            if (currentX < 0 || currentX >= this.canvasWidth || currentY < 0 || currentY >= this.canvasHeight) continue;

            const currentColor = this.getPixelColor(data, currentX, currentY);
            if (!this.colorsEqual(currentColor, targetColor)) continue;

            visited.add(key);
            this.setPixelColor(data, currentX, currentY, fillColor);

            stack.push([currentX + 1, currentY]);
            stack.push([currentX - 1, currentY]);
            stack.push([currentX, currentY + 1]);
            stack.push([currentX, currentY - 1]);
        }

        this.mainCtx.putImageData(imageData, 0, 0);
    }

    getPixelColor(data, x, y) {
        const index = (y * this.canvasWidth + x) * 4;
        return {
            r: data[index],
            g: data[index + 1],
            b: data[index + 2],
            a: data[index + 3]
        };
    }

    setPixelColor(data, x, y, color) {
        const index = (y * this.canvasWidth + x) * 4;
        data[index] = color.r;
        data[index + 1] = color.g;
        data[index + 2] = color.b;
        data[index + 3] = color.a;
    }

    colorsEqual(color1, color2) {
        return color1.r === color2.r && color1.g === color2.g && color1.b === color2.b && color1.a === color2.a;
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
            a: 255
        } : null;
    }

    pickColor(e) {
        const rect = this.mainCanvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / this.zoom);
        const y = Math.floor((e.clientY - rect.top) / this.zoom);

        const imageData = this.mainCtx.getImageData(x, y, 1, 1);
        const data = imageData.data;
        const color = `#${((1 << 24) + (data[0] << 16) + (data[1] << 8) + data[2]).toString(16).slice(1)}`;

        this.primaryColor = color;
        document.getElementById('primaryColor').style.backgroundColor = color;
        document.getElementById('colorPicker').value = color;
    }

    updateGhostCursor(e) {
        const rect = this.mainCanvas.getBoundingClientRect();
        this.mouseX = Math.floor((e.clientX - rect.left) / this.zoom);
        this.mouseY = Math.floor((e.clientY - rect.top) / this.zoom);
        this.drawGhostCursor();
    }

    showGhostCursor() {
        this.ghostCanvas.style.display = 'block';
    }

    hideGhostCursor() {
        this.ghostCanvas.style.display = 'none';
        this.ghostCtx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    }

    drawGhostCursor() {
        this.ghostCtx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        if (this.mouseX < 0 || this.mouseX >= this.canvasWidth || this.mouseY < 0 || this.mouseY >= this.canvasHeight) return;

        this.ghostCtx.globalAlpha = 0.5;
        this.ghostCtx.fillStyle = this.currentTool === 'eraser' ? '#ff0000' : this.primaryColor;
        this.ghostCtx.fillRect(this.mouseX, this.mouseY, this.brushSize, this.brushSize);
        this.ghostCtx.globalAlpha = 1;
    }

    drawGrid() {
        if (!this.showGrid) {
            this.gridCtx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
            return;
        }

        this.gridCtx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.gridCtx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--border-color');
        this.gridCtx.lineWidth = 1;

        // Only show grid when zoomed in enough
        if (this.zoom >= 4) {
            for (let x = 0; x <= this.canvasWidth; x++) {
                this.gridCtx.beginPath();
                this.gridCtx.moveTo(x, 0);
                this.gridCtx.lineTo(x, this.canvasHeight);
                this.gridCtx.stroke();
            }

            for (let y = 0; y <= this.canvasHeight; y++) {
                this.gridCtx.beginPath();
                this.gridCtx.moveTo(0, y);
                this.gridCtx.lineTo(this.canvasWidth, y);
                this.gridCtx.stroke();
            }
        }
    }

    resizeCanvases() {
        const canvases = [this.mainCanvas, this.gridCanvas, this.ghostCanvas];
        canvases.forEach(canvas => {
            canvas.style.width = (this.canvasWidth * this.zoom) + 'px';
            canvas.style.height = (this.canvasHeight * this.zoom) + 'px';
        });
    }

    zoomIn() {
        if (this.zoom < 32) {
            this.zoom *= 2;
            this.updateZoomLevel();
            this.resizeCanvases();
            this.drawGrid();
        }
    }

    zoomOut() {
        if (this.zoom > 0.25) {
            this.zoom /= 2;
            this.updateZoomLevel();
            this.resizeCanvases();
            this.drawGrid();
        }
    }

    zoomFit() {
        const container = document.querySelector('.canvas-container');
        const containerRect = container.getBoundingClientRect();
        const maxZoom = Math.min(
            (containerRect.width - 40) / this.canvasWidth,
            (containerRect.height - 40) / this.canvasHeight
        );
        this.zoom = Math.max(0.25, maxZoom);
        this.updateZoomLevel();
        this.resizeCanvases();
        this.drawGrid();
    }

    updateZoomLevel() {
        document.querySelector('.zoom-level').textContent = Math.round(this.zoom * 100) + '%';
    }

    toggleGrid() {
        this.showGrid = !this.showGrid;
        this.drawGrid();
    }

    togglePlayback() {
        if (this.isPlaying) {
            this.stopAnimation();
        } else {
            this.playAnimation();
        }
    }

    playAnimation() {
        if (this.frames.length <= 1) return;

        this.isPlaying = true;
        document.querySelector('.play-icon').style.display = 'none';
        document.querySelector('.pause-icon').style.display = 'block';

        this.playInterval = setInterval(() => {
            this.nextFrame();
            if (this.currentFrame === this.frames.length - 1 && !document.getElementById('loopAnimation').checked) {
                this.stopAnimation();
            }
        }, 1000 / this.fps);
    }

    stopAnimation() {
        this.isPlaying = false;
        document.querySelector('.play-icon').style.display = 'block';
        document.querySelector('.pause-icon').style.display = 'none';

        if (this.playInterval) {
            clearInterval(this.playInterval);
            this.playInterval = null;
        }
    }

    previousFrame() {
        if (this.currentFrame > 0) {
            this.selectFrame(this.currentFrame - 1);
        } else if (document.getElementById('loopAnimation').checked) {
            this.selectFrame(this.frames.length - 1);
        }
    }

    nextFrame() {
        if (this.currentFrame < this.frames.length - 1) {
            this.selectFrame(this.currentFrame + 1);
        } else if (document.getElementById('loopAnimation').checked) {
            this.selectFrame(0);
        }
    }

    selectFrame(index) {
        if (index < 0 || index >= this.frames.length) return;

        this.currentFrame = index;
        this.loadFrame(index);
        this.updateFramesList();
    }

    loadFrame(index) {
        const frame = this.frames[index];
        this.mainCtx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        // Draw all layers of the frame
        frame.layers.forEach((layer, layerIndex) => {
            if (this.layers[layerIndex] && this.layers[layerIndex].visible) {
                this.mainCtx.globalAlpha = this.layers[layerIndex].opacity / 100;
                this.mainCtx.drawImage(layer, 0, 0);
            }
        });
        
        this.mainCtx.globalAlpha = 1;
    }

    addFrame() {
        const newFrame = this.createEmptyFrame();
        this.frames.push(newFrame);
        this.selectFrame(this.frames.length - 1);
        this.updateFramesList();
    }

    deleteFrame() {
        if (this.frames.length <= 1) return;

        this.frames.splice(this.currentFrame, 1);
        if (this.currentFrame >= this.frames.length) {
            this.currentFrame = this.frames.length - 1;
        }
        this.selectFrame(this.currentFrame);
        this.updateFramesList();
    }

    duplicateFrame() {
        const currentFrame = this.frames[this.currentFrame];
        const newFrame = this.createEmptyFrame();
        
        // Copy each layer
        currentFrame.layers.forEach((layer, index) => {
            const ctx = newFrame.layers[index].getContext('2d');
            ctx.drawImage(layer, 0, 0);
        });

        this.frames.splice(this.currentFrame + 1, 0, newFrame);
        this.selectFrame(this.currentFrame + 1);
        this.updateFramesList();
    }

    updateFramesList() {
        const framesList = document.getElementById('framesList');
        framesList.innerHTML = '';

        this.frames.forEach((frame, index) => {
            const frameItem = document.createElement('div');
            frameItem.className = 'frame-item';
            frameItem.setAttribute('data-frame', index);
            if (index === this.currentFrame) {
                frameItem.classList.add('active');
            }

            frameItem.innerHTML = `
                <div class="frame-number">${index + 1}</div>
                <div class="frame-thumbnail">
                    <canvas width="64" height="48"></canvas>
                </div>
            `;

            framesList.appendChild(frameItem);
        });

        this.updateFrameThumbnail();
    }

    updateFrameThumbnail() {
        const frameItems = document.querySelectorAll('.frame-item');
        const currentFrameItem = frameItems[this.currentFrame];
        if (!currentFrameItem) return;

        const thumbnail = currentFrameItem.querySelector('canvas');
        const ctx = thumbnail.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        
        ctx.clearRect(0, 0, 64, 48);
        ctx.drawImage(this.mainCanvas, 0, 0, 64, 48);
    }

    selectLayer(index) {
        if (index < 0 || index >= this.layers.length) return;

        this.currentLayer = index;
        this.updateLayersList();
    }

    addLayer() {
        const newLayer = {
            name: `Layer ${this.layers.length + 1}`,
            visible: true,
            opacity: 100,
            canvas: this.createLayerCanvas()
        };
        this.layers.push(newLayer);
        this.selectLayer(this.layers.length - 1);
        this.updateLayersList();
    }

    deleteLayer() {
        if (this.layers.length <= 1) return;

        this.layers.splice(this.currentLayer, 1);
        if (this.currentLayer >= this.layers.length) {
            this.currentLayer = this.layers.length - 1;
        }
        this.selectLayer(this.currentLayer);
        this.updateLayersList();
    }

    duplicateLayer() {
        const currentLayer = this.layers[this.currentLayer];
        const newLayer = {
            name: currentLayer.name + ' Copy',
            visible: true,
            opacity: 100,
            canvas: this.createLayerCanvas()
        };

        const ctx = newLayer.canvas.getContext('2d');
        ctx.drawImage(currentLayer.canvas, 0, 0);

        this.layers.splice(this.currentLayer + 1, 0, newLayer);
        this.selectLayer(this.currentLayer + 1);
        this.updateLayersList();
    }

    updateLayersList() {
        const layersList = document.getElementById('layersList');
        layersList.innerHTML = '';

        this.layers.forEach((layer, index) => {
            const layerItem = document.createElement('div');
            layerItem.className = 'layer-item';
            layerItem.setAttribute('data-layer', index);
            if (index === this.currentLayer) {
                layerItem.classList.add('active');
            }

            layerItem.innerHTML = `
                <div class="layer-visibility">${layer.visible ? '👁' : '🙈'}</div>
                <div class="layer-name">${layer.name}</div>
                <div class="layer-opacity">
                    <input type="range" min="0" max="100" value="${layer.opacity}" class="opacity-slider">
                </div>
            `;

            layersList.appendChild(layerItem);
        });
    }

    applyTheme(themeName) {
        this.theme = themeName;
        document.documentElement.setAttribute('data-theme', themeName);
        
        // Update grid after theme change
        setTimeout(() => this.drawGrid(), 100);
    }

    saveToUndoStack() {
        const imageData = this.mainCtx.getImageData(0, 0, this.canvasWidth, this.canvasHeight);
        this.undoStack.push(imageData);
        
        if (this.undoStack.length > this.maxUndoSteps) {
            this.undoStack.shift();
        }
        
        this.redoStack = [];
    }

    undo() {
        if (this.undoStack.length === 0) return;

        const currentState = this.mainCtx.getImageData(0, 0, this.canvasWidth, this.canvasHeight);
        this.redoStack.push(currentState);

        const previousState = this.undoStack.pop();
        this.mainCtx.putImageData(previousState, 0, 0);
        this.updateFrameThumbnail();
    }

    redo() {
        if (this.redoStack.length === 0) return;

        const currentState = this.mainCtx.getImageData(0, 0, this.canvasWidth, this.canvasHeight);
        this.undoStack.push(currentState);

        const nextState = this.redoStack.pop();
        this.mainCtx.putImageData(nextState, 0, 0);
        this.updateFrameThumbnail();
    }

    newProject() {
        if (confirm('Create a new project? This will clear all current work.')) {
            this.frames = [this.createEmptyFrame()];
            this.currentFrame = 0;
            this.layers = [{
                name: 'Layer 1',
                visible: true,
                opacity: 100,
                canvas: this.createLayerCanvas()
            }];
            this.currentLayer = 0;
            this.mainCtx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
            this.updateFramesList();
            this.updateLayersList();
            this.undoStack = [];
            this.redoStack = [];
        }
    }

    openProject() {
        document.getElementById('fileInput').click();
    }

    handleFileLoad(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                this.loadProjectData(data);
            } catch (error) {
                alert('Error loading project file: ' + error.message);
            }
        };
        reader.readAsText(file);
    }

    saveProject() {
        this.saveProjectAs();
    }

    saveProjectAs() {
        const projectData = {
            frames: this.frames.map(frame => ({
                dataURL: frame.canvas.toDataURL()
            })),
            layers: this.layers.map(layer => ({
                name: layer.name,
                visible: layer.visible,
                opacity: layer.opacity
            })),
            canvasWidth: this.canvasWidth,
            canvasHeight: this.canvasHeight,
            fps: this.fps
        };

        const blob = new Blob([JSON.stringify(projectData, null, 2)], {
            type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'spritespark-project.json';
        a.click();
        
        URL.revokeObjectURL(url);
    }

    exportAnimation() {
        // Export as animated GIF (simplified version)
        // In a real implementation, you'd use a library like gif.js
        alert('Export functionality would be implemented with a GIF encoding library');
    }

    handleKeyboard(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'z':
                    e.preventDefault();
                    if (e.shiftKey) {
                        this.redo();
                    } else {
                        this.undo();
                    }
                    break;
                case 'n':
                    e.preventDefault();
                    this.newProject();
                    break;
                case 'o':
                    e.preventDefault();
                    this.openProject();
                    break;
                case 's':
                    e.preventDefault();
                    this.saveProject();
                    break;
            }
        }

        // Tool shortcuts
        switch (e.key) {
            case 'b':
                this.selectTool('pen');
                break;
            case 'e':
                this.selectTool('eraser');
                break;
            case 'g':
                this.selectTool('bucket');
                break;
            case 'i':
                this.selectTool('eyedropper');
                break;
            case ' ':
                e.preventDefault();
                this.togglePlayback();
                break;
        }
    }

    handleResize() {
        // Update panel positions
        const leftResize = document.querySelector('.left-resize');
        const rightResize = document.querySelector('.right-resize');
        leftResize.style.left = this.leftPanelWidth + 'px';
        rightResize.style.right = this.rightPanelWidth + 'px';
    }

    // Additional utility methods
    clearFrame() {
        if (confirm('Clear the current frame?')) {
            this.saveToUndoStack();
            this.mainCtx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
            this.updateFrameThumbnail();
        }
    }

    flipHorizontal() {
        this.saveToUndoStack();
        const imageData = this.mainCtx.getImageData(0, 0, this.canvasWidth, this.canvasHeight);
        this.mainCtx.save();
        this.mainCtx.scale(-1, 1);
        this.mainCtx.putImageData(imageData, -this.canvasWidth, 0);
        this.mainCtx.restore();
        this.updateFrameThumbnail();
    }

    flipVertical() {
        this.saveToUndoStack();
        const imageData = this.mainCtx.getImageData(0, 0, this.canvasWidth, this.canvasHeight);
        this.mainCtx.save();
        this.mainCtx.scale(1, -1);
        this.mainCtx.putImageData(imageData, 0, -this.canvasHeight);
        this.mainCtx.restore();
        this.updateFrameThumbnail();
    }

    rotate() {
        this.saveToUndoStack();
        const imageData = this.mainCtx.getImageData(0, 0, this.canvasWidth, this.canvasHeight);
        this.mainCtx.save();
        this.mainCtx.translate(this.canvasWidth / 2, this.canvasHeight / 2);
        this.mainCtx.rotate(Math.PI / 2);
        this.mainCtx.translate(-this.canvasWidth / 2, -this.canvasHeight / 2);
        this.mainCtx.putImageData(imageData, 0, 0);
        this.mainCtx.restore();
        this.updateFrameThumbnail();
    }

    copyFrame() {
        this.copiedFrameData = this.mainCtx.getImageData(0, 0, this.canvasWidth, this.canvasHeight);
    }

    pasteFrame() {
        if (this.copiedFrameData) {
            this.saveToUndoStack();
            this.mainCtx.putImageData(this.copiedFrameData, 0, 0);
            this.updateFrameThumbnail();
        }
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SpriteSpark();
});
