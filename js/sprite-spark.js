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
        this.populateThemeDropdown();
    }

    initializeProperties() {
        // Animation properties
        this.frames = [];
        this.currentFrame = 0;
        this.currentFrameIndex = 0;
        this.layers = [];
        this.currentLayer = 0;
        this.activeLayerId = null;
        this.isPlaying = false;
        this.fps = 12;
        this.playInterval = null;
        this.animationInterval = null;
        this.loopAnimation = true;

        // Onion skin properties
        this.showOnionSkin = false;
        this.onionSkinFrames = 1; // Number of frames before/after to show

        // Options properties
        this.pixelPerfect = false;
        this.pixelDrawingMode = false;
        this.pixelEdgeCorrection = false;

        // Canvas properties
        this.canvasWidth = 320;
        this.canvasHeight = 240;
        this.zoom = 1;
        this.showGrid = true;
        this.showOnionSkin = false;
        this.isDrawing = false;

        // Drawing properties
        this.currentTool = 'pen';
        this.primaryColor = '#000000';
        this.secondaryColor = '#ffffff';
        this.brushSize = 1;
        this.opacity = 100;

        // UI properties
        this.theme = 'dark';
        this.currentTheme = 'dark';
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

        // Copy/paste
        this.copiedFrameData = null;

        // Canvas resizing
        this.currentPlacement = 'center';
    }

    initializeCanvases() {
        this.mainCanvas = document.getElementById('mainCanvas');
        this.gridCanvas = document.getElementById('gridCanvas');
        this.ghostCanvas = document.getElementById('ghostCanvas');
        this.livePreviewCanvas = document.getElementById('livePreviewCanvas');

        this.mainCtx = this.mainCanvas?.getContext('2d');
        this.gridCtx = this.gridCanvas?.getContext('2d');
        this.ghostCtx = this.ghostCanvas?.getContext('2d');
        this.livePreviewCtx = this.livePreviewCanvas?.getContext('2d');
        this.ctx = this.mainCtx; // Alias for convenience

        // Set canvas sizes
        this.resizeCanvases();

        // Configure context settings
        if (this.mainCtx) {
            this.mainCtx.imageSmoothingEnabled = false;
            this.gridCtx.imageSmoothingEnabled = false;
            this.ghostCtx.imageSmoothingEnabled = false;
            if (this.livePreviewCtx) {
                this.livePreviewCtx.imageSmoothingEnabled = false;
            }
        }

        // Draw checkerboard background for transparency
        this.drawCheckerboardBackground();
    }

    drawCheckerboardBackground() {
        if (!this.mainCtx) return;
        // Draw a checkerboard pattern on the main canvas for transparency
        const ctx = this.mainCtx;
        const size = 10;
        for (let y = 0; y < this.canvasHeight; y += size) {
            for (let x = 0; x < this.canvasWidth; x += size) {
                ctx.fillStyle = ((x / size + y / size) % 2 === 0) ? '#e0e0e0' : '#ffffff';
                ctx.fillRect(x, y, size, size);
            }
        }
    }

    initializeEventListeners() {
        // Menu and toolbar actions
        document.addEventListener('click', this.handleMenuClick.bind(this));
        document.addEventListener('change', this.handleInputChange.bind(this));

        // Canvas events
        if (this.mainCanvas) {
            this.mainCanvas.addEventListener('mousedown', this.startDrawing.bind(this));
            this.mainCanvas.addEventListener('mousemove', this.draw.bind(this));
            this.mainCanvas.addEventListener('mouseup', this.stopDrawing.bind(this));
            this.mainCanvas.addEventListener('mouseleave', this.stopDrawing.bind(this));
            this.mainCanvas.addEventListener('contextmenu', e => e.preventDefault());

            // Ghost cursor
            this.mainCanvas.addEventListener('mousemove', this.updateGhostCursor.bind(this));
            this.mainCanvas.addEventListener('mouseenter', this.showGhostCursor.bind(this));
            this.mainCanvas.addEventListener('mouseleave', this.hideGhostCursor.bind(this));
        }

        // Panel resizing
        this.initializePanelResizing();

        // Keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyboard.bind(this));

        // Window resize
        window.addEventListener('resize', this.handleResize.bind(this));

        // File input
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.addEventListener('change', this.handleFileLoad.bind(this));
        }

        // Color picker
        const colorPicker = document.getElementById('colorPicker');
        if (colorPicker) {
            colorPicker.addEventListener('change', this.handleColorChange.bind(this));
        }

        // Add this after other event listeners:
        const zoomInput = document.getElementById('zoomInput');
        if (zoomInput) {
            zoomInput.addEventListener('input', this.updateZoomLevel.bind(this));
        }

        const onionSkinCheckbox = document.getElementById('onionSkinCheckbox');
        if (onionSkinCheckbox) {
            onionSkinCheckbox.addEventListener('change', (e) => {
                this.showOnionSkin = e.target.checked;
                this.renderCurrentFrameToMainCanvas();
            });
        }
        const onionSkinFramesInput = document.getElementById('onionSkinFrames');
        if (onionSkinFramesInput) {
            onionSkinFramesInput.addEventListener('input', (e) => {
                this.onionSkinFrames = parseInt(e.target.value, 10) || 1;
                this.renderCurrentFrameToMainCanvas();
            });
        }

        const pixelPerfectCheckbox = document.getElementById('pixelPerfectCheckbox');
        if (pixelPerfectCheckbox) {
            pixelPerfectCheckbox.addEventListener('change', (e) => {
                this.pixelPerfect = e.target.checked;
                document.body.classList.toggle('pixel-perfect', this.pixelPerfect);
            });
        }
        const pixelDrawingCheckbox = document.getElementById('pixelDrawingCheckbox');
        if (pixelDrawingCheckbox) {
            pixelDrawingCheckbox.addEventListener('change', (e) => {
                this.pixelDrawingMode = e.target.checked;
            });
        }

        const pixelEdgeCorrectionCheckbox = document.getElementById('pixelEdgeCorrectionCheckbox');
        if (pixelEdgeCorrectionCheckbox) {
            pixelEdgeCorrectionCheckbox.addEventListener('change', (e) => {
                this.pixelEdgeCorrection = e.target.checked;
            });
        }

        const sizeSelect = document.getElementById('frameThumbSize');
        if (sizeSelect) {
            sizeSelect.addEventListener('change', () => this.updateFramesList());
        }

        const bottomResize = document.getElementById('bottomResize');
        if (bottomResize && bottomPanel) {
            // Position the resize bar just above the bottom panel
            bottomResize.style.bottom = (parseInt(bottomPanel.style.height) || 140) + 'px';
        }

        // Tool properties
        this.initializeToolProperties();

        // Animation controls
        this.initializeAnimationControls();

        // Canvas resize controls
        this.initializeCanvasResizeControls();
    }

    initializeAnimationControls() {
        // Live preview checkbox
        const enablePreviewCheckbox = document.getElementById('enablePreview');
        if (enablePreviewCheckbox) {
            enablePreviewCheckbox.addEventListener('change', () => {
                if (enablePreviewCheckbox.checked) {
                    this.isPlaying = true;
                    this.playAnimation();
                } else {
                    this.isPlaying = false;
                    this.pauseAnimation();
                    if (this.livePreviewCtx) {
                        this.livePreviewCtx.clearRect(0, 0, this.livePreviewCanvas.width, this.livePreviewCanvas.height);
                    }
                }
            });
        }

        // FPS Input
        const fpsInput = document.getElementById('fpsInput');
        if (fpsInput) {
            fpsInput.addEventListener('change', (e) => {
                this.fps = parseInt(e.target.value, 10);
                if (this.isPlaying) {
                    this.playAnimation();
                }
            });
        }

        // Loop Checkbox
        const loopCheckbox = document.getElementById('loopAnimation');
        if (loopCheckbox) {
            loopCheckbox.addEventListener('change', (e) => {
                this.loopAnimation = e.target.checked;
            });
        }
    }

    initializeCanvasResizeControls() {
        const resizeMethodSelect = document.getElementById('resizeMethod');
        const resizePlacementGroup = document.getElementById('resizePlacementGroup');
        const placementButtons = document.querySelectorAll('.placement-grid button');

        if (resizeMethodSelect) {
            resizeMethodSelect.addEventListener('change', () => {
                if (resizeMethodSelect.value === 'fit' || resizeMethodSelect.value === 'crop') {
                    if (resizePlacementGroup) {
                        resizePlacementGroup.style.display = 'block';
                    }
                } else {
                    if (resizePlacementGroup) {
                        resizePlacementGroup.style.display = 'none';
                    }
                }
            });
        }

        placementButtons.forEach(button => {
            button.addEventListener('click', () => {
                placementButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                this.currentPlacement = button.dataset.placement;
            });
        });
    }

    initializeToolProperties() {
        const brushSize = document.getElementById('brushSize');
        const opacity = document.getElementById('opacity');
        const brushSizeValue = document.getElementById('brushSizeValue');
        const opacityValue = document.getElementById('opacityValue');
        const toolButtons = document.querySelectorAll('.drawing-tool');

        if (brushSize) {
            brushSize.addEventListener('input', (e) => {
                this.brushSize = Math.max(0.1, parseInt(e.target.value));
                if (brushSizeValue) brushSizeValue.textContent = this.brushSize;
                this.updateGhostCursor();
            });
        }

        if (opacity) {
            opacity.addEventListener('input', (e) => {
                this.opacity = parseInt(e.target.value);
                if (opacityValue) opacityValue.textContent = this.opacity;
            });
        }

        // Drawing tool buttons
        //if(toolButtons) {
        toolButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                toolButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentTool = btn.getAttribute('data-tool');
            });
        });
        //}
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
                const newWidth = Math.max(200, Math.min(e.clientX, 400));
                leftPanel.style.width = newWidth + 'px';
                leftResize.style.left = newWidth + 'px';
                document.documentElement.style.setProperty('--left-panel-width', newWidth + 'px');
                this.leftPanelWidth = newWidth;
            } else if (resizePanel === 'right') {
                const newWidth = Math.max(200, Math.min(window.innerWidth - e.clientX, 400));
                rightPanel.style.width = newWidth + 'px';
                rightResize.style.right = newWidth + 'px';
                document.documentElement.style.setProperty('--right-panel-width', newWidth + 'px');
                this.rightPanelWidth = newWidth;
            }
            updateBottomPanelPosition();
            syncBottomResizeBar();
        };

        const stopResize = () => {
            if (!isResizing) return;
            isResizing = false;
            resizePanel = null;
            document.body.style.cursor = '';
            updateBottomPanelPosition();
            syncBottomResizeBar();
        };

        if (leftResize) leftResize.addEventListener('mousedown', (e) => startResize(e, 'left'));
        if (rightResize) rightResize.addEventListener('mousedown', (e) => startResize(e, 'right'));
        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', stopResize);
    }

    initializeColorPalette() {
        const palette = document.getElementById('colorPalette');
        if (!palette) return;

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
                const primaryColorEl = document.getElementById('primaryColor');
                const colorPicker = document.getElementById('colorPicker');
                if (primaryColorEl) primaryColorEl.style.backgroundColor = color;
                if (colorPicker) colorPicker.value = color;
            });
            palette.appendChild(swatch);
        });

        // Set initial colors
        const primaryColorEl = document.getElementById('primaryColor');
        const secondaryColorEl = document.getElementById('secondaryColor');
        if (primaryColorEl) primaryColorEl.style.backgroundColor = this.primaryColor;
        if (secondaryColorEl) secondaryColorEl.style.backgroundColor = this.secondaryColor;
    }

    initializeFrames() {
        // Create initial frame with current layers
        this.frames = [this.createEmptyFrame()];
        this.updateFramesList();
    }

    initializeLayers() {
        // Create initial layer
        this.addLayer('Layer 1');
        if (this.layers.length > 0) {
            this.setActiveLayer(this.layers[0].id);
        }
    }

    initializeTheme() {
        // Load theme from localStorage or use default
        const savedTheme = localStorage.getItem('spriteSparkTheme') || this.theme;
        this.applyTheme(savedTheme);
    }

    // --- Theme Management ---
    populateThemeDropdown() {
        const themes = [
            'dark', 'light', 'blue', 'green', 'purple', 'gold', 'red', 'orange', 'mono', 'high-contrast',
            'ironman', 'midnight', 'sakura', 'emerald',
            'neon-dark', 'neon-night', 'solarized-dark',
            'dracula', 'oceanic-dark', 'nord-dark',
            'cyberpunk-dark', 'midnight-forest', 'deep-space'
        ];
        const themeMenu = document.querySelector('.menu-item:nth-child(5) .dropdown');
        if (!themeMenu) {
            console.error("Theme dropdown not found. Check selector.");
            return;
        }
        themeMenu.innerHTML = '';
        themes.forEach(themeName => {
            const li = document.createElement('li');
            const span = document.createElement('span');
            span.dataset.action = 'set-theme';
            span.dataset.theme = themeName;
            span.textContent = themeName.charAt(0).toUpperCase() + themeName.slice(1).replace('-', ' ');
            li.appendChild(span);
            themeMenu.appendChild(li);
        });
    }

    applyTheme(themeName) {
        document.documentElement.setAttribute('data-theme', themeName);
        this.currentTheme = themeName;
        localStorage.setItem('spriteSparkTheme', themeName);
        // Update grid after theme change
        setTimeout(() => this.drawGrid(), 100);
    }

    // --- Layer Management ---
    addLayer(name = `Layer ${this.layers.length + 1}`) {
        const newLayer = {
            id: Date.now().toString(),
            name: name,
            isVisible: true,
            opacity: 100,
            blendMode: 'source-over',
            canvas: this.createLayerCanvas()
        };
        this.layers.push(newLayer);

        // Add a blank layer to every frame at the same index
        this.frames.forEach(frame => {
            const blankLayer = {
                ...newLayer,
                canvas: this.createLayerCanvas()
            };
            frame.layers.push(blankLayer);
        });

        this.renderLayersList();
        this.renderCurrentFrameToMainCanvas();
        this.syncGlobalLayersToCurrentFrame();
        this.updateFramesList();
    }

    deleteLayer(layerId) {
        if (this.layers.length <= 1) return;

        const index = this.layers.findIndex(layer => layer.id === layerId);
        if (index === -1) return;

        this.layers.splice(index, 1);

        // Remove the layer from every frame
        this.frames.forEach(frame => {
            frame.layers.splice(index, 1);
        });

        if (this.activeLayerId === layerId && this.layers.length > 0) {
            this.setActiveLayer(this.layers[0].id);
        } else if (this.layers.length === 0) {
            this.activeLayerId = null;
        }
        this.renderLayersList();
        this.renderCurrentFrameToMainCanvas();
        this.syncGlobalLayersToCurrentFrame();
        this.updateFramesList();
    }

    moveLayer(layerId, direction) {
        const index = this.layers.findIndex(l => l.id === layerId);
        if (index === -1) return;

        let newIndex = index;
        if (direction === 'up' && index > 0) {
            newIndex = index - 1;
        } else if (direction === 'down' && index < this.layers.length - 1) {
            newIndex = index + 1;
        }
        if (newIndex === index) return;

        // Move in global layers
        const [moved] = this.layers.splice(index, 1);
        this.layers.splice(newIndex, 0, moved);

        // Move in every frame
        this.frames.forEach(frame => {
            const [frameMoved] = frame.layers.splice(index, 1);
            frame.layers.splice(newIndex, 0, frameMoved);
        });

        this.renderLayersList();
        this.renderCurrentFrameToMainCanvas();
        this.syncGlobalLayersToCurrentFrame();
        this.updateFramesList();
    }

    setActiveLayer(layerId) {
        this.activeLayerId = layerId;
        this.renderLayersList();
    }

    toggleLayerVisibility(layerId) {
        const layer = this.layers.find(l => l.id === layerId);
        if (layer) {
            layer.isVisible = !layer.isVisible;
            this.renderLayersList();
            this.renderCurrentFrameToMainCanvas();
        }
    }

    setLayerOpacity(layerId, opacity) {
        const layer = this.layers.find(l => l.id === layerId);
        if (layer) {
            layer.opacity = parseInt(opacity, 10);
            this.renderCurrentFrameToMainCanvas();
        }
    }

    setLayerBlendMode(layerId, blendMode) {
        const layer = this.layers.find(l => l.id === layerId);
        if (layer) {
            layer.blendMode = blendMode;
            this.renderCurrentFrameToMainCanvas();
        }
    }

    setLayerName(layerId, name) {
        const layer = this.layers.find(l => l.id === layerId);
        if (layer) {
            layer.name = name;
        }
    }

    renderLayersList() {
        const layersList = document.getElementById('layersList');
        if (!layersList) return;

        layersList.innerHTML = '';
        this.layers.forEach(layer => {
            const item = document.createElement('div');
            item.className = `layer-item ${layer.id === this.activeLayerId ? 'active' : ''}`;
            item.dataset.layerId = layer.id;

            const visibilityBtn = document.createElement('button');
            visibilityBtn.className = 'layer-visibility';
            visibilityBtn.title = 'Toggle Visibility';
            visibilityBtn.innerHTML = layer.isVisible ? '👁️' : '🙈';
            visibilityBtn.addEventListener('click', () => this.toggleLayerVisibility(layer.id));

            const nameSpan = document.createElement('span');
            nameSpan.className = 'layer-name';
            nameSpan.textContent = layer.name;
            nameSpan.contentEditable = true;
            nameSpan.addEventListener('blur', (e) => this.setLayerName(layer.id, e.target.textContent));

            nameSpan.addEventListener('mousedown', e => e.stopPropagation());
            nameSpan.addEventListener('mouseup', e => e.stopPropagation());
            nameSpan.addEventListener('click', e => e.stopPropagation());

            nameSpan.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    nameSpan.blur();
                }
            });

            const blendSelect = document.createElement('select');
            blendSelect.className = 'layer-blend-mode';
            blendSelect.title = 'Blend Mode';
            ['source-over', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity']
                .forEach(mode => {
                    const option = document.createElement('option');
                    option.value = mode;
                    option.textContent = mode.charAt(0).toUpperCase() + mode.slice(1).replace('-', ' ');
                    if (mode === layer.blendMode) option.selected = true;
                    blendSelect.appendChild(option);
                });
            blendSelect.addEventListener('change', (e) => this.setLayerBlendMode(layer.id, e.target.value));

            // Prevent parent click when interacting with dropdown
            blendSelect.addEventListener('mousedown', e => e.stopPropagation());
            blendSelect.addEventListener('mouseup', e => e.stopPropagation());
            blendSelect.addEventListener('click', e => e.stopPropagation());
            blendSelect.addEventListener('focus', e => e.stopPropagation());

            const opacityInput = document.createElement('input');
            opacityInput.type = 'range';
            opacityInput.className = 'layer-opacity';
            opacityInput.min = 0;
            opacityInput.max = 100;
            opacityInput.value = layer.opacity;
            opacityInput.title = 'Opacity';
            opacityInput.addEventListener('input', (e) => this.setLayerOpacity(layer.id, e.target.value));

            item.appendChild(visibilityBtn);
            item.appendChild(nameSpan);
            item.appendChild(blendSelect);
            item.appendChild(opacityInput);
            item.addEventListener('click', () => this.setActiveLayer(layer.id));

            // Make each layer item draggable
            item.draggable = true;
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', layer.id);
                item.classList.add('dragging');
            });
            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
            });
            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                item.classList.add('drag-over');
            });
            item.addEventListener('dragleave', () => {
                item.classList.remove('drag-over');
            });
            item.addEventListener('drop', (e) => {
                e.preventDefault();
                item.classList.remove('drag-over');
                const draggedLayerId = e.dataTransfer.getData('text/plain');
                const fromIndex = this.layers.findIndex(l => l.id === draggedLayerId);
                const toIndex = this.layers.findIndex(l => l.id === layer.id);
                if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
                    this.undoAdd();
                    const [moved] = this.layers.splice(fromIndex, 1);
                    this.layers.splice(toIndex, 0, moved);
                    // Move in every frame
                    this.frames.forEach(frame => {
                        const [frameMoved] = frame.layers.splice(fromIndex, 1);
                        frame.layers.splice(toIndex, 0, frameMoved);
                    });
                    this.renderLayersList();
                    this.renderCurrentFrameToMainCanvas();
                    this.syncGlobalLayersToCurrentFrame();
                    this.updateFramesList();
                }
            });

            // Only set active layer if not clicking on editable elements
            item.addEventListener('click', (evt) => {
                if (
                    evt.target === nameSpan ||
                    evt.target === blendSelect ||
                    evt.target === opacityInput ||
                    evt.target === visibilityBtn
                ) return;
                this.setActiveLayer(layer.id);
            });

            layersList.appendChild(item);
        });
    }

    // --- Animation Playback & Live Preview ---
    togglePlay() {
        this.isPlaying = !this.isPlaying;
        if (this.isPlaying) {
            this.playAnimation();
        } else {
            this.pauseAnimation();
        }

        const playBtn = document.querySelector('.play-btn');
        if (playBtn) {
            const playIcon = playBtn.querySelector('.play-icon');
            const pauseIcon = playBtn.querySelector('.pause-icon');
            if (playIcon) playIcon.style.display = this.isPlaying ? 'none' : 'block';
            if (pauseIcon) pauseIcon.style.display = this.isPlaying ? 'block' : 'none';
        }
    }

    playAnimation() {
        const enablePreviewCheckbox = document.getElementById('enablePreview');
        if (!enablePreviewCheckbox || !enablePreviewCheckbox.checked || this.frames.length === 0) {
            this.isPlaying = false;
            return;
        }
        this.pauseAnimation();
        this.currentFrameIndex = this.currentFrame; // Start from current frame
        const frameDuration = 1000 / this.fps;
        this.animationInterval = setInterval(() => {
            this.renderFrameToLivePreview(this.currentFrameIndex);
            this.currentFrameIndex++;
            if (this.currentFrameIndex >= this.frames.length) {
                if (this.loopAnimation) {
                    this.currentFrameIndex = 0;
                } else {
                    this.currentFrameIndex = this.frames.length - 1;
                    this.pauseAnimation();
                    return;
                }
            }
        }, frameDuration);
    }

    pauseAnimation() {
        clearInterval(this.animationInterval);
        this.animationInterval = null;
    }

    renderFrameToLivePreview(frameIndexToRender) {
        if (!this.livePreviewCtx || !this.livePreviewCanvas || this.frames.length === 0) return;
        this.livePreviewCtx.clearRect(0, 0, this.livePreviewCanvas.width, this.livePreviewCanvas.height);

        const frameData = this.frames[frameIndexToRender];
        if (!frameData || !frameData.layers) return;

        // Draw all layers for this frame, bottom to top
        for (let i = 0; i < frameData.layers.length; i++) {
            const layer = frameData.layers[i];
            if (layer.isVisible !== false && layer.canvas instanceof HTMLCanvasElement) {
                this.livePreviewCtx.globalAlpha = layer.opacity / 100 || 1;
                this.livePreviewCtx.globalCompositeOperation = layer.blendMode || 'source-over';
                this.livePreviewCtx.drawImage(layer.canvas, 0, 0, this.livePreviewCanvas.width, this.livePreviewCanvas.height);
            }
        }
        this.livePreviewCtx.globalAlpha = 1.0;
        this.livePreviewCtx.globalCompositeOperation = 'source-over';
    }

    // --- Canvas Resizing ---
    applyCanvasSize() {
        const canvasWidthInput = document.getElementById('canvasWidth');
        const canvasHeightInput = document.getElementById('canvasHeight');
        const resizeMethodSelect = document.getElementById('resizeMethod');

        if (!canvasWidthInput || !canvasHeightInput || !resizeMethodSelect) return;

        const newWidth = parseInt(canvasWidthInput.value, 10);
        const newHeight = parseInt(canvasHeightInput.value, 10);
        const method = resizeMethodSelect.value;

        if (isNaN(newWidth) || isNaN(newHeight) || newWidth <= 0 || newHeight <= 0) {
            alert("Invalid canvas dimensions.");
            return;
        }

        // Update canvas dimensions
        this.canvasWidth = newWidth;
        this.canvasHeight = newHeight;

        // Update main canvas and grid/ghost canvases
        if (this.mainCanvas) {
            this.mainCanvas.width = newWidth;
            this.mainCanvas.height = newHeight;
        }
        if (this.gridCanvas) {
            this.gridCanvas.width = newWidth;
            this.gridCanvas.height = newHeight;
        }
        if (this.ghostCanvas) {
            this.ghostCanvas.width = newWidth;
            this.ghostCanvas.height = newHeight;
        }

        // Resize all layer canvases
        this.layers.forEach(layer => {
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = layer.canvas.width;
            tempCanvas.height = layer.canvas.height;
            tempCtx.drawImage(layer.canvas, 0, 0);

            layer.canvas.width = newWidth;
            layer.canvas.height = newHeight;

            const lc = layer.canvas.getContext('2d');
            lc.clearRect(0, 0, newWidth, newHeight);

            if (method === 'stretch') {
                lc.drawImage(tempCanvas, 0, 0, newWidth, newHeight);
            } else if (method === 'fit') {
                const oldAspect = tempCanvas.width / tempCanvas.height;
                const newAspect = newWidth / newHeight;
                let drawWidth, drawHeight, dx, dy;

                if (newAspect > oldAspect) {
                    drawHeight = newHeight;
                    drawWidth = drawHeight * oldAspect;
                } else {
                    drawWidth = newWidth;
                    drawHeight = drawWidth / oldAspect;
                }

                dx = (newWidth - drawWidth) / 2;
                dy = (newHeight - drawHeight) / 2;
                lc.drawImage(tempCanvas, dx, dy, drawWidth, drawHeight);
            } else {
                lc.drawImage(tempCanvas, 0, 0);
            }
        });

        this.drawGrid();
        this.renderCurrentFrameToMainCanvas();
        this.resizeCanvases();
        console.log(`Canvas resized to ${newWidth}x${newHeight} using ${method}`);
    }

    resizeCanvases() {
        if (!this.mainCanvas) return;

        const canvases = [this.mainCanvas, this.gridCanvas, this.ghostCanvas];
        canvases.forEach(canvas => {
            if (canvas) {
                canvas.style.width = (this.canvasWidth * this.zoom) + 'px';
                canvas.style.height = (this.canvasHeight * this.zoom) + 'px';
            }
        });
    }

    updateZoomLevel() {
        const zoomInput = document.getElementById('zoomInput');
        const zoomLevelDisplay = document.getElementById('zoomLevelDisplay');
        if (!zoomInput) return;
        this.zoom = parseFloat(zoomInput.value);
        if (isNaN(this.zoom) || this.zoom <= 0) {
            alert("Invalid zoom level.");
            return;
        }
        this.resizeCanvases();
        this.renderCurrentFrameToMainCanvas();
        this.updateGhostCursor();
        if (zoomLevelDisplay) {
            zoomLevelDisplay.textContent = Math.round(this.zoom * 100) + "%";
        }
        console.log(`Zoom level set to ${this.zoom}`);
    }

    createEmptyFrame() {
        // Create a frame with the same number of layers as the current global layers
        return {
            layers: this.layers.map(layer => {
                const newCanvas = document.createElement('canvas');
                newCanvas.width = this.canvasWidth;
                newCanvas.height = this.canvasHeight;
                const ctx = newCanvas.getContext('2d');
                ctx.drawImage(layer.canvas, 0, 0);
                return {
                    id: layer.id,
                    name: layer.name,
                    isVisible: layer.isVisible,
                    opacity: layer.opacity,
                    blendMode: layer.blendMode,
                    canvas: newCanvas
                };
            })
        };
    }

    addEmptyFrame() {
        // Create a frame with the same number of layers, but blank canvases
        const newFrame = {
            layers: this.layers.map(layer => {
                return {
                    id: layer.id,
                    name: layer.name,
                    isVisible: layer.isVisible,
                    opacity: layer.opacity,
                    blendMode: layer.blendMode,
                    canvas: this.createLayerCanvas()
                };
            })
        };
        this.frames.push(newFrame);
        this.currentFrame = this.frames.length - 1;
        this.selectFrame(this.currentFrame);
        this.updateFramesList();
    }

    duplicateCurrentFrame() {
        const current = this.frames[this.currentFrame];
        if (!current) return;
        // Deep copy all layers
        const newFrame = {
            layers: current.layers.map(layer => {
                const newCanvas = document.createElement('canvas');
                newCanvas.width = layer.canvas.width;
                newCanvas.height = layer.canvas.height;
                const ctx = newCanvas.getContext('2d');
                ctx.drawImage(layer.canvas, 0, 0);
                return {
                    id: layer.id,
                    name: layer.name,
                    isVisible: layer.isVisible,
                    opacity: layer.opacity,
                    blendMode: layer.blendMode,
                    canvas: newCanvas
                };
            })
        };
        this.frames.splice(this.currentFrame + 1, 0, newFrame);
        this.currentFrame = this.currentFrame + 1;
        this.selectFrame(this.currentFrame);
        this.updateFramesList();
    }

    createLayerCanvas() {
        const canvas = document.createElement('canvas');
        canvas.width = this.canvasWidth;
        canvas.height = this.canvasHeight;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        return canvas;
    }

    drawGrid() {
        if (!this.gridCanvas || !this.gridCtx) return;

        this.gridCtx.clearRect(0, 0, this.gridCanvas.width, this.gridCanvas.height);
        if (!this.showGrid) return;

        const gridSize = 10;
        this.gridCtx.strokeStyle = 'rgba(128, 128, 128, 0.3)';
        this.gridCtx.lineWidth = 0.5;

        for (let x = 0; x <= this.gridCanvas.width; x += gridSize) {
            this.gridCtx.beginPath();
            this.gridCtx.moveTo(x, 0);
            this.gridCtx.lineTo(x, this.gridCanvas.height);
            this.gridCtx.stroke();
        }
        for (let y = 0; y <= this.gridCanvas.height; y += gridSize) {
            this.gridCtx.beginPath();
            this.gridCtx.moveTo(0, y);
            this.gridCtx.lineTo(this.gridCanvas.width, y);
            this.gridCtx.stroke();
        }
    }

    renderCurrentFrameToMainCanvas() {
        if (!this.ctx || !this.mainCanvas || this.frames.length === 0 || !this.layers.length) return;
        this.ctx.clearRect(0, 0, this.mainCanvas.width, this.mainCanvas.height);
        this.drawCheckerboardBackground();

        // Onion skin: draw previous/next frames with transparency
        if (this.showOnionSkin && this.frames.length > 1) {
            for (let offset = -this.onionSkinFrames; offset <= this.onionSkinFrames; offset++) {
                if (offset === 0) continue;
                const frameIdx = this.currentFrame + offset;
                if (frameIdx < 0 || frameIdx >= this.frames.length) continue;
                const frame = this.frames[frameIdx];
                frame.layers.forEach((layer, i) => {
                    if (!layer.isVisible) return;
                    this.ctx.globalAlpha = 0.2; // Faint
                    this.ctx.globalCompositeOperation = 'source-over';
                    this.ctx.drawImage(layer.canvas, 0, 0);
                });
            }
        }

        // Draw current frame layers
        for (let i = 0; i < this.layers.length; i++) {
            const layer = this.layers[i];
            if (!layer.isVisible) continue;
            if (layer.canvas) {
                this.ctx.globalAlpha = layer.opacity / 100;
                this.ctx.globalCompositeOperation = layer.blendMode;
                this.ctx.drawImage(layer.canvas, 0, 0);
            }
        }
        this.ctx.globalAlpha = 1.0;
        this.ctx.globalCompositeOperation = 'source-over';
    }

    // Include all the existing methods from the original script...
    handleMenuClick(e) {
        const action = e.target.getAttribute('data-action');
        const theme = e.target.getAttribute('data-theme');

        if (!action) return;

        switch (action) {
            case 'new':
                if (confirm("Start a new project? Unsaved changes will be lost.")) {
                    location.reload();
                }
                break;
            case 'open':
                this.openProject();
                break;
            case 'save':
                this.saveProject(false);
                break;
            case 'save-as':
                this.saveProject(true);
                break;
            case 'export-frame':
                this.exportCurrentFrame();
                break;
            case 'export-animation':
                this.exportAnimation();
                break;
            case 'toggle-grid':
                this.showGrid = !this.showGrid;
                this.drawGrid();
                break;
            case 'toggle-onion-skin':
                this.showOnionSkin = !this.showOnionSkin;
                this.renderCurrentFrameToMainCanvas();
                break;
            case 'set-theme':
                if (theme) this.applyTheme(theme);
                break;

            case 'add-layer':
                this.addLayer();
                break;
            case 'delete-layer':
                if (this.activeLayerId) this.deleteLayer(this.activeLayerId);
                break;
            case 'move-layer-up':
                if (this.activeLayerId) this.moveLayer(this.activeLayerId, 'up');
                break;
            case 'move-layer-down':
                if (this.activeLayerId) this.moveLayer(this.activeLayerId, 'down');
                break;

            case 'add-frame':
                this.addEmptyFrame();
                break;
            case 'insert-frame':
                this.insertFrameBeforeCurrent();
                break;
            case 'duplicate-frame':
                this.duplicateCurrentFrame();
                break;
            case 'delete-frame':
                this.removeFrame(this.currentFrame);
                break;
            case 'move-frame-up':
                this.moveFrame(this.currentFrame, 'up');
                break;
            case 'move-frame-down':
                this.moveFrame(this.currentFrame, 'down');
                break;

            case 'apply-canvas-size':
                this.applyCanvasSize();
                break;

            case 'play':
                this.togglePlay();
                break;
            // Add other actions as needed...
        }

        // Handle layer selection
        if (e.target.closest('.layer-item')) {
            const layerId = e.target.closest('.layer-item').getAttribute('data-layer-id');
            if (layerId) this.setActiveLayer(layerId);
        }
    }

    handleInputChange(e) {
        if (e.target.id === 'fpsInput') {
            this.fps = parseInt(e.target.value);
        }
    }

    handleColorChange(e) {
        this.primaryColor = e.target.value;
        const primaryColorEl = document.getElementById('primaryColor');
        if (primaryColorEl) primaryColorEl.style.backgroundColor = this.primaryColor;
    }

    insertFrameBeforeCurrent() {
        // Create a frame with the same number of layers, but blank canvases
        const newFrame = {
            layers: this.layers.map(layer => ({
                id: layer.id,
                name: layer.name,
                isVisible: layer.isVisible,
                opacity: layer.opacity,
                blendMode: layer.blendMode,
                canvas: this.createLayerCanvas()
            }))
        };
        this.frames.splice(this.currentFrame, 0, newFrame);
        this.selectFrame(this.currentFrame); // Stay on the same frame index (now the new frame)
        this.updateFramesList();
    }

    // Add all other missing methods from the original script
    startDrawing(e) {
        if (!this.activeLayerId) return;
        this.isDrawing = true;
        const rect = this.mainCanvas.getBoundingClientRect();
        this.lastX = Math.floor((e.clientX - rect.left) / this.zoom);
        this.lastY = Math.floor((e.clientY - rect.top) / this.zoom);
        this.draw(e); // Draw initial point
        this.syncGlobalLayersToCurrentFrame();
    }

    draw(e) {
        if (!this.isDrawing || !this.activeLayerId) return;
        const rect = this.mainCanvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / this.zoom);
        const y = Math.floor((e.clientY - rect.top) / this.zoom);

        const layer = this.layers.find(l => l.id === this.activeLayerId);
        if (!layer) return;
        const ctx = layer.canvas.getContext('2d');
        ctx.globalAlpha = this.opacity / 100;
        ctx.strokeStyle = this.primaryColor;
        ctx.lineWidth = this.brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (this.pixelDrawingMode && this.currentTool !== 'eraser' && this.brushSize === 1) {
            // Use Bresenham's line algorithm for pixel-perfect lines
            function drawPixelLine(ctx, x0, y0, x1, y1, color, size, preventCorners) {
                let dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1;
                let dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
                let err = dx + dy, e2;
                let prevX = x0, prevY = y0;

                while (true) {
                    // Prevent corners: only draw if not a diagonal-only move
                    if (!preventCorners || (x0 === prevX || y0 === prevY)) {
                        ctx.fillStyle = color;
                        ctx.globalAlpha = this.opacity / 100;
                        ctx.fillRect(x0 - Math.floor(size / 2), y0 - Math.floor(size / 2), size, size);
                    }

                    if (x0 === x1 && y0 === y1) break;
                    prevX = x0; prevY = y0;
                    e2 = 2 * err;
                    if (e2 >= dy) { err += dy; x0 += sx; }
                    if (e2 <= dx) { err += dx; y0 += sy; }
                }
            }

            drawPixelLine.call(
                this,
                ctx,
                this.lastX,
                this.lastY,
                x,
                y,
                this.primaryColor,
                this.brushSize,
                this.pixelEdgeCorrection && this.brushSize > 1 // preventCorners only if enabled and brush is round
            );
        } else if (this.currentTool === 'pen') {
            ctx.beginPath();
            ctx.moveTo(this.lastX, this.lastY);
            ctx.lineTo(x, y);
            ctx.stroke();
        } else if (this.currentTool === 'eraser') {
            ctx.clearRect(x - this.brushSize / 2, y - this.brushSize / 2, this.brushSize, this.brushSize);
        }

        this.lastX = x;
        this.lastY = y;
        this.renderCurrentFrameToMainCanvas();
        this.syncGlobalLayersToCurrentFrame();
    }

    stopDrawing() {
        this.isDrawing = false;
        this.syncGlobalLayersToCurrentFrame();
    }

    updateGhostCursor(e) {
        if (!this.ghostCtx || !this.ghostCanvas) return;
        this.ghostCtx.clearRect(0, 0, this.ghostCanvas.width, this.ghostCanvas.height);
        if (!e) return;
        const rect = this.ghostCanvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / this.zoom);
        const y = Math.floor((e.clientY - rect.top) / this.zoom);

        // Draw ghost brush
        this.ghostCtx.save();
        this.ghostCtx.globalAlpha = 0.7;
        this.ghostCtx.strokeStyle = '#888';
        this.ghostCtx.lineWidth = 1;
        this.ghostCtx.beginPath();
        this.ghostCtx.arc(x, y, this.brushSize / 2, 0, 2 * Math.PI);
        this.ghostCtx.stroke();

        // Fill with brush color
        this.ghostCtx.fillStyle = this.primaryColor;
        this.ghostCtx.globalAlpha = 0.3;
        this.ghostCtx.beginPath();
        this.ghostCtx.arc(x, y, this.brushSize / 2, 0, 2 * Math.PI);
        this.ghostCtx.fill();
        this.ghostCtx.restore();
    }

    showGhostCursor() {
        if (this.ghostCanvas) this.ghostCanvas.style.display = 'block';
    }

    hideGhostCursor() {
        if (this.ghostCanvas) {
            this.ghostCanvas.style.display = 'none';
            this.ghostCtx && this.ghostCtx.clearRect(0, 0, this.ghostCanvas.width, this.ghostCanvas.height);
        }
    }

    updateFramesList() {
    const framesList = document.getElementById('framesList');
    if (!framesList) return;

    // Get selected size
    const sizeSelect = document.getElementById('frameThumbSize');
    let size = 'medium';
    if (sizeSelect) size = sizeSelect.value;

    framesList.innerHTML = '';
    this.frames.forEach((frame, idx) => {
        const item = document.createElement('div');
        item.className = `frame-item ${size} ${idx === this.currentFrame ? 'active' : ''}`;
        item.dataset.frame = idx;

        // Frame number
        const numberDiv = document.createElement('div');
        numberDiv.className = 'frame-number';
        numberDiv.textContent = idx + 1;
        item.appendChild(numberDiv);

        // Thumbnail
        const thumbDiv = document.createElement('div');
        thumbDiv.className = 'frame-thumbnail';
        const thumbCanvas = document.createElement('canvas');
        // Set canvas size based on size
        let w = 64, h = 48;
        if (size === 'small') { w = 32; h = 24; }
        if (size === 'large') { w = 128; h = 96; }
        thumbCanvas.width = w;
        thumbCanvas.height = h;
        const thumbCtx = thumbCanvas.getContext('2d');

        // Draw all layers for this frame, bottom to top
        if (frame.layers) {
            for (let i = 0; i < frame.layers.length; i++) {
                const l = frame.layers[i];
                if (l.isVisible !== false && l.canvas instanceof HTMLCanvasElement) {
                    // Fit and center the image in the thumbnail
                    const srcW = l.canvas.width;
                    const srcH = l.canvas.height;
                    const dstW = thumbCanvas.width;
                    const dstH = thumbCanvas.height;
                    const srcAspect = srcW / srcH;
                    const dstAspect = dstW / dstH;
                    let drawW, drawH, dx, dy;
                    if (srcAspect > dstAspect) {
                        drawW = dstW;
                        drawH = dstW / srcAspect;
                        dx = 0;
                        dy = (dstH - drawH) / 2;
                    } else {
                        drawH = dstH;
                        drawW = dstH * srcAspect;
                        dx = (dstW - drawW) / 2;
                        dy = 0;
                    }
                    thumbCtx.globalAlpha = l.opacity / 100 || 1;
                    thumbCtx.globalCompositeOperation = l.blendMode || 'source-over';
                    thumbCtx.drawImage(l.canvas, 0, 0, srcW, srcH, dx, dy, drawW, drawH);
                }
            }
        }

        thumbCtx.globalAlpha = 1.0;
        thumbCtx.globalCompositeOperation = 'source-over';
        thumbDiv.appendChild(thumbCanvas);
        item.appendChild(thumbDiv);

        item.addEventListener('click', () => this.selectFrame(idx));
        framesList.appendChild(item);
    });
}

    addFrame() {
        // Deep copy all layer canvases for the new frame
        const newFrame = {
            layers: this.layers.map(layer => {
                const newCanvas = document.createElement('canvas');
                newCanvas.width = this.canvasWidth;
                newCanvas.height = this.canvasHeight;
                const ctx = newCanvas.getContext('2d');
                ctx.drawImage(layer.canvas, 0, 0);

                // Only store plain data, not references to the original layer object
                return {
                    id: layer.id,
                    name: layer.name,
                    isVisible: layer.isVisible,
                    opacity: layer.opacity,
                    blendMode: layer.blendMode,
                    canvas: newCanvas
                };
            })
        };
        this.frames.push(newFrame);
        this.currentFrame = this.frames.length - 1;
        this.updateFramesList();
        this.renderCurrentFrameToMainCanvas();
    }

    selectFrame(frameIndex) {
        if (frameIndex < 0 || frameIndex >= this.frames.length) return;
        this.currentFrame = frameIndex;
        const frame = this.frames[frameIndex];
        if (!frame || !frame.layers) return;

        // Only sync layer count if different
        if (this.layers.length !== frame.layers.length) {
            // Remove extra layers
            while (this.layers.length > frame.layers.length) {
                this.layers.pop();
            }
            // Add blank layers if needed (should not happen if frames are created correctly)
            while (this.layers.length < frame.layers.length) {
                const blankLayer = {
                    id: Date.now().toString() + Math.random(),
                    name: `Layer ${this.layers.length + 1}`,
                    isVisible: true,
                    opacity: 100,
                    blendMode: 'source-over',
                    canvas: this.createLayerCanvas()
                };
                this.layers.push(blankLayer);
            }
        }

        // Copy properties and image data from frame's layers to global layers
        this.layers.forEach((layer, i) => {
            const frameLayer = frame.layers[i];
            if (frameLayer) {
                layer.name = frameLayer.name;
                layer.isVisible = frameLayer.isVisible;
                layer.opacity = frameLayer.opacity;
                layer.blendMode = frameLayer.blendMode;
                // Copy image data
                const ctx = layer.canvas.getContext('2d');
                ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
                if (frameLayer.canvas instanceof HTMLCanvasElement) {
                    ctx.drawImage(frameLayer.canvas, 0, 0);
                }
            }
        });

        this.renderLayersList();
        this.renderCurrentFrameToMainCanvas();
        this.updateFramesList();
    }

    removeFrame(frameIndex) {
        if (this.frames.length <= 1) return;
        const confirmed = confirm("Are you sure you want to delete this frame?");
        if (!confirmed) return;
        this.undoAdd();
        this.frames.splice(frameIndex, 1);
        if (this.currentFrame >= this.frames.length) {
            this.currentFrame = this.frames.length - 1;
        }
        this.selectFrame(this.currentFrame);
        this.updateFramesList();
        this.renderCurrentFrameToMainCanvas();
    }

    moveFrame(frameIndex, direction) {
        if (direction === 'up' && frameIndex > 0) {
            this.undoAdd();
            const temp = this.frames[frameIndex];
            this.frames[frameIndex] = this.frames[frameIndex - 1];
            this.frames[frameIndex - 1] = temp;
            if (this.currentFrame === frameIndex) this.currentFrame--;
            else if (this.currentFrame === frameIndex - 1) this.currentFrame++;
            this.updateFramesList();
            this.selectFrame(this.currentFrame);
        } else if (direction === 'down' && frameIndex < this.frames.length - 1) {
            this.undoAdd();
            const temp = this.frames[frameIndex];
            this.frames[frameIndex] = this.frames[frameIndex + 1];
            this.frames[frameIndex + 1] = temp;
            if (this.currentFrame === frameIndex) this.currentFrame++;
            else if (this.currentFrame === frameIndex + 1) this.currentFrame--;
            this.updateFramesList();
            this.selectFrame(this.currentFrame);
        }
    }

    syncGlobalLayersToCurrentFrame() {
        const frame = this.frames[this.currentFrame];
        if (!frame || !frame.layers) return;
        this.layers.forEach((layer, i) => {
            const frameLayer = frame.layers[i];
            if (frameLayer && layer.canvas && frameLayer.canvas) {
                // Copy image data from global layer to frame layer
                const ctx = frameLayer.canvas.getContext('2d');
                ctx.clearRect(0, 0, frameLayer.canvas.width, frameLayer.canvas.height);
                ctx.drawImage(layer.canvas, 0, 0);
                // Also sync properties
                frameLayer.name = layer.name;
                frameLayer.isVisible = layer.isVisible;
                frameLayer.opacity = layer.opacity;
                frameLayer.blendMode = layer.blendMode;
            }
        });
    }

    handleKeyboard(e) {
        // Example: Ctrl+Z for undo, Ctrl+Y for redo, Space for play/pause
        if (e.ctrlKey && e.key === 'z') {
            this.undo();
            e.preventDefault();
        } else if (e.ctrlKey && e.key === 'y') {
            this.redo();
            e.preventDefault();
        } else if (e.key === ' ') {
            this.togglePlay();
            e.preventDefault();
        }
    }

    handleResize() {
        this.resizeCanvases();
        this.drawGrid();
        this.renderCurrentFrameToMainCanvas();
    }

    handleFileLoad(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            const img = new Image();
            img.onload = () => {
                // Draw image to active layer
                const layer = this.layers.find(l => l.id === this.activeLayerId);
                if (layer) {
                    const ctx = layer.canvas.getContext('2d');
                    ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
                    ctx.drawImage(img, 0, 0, layer.canvas.width, layer.canvas.height);
                    this.renderCurrentFrameToMainCanvas();
                }
            };
            img.src = evt.target.result;
        };
        reader.readAsDataURL(file);
    }

    async openProject() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const text = await file.text();
            try {
                const data = JSON.parse(text);
                this.loadProjectData(data);
            } catch (err) {
                alert("Invalid project file.");
            }
        };
        input.click();
    }

    async saveProject(forcePrompt = false) {
        let name = this.projectName;
        if (!name || forcePrompt) {
            name = prompt("Enter a name for your project:", name || "SpriteSparkProject");
            if (!name) return;
            this.projectName = name;
        }
        const data = this.getProjectData();
        const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = name + ".json";
        a.click();
    }

    getProjectData() {
        // Serialize all frames, layers, and settings
        return {
            canvasWidth: this.canvasWidth,
            canvasHeight: this.canvasHeight,
            frames: this.frames.map(frame => ({
                layers: frame.layers.map(layer => ({
                    id: layer.id,
                    name: layer.name,
                    isVisible: layer.isVisible,
                    opacity: layer.opacity,
                    blendMode: layer.blendMode,
                    image: layer.canvas.toDataURL()
                }))
            })),
            layers: this.layers.map(layer => ({
                id: layer.id,
                name: layer.name,
                isVisible: layer.isVisible,
                opacity: layer.opacity,
                blendMode: layer.blendMode
            })),
            currentFrame: this.currentFrame,
            activeLayerId: this.activeLayerId,
            theme: this.currentTheme
        };
    }

    loadProjectData(data) {
        // Restore project from JSON
        this.canvasWidth = data.canvasWidth;
        this.canvasHeight = data.canvasHeight;
        this.currentFrame = data.currentFrame || 0;
        this.activeLayerId = data.activeLayerId || null;
        this.theme = data.theme || 'dark';
        this.applyTheme(this.theme);

        // Restore layers and frames
        this.layers = data.layers.map(l => ({
            ...l,
            canvas: this.createLayerCanvas()
        }));
        this.frames = data.frames.map(frame => ({
            layers: frame.layers.map(l => {
                const canvas = this.createLayerCanvas();
                const ctx = canvas.getContext('2d');
                if (l.image) {
                    const img = new window.Image();
                    img.src = l.image;
                    img.onload = () => ctx.drawImage(img, 0, 0);
                }
                return { ...l, canvas };
            })
        }));
        setTimeout(() => {
            this.renderLayersList();
            this.updateFramesList();
            this.renderCurrentFrameToMainCanvas();
        }, 100);
    }

    exportCurrentFrame() {
        let name = prompt("Enter a name for the exported frame:", "frame");
        if (!name) return;
        // Render current frame to a temp canvas
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.canvasWidth;
        tempCanvas.height = this.canvasHeight;
        const tempCtx = tempCanvas.getContext('2d');
        // Draw all visible layers
        for (let i = 0; i < this.layers.length; i++) {
            const layer = this.layers[i];
            if (!layer.isVisible) continue;
            tempCtx.globalAlpha = layer.opacity / 100;
            tempCtx.globalCompositeOperation = layer.blendMode;
            tempCtx.drawImage(layer.canvas, 0, 0);
        }
        tempCtx.globalAlpha = 1.0;
        tempCtx.globalCompositeOperation = 'source-over';
        // Download as PNG
        tempCanvas.toBlob(blob => {
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = name + ".png";
            a.click();
        });
    }

    exportAnimation() {
        // Show modal
        const modal = document.getElementById('exportModal');
        const formatSelect = document.getElementById('exportFormat');
        const nameInput = document.getElementById('exportName');
        const confirmBtn = document.getElementById('exportConfirm');
        const cancelBtn = document.getElementById('exportCancel');
        if (!modal || !formatSelect || !nameInput || !confirmBtn || !cancelBtn) return;

        // Reset modal fields
        nameInput.value = "animation";
        formatSelect.value = "gif";
        modal.classList.remove('hidden');
        nameInput.focus();

        // Remove previous listeners
        confirmBtn.onclick = null;
        cancelBtn.onclick = null;

        // Confirm export
        confirmBtn.onclick = () => {
            const name = nameInput.value.trim() || "animation";
            const format = formatSelect.value;
            modal.classList.add('hidden');
            this._doExportAnimation(name, format);
        };
        // Cancel export
        cancelBtn.onclick = () => {
            modal.classList.add('hidden');
        };
    }

    _doExportAnimation(name, format) {
    const loadingModal = document.getElementById('exportLoadingModal');
    const progressText = document.getElementById('exportProgressText');
    const progressBar = document.getElementById('exportProgressBar');
    const cancelBtn = document.getElementById('exportLoadingCancel');
    let cancelled = false;

    function showLoading(text, percent) {
        if (loadingModal) loadingModal.classList.remove('hidden');
        if (progressText) progressText.textContent = text;
        if (progressBar) progressBar.style.width = percent + "%";
    }
    function hideLoading() {
        if (loadingModal) loadingModal.classList.add('hidden');
    }

    if (cancelBtn) {
        cancelBtn.onclick = () => {
            cancelled = true;
            hideLoading();
        };
    }

    if (format === "gif") {
        const gif = new window.GIF({
            workers: 2,
            quality: 10,
            width: this.canvasWidth,
            height: this.canvasHeight,
            workerScript: 'https://cdn.jsdelivr.net/npm/gif.js.optimized/dist/gif.worker.js'
        });

        let totalFrames = this.frames.length;
        for (let f = 0; f < totalFrames; f++) {
            if (cancelled) return;
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = this.canvasWidth;
            tempCanvas.height = this.canvasHeight;
            const tempCtx = tempCanvas.getContext('2d');
            const frame = this.frames[f];
            for (let i = 0; i < frame.layers.length; i++) {
                const layer = frame.layers[i];
                if (!layer.isVisible) continue;
                tempCtx.globalAlpha = layer.opacity / 100;
                tempCtx.globalCompositeOperation = layer.blendMode;
                tempCtx.drawImage(layer.canvas, 0, 0);
            }
            tempCtx.globalAlpha = 1.0;
            tempCtx.globalCompositeOperation = 'source-over';
            gif.addFrame(tempCanvas, { delay: 1000 / this.fps });
        }

        gif.on('progress', (p) => {
            showLoading(`Encoding GIF: ${Math.round(p * 100)}%`, Math.round(p * 100));
        });
        gif.on('finished', function (blob) {
            hideLoading();
            if (cancelled) return;
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = name + ".gif";
            a.click();
        });
        showLoading("Encoding GIF: 0%", 0);
        gif.render();
    } else {
        // WebM/MP4 export using CCapture.js
        const capturer = new window.CCapture({
            format: format,
            framerate: this.fps,
            verbose: true,
            name: name
        });
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.canvasWidth;
        tempCanvas.height = this.canvasHeight;
        const tempCtx = tempCanvas.getContext('2d');
        let totalFrames = this.frames.length;
        let frameIdx = 0;
        capturer.start();
        showLoading(`Encoding ${format.toUpperCase()}: 0/${totalFrames}`, 0);

        const renderFrame = () => {
            if (cancelled) {
                capturer.stop();
                hideLoading();
                return;
            }
            if (frameIdx >= totalFrames) {
                capturer.stop();
                hideLoading();
                capturer.save();
                return;
            }
            // Draw the frame
            tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
            const frame = this.frames[frameIdx];
            for (let i = 0; i < frame.layers.length; i++) {
                const layer = frame.layers[i];
                if (!layer.isVisible) continue;
                tempCtx.globalAlpha = layer.opacity / 100;
                tempCtx.globalCompositeOperation = layer.blendMode;
                tempCtx.drawImage(layer.canvas, 0, 0);
            }
            tempCtx.globalAlpha = 1.0;
            tempCtx.globalCompositeOperation = 'source-over';

            // Wait for the browser to finish drawing, then capture
            requestAnimationFrame(() => {
                capturer.capture(tempCanvas);
                frameIdx++;
                showLoading(`Encoding ${format.toUpperCase()}: ${frameIdx}/${totalFrames}`, Math.round((frameIdx / totalFrames) * 100));
                setTimeout(renderFrame, 1000 / this.fps);
            });
        };
        renderFrame();
    }
}

    // UNDO/REDO functionality
    undoAdd() {
        const state = {
            frames: this.frames.map(frame => ({
                layers: frame.layers.map(layer => ({
                    ...layer,
                    canvas: (() => {
                        const c = document.createElement('canvas');
                        c.width = layer.canvas.width;
                        c.height = layer.canvas.height;
                        c.getContext('2d').drawImage(layer.canvas, 0, 0);
                        return c;
                    })()
                }))
            })),
            layers: this.layers.map(layer => ({
                ...layer,
                canvas: (() => {
                    const c = document.createElement('canvas');
                    c.width = layer.canvas.width;
                    c.height = layer.canvas.height;
                    c.getContext('2d').drawImage(layer.canvas, 0, 0);
                    return c;
                })()
            })),
            currentFrame: this.currentFrame,
            activeLayerId: this.activeLayerId
        };
        this.undoStack.push(state);
        if (this.undoStack.length > this.maxUndoSteps) this.undoStack.shift();
        this.redoStack = [];
    }

    undo() {
        if (this.undoStack.length === 0) return;
        const prev = this.undoStack.pop();
        this.redoStack.push(this._getCurrentState());
        this._restoreState(prev);
    }

    redo() {
        if (this.redoStack.length === 0) return;
        const next = this.redoStack.pop();
        this.undoStack.push(this._getCurrentState());
        this._restoreState(next);
    }

    _getCurrentState() {
        return {
            frames: this.frames.map(frame => ({
                layers: frame.layers.map(layer => ({
                    ...layer,
                    canvas: (() => {
                        const c = document.createElement('canvas');
                        c.width = layer.canvas.width;
                        c.height = layer.canvas.height;
                        c.getContext('2d').drawImage(layer.canvas, 0, 0);
                        return c;
                    })()
                }))
            })),
            layers: this.layers.map(layer => ({
                ...layer,
                canvas: (() => {
                    const c = document.createElement('canvas');
                    c.width = layer.canvas.width;
                    c.height = layer.canvas.height;
                    c.getContext('2d').drawImage(layer.canvas, 0, 0);
                    return c;
                })()
            })),
            currentFrame: this.currentFrame,
            activeLayerId: this.activeLayerId
        };
    }

    _restoreState(state) {
        this.frames = state.frames.map(frame => ({
            layers: frame.layers.map(layer => ({
                ...layer,
                canvas: (() => {
                    const c = document.createElement('canvas');
                    c.width = layer.canvas.width;
                    c.height = layer.canvas.height;
                    c.getContext('2d').drawImage(layer.canvas, 0, 0);
                    return c;
                })()
            }))
        }));
        this.layers = state.layers.map(layer => ({
            ...layer,
            canvas: (() => {
                const c = document.createElement('canvas');
                c.width = layer.canvas.width;
                c.height = layer.canvas.height;
                c.getContext('2d').drawImage(layer.canvas, 0, 0);
                return c;
            })()
        }));
        this.currentFrame = state.currentFrame;
        this.activeLayerId = state.activeLayerId;
        this.renderLayersList();
        this.updateFramesList();
        this.renderCurrentFrameToMainCanvas();
    }
}

