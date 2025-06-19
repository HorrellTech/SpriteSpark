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
        this.frameActiveStates = []; // Track which frames are active/inactive

        // layer glow
        this.layerGlowSettings = {};

        // Onion skin properties
        this.showOnionSkin = false;
        this.onionSkinFrames = 1; // Number of frames before/after to show

        // Options properties
        this.pixelPerfect = true;
        this.pixelDrawingMode = true;
        this.pixelEdgeCorrection = false;

        // Frame Canvas Animation
        this.animateCanvasFrames = false;
        this.animateCanvasFramesInterval = null;

        // Canvas properties
        this.canvasWidth = 320;
        this.canvasHeight = 240;
        this.zoom = 1;
        this.showGrid = false;
        this.showOnionSkin = false;
        this.isDrawing = false;

        // Drawing properties
        this.currentTool = 'pen';
        this.drawingBuffer = null;
        this.smoothBrushPoints = [];
        this.primaryColor = '#000000';
        this.secondaryColor = '#ffffff';
        this.brushSize = 1;
        this.opacity = 100;
        this.showBrushGhost = true;
        this.floodFillTolerance = 0;
        this.floodFillDetectAllLayers = false;

        this.curveBrushPoints = []; // For interactive curve brush
        this.curveBrushActive = false;
        this.curveBrushDraggingPoint = null;
        this.curveBrushApplyIconPos = null;

        // Spline tool properties - ADD THESE MISSING PROPERTIES
        this.splinePoints = [];
        this.splineActive = false;
        this.isDraggingSplinePoint = false;
        this.draggingSplinePointIndex = -1;
        this.splineApplyButton = null;
        this.splineIntensity = 0.5; // 0 = straight lines, 1 = maximum curve
        this.splineType = 'catmull-rom'; // 'catmull-rom', 'bezier', 'b-spline'
        this.splineSmoothing = 0.02; // Step size for curve sampling (lower = smoother)
        this.splineTension = 0.5; // Tension for certain spline types
        this.splineShowControlLines = true; // Show connection lines between points
        this.splineShowNumbers = true; // Show point numbers

        // Selection properties
        this.selectionActive = false;
        this.selectionBounds = { x: 0, y: 0, width: 0, height: 0 };
        this.selectionPath = []; // For lasso selection
        this.selectionData = null; // Copied selection image data
        this.isDraggingSelection = false;
        this.selectionOffset = { x: 0, y: 0 };
        this.copiedSelection = null; // For copy/paste
        this.isCreatingSelection = false;
        this.selectionAnimationPhase = 0;
        this.selectionStartX = 0;
        this.selectionStartY = 0;
        this.selectionRotation = 0;

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

        this.objects = [];
        this.selectedObjectId = null;

        // Mirroring properties
        this.mirrorMode = 'none';
        this.mirrorAnimationPhase = 0;
        this.mirrorAnimationInterval = null;

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

        // Force recomputation of CSS custom properties
        getComputedStyle(document.documentElement).getPropertyValue('--checkerboard-light');

        // Get theme-aware checkerboard colors
        const computedStyle = getComputedStyle(document.documentElement);
        const lightColor = computedStyle.getPropertyValue('--checkerboard-light').trim() || '#e0e0e0';
        const darkColor = computedStyle.getPropertyValue('--checkerboard-dark').trim() || '#ffffff';

        // Clear the canvas first
        this.mainCtx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

        // Draw a checkerboard pattern on the main canvas for transparency
        const ctx = this.mainCtx;
        const size = 10;
        for (let y = 0; y < this.canvasHeight; y += size) {
            for (let x = 0; x < this.canvasWidth; x += size) {
                ctx.fillStyle = ((x / size + y / size) % 2 === 0) ? lightColor : darkColor;
                ctx.fillRect(x, y, size, size);
            }
        }
    }

    initializeEventListeners() {
        // Menu and toolbar actions
        document.addEventListener('click', this.handleMenuClick.bind(this));
        document.addEventListener('change', this.handleInputChange.bind(this));

        // Object properties panel events
        const nameInput = document.getElementById('objectName');
        const xInput = document.getElementById('objectX');
        const yInput = document.getElementById('objectY');
        const scaleInput = document.getElementById('objectScale');
        const angleInput = document.getElementById('objectAngle');
        const tweenInput = document.getElementById('objectTween');
        const imageInput = document.getElementById('objectImageInput');
        const setKeyframeBtn = document.getElementById('objectSetKeyframe');
        const removeKeyframeBtn = document.getElementById('objectRemoveKeyframe');

        const objectCenterBtn = document.getElementById('objectCenterBtn');
        const objectVisibleCheckbox = document.getElementById('objectVisibleCheckbox');
        const objectAlpha = document.getElementById('objectAlpha');
        const objectHue = document.getElementById('objectHue');
        const objectLayer = document.getElementById('objectLayer');


        // Object list
        this.renderObjectsList();

        // Canvas events
        if (this.mainCanvas) {
            this.mainCanvas.addEventListener('mousedown', this.startDrawing.bind(this));
            this.mainCanvas.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                if (this.currentTool === 'spline') {
                    this.handleSplineRightClick(e);
                } else {
                    this.swapPrimaryAndSecondaryColors();
                }
            });


            // Ghost cursor
            this.mainCanvas.addEventListener('mousemove', this.updateGhostCursor.bind(this));
            this.mainCanvas.addEventListener('mouseenter', this.showGhostCursor.bind(this));
            this.mainCanvas.addEventListener('mouseleave', this.hideGhostCursor.bind(this));

            this.mainCanvas.addEventListener('mousedown', this.handleCanvasMouseDown.bind(this));
            this.mainCanvas.addEventListener('mousemove', this.handleCanvasMouseMove.bind(this));
            this.mainCanvas.addEventListener('mouseup', this.handleCanvasMouseUp.bind(this));

            this.mainCanvas.addEventListener('mousedown', this.handleCurveBrushMouseDown.bind(this));
            this.mainCanvas.addEventListener('mousemove', this.handleCurveBrushMouseMove.bind(this));
            this.mainCanvas.addEventListener('mouseup', this.handleCurveBrushMouseUp.bind(this));

            // Spline tool events
            this.mainCanvas.addEventListener('mousedown', this.handleSplineMouseDown.bind(this));
            this.mainCanvas.addEventListener('mousemove', this.handleSplineMouseMove.bind(this));
            this.mainCanvas.addEventListener('mouseup', this.handleSplineMouseUp.bind(this));
        }

        // Panel resizing
        this.initializePanelResizing();

        // Keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyboard.bind(this));

        // Window resize
        window.addEventListener('resize', this.handleResize.bind(this));
        window.addEventListener('mousemove', this.draw.bind(this));
        window.addEventListener('mouseup', this.stopDrawing.bind(this));

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

        // Mirroring controls
        const mirrorModeSelect = document.getElementById('mirrorMode');
        if (mirrorModeSelect) {
            mirrorModeSelect.addEventListener('change', (e) => {
                this.mirrorMode = e.target.value;
                if (this.mirrorMode !== 'none') {
                    this.startMirrorAnimation();
                } else {
                    this.stopMirrorAnimation();
                }
                this.renderCurrentFrameToMainCanvas();
            });
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
            pixelPerfectCheckbox.checked = true; // Ensure checked by default
            this.pixelPerfect = true;
            document.body.classList.toggle('pixel-perfect', true); // <-- Add this line
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

        // SPRITE PROPERTIES PANEL
        [nameInput, xInput, yInput, scaleInput, angleInput, tweenInput].forEach(input => {
            if (input) {
                input.addEventListener('input', () => {
                    const obj = this.objects.find(o => o.id === this.selectedObjectId);
                    if (!obj) return;
                    const frame = this.currentFrame;
                    const transform = obj.getTransformAt(frame);
                    obj.name = nameInput.value;
                    obj.setKeyframe(frame, {
                        ...transform,
                        x: parseFloat(xInput.value),
                        y: parseFloat(yInput.value),
                        scale: parseFloat(scaleInput.value),
                        angle: parseFloat(angleInput.value),
                        image: transform.image
                    });
                    obj.tween = tweenInput.checked;
                    this.renderCurrentFrameToMainCanvas();
                });
            }
        });

        if (imageInput) {
            imageInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (evt) => {
                    const img = new window.Image();
                    img.onload = () => {
                        const obj = this.objects.find(o => o.id === this.selectedObjectId);
                        if (!obj) return;
                        const frame = this.currentFrame;
                        const transform = obj.getTransformAt(frame);
                        obj.setKeyframe(frame, {
                            ...transform,
                            image: img
                        });
                        this.renderCurrentFrameToMainCanvas();
                    };
                    img.src = evt.target.result;
                };
                reader.readAsDataURL(file);
            });
        }

        // Sprite object extra controls
        if (objectCenterBtn) {
            objectCenterBtn.onclick = () => {
                const obj = this.objects.find(o => o.id === this.selectedObjectId);
                if (!obj) return;
                const transform = obj.getTransformAt(this.currentFrame);
                obj.setKeyframe(this.currentFrame, {
                    ...transform,
                    x: this.canvasWidth / 2,
                    y: this.canvasHeight / 2
                });
                this.renderCurrentFrameToMainCanvas();
                this.showObjectPropertiesPanel(obj, obj.getTransformAt(this.currentFrame));
            };
        }
        if (objectVisibleCheckbox) {
            objectVisibleCheckbox.onchange = () => {
                const obj = this.objects.find(o => o.id === this.selectedObjectId);
                if (!obj) return;
                obj.visible = objectVisibleCheckbox.checked;
                this.renderCurrentFrameToMainCanvas();
            };
        }
        if (objectAlpha) {
            objectAlpha.oninput = () => {
                const obj = this.objects.find(o => o.id === this.selectedObjectId);
                if (!obj) return;
                obj.alpha = parseFloat(objectAlpha.value);
                this.renderCurrentFrameToMainCanvas();
            };
        }
        if (objectHue) {
            objectHue.oninput = () => {
                const obj = this.objects.find(o => o.id === this.selectedObjectId);
                if (!obj) return;
                obj.hue = parseInt(objectHue.value, 10) || 0;
                this.renderCurrentFrameToMainCanvas();
            };
        }
        if (objectLayer) {
            objectLayer.onchange = () => {
                const obj = this.objects.find(o => o.id === this.selectedObjectId);
                if (!obj) return;
                obj.layerId = objectLayer.value;
                this.renderCurrentFrameToMainCanvas();
            };
        }

        if (setKeyframeBtn) {
            setKeyframeBtn.addEventListener('click', () => {
                const obj = this.objects.find(o => o.id === this.selectedObjectId);
                if (!obj) return;
                const frame = this.currentFrame;
                const transform = obj.getTransformAt(frame);
                obj.setKeyframe(frame, { ...transform });
            });
        }
        if (removeKeyframeBtn) {
            removeKeyframeBtn.addEventListener('click', () => {
                const obj = this.objects.find(o => o.id === this.selectedObjectId);
                if (!obj) return;
                obj.removeKeyframe(this.currentFrame);
                this.renderCurrentFrameToMainCanvas();
            });
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

                // Restart canvas frame animation if enabled
                const animateCanvasFramesCheckbox = document.getElementById('animateCanvasFrames');
                if (animateCanvasFramesCheckbox && animateCanvasFramesCheckbox.checked) {
                    this.startAnimateCanvasFrames();
                }
            });
        }

        // Loop Checkbox
        const loopCheckbox = document.getElementById('loopAnimation');
        if (loopCheckbox) {
            loopCheckbox.addEventListener('change', (e) => {
                this.loopAnimation = e.target.checked;
                // If preview is enabled and loop is checked, restart animation
                if (this.loopAnimation) {
                    const enablePreviewCheckbox = document.getElementById('enablePreview');
                    if (enablePreviewCheckbox && enablePreviewCheckbox.checked) {
                        this.isPlaying = true;
                        this.playAnimation();
                    }
                }
            });
        }

        // Animate Canvas Frames Checkbox
        const animateCanvasFramesCheckbox = document.getElementById('animateCanvasFrames');
        if (animateCanvasFramesCheckbox) {
            animateCanvasFramesCheckbox.addEventListener('change', () => {
                this.animateCanvasFrames = animateCanvasFramesCheckbox.checked;
                if (this.animateCanvasFrames) {
                    this.startAnimateCanvasFrames();
                } else {
                    this.stopAnimateCanvasFrames();
                }
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
        const showBrushGhost = document.getElementById('showBrushGhost');
        const floodFillTolerance = document.getElementById('floodFillTolerance');
        const floodFillToleranceValue = document.getElementById('floodFillToleranceValue');
        const splineIntensity = document.getElementById('splineIntensity');
        const splineIntensityValue = document.getElementById('splineIntensityValue');

        // Enhanced spline controls
        const splineType = document.getElementById('splineType');
        const splineSmoothing = document.getElementById('splineSmoothing');
        const splineSmoothingValue = document.getElementById('splineSmoothingValue');
        const splineTension = document.getElementById('splineTension');
        const splineTensionValue = document.getElementById('splineTensionValue');
        const splineShowControlLines = document.getElementById('splineShowControlLines');
        const splineShowNumbers = document.getElementById('splineShowNumbers');

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

        // Enhanced spline controls
        if (splineIntensity && splineIntensityValue) {
            splineIntensity.value = this.splineIntensity * 100;
            splineIntensityValue.textContent = Math.round(this.splineIntensity * 100);
            splineIntensity.addEventListener('input', (e) => {
                this.splineIntensity = parseInt(e.target.value, 10) / 100;
                splineIntensityValue.textContent = parseInt(e.target.value, 10);
                if (this.splineActive) {
                    this.renderCurrentFrameToMainCanvas();
                    this.drawSplinePreview();
                }
            });
        }

        if (splineType) {
            splineType.value = this.splineType;
            splineType.addEventListener('change', (e) => {
                this.splineType = e.target.value;
                if (this.splineActive) {
                    this.renderCurrentFrameToMainCanvas();
                    this.drawSplinePreview();
                }
            });
        }

        if (splineSmoothing && splineSmoothingValue) {
            splineSmoothing.value = this.splineSmoothing * 1000; // Scale for slider
            splineSmoothingValue.textContent = (this.splineSmoothing * 1000).toFixed(0);
            splineSmoothing.addEventListener('input', (e) => {
                this.splineSmoothing = parseInt(e.target.value, 10) / 1000;
                splineSmoothingValue.textContent = parseInt(e.target.value, 10);
                if (this.splineActive) {
                    this.renderCurrentFrameToMainCanvas();
                    this.drawSplinePreview();
                }
            });
        }

        if (splineTension && splineTensionValue) {
            splineTension.value = this.splineTension * 100;
            splineTensionValue.textContent = Math.round(this.splineTension * 100);
            splineTension.addEventListener('input', (e) => {
                this.splineTension = parseInt(e.target.value, 10) / 100;
                splineTensionValue.textContent = parseInt(e.target.value, 10);
                if (this.splineActive) {
                    this.renderCurrentFrameToMainCanvas();
                    this.drawSplinePreview();
                }
            });
        }

        if (splineShowControlLines) {
            splineShowControlLines.checked = this.splineShowControlLines;
            splineShowControlLines.addEventListener('change', (e) => {
                this.splineShowControlLines = e.target.checked;
                if (this.splineActive) {
                    this.renderCurrentFrameToMainCanvas();
                    this.drawSplinePreview();
                }
            });
        }

        if (splineShowNumbers) {
            splineShowNumbers.checked = this.splineShowNumbers;
            splineShowNumbers.addEventListener('change', (e) => {
                this.splineShowNumbers = e.target.checked;
                if (this.splineActive) {
                    this.renderCurrentFrameToMainCanvas();
                    this.drawSplinePreview();
                }
            });
        }

        if (showBrushGhost) {
            showBrushGhost.checked = this.showBrushGhost;
            showBrushGhost.addEventListener('change', (e) => {
                this.showBrushGhost = e.target.checked;
            });
        }

        // Flood fill controls
        if (floodFillTolerance && floodFillToleranceValue) {
            floodFillTolerance.value = this.floodFillTolerance;
            floodFillToleranceValue.textContent = this.floodFillTolerance;
            floodFillTolerance.addEventListener('input', (e) => {
                this.floodFillTolerance = parseInt(e.target.value, 10);
                floodFillToleranceValue.textContent = this.floodFillTolerance;
            });
        }

        if (floodFillDetectAllLayers) {
            floodFillDetectAllLayers.checked = this.floodFillDetectAllLayers;
            floodFillDetectAllLayers.addEventListener('change', (e) => {
                this.floodFillDetectAllLayers = e.target.checked;
            });
        }

        const pixelPerfectCheckbox = document.getElementById('pixelPerfectCheckbox');
        if (pixelPerfectCheckbox) {
            pixelPerfectCheckbox.checked = true; // Ensure checked by default
            this.pixelPerfect = true;
            pixelPerfectCheckbox.addEventListener('change', (e) => {
                this.pixelPerfect = e.target.checked;
                document.body.classList.toggle('pixel-perfect', this.pixelPerfect);
            });
        }
        const pixelDrawingCheckbox = document.getElementById('pixelDrawingCheckbox');
        if (pixelDrawingCheckbox) {
            pixelDrawingCheckbox.checked = true; // Ensure checked by default
            this.pixelDrawingMode = true;
            pixelDrawingCheckbox.addEventListener('change', (e) => {
                this.pixelDrawingMode = e.target.checked;
            });
        }

        // Re-query toolButtons after adding new ones
        const allToolButtons = document.querySelectorAll('.drawing-tool');
        allToolButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                allToolButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentTool = btn.getAttribute('data-tool');
                const floodFillOptions = document.getElementById('floodFillOptions');
                if (floodFillOptions) {
                    floodFillOptions.style.display = (this.currentTool === 'bucket') ? 'block' : 'none';
                }
            });
        });

        toolButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                toolButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentTool = btn.getAttribute('data-tool');

                // Show/hide tool-specific options
                const floodFillOptions = document.getElementById('floodFillOptions');
                const splineOptions = document.getElementById('splineOptions');

                if (floodFillOptions) {
                    floodFillOptions.style.display = (this.currentTool === 'bucket') ? 'block' : 'none';
                }
                if (splineOptions) {
                    splineOptions.style.display = (this.currentTool === 'spline') ? 'block' : 'none';
                }

                // Clear spline state when switching tools
                if (this.currentTool !== 'spline' && this.splineActive) {
                    this.splinePoints = [];
                    this.splineActive = false;
                    this.splineApplyButton = null;
                    this.renderCurrentFrameToMainCanvas();
                }
            });
        });
    }

    initializePanelResizing() {
        /*const leftResize = document.querySelector('.left-resize');
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
        document.addEventListener('mouseup', stopResize);*/
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
            // Left click: set primary
            swatch.addEventListener('click', (e) => {
                if (e.button === 0) {
                    this.primaryColor = color;
                    this.updateColorSwatchHighlight();
                    const primaryColorEl = document.getElementById('primaryColor');
                    const colorPicker = document.getElementById('colorPicker');
                    if (primaryColorEl) primaryColorEl.style.backgroundColor = color;
                    if (colorPicker) colorPicker.value = color;
                }
            });
            // Right click: set secondary
            swatch.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.secondaryColor = color;
                this.updateColorSwatchHighlight();
                const secondaryColorEl = document.getElementById('secondaryColor');
                if (secondaryColorEl) secondaryColorEl.style.backgroundColor = color;
                const colorPicker = document.getElementById('colorPicker');
                if (colorPicker) colorPicker.value = this.primaryColor;
            });
            palette.appendChild(swatch);
        });

        // Set initial colors
        const primaryColorEl = document.getElementById('primaryColor');
        const secondaryColorEl = document.getElementById('secondaryColor');
        if (primaryColorEl) primaryColorEl.style.backgroundColor = this.primaryColor;
        if (secondaryColorEl) secondaryColorEl.style.backgroundColor = this.secondaryColor;

        // Left click: set primary, right click: set secondary for main swatches
        if (primaryColorEl) {
            primaryColorEl.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                // Swap colors
                const temp = this.primaryColor;
                this.primaryColor = this.secondaryColor;
                this.secondaryColor = temp;
                primaryColorEl.style.backgroundColor = this.primaryColor;
                if (secondaryColorEl) secondaryColorEl.style.backgroundColor = this.secondaryColor;
                this.updateColorSwatchHighlight();
                const colorPicker = document.getElementById('colorPicker');
                if (colorPicker) colorPicker.value = this.primaryColor;
            });
        }
        if (secondaryColorEl) {
            secondaryColorEl.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                // Swap colors
                const temp = this.primaryColor;
                this.primaryColor = this.secondaryColor;
                this.secondaryColor = temp;
                if (primaryColorEl) primaryColorEl.style.backgroundColor = this.primaryColor;
                secondaryColorEl.style.backgroundColor = this.secondaryColor;
                this.updateColorSwatchHighlight();
                const colorPicker = document.getElementById('colorPicker');
                if (colorPicker) colorPicker.value = this.primaryColor;
            });
        }

        // Color picker: left click = primary, right click = secondary
        const colorPicker = document.getElementById('colorPicker');
        if (colorPicker) {
            colorPicker.addEventListener('change', (e) => {
                this.primaryColor = e.target.value;
                if (primaryColorEl) primaryColorEl.style.backgroundColor = this.primaryColor;
                this.updateColorSwatchHighlight();
            });
            colorPicker.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.secondaryColor = colorPicker.value;
                if (secondaryColorEl) secondaryColorEl.style.backgroundColor = this.secondaryColor;
                this.updateColorSwatchHighlight();
            });
        }

        // Highlight selected color
        this.updateColorSwatchHighlight();
    }

    updateColorSwatchHighlight() {
        // Highlight the selected primary and secondary color swatches
        const palette = document.getElementById('colorPalette');
        if (!palette) return;

        const swatches = palette.querySelectorAll('.color-swatch');
        swatches.forEach(swatch => {
            swatch.classList.remove('primary-selected', 'secondary-selected');
            if (swatch.style.backgroundColor.toLowerCase() === this.hexToRgb(this.primaryColor).toLowerCase()) {
                swatch.classList.add('primary-selected');
            }
            if (swatch.style.backgroundColor.toLowerCase() === this.hexToRgb(this.secondaryColor).toLowerCase()) {
                swatch.classList.add('secondary-selected');
            }
        });

        const primaryColorEl = document.getElementById('primaryColor');
        const secondaryColorEl = document.getElementById('secondaryColor');
        if (primaryColorEl && secondaryColorEl) {
            // Only one gets the active class at a time
            if (document.activeElement === primaryColorEl) {
                primaryColorEl.classList.add('active');
                secondaryColorEl.classList.remove('active');
            } else if (document.activeElement === secondaryColorEl) {
                secondaryColorEl.classList.add('active');
                primaryColorEl.classList.remove('active');
            } else {
                // Default: highlight primary
                primaryColorEl.classList.add('active');
                secondaryColorEl.classList.remove('active');
            }
        }
    }

    startAnimateCanvasFrames() {
        this.stopAnimateCanvasFrames();
        if (!this.frames || this.frames.length < 2) return;

        const frameDuration = 1000 / this.fps;
        this.animateCanvasFramesInterval = setInterval(() => {
            // Find next active frame
            let nextFrame = this.currentFrame + 1;
            while (nextFrame < this.frames.length && this.frames[nextFrame].isActive === false) {
                nextFrame++;
            }

            if (nextFrame >= this.frames.length) {
                // Loop back to first active frame
                nextFrame = 0;
                while (nextFrame < this.frames.length && this.frames[nextFrame].isActive === false) {
                    nextFrame++;
                }
                if (nextFrame >= this.frames.length) {
                    // No active frames, stop animation
                    this.stopAnimateCanvasFrames();
                    return;
                }
            }

            this.selectFrame(nextFrame);
        }, frameDuration);
    }

    stopAnimateCanvasFrames() {
        if (this.animateCanvasFramesInterval) {
            clearInterval(this.animateCanvasFramesInterval);
            this.animateCanvasFramesInterval = null;
        }
    }

    swapPrimaryAndSecondaryColors() {
        const temp = this.primaryColor;
        this.primaryColor = this.secondaryColor;
        this.secondaryColor = temp;
        // Update UI
        const primaryColorEl = document.getElementById('primaryColor');
        const secondaryColorEl = document.getElementById('secondaryColor');
        if (primaryColorEl) primaryColorEl.style.backgroundColor = this.primaryColor;
        if (secondaryColorEl) secondaryColorEl.style.backgroundColor = this.secondaryColor;
        this.updateColorSwatchHighlight();
        const colorPicker = document.getElementById('colorPicker');
        if (colorPicker) colorPicker.value = this.primaryColor;
    }

    // Utility to convert hex to rgb string for comparison
    hexToRgb(hex) {
        // Expand shorthand form (e.g. "03F") to full form ("0033FF")
        let shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function (m, r, g, b) {
            return r + r + g + g + b + b;
        });
        let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})` : hex;
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

        // Force a redraw after theme change to update checkerboard colors
        setTimeout(() => {
            this.drawGrid();
            this.drawCheckerboardBackground(); // Add this line
            this.renderCurrentFrameToMainCanvas(); // Add this line
        }, 100);
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

            // --- Add drag grip ---
            const dragGrip = document.createElement('span');
            dragGrip.className = 'layer-drag-grip';
            dragGrip.title = 'Drag to reorder';
            dragGrip.innerHTML = '&#9776;'; // Unicode hamburger
            dragGrip.style.cursor = 'grab';
            dragGrip.draggable = true;

            // Only the drag grip is draggable
            dragGrip.addEventListener('dragstart', (e) => {
                e.stopPropagation();
                e.dataTransfer.setData('text/plain', layer.id);
                item.classList.add('dragging');
            });
            dragGrip.addEventListener('dragend', (e) => {
                e.stopPropagation();
                item.classList.remove('dragging');
            });
            dragGrip.addEventListener('dragover', (e) => {
                e.preventDefault();
                item.classList.add('drag-over');
            });
            dragGrip.addEventListener('dragleave', () => {
                item.classList.remove('drag-over');
            });
            dragGrip.addEventListener('drop', (e) => {
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
            item.appendChild(dragGrip);

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

            // Prevent drag when interacting with controls
            const opacityInput = document.createElement('input');
            opacityInput.type = 'range';
            opacityInput.className = 'layer-opacity';
            opacityInput.min = 0;
            opacityInput.max = 100;
            opacityInput.value = layer.opacity;
            opacityInput.title = 'Opacity';
            opacityInput.addEventListener('input', (e) => this.setLayerOpacity(layer.id, e.target.value));
            opacityInput.addEventListener('mousedown', e => e.stopPropagation());
            opacityInput.addEventListener('pointerdown', e => e.stopPropagation());
            opacityInput.addEventListener('touchstart', e => e.stopPropagation());

            // --- Glow settings button ---
            /*const glowBtn = document.createElement('button');
            glowBtn.className = 'layer-glow-settings';
            glowBtn.title = 'Layer Glow Settings';
            glowBtn.innerHTML = '✨';
            glowBtn.style.marginLeft = '6px';
            glowBtn.style.background = 'none';
            glowBtn.style.border = 'none';
            glowBtn.style.cursor = 'pointer';
            glowBtn.style.fontSize = '18px';
            glowBtn.style.color = 'var(--accent-color)';
            glowBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showLayerGlowModal(layer.id);
            });*/

            item.appendChild(visibilityBtn);
            item.appendChild(nameSpan);
            item.appendChild(blendSelect);
            item.appendChild(opacityInput);
            //item.appendChild(glowBtn);

            item.addEventListener('click', (evt) => {
                if (
                    evt.target === nameSpan ||
                    evt.target === blendSelect ||
                    evt.target === opacityInput ||
                    evt.target === visibilityBtn ||
                    evt.target === dragGrip
                ) return;
                this.setActiveLayer(layer.id);
            });

            // Make each layer item draggable
            item.draggable = false;
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

        // Find the next active frame from current position
        let startIndex = this.currentFrame;
        while (startIndex < this.frames.length && this.frames[startIndex].isActive === false) {
            startIndex++;
        }
        if (startIndex >= this.frames.length) {
            // No active frames found after current, start from beginning
            startIndex = 0;
            while (startIndex < this.frames.length && this.frames[startIndex].isActive === false) {
                startIndex++;
            }
        }

        this.currentFrameIndex = startIndex;
        const frameDuration = 1000 / this.fps;

        this.animationInterval = setInterval(() => {
            // Only render if current frame is active
            if (this.frames[this.currentFrameIndex] && this.frames[this.currentFrameIndex].isActive !== false) {
                this.renderFrameToLivePreview(this.currentFrameIndex);
            }

            // Find next active frame
            let nextIndex = this.currentFrameIndex + 1;
            while (nextIndex < this.frames.length && this.frames[nextIndex].isActive === false) {
                nextIndex++;
            }

            if (nextIndex >= this.frames.length) {
                if (this.loopAnimation) {
                    // Loop back to first active frame
                    nextIndex = 0;
                    while (nextIndex < this.frames.length && this.frames[nextIndex].isActive === false) {
                        nextIndex++;
                    }
                    if (nextIndex >= this.frames.length) {
                        // No active frames at all, stop animation
                        this.pauseAnimation();
                        return;
                    }
                } else {
                    // No loop, stop at last active frame
                    this.pauseAnimation();
                    return;
                }
            }

            this.currentFrameIndex = nextIndex;
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
        if (this.livePreviewCanvas) {
            this.livePreviewCanvas.width = newWidth;
            this.livePreviewCanvas.height = newHeight;
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

        // Update all frame layer canvases too
        this.frames.forEach(frame => {
            frame.layers.forEach((frameLayer, layerIndex) => {
                if (frameLayer.canvas) {
                    const tempCanvas = document.createElement('canvas');
                    const tempCtx = tempCanvas.getContext('2d');
                    tempCanvas.width = frameLayer.canvas.width;
                    tempCanvas.height = frameLayer.canvas.height;
                    tempCtx.drawImage(frameLayer.canvas, 0, 0);

                    frameLayer.canvas.width = newWidth;
                    frameLayer.canvas.height = newHeight;

                    const ctx = frameLayer.canvas.getContext('2d');
                    ctx.clearRect(0, 0, newWidth, newHeight);

                    if (method === 'stretch') {
                        ctx.drawImage(tempCanvas, 0, 0, newWidth, newHeight);
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
                        ctx.drawImage(tempCanvas, dx, dy, drawWidth, drawHeight);
                    } else {
                        ctx.drawImage(tempCanvas, 0, 0);
                    }
                }
            });
        });

        // IMPORTANT: Call these methods to update the visual size and re-render
        this.resizeCanvases();
        this.drawGrid();
        this.renderCurrentFrameToMainCanvas();

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
        const frame = {
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
            }),
            isActive: true // New frames are active by default
        };

        return frame;
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
            }),
            isActive: true // New frames are active by default
        };
        this.frames.push(newFrame);
        this.frameActiveStates.push(true);
        this.currentFrame = this.frames.length - 1;
        this.selectFrame(this.currentFrame);
        this.updateFramesList();
        this.triggerLivePreviewIfEnabled();
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
        this.triggerLivePreviewIfEnabled();
    }

    createLayerCanvas() {
        const canvas = document.createElement('canvas');
        canvas.width = this.canvasWidth;
        canvas.height = this.canvasHeight;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
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

    // --- Curve Brush Event Handlers ---
    handleCurveBrushMouseDown(e) {
        if (this.currentTool !== 'curve-brush') return;
        const rect = this.mainCanvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / this.zoom);
        const y = Math.floor((e.clientY - rect.top) / this.zoom);

        // Check if clicking on a control point
        for (let i = 0; i < this.curveBrushPoints.length; i++) {
            const pt = this.curveBrushPoints[i];
            if (Math.hypot(pt.x - x, pt.y - y) < 8) {
                this.curveBrushDraggingPoint = i;
                return;
            }
        }

        // Check if clicking on the apply icon
        if (this.curveBrushApplyIconPos && Math.hypot(this.curveBrushApplyIconPos.x - x, this.curveBrushApplyIconPos.y - y) < 16) {
            this.applyCurveBrush();
            return;
        }

        // Otherwise, add a new point
        this.curveBrushPoints.push({ x, y });
        this.curveBrushActive = true;
        this.renderCurrentFrameToMainCanvas();
        this.drawCurveBrushPreview();
    }

    handleCurveBrushMouseMove(e) {
        if (this.currentTool !== 'curve-brush' || this.curveBrushDraggingPoint === null) return;
        const rect = this.mainCanvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / this.zoom);
        const y = Math.floor((e.clientY - rect.top) / this.zoom);
        this.curveBrushPoints[this.curveBrushDraggingPoint] = { x, y };
        this.renderCurrentFrameToMainCanvas();
        this.drawCurveBrushPreview();
    }

    handleCurveBrushMouseUp(e) {
        if (this.currentTool !== 'curve-brush') return;
        this.curveBrushDraggingPoint = null;
    }

    // --- Draw Curve Brush Preview and Controls ---
    drawCurveBrushPreview() {
        if (!this.ctx || this.curveBrushPoints.length === 0) return;

        // Draw the spline curve
        this.ctx.save();
        this.ctx.globalAlpha = 0.8;
        this.ctx.strokeStyle = this.primaryColor;
        this.ctx.lineWidth = this.brushSize;
        this.ctx.setLineDash([6, 4]);
        this.drawSmoothCurve(this.ctx, this.curveBrushPoints);
        this.ctx.setLineDash([]);
        this.ctx.restore();

        // Draw control points
        for (let pt of this.curveBrushPoints) {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(pt.x, pt.y, 8, 0, 2 * Math.PI);
            this.ctx.fillStyle = '#fff';
            this.ctx.globalAlpha = 0.9;
            this.ctx.fill();
            this.ctx.lineWidth = 2;
            this.ctx.strokeStyle = '#222';
            this.ctx.globalAlpha = 1;
            this.ctx.stroke();
            this.ctx.restore();
        }

        // Draw lines between points
        this.ctx.save();
        this.ctx.strokeStyle = '#888';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([2, 4]);
        this.ctx.beginPath();
        for (let i = 0; i < this.curveBrushPoints.length; i++) {
            const pt = this.curveBrushPoints[i];
            if (i === 0) this.ctx.moveTo(pt.x, pt.y);
            else this.ctx.lineTo(pt.x, pt.y);
        }
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        this.ctx.restore();

        // Draw apply (tick) icon at center of all points
        if (this.curveBrushPoints.length > 1) {
            const center = this.getCurveBrushCenter();
            this.curveBrushApplyIconPos = center;
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(center.x, center.y, 14, 0, 2 * Math.PI);
            this.ctx.fillStyle = '#4caf50';
            this.ctx.globalAlpha = 0.85;
            this.ctx.fill();
            this.ctx.lineWidth = 2;
            this.ctx.strokeStyle = '#222';
            this.ctx.globalAlpha = 1;
            this.ctx.stroke();
            // Draw tick
            this.ctx.beginPath();
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 3;
            this.ctx.moveTo(center.x - 5, center.y + 1);
            this.ctx.lineTo(center.x, center.y + 7);
            this.ctx.lineTo(center.x + 7, center.y - 6);
            this.ctx.stroke();
            this.ctx.restore();
        } else {
            this.curveBrushApplyIconPos = null;
        }
    }

    // --- Utility: Get Center of Curve Points ---
    getCurveBrushCenter() {
        let x = 0, y = 0;
        for (const pt of this.curveBrushPoints) {
            x += pt.x;
            y += pt.y;
        }
        return {
            x: x / this.curveBrushPoints.length,
            y: y / this.curveBrushPoints.length
        };
    }

    // --- Apply the Curve to the Layer ---
    applyCurveBrush() {
        if (!this.activeLayerId || this.curveBrushPoints.length < 2) return;
        this.undoAdd();
        const layer = this.layers.find(l => l.id === this.activeLayerId);
        if (layer) {
            const ctx = layer.canvas.getContext('2d');
            ctx.save();
            ctx.globalAlpha = this.opacity / 100;
            ctx.strokeStyle = this.primaryColor;
            ctx.lineWidth = this.brushSize;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            this.drawSmoothCurve(ctx, this.curveBrushPoints);
            ctx.restore();
        }
        this.curveBrushPoints = [];
        this.curveBrushActive = false;
        this.curveBrushApplyIconPos = null;
        this.renderCurrentFrameToMainCanvas();
        this.syncGlobalLayersToCurrentFrame();
    }

    // --- Modal for Glow Settings ---
    showLayerGlowModal(layerId) {
        // Remove any existing modal
        let modal = document.getElementById('layerGlowModal');
        if (modal) modal.remove();

        const settings = this.layerGlowSettings[layerId] || {
            enabled: false,
            size: 8,
            color: getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim() || '#007acc'
        };

        // Modal HTML
        modal = document.createElement('div');
        modal.id = 'layerGlowModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="min-width:320px;">
                <h2>Layer Glow Settings</h2>
                <label style="margin-bottom:8px;">
                    <input type="checkbox" id="glowEnabled" ${settings.enabled ? 'checked' : ''}>
                    Enable Glow
                </label>
                <label>
                    Glow Size:
                    <input type="range" id="glowSize" min="1" max="64" value="${settings.size}" style="width:120px;">
                    <span id="glowSizeValue">${settings.size}</span> px
                </label>
                <label>
                    Glow Color:
                    <input type="color" id="glowColor" value="${settings.color}">
                </label>
                <div class="modal-actions" style="margin-top:16px;">
                    <button id="glowSaveBtn" class="modal-btn accent">Save</button>
                    <button id="glowCancelBtn" class="modal-btn">Cancel</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Theme conformity
        modal.querySelector('.modal-content').style.background = getComputedStyle(document.documentElement).getPropertyValue('--bg-elevated');
        modal.querySelector('.modal-content').style.color = getComputedStyle(document.documentElement).getPropertyValue('--text-primary');

        // Live update size value
        modal.querySelector('#glowSize').addEventListener('input', function () {
            modal.querySelector('#glowSizeValue').textContent = this.value;
        });

        // Save
        modal.querySelector('#glowSaveBtn').onclick = () => {
            this.layerGlowSettings[layerId] = {
                enabled: modal.querySelector('#glowEnabled').checked,
                size: parseInt(modal.querySelector('#glowSize').value, 10),
                color: modal.querySelector('#glowColor').value
            };
            modal.remove();
            this.renderCurrentFrameToMainCanvas();
        };
        // Cancel
        modal.querySelector('#glowCancelBtn').onclick = () => modal.remove();
        // Close on outside click
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    }

    applyHSLEffect(hue = 0, saturation = 0, lightness = 0) {
        // Add undo state first
        this.undoAdd();

        // Only adjust HSL for the active layer in the current frame
        const frame = this.frames[this.currentFrame];
        if (!frame || !this.activeLayerId) return;

        const layerIndex = this.layers.findIndex(l => l.id === this.activeLayerId);
        if (layerIndex === -1) return;

        const layer = frame.layers[layerIndex];
        if (!layer || !layer.isVisible) return;

        const ctx = layer.canvas.getContext('2d');
        const w = layer.canvas.width, h = layer.canvas.height;
        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;

        for (let i = 0; i < data.length; i += 4) {
            // Convert RGB to HSL
            let r = data[i] / 255, g = data[i + 1] / 255, b = data[i + 2] / 255;
            let max = Math.max(r, g, b), min = Math.min(r, g, b);
            let h, s, l = (max + min) / 2;

            if (max === min) {
                h = s = 0;
            } else {
                let d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }
                h /= 6;
            }

            // Adjust HSL
            h = (h * 360 + hue + 360) % 360 / 360;
            s = Math.min(1, Math.max(0, s + saturation / 100));
            l = Math.min(1, Math.max(0, l + lightness / 100));

            // Convert back to RGB
            let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            let p = 2 * l - q;
            function hue2rgb(p, q, t) {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            }
            r = hue2rgb(p, q, h);
            g = hue2rgb(p, q, h + 1 / 3);
            b = hue2rgb(p, q, h - 1 / 3);

            data[i] = Math.round(r * 255);
            data[i + 1] = Math.round(g * 255);
            data[i + 2] = Math.round(b * 255);
        }

        ctx.putImageData(imgData, 0, 0);

        // Also apply to the corresponding global layer
        const globalLayer = this.layers[layerIndex];
        if (globalLayer) {
            const globalCtx = globalLayer.canvas.getContext('2d');
            globalCtx.clearRect(0, 0, globalLayer.canvas.width, globalLayer.canvas.height);
            globalCtx.drawImage(layer.canvas, 0, 0);
        }

        this.renderCurrentFrameToMainCanvas();
    }

    applyRecolorEffect(fromColor, toColor, tolerance = 0) {
        // Add undo state first
        this.undoAdd();

        function hexToRgbArr(hex) {
            hex = hex.replace(/^#/, '');
            if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
            const num = parseInt(hex, 16);
            return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
        }

        const fromRgb = hexToRgbArr(fromColor);
        const toRgb = hexToRgbArr(toColor);

        // Only recolor the active layer in the current frame
        const frame = this.frames[this.currentFrame];
        if (!frame || !this.activeLayerId) return;

        const layerIndex = this.layers.findIndex(l => l.id === this.activeLayerId);
        if (layerIndex === -1) return;

        const layer = frame.layers[layerIndex];
        if (!layer || !layer.isVisible) return;

        const ctx = layer.canvas.getContext('2d');
        const w = layer.canvas.width, h = layer.canvas.height;
        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;

        for (let i = 0; i < data.length; i += 4) {
            const dr = Math.abs(data[i] - fromRgb[0]);
            const dg = Math.abs(data[i + 1] - fromRgb[1]);
            const db = Math.abs(data[i + 2] - fromRgb[2]);
            if (dr <= tolerance && dg <= tolerance && db <= tolerance) {
                data[i] = toRgb[0];
                data[i + 1] = toRgb[1];
                data[i + 2] = toRgb[2];
            }
        }

        ctx.putImageData(imgData, 0, 0);

        // Also apply to the corresponding global layer
        const globalLayer = this.layers[layerIndex];
        if (globalLayer) {
            const globalCtx = globalLayer.canvas.getContext('2d');
            globalCtx.clearRect(0, 0, globalLayer.canvas.width, globalLayer.canvas.height);
            globalCtx.drawImage(layer.canvas, 0, 0);
        }

        this.renderCurrentFrameToMainCanvas();
    }

    applyGlowEffect(color = '#ffffff', thickness = 8, opacity = 0.8) {
        // Add undo state first
        this.undoAdd();

        // Only apply glow to the active layer in the current frame
        const frame = this.frames[this.currentFrame];
        if (!frame || !this.activeLayerId) return;

        const layerIndex = this.layers.findIndex(l => l.id === this.activeLayerId);
        if (layerIndex === -1) return;

        const layer = frame.layers[layerIndex];
        if (!layer || !layer.isVisible) return;

        const ctx = layer.canvas.getContext('2d');

        // Create a copy of the original content
        const original = document.createElement('canvas');
        original.width = layer.canvas.width;
        original.height = layer.canvas.height;
        const originalCtx = original.getContext('2d');
        originalCtx.drawImage(layer.canvas, 0, 0);

        // Create glow effect using multiple shadow layers
        const glowCanvas = document.createElement('canvas');
        glowCanvas.width = layer.canvas.width;
        glowCanvas.height = layer.canvas.height;
        const glowCtx = glowCanvas.getContext('2d');

        // Draw multiple glow layers for better effect
        for (let i = 1; i <= thickness; i++) {
            const alpha = opacity * (1 - (i - 1) / thickness) * 0.3;
            glowCtx.save();
            glowCtx.globalAlpha = alpha;
            glowCtx.shadowColor = color;
            glowCtx.shadowBlur = i * 2;
            glowCtx.shadowOffsetX = 0;
            glowCtx.shadowOffsetY = 0;
            glowCtx.drawImage(original, 0, 0);
            glowCtx.restore();
        }

        // Clear the layer and draw glow + original
        ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
        ctx.drawImage(glowCanvas, 0, 0);
        ctx.drawImage(original, 0, 0);

        // Sync to global layer
        this.syncGlobalLayersToCurrentFrame();
        this.renderCurrentFrameToMainCanvas();
    }

    // Neon effect - like glow but more colorful and intense
    applyNeonEffect(color = '#00ffff', intensity = 8, brightness = 1.2) {
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

        // Create neon effect with bright inner glow and softer outer glow
        const neonCanvas = document.createElement('canvas');
        neonCanvas.width = layer.canvas.width;
        neonCanvas.height = layer.canvas.height;
        const neonCtx = neonCanvas.getContext('2d');

        // Outer glow
        neonCtx.save();
        neonCtx.globalAlpha = 0.6;
        neonCtx.shadowColor = color;
        neonCtx.shadowBlur = intensity;
        neonCtx.shadowOffsetX = 0;
        neonCtx.shadowOffsetY = 0;
        neonCtx.drawImage(original, 0, 0);
        neonCtx.restore();

        // Inner bright glow
        neonCtx.save();
        neonCtx.globalAlpha = 0.8;
        neonCtx.shadowColor = color;
        neonCtx.shadowBlur = intensity / 2;
        neonCtx.shadowOffsetX = 0;
        neonCtx.shadowOffsetY = 0;
        neonCtx.drawImage(original, 0, 0);
        neonCtx.restore();

        // Apply brightness filter to original
        const brightCanvas = document.createElement('canvas');
        brightCanvas.width = layer.canvas.width;
        brightCanvas.height = layer.canvas.height;
        const brightCtx = brightCanvas.getContext('2d');
        brightCtx.filter = `brightness(${brightness})`;
        brightCtx.drawImage(original, 0, 0);

        ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
        ctx.drawImage(neonCanvas, 0, 0);
        ctx.drawImage(brightCanvas, 0, 0);

        this.syncGlobalLayersToCurrentFrame();
        this.renderCurrentFrameToMainCanvas();
    }

    // Emboss effect
    applyEmbossEffect(strength = 2) {
        this.undoAdd();

        const frame = this.frames[this.currentFrame];
        if (!frame || !this.activeLayerId) return;

        const layerIndex = this.layers.findIndex(l => l.id === this.activeLayerId);
        if (layerIndex === -1) return;

        const layer = frame.layers[layerIndex];
        if (!layer || !layer.isVisible) return;

        const ctx = layer.canvas.getContext('2d');
        const w = layer.canvas.width, h = layer.canvas.height;
        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;

        // Emboss kernel
        const kernel = [
            -2 * strength, -1 * strength, 0,
            -1 * strength, 1, 1 * strength,
            0, 1 * strength, 2 * strength
        ];

        const copy = new Uint8ClampedArray(data);

        for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {
                for (let c = 0; c < 3; c++) {
                    let sum = 0;
                    for (let ky = 0; ky < 3; ky++) {
                        for (let kx = 0; kx < 3; kx++) {
                            const px = x + kx - 1;
                            const py = y + ky - 1;
                            const idx = (py * w + px) * 4 + c;
                            sum += copy[idx] * kernel[ky * 3 + kx];
                        }
                    }
                    const idx = (y * w + x) * 4 + c;
                    data[idx] = Math.min(255, Math.max(0, sum + 128)); // Add 128 for neutral gray
                }
            }
        }

        ctx.putImageData(imgData, 0, 0);

        this.syncGlobalLayersToCurrentFrame();
        this.renderCurrentFrameToMainCanvas();
    }

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

        // Create outline by drawing the shape multiple times with offset
        const outlineCanvas = document.createElement('canvas');
        outlineCanvas.width = layer.canvas.width;
        outlineCanvas.height = layer.canvas.height;
        const outlineCtx = outlineCanvas.getContext('2d');

        // Draw outline in all directions
        outlineCtx.save();
        outlineCtx.globalCompositeOperation = 'source-over';
        for (let dx = -thickness; dx <= thickness; dx++) {
            for (let dy = -thickness; dy <= thickness; dy++) {
                if (dx === 0 && dy === 0) continue;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist <= thickness) {
                    outlineCtx.save();
                    outlineCtx.globalAlpha = 1 - (dist / thickness) * 0.5;
                    outlineCtx.shadowColor = color;
                    outlineCtx.shadowBlur = 0;
                    outlineCtx.shadowOffsetX = dx;
                    outlineCtx.shadowOffsetY = dy;
                    outlineCtx.drawImage(original, 0, 0);
                    outlineCtx.restore();
                }
            }
        }
        outlineCtx.restore();

        ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
        ctx.drawImage(outlineCanvas, 0, 0);
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
        const shadowCanvas = document.createElement('canvas');
        shadowCanvas.width = layer.canvas.width;
        shadowCanvas.height = layer.canvas.height;
        const shadowCtx = shadowCanvas.getContext('2d');

        shadowCtx.save();
        shadowCtx.globalAlpha = opacity;
        shadowCtx.shadowColor = color;
        shadowCtx.shadowBlur = blur;
        shadowCtx.shadowOffsetX = offsetX;
        shadowCtx.shadowOffsetY = offsetY;
        shadowCtx.drawImage(original, 0, 0);
        shadowCtx.restore();

        ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
        ctx.drawImage(shadowCanvas, 0, 0);
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

        // Sprite objects: draw all objects at current frame
        // Draw sprite objects (respect visibility, alpha, hue, layer)
        /*for (const obj of this.objects) {
            if (obj.visible === false) continue;
            const transform = obj.getTransformAt(this.currentFrame);
            // Only draw if on the active layer or all layers (optional: filter by obj.layerId)
            // If you want to filter by layer, uncomment:
            // if (obj.layerId && obj.layerId !== this.activeLayerId) continue;

            this.ctx.save();
            this.ctx.globalAlpha = obj.alpha !== undefined ? obj.alpha : 1;
            if (obj.hue && obj.hue !== 0) {
                this.ctx.filter = `hue-rotate(${obj.hue}deg)`;
            } else {
                this.ctx.filter = 'none';
            }
            this.ctx.translate(transform.x, transform.y);
            this.ctx.rotate(transform.angle * Math.PI / 180);
            this.ctx.scale(transform.scale, transform.scale);

            if (transform.image) {
                this.ctx.drawImage(transform.image, -transform.image.width / 2, -transform.image.height / 2);
            } else {
                // Draw default placeholder (circle with name)
                this.ctx.fillStyle = '#888';
                this.ctx.beginPath();
                this.ctx.arc(0, 0, 24, 0, 2 * Math.PI);
                this.ctx.fill();
                this.ctx.strokeStyle = '#333';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
                this.ctx.fillStyle = '#fff';
                this.ctx.font = 'bold 12px sans-serif';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(obj.name[0] || '?', 0, 2);
            }
            this.ctx.restore();

            // Draw transform controls if selected
            if (this.selectedObjectId === obj.id && this.currentTool === 'object-tool') {
                this.drawObjectTransformControls(transform, transform.image);
            }
        }*/

        // Draw current frame layers with glow if enabled
        for (let i = 0; i < this.layers.length; i++) {
            const layer = this.layers[i];
            if (!layer.isVisible) continue;
            const glow = this.layerGlowSettings[layer.id];
            if (glow && glow.enabled && glow.size > 0) {
                // 1. Create a colored mask of the layer
                const mask = document.createElement('canvas');
                mask.width = layer.canvas.width;
                mask.height = layer.canvas.height;
                const maskCtx = mask.getContext('2d');
                maskCtx.drawImage(layer.canvas, 0, 0);
                maskCtx.globalCompositeOperation = 'source-in';
                maskCtx.fillStyle = glow.color;
                maskCtx.globalAlpha = 1;
                maskCtx.fillRect(0, 0, mask.width, mask.height);

                // 2. Blur the mask
                const blurred = document.createElement('canvas');
                blurred.width = mask.width;
                blurred.height = mask.height;
                const blurredCtx = blurred.getContext('2d');
                blurredCtx.filter = `blur(${glow.size}px)`;
                blurredCtx.drawImage(mask, 0, 0);

                // 3. Punch out the original layer content from the blurred glow
                blurredCtx.globalCompositeOperation = 'destination-out';
                blurredCtx.drawImage(layer.canvas, 0, 0);

                // 4. Draw the glow to the main canvas
                this.ctx.save();
                this.ctx.globalAlpha = 1.0;
                this.ctx.globalCompositeOperation = 'lighter';
                this.ctx.drawImage(blurred, 0, 0);
                this.ctx.restore();
            }
            // Draw the layer content
            if (layer.canvas) {
                this.ctx.globalAlpha = layer.opacity / 100;
                this.ctx.globalCompositeOperation = layer.blendMode;
                this.ctx.drawImage(layer.canvas, 0, 0);
            }
        }

        // Draw mirror lines
        if (this.mirrorMode !== 'none') {
            this.drawMirrorLines();
        }

        // Draw selection overlay
        if (this.selectionActive && this.selectionData) {
            const bounds = this.getAdjustedSelectionBounds();
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = bounds.width;
            tempCanvas.height = bounds.height;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.putImageData(this.selectionData, 0, 0);

            this.ctx.globalAlpha = 1.0;
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.drawImage(tempCanvas, bounds.x, bounds.y);
        }

        // Draw selection outline
        if (this.selectionActive || this.isCreatingSelection) {
            this.drawSelectionOutline();
        }

        // After drawing everything else:
        if (this.currentTool === 'curve-brush' && this.curveBrushPoints.length > 0) {
            this.drawCurveBrushPreview();
        }

        // Draw spline preview
        if (this.currentTool === 'spline' && this.splinePoints.length > 0) {
            this.drawSplinePreview();
        }

        this.ctx.globalAlpha = 1.0;
        this.ctx.globalCompositeOperation = 'source-over';
    }

    drawObjectTransformControls(transform, image) {
        if (!image) return;
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(transform.x, transform.y);
        ctx.rotate(transform.angle * Math.PI / 180);
        ctx.scale(transform.scale, transform.scale);

        // Bounding box
        ctx.strokeStyle = 'var(--accent-color)';
        ctx.lineWidth = 1.5 / transform.scale;
        ctx.setLineDash([4 / transform.scale, 2 / transform.scale]);
        ctx.strokeRect(-image.width / 2, -image.height / 2, image.width, image.height);

        // Corner handles (for scaling)
        const handleSize = 8 / transform.scale;
        ctx.setLineDash([]);
        ctx.fillStyle = 'var(--accent-color)';
        // Top-left
        ctx.fillRect(-image.width / 2 - handleSize / 2, -image.height / 2 - handleSize / 2, handleSize, handleSize);
        // Top-right
        ctx.fillRect(image.width / 2 - handleSize / 2, -image.height / 2 - handleSize / 2, handleSize, handleSize);
        // Bottom-left
        ctx.fillRect(-image.width / 2 - handleSize / 2, image.height / 2 - handleSize / 2, handleSize, handleSize);
        // Bottom-right
        ctx.fillRect(image.width / 2 - handleSize / 2, image.height / 2 - handleSize / 2, handleSize, handleSize);

        // Rotation handle (above top-center)
        ctx.beginPath();
        ctx.arc(0, -image.height / 2 - 20 / transform.scale, handleSize / 2, 0, 2 * Math.PI);
        ctx.fill();

        ctx.restore();
    }

    showObjectPropertiesPanel(obj, transform) {
        const section = document.getElementById('objectPropertiesSection');
        if (!section) return;
        if (!obj) {
            section.style.display = 'none';
            return;
        }
        section.style.display = '';

        document.getElementById('objectName').value = obj.name;
        document.getElementById('objectX').value = transform.x;
        document.getElementById('objectY').value = transform.y;
        document.getElementById('objectScale').value = transform.scale;
        document.getElementById('objectAngle').value = transform.angle;
        document.getElementById('objectTween').checked = !!obj.tween;

        // New: visibility, alpha, hue, layer
        const visibleCheckbox = document.getElementById('objectVisibleCheckbox');
        if (visibleCheckbox) visibleCheckbox.checked = obj.visible !== false;
        const alphaInput = document.getElementById('objectAlpha');
        if (alphaInput) alphaInput.value = obj.alpha !== undefined ? obj.alpha : 1;
        const hueInput = document.getElementById('objectHue');
        if (hueInput) hueInput.value = obj.hue !== undefined ? obj.hue : 0;
        const layerSelect = document.getElementById('objectLayer');
        if (layerSelect) {
            layerSelect.innerHTML = '';
            this.layers.forEach(layer => {
                const opt = document.createElement('option');
                opt.value = layer.id;
                opt.textContent = layer.name;
                if (obj.layerId === layer.id) opt.selected = true;
                layerSelect.appendChild(opt);
            });
        }
    }

    // Include all the existing methods from the original script...
    handleMenuClick(e) {
        // Find the closest element with data-action
        let target = e.target;
        while (target && !target.getAttribute('data-action') && target !== document) {
            target = target.parentElement;
        }
        if (!target || !target.getAttribute('data-action')) return;

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
            case 'undo':
                this.undo();
                break;
            case 'redo':
                this.redo();
                break;
            case 'copy':
                this.copySelection();
                break;
            case 'cut':
                this.cutSelection();
                break;
            case 'paste':
                this.pasteSelection();
                break;
            case 'delete':
                this.deleteSelection();
                break;
            case 'select-all':
                this.selectAll();
                break;
            case 'deselect':
                this.clearSelection();
                break;
            case 'add-object':
                this.addObject();
                break;
            case 'copy-frame':
                this.copyFrame();
                break;
            case 'paste-frame':
                this.pasteFrame();
                break;
            case 'clear-frame':
                this.clearFrame();
                break;
            case 'zoom-in': {
                const zoomInput = document.getElementById('zoomInput');
                if (zoomInput) {
                    zoomInput.value = Math.min(8, parseFloat(zoomInput.value) + 0.1);
                    this.updateZoomLevel();
                }
                break;
            }
            case 'zoom-out': {
                const zoomInput = document.getElementById('zoomInput');
                if (zoomInput) {
                    zoomInput.value = Math.max(0.5, parseFloat(zoomInput.value) - 0.1);
                    this.updateZoomLevel();
                }
                break;
            }
            case 'zoom-reset': {
                const zoomInput = document.getElementById('zoomInput');
                if (zoomInput) {
                    zoomInput.value = 1;
                    this.updateZoomLevel();
                }
                break;
            }
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

            // Effects menu
            case 'flip-h':
                this.flipFrame('horizontal');
                break;
            case 'flip-v':
                this.flipFrame('vertical');
                break;
            case 'rotate':
                this.rotateFrame();
                break;
            case 'blur':
                window.SpriteSparkModals && window.SpriteSparkModals.showBlurModal(this);
                break;
            case 'sharpen':
                window.SpriteSparkModals && window.SpriteSparkModals.showSharpenModal(this);
                break;
            case 'hsl':
                window.SpriteSparkModals && window.SpriteSparkModals.showHSLModal(this);
                break;
            case 'recolor':
                window.SpriteSparkModals && window.SpriteSparkModals.showRecolorModal(this);
                break;
            case 'glow':
                window.SpriteSparkModals && window.SpriteSparkModals.showGlowModal(this);
                break;
            case 'neon':
                window.SpriteSparkModals && window.SpriteSparkModals.showNeonModal(this);
                break;
            case 'outline':
                window.SpriteSparkModals && window.SpriteSparkModals.showOutlineModal(this);
                break;
            case 'drop-shadow':
                window.SpriteSparkModals && window.SpriteSparkModals.showDropShadowModal(this);
                break;
            case 'emboss':
                window.SpriteSparkModals && window.SpriteSparkModals.showEmbossModal(this);
                break;
            case 'pixelate':
                window.SpriteSparkModals && window.SpriteSparkModals.showPixelateModal(this);
                break;

            // Add other actions as needed...
        }

        // Handle layer selection
        if (e.target.closest('.layer-item')) {
            const layerId = e.target.closest('.layer-item').getAttribute('data-layer-id');
            if (layerId) this.setActiveLayer(layerId);
        }
    }

    handleCanvasMouseDown(e) {
        // Handle middle mouse button for selection rotation
        if (e.button === 1 && this.selectionActive && this.isPointInSelection(
            Math.floor((e.clientX - this.mainCanvas.getBoundingClientRect().left) / this.zoom),
            Math.floor((e.clientY - this.mainCanvas.getBoundingClientRect().top) / this.zoom)
        )) {
            this.rotateSelection(90);
            e.preventDefault();
            return;
        }

        if (this.currentTool !== 'object-tool') return;
        const rect = this.mainCanvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / this.zoom;
        const y = (e.clientY - rect.top) / this.zoom;

        // Check if clicking on an object
        for (const obj of this.objects.slice().reverse()) {
            const transform = obj.getTransformAt(this.currentFrame);
            if (!transform.image) continue;
            // Transform mouse point into object local space
            const dx = x - transform.x;
            const dy = y - transform.y;
            const angle = -transform.angle * Math.PI / 180;
            const cos = Math.cos(angle), sin = Math.sin(angle);
            const lx = (dx * cos - dy * sin) / transform.scale;
            const ly = (dx * sin + dy * cos) / transform.scale;
            if (
                lx >= -transform.image.width / 2 && lx <= transform.image.width / 2 &&
                ly >= -transform.image.height / 2 && ly <= transform.image.height / 2
            ) {
                this.selectedObjectId = obj.id;
                this.objectDragOffset = { lx, ly };
                this.isDraggingObject = true;
                this.renderCurrentFrameToMainCanvas();
                this.showObjectPropertiesPanel(obj, transform);
                return;
            }
        }
        // Clicked empty space: deselect
        this.selectedObjectId = null;
        this.isDraggingObject = false;
        this.renderCurrentFrameToMainCanvas();
        this.showObjectPropertiesPanel(null);
    }

    handleCanvasMouseMove(e) {
        if (this.currentTool !== 'object-tool' || !this.isDraggingObject || !this.selectedObjectId) return;
        const obj = this.objects.find(o => o.id === this.selectedObjectId);
        if (!obj) return;
        const rect = this.mainCanvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / this.zoom;
        const y = (e.clientY - rect.top) / this.zoom;
        const transform = obj.getTransformAt(this.currentFrame);
        const angle = transform.angle * Math.PI / 180;
        const cos = Math.cos(angle), sin = Math.sin(angle);
        // Move object so that the drag offset stays under the mouse
        const lx = this.objectDragOffset.lx, ly = this.objectDragOffset.ly;
        const nx = x - (lx * cos - ly * sin) * transform.scale;
        const ny = y - (lx * sin + ly * cos) * transform.scale;
        obj.setKeyframe(this.currentFrame, {
            ...transform,
            x: nx,
            y: ny
        });
        this.renderCurrentFrameToMainCanvas();
        this.showObjectPropertiesPanel(obj, obj.getTransformAt(this.currentFrame));
    }

    handleCanvasMouseUp(e) {
        if (this.currentTool !== 'object-tool') return;
        this.isDraggingObject = false;
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
        this.triggerLivePreviewIfEnabled();
    }

    startDrawing(e) {
        if (!this.activeLayerId) return;

        // Only allow left mouse button for drawing
        if (e.button !== 0) {
            // If right mouse button, swap primary and secondary color
            if (e.button === 2) {
                const temp = this.primaryColor;
                this.primaryColor = this.secondaryColor;
                this.secondaryColor = temp;
                if (e.button === 2) {
                    this.swapPrimaryAndSecondaryColors();
                }
            }
            return;
        }

        const rect = this.mainCanvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / this.zoom);
        const y = Math.floor((e.clientY - rect.top) / this.zoom);

        // --- PREVENT DRAWING WHILE USING CERTAIN TOOLS ---
        if (this.currentTool === 'spline') {
            // Spline tool is handled in its own event handlers, don't draw
            return;
        }

        // Check if clicking on selection rotate button
        if (this.selectionActive && this.selectionRotateButton) {
            const btn = this.selectionRotateButton;
            if (x >= btn.x && x <= btn.x + btn.size && y >= btn.y && y <= btn.y + btn.size) {
                this.rotateSelection(90);
                return;
            }
        }

        // Handle selection tools and pointer tool
        if (this.currentTool === 'rectangle-select' || this.currentTool === 'lasso-select' || this.currentTool === 'pointer') {
            // Check if clicking on existing selection first
            if (this.selectionActive && this.isPointInSelection(x, y)) {
                this.startDraggingSelection(x, y);
                return;
            }

            // Clear selection if clicking outside
            if (this.selectionActive && !this.isPointInSelection(x, y)) {
                this.clearSelection();
            }

            // Only start new selection if not pointer tool
            if (this.currentTool !== 'pointer') {
                this.startSelection(x, y);
            }
            return;
        }

        // Check if clicking on existing selection
        if (this.selectionActive && this.isPointInSelection(x, y)) {
            this.startDraggingSelection(x, y);
            return;
        }

        // Clear selection if clicking outside
        if (this.selectionActive && !this.isPointInSelection(x, y)) {
            this.clearSelection();
        }

        // --- Add undo step before drawing ---
        this.undoAdd();

        // Eyedropper with Ctrl+Click
        if ((this.currentTool === 'eyedropper') ||
            (e.button === 0 && e.ctrlKey)) {
            this.pickColorAt(x, y);
            return;
        }

        if (this.currentTool === 'bucket') {
            const layer = this.layers.find(l => l.id === this.activeLayerId);
            if (!layer) return;
            const ctx = layer.canvas.getContext('2d');
            this.floodFill(
                ctx,
                x,
                y,
                this.primaryColor,
                this.floodFillTolerance,
                this.floodFillDetectAllLayers
            );
            this.renderCurrentFrameToMainCanvas();
            this.syncGlobalLayersToCurrentFrame();
            return;
        }

        // Shape tools and smooth brush
        if (['line', 'rectangle', 'ellipse', 'circle', 'smooth-brush'].includes(this.currentTool)) {
            this.drawingBuffer = { x0: x, y0: y, x1: x, y1: y };
            if (this.currentTool === 'smooth-brush') {
                this.smoothBrushPoints = [{ x, y }];
            }
            this.isDrawing = true;
            return;
        }

        this.isDrawing = true;
        this.lastX = x;
        this.lastY = y;
        this.draw(e);
        this.syncGlobalLayersToCurrentFrame();
    }

    draw(e) {
        if (!this.isDrawing && !this.isCreatingSelection && !this.isDraggingSelection) return;

        const rect = this.mainCanvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / this.zoom);
        const y = Math.floor((e.clientY - rect.top) / this.zoom);

        // Handle selection tools and pointer tool
        if (this.isCreatingSelection) {
            this.updateSelection(x, y);
            return;
        }

        if (this.isDraggingSelection) {
            this.updateSelectionDrag(x, y);
            return;
        }

        // Pointer tool doesn't draw
        if (this.currentTool === 'pointer') {
            return;
        }

        if (!this.activeLayerId) return;

        // --- SHAPE TOOLS: Only update buffer and preview, do NOT draw to layer here ---
        if (['line', 'rectangle', 'ellipse', 'circle', 'smooth-brush'].includes(this.currentTool)) {
            if (this.currentTool === 'smooth-brush') {
                this.smoothBrushPoints.push({ x, y });
            }
            if (this.drawingBuffer) {
                this.drawingBuffer.x1 = x;
                this.drawingBuffer.y1 = y;
            }
            this.renderCurrentFrameToMainCanvas();
            this.drawShapePreview();
            return;
        }

        // --- NORMAL DRAWING TOOLS ---
        const layer = this.layers.find(l => l.id === this.activeLayerId);
        if (!layer) return;
        const ctx = layer.canvas.getContext('2d');

        // Draw main stroke
        this.drawStroke(ctx, this.lastX, this.lastY, x, y);

        // Draw mirrored strokes
        if (this.mirrorMode !== 'none') {
            this.drawMirroredStrokes(ctx, this.lastX, this.lastY, x, y);
        }

        this.lastX = x;
        this.lastY = y;
        this.renderCurrentFrameToMainCanvas();
        this.syncGlobalLayersToCurrentFrame();
        this.triggerLivePreviewIfEnabled();
    }

    drawStroke(ctx, x0, y0, x1, y1) {
        ctx.globalAlpha = this.opacity / 100;
        ctx.strokeStyle = this.primaryColor;
        ctx.lineWidth = this.brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (this.pixelDrawingMode && this.currentTool !== 'eraser' && this.brushSize === 1) {
            this._drawPixelLine(ctx, x0, y0, x1, y1, this.primaryColor, this.brushSize, this.pixelEdgeCorrection && this.brushSize > 1);
        } else if (this.currentTool === 'pen') {
            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.lineTo(x1, y1);
            ctx.stroke();
        } else if (this.currentTool === 'eraser') {
            ctx.clearRect(x1 - this.brushSize / 2, y1 - this.brushSize / 2, this.brushSize, this.brushSize);
        }
    }

    drawMirroredStrokes(ctx, x0, y0, x1, y1) {
        const centerX = this.canvasWidth / 2;
        const centerY = this.canvasHeight / 2;

        const mirrorPoints = this.getMirrorPoints(x0, y0, x1, y1);

        for (const points of mirrorPoints) {
            if (points.x0 >= 0 && points.x0 < this.canvasWidth &&
                points.y0 >= 0 && points.y0 < this.canvasHeight &&
                points.x1 >= 0 && points.x1 < this.canvasWidth &&
                points.y1 >= 0 && points.y1 < this.canvasHeight) {
                this.drawStroke(ctx, points.x0, points.y0, points.x1, points.y1);
            }
        }
    }

    getMirrorPoints(x0, y0, x1, y1) {
        const centerX = this.canvasWidth / 2;
        const centerY = this.canvasHeight / 2;
        const points = [];

        switch (this.mirrorMode) {
            case 'horizontal':
                points.push({
                    x0: x0,
                    y0: this.canvasHeight - y0,
                    x1: x1,
                    y1: this.canvasHeight - y1
                });
                break;

            case 'vertical':
                points.push({
                    x0: this.canvasWidth - x0,
                    y0: y0,
                    x1: this.canvasWidth - x1,
                    y1: y1
                });
                break;

            case 'diagonal-tb':
                // Mirror across diagonal line from top-left to bottom-right
                points.push({
                    x0: y0,
                    y0: x0,
                    x1: y1,
                    y1: x1
                });
                break;

            case 'diagonal-bt':
                // Mirror across diagonal line from bottom-left to top-right
                points.push({
                    x0: this.canvasWidth - y0,
                    y0: this.canvasHeight - x0,
                    x1: this.canvasWidth - y1,
                    y1: this.canvasHeight - x1
                });
                break;

            case 'horizontal-vertical':
                // Horizontal mirror
                points.push({
                    x0: x0,
                    y0: this.canvasHeight - y0,
                    x1: x1,
                    y1: this.canvasHeight - y1
                });
                // Vertical mirror
                points.push({
                    x0: this.canvasWidth - x0,
                    y0: y0,
                    x1: this.canvasWidth - x1,
                    y1: y1
                });
                // Both mirrors (4-way symmetry)
                points.push({
                    x0: this.canvasWidth - x0,
                    y0: this.canvasHeight - y0,
                    x1: this.canvasWidth - x1,
                    y1: this.canvasHeight - y1
                });
                break;

            case 'both-diagonals':
                // Diagonal top-bottom
                points.push({
                    x0: y0,
                    y0: x0,
                    x1: y1,
                    y1: x1
                });
                // Diagonal bottom-top
                points.push({
                    x0: this.canvasWidth - y0,
                    y0: this.canvasHeight - x0,
                    x1: this.canvasWidth - y1,
                    y1: this.canvasHeight - x1
                });
                // Combined diagonal effect
                points.push({
                    x0: this.canvasHeight - y0,
                    y0: this.canvasWidth - x0,
                    x1: this.canvasHeight - y1,
                    y1: this.canvasWidth - x1
                });
                break;

            case 'all':
                // All possible mirrors for 8-way kaleidoscope effect
                // Horizontal
                points.push({ x0: x0, y0: this.canvasHeight - y0, x1: x1, y1: this.canvasHeight - y1 });
                // Vertical
                points.push({ x0: this.canvasWidth - x0, y0: y0, x1: this.canvasWidth - x1, y1: y1 });
                // Both
                points.push({ x0: this.canvasWidth - x0, y0: this.canvasHeight - y0, x1: this.canvasWidth - x1, y1: this.canvasHeight - y1 });
                // Diagonal TB
                points.push({ x0: y0, y0: x0, x1: y1, y1: x1 });
                // Diagonal BT
                points.push({ x0: this.canvasWidth - y0, y0: this.canvasHeight - x0, x1: this.canvasWidth - y1, y1: this.canvasHeight - x1 });
                // Combined diagonals
                points.push({ x0: this.canvasHeight - y0, y0: this.canvasWidth - x0, x1: this.canvasHeight - y1, y1: this.canvasWidth - x1 });
                points.push({ x0: this.canvasWidth - y0, y0: x0, x1: this.canvasWidth - y1, y1: x1 });
                break;
        }

        return points;
    }

    floodFill(ctx, x, y, fillColor, tolerance = 0, detectAllLayers = false) {
        // --- Add undo step before flood fill ---
        this.undoAdd();

        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        let imageData, data;

        if (detectAllLayers) {
            // Compose all visible layers into a temp canvas
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = width;
            tempCanvas.height = height;
            const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true }); // Add optimization flag
            for (let i = 0; i < this.layers.length; i++) {
                const layer = this.layers[i];
                if (layer.isVisible && layer.canvas) {
                    tempCtx.globalAlpha = layer.opacity / 100;
                    tempCtx.globalCompositeOperation = layer.blendMode || 'source-over';
                    tempCtx.drawImage(layer.canvas, 0, 0);
                }
            }
            imageData = tempCtx.getImageData(0, 0, width, height);
            data = imageData.data;
        } else {
            imageData = ctx.getImageData(0, 0, width, height);
            data = imageData.data;
        }

        const stack = [[x, y]];
        const pixelPos = (x, y) => (y * width + x) * 4;
        const startIdx = pixelPos(x, y);
        const startColor = data.slice(startIdx, startIdx + 4);

        function colorMatch(idx) {
            for (let i = 0; i < 4; i++) {
                if (Math.abs(data[idx + i] - startColor[i]) > tolerance) return false;
            }
            return true;
        }

        // Parse fillColor to RGBA
        const temp = document.createElement('canvas');
        temp.width = temp.height = 1;
        const tctx = temp.getContext('2d');
        tctx.fillStyle = fillColor;
        tctx.fillRect(0, 0, 1, 1);
        const fillRGBA = tctx.getImageData(0, 0, 1, 1).data;

        // For writing, always write to the target ctx - add optimization flag
        const targetImageData = ctx.getImageData(0, 0, width, height);
        const targetData = targetImageData.data;

        while (stack.length) {
            const [cx, cy] = stack.pop();
            if (cx < 0 || cy < 0 || cx >= width || cy >= height) continue;
            const idx = pixelPos(cx, cy);
            if (!colorMatch(idx)) continue;
            // Set pixel to fill color in target layer
            for (let i = 0; i < 4; i++) targetData[idx + i] = fillRGBA[i];
            // Mark as visited in data array to avoid infinite loop
            data[idx] = 255; data[idx + 1] = 255; data[idx + 2] = 254; // unlikely color
            // Push neighbors
            stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
        }
        ctx.putImageData(targetImageData, 0, 0);
        this.triggerLivePreviewIfEnabled();
    }

    pickColorAt(x, y) {
        // Compose all visible layers for color picking
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.canvasWidth;
        tempCanvas.height = this.canvasHeight;
        const tempCtx = tempCanvas.getContext('2d');
        for (let i = 0; i < this.layers.length; i++) {
            const layer = this.layers[i];
            if (layer.isVisible && layer.canvas) {
                tempCtx.globalAlpha = layer.opacity / 100;
                tempCtx.globalCompositeOperation = layer.blendMode || 'source-over';
                tempCtx.drawImage(layer.canvas, 0, 0);
            }
        }
        const imgData = tempCtx.getImageData(x, y, 1, 1).data;
        // Convert RGBA to hex
        const hex = "#" + [0, 1, 2].map(i => imgData[i].toString(16).padStart(2, '0')).join('');
        this.primaryColor = hex;
        const primaryColorEl = document.getElementById('primaryColor');
        const colorPicker = document.getElementById('colorPicker');
        if (primaryColorEl) primaryColorEl.style.backgroundColor = hex;
        if (colorPicker) colorPicker.value = hex;
    }

    stopDrawing(e) {
        if (!e || e.button === 0) {
            if (this.isCreatingSelection) {
                this.finishSelection();
                return;
            }

            if (this.isDraggingSelection) {
                this.stopDraggingSelection();
                return;
            }

            if (this.isDrawing && this.drawingBuffer && ['line', 'rectangle', 'ellipse', 'circle'].includes(this.currentTool)) {
                // Commit shape to layer
                const layer = this.layers.find(l => l.id === this.activeLayerId);
                if (layer) {
                    const ctx = layer.canvas.getContext('2d');
                    ctx.save();
                    ctx.globalAlpha = this.opacity / 100;
                    ctx.strokeStyle = this.primaryColor;
                    ctx.lineWidth = this.brushSize;
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';
                    this.drawShape(ctx, this.drawingBuffer, this.currentTool);
                    ctx.restore();
                }
                this.drawingBuffer = null;
                this.renderCurrentFrameToMainCanvas();
                this.syncGlobalLayersToCurrentFrame();
            } else if (this.isDrawing && this.currentTool === 'smooth-brush' && this.smoothBrushPoints.length > 1) {
                // Draw only the final smooth curve to the layer
                const layer = this.layers.find(l => l.id === this.activeLayerId);
                if (layer) {
                    const ctx = layer.canvas.getContext('2d');
                    ctx.save();
                    ctx.globalAlpha = this.opacity / 100;
                    ctx.strokeStyle = this.primaryColor;
                    ctx.lineWidth = this.brushSize;
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';
                    // Only draw the final curve, not the segments
                    this.drawSmoothCurve(ctx, this.smoothBrushPoints);
                    ctx.restore();
                }
                this.smoothBrushPoints = [];
                this.drawingBuffer = null;
                this.renderCurrentFrameToMainCanvas();
                this.syncGlobalLayersToCurrentFrame();
            }
            this.isDrawing = false;
        }
    }

    // --- Helper to draw shape preview on main canvas ---
    drawShapePreview() {
        if (!this.drawingBuffer || !this.ctx) return;
        this.ctx.save();
        this.ctx.globalAlpha = 0.5;
        this.ctx.strokeStyle = this.primaryColor;
        this.ctx.lineWidth = this.brushSize;
        this.ctx.setLineDash([4, 4]);
        this.drawShape(this.ctx, this.drawingBuffer, this.currentTool);
        this.ctx.setLineDash([]);
        this.ctx.restore();

        // For smooth-brush, show the current curve
        if (this.currentTool === 'smooth-brush' && this.smoothBrushPoints.length > 1) {
            this.ctx.save();
            this.ctx.globalAlpha = 0.7;
            this.ctx.strokeStyle = this.primaryColor;
            this.ctx.lineWidth = this.brushSize;
            this.ctx.setLineDash([]);
            this.drawSmoothCurve(this.ctx, this.smoothBrushPoints);
            this.ctx.restore();
        }
    }

    // --- Helper to draw shapes ---
    drawShape(ctx, buffer, tool) {
        const { x0, y0, x1, y1 } = buffer;
        if (this.pixelDrawingMode && this.brushSize === 1) {
            switch (tool) {
                case 'line':
                    this._drawPixelLine(ctx, x0, y0, x1, y1, this.primaryColor, this.brushSize, this.pixelEdgeCorrection && this.brushSize > 1);
                    break;
                case 'rectangle': {
                    // Four pixel lines for rectangle
                    this._drawPixelLine(ctx, x0, y0, x1, y0, this.primaryColor, this.brushSize, false);
                    this._drawPixelLine(ctx, x1, y0, x1, y1, this.primaryColor, this.brushSize, false);
                    this._drawPixelLine(ctx, x1, y1, x0, y1, this.primaryColor, this.brushSize, false);
                    this._drawPixelLine(ctx, x0, y1, x0, y0, this.primaryColor, this.brushSize, false);
                    break;
                }
                case 'ellipse':
                case 'circle': {
                    // Approximate ellipse/circle with points and connect with pixel lines
                    const cx = (x0 + x1) / 2;
                    const cy = (y0 + y1) / 2;
                    const rx = tool === 'ellipse' ? Math.abs(x1 - x0) / 2 : Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) / 2;
                    const ry = tool === 'ellipse' ? Math.abs(y1 - y0) / 2 : rx;
                    let prev = null;
                    for (let a = 0; a <= 360; a += 2) {
                        const rad = a * Math.PI / 180;
                        const px = Math.round(cx + rx * Math.cos(rad));
                        const py = Math.round(cy + ry * Math.sin(rad));
                        if (prev) {
                            this._drawPixelLine(ctx, prev.x, prev.y, px, py, this.primaryColor, this.brushSize, false);
                        }
                        prev = { x: px, y: py };
                    }
                    break;
                }
            }
        } else {
            // Default: smooth vector shapes
            switch (tool) {
                case 'line':
                    ctx.beginPath();
                    ctx.moveTo(x0, y0);
                    ctx.lineTo(x1, y1);
                    ctx.stroke();
                    break;
                case 'rectangle':
                    ctx.strokeRect(
                        Math.min(x0, x1),
                        Math.min(y0, y1),
                        Math.abs(x1 - x0),
                        Math.abs(y1 - y0)
                    );
                    break;
                case 'ellipse':
                    ctx.beginPath();
                    ctx.ellipse(
                        (x0 + x1) / 2,
                        (y0 + y1) / 2,
                        Math.abs(x1 - x0) / 2,
                        Math.abs(y1 - y0) / 2,
                        0, 0, 2 * Math.PI
                    );
                    ctx.stroke();
                    break;
                case 'circle': {
                    const r = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) / 2;
                    ctx.beginPath();
                    ctx.arc(
                        (x0 + x1) / 2,
                        (y0 + y1) / 2,
                        r,
                        0, 2 * Math.PI
                    );
                    ctx.stroke();
                    break;
                }
            }
        }
    }

    // --- Helper to draw a smooth curve through points (Catmull-Rom spline) ---
    drawSmoothCurve(ctx, points) {
        if (points.length < 2) return;

        // If pixel perfect mode, draw the curve as a series of pixel lines
        if (this.pixelDrawingMode && this.brushSize === 1) {
            // Sample the Catmull-Rom spline and draw pixel lines between points
            const getSplinePoint = (t, p0, p1, p2, p3) => {
                // Catmull-Rom spline formula
                const t2 = t * t, t3 = t2 * t;
                return {
                    x: 0.5 * ((2 * p1.x) +
                        (-p0.x + p2.x) * t +
                        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
                        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
                    y: 0.5 * ((2 * p1.y) +
                        (-p0.y + p2.y) * t +
                        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
                        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3)
                };
            };

            // Draw pixel lines along the spline, using a finer step for smoothness
            let prev = points[0];
            for (let i = 0; i < points.length - 1; i++) {
                const p0 = points[i - 1] || points[i];
                const p1 = points[i];
                const p2 = points[i + 1] || points[i];
                const p3 = points[i + 2] || p2;
                for (let t = 0; t < 1; t += 0.02) {
                    const pt = getSplinePoint(t, p0, p1, p2, p3);
                    this._drawPixelLine(
                        ctx,
                        Math.round(prev.x), Math.round(prev.y),
                        Math.round(pt.x), Math.round(pt.y),
                        this.primaryColor, this.brushSize,
                        this.pixelEdgeCorrection && this.brushSize > 1
                    );
                    prev = pt;
                }
            }
            // Draw last segment
            const last = points[points.length - 1];
            this._drawPixelLine(
                ctx,
                Math.round(prev.x), Math.round(prev.y),
                Math.round(last.x), Math.round(last.y),
                this.primaryColor, this.brushSize,
                this.pixelEdgeCorrection && this.brushSize > 1
            );
        } else {
            // Default: smooth bezier curve
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 0; i < points.length - 1; i++) {
                const p0 = points[i - 1] || points[i];
                const p1 = points[i];
                const p2 = points[i + 1] || points[i];
                const p3 = points[i + 2] || p2;
                const cp1x = p1.x + (p2.x - p0.x) / 6;
                const cp1y = p1.y + (p2.y - p0.y) / 6;
                const cp2x = p2.x - (p3.x - p1.x) / 6;
                const cp2y = p2.y - (p3.y - p1.y) / 6;
                ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
            }
            ctx.stroke();
        }
    }

    startMirrorAnimation() {
        if (this.mirrorAnimationInterval) {
            clearInterval(this.mirrorAnimationInterval);
        }

        this.mirrorAnimationInterval = setInterval(() => {
            this.mirrorAnimationPhase = (this.mirrorAnimationPhase + 1) % 2;
            this.renderCurrentFrameToMainCanvas();
        }, 400); // Flash every 0.4 seconds
    }

    stopMirrorAnimation() {
        if (this.mirrorAnimationInterval) {
            clearInterval(this.mirrorAnimationInterval);
            this.mirrorAnimationInterval = null;
        }
    }

    drawMirrorLines() {
        if (this.mirrorMode === 'none') return;

        this.ctx.save();

        // Animate between cyan and magenta for visibility
        const isFirstPhase = this.mirrorAnimationPhase === 0;
        this.ctx.strokeStyle = isFirstPhase ? '#00FFFF' : '#FF00FF';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([8, 8]);
        this.ctx.globalAlpha = 0.8;

        const centerX = this.canvasWidth / 2;
        const centerY = this.canvasHeight / 2;

        // Draw mirror lines based on mode
        switch (this.mirrorMode) {
            case 'horizontal':
                this.ctx.beginPath();
                this.ctx.moveTo(0, centerY);
                this.ctx.lineTo(this.canvasWidth, centerY);
                this.ctx.stroke();
                break;

            case 'vertical':
                this.ctx.beginPath();
                this.ctx.moveTo(centerX, 0);
                this.ctx.lineTo(centerX, this.canvasHeight);
                this.ctx.stroke();
                break;

            case 'diagonal-tb':
                this.ctx.beginPath();
                this.ctx.moveTo(0, 0);
                this.ctx.lineTo(this.canvasWidth, this.canvasHeight);
                this.ctx.stroke();
                break;

            case 'diagonal-bt':
                this.ctx.beginPath();
                this.ctx.moveTo(0, this.canvasHeight);
                this.ctx.lineTo(this.canvasWidth, 0);
                this.ctx.stroke();
                break;

            case 'horizontal-vertical':
                // Horizontal line
                this.ctx.beginPath();
                this.ctx.moveTo(0, centerY);
                this.ctx.lineTo(this.canvasWidth, centerY);
                this.ctx.stroke();
                // Vertical line
                this.ctx.beginPath();
                this.ctx.moveTo(centerX, 0);
                this.ctx.lineTo(centerX, this.canvasHeight);
                this.ctx.stroke();
                break;

            case 'both-diagonals':
                // Diagonal top-bottom
                this.ctx.beginPath();
                this.ctx.moveTo(0, 0);
                this.ctx.lineTo(this.canvasWidth, this.canvasHeight);
                this.ctx.stroke();
                // Diagonal bottom-top
                this.ctx.beginPath();
                this.ctx.moveTo(0, this.canvasHeight);
                this.ctx.lineTo(this.canvasWidth, 0);
                this.ctx.stroke();
                break;

            case 'all':
                // All four lines
                // Horizontal
                this.ctx.beginPath();
                this.ctx.moveTo(0, centerY);
                this.ctx.lineTo(this.canvasWidth, centerY);
                this.ctx.stroke();
                // Vertical
                this.ctx.beginPath();
                this.ctx.moveTo(centerX, 0);
                this.ctx.lineTo(centerX, this.canvasHeight);
                this.ctx.stroke();
                // Diagonal top-bottom
                this.ctx.beginPath();
                this.ctx.moveTo(0, 0);
                this.ctx.lineTo(this.canvasWidth, this.canvasHeight);
                this.ctx.stroke();
                // Diagonal bottom-top
                this.ctx.beginPath();
                this.ctx.moveTo(0, this.canvasHeight);
                this.ctx.lineTo(this.canvasWidth, 0);
                this.ctx.stroke();
                break;
        }

        this.ctx.setLineDash([]);
        this.ctx.restore();
    }

    addObject() {
        const centerX = this.canvasWidth / 2;
        const centerY = this.canvasHeight / 2;
        const obj = new SpriteObject({
            name: 'Object ' + (this.objects.length + 1),
            x: centerX,
            y: centerY,
            scale: 1,
            angle: 0,
            image: null,
            visible: true,
            alpha: 1,
            hue: 0,
            layerId: this.activeLayerId || (this.layers[0] && this.layers[0].id)
        });
        obj.visible = true;
        obj.alpha = 1;
        obj.hue = 0;
        obj.layerId = this.activeLayerId || (this.layers[0] && this.layers[0].id);
        this.objects.push(obj);
        this.selectedObjectId = obj.id;
        this.renderObjectsList();
        this.renderCurrentFrameToMainCanvas();
        this.showObjectPropertiesPanel(obj, obj.getTransformAt(this.currentFrame));
    }

    renderObjectsList() {
        const list = document.getElementById('objectsList');
        if (!list) return;
        list.innerHTML = '';
        if (this.objects.length === 0) {
            list.style.display = 'none';
            return;
        }
        list.style.display = '';
        this.objects.forEach(obj => {
            const item = document.createElement('div');
            item.className = 'object-list-item' + (obj.id === this.selectedObjectId ? ' selected' : '');
            item.textContent = obj.name;
            item.title = obj.name;
            item.onclick = () => {
                this.selectedObjectId = obj.id;
                this.renderCurrentFrameToMainCanvas();
                this.showObjectPropertiesPanel(obj, obj.getTransformAt(this.currentFrame));
                this.renderObjectsList();
            };
            list.appendChild(item);
        });
    }

    updateGhostCursor(e) {
        if (!this.ghostCtx || !this.ghostCanvas) return;
        this.ghostCtx.clearRect(0, 0, this.ghostCanvas.width, this.ghostCanvas.height);
        if (!e || !this.showBrushGhost || this.currentTool === 'bucket' || this.currentTool === 'eyedropper') return;
        const rect = this.ghostCanvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / this.zoom);
        const y = Math.floor((e.clientY - rect.top) / this.zoom);

        // Draw ghost brush
        this.ghostCtx.save();
        this.ghostCtx.globalAlpha = 1;
        this.ghostCtx.strokeStyle = '#888';
        this.ghostCtx.lineWidth = 1;
        this.ghostCtx.beginPath();
        this.ghostCtx.arc(x, y, this.brushSize / 2, 0, 2 * Math.PI);
        this.ghostCtx.stroke();

        // Fill with brush color
        this.ghostCtx.fillStyle = this.primaryColor;
        this.ghostCtx.globalAlpha = 0.9;
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

    toggleFrameActiveState(frameIndex) {
        if (frameIndex >= 0 && frameIndex < this.frames.length) {
            const frame = this.frames[frameIndex];
            frame.isActive = !frame.isActive;
            this.frameActiveStates[frameIndex] = frame.isActive;
            this.updateFramesList();
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
            const isActive = frame.isActive !== false; // Default to true if not set
            const isCurrentFrame = idx === this.currentFrame;

            item.className = `frame-item ${size} ${isCurrentFrame ? 'active' : ''} ${!isActive ? 'inactive' : ''}`;
            item.dataset.frame = idx;

            // Frame toggle button (active/inactive)
            const toggleBtn = document.createElement('button');
            toggleBtn.className = `frame-toggle-btn ${isActive ? 'active' : 'inactive'}`;
            toggleBtn.title = isActive ? 'Disable Frame' : 'Enable Frame';
            toggleBtn.innerHTML = isActive ? '●' : '○';
            toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleFrameActiveState(idx);
            });
            item.appendChild(toggleBtn);

            // Frame number
            const numberDiv = document.createElement('div');
            numberDiv.className = 'frame-number';
            numberDiv.textContent = idx + 1;
            item.appendChild(numberDiv);

            // Thumbnail (only for non-simple modes)
            if (size !== 'simple') {
                const thumbDiv = document.createElement('div');
                thumbDiv.className = 'frame-thumbnail';
                const thumbCanvas = document.createElement('canvas');

                // Set canvas size based on size
                let w = 48, h = 36; // Default medium
                if (size === 'small') { w = 32; h = 24; }
                if (size === 'large') { w = 64; h = 48; }

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
            }
            // Note: For simple mode, we don't add any thumbnail at all

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
        this.triggerLivePreviewIfEnabled();
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
            this.triggerLivePreviewIfEnabled();
        } else if (direction === 'down' && frameIndex < this.frames.length - 1) {
            this.undoAdd();
            const temp = this.frames[frameIndex];
            this.frames[frameIndex] = this.frames[frameIndex + 1];
            this.frames[frameIndex + 1] = temp;
            if (this.currentFrame === frameIndex) this.currentFrame++;
            else if (this.currentFrame === frameIndex + 1) this.currentFrame--;
            this.updateFramesList();
            this.selectFrame(this.currentFrame);
            this.triggerLivePreviewIfEnabled();
        }
    }

    // --- Effects Implementation ---
    flipFrame(direction) {
        // Add undo state first
        this.undoAdd();

        // Only flip the active layer in the current frame
        const frame = this.frames[this.currentFrame];
        if (!frame || !this.activeLayerId) return;

        const layerIndex = this.layers.findIndex(l => l.id === this.activeLayerId);
        if (layerIndex === -1) return;

        const layer = frame.layers[layerIndex];
        if (!layer || !layer.isVisible) return;

        const ctx = layer.canvas.getContext('2d');
        const temp = document.createElement('canvas');
        temp.width = layer.canvas.width;
        temp.height = layer.canvas.height;
        temp.getContext('2d').drawImage(layer.canvas, 0, 0);

        ctx.save();
        ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
        if (direction === 'horizontal') {
            ctx.scale(-1, 1);
            ctx.drawImage(temp, -layer.canvas.width, 0);
        } else {
            ctx.scale(1, -1);
            ctx.drawImage(temp, 0, -layer.canvas.height);
        }
        ctx.restore();

        // Also apply to the corresponding global layer
        const globalLayer = this.layers[layerIndex];
        if (globalLayer) {
            const globalCtx = globalLayer.canvas.getContext('2d');
            globalCtx.clearRect(0, 0, globalLayer.canvas.width, globalLayer.canvas.height);
            globalCtx.drawImage(layer.canvas, 0, 0);
        }

        this.renderCurrentFrameToMainCanvas();
    }

    rotateFrame() {
        // Add undo state first
        this.undoAdd();

        // Only rotate the active layer in the current frame 90deg clockwise
        const frame = this.frames[this.currentFrame];
        if (!frame || !this.activeLayerId) return;

        const layerIndex = this.layers.findIndex(l => l.id === this.activeLayerId);
        if (layerIndex === -1) return;

        const layer = frame.layers[layerIndex];
        if (!layer || !layer.isVisible) return;

        const ctx = layer.canvas.getContext('2d');
        const temp = document.createElement('canvas');
        temp.width = layer.canvas.width;
        temp.height = layer.canvas.height;
        temp.getContext('2d').drawImage(layer.canvas, 0, 0);

        ctx.save();
        ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
        ctx.translate(layer.canvas.width / 2, layer.canvas.height / 2);
        ctx.rotate(Math.PI / 2);
        ctx.drawImage(temp, -layer.canvas.height / 2, -layer.canvas.width / 2, layer.canvas.height, layer.canvas.width);
        ctx.restore();

        // Also apply to the corresponding global layer
        const globalLayer = this.layers[layerIndex];
        if (globalLayer) {
            const globalCtx = globalLayer.canvas.getContext('2d');
            globalCtx.clearRect(0, 0, globalLayer.canvas.width, globalLayer.canvas.height);
            globalCtx.drawImage(layer.canvas, 0, 0);
        }

        this.renderCurrentFrameToMainCanvas();
    }

    copyFrame() {
        // Copy current frame data to memory
        const frame = this.frames[this.currentFrame];
        if (!frame) return;
        this.copiedFrameData = JSON.stringify(frame, (key, value) => {
            if (key === 'canvas') return value.toDataURL();
            return value;
        });
    }

    pasteFrame() {
        // Paste copied frame data into current frame
        if (!this.copiedFrameData) return;
        const frameData = JSON.parse(this.copiedFrameData);
        frameData.layers.forEach((l, i) => {
            const layer = this.layers[i];
            if (!layer) return;
            const ctx = layer.canvas.getContext('2d');
            ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
            if (l.canvas) {
                const img = new window.Image();
                img.src = l.canvas;
                img.onload = () => {
                    ctx.drawImage(img, 0, 0);
                    this.renderCurrentFrameToMainCanvas();
                    this.syncGlobalLayersToCurrentFrame();
                };
            }
        });
    }

    clearFrame() {
        // Add undo state first
        this.undoAdd();

        // Only clear the active layer in the current frame
        const frame = this.frames[this.currentFrame];
        if (!frame || !this.activeLayerId) return;

        const layerIndex = this.layers.findIndex(l => l.id === this.activeLayerId);
        if (layerIndex === -1) return;

        const layer = frame.layers[layerIndex];
        if (!layer || !layer.isVisible) return;

        const ctx = layer.canvas.getContext('2d');
        ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);

        // Also clear the corresponding global layer
        const globalLayer = this.layers[layerIndex];
        if (globalLayer) {
            const globalCtx = globalLayer.canvas.getContext('2d');
            globalCtx.clearRect(0, 0, globalLayer.canvas.width, globalLayer.canvas.height);
        }

        this.renderCurrentFrameToMainCanvas();
    }

    applyBlurEffect(radius = 4) {
        // Add undo state first
        this.undoAdd();

        // Only blur the active layer in the current frame
        const frame = this.frames[this.currentFrame];
        if (!frame || !this.activeLayerId) return;

        const layerIndex = this.layers.findIndex(l => l.id === this.activeLayerId);
        if (layerIndex === -1) return;

        const layer = frame.layers[layerIndex];
        if (!layer || !layer.isVisible) return;

        const ctx = layer.canvas.getContext('2d');
        const temp = document.createElement('canvas');
        temp.width = layer.canvas.width;
        temp.height = layer.canvas.height;
        temp.getContext('2d').drawImage(layer.canvas, 0, 0);

        ctx.save();
        ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
        ctx.filter = `blur(${radius}px)`;
        ctx.drawImage(temp, 0, 0);
        ctx.restore();

        // Also apply to the corresponding global layer
        const globalLayer = this.layers[layerIndex];
        if (globalLayer) {
            const globalCtx = globalLayer.canvas.getContext('2d');
            globalCtx.clearRect(0, 0, globalLayer.canvas.width, globalLayer.canvas.height);
            globalCtx.drawImage(layer.canvas, 0, 0);
        }

        this.renderCurrentFrameToMainCanvas();
    }

    applySharpenEffect(amount = 2) {
        // Add undo state first
        this.undoAdd();

        // Only sharpen the active layer in the current frame
        const frame = this.frames[this.currentFrame];
        if (!frame || !this.activeLayerId) return;

        const layerIndex = this.layers.findIndex(l => l.id === this.activeLayerId);
        if (layerIndex === -1) return;

        const layer = frame.layers[layerIndex];
        if (!layer || !layer.isVisible) return;

        const ctx = layer.canvas.getContext('2d');
        const w = layer.canvas.width, h = layer.canvas.height;
        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;

        // Sharpen kernel
        const kernel = [
            0, -1 * amount, 0,
            -1 * amount, 4 * amount + 1, -1 * amount,
            0, -1 * amount, 0
        ];
        const side = 3;
        const half = Math.floor(side / 2);
        const copy = new Uint8ClampedArray(data);

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                for (let c = 0; c < 3; c++) {
                    let sum = 0;
                    for (let ky = 0; ky < side; ky++) {
                        for (let kx = 0; kx < side; kx++) {
                            const px = x + kx - half;
                            const py = y + ky - half;
                            if (px >= 0 && px < w && py >= 0 && py < h) {
                                const idx = (py * w + px) * 4 + c;
                                sum += copy[idx] * kernel[ky * side + kx];
                            }
                        }
                    }
                    const idx = (y * w + x) * 4 + c;
                    data[idx] = Math.min(255, Math.max(0, sum));
                }
            }
        }

        ctx.putImageData(imgData, 0, 0);

        // Also apply to the corresponding global layer
        const globalLayer = this.layers[layerIndex];
        if (globalLayer) {
            const globalCtx = globalLayer.canvas.getContext('2d');
            globalCtx.clearRect(0, 0, globalLayer.canvas.width, globalLayer.canvas.height);
            globalCtx.drawImage(layer.canvas, 0, 0);
        }

        this.renderCurrentFrameToMainCanvas();
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

    updateCanvasCursor() {
        const canvasContainer = document.getElementById('canvasContainer');
        if (canvasContainer) {
            canvasContainer.setAttribute('data-tool', this.currentTool);

            if (this.isDraggingSelection) {
                canvasContainer.classList.add('dragging-selection');
            } else {
                canvasContainer.classList.remove('dragging-selection');
            }
        }
    }

    handleKeyboard(e) {
        // Example: Ctrl+Z for undo, Ctrl+Y for redo, Space for play/pause
        if (e.ctrlKey && e.key === 'z') {
            this.undo();
            e.preventDefault();
        } else if (e.ctrlKey && e.key === 'y') {
            this.redo();
            e.preventDefault();
        } else if (e.ctrlKey && e.key === 'c') {
            this.copySelection();
            e.preventDefault();
        } else if (e.ctrlKey && e.key === 'v') {
            this.pasteSelection();
            e.preventDefault();
        } else if (e.ctrlKey && e.key === 'a') {
            this.selectAll();
            e.preventDefault();
        } else if (e.ctrlKey && e.key.toLowerCase() === 'f') {
            // Ctrl+F: Add a new frame
            this.addEmptyFrame();
            e.preventDefault();
        } else if (e.key === 'Delete') {
            this.deleteSelection();
            e.preventDefault();
        } else if (e.key === 'Escape') {
            this.clearSelection();
            e.preventDefault();
        } else if (e.key === 'v' && !e.ctrlKey) {
            // V key for pointer tool
            this.currentTool = 'pointer';
            document.querySelectorAll('.drawing-tool').forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-tool') === 'pointer');
            });
            e.preventDefault();
        } else if (e.key === 'm') {
            // M key for rectangle select
            this.currentTool = 'rectangle-select';
            document.querySelectorAll('.drawing-tool').forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-tool') === 'rectangle-select');
            });
            e.preventDefault();
        } else if (e.key === 'l') {
            // L key for lasso select
            this.currentTool = 'lasso-select';
            document.querySelectorAll('.drawing-tool').forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-tool') === 'lasso-select');
            });
            e.preventDefault();
        } else if (e.key === 'ArrowLeft') {
            if (!this.selectionActive) {
                // Move to previous frame, loop to last if at first
                if (this.frames.length > 1) {
                    let prev = this.currentFrame - 1;
                    if (prev < 0) prev = this.frames.length - 1;
                    this.selectFrame(prev);
                }
                e.preventDefault();
            } else {
                this.rotateSelection(-90);
                e.preventDefault();
            }
        } else if (e.key === 'ArrowRight') {
            if (!this.selectionActive) {
                // Move to next frame, loop to first if at last
                if (this.frames.length > 1) {
                    let next = this.currentFrame + 1;
                    if (next >= this.frames.length) next = 0;
                    this.selectFrame(next);
                }
                e.preventDefault();
            } else {
                this.rotateSelection(90);
                e.preventDefault();
            }
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
        // Ensure all frame data is synced before saving
        this.syncGlobalLayersToCurrentFrame();

        return {
            canvasWidth: this.canvasWidth,
            canvasHeight: this.canvasHeight,
            frames: this.frames.map((frame, frameIndex) => ({
                isActive: frame.isActive !== undefined ? frame.isActive : true, // Include active state
                layers: frame.layers.map((layer, layerIndex) => ({
                    id: layer.id,
                    name: layer.name,
                    isVisible: layer.isVisible !== undefined ? layer.isVisible : true,
                    opacity: layer.opacity !== undefined ? layer.opacity : 100,
                    blendMode: layer.blendMode || 'source-over',
                    image: layer.canvas && layer.canvas.width > 0 && layer.canvas.height > 0
                        ? layer.canvas.toDataURL('image/png')
                        : null // Don't save empty canvases
                }))
            })),
            layers: this.layers.map((layer, layerIndex) => ({
                id: layer.id,
                name: layer.name,
                isVisible: layer.isVisible !== undefined ? layer.isVisible : true,
                opacity: layer.opacity !== undefined ? layer.opacity : 100,
                blendMode: layer.blendMode || 'source-over'
            })),
            currentFrame: this.currentFrame,
            activeLayerId: this.activeLayerId,
            fps: this.fps
        };
    }

    loadProjectData(data) {
        // Restore essential project data only
        this.canvasWidth = data.canvasWidth || 320;
        this.canvasHeight = data.canvasHeight || 240;
        this.currentFrame = data.currentFrame || 0;
        this.activeLayerId = data.activeLayerId || null;
        this.fps = data.fps || 12;

        // Restore layers structure first
        this.layers = data.layers.map(l => ({
            ...l,
            canvas: this.createLayerCanvas()
        }));

        // Keep track of loading progress
        let totalImages = 0;
        let loadedImages = 0;

        // Count total images that need to be loaded
        data.frames.forEach(frame => {
            frame.layers.forEach(layerData => {
                if (layerData.image) totalImages++;
            });
        });

        const checkComplete = () => {
            if (loadedImages >= totalImages) {
                // All images loaded, now update UI
                setTimeout(() => {
                    this.selectFrame(this.currentFrame);
                    this.renderLayersList();
                    this.updateFramesList();

                    // Update UI inputs
                    const canvasWidthInput = document.getElementById('canvasWidth');
                    const canvasHeightInput = document.getElementById('canvasHeight');
                    const fpsInput = document.getElementById('fpsInput');

                    if (canvasWidthInput) canvasWidthInput.value = this.canvasWidth;
                    if (canvasHeightInput) canvasHeightInput.value = this.canvasHeight;
                    if (fpsInput) fpsInput.value = this.fps;

                    // Force a final render
                    this.renderCurrentFrameToMainCanvas();
                }, 100);
            }
        };

        // Restore frames with proper layer distribution and active states
        this.frames = data.frames.map((frameData, frameIndex) => ({
            isActive: frameData.isActive !== undefined ? frameData.isActive : true, // Restore active state
            layers: frameData.layers.map((layerData, layerIndex) => {
                const canvas = this.createLayerCanvas();
                const ctx = canvas.getContext('2d');

                // Load image data for this specific layer
                if (layerData.image) {
                    const img = new window.Image();
                    img.onload = () => {
                        ctx.drawImage(img, 0, 0);
                        loadedImages++;

                        // If this is the current frame, also update the global layer
                        if (frameIndex === this.currentFrame && this.layers[layerIndex]) {
                            const globalCtx = this.layers[layerIndex].canvas.getContext('2d');
                            globalCtx.clearRect(0, 0, this.layers[layerIndex].canvas.width, this.layers[layerIndex].canvas.height);
                            globalCtx.drawImage(canvas, 0, 0);
                            // Trigger a render update for current frame
                            if (frameIndex === this.currentFrame) {
                                this.renderCurrentFrameToMainCanvas();
                            }
                        }

                        checkComplete();
                    };
                    img.onerror = () => {
                        console.error(`Failed to load image for frame ${frameIndex}, layer ${layerIndex}`);
                        loadedImages++;
                        checkComplete();
                    };
                    img.src = layerData.image;
                } else {
                    // No image to load for this layer
                    if (totalImages === 0) {
                        // No images at all, proceed immediately
                        setTimeout(checkComplete, 50);
                    }
                }

                return {
                    id: layerData.id,
                    name: layerData.name,
                    isVisible: layerData.isVisible !== undefined ? layerData.isVisible : true,
                    opacity: layerData.opacity !== undefined ? layerData.opacity : 100,
                    blendMode: layerData.blendMode || 'source-over',
                    canvas
                };
            })
        }));

        // Clear undo/redo stacks since we're not saving them
        this.undoStack = [];
        this.redoStack = [];

        // If no images to load, proceed immediately
        if (totalImages === 0) {
            checkComplete();
        }
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

    _drawPixelLine(ctx, x0, y0, x1, y1, color, size, preventCorners) {
        let dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1;
        let dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
        let err = dx + dy, e2;
        let prevX = x0, prevY = y0;

        while (true) {
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

        // Filter only active frames for export
        const activeFrames = this.frames.filter(frame => frame.isActive !== false);

        if (activeFrames.length === 0) {
            alert("No active frames to export!");
            return;
        }

        if (format === "gif") {
            const gif = new window.GIF({
                workers: 1,
                quality: 10,
                width: this.canvasWidth,
                height: this.canvasHeight,
                workerScript: 'js/gif.worker.js'
            });

            let totalFrames = activeFrames.length;

            // --- ASYNC FRAME ADDITION ---
            const addFramesAsync = async () => {
                for (let f = 0; f < totalFrames; f++) {
                    if (cancelled) return;
                    const tempCanvas = document.createElement('canvas');
                    tempCanvas.width = this.canvasWidth;
                    tempCanvas.height = this.canvasHeight;
                    const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
                    const frame = activeFrames[f]; // Use filtered active frames
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

                    // Yield to the browser so UI/progress can update
                    showLoading(`Preparing GIF: ${f + 1}/${totalFrames}`, Math.round(((f + 1) / totalFrames) * 100));
                    await new Promise(r => setTimeout(r, 10));
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
            };

            addFramesAsync();
        } else {
            // WebM/MP4 export using CCapture.js
            let capturer = new CCapture({
                format: "webm",
                framerate: this.fps,
                verbose: true,
                name: name
            });

            let frameIdx = 0;
            const totalFrames = activeFrames.length; // Use filtered active frames
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = this.canvasWidth;
            tempCanvas.height = this.canvasHeight;
            const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });

            capturer.start();

            const renderFrame = async () => {
                for (frameIdx = 0; frameIdx < totalFrames; frameIdx++) {
                    if (cancelled) {
                        capturer.stop();
                        hideLoading();
                        return;
                    }
                    tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
                    const frame = activeFrames[frameIdx]; // Use filtered active frames
                    for (let i = 0; i < frame.layers.length; i++) {
                        const layer = frame.layers[i];
                        if (!layer.isVisible) continue;
                        tempCtx.globalAlpha = layer.opacity / 100;
                        tempCtx.globalCompositeOperation = layer.blendMode;
                        tempCtx.drawImage(layer.canvas, 0, 0);
                    }
                    tempCtx.globalAlpha = 1.0;
                    tempCtx.globalCompositeOperation = 'source-over';

                    capturer.capture(tempCanvas);
                    showLoading(`Encoding WEBM: ${frameIdx + 1}/${totalFrames}`, Math.round(((frameIdx + 1) / totalFrames) * 100));
                    // Wait for the correct frame interval
                    await new Promise(r => setTimeout(r, 1000 / this.fps));
                }
                capturer.stop();
                setTimeout(() => {
                    capturer.save();
                    hideLoading();
                }, 500);
            };
            renderFrame();
        }
    }

    triggerLivePreviewIfEnabled() {
        const enablePreviewCheckbox = document.getElementById('enablePreview');
        if (enablePreviewCheckbox && enablePreviewCheckbox.checked) {
            // Pause and restart the animation to refresh preview
            this.pauseAnimation();
            this.playAnimation();
        }
    }

    // Selection Methods
    startSelection(x, y) {
        this.isCreatingSelection = true;
        this.clearSelection();
        this.startSelectionAnimation();

        if (this.currentTool === 'rectangle-select') {
            this.selectionBounds = { x, y, width: 0, height: 0 };
            // Store the original start position
            this.selectionStartX = x;
            this.selectionStartY = y;
        } else if (this.currentTool === 'lasso-select') {
            this.selectionPath = [{ x, y }];
        }
    }

    updateSelection(x, y) {
        if (!this.isCreatingSelection) return;

        if (this.currentTool === 'rectangle-select') {
            // Store the original start position - don't modify it
            const startX = this.selectionStartX || this.selectionBounds.x;
            const startY = this.selectionStartY || this.selectionBounds.y;

            // Calculate bounds properly for any direction
            this.selectionBounds = {
                x: Math.min(startX, x),
                y: Math.min(startY, y),
                width: Math.abs(x - startX),
                height: Math.abs(y - startY)
            };
        } else if (this.currentTool === 'lasso-select') {
            this.selectionPath.push({ x, y });
        }

        this.renderCurrentFrameToMainCanvas();
        this.drawSelectionPreview();
    }

    finishSelection() {
        if (!this.isCreatingSelection) return;

        this.isCreatingSelection = false;

        if (this.currentTool === 'rectangle-select') {
            if (this.selectionBounds.width > 0 && this.selectionBounds.height > 0) {
                this.undoAdd(); // Add undo state when creating selection
                this.selectionActive = true;
                this.extractSelectionData();
            }
        } else if (this.currentTool === 'lasso-select') {
            if (this.selectionPath.length > 2) {
                this.undoAdd(); // Add undo state when creating selection
                this.selectionActive = true;
                this.extractSelectionData();
            }
        }

        this.renderCurrentFrameToMainCanvas();
    }

    clearSelection() {
        if (this.selectionActive && this.selectionData) {
            // Apply any pending selection changes
            this.applySelectionToLayer();
        }

        this.selectionActive = false;
        this.selectionBounds = { x: 0, y: 0, width: 0, height: 0 };
        this.selectionPath = [];
        this.selectionData = null;
        this.isDraggingSelection = false;
        this.selectionOffset = { x: 0, y: 0 };
        this.selectionStartX = 0;
        this.selectionStartY = 0;
        this.selectionRotation = 0;
        this.selectionRotateButton = null; // Reset rotate button
        this.stopSelectionAnimation();
        this.renderCurrentFrameToMainCanvas();
    }

    startSelectionAnimation() {
        if (this.selectionAnimationInterval) {
            clearInterval(this.selectionAnimationInterval);
        }

        this.selectionAnimationInterval = setInterval(() => {
            this.selectionAnimationPhase = (this.selectionAnimationPhase + 1) % 2;
            if (this.selectionActive || this.isCreatingSelection) {
                this.renderCurrentFrameToMainCanvas();
            }
        }, 500); // 0.5 seconds
    }

    stopSelectionAnimation() {
        if (this.selectionAnimationInterval) {
            clearInterval(this.selectionAnimationInterval);
            this.selectionAnimationInterval = null;
        }
    }

    drawSelectionPreview() {
        if (this.currentTool === 'lasso-select' && this.selectionPath.length > 1) {
            this.ctx.save();

            // Use same animated style as selection outline
            const isDarkPhase = this.selectionAnimationPhase === 0;
            this.ctx.strokeStyle = isDarkPhase ? '#000000' : '#ffffff';
            this.ctx.lineWidth = 1;
            this.ctx.setLineDash([4, 4]);

            this.ctx.beginPath();
            this.ctx.moveTo(this.selectionPath[0].x, this.selectionPath[0].y);
            for (let i = 1; i < this.selectionPath.length; i++) {
                this.ctx.lineTo(this.selectionPath[i].x, this.selectionPath[i].y);
            }
            this.ctx.stroke();
            this.ctx.setLineDash([]);
            this.ctx.restore();
        }
    }

    drawSelectionOutline() {
        this.ctx.save();

        // Animate between white and black dashes
        const isDarkPhase = this.selectionAnimationPhase === 0;
        this.ctx.strokeStyle = isDarkPhase ? '#000000' : '#ffffff';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([4, 4]);

        if (this.currentTool === 'rectangle-select' || this.selectionBounds.width > 0) {
            const bounds = this.getAdjustedSelectionBounds();
            this.ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);

            // Draw rotate button at top-right corner
            this.drawSelectionRotateButton(bounds);
        } else if (this.selectionPath.length > 2) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.selectionPath[0].x, this.selectionPath[0].y);
            for (let i = 1; i < this.selectionPath.length; i++) {
                this.ctx.lineTo(this.selectionPath[i].x, this.selectionPath[i].y);
            }
            this.ctx.closePath();
            this.ctx.stroke();

            // Draw rotate button for lasso selection too
            const bounds = this.getAdjustedSelectionBounds();
            this.drawSelectionRotateButton(bounds);
        }

        this.ctx.setLineDash([]);
        this.ctx.restore();
    }

    drawSelectionRotateButton(bounds) {
        const buttonSize = 16;
        const buttonX = bounds.x + bounds.width + 4;
        const buttonY = bounds.y - 4;

        // Store button position for click detection
        this.selectionRotateButton = {
            x: buttonX,
            y: buttonY,
            size: buttonSize
        };

        this.ctx.save();
        this.ctx.setLineDash([]);

        // Button background
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.globalAlpha = 0.9;
        this.ctx.fillRect(buttonX, buttonY, buttonSize, buttonSize);

        // Button border
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;
        this.ctx.globalAlpha = 1;
        this.ctx.strokeRect(buttonX, buttonY, buttonSize, buttonSize);

        // Rotation arrow icon
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.lineCap = 'round';

        const centerX = buttonX + buttonSize / 2;
        const centerY = buttonY + buttonSize / 2;
        const radius = 5;

        // Draw circular arrow
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, -Math.PI / 2, Math.PI, false);
        this.ctx.stroke();

        // Arrow head
        this.ctx.beginPath();
        this.ctx.moveTo(centerX - radius, centerY);
        this.ctx.lineTo(centerX - radius - 3, centerY - 2);
        this.ctx.moveTo(centerX - radius, centerY);
        this.ctx.lineTo(centerX - radius - 3, centerY + 2);
        this.ctx.stroke();

        this.ctx.restore();
    }

    isPointInSelection(x, y) {
        if (!this.selectionActive) return false;

        if (this.currentTool === 'rectangle-select' || this.selectionBounds.width > 0) {
            const bounds = this.getAdjustedSelectionBounds();
            return x >= bounds.x && x <= bounds.x + bounds.width &&
                y >= bounds.y && y <= bounds.y + bounds.height;
        } else if (this.selectionPath.length > 0) {
            return this.isPointInPolygon(x, y, this.selectionPath);
        }

        return false;
    }

    isPointInPolygon(x, y, polygon) {
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            if (((polygon[i].y > y) !== (polygon[j].y > y)) &&
                (x < (polygon[j].x - polygon[i].x) * (y - polygon[i].y) / (polygon[j].y - polygon[i].y) + polygon[i].x)) {
                inside = !inside;
            }
        }
        return inside;
    }

    startDraggingSelection(x, y) {
        // Add undo state before starting to drag
        this.undoAdd();

        this.isDraggingSelection = true;
        const bounds = this.getAdjustedSelectionBounds();
        this.selectionOffset = {
            x: x - bounds.x,
            y: y - bounds.y
        };
    }

    updateSelectionDrag(x, y) {
        if (!this.isDraggingSelection) return;

        const newX = x - this.selectionOffset.x;
        const newY = y - this.selectionOffset.y;

        if (this.currentTool === 'rectangle-select' || this.selectionBounds.width > 0) {
            this.selectionBounds.x = newX;
            this.selectionBounds.y = newY;
        } else if (this.selectionPath.length > 0) {
            // Move entire path
            const dx = newX - this.selectionPath[0].x;
            const dy = newY - this.selectionPath[0].y;
            this.selectionPath = this.selectionPath.map(p => ({
                x: p.x + dx,
                y: p.y + dy
            }));
        }

        this.renderCurrentFrameToMainCanvas();
    }

    stopDraggingSelection() {
        this.isDraggingSelection = false;
    }

    getAdjustedSelectionBounds() {
        if (this.selectionBounds.width > 0) {
            return this.selectionBounds;
        } else if (this.selectionPath.length > 0) {
            // Calculate bounding box of lasso selection
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            for (const point of this.selectionPath) {
                minX = Math.min(minX, point.x);
                minY = Math.min(minY, point.y);
                maxX = Math.max(maxX, point.x);
                maxY = Math.max(maxY, point.y);
            }
            return {
                x: minX,
                y: minY,
                width: maxX - minX,
                height: maxY - minY
            };
        }
        return this.selectionBounds;
    }

    extractSelectionData() {
        // Use the current frame's layers, not global layers!
        const frame = this.frames[this.currentFrame];
        const layer = frame.layers.find(l => l.id === this.activeLayerId);

        if (!layer) return;

        const bounds = this.getAdjustedSelectionBounds();
        const canvas = document.createElement('canvas');
        canvas.width = bounds.width;
        canvas.height = bounds.height;
        const ctx = canvas.getContext('2d');

        // Create a mask for the selection
        const maskCanvas = document.createElement('canvas');
        maskCanvas.width = this.canvasWidth;
        maskCanvas.height = this.canvasHeight;
        const maskCtx = maskCanvas.getContext('2d');

        if (this.currentTool === 'rectangle-select' || this.selectionBounds.width > 0) {
            maskCtx.fillStyle = 'white';
            maskCtx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
        } else if (this.selectionPath.length > 0) {
            maskCtx.fillStyle = 'white';
            maskCtx.beginPath();
            maskCtx.moveTo(this.selectionPath[0].x, this.selectionPath[0].y);
            for (let i = 1; i < this.selectionPath.length; i++) {
                maskCtx.lineTo(this.selectionPath[i].x, this.selectionPath[i].y);
            }
            maskCtx.closePath();
            maskCtx.fill();
        }

        // Extract the selected area from the layer
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.canvasWidth;
        tempCanvas.height = this.canvasHeight;
        const tempCtx = tempCanvas.getContext('2d');

        // Draw the layer
        tempCtx.drawImage(layer.canvas, 0, 0);

        // Apply mask
        tempCtx.globalCompositeOperation = 'destination-in';
        tempCtx.drawImage(maskCanvas, 0, 0);

        // Copy to selection canvas
        ctx.drawImage(tempCanvas, bounds.x, bounds.y, bounds.width, bounds.height, 0, 0, bounds.width, bounds.height);

        this.selectionData = ctx.getImageData(0, 0, bounds.width, bounds.height);

        // Clear the selected area from the original layer
        const layerCtx = layer.canvas.getContext('2d');
        layerCtx.globalCompositeOperation = 'destination-out';
        layerCtx.drawImage(maskCanvas, 0, 0);
        layerCtx.globalCompositeOperation = 'source-over';
    }

    applySelectionToLayer() {
        if (!this.selectionData || !this.selectionActive) return;

        // Use the current frame's layers, not global layers!
        const frame = this.frames[this.currentFrame];
        const layer = frame.layers.find(l => l.id === this.activeLayerId);
        if (!layer) return;

        const bounds = this.getAdjustedSelectionBounds();
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = bounds.width;
        tempCanvas.height = bounds.height;
        const tempCtx = tempCanvas.getContext('2d');

        tempCtx.putImageData(this.selectionData, 0, 0);

        const layerCtx = layer.canvas.getContext('2d');
        layerCtx.drawImage(tempCanvas, bounds.x, bounds.y);
    }

    copySelection() {
        if (!this.selectionActive || !this.selectionData) return;

        const bounds = this.getAdjustedSelectionBounds();
        this.copiedSelection = {
            data: new ImageData(
                new Uint8ClampedArray(this.selectionData.data),
                this.selectionData.width,
                this.selectionData.height
            ),
            width: bounds.width,
            height: bounds.height
        };
    }

    cutSelection() {
        if (!this.selectionActive || !this.selectionData) return;

        // Copy selection to clipboard
        this.copySelection();

        // Delete the selection from the canvas
        this.deleteSelection();
    }

    pasteSelection() {
        if (!this.copiedSelection) return;

        this.clearSelection();

        // Create new selection at center of canvas
        const centerX = Math.floor((this.canvasWidth - this.copiedSelection.width) / 2);
        const centerY = Math.floor((this.canvasHeight - this.copiedSelection.height) / 2);

        this.selectionBounds = {
            x: centerX,
            y: centerY,
            width: this.copiedSelection.width,
            height: this.copiedSelection.height
        };

        this.selectionData = new ImageData(
            new Uint8ClampedArray(this.copiedSelection.data.data),
            this.copiedSelection.data.width,
            this.copiedSelection.data.height
        );

        this.selectionActive = true;
        this.currentTool = 'rectangle-select';

        // Start the selection animation for pasted selection
        this.startSelectionAnimation();

        this.renderCurrentFrameToMainCanvas();
    }

    selectAll() {
        this.clearSelection();
        this.selectionBounds = {
            x: 0,
            y: 0,
            width: this.canvasWidth,
            height: this.canvasHeight
        };
        this.selectionActive = true;
        this.currentTool = 'rectangle-select';
        this.extractSelectionData();
        this.startSelectionAnimation();
        this.renderCurrentFrameToMainCanvas();
    }

    deleteSelection() {
        if (!this.selectionActive) return;

        this.undoAdd();
        this.clearSelection();
        this.syncGlobalLayersToCurrentFrame();
    }

    rotateSelection(degrees) {
        if (!this.selectionActive || !this.selectionData) return;

        this.undoAdd();
        this.selectionRotation = (this.selectionRotation + degrees) % 360;

        // Create a canvas for the original data
        const originalCanvas = document.createElement('canvas');
        originalCanvas.width = this.selectionData.width;
        originalCanvas.height = this.selectionData.height;
        const originalCtx = originalCanvas.getContext('2d');
        originalCtx.putImageData(this.selectionData, 0, 0);

        // For 90-degree rotations, we can do pixel-perfect rotation
        if (Math.abs(degrees) === 90) {
            let newWidth, newHeight;

            // For 90-degree rotations, swap dimensions
            if (degrees === 90 || degrees === -270) {
                // 90 degrees clockwise
                newWidth = originalCanvas.height;
                newHeight = originalCanvas.width;
            } else if (degrees === -90 || degrees === 270) {
                // 90 degrees counter-clockwise
                newWidth = originalCanvas.height;
                newHeight = originalCanvas.width;
            } else if (Math.abs(degrees) === 180) {
                // 180 degrees
                newWidth = originalCanvas.width;
                newHeight = originalCanvas.height;
            }

            // Create rotated canvas
            const rotatedCanvas = document.createElement('canvas');
            rotatedCanvas.width = newWidth;
            rotatedCanvas.height = newHeight;
            const rotatedCtx = rotatedCanvas.getContext('2d');

            // Disable image smoothing for pixel-perfect rotation
            rotatedCtx.imageSmoothingEnabled = false;

            // Apply the rotation transformation
            rotatedCtx.translate(newWidth / 2, newHeight / 2);
            rotatedCtx.rotate(degrees * Math.PI / 180);
            rotatedCtx.translate(-originalCanvas.width / 2, -originalCanvas.height / 2);

            // Draw the original image
            rotatedCtx.drawImage(originalCanvas, 0, 0);

            // Update selection data and bounds
            this.selectionData = rotatedCtx.getImageData(0, 0, newWidth, newHeight);

            // Adjust bounds to keep selection centered
            const bounds = this.getAdjustedSelectionBounds();
            const centerX = bounds.x + bounds.width / 2;
            const centerY = bounds.y + bounds.height / 2;

            this.selectionBounds = {
                x: Math.floor(centerX - newWidth / 2),
                y: Math.floor(centerY - newHeight / 2),
                width: newWidth,
                height: newHeight
            };
        } else {
            // For non-90-degree rotations, use the original method (with potential blur)
            const radians = Math.abs(degrees * Math.PI / 180);
            const sin = Math.sin(radians);
            const cos = Math.cos(radians);
            const newWidth = Math.ceil(originalCanvas.width * cos + originalCanvas.height * sin);
            const newHeight = Math.ceil(originalCanvas.width * sin + originalCanvas.height * cos);

            const rotatedCanvas = document.createElement('canvas');
            rotatedCanvas.width = newWidth;
            rotatedCanvas.height = newHeight;
            const rotatedCtx = rotatedCanvas.getContext('2d');

            rotatedCtx.translate(newWidth / 2, newHeight / 2);
            rotatedCtx.rotate(degrees * Math.PI / 180);
            rotatedCtx.translate(-originalCanvas.width / 2, -originalCanvas.height / 2);
            rotatedCtx.drawImage(originalCanvas, 0, 0);

            this.selectionData = rotatedCtx.getImageData(0, 0, newWidth, newHeight);

            const bounds = this.getAdjustedSelectionBounds();
            const centerX = bounds.x + bounds.width / 2;
            const centerY = bounds.y + bounds.height / 2;

            this.selectionBounds = {
                x: Math.floor(centerX - newWidth / 2),
                y: Math.floor(centerY - newHeight / 2),
                width: newWidth,
                height: newHeight
            };
        }

        this.renderCurrentFrameToMainCanvas();
    }

    // --- Spline Tool Event Handlers ---
    handleSplineMouseDown(e) {
        if (this.currentTool !== 'spline') return;
        e.preventDefault();

        const rect = this.mainCanvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / this.zoom);
        const y = Math.floor((e.clientY - rect.top) / this.zoom);

        // Check if clicking on apply button
        if (this.splineApplyButton && this.isPointInApplyButton(x, y)) {
            this.applySpline();
            return;
        }

        // Check if clicking on existing point
        for (let i = 0; i < this.splinePoints.length; i++) {
            const point = this.splinePoints[i];
            if (Math.hypot(point.x - x, point.y - y) < 12) {
                this.isDraggingSplinePoint = true;
                this.draggingSplinePointIndex = i;
                return;
            }
        }

        // Add new point
        this.splinePoints.push({ x, y });
        this.splineActive = true;
        this.renderCurrentFrameToMainCanvas();
        this.drawSplinePreview();
    }

    handleSplineMouseMove(e) {
        if (this.currentTool !== 'spline') return;

        if (this.isDraggingSplinePoint && this.draggingSplinePointIndex >= 0) {
            const rect = this.mainCanvas.getBoundingClientRect();
            const x = Math.floor((e.clientX - rect.left) / this.zoom);
            const y = Math.floor((e.clientY - rect.top) / this.zoom);

            this.splinePoints[this.draggingSplinePointIndex] = { x, y };
            this.renderCurrentFrameToMainCanvas();
            this.drawSplinePreview();
        }
    }

    handleSplineMouseUp(e) {
        if (this.currentTool !== 'spline') return;

        this.isDraggingSplinePoint = false;
        this.draggingSplinePointIndex = -1;
    }

    handleSplineRightClick(e) {
        if (this.currentTool !== 'spline') return;

        const rect = this.mainCanvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / this.zoom);
        const y = Math.floor((e.clientY - rect.top) / this.zoom);

        // Remove point if right-clicking near one
        for (let i = 0; i < this.splinePoints.length; i++) {
            const point = this.splinePoints[i];
            if (Math.hypot(point.x - x, point.y - y) < 12) {
                this.splinePoints.splice(i, 1);
                if (this.splinePoints.length === 0) {
                    this.splineActive = false;
                    this.splineApplyButton = null;
                }
                this.renderCurrentFrameToMainCanvas();
                this.drawSplinePreview();
                return;
            }
        }
    }

    bezierSpline(p1, p2, p3, t, intensity) {
        // Quadratic Bezier interpolation
        const cpx = p2.x + (p3.x - p1.x) * intensity * this.splineTension * 0.3;
        const cpy = p2.y + (p3.y - p1.y) * intensity * this.splineTension * 0.3;

        const x = (1 - t) * (1 - t) * p1.x + 2 * (1 - t) * t * cpx + t * t * p2.x;
        const y = (1 - t) * (1 - t) * p1.y + 2 * (1 - t) * t * cpy + t * t * p2.y;

        return { x, y };
    }

    bSplineInterpolate(p0, p1, p2, p3, t, intensity) {
        // Simplified B-spline interpolation
        const t2 = t * t;
        const t3 = t2 * t;

        const factor = intensity * this.splineTension;

        const x = factor * (
            (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3 +
            (3 * p0.x - 6 * p1.x + 3 * p2.x) * t2 +
            (-3 * p0.x + 3 * p2.x) * t +
            (p0.x + 4 * p1.x + p2.x)
        ) / 6;

        const y = factor * (
            (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3 +
            (3 * p0.y - 6 * p1.y + 3 * p2.y) * t2 +
            (-3 * p0.y + 3 * p2.y) * t +
            (p0.y + 4 * p1.y + p2.y)
        ) / 6;

        return { x, y };
    }

    // --- Draw Spline Preview and Controls ---
    drawSplinePreview() {
        if (!this.ctx || this.splinePoints.length === 0) return;

        // Draw the spline curve
        if (this.splinePoints.length > 1) {
            this.ctx.save();
            this.ctx.globalAlpha = 0.8;
            this.ctx.strokeStyle = this.primaryColor;
            this.ctx.lineWidth = this.brushSize;
            this.ctx.setLineDash([6, 4]);
            this.drawSplineCurve(this.ctx, this.splinePoints, this.splineIntensity);
            this.ctx.setLineDash([]);
            this.ctx.restore();
        }

        // Draw control points
        for (let i = 0; i < this.splinePoints.length; i++) {
            const pt = this.splinePoints[i];
            this.ctx.save();

            // Point background
            this.ctx.beginPath();
            this.ctx.arc(pt.x, pt.y, 8, 0, 2 * Math.PI);
            this.ctx.fillStyle = '#ffffff';
            this.ctx.globalAlpha = 0.9;
            this.ctx.fill();

            // Point border
            this.ctx.lineWidth = 2;
            this.ctx.strokeStyle = this.isDraggingSplinePoint && this.draggingSplinePointIndex === i ?
                this.primaryColor : '#333333';
            this.ctx.globalAlpha = 1;
            this.ctx.stroke();

            // Point number (if enabled)
            if (this.splineShowNumbers) {
                this.ctx.fillStyle = '#333333';
                this.ctx.font = 'bold 10px sans-serif';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText((i + 1).toString(), pt.x, pt.y);
            }

            this.ctx.restore();
        }

        // Draw connection lines between points (if enabled)
        if (this.splineShowControlLines && this.splinePoints.length > 1) {
            this.ctx.save();
            this.ctx.strokeStyle = '#888888';
            this.ctx.lineWidth = 1;
            this.ctx.setLineDash([2, 4]);
            this.ctx.globalAlpha = 0.5;
            this.ctx.beginPath();
            for (let i = 0; i < this.splinePoints.length; i++) {
                const pt = this.splinePoints[i];
                if (i === 0) this.ctx.moveTo(pt.x, pt.y);
                else this.ctx.lineTo(pt.x, pt.y);
            }
            this.ctx.stroke();
            this.ctx.setLineDash([]);
            this.ctx.restore();
        }

        // Draw apply button
        if (this.splinePoints.length > 1) {
            this.drawSplineApplyButton();
        } else {
            this.splineApplyButton = null;
        }
    }

    drawSplineApplyButton() {
        // Position apply button at bottom-right of canvas
        const buttonSize = 32;
        const margin = 16;
        const buttonX = this.canvasWidth - buttonSize - margin;
        const buttonY = this.canvasHeight - buttonSize - margin;

        this.splineApplyButton = {
            x: buttonX,
            y: buttonY,
            size: buttonSize
        };

        this.ctx.save();

        // Button background
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.globalAlpha = 0.9;
        this.ctx.fillRect(buttonX, buttonY, buttonSize, buttonSize);

        // Button border
        this.ctx.strokeStyle = '#333333';
        this.ctx.lineWidth = 2;
        this.ctx.globalAlpha = 1;
        this.ctx.strokeRect(buttonX, buttonY, buttonSize, buttonSize);

        // Check mark icon
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';
        this.ctx.beginPath();
        this.ctx.moveTo(buttonX + 8, buttonY + 16);
        this.ctx.lineTo(buttonX + 14, buttonY + 22);
        this.ctx.lineTo(buttonX + 24, buttonY + 10);
        this.ctx.stroke();

        // "Apply" text
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 8px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'bottom';
        this.ctx.fillText('Apply', buttonX + buttonSize / 2, buttonY + buttonSize - 2);

        this.ctx.restore();
    }

    isPointInApplyButton(x, y) {
        if (!this.splineApplyButton) return false;
        const btn = this.splineApplyButton;
        return x >= btn.x && x <= btn.x + btn.size &&
            y >= btn.y && y <= btn.y + btn.size;
    }

    // --- Draw Spline Curve with Intensity ---
    drawSplineCurve(ctx, points, intensity) {
        if (points.length < 2) return;

        if (this.pixelDrawingMode && this.brushSize === 1) {
            this.drawPixelSpline(ctx, points, intensity);
        } else {
            this.drawSmoothSpline(ctx, points, intensity);
        }
    }

    drawSmoothSpline(ctx, points, intensity) {
        if (points.length === 2) {
            // Just a straight line for 2 points
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            ctx.lineTo(points[1].x, points[1].y);
            ctx.stroke();
            return;
        }

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        switch (this.splineType) {
            case 'catmull-rom':
                this.drawCatmullRomSpline(ctx, points, intensity);
                break;
            case 'bezier':
                this.drawBezierSpline(ctx, points, intensity);
                break;
            case 'b-spline':
                this.drawBSpline(ctx, points, intensity);
                break;
            default:
                this.drawCatmullRomSpline(ctx, points, intensity);
        }

        ctx.stroke();
    }

    drawBezierSpline(ctx, points, intensity) {
        // Quadratic Bezier curves between consecutive points
        for (let i = 0; i < points.length - 1; i++) {
            const p1 = points[i];
            const p2 = points[i + 1];

            if (i < points.length - 2) {
                // Use next point to influence control point
                const p3 = points[i + 2];
                const cpx = p2.x + (p3.x - p1.x) * intensity * this.splineTension * 0.3;
                const cpy = p2.y + (p3.y - p1.y) * intensity * this.splineTension * 0.3;
                ctx.quadraticCurveTo(cpx, cpy, p2.x, p2.y);
            } else {
                ctx.lineTo(p2.x, p2.y);
            }
        }
    }

    drawBSpline(ctx, points, intensity) {
        // B-spline implementation for smoother curves
        if (points.length < 3) {
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }
            return;
        }

        const degree = 3; // Cubic B-spline
        for (let i = 0; i < points.length - 1; i++) {
            for (let t = 0; t <= 1; t += this.splineSmoothing * 2) {
                const point = this.bSplinePoint(points, i, t, degree, intensity);
                if (t === 0 && i === 0) {
                    ctx.moveTo(point.x, point.y);
                } else {
                    ctx.lineTo(point.x, point.y);
                }
            }
        }
    }

    bSplinePoint(points, segment, t, degree, intensity) {
        // Simplified B-spline calculation
        const n = points.length - 1;
        let x = 0, y = 0;

        for (let i = 0; i <= n; i++) {
            const basis = this.bSplineBasis(i, degree, t, n);
            x += basis * points[i].x * intensity;
            y += basis * points[i].y * intensity;
        }

        return { x, y };
    }

    bSplineBasis(i, k, t, n) {
        // Simplified basis function calculation
        if (k === 0) {
            return (i <= t * n && t * n < i + 1) ? 1 : 0;
        }

        const c1 = (t * n - i) / k;
        const c2 = (i + k + 1 - t * n) / k;

        return c1 * this.bSplineBasis(i, k - 1, t, n) +
            c2 * this.bSplineBasis(i + 1, k - 1, t, n);
    }

    drawPixelSpline(ctx, points, intensity) {
        // Enhanced pixel spline with different curve types
        const samples = [];

        if (points.length === 2) {
            this._drawPixelLine(ctx, points[0].x, points[0].y, points[1].x, points[1].y,
                this.primaryColor, this.brushSize, false);
            return;
        }

        // Sample the spline curve with configurable smoothing
        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i - 1] || points[i];
            const p1 = points[i];
            const p2 = points[i + 1];
            const p3 = points[i + 2] || points[i + 1];

            for (let t = 0; t < 1; t += this.splineSmoothing) {
                let point;
                switch (this.splineType) {
                    case 'catmull-rom':
                        point = this.catmullRomSpline(p0, p1, p2, p3, t, intensity);
                        break;
                    case 'bezier':
                        point = this.bezierSpline(p1, p2, p3, t, intensity);
                        break;
                    case 'b-spline':
                        point = this.bSplineInterpolate(p0, p1, p2, p3, t, intensity);
                        break;
                    default:
                        point = this.catmullRomSpline(p0, p1, p2, p3, t, intensity);
                }
                samples.push(point);
            }
        }

        // Add the last point
        samples.push(points[points.length - 1]);

        // Draw pixel lines between sampled points
        for (let i = 0; i < samples.length - 1; i++) {
            const p1 = samples[i];
            const p2 = samples[i + 1];
            this._drawPixelLine(ctx, Math.round(p1.x), Math.round(p1.y),
                Math.round(p2.x), Math.round(p2.y), this.primaryColor, this.brushSize, false);
        }
    }

    drawCatmullRomSpline(ctx, points, intensity) {
        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i - 1] || points[i];
            const p1 = points[i];
            const p2 = points[i + 1];
            const p3 = points[i + 2] || points[i + 1];

            // Enhanced control with tension
            const tension = this.splineTension;
            const cp1x = p1.x + (p2.x - p0.x) * intensity * tension * 0.16;
            const cp1y = p1.y + (p2.y - p0.y) * intensity * tension * 0.16;
            const cp2x = p2.x - (p3.x - p1.x) * intensity * tension * 0.16;
            const cp2y = p2.y - (p3.y - p1.y) * intensity * tension * 0.16;

            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
        }
    }

    catmullRomSpline(p0, p1, p2, p3, t, intensity) {
        const t2 = t * t;
        const t3 = t2 * t;

        // Apply intensity to the curve calculation
        const factor = intensity * 0.5;

        return {
            x: factor * ((-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3 +
                (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
                (-p0.x + p2.x) * t) + p1.x,
            y: factor * ((-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3 +
                (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
                (-p0.y + p2.y) * t) + p1.y
        };
    }

    // --- Apply Spline to Layer ---
    applySpline() {
        if (!this.activeLayerId || this.splinePoints.length < 2) return;

        this.undoAdd();
        const layer = this.layers.find(l => l.id === this.activeLayerId);
        if (layer) {
            const ctx = layer.canvas.getContext('2d');
            ctx.save();
            ctx.globalAlpha = this.opacity / 100;
            ctx.strokeStyle = this.primaryColor;
            ctx.lineWidth = this.brushSize;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            this.drawSplineCurve(ctx, this.splinePoints, this.splineIntensity);
            ctx.restore();
        }

        // Clear spline state
        this.splinePoints = [];
        this.splineActive = false;
        this.splineApplyButton = null;
        this.renderCurrentFrameToMainCanvas();
        this.syncGlobalLayersToCurrentFrame();
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

    _serializeState(state) {
        // Helper to serialize a state object (undo/redo)
        return {
            frames: state.frames.map(frame => ({
                layers: frame.layers.map(layer => ({
                    ...layer,
                    canvas: layer.canvas.toDataURL()
                }))
            })),
            layers: state.layers.map(layer => ({
                ...layer,
                canvas: layer.canvas.toDataURL()
            })),
            currentFrame: state.currentFrame,
            activeLayerId: state.activeLayerId
        };
    }

    _restoreStateFromSerialized(state) {
        // Helper to restore a state object (undo/redo) from serialized data
        return {
            frames: state.frames.map(frame => ({
                layers: frame.layers.map(layer => {
                    const canvas = this.createLayerCanvas();
                    const ctx = canvas.getContext('2d');
                    if (layer.canvas) {
                        const img = new window.Image();
                        img.src = layer.canvas;
                        img.onload = () => ctx.drawImage(img, 0, 0);
                    }
                    return { ...layer, canvas };
                })
            })),
            layers: state.layers.map(layer => {
                const canvas = this.createLayerCanvas();
                const ctx = canvas.getContext('2d');
                if (layer.canvas) {
                    const img = new window.Image();
                    img.src = layer.canvas;
                    img.onload = () => ctx.drawImage(img, 0, 0);
                }
                return { ...layer, canvas };
            }),
            currentFrame: state.currentFrame,
            activeLayerId: state.activeLayerId
        };
    }
}

// --- Mobile Panel Toggle Logic ---
function setMobilePanel(panel) {
    document.body.classList.add('mobile-mode');
    document.querySelectorAll('.left-panel, .right-panel, .bottom-panel').forEach(p => p.classList.remove('mobile-open'));
    if (panel) panel.classList.add('mobile-open');
}

function closeMobilePanels() {
    document.querySelectorAll('.left-panel, .right-panel, .bottom-panel').forEach(p => p.classList.remove('mobile-open'));
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

function adjustMainContentHeight() {
    const mainContent = document.querySelector('.main-content');
    const menubar = document.querySelector('.menubar');
    const toolbar = document.querySelector('.toolbar');
    const bottomPanel = document.getElementById('bottomPanel');
    if (!mainContent || !menubar || !toolbar || !bottomPanel) return;

    const menubarHeight = menubar.offsetHeight;
    const toolbarHeight = toolbar.offsetHeight;
    const bottomPanelHeight = bottomPanel.offsetHeight;

    // Set main-content height so panels fill to bottomPanel
    mainContent.style.top = (menubarHeight + toolbarHeight) + 'px';
    mainContent.style.bottom = bottomPanelHeight + 'px';
    mainContent.style.height = `calc(100vh - ${menubarHeight + toolbarHeight + bottomPanelHeight}px)`;
}

function updateCanvasContainerScrolling() {
    const canvasContainer = document.querySelector('.canvas-container');
    const mainCanvas = document.getElementById('mainCanvas');
    if (!canvasContainer || !mainCanvas) return;

    // Check if canvas is taller than container (after zoom)
    const canvasHeight = mainCanvas.offsetHeight;
    const containerHeight = canvasContainer.clientHeight;

    if (canvasHeight > containerHeight + 1) {
        canvasContainer.classList.add('scrolling');
    } else {
        canvasContainer.classList.remove('scrolling');
        // Center vertically by resetting scroll
        canvasContainer.scrollTop = 0;
    }
}

// Function to update panel layout
function updatePanelLayout(panelType, isVisible) {
    const mainContent = document.querySelector('.main-content');
    const bottomPanel = document.querySelector('.bottom-panel');

    if (panelType === 'left') {
        const width = isVisible ? '300px' : '0px';
        document.documentElement.style.setProperty('--left-panel-width', width);
        if (bottomPanel) {
            bottomPanel.style.left = width;
        }
    } else if (panelType === 'right') {
        const width = isVisible ? '300px' : '0px';
        document.documentElement.style.setProperty('--right-panel-width', width);
        if (bottomPanel) {
            bottomPanel.style.right = width;
        }
    } else if (panelType === 'bottom') {
        const height = isVisible ? '140px' : '0px';
        document.documentElement.style.setProperty('--bottom-panel-height', height);

        // Update canvas container height
        const canvasContainer = document.querySelector('.canvas-container');
        if (canvasContainer) {
            if (isVisible) {
                canvasContainer.style.height = 'calc(100% - var(--bottom-panel-height))';
            } else {
                canvasContainer.style.height = '100%';
            }
        }
    }
}

// Helper: get distance between two touches
function getTouchDist(touches) {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

// Helper: get midpoint between two touches
function getTouchMid(touches) {
    if (touches.length < 2) return { x: 0, y: 0 };
    return {
        x: (touches[0].clientX + touches[1].clientX) / 2,
        y: (touches[0].clientY + touches[1].clientY) / 2
    };
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const app = new SpriteSpark();

    // Touch and stylus gesture state
    let lastTouchDist = null;
    let lastTouchZoom = 1;
    let isTouchPanning = false;
    let touchPanStart = { x: 0, y: 0 };
    let touchScrollStart = { left: 0, top: 0 };
    let isMultiTouch = false;
    let isPanningOrZooming = false; // Add this flag to track pan/zoom state

    // Ctrl+Wheel zoom for canvas only
    const canvasContainer = document.querySelector('.canvas-container');
    const zoomInput = document.getElementById('zoomInput');
    const bottomPanel = document.getElementById('bottomPanel');
    const bottomResize = document.getElementById('bottomResize');

    const originalUpdateZoomLevel = SpriteSpark.prototype.updateZoomLevel;
    const originalResizeCanvases = SpriteSpark.prototype.resizeCanvases;

    // Mobile panel toggles
    const leftPanel = document.getElementById('leftPanel');
    const rightPanel = document.getElementById('rightPanel');
    const mobileLeftToggle = document.getElementById('mobileLeftToggle');
    const mobileRightToggle = document.getElementById('mobileRightToggle');
    const mobileBottomToggle = document.getElementById('mobileBottomToggle');
    const toggleMobileMode = document.getElementById('toggleMobileMode');

    let isResizingBottom = false;
    let startY = 0, startHeight = 0;

    let isPanning = false;
    let panStart = { x: 0, y: 0 };
    let scrollStart = { left: 0, top: 0 };

    // Stylus pressure option state
    let stylusPressureEnabled = false;

    if (canvasContainer && zoomInput) {
        canvasContainer.addEventListener('wheel', (e) => {
            if (e.ctrlKey) {
                e.preventDefault();
                let zoom = parseFloat(zoomInput.value);
                if (e.deltaY < 0) {
                    zoom = Math.min(zoom + 0.1, 8);
                } else {
                    zoom = Math.max(zoom - 0.1, 0.1);
                }
                zoom = Math.round(zoom * 100) / 100;
                zoomInput.value = zoom;
                app.updateZoomLevel();
            }
        }, { passive: false });
    }

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
        clampCanvasScroll();
        e.preventDefault();
    }

    function endPan(e) {
        if (!isPanning) return;
        isPanning = false;
        canvasContainer.style.cursor = '';
        e.preventDefault();
    }

    function clampCanvasScroll() {
        const canvasContainer = document.getElementById('canvasContainer');
        if (!canvasContainer) return;
        // Prevent scrolling above the top (menubar+toolbar)
        if (canvasContainer.scrollTop < 0) canvasContainer.scrollTop = 0;
    }

    // Touch start
    if (canvasContainer) {
        canvasContainer.addEventListener('touchstart', function (e) {
            if (e.touches.length === 2) {
                // Two finger: pan/zoom - prevent drawing
                isTouchPanning = true;
                isMultiTouch = true;
                isPanningOrZooming = true; // Set flag to prevent drawing
                lastTouchDist = getTouchDist(e.touches);
                lastTouchZoom = parseFloat(zoomInput.value);
                const mid = getTouchMid(e.touches);
                touchPanStart.x = mid.x;
                touchPanStart.y = mid.y;
                touchScrollStart.left = canvasContainer.scrollLeft;
                touchScrollStart.top = canvasContainer.scrollTop;
                
                // Stop any ongoing drawing
                if (app.isDrawing) {
                    app.stopDrawing({ button: 0 });
                }
            } else if (e.touches.length === 1 && !isMultiTouch && !isPanningOrZooming) {
                // Single finger: drawing (only if not multitouch and not panning/zooming)
                const touch = e.touches[0];
                // Simulate mouse event for drawing
                const fakeEvent = {
                    button: 0,
                    clientX: touch.clientX,
                    clientY: touch.clientY,
                    ctrlKey: false,
                    preventDefault: () => { },
                    pointerType: touch.touchType || 'touch',
                    pressure: touch.force || 0.5 // fallback for browsers without force
                };
                // If stylus and pressure enabled, set brush size
                if (
                    stylusPressureEnabled &&
                    (touch.touchType === 'stylus' || fakeEvent.pointerType === 'pen' || fakeEvent.pointerType === 'stylus')
                ) {
                    const min = 1, max = 50;
                    app.brushSize = Math.max(min, Math.round((fakeEvent.pressure || 0.5) * max));
                    const brushSizeInput = document.getElementById('brushSize');
                    if (brushSizeInput) brushSizeInput.value = app.brushSize;
                    const brushSizeValue = document.getElementById('brushSizeValue');
                    if (brushSizeValue) brushSizeValue.textContent = app.brushSize;
                }
                app.startDrawing(fakeEvent);
            }
        }, { passive: false });

        // Touch move
        canvasContainer.addEventListener('touchmove', function (e) {
            if (e.touches.length === 2 && isTouchPanning) {
                // Pan and zoom - definitely not drawing
                isPanningOrZooming = true;
                
                const mid = getTouchMid(e.touches);
                // Pan
                const dx = mid.x - touchPanStart.x;
                const dy = mid.y - touchPanStart.y;
                canvasContainer.scrollLeft = touchScrollStart.left - dx;
                canvasContainer.scrollTop = touchScrollStart.top - dy;
                // Zoom
                const dist = getTouchDist(e.touches);
                if (lastTouchDist && Math.abs(dist - lastTouchDist) > 2) {
                    let scale = dist / lastTouchDist;
                    let newZoom = Math.max(0.5, Math.min(8, lastTouchZoom * scale));
                    zoomInput.value = Math.round(newZoom * 100) / 100;
                    app.updateZoomLevel();
                }
                e.preventDefault();
            } else if (e.touches.length === 1 && app.isDrawing && !isMultiTouch && !isPanningOrZooming) {
                // Drawing (only if not multitouch and not panning/zooming)
                const touch = e.touches[0];
                const fakeEvent = {
                    button: 0,
                    clientX: touch.clientX,
                    clientY: touch.clientY,
                    ctrlKey: false,
                    preventDefault: () => { },
                    pointerType: touch.touchType || 'touch',
                    pressure: touch.force || 0.5
                };
                // Stylus pressure
                if (
                    stylusPressureEnabled &&
                    (touch.touchType === 'stylus' || fakeEvent.pointerType === 'pen' || fakeEvent.pointerType === 'stylus')
                ) {
                    const min = 1, max = 50;
                    app.brushSize = Math.max(min, Math.round((fakeEvent.pressure || 0.5) * max));
                    const brushSizeInput = document.getElementById('brushSize');
                    if (brushSizeInput) brushSizeInput.value = app.brushSize;
                    const brushSizeValue = document.getElementById('brushSizeValue');
                    if (brushSizeValue) brushSizeValue.textContent = app.brushSize;
                }
                app.draw(fakeEvent);
                e.preventDefault();
            }
        }, { passive: false });

        // Touch end/cancel
        canvasContainer.addEventListener('touchend', function (e) {
            if (e.touches.length === 0) {
                // All touches ended
                if (app.isDrawing && !isPanningOrZooming) {
                    app.stopDrawing({ button: 0 });
                }
                // Reset all touch states
                isTouchPanning = false;
                isMultiTouch = false;
                isPanningOrZooming = false;
                lastTouchDist = null;
            } else if (e.touches.length === 1) {
                // Went from multi-touch to single touch
                if (isPanningOrZooming) {
                    // We were panning/zooming, stop that and don't start drawing
                    isPanningOrZooming = false;
                    isTouchPanning = false;
                    isMultiTouch = false;
                    lastTouchDist = null;
                } else if (app.isDrawing) {
                    // We were drawing with single touch, continue
                    // No action needed, keep drawing
                }
            }
        });

        canvasContainer.addEventListener('touchcancel', function (e) {
            // Cancel all touch interactions
            if (app.isDrawing) app.stopDrawing({ button: 0 });
            isTouchPanning = false;
            isMultiTouch = false;
            isPanningOrZooming = false;
            lastTouchDist = null;
        });

        // --- Stylus support via Pointer Events ---
        if (window.PointerEvent) {
            canvasContainer.addEventListener('pointerdown', function (e) {
                // Don't start drawing if we're in a pan/zoom gesture
                if (isPanningOrZooming) return;
                
                if (e.pointerType === 'pen') {
                    // Stylus pressure
                    if (stylusPressureEnabled && e.pressure) {
                        const min = 1, max = 50;
                        app.brushSize = Math.max(min, Math.round(e.pressure * max));
                        const brushSizeInput = document.getElementById('brushSize');
                        if (brushSizeInput) brushSizeInput.value = app.brushSize;
                        const brushSizeValue = document.getElementById('brushSizeValue');
                        if (brushSizeValue) brushSizeValue.textContent = app.brushSize;
                    }
                    app.startDrawing(e);
                } else if (e.pointerType === 'touch' && e.isPrimary && !isMultiTouch && !isPanningOrZooming) {
                    app.startDrawing(e);
                }
            });
            
            canvasContainer.addEventListener('pointermove', function (e) {
                // Don't draw if we're in a pan/zoom gesture
                if (isPanningOrZooming) return;
                
                if (e.pointerType === 'pen' && app.isDrawing) {
                    // Stylus pressure
                    if (stylusPressureEnabled && e.pressure) {
                        const min = 1, max = 50;
                        app.brushSize = Math.max(min, Math.round(e.pressure * max));
                        const brushSizeInput = document.getElementById('brushSize');
                        if (brushSizeInput) brushSizeInput.value = app.brushSize;
                        const brushSizeValue = document.getElementById('brushSizeValue');
                        if (brushSizeValue) brushSizeValue.textContent = app.brushSize;
                    }
                    app.draw(e);
                } else if (e.pointerType === 'touch' && app.isDrawing && !isMultiTouch && !isPanningOrZooming) {
                    app.draw(e);
                }
            });
            
            canvasContainer.addEventListener('pointerup', function (e) {
                if ((e.pointerType === 'pen' || e.pointerType === 'touch') && app.isDrawing && !isPanningOrZooming) {
                    app.stopDrawing(e);
                }
            });
            
            canvasContainer.addEventListener('pointercancel', function (e) {
                if ((e.pointerType === 'pen' || e.pointerType === 'touch') && app.isDrawing) {
                    app.stopDrawing(e);
                }
                // Reset pan/zoom state on pointer cancel
                if (e.pointerType === 'touch') {
                    isPanningOrZooming = false;
                    isTouchPanning = false;
                    isMultiTouch = false;
                }
            });
        }
    }

    function updateResizerPointerEvents() {
        const anyMenuOpen = !!document.querySelector('.menubar .dropdown.open');
        document.querySelectorAll('.resize-handle').forEach(el => {
            el.style.pointerEvents = anyMenuOpen ? 'none' : '';
        });
    }

    // Call this after zoom, resize, or canvas size changes
    SpriteSpark.prototype.updateZoomLevel = function () {
        originalUpdateZoomLevel.call(this);
        setTimeout(() => {
            updateCanvasContainerScrolling();
            clampCanvasScroll();
        }, 0);
    };

    SpriteSpark.prototype.resizeCanvases = function () {
        originalResizeCanvases.call(this);
        setTimeout(() => {
            updateCanvasContainerScrolling();
            clampCanvasScroll();
        }, 0);
    };

    // Show/hide panels
    if (mobileLeftToggle && leftPanel) {
        mobileLeftToggle.addEventListener('click', () => setMobilePanel(leftPanel));
    }
    if (mobileRightToggle && rightPanel) {
        mobileRightToggle.addEventListener('click', () => setMobilePanel(rightPanel));
    }
    if (mobileBottomToggle && bottomPanel) {
        mobileBottomToggle.addEventListener('click', () => setMobilePanel(bottomPanel));
    }
    // Close panel when clicking outside
    document.addEventListener('click', (e) => {
        if (document.body.classList.contains('mobile-mode')) {
            if (
                !e.target.closest('.panel.mobile-open') &&
                !e.target.closest('.mobile-panel-toggle')
            ) {
                closeMobilePanels();
            }
        }
    });

    // Toolbar button to toggle mobile/desktop mode
    if (toggleMobileMode) {
        toggleMobileMode.addEventListener('click', () => {
            if (document.body.classList.contains('mobile-mode')) {
                document.body.classList.remove('mobile-mode');
                document.body.classList.add('desktop-mode');
                closeMobilePanels();
            } else {
                document.body.classList.add('mobile-mode');
                document.body.classList.remove('desktop-mode');
                closeMobilePanels();
            }
        });
    }

    // Add stylus pressure option to the Drawing Options group (right panel)
    const drawingOptions = document.querySelector('.drawing-options');
    if (drawingOptions && !document.getElementById('stylusPressureCheckbox')) {
        const stylusOption = document.createElement('label');
        stylusOption.innerHTML = `
            <input type="checkbox" id="stylusPressureCheckbox">
            Stylus Pressure for Brush Size
        `;
        drawingOptions.appendChild(stylusOption);
        document.getElementById('stylusPressureCheckbox').addEventListener('change', e => {
            stylusPressureEnabled = e.target.checked;
        });
    }

    // Helper: get distance between two touches
    function getTouchDist(touches) {
        if (touches.length < 2) return 0;
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // Helper: get midpoint between two touches
    function getTouchMid(touches) {
        if (touches.length < 2) return { x: 0, y: 0 };
        return {
            x: (touches[0].clientX + touches[1].clientX) / 2,
            y: (touches[0].clientY + touches[1].clientY) / 2
        };
    }

    // Touch start
    if (canvasContainer) {
        canvasContainer.addEventListener('touchstart', function (e) {
            if (e.touches.length === 2) {
                // Two finger: pan/zoom
                isTouchPanning = true;
                isMultiTouch = true;
                lastTouchDist = getTouchDist(e.touches);
                lastTouchZoom = parseFloat(zoomInput.value);
                const mid = getTouchMid(e.touches);
                touchPanStart.x = mid.x;
                touchPanStart.y = mid.y;
                touchScrollStart.left = canvasContainer.scrollLeft;
                touchScrollStart.top = canvasContainer.scrollTop;
            } else if (e.touches.length === 1 && !isMultiTouch) {
                // Single finger: drawing (only if not multitouch)
                const touch = e.touches[0];
                // Simulate mouse event for drawing
                const fakeEvent = {
                    button: 0,
                    clientX: touch.clientX,
                    clientY: touch.clientY,
                    ctrlKey: false,
                    preventDefault: () => { },
                    pointerType: touch.touchType || 'touch',
                    pressure: touch.force || 0.5 // fallback for browsers without force
                };
                // If stylus and pressure enabled, set brush size
                if (
                    stylusPressureEnabled &&
                    (touch.touchType === 'stylus' || fakeEvent.pointerType === 'pen' || fakeEvent.pointerType === 'stylus')
                ) {
                    const min = 1, max = 50;
                    app.brushSize = Math.max(min, Math.round((fakeEvent.pressure || 0.5) * max));
                    const brushSizeInput = document.getElementById('brushSize');
                    if (brushSizeInput) brushSizeInput.value = app.brushSize;
                    const brushSizeValue = document.getElementById('brushSizeValue');
                    if (brushSizeValue) brushSizeValue.textContent = app.brushSize;
                }
                app.startDrawing(fakeEvent);
            }
        }, { passive: false });

        // Touch move
        canvasContainer.addEventListener('touchmove', function (e) {
            if (e.touches.length === 2 && isTouchPanning) {
                // Pan and zoom
                const mid = getTouchMid(e.touches);
                // Pan
                const dx = mid.x - touchPanStart.x;
                const dy = mid.y - touchPanStart.y;
                canvasContainer.scrollLeft = touchScrollStart.left - dx;
                canvasContainer.scrollTop = touchScrollStart.top - dy;
                // Zoom
                const dist = getTouchDist(e.touches);
                if (lastTouchDist && Math.abs(dist - lastTouchDist) > 2) {
                    let scale = dist / lastTouchDist;
                    let newZoom = Math.max(0.5, Math.min(8, lastTouchZoom * scale));
                    zoomInput.value = Math.round(newZoom * 100) / 100;
                    app.updateZoomLevel();
                }
                e.preventDefault();
            } else if (e.touches.length === 1 && app.isDrawing && !isMultiTouch) {
                // Drawing (only if not multitouch)
                const touch = e.touches[0];
                const fakeEvent = {
                    button: 0,
                    clientX: touch.clientX,
                    clientY: touch.clientY,
                    ctrlKey: false,
                    preventDefault: () => { },
                    pointerType: touch.touchType || 'touch',
                    pressure: touch.force || 0.5
                };
                // Stylus pressure
                if (
                    stylusPressureEnabled &&
                    (touch.touchType === 'stylus' || fakeEvent.pointerType === 'pen' || fakeEvent.pointerType === 'stylus')
                ) {
                    const min = 1, max = 50;
                    app.brushSize = Math.max(min, Math.round((fakeEvent.pressure || 0.5) * max));
                    const brushSizeInput = document.getElementById('brushSize');
                    if (brushSizeInput) brushSizeInput.value = app.brushSize;
                    const brushSizeValue = document.getElementById('brushSizeValue');
                    if (brushSizeValue) brushSizeValue.textContent = app.brushSize;
                }
                app.draw(fakeEvent);
                e.preventDefault();
            }
        }, { passive: false });

        // Touch end/cancel
        canvasContainer.addEventListener('touchend', function (e) {
            if (e.touches.length === 0 && app.isDrawing) {
                app.stopDrawing({ button: 0 });
            }
            if (e.touches.length < 2) {
                isTouchPanning = false;
                isMultiTouch = false;
                lastTouchDist = null;
            }
        });

        canvasContainer.addEventListener('touchcancel', function (e) {
            if (app.isDrawing) app.stopDrawing({ button: 0 });
            isTouchPanning = false;
            isMultiTouch = false;
            lastTouchDist = null;
        });

        // --- Stylus support via Pointer Events ---
        if (window.PointerEvent) {
            canvasContainer.addEventListener('pointerdown', function (e) {
                if (e.pointerType === 'pen') {
                    // Stylus pressure
                    if (stylusPressureEnabled && e.pressure) {
                        const min = 1, max = 50;
                        app.brushSize = Math.max(min, Math.round(e.pressure * max));
                        const brushSizeInput = document.getElementById('brushSize');
                        if (brushSizeInput) brushSizeInput.value = app.brushSize;
                        const brushSizeValue = document.getElementById('brushSizeValue');
                        if (brushSizeValue) brushSizeValue.textContent = app.brushSize;
                    }
                    app.startDrawing(e);
                } else if (e.pointerType === 'touch' && e.isPrimary && !isMultiTouch) {
                    app.startDrawing(e);
                }
            });
            canvasContainer.addEventListener('pointermove', function (e) {
                if (e.pointerType === 'pen' && app.isDrawing) {
                    // Stylus pressure
                    if (stylusPressureEnabled && e.pressure) {
                        const min = 1, max = 50;
                        app.brushSize = Math.max(min, Math.round(e.pressure * max));
                        const brushSizeInput = document.getElementById('brushSize');
                        if (brushSizeInput) brushSizeInput.value = app.brushSize;
                        const brushSizeValue = document.getElementById('brushSizeValue');
                        if (brushSizeValue) brushSizeValue.textContent = app.brushSize;
                    }
                    app.draw(e);
                } else if (e.pointerType === 'touch' && app.isDrawing && !isMultiTouch) {
                    app.draw(e);
                }
            });
            canvasContainer.addEventListener('pointerup', function (e) {
                if ((e.pointerType === 'pen' || e.pointerType === 'touch') && app.isDrawing) {
                    app.stopDrawing(e);
                }
            });
            canvasContainer.addEventListener('pointercancel', function (e) {
                if ((e.pointerType === 'pen' || e.pointerType === 'touch') && app.isDrawing) {
                    app.stopDrawing(e);
                }
            });
        }
    }

    // Make menu-item fully clickable for dropdowns - UPDATED VERSION
    document.querySelectorAll('.menubar .menu-item').forEach(item => {
        item.addEventListener('click', function (e) {
            // Check if we clicked on a dropdown item (has data-action)
            const clickedElement = e.target.closest('[data-action]');
            if (clickedElement && clickedElement.closest('.dropdown')) {
                // This is a dropdown item click, let it handle normally
                // Don't prevent the event - let it bubble to handleMenuClick
                return;
            }

            // Check if we clicked inside an open dropdown but not on an action item
            if (e.target.closest('.dropdown')) {
                // Clicking inside dropdown but not on an action - do nothing
                return;
            }

            // This is a menu item click (the actual menu header) - toggle dropdown
            e.stopPropagation();

            // Close all other dropdowns first
            document.querySelectorAll('.menubar .dropdown').forEach(d => {
                if (d !== this.querySelector('.dropdown')) {
                    d.classList.remove('open');
                }
            });

            // Toggle this dropdown
            const dropdown = this.querySelector('.dropdown');
            if (dropdown) {
                dropdown.classList.toggle('open'); // UNCOMMENTED THIS LINE
            }
        });
    });

    // Close dropdowns when clicking outside menubar
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.menubar')) {
            document.querySelectorAll('.menubar .dropdown').forEach(d => d.classList.remove('open'));
        }
    });

    // Toolbar buttons
    document.querySelectorAll('.toolbar .tool-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            const action = btn.getAttribute('data-action');
            if (action) {
                // Simulate menu click for consistency
                app.handleMenuClick({ target: btn, preventDefault: () => { } });
            }
        });
    });

    // Sync toolbar button states with panel collapse buttons
    document.querySelectorAll('.panel-collapse-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const panelType = btn.getAttribute('data-panel');
            const toolbarBtn = document.querySelector(`.panel-toggle-btn[data-panel="${panelType}"]`);
            const panel = document.getElementById(panelType + 'Panel');

            if (toolbarBtn && panel) {
                const isCollapsed = panel.classList.contains('collapsed');
                toolbarBtn.classList.toggle('active', !isCollapsed);
            }
        });
    });

    // Panel toggle buttons functionality
    document.querySelectorAll('.panel-toggle-btn').forEach(btn => {
        const panelType = btn.getAttribute('data-panel');

        // Set initial active state based on panel visibility
        const panel = document.getElementById(panelType + 'Panel');
        if (panel && !panel.classList.contains('collapsed')) {
            btn.classList.add('active');
        }

        btn.addEventListener('click', (e) => {
            e.stopPropagation();

            const isActive = btn.classList.contains('active');

            if (isActive) {
                // Hide panel
                btn.classList.remove('active');
                if (panel) {
                    panel.classList.add('collapsed');
                }
            } else {
                // Show panel
                btn.classList.add('active');
                if (panel) {
                    panel.classList.remove('collapsed');
                }
            }

            // Update layout
            updatePanelLayout(panelType, !isActive);

            // Trigger canvas resize to fit new layout
            setTimeout(() => {
                if (app && app.handleResize) {
                    app.handleResize();
                }
            }, 300); // Wait for transition to complete
        });
    });

    // Force desktop mode always
    document.body.classList.add('desktop-mode');
    document.body.classList.remove('mobile-mode');

    // --- Set pixel perfect to true by default ---
    SpriteSpark.prototype.pixelPerfect = true;

    //adjustMainContentHeight();

    window.addEventListener('resize', () => {
        updateCanvasContainerScrolling();
        clampCanvasScroll();
    });

    document.querySelectorAll('.menubar .menu-item').forEach(item => {
        item.addEventListener('mouseenter', updateResizerPointerEvents);
        item.addEventListener('mouseleave', updateResizerPointerEvents);
    });
    document.addEventListener('click', updateResizerPointerEvents);
});