function syncBottomResizeBar() {
    /*if (bottomPanel && bottomResize) {
        const rect = bottomPanel.getBoundingClientRect();
        bottomResize.style.top = (rect.top) + 'px';
        // Also update left/right in case panels changed
        updateBottomPanelPosition();
    }*/
}

function updateBottomPanelPosition() {
    const leftPanel = document.getElementById('leftPanel');
    const rightPanel = document.getElementById('rightPanel');
    const bottomPanel = document.getElementById('bottomPanel');
    const bottomResize = document.getElementById('bottomResize');

    const leftWidth = leftPanel ? leftPanel.offsetWidth : 280;
    const rightWidth = rightPanel ? rightPanel.offsetWidth : 280;

    if (bottomPanel) {
        bottomPanel.style.left = leftWidth + 'px';
        bottomPanel.style.right = rightWidth + 'px';
    }
    if (bottomResize) {
        bottomResize.style.left = leftWidth + 'px';
        bottomResize.style.right = rightWidth + 'px';
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const app = new SpriteSpark();

    // Ctrl+Wheel zoom for canvas only
    const canvasContainer = document.querySelector('.canvas-container');
    const zoomInput = document.getElementById('zoomInput');
    const bottomPanel = document.getElementById('bottomPanel');
    const bottomResize = document.getElementById('bottomResize');

    let isResizingBottom = false;
    let startY = 0, startHeight = 0;
    
    if (canvasContainer && zoomInput) {
        canvasContainer.addEventListener('wheel', (e) => {
            if (e.ctrlKey) {
                e.preventDefault();
                let zoom = parseFloat(zoomInput.value);
                if (e.deltaY < 0) zoom = Math.min(zoom + 0.1, 8);
                else zoom = Math.max(zoom - 0.1, 0.1);
                zoom = Math.round(zoom * 100) / 100;
                zoomInput.value = zoom;
                app.updateZoomLevel();
            }
        }, { passive: false });
    }

    // Make menu-item fully clickable for dropdowns
    document.querySelectorAll('.menubar .menu-item').forEach(item => {
        item.addEventListener('click', function (e) {
            // Only open dropdown if not clicking on a dropdown item
            if (!e.target.closest('.dropdown')) {
                document.querySelectorAll('.menubar .dropdown').forEach(d => d.classList.remove('open'));
                const dropdown = this.querySelector('.dropdown');
                if (dropdown) dropdown.classList.toggle('open');
                e.stopPropagation();
            }
        });
    });
    document.addEventListener('click', () => {
        document.querySelectorAll('.menubar .dropdown').forEach(d => d.classList.remove('open'));
    });

    // Bottom panel resizing
    if (bottomResize && bottomPanel) {
        bottomResize.addEventListener('mousedown', (e) => {
            isResizingBottom = true;
            startY = e.clientY;
            startHeight = bottomPanel.offsetHeight;
            document.body.style.cursor = 'ns-resize';
            e.preventDefault();
        });
        window.addEventListener('mousemove', (e) => {
            if (!isResizingBottom) return;
            let newHeight = startHeight - (e.clientY - startY);
            newHeight = Math.max(60, Math.min(newHeight, 320));
            bottomPanel.style.height = newHeight + 'px';
            syncBottomResizeBar();
        });
        window.addEventListener('mouseup', () => {
            if (isResizingBottom) {
                isResizingBottom = false;
                document.body.style.cursor = '';
                syncBottomResizeBar();
                updateBottomPanelPosition();
            }
        });
        // Initial sync
        syncBottomResizeBar();
        // Sync on window resize
        window.addEventListener('resize', () => {
            app.handleResize();
            updateBottomPanelPosition();
            syncBottomResizeBar();
        });
    }

    updateBottomPanelPosition();

    // --- Canvas Panning with Middle Mouse Button ---
    let isPanning = false;
    let panStart = { x: 0, y: 0 };
    let scrollStart = { left: 0, top: 0 };

    function startPan(e) {
        if (e.button !== 1) return; // Only middle mouse button
        isPanning = true;
        panStart.x = e.clientX;
        panStart.y = e.clientY;
        scrollStart.left = canvasContainer.scrollLeft;
        scrollStart.top = canvasContainer.scrollTop;
        canvasContainer.style.cursor = 'grab';
        e.preventDefault();
    }

    function panMove(e) {
        if (!isPanning) return;
        const dx = e.clientX - panStart.x;
        const dy = e.clientY - panStart.y;
        canvasContainer.scrollLeft = scrollStart.left - dx;
        canvasContainer.scrollTop = scrollStart.top - dy;
        e.preventDefault();
    }

    function endPan(e) {
        if (!isPanning) return;
        isPanning = false;
        canvasContainer.style.cursor = '';
        e.preventDefault();
    }

    if (canvasContainer) {
        canvasContainer.addEventListener('mousedown', startPan);
        canvasContainer.addEventListener('mousemove', panMove);
        window.addEventListener('mouseup', endPan);

        // Prevent default middle mouse scroll behavior
        canvasContainer.addEventListener('mousedown', function(e) {
            if (e.button === 1) e.preventDefault();
        });
    }

    function updateResizerPointerEvents() {
        const anyMenuOpen = !!document.querySelector('.menubar .dropdown.open');
        document.querySelectorAll('.resize-handle').forEach(el => {
            el.style.pointerEvents = anyMenuOpen ? 'none' : '';
        });
    }

    document.querySelectorAll('.menubar .menu-item').forEach(item => {
        item.addEventListener('mouseenter', updateResizerPointerEvents);
        item.addEventListener('mouseleave', updateResizerPointerEvents);
    });
    document.addEventListener('click', updateResizerPointerEvents);
});