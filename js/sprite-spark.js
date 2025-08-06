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
        // Initialize object tool
        this.initializeObjectTool();

        // Initialize scene objects manager
        this.sceneObjectsManager = new SceneObjectsManager(this);
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

        // Vector tool properties
        this.vectorPoints = [];
        this.vectorActive = false;
        this.vectorMode = 'path'; // 'path', 'shape', 'bezier'
        this.vectorFill = false;
        this.vectorStroke = 2;
        this.vectorShowPoints = true;
        this.vectorShowHandles = true;
        this.vectorSnapToGrid = false;
        this.isDraggingVectorPoint = false;
        this.draggingVectorPointIndex = -1;
        this.draggingVectorHandle = null; // { pointIndex, handleType: 'in'|'out' }
        this.vectorApplyButton = null;

        // Object tool properties
        this.objectLibrary = []; // Library of available objects
        this.objectInstances = []; // Instances of objects on canvas
        this.selectedObject = null; // Selected object in library
        this.selectedObjectId = null;
        this.selectedObjectInstance = null; // Selected object instance on canvas
        this.isDraggingObject = false;
        this.isResizingObject = false;
        this.isRotatingObject = false;
        this.isSkewingObject = false;
        this.isDraggingRotationHotspot = false;
        this.objectDragOffset = { x: 0, y: 0 };
        this.objectResizeStartData = null;
        this.objectRotateStartData = null;
        this.objectSkewStartData = null;
        this.objectResizeHandle = null;

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

        // AI Drawing properties
        this.aiDrawing = null;
        this.aiDrawingCommands = null;

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

                if (this.currentTool === 'vector') {
                    this.handleVectorRightClick(e);
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

            // Vector tool events
            this.mainCanvas.addEventListener('mousedown', this.handleVectorMouseDown.bind(this));
            this.mainCanvas.addEventListener('mousemove', this.handleVectorMouseMove.bind(this));
            this.mainCanvas.addEventListener('mouseup', this.handleVectorMouseUp.bind(this));

            // Object tool specific events
            //this.mainCanvas.addEventListener('mousedown', this.handleObjectToolMouseDown.bind(this));
            //this.mainCanvas.addEventListener('mousemove', this.handleObjectToolMouseMove.bind(this));
            //this.mainCanvas.addEventListener('mouseup', this.handleObjectToolMouseUp.bind(this));

            this.mainCanvas.addEventListener('touchstart', this.mainCanvasTouchHandler.bind(this), { passive: false });
            this.mainCanvas.addEventListener('touchmove', this.mainCanvasTouchHandler.bind(this), { passive: false });
            this.mainCanvas.addEventListener('touchend', this.mainCanvasTouchHandler.bind(this), { passive: false });
            this.mainCanvas.addEventListener('touchcancel', this.mainCanvasTouchHandler.bind(this), { passive: false });

            // Enhanced touch support for all tools
            this.mainCanvas.addEventListener('touchstart', (e) => {
                e.preventDefault();
                if (e.touches.length === 1) {
                    const touch = e.touches[0];
                    const rect = this.mainCanvas.getBoundingClientRect();
                    const fakeEvent = {
                        button: 0,
                        clientX: touch.clientX,
                        clientY: touch.clientY,
                        ctrlKey: false,
                        preventDefault: () => { },
                        target: this.mainCanvas
                    };

                    // Handle different tools
                    if (this.currentTool === 'rectangle-select' || this.currentTool === 'lasso-select') {
                        this.startDrawing(fakeEvent);
                    } else if (this.currentTool === 'object-tool') {
                        this.handleObjectToolMouseDown(fakeEvent);
                    } else {
                        this.startDrawing(fakeEvent);
                    }
                }
            }, { passive: false });

            this.mainCanvas.addEventListener('touchmove', (e) => {
                e.preventDefault();
                if (e.touches.length === 1) {
                    const touch = e.touches[0];
                    const fakeEvent = {
                        button: 0,
                        clientX: touch.clientX,
                        clientY: touch.clientY,
                        ctrlKey: false,
                        preventDefault: () => { },
                        target: this.mainCanvas
                    };

                    if (this.currentTool === 'object-tool') {
                        this.handleObjectToolMouseMove(fakeEvent);
                    } else {
                        this.draw(fakeEvent);
                    }
                }
            }, { passive: false });

            this.mainCanvas.addEventListener('touchend', (e) => {
                e.preventDefault();
                const fakeEvent = {
                    button: 0,
                    preventDefault: () => { },
                    target: this.mainCanvas
                };

                if (this.currentTool === 'object-tool') {
                    this.handleObjectToolMouseUp(fakeEvent);
                } else {
                    this.stopDrawing(fakeEvent);
                }
            }, { passive: false });
        }

        // Panel resizing
        this.initializePanelResizing();

        // Keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyboard.bind(this));

        // Add keyboard handler for vector tool
        document.addEventListener('keydown', this.handleVectorKeyboard.bind(this));

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

        // Hue control for objects
        const objectHueInput = document.getElementById('objectHue');
        const objectHueValue = document.getElementById('objectHueValue');

        if (objectHueInput && objectHueValue) {
            objectHueInput.addEventListener('input', () => {
                const hueValue = parseFloat(objectHueInput.value);
                objectHueValue.textContent = hueValue + '°';

                // Use the correct property names from the SpriteSpark class
                if (this.selectedObjectInstance) {
                    this.selectedObjectInstance.hue = hueValue;
                    this.updateObjectPropertiesPanel();
                    this.renderCurrentFrameToMainCanvas();
                }
            });
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

        // Initialize AI Drawing
        this.aiDrawing = new AIDrawing(this);
        this.aiDrawingCommands = new AIDrawingCommands(this);

        // AI Drawing controls
        const generateAIArtBtn = document.getElementById('generateAIArt');
        const setApiKeyBtn = document.getElementById('setApiKey');
        const aiPromptInput = document.getElementById('aiPrompt');
        const aiCanvasSizeSelect = document.getElementById('aiCanvasSize');
        const aiArtStyleSelect = document.getElementById('aiArtStyle');
        const aiTemperatureInput = document.getElementById('aiTemperature');
        const aiTemperatureValue = document.getElementById('aiTemperatureValue');

        // Temperature control for AI art
        if (aiTemperatureInput && aiTemperatureValue) {
            aiTemperatureInput.addEventListener('input', (e) => {
                const temperature = parseFloat(e.target.value);
                aiTemperatureValue.textContent = temperature.toFixed(1);
            });
        }

        // AI Animation temperature control
        const aiAnimationTemperatureInput = document.getElementById('aiAnimationTemperature');
        const aiAnimationTemperatureValue = document.getElementById('aiAnimationTemperatureValue');

        if (aiAnimationTemperatureInput && aiAnimationTemperatureValue) {
            aiAnimationTemperatureInput.addEventListener('input', (e) => {
                const temperature = parseFloat(e.target.value);
                aiAnimationTemperatureValue.textContent = temperature.toFixed(1);
            });
        }

        if (generateAIArtBtn) {
            generateAIArtBtn.addEventListener('click', () => {
                const prompt = aiPromptInput.value.trim();
                const size = 0;//parseInt(aiCanvasSizeSelect.value);
                const style = aiArtStyleSelect.value;

                if (!prompt) {
                    alert('Please enter a description of what to draw');
                    return;
                }

                this.generateAIDrawing(prompt, size, style);
            });
        }

        // AI Animation controls
        const generateAIAnimationBtn = document.getElementById('generateAIAnimation');
        const aiAnimationPromptInput = document.getElementById('aiAnimationPrompt');
        const aiAnimationFramesInput = document.getElementById('aiAnimationFrames');
        const aiAnimationStyleSelect = document.getElementById('aiAnimationStyle');

        if (generateAIAnimationBtn) {
            generateAIAnimationBtn.addEventListener('click', () => {
                const prompt = aiAnimationPromptInput.value.trim();
                const frameCount = parseInt(aiAnimationFramesInput.value) || 8;
                const style = aiAnimationStyleSelect.value;

                if (!prompt) {
                    alert('Please enter a description of the animation to create');
                    return;
                }

                if (frameCount < 2 || frameCount > 24) {
                    alert('Frame count must be between 2 and 24');
                    return;
                }

                this.generateAIAnimation(prompt, style, frameCount);
            });
        }

        // CHAT GPT API Key setting
        /*if (setApiKeyBtn) {
            setApiKeyBtn.addEventListener('click', () => {
                const currentKey = localStorage.getItem('openai_api_key');
                const keyPreview = currentKey ? `${currentKey.substring(0, 8)}...` : 'None set';

                const apiKey = prompt(`Enter your OpenAI API key:\n\nCurrent key: ${keyPreview}\n\nYou can get an API key from https://platform.openai.com/api-keys`);
                if (apiKey && apiKey.trim()) {
                    localStorage.setItem('openai_api_key', apiKey.trim());
                    alert('API key saved locally!');
                    this.updateApiKeyButton();
                }
            });
        }*/

        if (setApiKeyBtn) {
            setApiKeyBtn.addEventListener('click', () => {
                const currentKey = localStorage.getItem('gemini_api_key');
                const keyPreview = currentKey ? `${currentKey.substring(0, 8)}...` : 'None set';

                const apiKey = prompt(`Enter your Google Gemini API key:\n\nCurrent key: ${keyPreview}\n\nYou can get a free API key from https://makersuite.google.com/app/apikey`);
                if (apiKey && apiKey.trim()) {
                    localStorage.setItem('gemini_api_key', apiKey.trim());
                    alert('Gemini API key saved locally!');
                    this.updateApiKeyButton();
                }
            });
        }

        // Enhanced object property controls
        const objectSaturation = document.getElementById('objectSaturation');
        const objectSaturationValue = document.getElementById('objectSaturationValue');
        const objectBrightness = document.getElementById('objectBrightness');
        const objectBrightnessValue = document.getElementById('objectBrightnessValue');
        const objectContrast = document.getElementById('objectContrast');
        const objectContrastValue = document.getElementById('objectContrastValue');

        // Drop shadow controls
        const objectDropShadowEnabled = document.getElementById('objectDropShadowEnabled');
        const dropShadowControls = document.getElementById('dropShadowControls');
        const objectShadowX = document.getElementById('objectShadowX');
        const objectShadowXValue = document.getElementById('objectShadowXValue');
        const objectShadowY = document.getElementById('objectShadowY');
        const objectShadowYValue = document.getElementById('objectShadowYValue');
        const objectShadowBlur = document.getElementById('objectShadowBlur');
        const objectShadowBlurValue = document.getElementById('objectShadowBlurValue');
        const objectShadowColor = document.getElementById('objectShadowColor');
        const objectShadowOpacity = document.getElementById('objectShadowOpacity');
        const objectShadowOpacityValue = document.getElementById('objectShadowOpacityValue');

        // Glow controls
        const objectGlowEnabled = document.getElementById('objectGlowEnabled');
        const glowControls = document.getElementById('glowControls');
        const objectGlowSize = document.getElementById('objectGlowSize');
        const objectGlowSizeValue = document.getElementById('objectGlowSizeValue');
        const objectGlowColor = document.getElementById('objectGlowColor');
        const objectGlowIntensity = document.getElementById('objectGlowIntensity');
        const objectGlowIntensityValue = document.getElementById('objectGlowIntensityValue');

        // Saturation control
        if (objectSaturation && objectSaturationValue) {
            objectSaturation.addEventListener('input', () => {
                const saturationValue = parseInt(objectSaturation.value);
                objectSaturationValue.textContent = saturationValue + '%';

                if (this.selectedObjectInstance) {
                    this.selectedObjectInstance.saturation = saturationValue;
                    this.updateObjectPropertiesPanel();
                    this.renderCurrentFrameToMainCanvas();
                }
            });
        }

        // Brightness control
        if (objectBrightness && objectBrightnessValue) {
            objectBrightness.addEventListener('input', () => {
                const brightnessValue = parseInt(objectBrightness.value);
                objectBrightnessValue.textContent = brightnessValue + '%';

                if (this.selectedObjectInstance) {
                    this.selectedObjectInstance.brightness = brightnessValue;
                    this.updateObjectPropertiesPanel();
                    this.renderCurrentFrameToMainCanvas();
                }
            });
        }

        // Contrast control
        if (objectContrast && objectContrastValue) {
            objectContrast.addEventListener('input', () => {
                const contrastValue = parseInt(objectContrast.value);
                objectContrastValue.textContent = contrastValue + '%';

                if (this.selectedObjectInstance) {
                    this.selectedObjectInstance.contrast = contrastValue;
                    this.updateObjectPropertiesPanel();
                    this.renderCurrentFrameToMainCanvas();
                }
            });
        }

        // Drop shadow toggle
        if (objectDropShadowEnabled && dropShadowControls) {
            objectDropShadowEnabled.addEventListener('change', () => {
                const enabled = objectDropShadowEnabled.checked;
                dropShadowControls.style.display = enabled ? 'block' : 'none';

                if (this.selectedObjectInstance) {
                    this.selectedObjectInstance.dropShadow.enabled = enabled;
                    this.renderCurrentFrameToMainCanvas();
                }
            });
        }

        // Drop shadow controls
        const shadowControls = [
            { element: objectShadowX, valueElement: objectShadowXValue, property: 'offsetX', suffix: 'px' },
            { element: objectShadowY, valueElement: objectShadowYValue, property: 'offsetY', suffix: 'px' },
            { element: objectShadowBlur, valueElement: objectShadowBlurValue, property: 'blur', suffix: 'px' },
            { element: objectShadowOpacity, valueElement: objectShadowOpacityValue, property: 'opacity', suffix: '%' }
        ];

        shadowControls.forEach(({ element, valueElement, property, suffix }) => {
            if (element && valueElement) {
                element.addEventListener('input', () => {
                    const value = parseInt(element.value);
                    valueElement.textContent = value + suffix;

                    if (this.selectedObjectInstance) {
                        this.selectedObjectInstance.dropShadow[property] = value;
                        this.renderCurrentFrameToMainCanvas();
                    }
                });
            }
        });

        if (objectShadowColor) {
            objectShadowColor.addEventListener('change', () => {
                if (this.selectedObjectInstance) {
                    this.selectedObjectInstance.dropShadow.color = objectShadowColor.value;
                    this.renderCurrentFrameToMainCanvas();
                }
            });
        }

        // Glow toggle
        if (objectGlowEnabled && glowControls) {
            objectGlowEnabled.addEventListener('change', () => {
                const enabled = objectGlowEnabled.checked;
                glowControls.style.display = enabled ? 'block' : 'none';

                if (this.selectedObjectInstance) {
                    this.selectedObjectInstance.glow.enabled = enabled;
                    this.renderCurrentFrameToMainCanvas();
                }
            });
        }

        // Glow controls
        const glowControlsList = [
            { element: objectGlowSize, valueElement: objectGlowSizeValue, property: 'size', suffix: 'px' },
            { element: objectGlowIntensity, valueElement: objectGlowIntensityValue, property: 'intensity', suffix: '%' }
        ];

        glowControlsList.forEach(({ element, valueElement, property, suffix }) => {
            if (element && valueElement) {
                element.addEventListener('input', () => {
                    const value = parseInt(element.value);
                    valueElement.textContent = value + suffix;

                    if (this.selectedObjectInstance) {
                        this.selectedObjectInstance.glow[property] = value;
                        this.renderCurrentFrameToMainCanvas();
                    }
                });
            }
        });

        if (objectGlowColor) {
            objectGlowColor.addEventListener('change', () => {
                if (this.selectedObjectInstance) {
                    this.selectedObjectInstance.glow.color = objectGlowColor.value;
                    this.renderCurrentFrameToMainCanvas();
                }
            });
        }

        // Add touch support for menubar items
        document.querySelectorAll('.menubar .menu-item').forEach(item => {
            // Mouse events (existing)
            if (!('ontouchstart' in window)) {
                item.addEventListener('click', function (e) {
                    const clickedElement = e.target.closest('[data-action]');
                    if (clickedElement && clickedElement.closest('.dropdown')) {
                        return;
                    }
                    if (e.target.closest('.dropdown')) {
                        return;
                    }
                    e.stopPropagation();
                    document.querySelectorAll('.menubar .dropdown').forEach(d => {
                        if (d !== this.querySelector('.dropdown')) {
                            d.classList.remove('open');
                        }
                    });
                    const dropdown = this.querySelector('.dropdown');
                    if (dropdown) {
                        dropdown.classList.toggle('open');
                    }
                });
            }

            // Touch events for better mobile support
            item.addEventListener('touchstart', function (e) {
                // Prevent click event from firing
                e.preventDefault();

                const clickedElement = e.target.closest('[data-action]');
                if (clickedElement && clickedElement.closest('.dropdown')) {
                    // This is a dropdown item - trigger the action
                    const action = clickedElement.getAttribute('data-action');
                    if (action) {
                        this.handleMenuClick({ target: clickedElement });
                    }
                    // Close dropdown after action
                    document.querySelectorAll('.menubar .dropdown').forEach(d => d.classList.remove('open'));
                    return;
                }

                if (e.target.closest('.dropdown')) {
                    return;
                }

                // Toggle dropdown
                document.querySelectorAll('.menubar .dropdown').forEach(d => {
                    if (d !== this.querySelector('.dropdown')) {
                        d.classList.remove('open');
                    }
                });
                const dropdown = this.querySelector('.dropdown');
                if (dropdown) {
                    dropdown.classList.toggle('open');
                }
            }.bind(this));
        });

        // Update button text on load
        this.updateApiKeyButton();

        // Tool properties
        this.initializeToolProperties();

        // Animation controls
        this.initializeAnimationControls();

        // Canvas resize controls
        this.initializeCanvasResizeControls();
    }

    handleVectorMouseDown(e) {
        if (this.currentTool !== 'vector') return;
        e.preventDefault();

        const rect = this.mainCanvas.getBoundingClientRect();
        let x = Math.floor((e.clientX - rect.left) / this.zoom);
        let y = Math.floor((e.clientY - rect.top) / this.zoom);

        // Snap to grid if enabled
        if (this.vectorSnapToGrid) {
            const gridSize = 10;
            x = Math.round(x / gridSize) * gridSize;
            y = Math.round(y / gridSize) * gridSize;
        }

        // Check if clicking on apply button
        if (this.vectorApplyButton && this.isPointInVectorApplyButton(x, y)) {
            this.applyVector();
            return;
        }

        // Check if clicking on existing point or handle
        for (let i = 0; i < this.vectorPoints.length; i++) {
            const point = this.vectorPoints[i];

            // Check main point
            if (Math.hypot(point.x - x, point.y - y) < 12) {
                this.isDraggingVectorPoint = true;
                this.draggingVectorPointIndex = i;
                return;
            }

            // Check bezier handles if in bezier mode
            if (this.vectorMode === 'bezier' && this.vectorShowHandles) {
                if (point.handleIn && Math.hypot(point.handleIn.x - x, point.handleIn.y - y) < 8) {
                    this.draggingVectorHandle = { pointIndex: i, handleType: 'in' };
                    this.isDraggingVectorPoint = true;
                    return;
                }
                if (point.handleOut && Math.hypot(point.handleOut.x - x, point.handleOut.y - y) < 8) {
                    this.draggingVectorHandle = { pointIndex: i, handleType: 'out' };
                    this.isDraggingVectorPoint = true;
                    return;
                }
            }
        }

        // Add new point
        const newPoint = { x, y };

        // Add bezier handles if in bezier mode
        if (this.vectorMode === 'bezier') {
            newPoint.handleIn = { x: x - 30, y: y };
            newPoint.handleOut = { x: x + 30, y: y };
        }

        this.vectorPoints.push(newPoint);
        this.vectorActive = true;
        this.renderCurrentFrameToMainCanvas();
        this.drawVectorPreview();
    }

    handleVectorMouseMove(e) {
        if (this.currentTool !== 'vector') return;

        if (this.isDraggingVectorPoint && this.draggingVectorPointIndex >= 0) {
            const rect = this.mainCanvas.getBoundingClientRect();
            let x = Math.floor((e.clientX - rect.left) / this.zoom);
            let y = Math.floor((e.clientY - rect.top) / this.zoom);

            // Snap to grid if enabled
            if (this.vectorSnapToGrid) {
                const gridSize = 10;
                x = Math.round(x / gridSize) * gridSize;
                y = Math.round(y / gridSize) * gridSize;
            }

            if (this.draggingVectorHandle) {
                // Moving a bezier handle
                const point = this.vectorPoints[this.draggingVectorHandle.pointIndex];
                if (this.draggingVectorHandle.handleType === 'in') {
                    point.handleIn = { x, y };
                } else {
                    point.handleOut = { x, y };
                }
            } else {
                // Moving a main point
                this.vectorPoints[this.draggingVectorPointIndex] = {
                    ...this.vectorPoints[this.draggingVectorPointIndex],
                    x, y
                };
            }

            this.renderCurrentFrameToMainCanvas();
            this.drawVectorPreview();
        }
    }

    handleVectorMouseUp(e) {
        if (this.currentTool !== 'vector') return;

        this.isDraggingVectorPoint = false;
        this.draggingVectorPointIndex = -1;
        this.draggingVectorHandle = null;
    }

    handleVectorRightClick(e) {
        if (this.currentTool !== 'vector') return;

        const rect = this.mainCanvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / this.zoom);
        const y = Math.floor((e.clientY - rect.top) / this.zoom);

        // Remove point if right-clicking near one
        for (let i = 0; i < this.vectorPoints.length; i++) {
            const point = this.vectorPoints[i];
            if (Math.hypot(point.x - x, point.y - y) < 12) {
                this.vectorPoints.splice(i, 1);
                if (this.vectorPoints.length === 0) {
                    this.vectorActive = false;
                    this.vectorApplyButton = null;
                }
                this.renderCurrentFrameToMainCanvas();
                this.drawVectorPreview();
                return;
            }
        }
    }

    handleVectorKeyboard(e) {
        if (this.currentTool !== 'vector' || !this.vectorActive) return;

        if (e.key === 'Enter') {
            e.preventDefault();
            this.applyVector();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            this.cancelVector();
        }
    }

    drawVectorPreview() {
        if (!this.ctx || this.vectorPoints.length === 0) return;

        this.ctx.save();
        this.ctx.globalAlpha = 0.8;
        this.ctx.strokeStyle = this.primaryColor;
        this.ctx.lineWidth = this.vectorStroke;
        this.ctx.setLineDash([6, 4]);

        // Draw the vector path
        this.drawVectorPath(this.ctx, this.vectorPoints, false);

        this.ctx.setLineDash([]);
        this.ctx.restore();

        // Draw control points and handles
        if (this.vectorShowPoints) {
            this.drawVectorControlPoints();
        }

        // Draw apply button
        if (this.vectorPoints.length > 1) {
            this.drawVectorApplyButton();
        } else {
            this.vectorApplyButton = null;
        }
    }

    drawVectorPath(ctx, points, final = false) {
        if (points.length < 2) return;

        ctx.beginPath();

        if (this.vectorMode === 'bezier' && points.length > 1) {
            // Bezier curve path
            ctx.moveTo(points[0].x, points[0].y);

            for (let i = 1; i < points.length; i++) {
                const prevPoint = points[i - 1];
                const currPoint = points[i];

                ctx.bezierCurveTo(
                    prevPoint.handleOut.x, prevPoint.handleOut.y,
                    currPoint.handleIn.x, currPoint.handleIn.y,
                    currPoint.x, currPoint.y
                );
            }
        } else {
            // Linear path
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }
        }

        // Close path if shape mode
        if (this.vectorMode === 'shape' && points.length > 2) {
            ctx.closePath();
        }

        // Fill if enabled
        if (this.vectorFill && this.vectorMode === 'shape' && points.length > 2) {
            ctx.fillStyle = this.primaryColor;
            ctx.fill();
        }

        // Always stroke
        ctx.stroke();
    }

    drawVectorControlPoints() {
        for (let i = 0; i < this.vectorPoints.length; i++) {
            const point = this.vectorPoints[i];

            // Draw main point
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
            this.ctx.fillStyle = '#ffffff';
            this.ctx.globalAlpha = 0.9;
            this.ctx.fill();
            this.ctx.lineWidth = 2;
            this.ctx.strokeStyle = this.isDraggingVectorPoint && this.draggingVectorPointIndex === i ?
                this.primaryColor : '#333333';
            this.ctx.globalAlpha = 1;
            this.ctx.stroke();

            // Point number
            this.ctx.fillStyle = '#333333';
            this.ctx.font = 'bold 10px sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText((i + 1).toString(), point.x, point.y);
            this.ctx.restore();

            // Draw bezier handles if in bezier mode
            if (this.vectorMode === 'bezier' && this.vectorShowHandles && point.handleIn && point.handleOut) {
                this.ctx.save();
                this.ctx.strokeStyle = '#888888';
                this.ctx.lineWidth = 1;
                this.ctx.setLineDash([2, 2]);

                // Handle lines
                this.ctx.beginPath();
                this.ctx.moveTo(point.x, point.y);
                this.ctx.lineTo(point.handleIn.x, point.handleIn.y);
                this.ctx.moveTo(point.x, point.y);
                this.ctx.lineTo(point.handleOut.x, point.handleOut.y);
                this.ctx.stroke();

                this.ctx.setLineDash([]);

                // Handle points
                [point.handleIn, point.handleOut].forEach(handle => {
                    this.ctx.beginPath();
                    this.ctx.arc(handle.x, handle.y, 4, 0, 2 * Math.PI);
                    this.ctx.fillStyle = '#4CAF50';
                    this.ctx.fill();
                    this.ctx.strokeStyle = '#333333';
                    this.ctx.lineWidth = 1;
                    this.ctx.stroke();
                });

                this.ctx.restore();
            }
        }
    }

    drawVectorApplyButton() {
        const buttonSize = 32;
        const margin = 16;
        const buttonX = this.canvasWidth - buttonSize - margin;
        const buttonY = margin;

        this.vectorApplyButton = {
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

    isPointInVectorApplyButton(x, y) {
        if (!this.vectorApplyButton) return false;
        const btn = this.vectorApplyButton;
        return x >= btn.x && x <= btn.x + btn.size &&
            y >= btn.y && y <= btn.y + btn.size;
    }

    applyVector() {
        if (!this.activeLayerId || this.vectorPoints.length < 2) return;

        this.undoAdd();
        const layer = this.layers.find(l => l.id === this.activeLayerId);
        if (layer) {
            const ctx = layer.canvas.getContext('2d');
            ctx.save();
            ctx.globalAlpha = this.opacity / 100;
            ctx.strokeStyle = this.primaryColor;
            ctx.lineWidth = this.vectorStroke;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            this.drawVectorPath(ctx, this.vectorPoints, true);

            ctx.restore();
        }

        // Clear vector state
        this.vectorPoints = [];
        this.vectorActive = false;
        this.vectorApplyButton = null;
        this.renderCurrentFrameToMainCanvas();
        this.syncGlobalLayersToCurrentFrame();
    }

    cancelVector() {
        this.vectorPoints = [];
        this.vectorActive = false;
        this.vectorApplyButton = null;
        this.renderCurrentFrameToMainCanvas();
    }

    /*updateApiKeyButton() {
        const setApiKeyBtn = document.getElementById('setApiKey');
        const hasApiKey = localStorage.getItem('openai_api_key');

        if (setApiKeyBtn) {
            setApiKeyBtn.textContent = hasApiKey ? 'Update API Key' : 'Set API Key';
            if (hasApiKey) {
                setApiKeyBtn.classList.add('has-key');
            } else {
                setApiKeyBtn.classList.remove('has-key');
            }
        }
    }*/

    updateApiKeyButton() {
        const setApiKeyBtn = document.getElementById('setApiKey');
        const hasApiKey = localStorage.getItem('gemini_api_key');

        if (setApiKeyBtn) {
            setApiKeyBtn.textContent = hasApiKey ? 'Update Gemini API Key' : 'Set Gemini API Key';
            if (hasApiKey) {
                setApiKeyBtn.classList.add('has-key');
            } else {
                setApiKeyBtn.classList.remove('has-key');
            }
        }
    }

    async generateAIDrawing(prompt, size, style) {
        const apiKey = localStorage.getItem('gemini_api_key');
        if (!apiKey) {
            alert('Please set your Gemini API key first');
            return;
        }

        const generateBtn = document.getElementById('generateAIArt');
        const originalText = generateBtn.textContent;
        generateBtn.textContent = 'Generating...';
        generateBtn.disabled = true;

        try {
            const canvasSize = Math.min(this.canvasWidth, this.canvasHeight);

            // Get temperature from UI
            const temperatureInput = document.getElementById('aiTemperature');
            const temperature = temperatureInput ? parseFloat(temperatureInput.value) : 1.5;

            // System prompt: ask for ONLY JavaScript code using ctx for drawing
            const systemPrompt = `
You are a JavaScript canvas drawing professional. Given a prompt, generate ONLY JavaScript code using the 2D canvas context variable "ctx" to draw a ${canvasSize}x${canvasSize} image in the style "${style}".
- Use ctx.fillRect, ctx.beginPath, ctx.arc, ctx.moveTo, ctx.lineTo, ctx.stroke, ctx.fill etc(you should have access to all javascript drawing commands).
- Do not include explanations, just a single code block.
- The variable "ctx" is already defined.
- For text, use ctx.fillText or ctx.strokeText with appropriate font settings. Use a new FontFace if needed and reference the URL of a certain required font.
- You can use external libraries if you dynamically load them in the code first.
Prompt: ${prompt} at ${this.canvasWidth}x${this.canvasHeight}px size, make sure to *CENTER THE MAIN SUBJECT* in ${style} style. generate ONLY the JavaScript code to draw this image.
`;

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: systemPrompt }] }],
                    generationConfig: {
                        temperature: temperature,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 6072,
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`Gemini API error: ${response.status}`);
            }

            const data = await response.json();
            const content = data.candidates[0].content.parts[0].text.trim();

            // Extract code from markdown code block or plain text
            let code = content;
            const codeMatch = content.match(/```(?:javascript)?\s*([\s\S]*?)```/i);
            if (codeMatch) code = codeMatch[1];

            // Get the active layer's context
            if (!this.activeLayerId) throw new Error('No active layer selected');
            const layer = this.layers.find(l => l.id === this.activeLayerId);
            if (!layer) throw new Error('Active layer not found');
            const ctx = layer.canvas.getContext('2d');

            // Optionally clear the layer before drawing
            ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

            // --- NEW: Draw to offscreen canvas first ---
            const offscreen = document.createElement('canvas');
            offscreen.width = this.canvasWidth;
            offscreen.height = this.canvasHeight;
            const offCtx = offscreen.getContext('2d');

            // Run the AI code on the offscreen context
            try {
                new Function('ctx', code)(offCtx);
            } catch (e) {
                throw new Error('Error running AI drawing code: ' + e.message);
            }

            // Now center and scale the offscreen result onto the main layer
            ctx.save();
            ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

            // Calculate scale to fit the canvas
            const scale = Math.min(this.canvasWidth / this.canvasSize, this.canvasHeight / this.canvasSize);
            const dx = (this.canvasWidth - this.canvasSize * scale) / 2;
            const dy = (this.canvasHeight - this.canvasSize * scale) / 2;

            ctx.setTransform(scale, 0, 0, scale, dx, dy);
            ctx.drawImage(offscreen, 0, 0);
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.restore();

            this.syncGlobalLayersToCurrentFrame();
            this.renderCurrentFrameToMainCanvas();

        } catch (error) {
            console.error('AI generation failed:', error);
            this.showNotification(error.message, 'warning');
        } finally {
            generateBtn.textContent = originalText;
            generateBtn.disabled = false;
        }
    }

    createComplexFallbackCommands(size, prompt, style) {
        const commands = [];
        const lowerPrompt = prompt.toLowerCase();

        // Add background elements first
        if (lowerPrompt.includes('grass') || lowerPrompt.includes('ground')) {
            commands.push({
                type: 'rectangle',
                x: 0,
                y: Math.floor(size * 0.8),
                width: size,
                height: Math.floor(size * 0.2),
                filled: true,
                color: '#228B22'
            });
        }

        if (lowerPrompt.includes('sky')) {
            commands.push({
                type: 'rectangle',
                x: 0,
                y: 0,
                width: size,
                height: Math.floor(size * 0.6),
                filled: true,
                color: '#87CEEB'
            });
        }

        // Add main objects
        const centerX = Math.floor(size / 2);
        const centerY = Math.floor(size / 2);
        let mainColor = '#FF0000';

        if (lowerPrompt.includes('blue')) mainColor = '#0000FF';
        else if (lowerPrompt.includes('green')) mainColor = '#00FF00';
        else if (lowerPrompt.includes('yellow')) mainColor = '#FFFF00';
        else if (lowerPrompt.includes('red')) mainColor = '#FF0000';

        if (lowerPrompt.includes('ball') || lowerPrompt.includes('circle')) {
            commands.push({
                type: 'circle',
                x: centerX,
                y: centerY,
                radius: Math.floor(size / 8),
                filled: true,
                color: mainColor
            });
        }

        if (lowerPrompt.includes('tree')) {
            // Simple tree
            commands.push({
                type: 'rectangle',
                x: centerX + size / 4 - 5,
                y: centerY,
                width: 10,
                height: size / 4,
                filled: true,
                color: '#8B4513'
            });
            commands.push({
                type: 'circle',
                x: centerX + size / 4,
                y: centerY - size / 8,
                radius: size / 12,
                filled: true,
                color: '#228B22'
            });
        }

        return commands;
    }

    // Add a new method for realistic fallback commands
    createRealisticFallbackCommands(size, prompt, style) {
        const centerX = Math.floor(size / 2);
        const centerY = Math.floor(size / 2);

        if (style === 'realistic' && prompt.toLowerCase().includes('cat')) {
            // Create a more realistic cat fallback
            return [
                // Body (ellipse)
                { "type": "ellipse", "x": centerX, "y": centerY + size / 6, "radiusX": size / 4, "radiusY": size / 6, "filled": true, "color": "#D2691E" },
                // Head (circle)
                { "type": "circle", "x": centerX, "y": centerY - size / 6, "radius": size / 6, "filled": true, "color": "#DEB887" },
                // Left ear
                { "type": "triangle", "x1": centerX - size / 8, "y1": centerY - size / 4, "x2": centerX - size / 12, "y2": centerY - size / 3, "x3": centerX - size / 20, "y3": centerY - size / 5, "filled": true, "color": "#D2691E" },
                // Right ear
                { "type": "triangle", "x1": centerX + size / 8, "y1": centerY - size / 4, "x2": centerX + size / 12, "y2": centerY - size / 3, "x3": centerX + size / 20, "y3": centerY - size / 5, "filled": true, "color": "#D2691E" },
                // Left eye
                { "type": "circle", "x": centerX - size / 12, "y": centerY - size / 8, "radius": 2, "filled": true, "color": "#228B22" },
                // Right eye
                { "type": "circle", "x": centerX + size / 12, "y": centerY - size / 8, "radius": 2, "filled": true, "color": "#228B22" },
                // Nose
                { "type": "triangle", "x1": centerX - 1, "y1": centerY - size / 20, "x2": centerX + 1, "y2": centerY - size / 20, "x3": centerX, "y3": centerY - size / 30, "filled": true, "color": "#FF69B4" },
                // Mouth
                { "type": "line", "x1": centerX, "y1": centerY - size / 30, "x2": centerX, "y2": centerY, "color": "#000000" },
                // Tail
                { "type": "ellipse", "x": centerX + size / 3, "y": centerY, "radiusX": size / 8, "radiusY": 3, "filled": true, "color": "#D2691E" }
            ];
        } else if (style === 'realistic') {
            // Generic realistic fallback
            const fallbackCommands = this.createFallbackCommands(size, prompt);
            // Add some realistic details
            fallbackCommands.push(
                { "type": "circle", "x": centerX + 2, "y": centerY - 2, "radius": 2, "filled": true, "color": "#FFFFFF" }, // highlight
                { "type": "circle", "x": centerX - 2, "y": centerY + 2, "radius": 1, "filled": true, "color": "#888888" }  // shadow
            );
            return fallbackCommands;
        } else {
            // Use original fallback for other styles
            return this.createFallbackCommands(size, prompt);
        }
    }

    // Add drawing command interpreter
    executeDrawingCommand(ctx, cmd, canvasSize) {
        if (!cmd || typeof cmd !== 'object') {
            console.error('Invalid command format:', cmd);
            throw new Error('Invalid command format');
        }

        // Handle both 'type' and 'command' properties for backward compatibility
        const commandType = cmd.type || cmd.command;
        if (!commandType) {
            console.error('Missing command type:', cmd);
            throw new Error('Missing command type');
        }

        // Clamp coordinates to canvas bounds instead of throwing errors
        const clampCoord = (coord, name) => {
            if (typeof coord !== 'number' || isNaN(coord)) {
                console.warn(`Invalid ${name}: ${coord}, using 0`);
                return 0;
            }
            return Math.max(0, Math.min(coord, canvasSize - 1));
        };

        // Validate color format
        const validateColor = (color) => {
            if (typeof color !== 'string' || !/^#[0-9A-Fa-f]{6}$/.test(color)) {
                console.warn(`Invalid color: ${color}, using black`);
                return '#000000';
            }
            return color;
        };

        ctx.save();

        switch (commandType) {
            case 'circle':
                const circleX = clampCoord(cmd.x, 'x');
                const circleY = clampCoord(cmd.y, 'y');
                const circleColor = validateColor(cmd.color);
                const radius = Math.max(1, Math.min(cmd.radius || 5, canvasSize / 2));

                ctx.beginPath();
                ctx.arc(circleX, circleY, radius, 0, 2 * Math.PI);

                if (cmd.filled) {
                    ctx.fillStyle = circleColor;
                    ctx.fill();
                } else {
                    ctx.strokeStyle = circleColor;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
                break;

            case 'rectangle':
                const rectX = clampCoord(cmd.x, 'x');
                const rectY = clampCoord(cmd.y, 'y');
                const rectColor = validateColor(cmd.color);
                const width = Math.max(1, Math.min(cmd.width || 10, canvasSize - rectX));
                const height = Math.max(1, Math.min(cmd.height || 10, canvasSize - rectY));

                if (cmd.filled) {
                    ctx.fillStyle = rectColor;
                    ctx.fillRect(rectX, rectY, width, height);
                } else {
                    ctx.strokeStyle = rectColor;
                    ctx.lineWidth = 1;
                    ctx.strokeRect(rectX, rectY, width, height);
                }
                break;

            case 'line':
                // Provide default values for missing coordinates
                const lineX1 = clampCoord(cmd.x1 !== undefined ? cmd.x1 : cmd.x || 0, 'x1');
                const lineY1 = clampCoord(cmd.y1 !== undefined ? cmd.y1 : cmd.y || 0, 'y1');
                const lineX2 = clampCoord(cmd.x2 !== undefined ? cmd.x2 : (cmd.x || 0) + 10, 'x2');
                const lineY2 = clampCoord(cmd.y2 !== undefined ? cmd.y2 : (cmd.y || 0) + 10, 'y2');
                const lineColor = validateColor(cmd.color);

                ctx.strokeStyle = lineColor;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(lineX1, lineY1);
                ctx.lineTo(lineX2, lineY2);
                ctx.stroke();
                break;

            case 'ellipse':
                const ellipseX = clampCoord(cmd.x, 'x');
                const ellipseY = clampCoord(cmd.y, 'y');
                const ellipseColor = validateColor(cmd.color);
                const radiusX = Math.max(1, Math.min(cmd.radiusX || 5, canvasSize / 2));
                const radiusY = Math.max(1, Math.min(cmd.radiusY || 5, canvasSize / 2));

                ctx.beginPath();
                ctx.ellipse(ellipseX, ellipseY, radiusX, radiusY, 0, 0, 2 * Math.PI);

                if (cmd.filled) {
                    ctx.fillStyle = ellipseColor;
                    ctx.fill();
                } else {
                    ctx.strokeStyle = ellipseColor;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
                break;

            case 'triangle':
                // Validate that we have all required coordinates
                if (cmd.x1 === undefined || cmd.y1 === undefined ||
                    cmd.x2 === undefined || cmd.y2 === undefined ||
                    cmd.x3 === undefined || cmd.y3 === undefined) {
                    console.warn('Invalid triangle coordinates, skipping:', cmd);
                    return;
                }

                const triX1 = clampCoord(cmd.x1, 'x1');
                const triY1 = clampCoord(cmd.y1, 'y1');
                const triX2 = clampCoord(cmd.x2, 'x2');
                const triY2 = clampCoord(cmd.y2, 'y2');
                const triX3 = clampCoord(cmd.x3, 'x3');
                const triY3 = clampCoord(cmd.y3, 'y3');
                const triColor = validateColor(cmd.color);

                // Validate that the triangle has reasonable size
                const minSize = 5; // Minimum triangle size
                const maxX = Math.max(triX1, triX2, triX3);
                const minX = Math.min(triX1, triX2, triX3);
                const maxY = Math.max(triY1, triY2, triY3);
                const minY = Math.min(triY1, triY2, triY3);

                if ((maxX - minX) < minSize || (maxY - minY) < minSize) {
                    console.warn('Triangle too small, skipping:', cmd);
                    return;
                }

                ctx.beginPath();
                ctx.moveTo(triX1, triY1);
                ctx.lineTo(triX2, triY2);
                ctx.lineTo(triX3, triY3);
                ctx.closePath();

                if (cmd.filled) {
                    ctx.fillStyle = triColor;
                    ctx.fill();
                } else {
                    ctx.strokeStyle = triColor;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
                break;
            case 'vector':
                if (!cmd.points || !Array.isArray(cmd.points) || cmd.points.length < 2) {
                    console.warn('Invalid vector points:', cmd.points);
                    return;
                }

                const mode = cmd.mode || 'path';
                const filled = cmd.filled || false;
                const color = validateColor(cmd.color);
                const strokeWidth = Math.max(1, Math.min(cmd.strokeWidth || 2, 20));

                ctx.save();
                ctx.strokeStyle = color;
                ctx.lineWidth = strokeWidth;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';

                ctx.beginPath();

                if (mode === 'bezier' && cmd.points.length > 2) {
                    // Draw smooth bezier curve through points
                    ctx.moveTo(cmd.points[0].x, cmd.points[0].y);

                    for (let i = 1; i < cmd.points.length; i++) {
                        const prev = cmd.points[i - 1];
                        const curr = cmd.points[i];
                        const next = cmd.points[i + 1] || curr;

                        // Calculate control points for smooth curve
                        const cp1x = prev.x + (curr.x - (cmd.points[i - 2] || prev).x) * 0.2;
                        const cp1y = prev.y + (curr.y - (cmd.points[i - 2] || prev).y) * 0.2;
                        const cp2x = curr.x - (next.x - prev.x) * 0.2;
                        const cp2y = curr.y - (next.y - prev.y) * 0.2;

                        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, curr.x, curr.y);
                    }
                } else {
                    // Draw straight lines
                    ctx.moveTo(cmd.points[0].x, cmd.points[0].y);
                    for (let i = 1; i < cmd.points.length; i++) {
                        ctx.lineTo(cmd.points[i].x, cmd.points[i].y);
                    }
                }

                // Close path if shape mode
                if (mode === 'shape') {
                    ctx.closePath();
                }

                // Fill if requested
                if (filled && mode === 'shape') {
                    ctx.fillStyle = color;
                    ctx.fill();
                }

                // Always stroke
                ctx.stroke();
                ctx.restore();
                break;
            default:
                console.warn(`Unknown command type: ${commandType}`);
        }

        ctx.restore();
    }

    executeDrawingCommands(commands, size) {
        if (!Array.isArray(commands) || commands.length === 0) {
            console.error('Invalid or empty commands array');
            return;
        }

        console.log('Executing commands:', commands); // Debug log

        // Validate commands first
        for (const cmd of commands) {
            if (!cmd || typeof cmd !== 'object' || (!cmd.type && !cmd.command)) {
                console.error('Invalid command format:', cmd);
                return;
            }
        }

        // Get the active layer from the current frame
        if (!this.activeLayerId) {
            console.error('No active layer selected');
            return;
        }

        const layer = this.layers.find(l => l.id === this.activeLayerId);
        if (!layer) {
            console.error('Active layer not found');
            return;
        }

        const ctx = layer.canvas.getContext('2d');

        // Clear the layer first (optional - remove if you want to draw on top)
        // ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);

        // Execute each drawing command directly on the layer
        try {
            for (const cmd of commands) {
                console.log('Executing command:', cmd); // Debug log
                this.executeDrawingCommand(ctx, cmd, size);
            }

            // Sync the changes to the current frame and render
            this.syncGlobalLayersToCurrentFrame();
            this.renderCurrentFrameToMainCanvas();

        } catch (error) {
            console.error('Error executing drawing commands:', error);

            // Create simple fallback
            const fallbackCommands = this.createFallbackCommands(size, 'AI Art');
            console.log('Using fallback commands:', fallbackCommands);

            // Try to execute fallback commands
            try {
                for (const cmd of fallbackCommands) {
                    this.executeDrawingCommand(ctx, cmd, size);
                }
                this.syncGlobalLayersToCurrentFrame();
                this.renderCurrentFrameToMainCanvas();
            } catch (fallbackError) {
                console.error('Even fallback commands failed:', fallbackError);
            }
        }
    }

    createFallbackCommands(size, prompt) {
        const center = Math.floor(size / 2);
        const radius = Math.floor(size / 4);

        // Simple fallback based on prompt keywords
        let color = '#FF0000';
        if (prompt.toLowerCase().includes('blue')) color = '#0000FF';
        else if (prompt.toLowerCase().includes('green')) color = '#00FF00';
        else if (prompt.toLowerCase().includes('yellow')) color = '#FFFF00';

        // Include triangle in fallback options
        const shapes = [
            {
                type: 'circle',
                x: center,
                y: center,
                radius: radius,
                filled: true,
                color: color
            },
            {
                type: 'triangle',
                x1: center,
                y1: center - radius,
                x2: center - radius,
                y2: center + radius,
                x3: center + radius,
                y3: center + radius,
                filled: true,
                color: color
            },
            {
                type: 'rectangle',
                x: center,
                y: center,
                width: this.canvasWidth,
                height: this.canvasHeight,
                filled: true,
                color: color
            }
        ];

        // Return a random shape or the first one based on prompt
        if (prompt.toLowerCase().includes('triangle')) {
            return [shapes[1]];
        } else if (prompt.toLowerCase().includes('square') || prompt.toLowerCase().includes('rectangle')) {
            return [shapes[2]];
        } else {
            return [shapes[0]];
        }
    }

    createVectorFallbackCommands(size, prompt, style) {
        const centerX = Math.floor(size / 2);
        const centerY = Math.floor(size / 2);
        const lowerPrompt = prompt.toLowerCase();

        const commands = [];

        if (lowerPrompt.includes('star')) {
            // Create a star using vector
            const points = [];
            const outerRadius = size / 3;
            const innerRadius = size / 6;

            for (let i = 0; i < 10; i++) {
                const angle = (i * Math.PI) / 5;
                const radius = i % 2 === 0 ? outerRadius : innerRadius;
                points.push({
                    x: centerX + Math.cos(angle) * radius,
                    y: centerY + Math.sin(angle) * radius
                });
            }

            commands.push({
                type: 'vector',
                points: points,
                mode: 'shape',
                filled: true,
                color: '#FFD700',
                strokeWidth: 2
            });
        } else if (lowerPrompt.includes('triangle')) {
            // Create a proper triangle
            const triangleSize = size / 3;
            commands.push({
                type: 'triangle',
                x1: centerX,
                y1: centerY - triangleSize,
                x2: centerX - triangleSize,
                y2: centerY + triangleSize,
                x3: centerX + triangleSize,
                y3: centerY + triangleSize,
                filled: true,
                color: '#FF6B6B'
            });
        } else if (lowerPrompt.includes('wave') || lowerPrompt.includes('curve')) {
            // Create a wave using bezier
            const points = [];
            for (let i = 0; i <= 4; i++) {
                points.push({
                    x: (i * size) / 4,
                    y: centerY + Math.sin(i * Math.PI / 2) * size / 4
                });
            }

            commands.push({
                type: 'vector',
                points: points,
                mode: 'bezier',
                filled: false,
                color: '#0066CC',
                strokeWidth: 3
            });
        } else if (lowerPrompt.includes('house')) {
            // Create a house using vectors
            commands.push({
                type: 'vector',
                points: [
                    { x: centerX - size / 4, y: centerY + size / 4 },
                    { x: centerX - size / 4, y: centerY },
                    { x: centerX, y: centerY - size / 4 },
                    { x: centerX + size / 4, y: centerY },
                    { x: centerX + size / 4, y: centerY + size / 4 }
                ],
                mode: 'shape',
                filled: true,
                color: '#8B4513',
                strokeWidth: 2
            });
        } else {
            // Generic vector shape
            const points = [];
            const radius = size / 3;
            const numPoints = 6;

            for (let i = 0; i < numPoints; i++) {
                const angle = (i * 2 * Math.PI) / numPoints;
                points.push({
                    x: centerX + Math.cos(angle) * radius,
                    y: centerY + Math.sin(angle) * radius
                });
            }

            commands.push({
                type: 'vector',
                points: points,
                mode: 'shape',
                filled: true,
                color: '#FF6B6B',
                strokeWidth: 2
            });
        }

        return commands;
    }

    // Add this simple fallback method
    createSimpleFallback(width, height, prompt) {
        const pixelData = [];

        // Create a simple colored square based on prompt
        let color = '#FF0000'; // Default red

        if (prompt.toLowerCase().includes('blue')) color = '#0000FF';
        else if (prompt.toLowerCase().includes('green')) color = '#00FF00';
        else if (prompt.toLowerCase().includes('yellow')) color = '#FFFF00';
        else if (prompt.toLowerCase().includes('purple')) color = '#FF00FF';
        else if (prompt.toLowerCase().includes('orange')) color = '#FFA500';

        const centerX = Math.floor(width / 2);
        const centerY = Math.floor(height / 2);
        const radius = Math.min(width, height) / 3;

        for (let y = 0; y < height; y++) {
            const row = [];
            for (let x = 0; x < width; x++) {
                // Create a simple circle pattern
                const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
                if (distance < radius) {
                    row.push(color);
                } else {
                    row.push(null);
                }
            }
            pixelData.push(row);
        }

        return pixelData;
    }

    // Add these helper methods to the SpriteSpark class:
    createFallbackPixelArt(width, height, prompt) {
        const pixelData = [];

        // Create a simple pattern based on the prompt
        const colors = this.getFallbackColors(prompt);

        for (let y = 0; y < height; y++) {
            const row = [];
            for (let x = 0; x < width; x++) {
                // Create a simple pattern
                if (prompt.toLowerCase().includes('house')) {
                    row.push(this.getHousePixel(x, y, width, height, colors));
                } else if (prompt.toLowerCase().includes('tree')) {
                    row.push(this.getTreePixel(x, y, width, height, colors));
                } else if (prompt.toLowerCase().includes('cat') || prompt.toLowerCase().includes('animal')) {
                    row.push(this.getAnimalPixel(x, y, width, height, colors));
                } else {
                    // Generic geometric pattern
                    row.push(this.getGenericPixel(x, y, width, height, colors));
                }
            }
            pixelData.push(row);
        }

        return pixelData;
    }

    async generateAIAnimation(prompt, style, frameCount) {
        const apiKey = localStorage.getItem('gemini_api_key');
        if (!apiKey) {
            alert('Please set your Gemini API key first');
            return;
        }

        const generateBtn = document.getElementById('generateAIAnimation');
        const originalText = generateBtn.textContent;
        generateBtn.textContent = 'Analyzing Animation...';
        generateBtn.disabled = true;
        generateBtn.classList.remove('success', 'error');

        try {
            // Get temperature from UI
            const temperatureInput = document.getElementById('aiAnimationTemperature');
            const temperature = temperatureInput ? parseFloat(temperatureInput.value) : 0.7;

            // Clear existing frames and start fresh
            this.frames = [this.createEmptyFrame()];
            this.currentFrame = 0;

            const canvasSize = Math.min(this.canvasWidth, this.canvasHeight);

            // Enhanced frame memory system
            const frameMemory = {
                codes: [], // Store code for each frame
                descriptions: [], // Store AI's description of what it drew
                keyframes: [], // Store important animation states
                animationState: null // Track overall animation progression
            };

            for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
                generateBtn.textContent = `Generating Frame ${frameIndex + 1}/${frameCount}...`;

                // Create new frame if needed
                if (frameIndex >= this.frames.length) {
                    this.addEmptyFrame();
                }
                this.selectFrame(frameIndex);

                // Build context from previous frames
                const contextFrames = this.buildFrameContext(frameMemory, frameIndex, frameCount);

                // Enhanced system prompt with better memory context
                const systemPrompt = `
You are a JavaScript canvas animation god creating frame ${frameIndex + 1} of ${frameCount} for a smooth animation.

ANIMATION CONTEXT:
- Canvas size: ${this.canvasWidth}x${this.canvasHeight}
- Style: "${style}"
- Prompt: "${prompt}"
- Progress: ${((frameIndex / (frameCount - 1)) * 100).toFixed(1)}% through animation. Fit full animation within ${frameCount} frames.

${contextFrames}

REQUIREMENTS:
1. Generate ONLY JavaScript code using the 2D canvas context variable "ctx". ctx is already defined and ready to use.
2. Ensure smooth animation progression from previous frames, relative to frame count
3. Maintain object consistency (size, color, position relativity)
4. Use any movement asked in the prompt, but ensure it fits within the canvas size.
5. Consider the animation timeline (beginning/middle/end)

Use javascript canvas ctx.(already defined) commands. If you wish to utilize fine detail, create a const drawPixel(x, y, color) 
function to draw pixels if you need. Use advanced algorithms if you want to create complex shapes or patterns.

Generate the drawing code for frame ${frameIndex + 1}:`;

                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: systemPrompt }] }],
                        generationConfig: {
                            temperature: temperature, // Lower temperature for more consistent animation
                            topK: 40,
                            topP: 0.9,
                            maxOutputTokens: 6096,
                        }
                    })
                });

                if (!response.ok) {
                    throw new Error(`Gemini API error: ${response.status}`);
                }

                const data = await response.json();
                const content = data.candidates[0].content.parts[0].text.trim();

                // Extract code from markdown code block or plain text
                let code = content;
                const codeMatch = content.match(/```(?:javascript)?\s*([\s\S]*?)```/i);
                if (codeMatch) code = codeMatch[1];

                // Get the active layer's context
                if (!this.activeLayerId) throw new Error('No active layer selected');
                const layer = this.layers.find(l => l.id === this.activeLayerId);
                if (!layer) throw new Error('Active layer not found');
                const ctx = layer.canvas.getContext('2d');

                // Clear the layer before drawing
                ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

                // Run the code with ctx in scope
                try {
                    // eslint-disable-next-line no-new-func
                    new Function('ctx', code)(ctx);
                } catch (e) {
                    throw new Error('Error running AI drawing code: ' + e.message);
                }

                // Store frame information in memory
                frameMemory.codes.push(code);

                // Generate a brief description of the current frame for context
                const frameDescription = await this.generateFrameDescription(code, frameIndex, frameCount, apiKey);
                frameMemory.descriptions.push(frameDescription);

                // Mark keyframes (first, middle, last, and quarter points)
                if (frameIndex === 0 || frameIndex === Math.floor(frameCount / 4) ||
                    frameIndex === Math.floor(frameCount / 2) || frameIndex === Math.floor(3 * frameCount / 4) ||
                    frameIndex === frameCount - 1) {
                    frameMemory.keyframes.push({
                        index: frameIndex,
                        code: code,
                        description: frameDescription
                    });
                }

                this.syncGlobalLayersToCurrentFrame();
                this.renderCurrentFrameToMainCanvas();

                // Small delay to prevent API rate limiting
                if (frameIndex < frameCount - 1) {
                    await new Promise(resolve => setTimeout(resolve, 200));
                }
            }

            // Select first frame when done
            this.selectFrame(0);
            this.updateFramesList();

            generateBtn.textContent = '✓ Animation Complete!';
            generateBtn.classList.add('success');

        } catch (error) {
            console.error('AI animation generation failed:', error);
            generateBtn.textContent = 'Generation Failed';
            generateBtn.classList.add('error');
            this.showNotification(error.message, 'error');
        } finally {
            setTimeout(() => {
                generateBtn.textContent = originalText;
                generateBtn.classList.remove('success', 'error');
                generateBtn.disabled = false;
            }, 3000);
        }
    }

    // Helper method to build context from previous frames
    buildFrameContext(frameMemory, currentIndex, totalFrames) {
        if (currentIndex === 0) {
            return `FIRST FRAME: Set up the initial scene and establish the main elements to be animated.`;
        }

        let context = `PREVIOUS FRAMES CONTEXT:\n`;

        // Always include the immediately previous frame
        if (currentIndex > 0) {
            context += `
PREVIOUS FRAME (${currentIndex}):
Description: ${frameMemory.descriptions[currentIndex - 1] || 'Frame ' + currentIndex}
Code:
${frameMemory.codes[currentIndex - 1]}
`;
        }

        // Include the frame before that for better continuity
        if (currentIndex > 1) {
            context += `
FRAME BEFORE PREVIOUS (${currentIndex - 1}):
Description: ${frameMemory.descriptions[currentIndex - 2] || 'Frame ' + (currentIndex - 1)}
Code (condensed):
${this.condenseCode(frameMemory.codes[currentIndex - 2])}
`;
        }

        // Include relevant keyframes for long-term consistency
        if (frameMemory.keyframes.length > 0) {
            context += `\nKEY ANIMATION POINTS:\n`;
            frameMemory.keyframes.forEach(keyframe => {
                if (keyframe.index < currentIndex) {
                    context += `Frame ${keyframe.index + 1}: ${keyframe.description}\n`;
                }
            });
        }

        // Add animation phase context
        const progress = currentIndex / (totalFrames - 1);
        if (progress < 0.25) {
            context += `\nANIMATION PHASE: Beginning - establish motion and direction`;
        } else if (progress < 0.75) {
            context += `\nANIMATION PHASE: Middle - maintain smooth motion and consistency`;
        } else {
            context += `\nANIMATION PHASE: End - prepare for conclusion or loop`;
        }

        return context;
    }

    // Helper method to generate a brief description of what the frame contains
    async generateFrameDescription(code, frameIndex, totalFrames, apiKey) {
        try {
            const descriptionPrompt = `Analyze this JavaScript canvas drawing code and provide a very brief (1-2 sentences) description of what visual elements it creates and their approximate positions/states. Focus on objects, colors, and motion.

Code:
${code}

Frame ${frameIndex + 1} of ${totalFrames}`;

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: descriptionPrompt }] }],
                    generationConfig: {
                        temperature: 0.2,
                        maxOutputTokens: 100,
                    }
                })
            });

            if (response.ok) {
                const data = await response.json();
                return data.candidates[0].content.parts[0].text.trim();
            }
        } catch (error) {
            console.warn('Failed to generate frame description:', error);
        }

        return `Frame ${frameIndex + 1}: Canvas drawing with various shapes and elements`;
    }

    // Helper method to calculate animation timing and provide pacing guidance
    calculateAnimationTiming(prompt, totalFrames, currentFrame) {
        const progress = currentFrame / (totalFrames - 1);
        const frameProgress = `Frame ${currentFrame + 1}/${totalFrames}`;

        // Analyze the prompt for timing-related keywords and numbers
        const timingAnalysis = this.analyzePromptTiming(prompt, totalFrames, currentFrame);

        let timingInfo = `${frameProgress} (${(progress * 100).toFixed(1)}% complete)\n`;
        timingInfo += timingAnalysis;

        // Add phase-specific guidance
        if (currentFrame === 0) {
            timingInfo += `\n- STARTING FRAME: Establish initial state and begin the action`;
        } else if (currentFrame === totalFrames - 1) {
            timingInfo += `\n- FINAL FRAME: Complete the action and prepare for loop/end`;
        } else {
            const phaseInfo = this.getAnimationPhase(progress);
            timingInfo += `\n- CURRENT PHASE: ${phaseInfo}`;
        }

        return timingInfo;
    }

    // Analyze the prompt for specific timing requirements
    analyzePromptTiming(prompt, totalFrames, currentFrame) {
        const lowerPrompt = prompt.toLowerCase();
        let analysis = "";

        // Extract numbers that might indicate repetitions
        const numbers = prompt.match(/\b(\d+)\b/g);
        const actionWords = ['bounce', 'bounces', 'spin', 'spins', 'rotation', 'rotations', 'jump', 'jumps', 'wave', 'waves', 'pulse', 'pulses', 'beat', 'beats', 'cycle', 'cycles', 'loop', 'loops'];

        // Look for repetitive actions
        let repetitions = null;
        let actionType = null;

        for (const word of actionWords) {
            if (lowerPrompt.includes(word)) {
                actionType = word;
                // Look for numbers near this action word
                const wordIndex = lowerPrompt.indexOf(word);
                const nearbyText = lowerPrompt.substring(Math.max(0, wordIndex - 20), wordIndex + 20);
                const nearbyNumbers = nearbyText.match(/\b(\d+)\b/g);
                if (nearbyNumbers) {
                    repetitions = parseInt(nearbyNumbers[nearbyNumbers.length - 1]);
                }
                break;
            }
        }

        if (repetitions && actionType) {
            // Calculate timing for repetitive actions
            const framesPerAction = totalFrames / repetitions;
            const currentActionNumber = Math.floor(currentFrame / framesPerAction) + 1;
            const frameInCurrentAction = currentFrame % framesPerAction;
            const progressInAction = frameInCurrentAction / framesPerAction;

            analysis += `- ACTION: ${repetitions} ${actionType} across ${totalFrames} frames\n`;
            analysis += `- PACING: ~${framesPerAction.toFixed(1)} frames per ${actionType.replace(/s$/, '')}\n`;
            analysis += `- CURRENT: ${actionType.replace(/s$/, '')} #${currentActionNumber} (${(progressInAction * 100).toFixed(1)}% through this ${actionType.replace(/s$/, '')})\n`;

            // Provide specific guidance for this action phase
            if (actionType.includes('bounce')) {
                if (progressInAction < 0.5) {
                    analysis += `- BOUNCE PHASE: Moving down/compressing (${(progressInAction * 200).toFixed(1)}% to bottom)`;
                } else {
                    analysis += `- BOUNCE PHASE: Moving up/expanding (${((progressInAction - 0.5) * 200).toFixed(1)}% from bottom)`;
                }
            } else if (actionType.includes('spin') || actionType.includes('rotation')) {
                const rotationDegrees = progressInAction * 360;
                analysis += `- ROTATION PHASE: ${rotationDegrees.toFixed(1)}° of this rotation`;
            } else if (actionType.includes('wave') || actionType.includes('pulse')) {
                const wavePhase = Math.sin(progressInAction * Math.PI * 2);
                analysis += `- WAVE PHASE: ${wavePhase > 0 ? 'Expanding' : 'Contracting'} (${(Math.abs(wavePhase) * 100).toFixed(1)}% intensity)`;
            }
        } else {
            // General animation timing without specific repetitions
            analysis += `- PACING: Smooth progression across ${totalFrames} frames\n`;
            analysis += `- TIMING: Distribute the entire action evenly across all frames`;

            // Look for movement/transition words
            if (lowerPrompt.includes('move') || lowerPrompt.includes('travel') || lowerPrompt.includes('go')) {
                const progressPercent = (currentFrame / (totalFrames - 1)) * 100;
                analysis += `\n- MOVEMENT: ${progressPercent.toFixed(1)}% of the journey complete`;
            }
        }

        return analysis;
    }

    // Get animation phase description
    getAnimationPhase(progress) {
        if (progress < 0.1) return "Early beginning - establish motion";
        if (progress < 0.25) return "Beginning phase - build momentum";
        if (progress < 0.5) return "First half - main action development";
        if (progress < 0.75) return "Second half - continue main action";
        if (progress < 0.9) return "Late phase - prepare for conclusion";
        return "Near end - finalize action";
    }

    // Helper method to condense code for context (remove comments, extra whitespace)
    condenseCode(code) {
        return code
            .split('\n')
            .map(line => line.trim())
            .filter(line => line && !line.startsWith('//'))
            .join('; ')
            .substring(0, 200) + (code.length > 200 ? '...' : '');
    }

    createEnhancedFallbackAnalysis(prompt, canvasSize) {
        const lowerPrompt = prompt.toLowerCase();
        const centerX = Math.floor(canvasSize / 2);
        const centerY = Math.floor(canvasSize / 2);

        let analysis = {
            mainObject: {
                type: "object",
                description: "animated object",
                shape: "circle",
                size: Math.floor(canvasSize / 8),
                color: "#FF6B6B",
                startPosition: { x: centerX, y: centerY },
                endPosition: { x: centerX, y: centerY }
            },
            animation: {
                type: "slide",
                physics: "linear",
                details: "smooth movement",
                speed: "medium"
            },
            background: {
                type: "none",
                color: "#ffffff"
            }
        };

        // Detect specific objects and animations
        if (lowerPrompt.includes('ball') && lowerPrompt.includes('bounce')) {
            analysis.mainObject = {
                type: "ball",
                description: "bouncing ball",
                shape: "circle",
                size: Math.floor(canvasSize / 10),
                color: "#FF4444",
                startPosition: { x: canvasSize * 0.2, y: canvasSize * 0.3 },
                endPosition: { x: canvasSize * 0.8, y: canvasSize * 0.3 }
            };
            analysis.animation = {
                type: "bounce",
                physics: "gravity",
                details: "arc motion with decreasing bounce height",
                speed: "medium"
            };
            analysis.background = {
                type: "ground",
                color: "#228B22"
            };
        } else if (lowerPrompt.includes('car') || lowerPrompt.includes('drive')) {
            analysis.mainObject = {
                type: "car",
                description: "simple car",
                shape: "rectangle",
                size: Math.floor(canvasSize / 8),
                color: "#0066CC",
                startPosition: { x: -canvasSize * 0.1, y: canvasSize * 0.7 },
                endPosition: { x: canvasSize * 1.1, y: canvasSize * 0.7 }
            };
            analysis.animation = {
                type: "slide",
                physics: "linear",
                details: "horizontal movement across screen",
                speed: "medium"
            };
            analysis.background = {
                type: "ground",
                color: "#666666"
            };
        } else if (lowerPrompt.includes('bird') || lowerPrompt.includes('fly')) {
            analysis.mainObject = {
                type: "bird",
                description: "flying bird",
                shape: "ellipse",
                size: Math.floor(canvasSize / 12),
                color: "#4169E1",
                startPosition: { x: canvasSize * 0.1, y: canvasSize * 0.3 },
                endPosition: { x: canvasSize * 0.9, y: canvasSize * 0.4 }
            };
            analysis.animation = {
                type: "wave",
                physics: "momentum",
                details: "wavy flight pattern with gentle up-down motion",
                speed: "medium"
            };
            analysis.background = {
                type: "sky",
                color: "#87CEEB"
            };
        }

        return analysis;
    }

    createFallbackAnalysis(prompt, canvasSize) {
        const lowerPrompt = prompt.toLowerCase();
        const centerX = Math.floor(canvasSize / 2);
        const centerY = Math.floor(canvasSize / 2);

        if (lowerPrompt.includes('person') || lowerPrompt.includes('walking') || lowerPrompt.includes('human')) {
            return {
                objects: [{
                    type: "person",
                    name: "walking person",
                    bodyParts: [
                        { name: "head", shape: "circle", relativeSize: 0.15, attachPoint: "center", color: "#FFDBAC" },
                        { name: "torso", shape: "rectangle", relativeSize: 0.4, attachPoint: "center", color: "#4169E1" },
                        { name: "leftArm", shape: "line", relativeSize: 0.3, attachPoint: "top", color: "#FFDBAC" },
                        { name: "rightArm", shape: "line", relativeSize: 0.3, attachPoint: "top", color: "#FFDBAC" },
                        { name: "leftLeg", shape: "line", relativeSize: 0.4, attachPoint: "bottom", color: "#4169E1" },
                        { name: "rightLeg", shape: "line", relativeSize: 0.4, attachPoint: "bottom", color: "#4169E1" }
                    ],
                    startPosition: { x: canvasSize * 0.2, y: centerY },
                    endPosition: { x: canvasSize * 0.8, y: centerY },
                    animation: {
                        type: "walk",
                        speed: "medium",
                        physics: "momentum",
                        details: "alternating leg movement with arm swing"
                    }
                }],
                scene: {
                    background: "simple ground",
                    environment: "ground"
                }
            };
        } else if (lowerPrompt.includes('ball') || lowerPrompt.includes('bounce')) {
            return {
                objects: [{
                    type: "ball",
                    name: "bouncing ball",
                    bodyParts: [
                        { name: "sphere", shape: "circle", relativeSize: 1.0, attachPoint: "center", color: "#FF4444" }
                    ],
                    startPosition: { x: canvasSize * 0.2, y: canvasSize * 0.3 },
                    endPosition: { x: canvasSize * 0.8, y: canvasSize * 0.3 },
                    animation: {
                        type: "bounce",
                        speed: "medium",
                        physics: "gravity",
                        details: "decreasing bounce height with forward movement"
                    }
                }],
                scene: {
                    background: "ground",
                    environment: "ground"
                }
            };
        }

        // Generic fallback
        return {
            objects: [{
                type: "object",
                name: "animated object",
                bodyParts: [
                    { name: "body", shape: "circle", relativeSize: 1.0, attachPoint: "center", color: "#FF6B6B" }
                ],
                startPosition: { x: centerX, y: centerY },
                endPosition: { x: centerX, y: centerY },
                animation: {
                    type: "simple",
                    speed: "medium",
                    physics: "none",
                    details: "basic movement"
                }
            }],
            scene: {
                background: "none",
                environment: "none"
            }
        };
    }

    async generateSpecificAnimation(analysis, frameCount, canvasSize, style, apiKey, generateBtn) {
        let previousFrameDescription = null;
        let previousFrameCommands = null;

        // Generate each frame based on the analysis AND previous frame
        for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
            generateBtn.textContent = `Generating Frame ${frameIndex + 1}/${frameCount}...`;

            // Create new frame if needed
            if (frameIndex >= this.frames.length) {
                this.addEmptyFrame();
            }

            // Select the frame and generate
            this.selectFrame(frameIndex);

            const frameCommands = await this.generateFrameFromAnalysisWithContext(
                analysis,
                frameIndex,
                frameCount,
                canvasSize,
                style,
                apiKey,
                previousFrameDescription,
                previousFrameCommands
            );

            // Apply the drawing
            this.executeDrawingCommands(frameCommands, canvasSize);

            // Store this frame's info for the next frame
            previousFrameDescription = this.createFrameDescription(frameCommands, frameIndex, analysis);
            previousFrameCommands = frameCommands;

            // Small delay to prevent API rate limiting
            await new Promise(resolve => setTimeout(resolve, 200));
        }
    }

    async generateFrameFromAnalysisWithContext(analysis, frameIndex, totalFrames, canvasSize, style, apiKey, previousFrameDescription, previousFrameCommands) {
        const progress = frameIndex / (totalFrames - 1);

        // IMPROVED: Much more specific frame generation prompt
        const framePrompt = `Generate frame ${frameIndex + 1} of ${totalFrames} for this animation:

OBJECT TO ANIMATE:
- Type: ${analysis.mainObject.type}
- Shape: ${analysis.mainObject.shape} 
- Size: ${analysis.mainObject.size}px
- Color: ${analysis.mainObject.color}
- Animation: ${analysis.animation.type} (${analysis.animation.details})

FRAME PROGRESS: ${Math.round(progress * 100)}% complete
Canvas: ${canvasSize}x${canvasSize}

POSITION CALCULATION:
Start: (${analysis.mainObject.startPosition.x}, ${analysis.mainObject.startPosition.y})
End: (${analysis.mainObject.endPosition.x}, ${analysis.mainObject.endPosition.y})

${this.getAnimationPositionInstructions(analysis.animation.type, progress)}

BACKGROUND:
${analysis.background.type !== 'none' ? `Add ${analysis.background.type} background with color ${analysis.background.color}` : 'No background needed'}

CONSISTENCY RULES:
- Use EXACT same object size and color as specified
- Keep object properties identical across all frames
- Only change position/rotation based on animation type

Return JSON array of drawing commands:
[
  ${analysis.background.type !== 'none' ? '{"type": "rectangle", "x": 0, "y": 200, "width": ' + canvasSize + ', "height": 40, "filled": true, "color": "' + analysis.background.color + '"},' : ''}
  {"type": "${analysis.mainObject.shape}", "x": CALCULATED_X, "y": CALCULATED_Y, ${analysis.mainObject.shape === 'circle' ? '"radius"' : '"width"'}: ${analysis.mainObject.size}, "filled": true, "color": "${analysis.mainObject.color}"}
]

Calculate the exact position for this frame based on progress ${Math.round(progress * 100)}%:`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: framePrompt }] }],
                generationConfig: {
                    temperature: 0.1,
                    topK: 5,
                    topP: 0.5,
                    maxOutputTokens: 512,
                }
            })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.candidates[0].content.parts[0].text.trim();

        try {
            const commands = JSON.parse(content);
            return commands;
        } catch (parseError) {
            const jsonMatch = content.match(/\[[\s\S]*\]/);
            if (!jsonMatch) {
                console.error('No valid JSON commands found, using fallback');
                return this.createFrameFromAnalysisFallback(analysis, frameIndex, totalFrames, canvasSize, previousFrameCommands);
            }
            return JSON.parse(jsonMatch[0]);
        }
    }

    getAnimationPositionInstructions(animationType, progress) {
        switch (animationType) {
            case 'bounce':
                return `BOUNCE MOTION:
- X position: linear interpolation from start to end
- Y position: Add parabolic arc (use sine wave for bounce)
- Formula: Y = startY + sin(progress * π * bounces) * bounceHeight
- Decrease bounce height as ball moves forward`;

            case 'slide':
                return `SLIDE MOTION:
- Linear interpolation from start to end position
- X = startX + (endX - startX) * progress
- Y = startY + (endY - startY) * progress`;

            case 'wave':
                return `WAVE MOTION:
- X position: linear interpolation from start to end
- Y position: Add sine wave for up-down motion
- Formula: Y = baseY + sin(progress * π * 4) * waveHeight`;

            case 'rotate':
                return `ROTATION MOTION:
- Keep object at center position
- Add rotation property or draw rotated shape
- Rotation = progress * 360 degrees`;

            case 'orbit':
                return `ORBITAL MOTION:
- X = centerX + cos(progress * 2π) * orbitRadius
- Y = centerY + sin(progress * 2π) * orbitRadius`;

            case 'fall':
                return `FALLING MOTION:
- X position: may sway slightly (sin wave)
- Y position: accelerating downward
- Use gravity physics: Y = startY + 0.5 * gravity * time²`;

            default:
                return `LINEAR MOTION:
- Simple linear interpolation from start to end position`;
        }
    }

    createFrameDescription(commands, frameIndex, analysis) {
        if (!commands || commands.length === 0) return 'Empty frame';

        // Create a concise description of what's in this frame
        const objectPositions = {};

        commands.forEach(cmd => {
            if (cmd.type === 'circle' && cmd.radius > 5) {
                objectPositions['main_object'] = `${cmd.type} at (${cmd.x},${cmd.y}) radius ${cmd.radius} color ${cmd.color}`;
            } else if (cmd.type === 'rectangle' && cmd.width > 10) {
                objectPositions['object'] = `${cmd.type} at (${cmd.x},${cmd.y}) size ${cmd.width}x${cmd.height} color ${cmd.color}`;
            }
        });

        const positions = Object.values(objectPositions).join(', ');
        return `Frame ${frameIndex + 1}: ${positions}`;
    }

    findMainObjectInCommands(commands, objectIndex = 0) {
        // Find the main object (largest circle or rectangle) from previous commands
        const objects = commands.filter(cmd =>
            (cmd.type === 'circle' && cmd.radius > 5) ||
            (cmd.type === 'rectangle' && cmd.width > 10)
        );

        if (objects.length > objectIndex) {
            return objects[objectIndex];
        }

        return objects[0] || null;
    }

    createFrameFromAnalysisFallback(analysis, frameIndex, totalFrames, canvasSize, previousCommands = null) {
        const progress = frameIndex / (totalFrames - 1);
        const commands = [];

        // Draw scene background if specified
        if (analysis.scene.environment === 'ground') {
            commands.push({
                type: 'rectangle',
                x: 0,
                y: canvasSize * 0.8,
                width: canvasSize,
                height: canvasSize * 0.2,
                filled: true,
                color: '#228B22'
            });
        }

        // Animate each object with consistency
        analysis.objects.forEach((obj, objIndex) => {
            let currentX = obj.startPosition.x + (obj.endPosition.x - obj.startPosition.x) * progress;
            let currentY = obj.startPosition.y;

            // If we have previous commands, try to maintain consistency
            if (previousCommands && frameIndex > 0) {
                const prevMainObject = this.findMainObjectInCommands(previousCommands, objIndex);
                if (prevMainObject) {
                    // Use previous object's properties for consistency
                    obj.bodyParts.forEach((part, partIndex) => {
                        const baseSize = prevMainObject.radius || prevMainObject.width || canvasSize / 8;

                        // Apply animation movement
                        if (obj.animation.type === 'bounce') {
                            const bouncePhase = (frameIndex % (totalFrames / 3)) / (totalFrames / 3);
                            const bounceHeight = Math.sin(bouncePhase * Math.PI) * (canvasSize / 4) * (1 - progress * 0.5);
                            currentY = obj.startPosition.y + bounceHeight;
                        }

                        // Create drawing command with consistent properties
                        if (part.shape === 'circle') {
                            commands.push({
                                type: 'circle',
                                x: Math.round(currentX),
                                y: Math.round(currentY),
                                radius: Math.round(baseSize / 2),
                                filled: true,
                                color: prevMainObject.color || part.color
                            });
                        }
                    });
                    return; // Skip the default generation below
                }
            }

            // Default generation if no previous frame context
            if (obj.animation.type === 'bounce') {
                const bouncePhase = (frameIndex % (totalFrames / 3)) / (totalFrames / 3);
                const bounceHeight = Math.sin(bouncePhase * Math.PI) * (canvasSize / 4) * (1 - progress * 0.5);
                currentY = obj.startPosition.y + bounceHeight;
            }

            obj.bodyParts.forEach((part, partIndex) => {
                const baseSize = canvasSize / 8;
                const partSize = baseSize * part.relativeSize;

                if (part.shape === 'circle') {
                    commands.push({
                        type: 'circle',
                        x: Math.round(currentX),
                        y: Math.round(currentY),
                        radius: Math.round(partSize / 2),
                        filled: true,
                        color: part.color
                    });
                }
            });
        });

        return commands;
    }

    async generateAnimationPlan(prompt, frameCount, canvasSize, style, apiKey) {
        const planPrompt = `You are an animation director creating a plan for a ${frameCount}-frame animation.

Animation Request: "${prompt}"
Canvas Size: ${this.canvasWidth}x${this.canvasHeight}
Style: ${style}

Create a detailed animation plan that breaks down the movement/changes across ${frameCount} frames.
Consider:
- What should happen in each frame
- How objects should move, rotate, or change
- Timing and pacing
- Key poses/positions
- Secondary animation elements

Return a JSON object with this structure:
{
  "concept": "Brief description of the overall animation",
  "keyframes": [
    {
      "frame": 0,
      "description": "Detailed description of what should be drawn in this frame",
      "changes": "What has changed since the previous frame"
    }
  ],
  "timing": "Description of the timing and pacing"
}

Focus on creating smooth, believable motion appropriate for the style.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: planPrompt }] }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 2048,
                }
            })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.candidates[0].content.parts[0].text.trim();

        try {
            // Try to extract JSON from the response
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
        } catch (e) {
            console.warn('Could not parse animation plan JSON, using fallback');
        }

        // Fallback plan
        return this.createFallbackAnimationPlan(prompt, frameCount);
    }

    createComplexFallbackPlan(prompt, frameCount, canvasSize) {
        const centerX = Math.floor(canvasSize / 2);
        const centerY = Math.floor(canvasSize / 2);

        const sceneElements = [];
        const frames = [];

        // Analyze prompt for common elements
        const lowerPrompt = prompt.toLowerCase();

        // Add background if mentioned
        if (lowerPrompt.includes('grass') || lowerPrompt.includes('ground')) {
            sceneElements.push({
                type: "background",
                name: "grass",
                shape: "rectangle",
                primaryColor: "#228B22",
                secondaryColor: "#32CD32",
                baseSize: canvasSize / 4,
                layer: 0,
                animation: { type: "none", startX: 0, startY: canvasSize * 0.75, endX: 0, endY: canvasSize * 0.75, amplitude: 0 }
            });
        }

        if (lowerPrompt.includes('sky')) {
            sceneElements.push({
                type: "background",
                name: "sky",
                shape: "rectangle",
                primaryColor: "#87CEEB",
                secondaryColor: "#4169E1",
                baseSize: canvasSize,
                layer: 0,
                animation: { type: "none", startX: 0, startY: 0, endX: 0, endY: 0, amplitude: 0 }
            });
        }

        // Add main animated object
        let mainColor = "#FF4444";
        let mainShape = "circle";

        if (lowerPrompt.includes('red')) mainColor = "#FF0000";
        if (lowerPrompt.includes('blue')) mainColor = "#0000FF";
        if (lowerPrompt.includes('green')) mainColor = "#00FF00";
        if (lowerPrompt.includes('yellow')) mainColor = "#FFFF00";

        if (lowerPrompt.includes('square') || lowerPrompt.includes('box')) mainShape = "rectangle";

        sceneElements.push({
            type: "animated",
            name: "main_object",
            shape: mainShape,
            primaryColor: mainColor,
            secondaryColor: mainColor,
            baseSize: Math.floor(canvasSize / 8),
            layer: 2,
            animation: {
                type: "bounce",
                startX: centerX,
                startY: centerY - canvasSize / 4,
                endX: centerX,
                endY: centerY + canvasSize / 4,
                amplitude: canvasSize / 4
            }
        });

        // Generate frame data
        for (let i = 0; i < frameCount; i++) {
            const progress = i / (frameCount - 1);
            const frameElements = [];

            sceneElements.forEach(element => {
                let x = element.animation.startX;
                let y = element.animation.startY;
                let width = element.baseSize;
                let height = element.baseSize;

                if (element.animation.type === "bounce") {
                    y = element.animation.startY + Math.sin(progress * Math.PI * 2) * element.animation.amplitude;
                } else if (element.animation.type === "slide") {
                    x = element.animation.startX + (element.animation.endX - element.animation.startX) * progress;
                }

                // Adjust for shape
                if (element.shape === "rectangle" && element.name === "grass") {
                    width = canvasSize;
                    height = canvasSize / 4;
                } else if (element.shape === "rectangle" && element.name === "sky") {
                    width = canvasSize;
                    height = canvasSize * 0.75;
                }

                frameElements.push({
                    name: element.name,
                    x: Math.floor(x),
                    y: Math.floor(y),
                    width: Math.floor(width),
                    height: Math.floor(height),
                    rotation: 0
                });
            });

            frames.push({
                frame: i,
                elements: frameElements
            });
        }

        return { sceneElements, frames };
    }

    createConsistentFallbackPlan(prompt, frameCount, canvasSize) {
        const centerX = Math.floor(canvasSize / 2);
        const centerY = Math.floor(canvasSize / 2);
        const baseSize = Math.floor(canvasSize / 8);

        // Determine object type and colors based on prompt
        let objectType = "circle";
        let primaryColor = "#FF4444";
        let secondaryColor = "#AA2222";

        if (prompt.toLowerCase().includes('ball')) {
            objectType = "circle";
            primaryColor = "#FF4444";
        } else if (prompt.toLowerCase().includes('square') || prompt.toLowerCase().includes('box')) {
            objectType = "rectangle";
            primaryColor = "#4444FF";
        }

        const frames = [];
        for (let i = 0; i < frameCount; i++) {
            const progress = i / (frameCount - 1);
            const bounceY = centerY + Math.sin(progress * Math.PI * 4) * (canvasSize / 6);

            frames.push({
                frame: i,
                x: centerX,
                y: Math.floor(bounceY),
                description: `Frame ${i + 1}: ${objectType} at position (${centerX}, ${Math.floor(bounceY)})`
            });
        }

        return {
            object: {
                type: objectType,
                baseSize: baseSize,
                primaryColor: primaryColor,
                secondaryColor: secondaryColor,
                shape: objectType
            },
            animation: {
                type: "bounce",
                centerX: centerX,
                centerY: centerY,
                range: canvasSize / 6
            },
            frames: frames
        };
    }

    async generateConsistentAnimationFrame(prompt, plan, frameIndex, totalFrames, previousFrame, baseObject, canvasSize, style, apiKey) {
        const currentFramePlan = plan.frames[frameIndex] || plan.frames[plan.frames.length - 1];

        const systemPrompt = `You are creating frame ${frameIndex + 1} of ${totalFrames} for a CONSISTENT multi-element animation.

SCENE PLAN:
${JSON.stringify(plan.sceneElements, null, 2)}

FRAME ${frameIndex + 1} POSITIONS:
${JSON.stringify(currentFramePlan.elements, null, 2)}

CRITICAL RULES:
1. Draw ALL elements in the scene, in layer order (0=back, higher=front)
2. Use EXACTLY the colors and shapes specified in the scene plan
3. Use EXACTLY the positions specified for this frame
4. Keep consistent sizing and appearance
5. Canvas: ${canvasSize}x${canvasSize}

Drawing commands available:
- circle(x, y, radius, filled, color)
- rectangle(x, y, width, height, filled, color)  
- ellipse(x, y, radiusX, radiusY, filled, color)
- triangle(x1, y1, x2, y2, x3, y3, filled, color)
- line(x1, y1, x2, y2, color)

Return ONLY a JSON array of drawing commands for ALL scene elements:
[
  // Background elements first (layer 0)
  {"type": "rectangle", "x": 0, "y": 200, "width": 320, "height": 40, "filled": true, "color": "#228B22"},
  // Foreground elements last (higher layers)
  {"type": "circle", "x": 160, "y": 120, "radius": 20, "filled": true, "color": "#FF0000"}
]

Draw frame ${frameIndex + 1}/${totalFrames} with all ${plan.sceneElements.length} scene elements.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: systemPrompt }] }],
                generationConfig: {
                    temperature: 0.1,
                    topK: 10,
                    topP: 0.7,
                    maxOutputTokens: 1024,
                }
            })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.candidates[0].content.parts[0].text.trim();

        try {
            const commands = JSON.parse(content);
            return commands;
        } catch (parseError) {
            const jsonMatch = content.match(/\[[\s\S]*\]/);
            if (!jsonMatch) {
                console.error('No valid JSON commands found, using fallback');
                return this.createComplexFallbackFrame(plan, frameIndex, canvasSize);
            }
            return JSON.parse(jsonMatch[0]);
        }
    }

    createComplexFallbackFrame(plan, frameIndex, canvasSize) {
        const commands = [];
        const framePlan = plan.frames[frameIndex] || plan.frames[0];

        // Sort elements by layer (background first)
        const sortedElements = [...plan.sceneElements].sort((a, b) => a.layer - b.layer);

        sortedElements.forEach(element => {
            const frameElement = framePlan.elements.find(e => e.name === element.name);
            if (!frameElement) return;

            if (element.shape === 'circle') {
                commands.push({
                    type: 'circle',
                    x: frameElement.x,
                    y: frameElement.y,
                    radius: element.baseSize,
                    filled: true,
                    color: element.primaryColor
                });
            } else if (element.shape === 'rectangle') {
                commands.push({
                    type: 'rectangle',
                    x: frameElement.x,
                    y: frameElement.y,
                    width: frameElement.width,
                    height: frameElement.height,
                    filled: true,
                    color: element.primaryColor
                });
            } else if (element.shape === 'ellipse') {
                commands.push({
                    type: 'ellipse',
                    x: frameElement.x,
                    y: frameElement.y,
                    radiusX: frameElement.width / 2,
                    radiusY: frameElement.height / 2,
                    filled: true,
                    color: element.primaryColor
                });
            }
        });

        return commands;
    }

    createConsistentFallbackFrame(plan, frameIndex) {
        const framePlan = plan.frames[frameIndex] || plan.frames[0];

        if (plan.object.shape === 'circle') {
            return [{
                type: 'circle',
                x: framePlan.x,
                y: framePlan.y,
                radius: plan.object.baseSize,
                filled: true,
                color: plan.object.primaryColor
            }];
        } else if (plan.object.shape === 'rectangle') {
            return [{
                type: 'rectangle',
                x: framePlan.x - plan.object.baseSize,
                y: framePlan.y - plan.object.baseSize,
                width: plan.object.baseSize * 2,
                height: plan.object.baseSize * 2,
                filled: true,
                color: plan.object.primaryColor
            }];
        }

        // Default to circle
        return [{
            type: 'circle',
            x: framePlan.x,
            y: framePlan.y,
            radius: plan.object.baseSize,
            filled: true,
            color: plan.object.primaryColor
        }];
    }

    extractBaseObjectDescription(commands, prompt) {
        if (!commands || commands.length === 0) return null;

        const mainCommand = commands[0];
        return `${mainCommand.type} with color ${mainCommand.color}, size ${mainCommand.radius || mainCommand.width || 'unknown'}px, for "${prompt}"`;
    }

    extractFrameDescription(commands, frameIndex) {
        if (!commands || commands.length === 0) return null;

        const mainCommand = commands[0];
        return `Frame ${frameIndex + 1}: ${mainCommand.type} at (${mainCommand.x}, ${mainCommand.y}) with color ${mainCommand.color}`;
    }

    createFallbackAnimationPlan(prompt, frameCount) {
        const keyframes = [];
        for (let i = 0; i < frameCount; i++) {
            keyframes.push({
                frame: i,
                description: `Frame ${i + 1} of ${frameCount} for: ${prompt}`,
                changes: i === 0 ? "Initial frame" : "Continue animation sequence"
            });
        }

        return {
            concept: `${frameCount}-frame animation of: ${prompt}`,
            keyframes: keyframes,
            timing: "Evenly paced animation"
        };
    }

    async describePreviousFrame(frameIndex) {
        // Get the visual content of the previous frame for context
        const frame = this.frames[frameIndex];
        if (!frame || !frame.layers) return null;

        // Create a simplified description of what's currently drawn
        // This is a basic implementation - could be enhanced with actual image analysis
        const activeLayerCount = frame.layers.filter(l => l.isVisible !== false).length;
        const hasContent = frame.layers.some(layer => {
            if (!layer.canvas || !layer.isVisible) return false;

            // Check if canvas has any non-transparent pixels
            const ctx = layer.canvas.getContext('2d');
            const imageData = ctx.getImageData(0, 0, layer.canvas.width, layer.canvas.height);
            const data = imageData.data;

            for (let i = 3; i < data.length; i += 4) {
                if (data[i] > 0) return true; // Found non-transparent pixel
            }
            return false;
        });

        return {
            frameNumber: frameIndex,
            hasContent: hasContent,
            layerCount: activeLayerCount,
            description: `Frame ${frameIndex + 1} with ${hasContent ? 'drawn content' : 'no content'}`
        };
    }

    async generateAnimationFrame(prompt, animationPlan, frameIndex, totalFrames, previousFrame, canvasSize, style, apiKey) {
        const currentKeyframe = animationPlan.keyframes.find(kf => kf.frame === frameIndex) ||
            animationPlan.keyframes[Math.min(frameIndex, animationPlan.keyframes.length - 1)];

        const systemPrompt = `You are creating frame ${frameIndex + 1} of ${totalFrames} for an animation.

Overall Animation: ${animationPlan.concept}
This Frame Description: ${currentKeyframe.description}
Changes from Previous: ${currentKeyframe.changes}

${previousFrame ? `Previous Frame Context: ${previousFrame.description}` : 'This is the first frame.'}

Create a ${canvasSize}x${canvasSize} ${style} image using ONLY these drawing commands:

Available commands:
- circle(x, y, radius, filled, color)
- rectangle(x, y, width, height, filled, color)  
- line(x1, y1, x2, y2, color)
- ellipse(x, y, radiusX, radiusY, filled, color)
- triangle(x1, y1, x2, y2, x3, y3, filled, color)

Rules:
- Coordinates must be within 0 to ${canvasSize - 1}
- Colors must be hex format like "#FF0000"
- filled parameter is true/false for shapes
- Return ONLY a JSON array of commands, no explanations
- Use 10-25 commands for good detail
- Consider the animation timing and progression
- Make smooth transitions between frames
- Keep consistent object positions/colors unless they should change

${style === 'realistic' ? 'Use realistic colors, proportions, and layering for depth.' : 'Use clear, bold shapes and colors appropriate for the style.'}

Progress: Frame ${frameIndex + 1}/${totalFrames} (${Math.round((frameIndex + 1) / totalFrames * 100)}% complete)

Create drawing commands for this animation frame:`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: systemPrompt }] }],
                generationConfig: {
                    temperature: 0.4, // Lower temperature for more consistent animation
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 3072,
                }
            })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.candidates[0].content.parts[0].text.trim();

        try {
            // Try to parse JSON directly
            const commands = JSON.parse(content);
            return commands;
        } catch (parseError) {
            // Try to extract JSON from response
            const jsonMatch = content.match(/\[[\s\S]*\]/);
            if (!jsonMatch) {
                console.error('No valid JSON commands found in frame response');
                return this.createFallbackFrameCommands(canvasSize, frameIndex, totalFrames);
            }
            return JSON.parse(jsonMatch[0]);
        }
    }

    createFallbackFrameCommands(canvasSize, frameIndex, totalFrames) {
        const centerX = Math.floor(canvasSize / 2);
        const centerY = Math.floor(canvasSize / 2);

        // Create a simple animated circle that moves and changes color
        const progress = frameIndex / (totalFrames - 1);
        const x = Math.floor(centerX + Math.sin(progress * Math.PI * 2) * canvasSize / 4);
        const y = Math.floor(centerY + Math.cos(progress * Math.PI * 2) * canvasSize / 4);
        const hue = Math.floor(progress * 360);
        const color = `hsl(${hue}, 70%, 50%)`;

        // Convert HSL to hex (simplified)
        const hexColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');

        return [
            {
                type: 'circle',
                x: x,
                y: y,
                radius: Math.floor(canvasSize / 8),
                filled: true,
                color: hexColor
            }
        ];
    }

    showNotification(message, type = 'info') {
        // Create a temporary notification element
        const notification = document.createElement('div');
        let bgColor = '#4caf50';
        if (type === 'warning') bgColor = '#ff9800';
        if (type === 'error') bgColor = '#e53935';

        notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px 12px 20px;
        background: ${bgColor};
        color: white;
        border-radius: 4px;
        z-index: 10000;
        box-shadow: 0 4px 24px rgba(0,0,0,0.35);
        font-size: 14px;
        max-width: 340px;
        display: flex;
        align-items: center;
        gap: 12px;
        flex-direction: column;
        border: 2.5px solid #fff;
    `;

        // Message text
        const msgDiv = document.createElement('div');
        msgDiv.textContent = 'AI Generation Failed: ' + message;
        notification.appendChild(msgDiv);

        // If error, add Google search link
        if (type === 'error') {
            const link = document.createElement('a');
            link.href = 'https://www.google.com/search?q=' + encodeURIComponent(message);
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.textContent = 'Search this error on Google';
            link.style.cssText = `
            color: #fff;
            text-decoration: underline;
            font-size: 13px;
            margin-top: 4px;
            opacity: 0.85;
        `;
            link.onmouseenter = () => link.style.opacity = '1';
            link.onmouseleave = () => link.style.opacity = '0.85';
            notification.appendChild(link);
        }

        // Add close button
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '×';
        closeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 1.3em;
        cursor: pointer;
        margin-left: 8px;
        opacity: 0.7;
        transition: opacity 0.2s;
        align-self: flex-end;
    `;
        closeBtn.onclick = () => {
            if (notification.parentNode) notification.parentNode.removeChild(notification);
        };
        closeBtn.onmouseenter = () => closeBtn.style.opacity = '1';
        closeBtn.onmouseleave = () => closeBtn.style.opacity = '0.7';

        notification.appendChild(closeBtn);

        document.body.appendChild(notification);

        // Remove after 12 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 12000);
    }

    getFallbackColors(prompt) {
        const lowerPrompt = prompt.toLowerCase();

        if (lowerPrompt.includes('house')) {
            return ['#8B4513', '#FF0000', '#00FF00', '#0000FF', '#FFFF00']; // Brown, red, green, blue, yellow
        } else if (lowerPrompt.includes('tree')) {
            return ['#228B22', '#8B4513', '#90EE90', '#006400']; // Green, brown, light green, dark green
        } else if (lowerPrompt.includes('cat') || lowerPrompt.includes('animal')) {
            return ['#FFA500', '#000000', '#FFFFFF', '#FF69B4']; // Orange, black, white, pink
        } else {
            return ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF']; // Basic colors
        }
    }

    getHousePixel(x, y, width, height, colors) {
        const centerX = Math.floor(width / 2);
        const centerY = Math.floor(height / 2);

        // Simple house shape
        if (y < height * 0.3 && Math.abs(x - centerX) < width * 0.3) {
            return colors[1]; // Roof (red)
        } else if (y >= height * 0.3 && y < height * 0.8 && Math.abs(x - centerX) < width * 0.25) {
            return colors[0]; // Wall (brown)
        } else if (y >= height * 0.5 && y < height * 0.7 && Math.abs(x - centerX - width * 0.1) < width * 0.05) {
            return colors[3]; // Door (blue)
        }
        return null; // Transparent
    }

    getTreePixel(x, y, width, height, colors) {
        const centerX = Math.floor(width / 2);

        // Simple tree shape
        if (y < height * 0.7 && Math.abs(x - centerX) < width * 0.3) {
            return colors[0]; // Leaves (green)
        } else if (y >= height * 0.7 && Math.abs(x - centerX) < width * 0.1) {
            return colors[1]; // Trunk (brown)
        }
        return null; // Transparent
    }

    getAnimalPixel(x, y, width, height, colors) {
        const centerX = Math.floor(width / 2);
        const centerY = Math.floor(height / 2);

        // Simple cat/animal shape
        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        if (distance < Math.min(width, height) * 0.3) {
            return colors[0]; // Body
        } else if (y < height * 0.4 && Math.abs(x - centerX) < width * 0.2) {
            return colors[0]; // Head
        }
        return null; // Transparent
    }

    getGenericPixel(x, y, width, height, colors) {
        // Create a simple geometric pattern
        const pattern = (x + y) % colors.length;
        if ((x % 3 === 0 && y % 3 === 0) || (x % 5 === 0 && y % 5 === 0)) {
            return colors[pattern];
        }
        return null;
    }

    adjustPixelDataDimensions(pixelData, targetWidth, targetHeight) {
        const adjusted = [];

        for (let y = 0; y < targetHeight; y++) {
            const row = [];
            for (let x = 0; x < targetWidth; x++) {
                // Try to get pixel from original data, or use null
                const sourceY = Math.min(y, pixelData.length - 1);
                const sourceRow = pixelData[sourceY];

                if (Array.isArray(sourceRow) && x < sourceRow.length) {
                    row.push(sourceRow[x]);
                } else {
                    row.push(null);
                }
            }
            adjusted.push(row);
        }

        return adjusted;
    }

    drawAIPixelData(pixelData) {
        if (!this.activeLayerId) {
            alert('Please select a layer first');
            return;
        }

        this.undoAdd();
        const layer = this.layers.find(l => l.id === this.activeLayerId);
        if (!layer) return;

        const ctx = layer.canvas.getContext('2d');

        // Calculate starting position to center the AI art on the canvas
        const artWidth = pixelData[0].length;
        const artHeight = pixelData.length;
        const startX = Math.floor((this.canvasWidth - artWidth) / 2);
        const startY = Math.floor((this.canvasHeight - artHeight) / 2);

        // Draw each pixel
        for (let y = 0; y < pixelData.length; y++) {
            for (let x = 0; x < pixelData[y].length; x++) {
                const color = pixelData[y][x];
                // Skip null/transparent pixels
                if (color && color !== 'transparent' && color !== '#00000000' && color !== null) {
                    ctx.fillStyle = color;
                    ctx.fillRect(startX + x, startY + y, 1, 1);
                }
            }
        }

        this.syncGlobalLayersToCurrentFrame();
        this.renderCurrentFrameToMainCanvas();

        // Show success message
        const generateBtn = document.getElementById('generateAIArt');
        const originalText = generateBtn.textContent;
        generateBtn.textContent = '✓ Generated!';
        generateBtn.style.backgroundColor = 'var(--success-color)';

        setTimeout(() => {
            generateBtn.textContent = originalText;
            generateBtn.style.backgroundColor = '';
        }, 2000);
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

        // Vector tool controls
        const vectorMode = document.getElementById('vectorMode');
        const vectorFill = document.getElementById('vectorFill');
        const vectorStroke = document.getElementById('vectorStroke');
        const vectorStrokeValue = document.getElementById('vectorStrokeValue');
        const vectorShowPoints = document.getElementById('vectorShowPoints');
        const vectorShowHandles = document.getElementById('vectorShowHandles');
        const vectorSnapToGrid = document.getElementById('vectorSnapToGrid');

        if (vectorMode) {
            vectorMode.value = this.vectorMode;
            vectorMode.addEventListener('change', (e) => {
                this.vectorMode = e.target.value;
                if (this.vectorActive) {
                    this.renderCurrentFrameToMainCanvas();
                    this.drawVectorPreview();
                }
            });
        }

        if (vectorFill) {
            vectorFill.checked = this.vectorFill;
            vectorFill.addEventListener('change', (e) => {
                this.vectorFill = e.target.checked;
                if (this.vectorActive) {
                    this.renderCurrentFrameToMainCanvas();
                    this.drawVectorPreview();
                }
            });
        }

        if (vectorStroke && vectorStrokeValue) {
            vectorStroke.value = this.vectorStroke;
            vectorStrokeValue.textContent = this.vectorStroke;
            vectorStroke.addEventListener('input', (e) => {
                this.vectorStroke = parseInt(e.target.value, 10);
                vectorStrokeValue.textContent = this.vectorStroke;
                if (this.vectorActive) {
                    this.renderCurrentFrameToMainCanvas();
                    this.drawVectorPreview();
                }
            });
        }

        if (vectorShowPoints) {
            vectorShowPoints.checked = this.vectorShowPoints;
            vectorShowPoints.addEventListener('change', (e) => {
                this.vectorShowPoints = e.target.checked;
                if (this.vectorActive) {
                    this.renderCurrentFrameToMainCanvas();
                    this.drawVectorPreview();
                }
            });
        }

        if (vectorShowHandles) {
            vectorShowHandles.checked = this.vectorShowHandles;
            vectorShowHandles.addEventListener('change', (e) => {
                this.vectorShowHandles = e.target.checked;
                if (this.vectorActive) {
                    this.renderCurrentFrameToMainCanvas();
                    this.drawVectorPreview();
                }
            });
        }

        if (vectorSnapToGrid) {
            vectorSnapToGrid.checked = this.vectorSnapToGrid;
            vectorSnapToGrid.addEventListener('change', (e) => {
                this.vectorSnapToGrid = e.target.checked;
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

        const convertSelectionToObjectBtn = document.getElementById('convertSelectionToObjectBtn');
        if (convertSelectionToObjectBtn) {
            convertSelectionToObjectBtn.onclick = () => this.convertSelectionToObject();
        }

        // Re-query toolButtons after adding new ones
        const selectionOptions = document.getElementById('selectionOptions');
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

                if (selectionOptions) {
                    selectionOptions.style.display = (
                        this.currentTool === 'rectangle-select' ||
                        this.currentTool === 'lasso-select'
                    ) ? 'block' : 'none';
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
                const vectorOptions = document.getElementById('vectorOptions');
                // Show/hide object tool section
                const objectToolSection = document.getElementById('objectToolSection');

                if (floodFillOptions) {
                    floodFillOptions.style.display = (this.currentTool === 'bucket') ? 'block' : 'none';
                }
                if (splineOptions) {
                    splineOptions.style.display = (this.currentTool === 'spline') ? 'block' : 'none';
                }
                if (vectorOptions) {
                    vectorOptions.style.display = (this.currentTool === 'vector') ? 'block' : 'none';
                }

                if (objectToolSection) {
                    objectToolSection.style.display = (this.currentTool === 'object-tool') ? 'block' : 'none';
                }

                // Clear spline state when switching tools
                if (this.currentTool !== 'spline' && this.splineActive) {
                    this.splinePoints = [];
                    this.splineActive = false;
                    this.splineApplyButton = null;
                    this.renderCurrentFrameToMainCanvas();
                }
                if (this.currentTool !== 'vector' && this.vectorActive) {
                    this.vectorPoints = [];
                    this.vectorActive = false;
                    this.vectorApplyButton = null;
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

        // Refresh object layer dropdown
        this.refreshObjectLayerDropdown();
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

        // Refresh object layer dropdown
        this.refreshObjectLayerDropdown();
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
            startIndex = 0;
            while (startIndex < this.frames.length && this.frames[startIndex].isActive === false) {
                startIndex++;
            }
        }

        this.currentFrameIndex = startIndex;
        const frameDuration = 1000 / this.fps;

        // Enhanced animation with sub-frame object interpolation for smoother tweening
        let subFrameTime = 0;
        const subFrameSteps = 4; // Render objects at 4x frame rate for smoother motion
        const subFrameDuration = frameDuration / subFrameSteps;

        this.animationInterval = setInterval(() => {
            // Calculate sub-frame progress for smooth object tweening
            const subFrameProgress = subFrameTime / frameDuration;
            const currentDisplayFrame = this.currentFrameIndex + subFrameProgress;

            // Only render if current frame is active
            if (this.frames[this.currentFrameIndex] && this.frames[this.currentFrameIndex].isActive !== false) {
                // For smooth object animation, we'll render with sub-frame interpolation
                this.renderFrameToLivePreviewWithSubFrame(this.currentFrameIndex, subFrameProgress);
            }

            subFrameTime += subFrameDuration;

            // When we've completed a full frame duration, move to next frame
            if (subFrameTime >= frameDuration) {
                subFrameTime = 0;

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
            }
        }, subFrameDuration);
    }

    renderFrameToLivePreviewWithSubFrame(frameIndex, subFrameProgress) {
        if (!this.livePreviewCtx || !this.livePreviewCanvas || this.frames.length === 0) return;
        this.livePreviewCtx.clearRect(0, 0, this.livePreviewCanvas.width, this.livePreviewCanvas.height);

        const frameData = this.frames[frameIndex];
        if (!frameData || !frameData.layers) return;

        // Calculate scale factor from main canvas to preview canvas
        const scaleX = this.livePreviewCanvas.width / this.canvasWidth;
        const scaleY = this.livePreviewCanvas.height / this.canvasHeight;

        // Disable antialiasing for pixel perfect preview
        this.livePreviewCtx.imageSmoothingEnabled = false;
        this.livePreviewCtx.webkitImageSmoothingEnabled = false;
        this.livePreviewCtx.mozImageSmoothingEnabled = false;
        this.livePreviewCtx.msImageSmoothingEnabled = false;

        // Draw onion skin frames first (if enabled) - ONLY PREVIOUS FRAMES
        if (this.showOnionSkin && this.frames.length > 1) {
            for (let offset = -this.onionSkinFrames; offset < 0; offset++) {
                const onionFrameIdx = frameIndex + offset;
                if (onionFrameIdx < 0 || onionFrameIdx >= this.frames.length) continue;

                const onionFrame = this.frames[onionFrameIdx];
                const distance = Math.abs(offset);
                const maxDistance = this.onionSkinFrames;
                const alpha = 0.3 * (1 - (distance - 1) / maxDistance);

                // Draw onion skin layers
                for (let i = 0; i < onionFrame.layers.length; i++) {
                    const layer = onionFrame.layers[i];
                    if (layer.isVisible !== false && layer.canvas instanceof HTMLCanvasElement) {
                        this.livePreviewCtx.globalAlpha = alpha;
                        this.livePreviewCtx.globalCompositeOperation = 'source-over';
                        this.livePreviewCtx.drawImage(layer.canvas, 0, 0, this.livePreviewCanvas.width, this.livePreviewCanvas.height);
                    }
                }

                // Draw onion skin objects
                this.renderOnionSkinObjectsInPreview(onionFrameIdx, alpha, scaleX, scaleY);
            }
        }

        // Draw current frame layers
        for (let i = 0; i < frameData.layers.length; i++) {
            const layer = frameData.layers[i];
            if (layer.isVisible !== false && layer.canvas instanceof HTMLCanvasElement) {
                this.livePreviewCtx.globalAlpha = layer.opacity / 100 || 1;
                this.livePreviewCtx.globalCompositeOperation = layer.blendMode || 'source-over';
                this.livePreviewCtx.drawImage(layer.canvas, 0, 0, this.livePreviewCanvas.width, this.livePreviewCanvas.height);
            }
        }

        // Reset composition settings for objects
        this.livePreviewCtx.globalAlpha = 1.0;
        this.livePreviewCtx.globalCompositeOperation = 'source-over';

        // Draw objects with sub-frame interpolation for smooth tweening
        const lpCtx = this.livePreviewCtx;
        for (const obj of this.objectInstances) {
            if (obj.visible === false) continue;

            // Check if the object's layer is visible
            if (obj.layerId) {
                const objectLayer = this.layers.find(l => l.id === obj.layerId);
                if (objectLayer && !objectLayer.isVisible) {
                    continue;
                }
            }

            // Get interpolated transform with sub-frame smoothing
            let transform;
            if (obj.tween && subFrameProgress > 0 && frameIndex < this.frames.length - 1) {
                const currentTransform = obj.getTransformAt(frameIndex);
                const nextTransform = obj.getTransformAt(frameIndex + 1);

                transform = {
                    x: this.lerp(currentTransform.x, nextTransform.x, subFrameProgress),
                    y: this.lerp(currentTransform.y, nextTransform.y, subFrameProgress),
                    scaleX: this.lerp(currentTransform.scaleX || 1, nextTransform.scaleX || 1, subFrameProgress),
                    scaleY: this.lerp(currentTransform.scaleY || 1, nextTransform.scaleY || 1, subFrameProgress),
                    angle: this.lerpAngle(currentTransform.angle, nextTransform.angle, subFrameProgress),
                    flipX: currentTransform.flipX || false,
                    flipY: currentTransform.flipY || false,
                    skewX: this.lerp(currentTransform.skewX || 0, nextTransform.skewX || 0, subFrameProgress),
                    skewY: this.lerp(currentTransform.skewY || 0, nextTransform.skewY || 0, subFrameProgress),
                    image: currentTransform.image || nextTransform.image
                };
            } else {
                transform = obj.getTransformAt(frameIndex);
            }

            if (!transform.image) continue;

            // Calculate scaled position and size for preview
            const scaledX = transform.x * scaleX;
            const scaledY = transform.y * scaleY;

            this.livePreviewCtx.save();

            // FIX: Disable antialiasing for pixel perfect preview
            this.livePreviewCtx.imageSmoothingEnabled = false;
            this.livePreviewCtx.webkitImageSmoothingEnabled = false;
            this.livePreviewCtx.mozImageSmoothingEnabled = false;
            this.livePreviewCtx.msImageSmoothingEnabled = false;

            // Apply drop shadow first (behind the object)
            if (obj.dropShadow && obj.dropShadow.enabled && transform.image) {
                this.livePreviewCtx.save();
                this.livePreviewCtx.globalAlpha = (obj.dropShadow.opacity / 100) * (obj.alpha || 1);
                this.livePreviewCtx.shadowColor = obj.dropShadow.color;
                this.livePreviewCtx.shadowBlur = obj.dropShadow.blur * Math.min(scaleX, scaleY);
                this.livePreviewCtx.shadowOffsetX = obj.dropShadow.offsetX * scaleX;
                this.livePreviewCtx.shadowOffsetY = obj.dropShadow.offsetY * scaleY;

                this.livePreviewCtx.translate(scaledX, scaledY);
                this.livePreviewCtx.rotate(transform.angle * Math.PI / 180);
                this.livePreviewCtx.scale(
                    (transform.scaleX || 1) * scaleX * (transform.flipX ? -1 : 1),
                    (transform.scaleY || 1) * scaleY * (transform.flipY ? -1 : 1)
                );

                if (transform.skewX || transform.skewY) {
                    const skewXRad = (transform.skewX || 0) * Math.PI / 180;
                    const skewYRad = (transform.skewY || 0) * Math.PI / 180;
                    this.livePreviewCtx.transform(1, Math.tan(skewYRad), Math.tan(skewXRad), 1, 0, 0);
                }

                this.livePreviewCtx.drawImage(transform.image, -transform.image.width / 2, -transform.image.height / 2);
                this.livePreviewCtx.restore();
            }

            // Apply glow effect (multiple layers for better effect)
            if (obj.glow && obj.glow.enabled && transform.image) {
                for (let i = 1; i <= 3; i++) {
                    this.livePreviewCtx.save();
                    this.livePreviewCtx.globalAlpha = (obj.glow.intensity / 100) * 0.3 * (obj.alpha || 1);
                    this.livePreviewCtx.shadowColor = obj.glow.color;
                    this.livePreviewCtx.shadowBlur = (obj.glow.size * i) * Math.min(scaleX, scaleY);
                    this.livePreviewCtx.shadowOffsetX = 0;
                    this.livePreviewCtx.shadowOffsetY = 0;

                    this.livePreviewCtx.translate(scaledX, scaledY);
                    this.livePreviewCtx.rotate(transform.angle * Math.PI / 180);
                    this.livePreviewCtx.scale(
                        (transform.scaleX || 1) * scaleX * (transform.flipX ? -1 : 1),
                        (transform.scaleY || 1) * scaleY * (transform.flipY ? -1 : 1)
                    );

                    if (transform.skewX || transform.skewY) {
                        const skewXRad = (transform.skewX || 0) * Math.PI / 180;
                        const skewYRad = (transform.skewY || 0) * Math.PI / 180;
                        this.livePreviewCtx.transform(1, Math.tan(skewYRad), Math.tan(skewXRad), 1, 0, 0);
                    }

                    this.livePreviewCtx.drawImage(transform.image, -transform.image.width / 2, -transform.image.height / 2);
                    this.livePreviewCtx.restore();
                }
            }

            // Now draw the main object
            this.livePreviewCtx.translate(scaledX, scaledY);
            this.livePreviewCtx.rotate(transform.angle * Math.PI / 180);
            this.livePreviewCtx.scale(
                (transform.scaleX || 1) * scaleX * (transform.flipX ? -1 : 1),
                (transform.scaleY || 1) * scaleY * (transform.flipY ? -1 : 1)
            );

            // Apply skew if present
            if (transform.skewX || transform.skewY) {
                const skewXRad = (transform.skewX || 0) * Math.PI / 180;
                const skewYRad = (transform.skewY || 0) * Math.PI / 180;
                this.livePreviewCtx.transform(1, Math.tan(skewYRad), Math.tan(skewXRad), 1, 0, 0);
            }

            // Apply object-level alpha
            this.livePreviewCtx.globalAlpha = (obj.alpha || 1);

            // Build CSS filter string for color effects
            let filters = [];

            if (obj.hue && obj.hue !== 0) {
                filters.push(`hue-rotate(${obj.hue}deg)`);
            }

            if (obj.saturation !== undefined && obj.saturation !== 100) {
                filters.push(`saturate(${obj.saturation}%)`);
            }

            if (obj.brightness !== undefined && obj.brightness !== 100) {
                filters.push(`brightness(${obj.brightness}%)`);
            }

            if (obj.contrast !== undefined && obj.contrast !== 100) {
                filters.push(`contrast(${obj.contrast}%)`);
            }

            // Apply all filters at once
            if (filters.length > 0) {
                this.livePreviewCtx.filter = filters.join(' ');
            } else {
                this.livePreviewCtx.filter = 'none';
            }

            this.livePreviewCtx.drawImage(transform.image, -transform.image.width / 2, -transform.image.height / 2);
            this.livePreviewCtx.restore();
        }

        // Reset final composition settings
        this.livePreviewCtx.globalAlpha = 1.0;
        this.livePreviewCtx.globalCompositeOperation = 'source-over';
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

        // Calculate scale factor from main canvas to preview canvas
        const scaleX = this.livePreviewCanvas.width / this.canvasWidth;
        const scaleY = this.livePreviewCanvas.height / this.canvasHeight;

        this.livePreviewCtx.imageSmoothingEnabled = false;
        this.livePreviewCtx.webkitImageSmoothingEnabled = false;
        this.livePreviewCtx.mozImageSmoothingEnabled = false;
        this.livePreviewCtx.msImageSmoothingEnabled = false;

        // Draw onion skin frames first (if enabled) - ONLY PREVIOUS FRAMES
        if (this.showOnionSkin && this.frames.length > 1) {
            for (let offset = -this.onionSkinFrames; offset < 0; offset++) { // Changed: offset < 0 instead of <= 0
                const onionFrameIdx = frameIndexToRender + offset;
                if (onionFrameIdx < 0 || onionFrameIdx >= this.frames.length) continue;

                const onionFrame = this.frames[onionFrameIdx];

                // Calculate alpha based on distance (more recent = more visible)
                const distance = Math.abs(offset);
                const maxDistance = this.onionSkinFrames;
                const alpha = 0.3 * (1 - (distance - 1) / maxDistance);

                // Draw onion skin layers
                for (let i = 0; i < onionFrame.layers.length; i++) {
                    const layer = onionFrame.layers[i];
                    if (layer.isVisible !== false && layer.canvas instanceof HTMLCanvasElement) {
                        this.livePreviewCtx.globalAlpha = alpha;
                        this.livePreviewCtx.globalCompositeOperation = 'source-over';
                        this.livePreviewCtx.drawImage(layer.canvas, 0, 0, this.livePreviewCanvas.width, this.livePreviewCanvas.height);
                    }
                }

                // Draw onion skin objects
                this.renderOnionSkinObjectsInPreview(onionFrameIdx, alpha, scaleX, scaleY);
            }
        }

        // Draw all layers for this frame, bottom to top
        for (let i = 0; i < frameData.layers.length; i++) {
            const layer = frameData.layers[i];
            if (layer.isVisible !== false && layer.canvas instanceof HTMLCanvasElement) {
                this.livePreviewCtx.globalAlpha = layer.opacity / 100 || 1;
                this.livePreviewCtx.globalCompositeOperation = layer.blendMode || 'source-over';
                this.livePreviewCtx.drawImage(layer.canvas, 0, 0, this.livePreviewCanvas.width, this.livePreviewCanvas.height);
            }
        }

        // Reset composition settings for objects
        this.livePreviewCtx.globalAlpha = 1.0;
        this.livePreviewCtx.globalCompositeOperation = 'source-over';

        // Draw sprite objects on the live preview with proper scaling
        const lpCtx = this.livePreviewCtx;
        for (const obj of this.objectInstances) {
            if (obj.visible === false) continue;

            // NEW: Check if the object's layer is visible
            if (obj.layerId) {
                const objectLayer = this.layers.find(l => l.id === obj.layerId);
                if (objectLayer && !objectLayer.isVisible) {
                    continue; // Skip rendering if layer is hidden
                }
            }

            const transform = obj.getTransformAt(frameIndexToRender, frameIndexToRender);
            if (!transform.image) continue;

            const scaledX = transform.x * scaleX;
            const scaledY = transform.y * scaleY;

            lpCtx.save();
            lpCtx.imageSmoothingEnabled = false;
            lpCtx.webkitImageSmoothingEnabled = false;
            lpCtx.mozImageSmoothingEnabled = false;
            lpCtx.msImageSmoothingEnabled = false;

            // Apply drop shadow first (behind the object)
            if (obj.dropShadow && obj.dropShadow.enabled && transform.image) {
                lpCtx.save();
                lpCtx.globalAlpha = (obj.dropShadow.opacity / 100) * (obj.alpha || 1);
                lpCtx.shadowColor = obj.dropShadow.color;
                lpCtx.shadowBlur = obj.dropShadow.blur * Math.min(scaleX, scaleY);
                lpCtx.shadowOffsetX = obj.dropShadow.offsetX * scaleX;
                lpCtx.shadowOffsetY = obj.dropShadow.offsetY * scaleY;

                lpCtx.translate(scaledX, scaledY);
                lpCtx.rotate(transform.angle * Math.PI / 180);
                lpCtx.scale(
                    (transform.scaleX || 1) * scaleX * (transform.flipX ? -1 : 1),
                    (transform.scaleY || 1) * scaleY * (transform.flipY ? -1 : 1)
                );

                if (transform.skewX || transform.skewY) {
                    const skewXRad = (transform.skewX || 0) * Math.PI / 180;
                    const skewYRad = (transform.skewY || 0) * Math.PI / 180;
                    lpCtx.transform(1, Math.tan(skewYRad), Math.tan(skewXRad), 1, 0, 0);
                }

                lpCtx.drawImage(transform.image, -transform.image.width / 2, -transform.image.height / 2);
                lpCtx.restore();
            }

            // Apply glow effect (multiple layers for better effect)
            if (obj.glow && obj.glow.enabled && transform.image) {
                for (let i = 1; i <= 3; i++) {
                    lpCtx.save();
                    lpCtx.globalAlpha = (obj.glow.intensity / 100) * 0.3 * (obj.alpha || 1);
                    lpCtx.shadowColor = obj.glow.color;
                    lpCtx.shadowBlur = (obj.glow.size * i) * Math.min(scaleX, scaleY);
                    lpCtx.shadowOffsetX = 0;
                    lpCtx.shadowOffsetY = 0;

                    lpCtx.translate(scaledX, scaledY);
                    lpCtx.rotate(transform.angle * Math.PI / 180);
                    lpCtx.scale(
                        (transform.scaleX || 1) * scaleX * (transform.flipX ? -1 : 1),
                        (transform.scaleY || 1) * scaleY * (transform.flipY ? -1 : 1)
                    );

                    if (transform.skewX || transform.skewY) {
                        const skewXRad = (transform.skewX || 0) * Math.PI / 180;
                        const skewYRad = (transform.skewY || 0) * Math.PI / 180;
                        lpCtx.transform(1, Math.tan(skewYRad), Math.tan(skewXRad), 1, 0, 0);
                    }

                    lpCtx.drawImage(transform.image, -transform.image.width / 2, -transform.image.height / 2);
                    lpCtx.restore();
                }
            }

            // Now draw the main object
            lpCtx.translate(scaledX, scaledY);
            lpCtx.rotate(transform.angle * Math.PI / 180);
            lpCtx.scale(
                (transform.scaleX || 1) * scaleX * (transform.flipX ? -1 : 1),
                (transform.scaleY || 1) * scaleY * (transform.flipY ? -1 : 1)
            );

            // Apply skew if present
            if (transform.skewX || transform.skewY) {
                const skewXRad = (transform.skewX || 0) * Math.PI / 180;
                const skewYRad = (transform.skewY || 0) * Math.PI / 180;
                lpCtx.transform(1, Math.tan(skewYRad), Math.tan(skewXRad), 1, 0, 0);
            }

            // Apply object-level alpha
            lpCtx.globalAlpha = (obj.alpha || 1);

            // Build CSS filter string for color effects
            let filters = [];

            if (obj.hue && obj.hue !== 0) {
                filters.push(`hue-rotate(${obj.hue}deg)`);
            }

            if (obj.saturation !== undefined && obj.saturation !== 100) {
                filters.push(`saturate(${obj.saturation}%)`);
            }

            if (obj.brightness !== undefined && obj.brightness !== 100) {
                filters.push(`brightness(${obj.brightness}%)`);
            }

            if (obj.contrast !== undefined && obj.contrast !== 100) {
                filters.push(`contrast(${obj.contrast}%)`);
            }

            // Apply all filters at once
            if (filters.length > 0) {
                lpCtx.filter = filters.join(' ');
            } else {
                lpCtx.filter = 'none';
            }

            lpCtx.drawImage(transform.image, -transform.image.width / 2, -transform.image.height / 2);
            lpCtx.restore();
        }

        // Reset final composition settings
        this.livePreviewCtx.globalAlpha = 1.0;
        this.livePreviewCtx.globalCompositeOperation = 'source-over';
    }

    renderOnionSkinObjectsInPreview(frameIndex, alpha, scaleX, scaleY) {
        this.objectInstances.forEach(instance => {
            if (instance.visible === false) return;

            // Check if the object's layer is visible
            if (instance.layerId) {
                const objectLayer = this.layers.find(l => l.id === instance.layerId);
                if (objectLayer && !objectLayer.isVisible) {
                    return;
                }
            }

            const transform = instance.getTransformAt(frameIndex);
            if (!transform.image && !instance.name) return;

            this.livePreviewCtx.save();

            // FIX: Disable antialiasing for pixel perfect preview onion skin
            this.livePreviewCtx.imageSmoothingEnabled = false;
            this.livePreviewCtx.webkitImageSmoothingEnabled = false;
            this.livePreviewCtx.mozImageSmoothingEnabled = false;
            this.livePreviewCtx.msImageSmoothingEnabled = false;

            // FIX: Apply onion skin alpha combined with object alpha
            const objectAlpha = instance.alpha !== undefined ? instance.alpha : 1;
            this.livePreviewCtx.globalAlpha = alpha * objectAlpha;

            // FIX: Apply object hue filter
            if (instance.hue && instance.hue !== 0) {
                this.livePreviewCtx.filter = `hue-rotate(${instance.hue}deg)`;
            } else {
                this.livePreviewCtx.filter = 'none';
            }

            // Transform and draw object with proper scaling
            this.livePreviewCtx.translate(transform.x * scaleX, transform.y * scaleY);
            this.livePreviewCtx.rotate(transform.angle * Math.PI / 180);

            // FIX: Apply skew transform in preview onion skin
            const skewXRad = (transform.skewX || 0) * Math.PI / 180;
            const skewYRad = (transform.skewY || 0) * Math.PI / 180;
            if (skewXRad !== 0 || skewYRad !== 0) {
                this.livePreviewCtx.transform(1, Math.tan(skewYRad), Math.tan(skewXRad), 1, 0, 0);
            }

            // FIX: Apply scaling with flip support in preview onion skin
            let finalScaleX = (transform.scaleX || 1) * scaleX;
            let finalScaleY = (transform.scaleY || 1) * scaleY;

            if (transform.flipX) finalScaleX = -Math.abs(finalScaleX);
            if (transform.flipY) finalScaleY = -Math.abs(finalScaleY);

            this.livePreviewCtx.scale(finalScaleX, finalScaleY);

            if (transform.image) {
                this.livePreviewCtx.drawImage(
                    transform.image,
                    -transform.image.width / 2,
                    -transform.image.height / 2,
                    transform.image.width,
                    transform.image.height
                );
            } else {
                // Draw default placeholder for objects without images
                this.livePreviewCtx.fillStyle = '#888';
                this.livePreviewCtx.beginPath();
                this.livePreviewCtx.arc(0, 0, 24, 0, 2 * Math.PI);
                this.livePreviewCtx.fill();
                this.livePreviewCtx.strokeStyle = '#333';
                this.livePreviewCtx.lineWidth = 2;
                this.livePreviewCtx.stroke();
                this.livePreviewCtx.fillStyle = '#fff';
                this.livePreviewCtx.font = 'bold 12px sans-serif';
                this.livePreviewCtx.textAlign = 'center';
                this.livePreviewCtx.textBaseline = 'middle';
                this.livePreviewCtx.fillText(instance.name[0] || '?', 0, 2);
            }

            this.livePreviewCtx.restore();
        });
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

        // Copy object transforms from previous frame to new frame - WITH ALL PROPERTIES
        const previousFrameIndex = this.frames.length - 2; // The frame we just added is at length-1, so previous is length-2
        if (previousFrameIndex >= 0 && this.objectInstances.length > 0) {
            this.objectInstances.forEach(obj => {
                const previousTransform = obj.getTransformAt(previousFrameIndex);
                // Set the same transform for the new frame - COPY ALL PROPERTIES
                obj.setKeyframe(this.frames.length - 1, {
                    x: previousTransform.x,
                    y: previousTransform.y,
                    scaleX: previousTransform.scaleX || 1,
                    scaleY: previousTransform.scaleY || 1,
                    angle: previousTransform.angle,
                    flipX: previousTransform.flipX || false,
                    flipY: previousTransform.flipY || false,
                    skewX: previousTransform.skewX || 0,
                    skewY: previousTransform.skewY || 0,
                    image: previousTransform.image
                });
            });
        }

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

        // Copy object transforms from current frame to the duplicated frame - WITH ALL PROPERTIES
        const newFrameIndex = this.currentFrame + 1;
        if (this.objectInstances.length > 0) {
            this.objectInstances.forEach(obj => {
                const currentTransform = obj.getTransformAt(this.currentFrame);
                // Set the same transform for the new duplicated frame - COPY ALL PROPERTIES
                obj.setKeyframe(newFrameIndex, {
                    x: currentTransform.x,
                    y: currentTransform.y,
                    scaleX: currentTransform.scaleX || 1,
                    scaleY: currentTransform.scaleY || 1,
                    angle: currentTransform.angle,
                    flipX: currentTransform.flipX || false,
                    flipY: currentTransform.flipY || false,
                    skewX: currentTransform.skewX || 0,
                    skewY: currentTransform.skewY || 0,
                    image: currentTransform.image
                });
            });
        }

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

        // Onion skin: draw ONLY previous frames with transparency
        if (this.showOnionSkin && this.frames.length > 1) {
            for (let offset = -this.onionSkinFrames; offset < 0; offset++) {
                const frameIdx = this.currentFrame + offset;
                if (frameIdx < 0 || frameIdx >= this.frames.length) continue;

                const frame = this.frames[frameIdx];

                // Calculate alpha based on distance from current frame (more recent = more visible)
                const distance = Math.abs(offset);
                const maxDistance = this.onionSkinFrames;
                const alpha = 0.3 * (1 - (distance - 1) / maxDistance);

                // Draw frame layers with onion skin alpha
                frame.layers.forEach((layer, i) => {
                    if (!layer.isVisible) return;
                    this.ctx.globalAlpha = alpha;
                    this.ctx.globalCompositeOperation = 'source-over';
                    this.ctx.drawImage(layer.canvas, 0, 0);
                });

                // Draw onion skin objects for this frame
                this.renderOnionSkinObjects(frameIdx, alpha);
            }
        }

        // Draw current frame layers with objects interspersed by layer
        for (let i = 0; i < this.layers.length; i++) {
            const layer = this.layers[i];
            if (!layer.isVisible) continue;

            const frame = this.frames[this.currentFrame];
            const frameLayer = frame.layers[i];
            if (!frameLayer) continue;

            // Draw layer content with glow if enabled
            this.ctx.save();
            this.ctx.globalAlpha = layer.opacity / 100;
            this.ctx.globalCompositeOperation = layer.blendMode || 'source-over';

            // Apply glow effect if enabled for this layer
            const glowSettings = this.layerGlowSettings[layer.id];
            if (glowSettings && glowSettings.enabled) {
                this.ctx.shadowColor = glowSettings.color;
                this.ctx.shadowBlur = glowSettings.size;
                this.ctx.shadowOffsetX = 0;
                this.ctx.shadowOffsetY = 0;
            }

            this.ctx.drawImage(frameLayer.canvas, 0, 0);
            this.ctx.restore();

            // Draw objects that belong to this layer AFTER the layer is drawn
            this.renderObjectInstancesForLayer(layer.id);
        }

        // FIX: Also draw objects that don't have a layer assigned or have invalid layer IDs
        this.renderObjectInstancesWithoutLayer();

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

        if (this.currentTool === 'vector' && this.vectorPoints.length > 0) {
            this.drawVectorPreview();
        }

        // REMOVE this line - objects are now drawn within their layers above
        // this.renderObjectInstances();

        this.ctx.globalAlpha = 1.0;
        this.ctx.globalCompositeOperation = 'source-over';

        this.renderFrameToLivePreview(this.currentFrame);
    }

    renderObjectInstancesWithoutLayer() {
        // Get all valid layer IDs
        const validLayerIds = this.layers.map(layer => layer.id);

        // Filter objects that don't have a layer or have an invalid layer ID
        const orphanedObjects = this.objectInstances.filter(instance =>
            instance.visible !== false &&
            (!instance.layerId || !validLayerIds.includes(instance.layerId))
        );

        orphanedObjects.forEach(instance => {
            const transform = instance.getTransformAt(this.currentFrame);
            if (!transform.image && !instance.name) return;

            this.ctx.save();

            // Disable antialiasing for pixel perfect objects
            this.ctx.imageSmoothingEnabled = false;
            this.ctx.webkitImageSmoothingEnabled = false;
            this.ctx.mozImageSmoothingEnabled = false;
            this.ctx.msImageSmoothingEnabled = false;

            // Apply drop shadow first (behind the object)
            if (instance.dropShadow && instance.dropShadow.enabled && transform.image) {
                this.ctx.save();

                // Set shadow properties
                this.ctx.shadowColor = instance.dropShadow.color;
                this.ctx.shadowBlur = instance.dropShadow.blur;
                this.ctx.shadowOffsetX = instance.dropShadow.offsetX;
                this.ctx.shadowOffsetY = instance.dropShadow.offsetY;
                this.ctx.globalAlpha = (instance.dropShadow.opacity / 100) * (instance.alpha !== undefined ? instance.alpha : 1);

                // Apply transform for shadow
                this.ctx.translate(transform.x, transform.y);
                this.ctx.rotate((transform.angle || 0) * Math.PI / 180);
                this.ctx.scale(
                    (transform.scaleX || 1) * (transform.flipX ? -1 : 1),
                    (transform.scaleY || 1) * (transform.flipY ? -1 : 1)
                );

                // Apply skew if present for shadow
                if (transform.skewX || transform.skewY) {
                    const skewXRad = (transform.skewX || 0) * Math.PI / 180;
                    const skewYRad = (transform.skewY || 0) * Math.PI / 180;
                    this.ctx.transform(1, Math.tan(skewYRad), Math.tan(skewXRad), 1, 0, 0);
                }

                // Draw shadow
                this.ctx.drawImage(
                    transform.image,
                    -transform.image.width / 2,
                    -transform.image.height / 2
                );

                this.ctx.restore();
            }

            // Apply glow effect (multiple layers for better effect)
            if (instance.glow && instance.glow.enabled && transform.image) {
                const glowLayers = 3;
                for (let i = glowLayers; i > 0; i--) {
                    this.ctx.save();

                    // Create glow with blur and color
                    this.ctx.shadowColor = instance.glow.color;
                    this.ctx.shadowBlur = instance.glow.size * (i / glowLayers);
                    this.ctx.shadowOffsetX = 0;
                    this.ctx.shadowOffsetY = 0;
                    this.ctx.globalAlpha = (instance.glow.intensity / 100) * (instance.alpha !== undefined ? instance.alpha : 1) * (0.7 / i);

                    // Apply transform for glow
                    this.ctx.translate(transform.x, transform.y);
                    this.ctx.rotate((transform.angle || 0) * Math.PI / 180);
                    this.ctx.scale(
                        (transform.scaleX || 1) * (transform.flipX ? -1 : 1),
                        (transform.scaleY || 1) * (transform.flipY ? -1 : 1)
                    );

                    // Apply skew if present for glow
                    if (transform.skewX || transform.skewY) {
                        const skewXRad = (transform.skewX || 0) * Math.PI / 180;
                        const skewYRad = (transform.skewY || 0) * Math.PI / 180;
                        this.ctx.transform(1, Math.tan(skewYRad), Math.tan(skewXRad), 1, 0, 0);
                    }

                    // Draw glow
                    this.ctx.drawImage(
                        transform.image,
                        -transform.image.width / 2,
                        -transform.image.height / 2
                    );

                    this.ctx.restore();
                }
            }

            // Now draw the main object
            this.ctx.translate(transform.x, transform.y);
            this.ctx.rotate((transform.angle || 0) * Math.PI / 180);
            this.ctx.scale(
                (transform.scaleX || 1) * (transform.flipX ? -1 : 1),
                (transform.scaleY || 1) * (transform.flipY ? -1 : 1)
            );

            // Apply skew if present
            if (transform.skewX || transform.skewY) {
                const skewXRad = (transform.skewX || 0) * Math.PI / 180;
                const skewYRad = (transform.skewY || 0) * Math.PI / 180;
                this.ctx.transform(1, Math.tan(skewYRad), Math.tan(skewXRad), 1, 0, 0);
            }

            // Apply object-level alpha and filters
            this.ctx.globalAlpha = (instance.alpha || 1);

            // Build CSS filter string for color effects
            let filters = [];

            if (instance.hue && instance.hue !== 0) {
                filters.push(`hue-rotate(${instance.hue}deg)`);
            }

            if (instance.saturation !== undefined && instance.saturation !== 100) {
                filters.push(`saturate(${instance.saturation}%)`);
            }

            if (instance.brightness !== undefined && instance.brightness !== 100) {
                filters.push(`brightness(${instance.brightness}%)`);
            }

            if (instance.contrast !== undefined && instance.contrast !== 100) {
                filters.push(`contrast(${instance.contrast}%)`);
            }

            // Apply all filters at once
            if (filters.length > 0) {
                this.ctx.filter = filters.join(' ');
            } else {
                this.ctx.filter = 'none';
            }

            // Draw the object
            if (transform.image) {
                this.ctx.drawImage(
                    transform.image,
                    -transform.image.width / 2,
                    -transform.image.height / 2
                );
            } else {
                // Draw default placeholder for objects without images
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
                this.ctx.fillText(instance.name[0] || '?', 0, 2);
            }

            this.ctx.restore();

            // Draw transform controls if this object is selected
            if (this.currentTool === 'object-tool' &&
                this.selectedObjectInstance &&
                this.selectedObjectInstance.id === instance.id) {
                this.drawObjectTransformControls(transform, transform.image);
            }
        });
    }

    renderObjectInstancesForLayer(layerId) {
        // Filter objects that belong to this layer and are visible
        const layerObjects = this.objectInstances.filter(instance =>
            instance.layerId === layerId && instance.visible
        );

        layerObjects.forEach(instance => {
            const transform = instance.getTransformAt(this.currentFrame, this.currentFrame);
            if (!transform.image && !instance.name) return;

            this.ctx.save();

            // FIX: Disable antialiasing for pixel perfect objects
            this.ctx.imageSmoothingEnabled = false;
            this.ctx.webkitImageSmoothingEnabled = false;
            this.ctx.mozImageSmoothingEnabled = false;
            this.ctx.msImageSmoothingEnabled = false;

            // Apply drop shadow first (behind the object)
            if (instance.dropShadow && instance.dropShadow.enabled && transform.image) {
                this.ctx.save();

                // Set shadow properties
                this.ctx.shadowColor = instance.dropShadow.color;
                this.ctx.shadowBlur = instance.dropShadow.blur;
                this.ctx.shadowOffsetX = instance.dropShadow.offsetX;
                this.ctx.shadowOffsetY = instance.dropShadow.offsetY;
                this.ctx.globalAlpha = (instance.dropShadow.opacity / 100) * (instance.alpha !== undefined ? instance.alpha : 1);

                // Apply transform for shadow
                this.ctx.translate(transform.x, transform.y);
                this.ctx.rotate((transform.angle || 0) * Math.PI / 180);
                this.ctx.scale(
                    (transform.scaleX || 1) * (transform.flipX ? -1 : 1),
                    (transform.scaleY || 1) * (transform.flipY ? -1 : 1)
                );

                // Apply skew if present for shadow
                if (transform.skewX || transform.skewY) {
                    const skewXRad = (transform.skewX || 0) * Math.PI / 180;
                    const skewYRad = (transform.skewY || 0) * Math.PI / 180;
                    this.ctx.transform(1, Math.tan(skewYRad), Math.tan(skewXRad), 1, 0, 0);
                }

                // Draw shadow
                this.ctx.drawImage(
                    transform.image,
                    -transform.image.width / 2,
                    -transform.image.height / 2
                );

                this.ctx.restore();
            }

            // Apply glow effect (multiple layers for better effect)
            if (instance.glow && instance.glow.enabled && transform.image) {
                const glowLayers = 3;
                for (let i = glowLayers; i > 0; i--) {
                    this.ctx.save();

                    // Create glow with blur and color
                    this.ctx.shadowColor = instance.glow.color;
                    this.ctx.shadowBlur = instance.glow.size * (i / glowLayers);
                    this.ctx.shadowOffsetX = 0;
                    this.ctx.shadowOffsetY = 0;
                    this.ctx.globalAlpha = (instance.glow.intensity / 100) * (instance.alpha !== undefined ? instance.alpha : 1) * (0.7 / i);

                    // Apply transform for glow
                    this.ctx.translate(transform.x, transform.y);
                    this.ctx.rotate((transform.angle || 0) * Math.PI / 180);
                    this.ctx.scale(
                        (transform.scaleX || 1) * (transform.flipX ? -1 : 1),
                        (transform.scaleY || 1) * (transform.flipY ? -1 : 1)
                    );

                    // Apply skew if present for glow
                    if (transform.skewX || transform.skewY) {
                        const skewXRad = (transform.skewX || 0) * Math.PI / 180;
                        const skewYRad = (transform.skewY || 0) * Math.PI / 180;
                        this.ctx.transform(1, Math.tan(skewYRad), Math.tan(skewXRad), 1, 0, 0);
                    }

                    // Draw glow
                    this.ctx.drawImage(
                        transform.image,
                        -transform.image.width / 2,
                        -transform.image.height / 2
                    );

                    this.ctx.restore();
                }
            }

            // Now draw the main object
            this.ctx.translate(transform.x, transform.y);
            this.ctx.rotate((transform.angle || 0) * Math.PI / 180);
            this.ctx.scale(
                (transform.scaleX || 1) * (transform.flipX ? -1 : 1),
                (transform.scaleY || 1) * (transform.flipY ? -1 : 1)
            );

            // Apply skew if present
            if (transform.skewX || transform.skewY) {
                const skewXRad = (transform.skewX || 0) * Math.PI / 180;
                const skewYRad = (transform.skewY || 0) * Math.PI / 180;
                this.ctx.transform(1, Math.tan(skewYRad), Math.tan(skewXRad), 1, 0, 0);
            }

            // Apply object-level alpha
            this.ctx.globalAlpha = (instance.alpha || 1);

            // Build CSS filter string for color effects
            let filters = [];

            if (instance.hue && instance.hue !== 0) {
                filters.push(`hue-rotate(${instance.hue}deg)`);
            }

            if (instance.saturation !== undefined && instance.saturation !== 100) {
                filters.push(`saturate(${instance.saturation}%)`);
            }

            if (instance.brightness !== undefined && instance.brightness !== 100) {
                filters.push(`brightness(${instance.brightness}%)`);
            }

            if (instance.contrast !== undefined && instance.contrast !== 100) {
                filters.push(`contrast(${instance.contrast}%)`);
            }

            // Apply all filters at once
            if (filters.length > 0) {
                this.ctx.filter = filters.join(' ');
            } else {
                this.ctx.filter = 'none';
            }

            // Draw the object
            if (transform.image) {
                this.ctx.drawImage(
                    transform.image,
                    -transform.image.width / 2,
                    -transform.image.height / 2
                );
            } else {
                // Draw default placeholder for objects without images
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
                this.ctx.fillText(instance.name[0] || '?', 0, 2);
            }

            this.ctx.restore();

            // Draw transform controls if this object is selected
            if (this.currentTool === 'object-tool' &&
                this.selectedObjectInstance &&
                this.selectedObjectInstance.id === instance.id) {
                this.drawObjectTransformControls(transform, transform.image);
            }
        });
    }

    renderOnionSkinObjects(frameIndex, alpha) {
        this.objectInstances.forEach(instance => {
            if (instance.visible === false) return;

            // Check if the object's layer is visible
            if (instance.layerId) {
                const objectLayer = this.layers.find(l => l.id === instance.layerId);
                if (objectLayer && !objectLayer.isVisible) {
                    return;
                }
            }

            const transform = instance.getTransformAt(frameIndex, frameIndex);
            if (!transform.image && !instance.name) return;

            this.ctx.save();

            this.ctx.imageSmoothingEnabled = false;
            this.ctx.webkitImageSmoothingEnabled = false;
            this.ctx.mozImageSmoothingEnabled = false;
            this.ctx.msImageSmoothingEnabled = false;

            // FIX: Apply onion skin alpha combined with object alpha
            const objectAlpha = instance.alpha !== undefined ? instance.alpha : 1;
            this.ctx.globalAlpha = alpha * objectAlpha;

            // FIX: Apply object hue filter for onion skin
            if (instance.hue && instance.hue !== 0) {
                this.ctx.filter = `hue-rotate(${instance.hue}deg)`;
            } else {
                this.ctx.filter = 'none';
            }

            // Transform and draw object with ALL properties
            this.ctx.translate(transform.x, transform.y);
            this.ctx.rotate(transform.angle * Math.PI / 180);

            // FIX: Apply skew transform in onion skin
            const skewX = (transform.skewX || 0) * Math.PI / 180;
            const skewY = (transform.skewY || 0) * Math.PI / 180;
            if (skewX !== 0 || skewY !== 0) {
                this.ctx.transform(1, Math.tan(skewY), Math.tan(skewX), 1, 0, 0);
            }

            // FIX: Apply scaling with flip support in onion skin
            let finalScaleX = transform.scaleX || 1;
            let finalScaleY = transform.scaleY || 1;

            if (transform.flipX) finalScaleX = -Math.abs(finalScaleX);
            if (transform.flipY) finalScaleY = -Math.abs(finalScaleY);

            this.ctx.scale(finalScaleX, finalScaleY);

            if (transform.image) {
                const img = transform.image;
                this.ctx.drawImage(img, -img.width / 2, -img.height / 2, img.width, img.height);
            } else {
                // Draw default placeholder for objects without images
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
                this.ctx.fillText(instance.name[0] || '?', 0, 2);
            }

            this.ctx.restore();
        });
    }

    drawObjectTransformControls(transform, image) {
        if (!image) return;

        const ctx = this.ctx;
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        const centerX = transform.x;
        const centerY = transform.y;
        const angle = transform.angle * Math.PI / 180;

        const scaleX = transform.scaleX || 1;
        const scaleY = transform.scaleY || 1;

        const halfWidth = (image.width * Math.abs(scaleX)) / 2;
        const halfHeight = (image.height * Math.abs(scaleY)) / 2;

        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        const corners = [
            { x: -halfWidth, y: -halfHeight },
            { x: halfWidth, y: -halfHeight },
            { x: -halfWidth, y: halfHeight },
            { x: halfWidth, y: halfHeight }
        ];

        const edges = [
            { x: 0, y: -halfHeight },
            { x: halfWidth, y: 0 },
            { x: 0, y: halfHeight },
            { x: -halfWidth, y: 0 }
        ];

        const worldCorners = corners.map(corner => ({
            x: centerX + (corner.x * cos - corner.y * sin),
            y: centerY + (corner.x * sin + corner.y * cos)
        }));

        const worldEdges = edges.map(edge => ({
            x: centerX + (edge.x * cos - edge.y * sin),
            y: centerY + (edge.x * sin + edge.y * cos)
        }));

        // Draw bounding box outline
        ctx.strokeStyle = '#007acc';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 4]);
        ctx.beginPath();
        ctx.moveTo(worldCorners[0].x, worldCorners[0].y);
        ctx.lineTo(worldCorners[1].x, worldCorners[1].y);
        ctx.lineTo(worldCorners[3].x, worldCorners[3].y);
        ctx.lineTo(worldCorners[2].x, worldCorners[2].y);
        ctx.closePath();
        ctx.stroke();
        ctx.setLineDash([]);

        // Responsive handle sizes
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const handleSize = isTouchDevice ? 24 : 12;
        const edgeHandleSize = isTouchDevice ? 16 : 8;

        // Draw corner resize handles
        ctx.fillStyle = '#007acc';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;

        worldCorners.forEach(corner => {
            ctx.fillRect(corner.x - handleSize / 2, corner.y - handleSize / 2, handleSize, handleSize);
            ctx.strokeRect(corner.x - handleSize / 2, corner.y - handleSize / 2, handleSize, handleSize);
        });

        // Draw edge skew handles
        ctx.fillStyle = '#FF9800';

        worldEdges.forEach(edge => {
            ctx.save();
            ctx.translate(edge.x, edge.y);
            ctx.rotate(Math.PI / 4);
            ctx.fillRect(-edgeHandleSize / 2, -edgeHandleSize / 2, edgeHandleSize, edgeHandleSize);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.strokeRect(-edgeHandleSize / 2, -edgeHandleSize / 2, edgeHandleSize, edgeHandleSize);
            ctx.restore();
        });

        // Draw rotation handle
        const topCenter = {
            x: (worldCorners[0].x + worldCorners[1].x) / 2,
            y: (worldCorners[0].y + worldCorners[1].y) / 2
        };

        const rotateDistance = 30;
        // FIX: Changed the calculation to use +sin instead of -sin for proper direction
        const rotateHandle = {
            x: topCenter.x + rotateDistance * sin,
            y: topCenter.y - rotateDistance * cos
        };

        ctx.strokeStyle = '#007acc';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(topCenter.x, topCenter.y);
        ctx.lineTo(rotateHandle.x, rotateHandle.y);
        ctx.stroke();
        ctx.setLineDash([]);

        const rotateHandleSize = isTouchDevice ? 12 : 6;
        ctx.beginPath();
        ctx.arc(rotateHandle.x, rotateHandle.y, rotateHandleSize, 0, 2 * Math.PI);
        ctx.fillStyle = '#4CAF50';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // NEW: Draw rotation hotspot point
        const hotspot = this.selectedObjectInstance.rotationHotspot || { x: 0, y: 0 };

        // Convert hotspot local coordinates to world coordinates
        const hotspotLocalX = hotspot.x;
        const hotspotLocalY = hotspot.y;

        const hotspotWorldX = centerX + (hotspotLocalX * cos - hotspotLocalY * sin);
        const hotspotWorldY = centerY + (hotspotLocalX * sin + hotspotLocalY * cos);

        // Draw hotspot point
        const hotspotSize = isTouchDevice ? 10 : 6;
        ctx.beginPath();
        ctx.arc(hotspotWorldX, hotspotWorldY, hotspotSize, 0, 2 * Math.PI);
        ctx.fillStyle = '#FF4CAF';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw crosshair in hotspot
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(hotspotWorldX - hotspotSize / 2, hotspotWorldY);
        ctx.lineTo(hotspotWorldX + hotspotSize / 2, hotspotWorldY);
        ctx.moveTo(hotspotWorldX, hotspotWorldY - hotspotSize / 2);
        ctx.lineTo(hotspotWorldX, hotspotWorldY + hotspotSize / 2);
        ctx.stroke();

        // Draw flip buttons with larger sizes for touch
        const flipDistance = halfWidth + 20;
        const flipButtonSize = isTouchDevice ? 32 : 16;

        // Horizontal flip button
        const hFlipButton = {
            x: centerX + (flipDistance * cos),
            y: centerY + (flipDistance * sin)
        };

        ctx.fillStyle = '#FF9800';
        ctx.fillRect(hFlipButton.x - flipButtonSize / 2, hFlipButton.y - flipButtonSize / 2, flipButtonSize, flipButtonSize);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(hFlipButton.x - flipButtonSize / 2, hFlipButton.y - flipButtonSize / 2, flipButtonSize, flipButtonSize);

        ctx.fillStyle = transform.flipX ? '#ffffff' : '#333333';
        ctx.font = `bold ${isTouchDevice ? 14 : 10}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('H', hFlipButton.x, hFlipButton.y);

        // Vertical flip button
        const vFlipButton = {
            x: centerX - (flipDistance * cos),
            y: centerY - (flipDistance * sin)
        };

        ctx.fillStyle = '#FF9800';
        ctx.fillRect(vFlipButton.x - flipButtonSize / 2, vFlipButton.y - flipButtonSize / 2, flipButtonSize, flipButtonSize);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(vFlipButton.x - flipButtonSize / 2, vFlipButton.y - flipButtonSize / 2, flipButtonSize, flipButtonSize);

        ctx.fillStyle = transform.flipY ? '#ffffff' : '#333333';
        ctx.font = `bold ${isTouchDevice ? 14 : 10}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('V', vFlipButton.x, vFlipButton.y);

        ctx.restore();
    }

    convertFrameToObject() {
        if (!this.activeLayerId) {
            alert('Please select a layer first');
            return;
        }

        const frame = this.frames[this.currentFrame];
        const layer = frame.layers.find(l => l.id === this.activeLayerId);

        if (!layer || !layer.canvas) {
            alert('No valid layer data found');
            return;
        }

        // Check if layer has content
        const ctx = layer.canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, layer.canvas.width, layer.canvas.height);
        const hasContent = imageData.data.some((value, index) => index % 4 === 3 && value > 0); // Check alpha channel

        if (!hasContent) {
            alert('Selected layer is empty');
            return;
        }

        // Create a canvas from the layer
        const canvas = document.createElement('canvas');
        canvas.width = layer.canvas.width;
        canvas.height = layer.canvas.height;
        const canvasCtx = canvas.getContext('2d');
        canvasCtx.drawImage(layer.canvas, 0, 0);

        // Create object definition
        const objDef = {
            id: 'frame_' + Date.now() + '_' + Math.floor(Math.random() * 10000),
            name: `Frame ${this.currentFrame + 1} - ${layer.name}`,
            image: canvas,
            width: canvas.width,
            height: canvas.height
        };

        // Add to object library
        this.objectLibrary.push(objDef);
        this.updateObjectLibraryList();

        // Add instance to canvas at center
        const centerX = this.canvasWidth / 2;
        const centerY = this.canvasHeight / 2;
        this.addObjectInstanceToCanvas(objDef.id, centerX, centerY);

        // Clear the original layer
        ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);

        // Also clear from global layer
        const globalLayer = this.layers.find(l => l.id === this.activeLayerId);
        if (globalLayer) {
            const globalCtx = globalLayer.canvas.getContext('2d');
            globalCtx.clearRect(0, 0, globalLayer.canvas.width, globalLayer.canvas.height);
        }

        // Switch to object tool
        this.currentTool = 'object-tool';
        document.querySelectorAll('.drawing-tool').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-tool') === 'object-tool');
        });

        // Show object tool section
        const objectToolSection = document.getElementById('objectToolSection');
        if (objectToolSection) objectToolSection.style.display = 'block';

        this.renderCurrentFrameToMainCanvas();
        this.renderObjectsList();

        alert(`Layer converted to object: "${objDef.name}"`);
    }

    showObjectPropertiesPanel(obj, transform) {
        const section = document.getElementById('objectPropertiesSection');
        if (!section) return;

        if (!obj) {
            section.style.display = 'none';
            return;
        }

        section.style.display = 'block';

        // Update all input fields
        const objectName = document.getElementById('objectName');
        const objectX = document.getElementById('objectX');
        const objectY = document.getElementById('objectY');
        const objectScale = document.getElementById('objectScale');
        const objectAngle = document.getElementById('objectAngle');
        const objectTween = document.getElementById('objectTween');
        const objectLayer = document.getElementById('objectLayer');

        if (objectName) objectName.value = obj.name;
        if (objectX) objectX.value = Math.round(transform.x * 10) / 10;
        if (objectY) objectY.value = Math.round(transform.y * 10) / 10;
        if (objectScale) objectScale.value = Math.round(transform.scale * 100) / 100;
        if (objectAngle) objectAngle.value = Math.round(transform.angle);
        if (objectTween) objectTween.checked = !!obj.tween;

        // Update layer dropdown
        if (objectLayer) {
            objectLayer.innerHTML = '';
            this.layers.forEach(layer => {
                const option = document.createElement('option');
                option.value = layer.id;
                option.textContent = layer.name;
                if (obj.layerId === layer.id) {
                    option.selected = true;
                }
                objectLayer.appendChild(option);
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
            case 'export-zip':
                this.exportFramesAsZip();
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
            case 'convert-frame-to-object':
                this.convertFrameToObject();
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
            case 'contrast':
                window.SpriteSparkModals && window.SpriteSparkModals.showContrastModal(this);
                break;
            case 'brightness':
                window.SpriteSparkModals && window.SpriteSparkModals.showBrightnessModal(this);
                break;
            case 'vignette':
                window.SpriteSparkModals && window.SpriteSparkModals.showVignetteModal(this);
                break;
            case 'fish-eye':
                window.SpriteSparkModals && window.SpriteSparkModals.showFishEyeModal(this);
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

        // ONLY handle object tool mouse events here
        if (this.currentTool === 'object-tool') {
            this.handleObjectToolMouseDown(e);
            return;
        }

        /*if (this.currentTool !== 'object-tool') return;
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
        this.showObjectPropertiesPanel(null);*/
    }

    handleCanvasMouseMove(e) {
        if (this.currentTool === 'object-tool') {
            this.handleObjectToolMouseMove(e);
            return; // Important: return here to prevent other tool handling
        }

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
        if (this.currentTool === 'object-tool') {
            this.handleObjectToolMouseUp(e);
            return; // Important: return here to prevent other tool handling
        }

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

        // Copy object transforms from the frame that will now be after this one - WITH ALL PROPERTIES
        const nextFrameIndex = this.currentFrame + 1;
        if (nextFrameIndex < this.frames.length && this.objectInstances.length > 0) {
            this.objectInstances.forEach(obj => {
                const nextTransform = obj.getTransformAt(nextFrameIndex);
                // Set the same transform for the inserted frame - COPY ALL PROPERTIES
                obj.setKeyframe(this.currentFrame, {
                    x: nextTransform.x,
                    y: nextTransform.y,
                    scaleX: nextTransform.scaleX || 1,
                    scaleY: nextTransform.scaleY || 1,
                    angle: nextTransform.angle,
                    flipX: nextTransform.flipX || false,
                    flipY: nextTransform.flipY || false,
                    skewX: nextTransform.skewX || 0,
                    skewY: nextTransform.skewY || 0,
                    image: nextTransform.image
                });
            });
        }

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

        if (this.currentTool === 'object-tool') {
            this.handleObjectToolMouseDown(e);
            return;
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

        if (this.currentTool === 'vector') {
            // Vector tool is handled in its own event handlers, don't draw
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

        if (this.currentTool === 'object-tool') {
            this.handleObjectToolMouseMove(e);
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

            if (this.currentTool === 'object-tool') {
                this.handleObjectToolMouseUp(e);
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
            scaleX: 1,
            scaleY: 1,
            angle: 0,
            image: null,
            visible: true,
            alpha: 1,
            hue: 0,
            layerId: this.activeLayerId || (this.layers[0] && this.layers[0].id)
        });

        this.objects.push(obj);
        this.selectedObjectId = obj.id;
        this.selectedObjectInstance = obj;
        this.renderObjectsList();
        this.renderCurrentFrameToMainCanvas();
        //this.showObjectPropertiesPanel(obj, obj.getTransformAt(this.currentFrame));
        this.updateObjectPropertiesPanel();
    }

    getObjectTransformHandle(x, y, transform) {
        if (!transform.image) return null;

        const canvasX = x;
        const canvasY = y;

        const img = transform.image;
        const centerX = transform.x;
        const centerY = transform.y;
        const angle = transform.angle * Math.PI / 180;

        const scaleX = transform.scaleX || 1;
        const scaleY = transform.scaleY || 1;

        const halfWidth = (img.width * Math.abs(scaleX)) / 2;
        const halfHeight = (img.height * Math.abs(scaleY)) / 2;

        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        // Check rotation hotspot first (highest priority)
        if (this.selectedObjectInstance && this.selectedObjectInstance.rotationHotspot) {
            const hotspot = this.selectedObjectInstance.rotationHotspot;
            const hotspotWorldX = centerX + (hotspot.x * cos - hotspot.y * sin);
            const hotspotWorldY = centerY + (hotspot.x * sin + hotspot.y * cos);

            const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            const hotspotSize = isTouchDevice ? 10 : 6;

            if (Math.abs(canvasX - hotspotWorldX) < hotspotSize + 4 &&
                Math.abs(canvasY - hotspotWorldY) < hotspotSize + 4) {
                return { type: 'hotspot' };
            }
        }

        const corners = [
            { x: -halfWidth, y: -halfHeight, handle: 'nw' },
            { x: halfWidth, y: -halfHeight, handle: 'ne' },
            { x: -halfWidth, y: halfHeight, handle: 'sw' },
            { x: halfWidth, y: halfHeight, handle: 'se' }
        ];

        const edges = [
            { x: 0, y: -halfHeight, handle: 'n' },
            { x: halfWidth, y: 0, handle: 'e' },
            { x: 0, y: halfHeight, handle: 's' },
            { x: -halfWidth, y: 0, handle: 'w' }
        ];

        const worldCorners = corners.map(corner => ({
            x: centerX + (corner.x * cos - corner.y * sin),
            y: centerY + (corner.x * sin + corner.y * cos),
            handle: corner.handle
        }));

        const worldEdges = edges.map(edge => ({
            x: centerX + (edge.x * cos - edge.y * sin),
            y: centerY + (edge.x * sin + edge.y * cos),
            handle: edge.handle
        }));

        // Increased handle sizes for touch devices
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const handleSize = isTouchDevice ? 24 : 12;
        const edgeHandleSize = isTouchDevice ? 16 : 8;

        // Check resize handles (corners)
        for (const corner of worldCorners) {
            if (Math.abs(canvasX - corner.x) < handleSize / 2 && Math.abs(canvasY - corner.y) < handleSize / 2) {
                return { type: 'resize', handle: corner.handle };
            }
        }

        // Check skew handles (edge midpoints)
        for (const edge of worldEdges) {
            if (Math.abs(canvasX - edge.x) < edgeHandleSize / 2 && Math.abs(canvasY - edge.y) < edgeHandleSize / 2) {
                return { type: 'skew', handle: edge.handle };
            }
        }

        // Check rotation handle
        const topCenter = {
            x: (worldCorners[0].x + worldCorners[1].x) / 2,
            y: (worldCorners[0].y + worldCorners[1].y) / 2
        };

        const rotateDistance = 30;
        const rotateHandle = {
            x: topCenter.x + rotateDistance * sin,
            y: topCenter.y - rotateDistance * cos
        };

        const rotateHandleSize = isTouchDevice ? 12 : 6;
        if (Math.abs(canvasX - rotateHandle.x) < rotateHandleSize && Math.abs(canvasY - rotateHandle.y) < rotateHandleSize) {
            return { type: 'rotate' };
        }

        // Check flip buttons
        const flipDistance = Math.max(halfWidth, halfHeight) + 20;
        const flipButtonSize = isTouchDevice ? 32 : 16;

        // Horizontal flip button
        const hFlipButton = {
            x: centerX + (flipDistance * cos),
            y: centerY + (flipDistance * sin)
        };

        if (Math.abs(canvasX - hFlipButton.x) < flipButtonSize / 2 && Math.abs(canvasY - hFlipButton.y) < flipButtonSize / 2) {
            return { type: 'flip', handle: 'horizontal' };
        }

        // Vertical flip button
        const vFlipButton = {
            x: centerX - (flipDistance * cos),
            y: centerY - (flipDistance * sin)
        };

        if (Math.abs(canvasX - vFlipButton.x) < flipButtonSize / 2 && Math.abs(canvasY - vFlipButton.y) < flipButtonSize / 2) {
            return { type: 'flip', handle: 'vertical' };
        }

        return null;
    }

    setupDragAndDrop(element, obj) {
        element.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', obj.id);
            e.dataTransfer.effectAllowed = 'move';
            element.classList.add('dragging');
        });

        element.addEventListener('dragend', (e) => {
            element.classList.remove('dragging');
        });

        element.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            element.classList.add('drag-over');
        });

        element.addEventListener('dragleave', (e) => {
            element.classList.remove('drag-over');
        });

        element.addEventListener('drop', (e) => {
            e.preventDefault();
            element.classList.remove('drag-over');

            const draggedObjectId = e.dataTransfer.getData('text/plain');
            const targetObjectId = obj.id;

            if (draggedObjectId !== targetObjectId) {
                parentObjectTo(draggedObjectId, targetObjectId);
            }
        });
    }



    renderObjectsList() {
        const objectsList = document.getElementById('objects-list');
        if (!objectsList) return;

        objectsList.innerHTML = '';

        // Get root objects (objects without parents)
        const rootObjects = Object.values(objects).filter(obj => !obj.parentId);

        // Sort root objects by z-index
        rootObjects.sort((a, b) => b.zIndex - a.zIndex);

        // Render each root object and its hierarchy
        rootObjects.forEach(obj => {
            renderObjectHierarchy(obj, objectsList, 0);
        });
    }

    parentObjectTo(childId, parentId) {
        const childObj = objects[childId];
        const parentObj = objects[parentId];

        if (!childObj || !parentObj) return;

        // Prevent circular references
        if (parentObj.isDescendantOf(childId, objects)) {
            alert('Cannot parent an object to its own descendant!');
            return;
        }

        // Remove from current parent if any
        if (childObj.parentId) {
            const currentParent = objects[childObj.parentId];
            if (currentParent) {
                currentParent.removeChild(childId);
            }
        }

        // Add to new parent
        parentObj.addChild(childObj);
        parentObj.expanded = true; // Auto-expand to show new child

        // Convert world transform to local transform
        convertToLocalTransform(childObj, parentObj);

        renderObjectsList();
        renderCanvas();
        addToHistory();
    }

    convertToLocalTransform(childObj, parentObj) {
        const currentFrame = getCurrentFrame();
        const childWorld = childObj.getWorldTransformAt(currentFrame, objects);
        const parentWorld = parentObj.getWorldTransformAt(currentFrame, objects);

        // Calculate local transform that maintains world position
        const localX = (childWorld.x - parentWorld.x) / parentWorld.scaleX;
        const localY = (childWorld.y - parentWorld.y) / parentWorld.scaleY;

        // Apply inverse parent rotation
        const cos = Math.cos(-parentWorld.angle * Math.PI / 180);
        const sin = Math.sin(-parentWorld.angle * Math.PI / 180);

        const rotatedX = localX * cos - localY * sin;
        const rotatedY = localX * sin + localY * cos;

        // Update all keyframes to maintain world position
        Object.keys(childObj.keyframes).forEach(frame => {
            const keyframe = childObj.keyframes[frame];
            keyframe.x = rotatedX;
            keyframe.y = rotatedY;
            keyframe.scaleX = (keyframe.scaleX || 1) / parentWorld.scaleX;
            keyframe.scaleY = (keyframe.scaleY || 1) / parentWorld.scaleY;
            keyframe.angle = (keyframe.angle || 0) - parentWorld.angle;
        });
    }

    unparentObject(objectId) {
        const obj = objects[objectId];
        if (!obj || !obj.parentId) return;

        const parent = objects[obj.parentId];
        if (parent) {
            parent.removeChild(objectId);
        }

        // Convert local transform back to world transform
        convertToWorldTransform(obj);

        obj.parentId = null;
        obj.depth = 0;

        renderObjectsList();
        renderCanvas();
        addToHistory();
    }

    convertToWorldTransform(obj) {
        const currentFrame = getCurrentFrame();

        // Update all keyframes to maintain world position
        Object.keys(obj.keyframes).forEach(frame => {
            const worldTransform = obj.getWorldTransformAt(parseInt(frame), objects);
            const keyframe = obj.keyframes[frame];

            keyframe.x = worldTransform.x;
            keyframe.y = worldTransform.y;
            keyframe.scaleX = worldTransform.scaleX;
            keyframe.scaleY = worldTransform.scaleY;
            keyframe.angle = worldTransform.angle;
        });
    }

    toggleObjectExpansion(objectId) {
        const obj = objects[objectId];
        if (obj) {
            obj.expanded = !obj.expanded;
            renderObjectsList();
        }
    }

    renderObjectHierarchy(obj, container, depth) {
        const objItem = document.createElement('div');
        objItem.className = 'object-item';
        objItem.dataset.objectId = obj.id;
        objItem.style.paddingLeft = (depth * 20 + 10) + 'px';

        // Add hierarchy styling
        if (depth > 0) {
            objItem.classList.add('child-object');
        }

        // Create expand/collapse button for objects with children
        let expandButton = '';
        if (obj.children.length > 0) {
            const expandedClass = obj.expanded ? 'expanded' : 'collapsed';
            expandButton = `
            <button class="expand-btn ${expandedClass}" onclick="toggleObjectExpansion('${obj.id}')">
                ${obj.expanded ? '▼' : '▶'}
            </button>
        `;
        } else {
            expandButton = '<span class="expand-spacer"></span>';
        }

        objItem.innerHTML = `
        ${expandButton}
        <div class="object-content" draggable="true">
            <div class="object-visibility" onclick="toggleObjectVisibility('${obj.id}')">
                ${obj.visible ? '👁' : '🚫'}
            </div>
            <span class="object-name" ondblclick="editObjectName('${obj.id}')">${obj.name}</span>
            <div class="object-controls">
                <button onclick="duplicateObject('${obj.id}')" title="Duplicate">📋</button>
                <button onclick="unparentObject('${obj.id}')" title="Unparent" ${!obj.parentId ? 'disabled' : ''}>🔗</button>
                <button onclick="deleteObject('${obj.id}')" title="Delete">🗑</button>
            </div>
        </div>
    `;

        // Add drag and drop functionality for parenting
        const objectContent = objItem.querySelector('.object-content');
        setupDragAndDrop(objectContent, obj);

        // Highlight if selected
        if (selectedObjectId === obj.id) {
            objItem.classList.add('selected');
        }

        // Add click handler for selection
        objectContent.addEventListener('click', (e) => {
            if (!e.target.closest('button')) {
                selectObject(obj.id);
            }
        });

        container.appendChild(objItem);

        // Render children if expanded
        if (obj.expanded && obj.children.length > 0) {
            obj.children.forEach(childId => {
                const childObj = objects[childId];
                if (childObj) {
                    renderObjectHierarchy(childObj, container, depth + 1);
                }
            });
        }
    }

    updateGhostCursor(e) {
        if (!this.ghostCtx || !this.ghostCanvas) return;
        this.ghostCtx.clearRect(0, 0, this.ghostCanvas.width, this.ghostCanvas.height);
        if (!e || !this.showBrushGhost || this.currentTool === 'bucket' || this.currentTool === 'eyedropper') return;
        const rect = this.ghostCanvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / this.zoom);
        const y = Math.floor((e.clientY - rect.top) / this.zoom);

        // Draw a single 1x1 pixel ghost cursor
        this.ghostCtx.save();
        this.ghostCtx.globalAlpha = 1;
        this.ghostCtx.fillStyle = this.primaryColor;
        this.ghostCtx.fillRect(x, y, 1, 1);
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

                // FIX: Disable antialiasing for pixel perfect thumbnails
                thumbCtx.imageSmoothingEnabled = false;
                thumbCtx.webkitImageSmoothingEnabled = false;
                thumbCtx.mozImageSmoothingEnabled = false;
                thumbCtx.msImageSmoothingEnabled = false;

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

                // FIX: Draw sprite objects on thumbnails
                thumbCtx.globalAlpha = 1.0;
                thumbCtx.globalCompositeOperation = 'source-over';

                // Calculate scale factor to fit objects properly in thumbnail
                const scaleX = w / this.canvasWidth;
                const scaleY = h / this.canvasHeight;

                for (const obj of this.objectInstances) {
                    if (obj.visible === false) continue;
                    const transform = obj.getTransformAt(idx);

                    thumbCtx.save();
                    thumbCtx.globalAlpha = obj.alpha !== undefined ? obj.alpha : 1;
                    if (obj.hue && obj.hue !== 0) {
                        thumbCtx.filter = `hue-rotate(${obj.hue}deg)`;
                    } else {
                        thumbCtx.filter = 'none';
                    }

                    // Scale object position and size to fit thumbnail
                    thumbCtx.translate(transform.x * scaleX, transform.y * scaleY);
                    thumbCtx.rotate(transform.angle * Math.PI / 180);
                    thumbCtx.scale(transform.scale * scaleX, transform.scale * scaleY);

                    if (transform.image) {
                        thumbCtx.drawImage(
                            transform.image,
                            -transform.image.width / 2,
                            -transform.image.height / 2
                        );
                    } else {
                        // Draw default placeholder for objects without images
                        thumbCtx.fillStyle = '#888';
                        thumbCtx.beginPath();
                        thumbCtx.arc(0, 0, 8, 0, 2 * Math.PI);
                        thumbCtx.fill();
                        thumbCtx.strokeStyle = '#333';
                        thumbCtx.lineWidth = 1;
                        thumbCtx.stroke();
                    }
                    thumbCtx.restore();
                }

                thumbDiv.appendChild(thumbCanvas);
                item.appendChild(thumbDiv);
            }

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

    applyContrastEffect(contrast = 1.2) {
        // Add undo state first
        this.undoAdd();

        // Only apply contrast to the active layer in the current frame
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
            // Apply contrast formula: newValue = ((oldValue - 128) * contrast) + 128
            data[i] = Math.min(255, Math.max(0, ((data[i] - 128) * contrast) + 128));     // Red
            data[i + 1] = Math.min(255, Math.max(0, ((data[i + 1] - 128) * contrast) + 128)); // Green
            data[i + 2] = Math.min(255, Math.max(0, ((data[i + 2] - 128) * contrast) + 128)); // Blue
            // Alpha channel remains unchanged
        }

        ctx.putImageData(imgData, 0, 0);

        // Sync to global layer
        const globalLayer = this.layers[layerIndex];
        if (globalLayer) {
            const globalCtx = globalLayer.canvas.getContext('2d');
            globalCtx.clearRect(0, 0, globalLayer.canvas.width, globalLayer.canvas.height);
            globalCtx.drawImage(layer.canvas, 0, 0);
        }

        this.renderCurrentFrameToMainCanvas();
    }

    applyBrightnessEffect(brightness = 1.2) {
        // Add undo state first
        this.undoAdd();

        // Only apply brightness to the active layer in the current frame
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
            // Apply brightness multiplier
            data[i] = Math.min(255, Math.max(0, data[i] * brightness));     // Red
            data[i + 1] = Math.min(255, Math.max(0, data[i + 1] * brightness)); // Green
            data[i + 2] = Math.min(255, Math.max(0, data[i + 2] * brightness)); // Blue
            // Alpha channel remains unchanged
        }

        ctx.putImageData(imgData, 0, 0);

        // Sync to global layer
        const globalLayer = this.layers[layerIndex];
        if (globalLayer) {
            const globalCtx = globalLayer.canvas.getContext('2d');
            globalCtx.clearRect(0, 0, globalLayer.canvas.width, globalLayer.canvas.height);
            globalCtx.drawImage(layer.canvas, 0, 0);
        }

        this.renderCurrentFrameToMainCanvas();
    }

    applyVignetteEffect(strength = 0.5, falloff = 0.7) {
        // Add undo state first
        this.undoAdd();

        // Only apply vignette to the active layer in the current frame
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

        const centerX = w / 2;
        const centerY = h / 2;
        const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const idx = (y * w + x) * 4;

                // Calculate distance from center
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // Calculate vignette factor
                const normalizedDistance = distance / maxDistance;
                const vignetteFactor = Math.max(0, 1 - Math.pow(normalizedDistance / falloff, 2) * strength);

                // Apply vignette
                data[idx] = Math.min(255, Math.max(0, data[idx] * vignetteFactor));     // Red
                data[idx + 1] = Math.min(255, Math.max(0, data[idx + 1] * vignetteFactor)); // Green
                data[idx + 2] = Math.min(255, Math.max(0, data[idx + 2] * vignetteFactor)); // Blue
                // Alpha channel remains unchanged
            }
        }

        ctx.putImageData(imgData, 0, 0);

        // Sync to global layer
        const globalLayer = this.layers[layerIndex];
        if (globalLayer) {
            const globalCtx = globalLayer.canvas.getContext('2d');
            globalCtx.clearRect(0, 0, globalLayer.canvas.width, globalLayer.canvas.height);
            globalCtx.drawImage(layer.canvas, 0, 0);
        }

        this.renderCurrentFrameToMainCanvas();
    }

    applyFishEyeEffect(strength = 0.5) {
        // Add undo state first
        this.undoAdd();

        // Only apply fish eye to the active layer in the current frame
        const frame = this.frames[this.currentFrame];
        if (!frame || !this.activeLayerId) return;

        const layerIndex = this.layers.findIndex(l => l.id === this.activeLayerId);
        if (layerIndex === -1) return;

        const layer = frame.layers[layerIndex];
        if (!layer || !layer.isVisible) return;

        const ctx = layer.canvas.getContext('2d');
        const w = layer.canvas.width, h = layer.canvas.height;

        // Create a copy of the original image
        const originalCanvas = document.createElement('canvas');
        originalCanvas.width = w;
        originalCanvas.height = h;
        const originalCtx = originalCanvas.getContext('2d');
        originalCtx.drawImage(layer.canvas, 0, 0);

        const originalImgData = originalCtx.getImageData(0, 0, w, h);
        const originalData = originalImgData.data;

        // Clear the canvas and create new distorted image
        ctx.clearRect(0, 0, w, h);
        const newImgData = ctx.createImageData(w, h);
        const newData = newImgData.data;

        const centerX = w / 2;
        const centerY = h / 2;
        const radius = Math.min(centerX, centerY);

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const idx = (y * w + x) * 4;

                // Calculate distance from center
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < radius) {
                    // Apply fish eye distortion
                    const normalizedDistance = distance / radius;
                    const distortionFactor = 1 + strength * normalizedDistance * normalizedDistance;

                    // Calculate source coordinates
                    const sourceX = centerX + (dx / distortionFactor);
                    const sourceY = centerY + (dy / distortionFactor);

                    // Bilinear interpolation for smooth results
                    const x1 = Math.floor(sourceX);
                    const y1 = Math.floor(sourceY);
                    const x2 = Math.min(x1 + 1, w - 1);
                    const y2 = Math.min(y1 + 1, h - 1);

                    if (x1 >= 0 && y1 >= 0 && x2 < w && y2 < h) {
                        const fx = sourceX - x1;
                        const fy = sourceY - y1;

                        for (let c = 0; c < 4; c++) {
                            const p1 = originalData[(y1 * w + x1) * 4 + c];
                            const p2 = originalData[(y1 * w + x2) * 4 + c];
                            const p3 = originalData[(y2 * w + x1) * 4 + c];
                            const p4 = originalData[(y2 * w + x2) * 4 + c];

                            const interpolated = p1 * (1 - fx) * (1 - fy) +
                                p2 * fx * (1 - fy) +
                                p3 * (1 - fx) * fy +
                                p4 * fx * fy;

                            newData[idx + c] = Math.round(interpolated);
                        }
                    }
                } else {
                    // Copy original pixel if outside radius
                    for (let c = 0; c < 4; c++) {
                        newData[idx + c] = originalData[idx + c];
                    }
                }
            }
        }

        ctx.putImageData(newImgData, 0, 0);

        // Sync to global layer
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
        // Check if the active element is a text input, textarea, or contenteditable element
        const activeElement = document.activeElement;
        const isTextInput = activeElement && (
            activeElement.tagName === 'INPUT' ||
            activeElement.tagName === 'TEXTAREA' ||
            activeElement.contentEditable === 'true' ||
            activeElement.isContentEditable
        );

        // If we're in a text input, don't process keyboard shortcuts
        if (isTextInput) {
            return;
        }

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
        } else if (e.ctrlKey && e.key.toLowerCase() === 'o') {
            // Ctrl+O: Convert selection to object
            if (this.selectionActive) {
                this.convertSelectionToObject();
                e.preventDefault();
            }
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

    createObject(options = {}) {
        const newObj = new SpriteObject({
            x: canvasWidth / 2,
            y: canvasHeight / 2,
            ...options
        });

        objects[newObj.id] = newObj;
        selectObject(newObj.id);
        renderObjectsList();
        renderCanvas();
        addToHistory();

        return newObj;
    }

    deleteObject(objectId) {
        const obj = objects[objectId];
        if (!obj) return;

        // Ask user what to do with children
        if (obj.children.length > 0) {
            const action = confirm('This object has children. Click OK to delete children too, or Cancel to unparent them first.');

            if (action) {
                // Delete all descendants
                const descendants = obj.getAllDescendants(objects);
                descendants.forEach(id => {
                    delete objects[id];
                });
            } else {
                // Unparent all children
                obj.children.forEach(childId => {
                    unparentObject(childId);
                });
            }
        }

        // Remove from parent if it has one
        if (obj.parentId) {
            const parent = objects[obj.parentId];
            if (parent) {
                parent.removeChild(objectId);
            }
        }

        delete objects[objectId];

        if (selectedObjectId === objectId) {
            selectedObjectId = null;
        }

        renderObjectsList();
        renderCanvas();
        addToHistory();
    }

    getProjectData() {
        // Ensure all frame data is synced before saving
        this.syncGlobalLayersToCurrentFrame();

        return {
            canvasWidth: this.canvasWidth,
            canvasHeight: this.canvasHeight,
            frames: this.frames.map((frame, frameIndex) => ({
                isActive: frame.isActive !== undefined ? frame.isActive : true,
                layers: frame.layers.map((layer, layerIndex) => ({
                    id: layer.id,
                    name: layer.name,
                    isVisible: layer.isVisible !== undefined ? layer.isVisible : true,
                    opacity: layer.opacity !== undefined ? layer.opacity : 100,
                    blendMode: layer.blendMode || 'source-over',
                    image: layer.canvas && layer.canvas.width > 0 && layer.canvas.height > 0
                        ? layer.canvas.toDataURL('image/png')
                        : null
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
            fps: this.fps,
            // FIX: Save ALL sprite object transform properties
            objectInstances: this.objectInstances.map(obj => ({
                id: obj.id,
                name: obj.name,
                visible: obj.visible,
                alpha: obj.alpha,
                hue: obj.hue,
                layerId: obj.layerId,
                tween: obj.tween,
                keyframes: Object.fromEntries(
                    Object.entries(obj.keyframes).map(([frame, transform]) => [
                        frame,
                        {
                            x: transform.x,
                            y: transform.y,
                            scaleX: transform.scaleX !== undefined ? transform.scaleX : 1,
                            scaleY: transform.scaleY !== undefined ? transform.scaleY : 1,
                            angle: transform.angle || 0,
                            flipX: transform.flipX || false,
                            flipY: transform.flipY || false,
                            skewX: transform.skewX || 0,
                            skewY: transform.skewY || 0,
                            image: transform.image ? this.imageToDataURL(transform.image) : null
                        }
                    ])
                )
            })),
            // Save object library
            objectLibrary: this.objectLibrary.map(objDef => ({
                id: objDef.id,
                name: objDef.name,
                width: objDef.width,
                height: objDef.height,
                image: objDef.image ? this.imageToDataURL(objDef.image) : null
            }))
        };
    }

    imageToDataURL(image) {
        if (!image) return null;

        // If it's already a data URL string, return as-is
        if (typeof image === 'string' && image.startsWith('data:')) {
            return image;
        }

        // If it's an Image object with src, return the src
        if (image instanceof Image && image.src) {
            return image.src;
        }

        // If it's a Canvas object, convert to data URL
        if (image instanceof HTMLCanvasElement) {
            return image.toDataURL('image/png');
        }

        // For any other image object, try to draw it to a canvas and convert
        try {
            const canvas = document.createElement('canvas');
            canvas.width = image.width || image.naturalWidth || 100;
            canvas.height = image.height || image.naturalHeight || 100;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0);
            return canvas.toDataURL('image/png');
        } catch (e) {
            console.warn('Failed to convert image to data URL:', e);
            return null;
        }
    }

    loadImageFromDataURL(dataURL) {
        return new Promise((resolve, reject) => {
            if (!dataURL || typeof dataURL !== 'string') {
                reject(new Error('Invalid data URL'));
                return;
            }

            const img = new Image();

            img.onload = () => {
                resolve(img);
            };

            img.onerror = (err) => {
                reject(new Error('Failed to load image: ' + err.message));
            };

            // Set crossOrigin before src to handle potential CORS issues
            img.crossOrigin = 'anonymous';
            img.src = dataURL;
        });
    }

    loadProjectData(data) {
        // Restore essential project data
        this.canvasWidth = data.canvasWidth || 320;
        this.canvasHeight = data.canvasHeight || 240;
        this.currentFrame = data.currentFrame || 0;
        this.activeLayerId = data.activeLayerId || null;
        this.fps = data.fps || 12;

        // Clear existing objects and library
        this.objectInstances = [];
        this.objectLibrary = [];
        this.selectedObjectInstance = null;

        // Restore layers structure first
        this.layers = data.layers.map(l => ({
            ...l,
            canvas: this.createLayerCanvas()
        }));

        // Keep track of loading progress
        let totalImages = 0;
        let loadedImages = 0;

        // Count total images that need to be loaded (frames + objects + library)
        data.frames.forEach(frame => {
            frame.layers.forEach(layerData => {
                if (layerData.image) totalImages++;
            });
        });

        // Count object images
        const objectsData = data.objectInstances || data.objects || [];
        objectsData.forEach(objData => {
            Object.values(objData.keyframes || {}).forEach(transform => {
                if (transform.image && typeof transform.image === 'string') {
                    totalImages++;
                }
            });
        });

        // Count library images
        if (data.objectLibrary) {
            data.objectLibrary.forEach(objDef => {
                if (objDef.image) totalImages++;
            });
        }

        const checkComplete = () => {
            if (loadedImages >= totalImages) {
                // All images loaded, now update UI
                setTimeout(() => {
                    this.selectFrame(this.currentFrame);
                    this.renderLayersList();
                    this.updateFramesList();
                    this.updateObjectLibraryList();
                    this.renderObjectsList();
                    this.refreshObjectLayerDropdown();

                    // FIX: Update scene objects manager after loading
                    if (this.sceneObjectsManager) {
                        this.sceneObjectsManager.refresh();
                    }

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

        // Load object library first
        if (data.objectLibrary) {
            data.objectLibrary.forEach(objDefData => {
                if (objDefData.image) {
                    this.loadImageFromDataURL(objDefData.image).then(img => {
                        const objDef = {
                            id: objDefData.id,
                            name: objDefData.name,
                            width: objDefData.width,
                            height: objDefData.height,
                            image: img
                        };
                        this.objectLibrary.push(objDef);
                        loadedImages++;
                        checkComplete();
                    }).catch(err => {
                        console.error('Failed to load object library image:', objDefData.name, err);
                        const objDef = {
                            id: objDefData.id,
                            name: objDefData.name,
                            width: objDefData.width,
                            height: objDefData.height,
                            image: null
                        };
                        this.objectLibrary.push(objDef);
                        loadedImages++;
                        checkComplete();
                    });
                } else {
                    const objDef = {
                        id: objDefData.id,
                        name: objDefData.name,
                        width: objDefData.width,
                        height: objDefData.height,
                        image: null
                    };
                    this.objectLibrary.push(objDef);
                }
            });
        }

        // Load sprite objects
        if (objectsData.length > 0) {
            objectsData.forEach(objData => {
                const obj = new SpriteObject({
                    id: objData.id,
                    name: objData.name,
                    x: 0,
                    y: 0,
                    scaleX: 1,
                    scaleY: 1,
                    angle: 0,
                    image: null
                });

                // Restore object properties
                obj.visible = objData.visible !== undefined ? objData.visible : true;
                obj.alpha = objData.alpha !== undefined ? objData.alpha : 1;
                obj.hue = objData.hue || 0;
                obj.layerId = objData.layerId;
                obj.tween = objData.tween !== undefined ? objData.tween : true;

                // Load keyframes with images - FIX: Load ALL transform properties
                const keyframePromises = [];
                Object.entries(objData.keyframes || {}).forEach(([frame, transformData]) => {
                    if (transformData.image && typeof transformData.image === 'string') {
                        const promise = this.loadImageFromDataURL(transformData.image).then(img => {
                            obj.setKeyframe(parseInt(frame), {
                                x: transformData.x || 0,
                                y: transformData.y || 0,
                                scaleX: transformData.scaleX !== undefined ? transformData.scaleX : 1,
                                scaleY: transformData.scaleY !== undefined ? transformData.scaleY : 1,
                                angle: transformData.angle || 0,
                                flipX: transformData.flipX || false,
                                flipY: transformData.flipY || false,
                                skewX: transformData.skewX || 0,
                                skewY: transformData.skewY || 0,
                                image: img
                            });
                        }).catch(err => {
                            console.error('Failed to load object keyframe image:', objData.name, 'frame:', frame, err);
                            obj.setKeyframe(parseInt(frame), {
                                x: transformData.x || 0,
                                y: transformData.y || 0,
                                scaleX: transformData.scaleX !== undefined ? transformData.scaleX : 1,
                                scaleY: transformData.scaleY !== undefined ? transformData.scaleY : 1,
                                angle: transformData.angle || 0,
                                flipX: transformData.flipX || false,
                                flipY: transformData.flipY || false,
                                skewX: transformData.skewX || 0,
                                skewY: transformData.skewY || 0,
                                image: null
                            });
                        });
                        keyframePromises.push(promise);
                    } else {
                        obj.setKeyframe(parseInt(frame), {
                            x: transformData.x || 0,
                            y: transformData.y || 0,
                            scaleX: transformData.scaleX !== undefined ? transformData.scaleX : 1,
                            scaleY: transformData.scaleY !== undefined ? transformData.scaleY : 1,
                            angle: transformData.angle || 0,
                            flipX: transformData.flipX || false,
                            flipY: transformData.flipY || false,
                            skewX: transformData.skewX || 0,
                            skewY: transformData.skewY || 0,
                            image: null
                        });
                    }
                });

                // Wait for all keyframes to load for this object
                Promise.all(keyframePromises).then(() => {
                    loadedImages += keyframePromises.length;
                    checkComplete();
                });

                this.objectInstances.push(obj);
            });
        }

        // Rest of the method remains the same...
        // Restore frames with proper layer distribution and active states
        this.frames = data.frames.map((frameData, frameIndex) => ({
            isActive: frameData.isActive !== undefined ? frameData.isActive : true,
            layers: frameData.layers.map((layerData, layerIndex) => {
                const canvas = this.createLayerCanvas();
                const ctx = canvas.getContext('2d');

                // Load image data for this specific layer
                if (layerData.image) {
                    this.loadImageFromDataURL(layerData.image).then(img => {
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
                    }).catch(err => {
                        console.error(`Failed to load image for frame ${frameIndex}, layer ${layerIndex}:`, err);
                        loadedImages++;
                        checkComplete();
                    });
                } else {
                    if (totalImages === 0) {
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
            if (format === "frames-zip" || format === "png-sequence") {
                this.exportFramesAsZip(name);
            } else {
                this._doExportAnimation(name, format);
            }
        };
        // Cancel export
        cancelBtn.onclick = () => {
            modal.classList.add('hidden');
        };
    }

    // --- EXPORT ALL FRAMES AS ZIP ---
    async exportFramesAsZip(name = "frames") {
        // Dynamically load JSZip if not already loaded
        if (typeof window.JSZip === "undefined") {
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = "https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js";
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }
        const JSZip = window.JSZip;

        const zip = new JSZip();
        const activeFrames = this.frames.filter(frame => frame.isActive !== false);

        if (activeFrames.length === 0) {
            alert("No active frames to export!");
            return;
        }

        // Prepare all frames as PNG blobs
        const pngPromises = activeFrames.map((frame, idx) => {
            return new Promise(resolve => {
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = this.canvasWidth;
                tempCanvas.height = this.canvasHeight;
                const tempCtx = tempCanvas.getContext('2d');

                // Draw all visible layers
                for (let i = 0; i < frame.layers.length; i++) {
                    const layer = frame.layers[i];
                    if (!layer.isVisible) continue;
                    tempCtx.globalAlpha = layer.opacity / 100;
                    tempCtx.globalCompositeOperation = layer.blendMode;
                    tempCtx.drawImage(layer.canvas, 0, 0);
                }

                // Draw objects with visibility check
                tempCtx.globalAlpha = 1.0;
                tempCtx.globalCompositeOperation = 'source-over';

                for (const obj of this.objectInstances) {
                    if (obj.visible === false) continue;

                    if (obj.layerId) {
                        const objectLayer = this.layers.find(l => l.id === obj.layerId);
                        if (objectLayer && !objectLayer.isVisible) {
                            continue;
                        }
                    }

                    // Get complete transform for this frame
                    const transform = obj.getTransformAt(idx);
                    if (!transform.image) continue;

                    tempCtx.save();

                    // Apply drop shadow first (behind the object)
                    if (obj.dropShadow && obj.dropShadow.enabled && transform.image) {
                        tempCtx.save();
                        tempCtx.globalAlpha = (obj.dropShadow.opacity / 100) * (obj.alpha || 1);
                        tempCtx.shadowColor = obj.dropShadow.color;
                        tempCtx.shadowBlur = obj.dropShadow.blur;
                        tempCtx.shadowOffsetX = obj.dropShadow.offsetX;
                        tempCtx.shadowOffsetY = obj.dropShadow.offsetY;

                        tempCtx.translate(transform.x, transform.y);
                        tempCtx.rotate(transform.angle * Math.PI / 180);

                        const skewX = (transform.skewX || 0) * Math.PI / 180;
                        const skewY = (transform.skewY || 0) * Math.PI / 180;
                        if (skewX !== 0 || skewY !== 0) {
                            tempCtx.transform(1, Math.tan(skewY), Math.tan(skewX), 1, 0, 0);
                        }

                        let finalScaleX = transform.scaleX || 1;
                        let finalScaleY = transform.scaleY || 1;
                        if (transform.flipX) finalScaleX = -Math.abs(finalScaleX);
                        if (transform.flipY) finalScaleY = -Math.abs(finalScaleY);
                        tempCtx.scale(finalScaleX, finalScaleY);

                        tempCtx.drawImage(transform.image, -transform.image.width / 2, -transform.image.height / 2);
                        tempCtx.restore();
                    }

                    // Apply glow effect (multiple layers for better effect)
                    if (obj.glow && obj.glow.enabled && transform.image) {
                        for (let i = 1; i <= 3; i++) {
                            tempCtx.save();
                            tempCtx.globalAlpha = (obj.glow.intensity / 100) * 0.3 * (obj.alpha || 1);
                            tempCtx.shadowColor = obj.glow.color;
                            tempCtx.shadowBlur = obj.glow.size * i;
                            tempCtx.shadowOffsetX = 0;
                            tempCtx.shadowOffsetY = 0;

                            tempCtx.translate(transform.x, transform.y);
                            tempCtx.rotate(transform.angle * Math.PI / 180);

                            const skewX = (transform.skewX || 0) * Math.PI / 180;
                            const skewY = (transform.skewY || 0) * Math.PI / 180;
                            if (skewX !== 0 || skewY !== 0) {
                                tempCtx.transform(1, Math.tan(skewY), Math.tan(skewX), 1, 0, 0);
                            }

                            let finalScaleX = transform.scaleX || 1;
                            let finalScaleY = transform.scaleY || 1;
                            if (transform.flipX) finalScaleX = -Math.abs(finalScaleX);
                            if (transform.flipY) finalScaleY = -Math.abs(finalScaleY);
                            tempCtx.scale(finalScaleX, finalScaleY);

                            tempCtx.drawImage(transform.image, -transform.image.width / 2, -transform.image.height / 2);
                            tempCtx.restore();
                        }
                    }

                    // Now draw the main object
                    tempCtx.globalAlpha = obj.alpha !== undefined ? obj.alpha : 1;

                    // Build CSS filter string for color effects
                    let filters = [];

                    if (obj.hue && obj.hue !== 0) {
                        filters.push(`hue-rotate(${obj.hue}deg)`);
                    }

                    if (obj.saturation !== undefined && obj.saturation !== 100) {
                        filters.push(`saturate(${obj.saturation}%)`);
                    }

                    if (obj.brightness !== undefined && obj.brightness !== 100) {
                        filters.push(`brightness(${obj.brightness}%)`);
                    }

                    if (obj.contrast !== undefined && obj.contrast !== 100) {
                        filters.push(`contrast(${obj.contrast}%)`);
                    }

                    // Apply all filters at once
                    if (filters.length > 0) {
                        tempCtx.filter = filters.join(' ');
                    } else {
                        tempCtx.filter = 'none';
                    }

                    tempCtx.translate(transform.x, transform.y);
                    tempCtx.rotate(transform.angle * Math.PI / 180);

                    // Apply skew transform
                    const skewX = (transform.skewX || 0) * Math.PI / 180;
                    const skewY = (transform.skewY || 0) * Math.PI / 180;
                    if (skewX !== 0 || skewY !== 0) {
                        tempCtx.transform(1, Math.tan(skewY), Math.tan(skewX), 1, 0, 0);
                    }

                    // Apply scaling with flip support
                    let finalScaleX = transform.scaleX || 1;
                    let finalScaleY = transform.scaleY || 1;

                    if (transform.flipX) finalScaleX = -Math.abs(finalScaleX);
                    if (transform.flipY) finalScaleY = -Math.abs(finalScaleY);

                    tempCtx.scale(finalScaleX, finalScaleY);

                    tempCtx.drawImage(
                        transform.image,
                        -transform.image.width / 2,
                        -transform.image.height / 2
                    );
                    tempCtx.restore();
                }

                tempCanvas.toBlob(blob => {
                    resolve({ idx, blob });
                }, 'image/png');
            });
        });

        // Wait for all PNGs
        const pngs = await Promise.all(pngPromises);

        // Add to zip
        pngs.forEach(({ idx, blob }) => {
            zip.file(`frame_${String(idx + 1).padStart(2, '0')}.png`, blob);
        });

        // Generate and download zip
        const zipBlob = await zip.generateAsync({ type: "blob" });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(zipBlob);
        a.download = name + ".zip";
        a.click();
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

            // Enhanced frame addition with sub-frame interpolation for smooth tweening
            const addFramesAsync = async () => {
                // Calculate how many sub-frames to render for smoother object animation
                const subFrameSteps = 4; // Render 4x more frames for smoother tweening
                const totalSubFrames = totalFrames * subFrameSteps;

                for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
                    if (cancelled) return;

                    // Render multiple sub-frames for this frame to get smooth tweening
                    for (let subStep = 0; subStep < subFrameSteps; subStep++) {
                        if (cancelled) return;

                        const subFrameProgress = subStep / subFrameSteps;
                        const currentSubFrame = frameIndex * subFrameSteps + subStep;

                        const tempCanvas = document.createElement('canvas');
                        tempCanvas.width = this.canvasWidth;
                        tempCanvas.height = this.canvasHeight;
                        const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
                        const frame = activeFrames[frameIndex];

                        // Draw layers first
                        for (let i = 0; i < frame.layers.length; i++) {
                            const layer = frame.layers[i];
                            if (!layer.isVisible) continue;
                            tempCtx.globalAlpha = layer.opacity / 100;
                            tempCtx.globalCompositeOperation = layer.blendMode;
                            tempCtx.drawImage(layer.canvas, 0, 0);
                        }

                        // Draw objects with sub-frame interpolation for smooth tweening
                        tempCtx.globalAlpha = 1.0;
                        tempCtx.globalCompositeOperation = 'source-over';

                        for (const obj of this.objectInstances) {
                            if (obj.visible === false) continue;

                            // Check if the object's layer is visible
                            if (obj.layerId) {
                                const objectLayer = this.layers.find(l => l.id === obj.layerId);
                                if (objectLayer && !objectLayer.isVisible) {
                                    continue;
                                }
                            }

                            // Get interpolated transform with sub-frame smoothing
                            let transform;
                            if (obj.tween && subFrameProgress > 0 && frameIndex < totalFrames - 1) {
                                // Calculate sub-frame interpolated position for smooth animation
                                const currentTransform = obj.getTransformAt(frameIndex);
                                const nextFrameIndex = frameIndex + 1;
                                const nextTransform = obj.getTransformAt(nextFrameIndex);

                                // Interpolate ALL transform properties with sub-frame precision
                                transform = {
                                    x: this.lerp(currentTransform.x, nextTransform.x, subFrameProgress),
                                    y: this.lerp(currentTransform.y, nextTransform.y, subFrameProgress),
                                    scaleX: this.lerp(currentTransform.scaleX || 1, nextTransform.scaleX || 1, subFrameProgress),
                                    scaleY: this.lerp(currentTransform.scaleY || 1, nextTransform.scaleY || 1, subFrameProgress),
                                    angle: this.lerpAngle(currentTransform.angle, nextTransform.angle, subFrameProgress),
                                    flipX: currentTransform.flipX || false, // Flips don't interpolate
                                    flipY: currentTransform.flipY || false,
                                    skewX: this.lerp(currentTransform.skewX || 0, nextTransform.skewX || 0, subFrameProgress),
                                    skewY: this.lerp(currentTransform.skewY || 0, nextTransform.skewY || 0, subFrameProgress),
                                    image: currentTransform.image || nextTransform.image
                                };
                            } else {
                                // Use exact keyframe transform
                                transform = obj.getTransformAt(frameIndex);
                            }

                            if (!transform.image) continue;

                            tempCtx.save();

                            // Apply drop shadow first (behind the object)
                            if (obj.dropShadow && obj.dropShadow.enabled && transform.image) {
                                tempCtx.save();
                                tempCtx.globalAlpha = (obj.dropShadow.opacity / 100) * (obj.alpha || 1);
                                tempCtx.shadowColor = obj.dropShadow.color;
                                tempCtx.shadowBlur = obj.dropShadow.blur;
                                tempCtx.shadowOffsetX = obj.dropShadow.offsetX;
                                tempCtx.shadowOffsetY = obj.dropShadow.offsetY;

                                tempCtx.translate(transform.x, transform.y);
                                tempCtx.rotate(transform.angle * Math.PI / 180);

                                const skewX = (transform.skewX || 0) * Math.PI / 180;
                                const skewY = (transform.skewY || 0) * Math.PI / 180;
                                if (skewX !== 0 || skewY !== 0) {
                                    tempCtx.transform(1, Math.tan(skewY), Math.tan(skewX), 1, 0, 0);
                                }

                                let finalScaleX = transform.scaleX || 1;
                                let finalScaleY = transform.scaleY || 1;
                                if (transform.flipX) finalScaleX = -Math.abs(finalScaleX);
                                if (transform.flipY) finalScaleY = -Math.abs(finalScaleY);
                                tempCtx.scale(finalScaleX, finalScaleY);

                                tempCtx.drawImage(transform.image, -transform.image.width / 2, -transform.image.height / 2);
                                tempCtx.restore();
                            }

                            // Apply glow effect (multiple layers for better effect)
                            if (obj.glow && obj.glow.enabled && transform.image) {
                                for (let i = 1; i <= 3; i++) {
                                    tempCtx.save();
                                    tempCtx.globalAlpha = (obj.glow.intensity / 100) * 0.3 * (obj.alpha || 1);
                                    tempCtx.shadowColor = obj.glow.color;
                                    tempCtx.shadowBlur = obj.glow.size * i;
                                    tempCtx.shadowOffsetX = 0;
                                    tempCtx.shadowOffsetY = 0;

                                    tempCtx.translate(transform.x, transform.y);
                                    tempCtx.rotate(transform.angle * Math.PI / 180);

                                    const skewX = (transform.skewX || 0) * Math.PI / 180;
                                    const skewY = (transform.skewY || 0) * Math.PI / 180;
                                    if (skewX !== 0 || skewY !== 0) {
                                        tempCtx.transform(1, Math.tan(skewY), Math.tan(skewX), 1, 0, 0);
                                    }

                                    let finalScaleX = transform.scaleX || 1;
                                    let finalScaleY = transform.scaleY || 1;
                                    if (transform.flipX) finalScaleX = -Math.abs(finalScaleX);
                                    if (transform.flipY) finalScaleY = -Math.abs(finalScaleY);
                                    tempCtx.scale(finalScaleX, finalScaleY);

                                    tempCtx.drawImage(transform.image, -transform.image.width / 2, -transform.image.height / 2);
                                    tempCtx.restore();
                                }
                            }

                            // Now draw the main object
                            tempCtx.globalAlpha = obj.alpha !== undefined ? obj.alpha : 1;

                            // Build CSS filter string for color effects
                            let filters = [];

                            if (obj.hue && obj.hue !== 0) {
                                filters.push(`hue-rotate(${obj.hue}deg)`);
                            }

                            if (obj.saturation !== undefined && obj.saturation !== 100) {
                                filters.push(`saturate(${obj.saturation}%)`);
                            }

                            if (obj.brightness !== undefined && obj.brightness !== 100) {
                                filters.push(`brightness(${obj.brightness}%)`);
                            }

                            if (obj.contrast !== undefined && obj.contrast !== 100) {
                                filters.push(`contrast(${obj.contrast}%)`);
                            }

                            // Apply all filters at once
                            if (filters.length > 0) {
                                tempCtx.filter = filters.join(' ');
                            } else {
                                tempCtx.filter = 'none';
                            }

                            tempCtx.translate(transform.x, transform.y);
                            tempCtx.rotate(transform.angle * Math.PI / 180);

                            // Apply skew transform
                            const skewX = (transform.skewX || 0) * Math.PI / 180;
                            const skewY = (transform.skewY || 0) * Math.PI / 180;
                            if (skewX !== 0 || skewY !== 0) {
                                tempCtx.transform(1, Math.tan(skewY), Math.tan(skewX), 1, 0, 0);
                            }

                            // Apply scaling with flip support
                            let finalScaleX = transform.scaleX || 1;
                            let finalScaleY = transform.scaleY || 1;

                            if (transform.flipX) finalScaleX = -Math.abs(finalScaleX);
                            if (transform.flipY) finalScaleY = -Math.abs(finalScaleY);

                            tempCtx.scale(finalScaleX, finalScaleY);

                            tempCtx.drawImage(
                                transform.image,
                                -transform.image.width / 2,
                                -transform.image.height / 2
                            );
                            tempCtx.restore();
                        }

                        // Add frame to GIF with appropriate delay
                        // Use shorter delay since we're adding more frames
                        const frameDelay = (1000 / this.fps) / subFrameSteps;
                        gif.addFrame(tempCanvas, { delay: frameDelay });

                        // Update progress
                        const progressPercent = Math.round(((currentSubFrame + 1) / totalSubFrames) * 100);
                        showLoading(`Preparing GIF: ${currentSubFrame + 1}/${totalSubFrames} (${progressPercent}%)`, progressPercent);

                        // Yield to browser for UI updates
                        await new Promise(r => setTimeout(r, 5));
                    }
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
            // WebM/MP4 export with enhanced object tweening
            let capturer = new CCapture({
                format: "webm",
                framerate: this.fps * 4, // Increase framerate for smoother tweening
                verbose: true,
                name: name
            });

            let frameIdx = 0;
            const totalFrames = activeFrames.length;
            const subFrameSteps = 4; // Render 4x frames for smooth tweening
            const totalSubFrames = totalFrames * subFrameSteps;

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

                    // Render multiple sub-frames for this frame
                    for (let subStep = 0; subStep < subFrameSteps; subStep++) {
                        if (cancelled) {
                            capturer.stop();
                            hideLoading();
                            return;
                        }

                        const subFrameProgress = subStep / subFrameSteps;
                        tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
                        const frame = activeFrames[frameIdx];

                        // Draw layers
                        for (let i = 0; i < frame.layers.length; i++) {
                            const layer = frame.layers[i];
                            if (!layer.isVisible) continue;
                            tempCtx.globalAlpha = layer.opacity / 100;
                            tempCtx.globalCompositeOperation = layer.blendMode;
                            tempCtx.drawImage(layer.canvas, 0, 0);
                        }

                        // Draw objects with sub-frame interpolation
                        tempCtx.globalAlpha = 1.0;
                        tempCtx.globalCompositeOperation = 'source-over';

                        for (const obj of this.objectInstances) {
                            if (obj.visible === false) continue;

                            // Check if the object's layer is visible
                            if (obj.layerId) {
                                const objectLayer = this.layers.find(l => l.id === obj.layerId);
                                if (objectLayer && !objectLayer.isVisible) {
                                    continue;
                                }
                            }

                            // Same interpolation logic as GIF export
                            let transform;
                            if (obj.tween && subFrameProgress > 0 && frameIdx < totalFrames - 1) {
                                const currentTransform = obj.getTransformAt(frameIdx);
                                const nextTransform = obj.getTransformAt(frameIdx + 1);

                                transform = {
                                    x: this.lerp(currentTransform.x, nextTransform.x, subFrameProgress),
                                    y: this.lerp(currentTransform.y, nextTransform.y, subFrameProgress),
                                    scaleX: this.lerp(currentTransform.scaleX || 1, nextTransform.scaleX || 1, subFrameProgress),
                                    scaleY: this.lerp(currentTransform.scaleY || 1, nextTransform.scaleY || 1, subFrameProgress),
                                    angle: this.lerpAngle(currentTransform.angle, nextTransform.angle, subFrameProgress),
                                    flipX: currentTransform.flipX || false,
                                    flipY: currentTransform.flipY || false,
                                    skewX: this.lerp(currentTransform.skewX || 0, nextTransform.skewX || 0, subFrameProgress),
                                    skewY: this.lerp(currentTransform.skewY || 0, nextTransform.skewY || 0, subFrameProgress),
                                    image: currentTransform.image || nextTransform.image
                                };
                            } else {
                                transform = obj.getTransformAt(frameIdx);
                            }

                            if (!transform.image) continue;

                            tempCtx.save();

                            // Apply drop shadow first (behind the object)
                            if (obj.dropShadow && obj.dropShadow.enabled && transform.image) {
                                tempCtx.save();
                                tempCtx.globalAlpha = (obj.dropShadow.opacity / 100) * (obj.alpha || 1);
                                tempCtx.shadowColor = obj.dropShadow.color;
                                tempCtx.shadowBlur = obj.dropShadow.blur;
                                tempCtx.shadowOffsetX = obj.dropShadow.offsetX;
                                tempCtx.shadowOffsetY = obj.dropShadow.offsetY;

                                tempCtx.translate(transform.x, transform.y);
                                tempCtx.rotate(transform.angle * Math.PI / 180);

                                const skewX = (transform.skewX || 0) * Math.PI / 180;
                                const skewY = (transform.skewY || 0) * Math.PI / 180;
                                if (skewX !== 0 || skewY !== 0) {
                                    tempCtx.transform(1, Math.tan(skewY), Math.tan(skewX), 1, 0, 0);
                                }

                                let finalScaleX = transform.scaleX || 1;
                                let finalScaleY = transform.scaleY || 1;
                                if (transform.flipX) finalScaleX = -Math.abs(finalScaleX);
                                if (transform.flipY) finalScaleY = -Math.abs(finalScaleY);
                                tempCtx.scale(finalScaleX, finalScaleY);

                                tempCtx.drawImage(transform.image, -transform.image.width / 2, -transform.image.height / 2);
                                tempCtx.restore();
                            }

                            // Apply glow effect (multiple layers for better effect)
                            if (obj.glow && obj.glow.enabled && transform.image) {
                                for (let i = 1; i <= 3; i++) {
                                    tempCtx.save();
                                    tempCtx.globalAlpha = (obj.glow.intensity / 100) * 0.3 * (obj.alpha || 1);
                                    tempCtx.shadowColor = obj.glow.color;
                                    tempCtx.shadowBlur = obj.glow.size * i;
                                    tempCtx.shadowOffsetX = 0;
                                    tempCtx.shadowOffsetY = 0;

                                    tempCtx.translate(transform.x, transform.y);
                                    tempCtx.rotate(transform.angle * Math.PI / 180);

                                    const skewX = (transform.skewX || 0) * Math.PI / 180;
                                    const skewY = (transform.skewY || 0) * Math.PI / 180;
                                    if (skewX !== 0 || skewY !== 0) {
                                        tempCtx.transform(1, Math.tan(skewY), Math.tan(skewX), 1, 0, 0);
                                    }

                                    let finalScaleX = transform.scaleX || 1;
                                    let finalScaleY = transform.scaleY || 1;
                                    if (transform.flipX) finalScaleX = -Math.abs(finalScaleX);
                                    if (transform.flipY) finalScaleY = -Math.abs(finalScaleY);
                                    tempCtx.scale(finalScaleX, finalScaleY);

                                    tempCtx.drawImage(transform.image, -transform.image.width / 2, -transform.image.height / 2);
                                    tempCtx.restore();
                                }
                            }

                            // Now draw the main object
                            tempCtx.globalAlpha = obj.alpha !== undefined ? obj.alpha : 1;

                            // Build CSS filter string for color effects
                            let filters = [];

                            if (obj.hue && obj.hue !== 0) {
                                filters.push(`hue-rotate(${obj.hue}deg)`);
                            }

                            if (obj.saturation !== undefined && obj.saturation !== 100) {
                                filters.push(`saturate(${obj.saturation}%)`);
                            }

                            if (obj.brightness !== undefined && obj.brightness !== 100) {
                                filters.push(`brightness(${obj.brightness}%)`);
                            }

                            if (obj.contrast !== undefined && obj.contrast !== 100) {
                                filters.push(`contrast(${obj.contrast}%)`);
                            }

                            // Apply all filters at once
                            if (filters.length > 0) {
                                tempCtx.filter = filters.join(' ');
                            } else {
                                tempCtx.filter = 'none';
                            }

                            tempCtx.translate(transform.x, transform.y);
                            tempCtx.rotate(transform.angle * Math.PI / 180);

                            // Apply skew transform
                            const skewX = (transform.skewX || 0) * Math.PI / 180;
                            const skewY = (transform.skewY || 0) * Math.PI / 180;
                            if (skewX !== 0 || skewY !== 0) {
                                tempCtx.transform(1, Math.tan(skewY), Math.tan(skewX), 1, 0, 0);
                            }

                            // Apply scaling with flip support
                            let finalScaleX = transform.scaleX || 1;
                            let finalScaleY = transform.scaleY || 1;

                            if (transform.flipX) finalScaleX = -Math.abs(finalScaleX);
                            if (transform.flipY) finalScaleY = -Math.abs(finalScaleY);

                            tempCtx.scale(finalScaleX, finalScaleY);

                            tempCtx.drawImage(
                                transform.image,
                                -transform.image.width / 2,
                                -transform.image.height / 2
                            );
                            tempCtx.restore();
                        }

                        capturer.capture(tempCanvas);

                        const currentSubFrame = frameIdx * subFrameSteps + subStep;
                        const progressPercent = Math.round(((currentSubFrame + 1) / totalSubFrames) * 100);
                        showLoading(`Encoding WEBM: ${currentSubFrame + 1}/${totalSubFrames} (${progressPercent}%)`, progressPercent);

                        await new Promise(r => setTimeout(r, 1000 / (this.fps * subFrameSteps)));
                    }
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

    convertSelectionToObject() {
        if (!this.selectionActive || !this.selectionData) return;

        // Create a canvas from selection
        const bounds = this.getAdjustedSelectionBounds();
        const canvas = document.createElement('canvas');
        canvas.width = bounds.width;
        canvas.height = bounds.height;
        const ctx = canvas.getContext('2d');
        ctx.putImageData(this.selectionData, 0, 0);

        // Create a new object definition for the library
        const objDef = {
            id: 'lib_' + Date.now() + '_' + Math.floor(Math.random() * 10000),
            name: 'Object ' + (this.objectLibrary.length + 1),
            image: canvas,
            width: canvas.width,
            height: canvas.height
        };
        this.objectLibrary.push(objDef);
        this.updateObjectLibraryList();

        // Add an instance of the new object to the canvas at selection center
        const centerX = bounds.x + bounds.width / 2;
        const centerY = bounds.y + bounds.height / 2;
        this.addObjectInstanceToCanvas(objDef.id, centerX, centerY);

        // Clear the selection area from the layer (this is the new part)
        this.deleteSelection();

        // Remove selection after creating object
        this.clearSelection();

        // Switch to object tool and update UI
        this.currentTool = 'object-tool';
        document.querySelectorAll('.drawing-tool').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-tool') === 'object-tool');
        });

        // Hide selection options panel
        const selectionOptions = document.getElementById('selectionOptions');
        if (selectionOptions) selectionOptions.style.display = 'none';

        // Show object tool section
        const objectToolSection = document.getElementById('objectToolSection');
        if (objectToolSection) objectToolSection.style.display = 'block';

        this.renderObjectsList();
        this.renderCurrentFrameToMainCanvas();
    }

    clearSelectionAreaFromLayer() {
        if (!this.selectionActive || !this.activeLayerId) return;

        const frame = this.frames[this.currentFrame];
        const layer = frame.layers.find(l => l.id === this.activeLayerId);
        const globalLayer = this.layers.find(l => l.id === this.activeLayerId);

        if (!layer || !globalLayer) return;

        // Create a mask canvas
        const maskCanvas = document.createElement('canvas');
        maskCanvas.width = this.canvasWidth;
        maskCanvas.height = this.canvasHeight;
        const maskCtx = maskCanvas.getContext('2d');

        const bounds = this.getAdjustedSelectionBounds();

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

        // Clear the selected area from both frame layer and global layer
        [layer, globalLayer].forEach(targetLayer => {
            const ctx = targetLayer.canvas.getContext('2d');
            ctx.globalCompositeOperation = 'destination-out';
            ctx.drawImage(maskCanvas, 0, 0);
            ctx.globalCompositeOperation = 'source-over';
        });
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
        // Add undo state before starting to drag - but only once per drag operation
        if (!this.isDraggingSelection) {
            this.undoAdd();
        }

        this.isDraggingSelection = true;
        const bounds = this.getAdjustedSelectionBounds();
        this.selectionOffset = {
            x: x - bounds.x,
            y: y - bounds.y
        };
    }

    updateSelectionDrag(x, y) {
        if (!this.isDraggingSelection) return;

        // Adjust for zoom
        const mouseX = x;
        const mouseY = y;

        if (this.currentTool === 'rectangle-select' || this.selectionBounds.width > 0) {
            const newX = mouseX - this.selectionOffset.x;
            const newY = mouseY - this.selectionOffset.y;
            this.selectionBounds.x = newX;
            this.selectionBounds.y = newY;
        } else if (this.selectionPath.length > 0) {
            // Move entire path, snap to mouse position
            const bounds = this.getAdjustedSelectionBounds();
            const dx = mouseX - bounds.x - this.selectionOffset.x;
            const dy = mouseY - bounds.y - this.selectionOffset.y;
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

        // Clear the selected area from the original layer AND sync to global layer
        const layerCtx = layer.canvas.getContext('2d');
        layerCtx.globalCompositeOperation = 'destination-out';
        layerCtx.drawImage(maskCanvas, 0, 0);
        layerCtx.globalCompositeOperation = 'source-over';

        // IMPORTANT: Also clear from the global layer immediately
        const globalLayer = this.layers.find(l => l.id === this.activeLayerId);
        if (globalLayer) {
            const globalCtx = globalLayer.canvas.getContext('2d');
            globalCtx.globalCompositeOperation = 'destination-out';
            globalCtx.drawImage(maskCanvas, 0, 0);
            globalCtx.globalCompositeOperation = 'source-over';
        }
    }

    applySelectionToLayer() {
        if (!this.selectionData || !this.selectionActive) return;

        // Apply to BOTH the current frame's layer AND the global layer
        const frame = this.frames[this.currentFrame];
        const frameLayer = frame.layers.find(l => l.id === this.activeLayerId);
        const globalLayer = this.layers.find(l => l.id === this.activeLayerId);

        if (!frameLayer || !globalLayer) return;

        const bounds = this.getAdjustedSelectionBounds();
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = bounds.width;
        tempCanvas.height = bounds.height;
        const tempCtx = tempCanvas.getContext('2d');

        tempCtx.putImageData(this.selectionData, 0, 0);

        // Apply to frame layer
        const frameLayerCtx = frameLayer.canvas.getContext('2d');
        frameLayerCtx.drawImage(tempCanvas, bounds.x, bounds.y);

        // Apply to global layer
        const globalLayerCtx = globalLayer.canvas.getContext('2d');
        globalLayerCtx.drawImage(tempCanvas, bounds.x, bounds.y);
    }

    clearSelection() {
        if (this.selectionActive && this.selectionData) {
            // Apply any pending selection changes before clearing
            this.applySelectionToLayer();
            // Sync the changes to ensure consistency
            this.syncGlobalLayersToCurrentFrame();
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
        this.selectionRotateButton = null;
        this.stopSelectionAnimation();
        this.renderCurrentFrameToMainCanvas();
    }

    copySelection() {
        if (!this.selectionActive || !this.selectionData) return;
        // Store selection data and bounds for paste
        this.copiedSelection = {
            data: new ImageData(
                new Uint8ClampedArray(this.selectionData.data),
                this.selectionData.width,
                this.selectionData.height
            ),
            width: this.selectionData.width,
            height: this.selectionData.height
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

        // The selected area is already cleared from extractSelectionData()
        // Just clear the selection state
        this.selectionActive = false;
        this.selectionBounds = { x: 0, y: 0, width: 0, height: 0 };
        this.selectionPath = [];
        this.selectionData = null;
        this.isDraggingSelection = false;
        this.selectionOffset = { x: 0, y: 0 };
        this.selectionStartX = 0;
        this.selectionStartY = 0;
        this.selectionRotation = 0;
        this.selectionRotateButton = null;
        this.stopSelectionAnimation();

        // Make sure both layers are synced
        this.syncGlobalLayersToCurrentFrame();
        this.renderCurrentFrameToMainCanvas();
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

    updateRotationHotspotBounds() {
        if (!this.selectedObjectInstance) return;

        const transform = this.selectedObjectInstance.getTransformAt(this.currentFrame);
        const img = transform.image;
        if (!img) return;

        const hotspot = this.selectedObjectInstance.rotationHotspot || { x: 0, y: 0 };

        // FIX: Calculate bounds based on current scale
        const scaleX = Math.abs(transform.scaleX || 1);
        const scaleY = Math.abs(transform.scaleY || 1);
        const maxX = (img.width * scaleX) / 2;
        const maxY = (img.height * scaleY) / 2;
        const minX = -maxX;
        const minY = -maxY;

        // Clamp hotspot to current bounds
        const clampedX = Math.max(minX, Math.min(maxX, hotspot.x));
        const clampedY = Math.max(minY, Math.min(maxY, hotspot.y));

        // Update if clamping was needed
        if (Math.abs(clampedX - hotspot.x) > 0.01 || Math.abs(clampedY - hotspot.y) > 0.01) {
            this.selectedObjectInstance.setRotationHotspot(clampedX, clampedY);
        }
    }

    // OBJECTS
    initializeObjectTool() {
        // Object library controls
        const addObjectBtn = document.getElementById('addObjectToLibrary');
        const clearLibraryBtn = document.getElementById('clearObjectLibrary');
        const objectImageInput = document.getElementById('objectImageInput');
        const deleteObjectBtn = document.getElementById('deleteObject');

        if (addObjectBtn) {
            addObjectBtn.addEventListener('click', () => {
                objectImageInput.click();
            });
        }

        if (clearLibraryBtn) {
            clearLibraryBtn.addEventListener('click', () => {
                if (confirm('Clear all objects from library?')) {
                    this.objectLibrary = [];
                    this.updateObjectLibraryList();
                }
            });
        }

        if (objectImageInput) {
            objectImageInput.addEventListener('change', (e) => {
                this.handleObjectImageUpload(e);
            });
        }

        if (deleteObjectBtn) {
            deleteObjectBtn.addEventListener('click', () => {
                this.deleteSelectedObject();
            });
        }

        // Object properties controls
        const objectName = document.getElementById('objectName');
        const objectX = document.getElementById('objectX');
        const objectY = document.getElementById('objectY');
        const objectScale = document.getElementById('objectScale');
        const objectAngle = document.getElementById('objectAngle');
        const objectLayer = document.getElementById('objectLayer');
        const objectTween = document.getElementById('objectTween');
        const objectSetKeyframe = document.getElementById('objectSetKeyframe');
        const objectRemoveKeyframe = document.getElementById('objectRemoveKeyframe');
        const objectCenter = document.getElementById('objectCenter');

        // Real-time updates for all inputs
        [objectName, objectX, objectY, objectScaleX, objectScaleY, objectAngle].forEach(input => {
            if (input) {
                // Use 'input' event for real-time updates as user types
                input.addEventListener('input', () => {
                    this.updateSelectedObjectProperties();
                });
                // Also listen for 'change' event for when focus is lost
                input.addEventListener('change', () => {
                    this.updateSelectedObjectProperties();
                });
            }
        });

        // Checkbox and select elements use 'change' event
        [objectTween, objectLayer].forEach(input => {
            if (input) {
                input.addEventListener('change', () => {
                    this.updateSelectedObjectProperties();
                });
            }
        });

        [objectName, objectX, objectY, objectScale, objectAngle, objectTween].forEach(input => {
            if (input) {
                input.addEventListener('input', () => {
                    this.updateSelectedObjectProperties();
                });
            }
        });

        if (objectLayer) {
            objectLayer.addEventListener('change', () => {
                this.updateSelectedObjectProperties();
            });
        }

        if (objectSetKeyframe) {
            objectSetKeyframe.addEventListener('click', () => {
                this.setObjectKeyframe();
            });
        }

        if (objectRemoveKeyframe) {
            objectRemoveKeyframe.addEventListener('click', () => {
                this.removeObjectKeyframe();
            });
        }

        if (objectCenter) {
            objectCenter.addEventListener('click', () => {
                this.centerSelectedObject();
            });
        }

        // Initialize drag and drop
        this.initializeObjectToolDragDrop();

        // Initialize library
        this.updateObjectLibraryList();
        this.updateObjectPropertiesPanel();
    }

    refreshObjectLayerDropdown() {
        const objectLayer = document.getElementById('objectLayer');
        if (!objectLayer) return;

        const currentValue = objectLayer.value;
        objectLayer.innerHTML = '';

        this.layers.forEach(layer => {
            const option = document.createElement('option');
            option.value = layer.id;
            option.textContent = layer.name;
            if (layer.id === currentValue) {
                option.selected = true;
            }
            objectLayer.appendChild(option);
        });
    }

    handleObjectImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const img = new Image();
            img.onload = () => {
                this.addObjectToLibrary(img, file.name);
            };
            img.src = evt.target.result;
        };
        reader.readAsDataURL(file);
    }

    addObjectToLibrary(image, name) {
        const objectDef = {
            id: 'lib_' + Date.now() + '_' + Math.floor(Math.random() * 10000),
            name: name.replace(/\.[^/.]+$/, ""), // Remove file extension
            image: image,
            width: image.width,
            height: image.height
        };

        this.objectLibrary.push(objectDef);
        this.updateObjectLibraryList();
    }

    updateObjectLibraryList() {
        const list = document.getElementById('objectLibraryList');
        if (!list) return;

        list.innerHTML = '';

        if (this.objectLibrary.length === 0) {
            list.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">No objects in library. Add some images to get started!</p>';
            return;
        }

        this.objectLibrary.forEach(objDef => {
            const item = document.createElement('div');
            item.className = 'object-library-item';
            item.dataset.objectId = objDef.id;
            item.draggable = true;

            // Thumbnail
            const thumbnail = document.createElement('div');
            thumbnail.className = 'object-library-thumbnail';
            if (objDef.image) {
                const img = document.createElement('img');

                // FIX: Handle both data URLs and Image objects
                if (typeof objDef.image === 'string') {
                    // Data URL from saved project
                    img.src = objDef.image;
                } else if (objDef.image instanceof Image) {
                    // Image object from loaded project
                    img.src = objDef.image.src;
                } else if (objDef.image.src) {
                    // Image object with src property
                    img.src = objDef.image.src;
                } else {
                    // Fallback: try to convert canvas to data URL if it's a canvas
                    try {
                        img.src = objDef.image.toDataURL ? objDef.image.toDataURL() : '';
                    } catch (e) {
                        console.warn('Failed to get image source for library item:', objDef.name);
                        img.src = '';
                    }
                }

                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'cover';
                thumbnail.appendChild(img);
            } else {
                thumbnail.textContent = '📦';
            }

            // Info
            const info = document.createElement('div');
            info.className = 'object-library-info';

            const nameDiv = document.createElement('div');
            nameDiv.className = 'object-library-name';
            nameDiv.textContent = objDef.name;

            const sizeDiv = document.createElement('div');
            sizeDiv.className = 'object-library-size';
            sizeDiv.textContent = `${objDef.width}×${objDef.height}`;

            info.appendChild(nameDiv);
            info.appendChild(sizeDiv);

            item.appendChild(thumbnail);
            item.appendChild(info);

            // Events
            item.addEventListener('click', () => {
                this.selectObjectInLibrary(objDef.id);
            });

            item.addEventListener('dblclick', () => {
                this.addObjectInstanceToCanvas(objDef.id);
            });

            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', objDef.id);
                item.classList.add('dragging');
            });

            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
            });

            list.appendChild(item);
        });
    }

    selectObjectInLibrary(objectId) {
        // Remove previous selection
        document.querySelectorAll('.object-library-item').forEach(item => {
            item.classList.remove('selected');
        });

        // Add selection to clicked item
        const item = document.querySelector(`[data-object-id="${objectId}"]`);
        if (item) {
            item.classList.add('selected');
        }

        this.selectedObject = this.objectLibrary.find(obj => obj.id === objectId);
    }

    // Update scene objects list when objects change
    refreshSceneObjects() {
        if (this.sceneObjectsManager) {
            this.sceneObjectsManager.refresh();
        }
    }

    addObjectInstanceToCanvas(objectId, x = null, y = null) {
        const objDef = this.objectLibrary.find(obj => obj.id === objectId);
        if (!objDef) return;

        // Default position at canvas center
        if (x === null) x = this.canvasWidth / 2;
        if (y === null) y = this.canvasHeight / 2;

        const instance = new SpriteObject({
            name: objDef.name,
            x: x,
            y: y,
            scaleX: 1,
            scaleY: 1,
            angle: 0,
            image: objDef.image
        });

        // Set initial keyframe
        instance.setKeyframe(this.currentFrame, {
            x: x,
            y: y,
            scaleX: 1,
            scaleY: 1,
            angle: 0,
            image: objDef.image
        });

        this.objectInstances.push(instance);
        this.selectedObjectInstance = instance;

        // Update scene objects manager
        if (this.sceneObjectsManager) {
            this.sceneObjectsManager.selectedObjectId = instance.id;
            this.sceneObjectsManager.refresh();
        }

        this.renderCurrentFrameToMainCanvas();
        this.updateObjectPropertiesPanel();
        this.renderObjectsList();
    }

    updateObjectPropertiesPanel() {
        const panel = document.getElementById('objectPropertiesPanel');
        const objectName = document.getElementById('objectName');
        const objectX = document.getElementById('objectX');
        const objectY = document.getElementById('objectY');
        const objectScaleX = document.getElementById('objectScaleX');
        const objectScaleY = document.getElementById('objectScaleY');
        const objectAngle = document.getElementById('objectAngle');
        const objectLayer = document.getElementById('objectLayer');
        const objectTween = document.getElementById('objectTween');

        if (!panel) return;

        if (!this.selectedObjectInstance) {
            panel.style.display = 'none';
            return;
        }

        panel.style.display = 'block';

        const transform = this.selectedObjectInstance.getTransformAt(this.currentFrame);

        // Update input values without triggering events
        if (objectName) objectName.value = this.selectedObjectInstance.name;
        if (objectX) objectX.value = Math.round(transform.x * 10) / 10;
        if (objectY) objectY.value = Math.round(transform.y * 10) / 10;
        if (objectScaleX) objectScaleX.value = Math.round((transform.scaleX || 1) * 100) / 100;
        if (objectScaleY) objectScaleY.value = Math.round((transform.scaleY || 1) * 100) / 100;
        if (objectAngle) objectAngle.value = Math.round(transform.angle);
        if (objectTween) objectTween.checked = this.selectedObjectInstance.tween || false;

        // Update layer dropdown
        if (objectLayer) {
            objectLayer.innerHTML = '';
            this.layers.forEach(layer => {
                const option = document.createElement('option');
                option.value = layer.id;
                option.textContent = layer.name;
                if (this.selectedObjectInstance.layerId === layer.id) {
                    option.selected = true;
                }
                objectLayer.appendChild(option);
            });
        }
    }

    updateSelectedObjectProperties() {
        if (!this.selectedObjectInstance) return;

        const objectName = document.getElementById('objectName');
        const objectX = document.getElementById('objectX');
        const objectY = document.getElementById('objectY');
        const objectScaleX = document.getElementById('objectScaleX');
        const objectScaleY = document.getElementById('objectScaleY');
        const objectAngle = document.getElementById('objectAngle');
        const objectLayer = document.getElementById('objectLayer');
        const objectTween = document.getElementById('objectTween');

        // Update object properties
        if (objectName) this.selectedObjectInstance.name = objectName.value;
        if (objectLayer) this.selectedObjectInstance.layerId = objectLayer.value;
        if (objectTween) this.selectedObjectInstance.tween = objectTween.checked;

        const currentTransform = this.selectedObjectInstance.getTransformAt(this.currentFrame);

        // Parse and validate numeric inputs
        const newX = objectX ? parseFloat(objectX.value) : currentTransform.x;
        const newY = objectY ? parseFloat(objectY.value) : currentTransform.y;
        const newScaleX = objectScaleX ? parseFloat(objectScaleX.value) : (currentTransform.scaleX || 1);
        const newScaleY = objectScaleY ? parseFloat(objectScaleY.value) : (currentTransform.scaleY || 1);
        const newAngle = objectAngle ? parseFloat(objectAngle.value) : currentTransform.angle;

        // Validate values and provide sensible defaults
        const validX = isNaN(newX) ? currentTransform.x : Math.max(0, Math.min(newX, this.canvasWidth));
        const validY = isNaN(newY) ? currentTransform.y : Math.max(0, Math.min(newY, this.canvasHeight));
        const validScaleX = isNaN(newScaleX) ? (currentTransform.scaleX || 1) : Math.max(0.1, Math.min(newScaleX, 10));
        const validScaleY = isNaN(newScaleY) ? (currentTransform.scaleY || 1) : Math.max(0.1, Math.min(newScaleY, 10));
        const validAngle = isNaN(newAngle) ? currentTransform.angle : ((newAngle % 360) + 360) % 360;

        // Update transform properties
        // Update transform properties
        const newTransform = {
            x: validX,
            y: validY,
            scaleX: validScaleX,
            scaleY: validScaleY,
            angle: validAngle,
            flipX: currentTransform.flipX || false,
            flipY: currentTransform.flipY || false,
            skewX: currentTransform.skewX || 0,
            skewY: currentTransform.skewY || 0,
            image: currentTransform.image
        };

        // Set the keyframe with new transform
        this.selectedObjectInstance.setKeyframe(this.currentFrame, newTransform);

        // Update hotspot bounds after property changes
        this.updateRotationHotspotBounds();

        // Re-render to show changes immediately
        this.renderCurrentFrameToMainCanvas();
    }

    setObjectKeyframe() {
        if (!this.selectedObjectInstance) return;

        const transform = this.selectedObjectInstance.getTransformAt(this.currentFrame);
        this.selectedObjectInstance.setKeyframe(this.currentFrame, transform);

        // Update hotspot bounds
        this.updateRotationHotspotBounds();

        this.renderCurrentFrameToMainCanvas();
    }

    removeObjectKeyframe() {
        if (!this.selectedObjectInstance) return;

        this.selectedObjectInstance.removeKeyframe(this.currentFrame);
        this.updateObjectPropertiesPanel();
        this.renderCurrentFrameToMainCanvas();
    }

    centerSelectedObject() {
        if (!this.selectedObjectInstance) return;

        const transform = this.selectedObjectInstance.getTransformAt(this.currentFrame);
        const newTransform = {
            ...transform,
            x: this.canvasWidth / 2,
            y: this.canvasHeight / 2
        };

        this.selectedObjectInstance.setKeyframe(this.currentFrame, newTransform);

        // Update hotspot bounds after centering
        this.updateRotationHotspotBounds();

        this.updateObjectPropertiesPanel();
        this.renderCurrentFrameToMainCanvas();
    }

    deleteSelectedObject() {
        if (!this.selectedObjectInstance) return;

        if (confirm('Are you sure you want to delete this object?')) {
            const index = this.objectInstances.indexOf(this.selectedObjectInstance);
            if (index > -1) {
                this.objectInstances.splice(index, 1);
            }

            this.selectedObjectInstance = null;
            this.updateObjectPropertiesPanel();
            this.renderCurrentFrameToMainCanvas();
            this.renderObjectsList();
        }
    }

    initializeObjectToolDragDrop() {
        const canvasContainer = document.getElementById('canvasContainer');
        if (!canvasContainer) return;

        canvasContainer.addEventListener('dragover', (e) => {
            if (this.currentTool === 'object-tool') {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
            }
        });

        canvasContainer.addEventListener('drop', (e) => {
            if (this.currentTool !== 'object-tool') return;

            e.preventDefault();
            const objectId = e.dataTransfer.getData('text/plain');

            if (objectId && this.objectLibrary.find(obj => obj.id === objectId)) {
                const rect = this.mainCanvas.getBoundingClientRect();
                const x = (e.clientX - rect.left) / this.zoom;
                const y = (e.clientY - rect.top) / this.zoom;

                this.addObjectInstanceToCanvas(objectId, x, y);
            }
        });
    }

    // Object tool mouse handling
    handleObjectToolMouseDown(e) {
        if (this.currentTool !== 'object-tool') return;

        const rect = this.mainCanvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / this.zoom;
        const y = (e.clientY - rect.top) / this.zoom;

        // Check if clicking on transform controls
        if (this.selectedObjectInstance) {
            const transform = this.selectedObjectInstance.getTransformAt(this.currentFrame);
            if (transform.image) {
                const handle = this.getObjectTransformHandle(x, y, transform);
                if (handle) {
                    if (handle.type === 'hotspot') {
                        this.isDraggingRotationHotspot = true;
                        this.objectDragOffset = { x: 0, y: 0 }; // Will be calculated in mouse move
                        return;
                    }
                    if (handle.type === 'resize') {
                        this.isResizingObject = true;
                        this.objectResizeHandle = handle.handle;
                        this.objectResizeStartData = {
                            x: transform.x,
                            y: transform.y,
                            scaleX: transform.scaleX,
                            scaleY: transform.scaleY,
                            angle: transform.angle,
                            flipX: transform.flipX,
                            flipY: transform.flipY,
                            skewX: transform.skewX,
                            skewY: transform.skewY,
                            image: transform.image,
                            mouseStartX: x,
                            mouseStartY: y,
                            shiftKey: e.shiftKey
                        };
                        return;
                    }
                    if (handle.type === 'rotate') {
                        this.isRotatingObject = true;
                        this.objectRotateStartData = {
                            x: transform.x,
                            y: transform.y,
                            scaleX: transform.scaleX,
                            scaleY: transform.scaleY,
                            angle: transform.angle,
                            flipX: transform.flipX,
                            flipY: transform.flipY,
                            skewX: transform.skewX,
                            skewY: transform.skewY,
                            image: transform.image,
                            // Remove startAngle as it's not needed with the new approach
                            mouseStartX: x,
                            mouseStartY: y
                        };
                        return;
                    }
                    if (handle.type === 'skew') {
                        this.isSkewingObject = true;
                        this.objectSkewStartData = {
                            x: transform.x,
                            y: transform.y,
                            scaleX: transform.scaleX,
                            scaleY: transform.scaleY,
                            angle: transform.angle,
                            flipX: transform.flipX,
                            flipY: transform.flipY,
                            skewX: transform.skewX,
                            skewY: transform.skewY,
                            image: transform.image,
                            mouseStartX: x,
                            mouseStartY: y,
                            skewHandle: handle.handle
                        };
                        return;
                    }
                    if (handle.type === 'flip') {
                        this.flipObject(handle.handle);
                        return;
                    }
                }
            }
        }

        // Check if clicking on an object instance (from top to bottom)
        for (let i = this.objectInstances.length - 1; i >= 0; i--) {
            const obj = this.objectInstances[i];
            const transform = obj.getTransformAt(this.currentFrame);
            if (!transform.image) continue;

            if (this.isPointInObject(x, y, transform)) {
                this.selectedObjectInstance = obj;
                this.isDraggingObject = true;
                this.objectDragOffset = {
                    x: x - transform.x,
                    y: y - transform.y
                };
                this.updateObjectPropertiesPanel();
                this.renderCurrentFrameToMainCanvas();
                this.renderObjectsList();
                e.preventDefault();
                return;
            }
        }

        // Clicked empty space: deselect
        this.selectedObjectInstance = null;
        this.isDraggingObject = false;
        this.isResizingObject = false;
        this.isRotatingObject = false;
        this.isSkewingObject = false;
        this.isDraggingRotationHotspot = false;
        this.updateObjectPropertiesPanel();
        this.renderCurrentFrameToMainCanvas();
        this.renderObjectsList();
    }

    handleObjectToolMouseMove(e) {
        if (this.currentTool !== 'object-tool') return;

        const rect = this.mainCanvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / this.zoom;
        const y = (e.clientY - rect.top) / this.zoom;

        // Dragging rotation hotspot
        if (this.isDraggingRotationHotspot && this.selectedObjectInstance) {
            const obj = this.selectedObjectInstance;
            const transform = obj.getTransformAt(this.currentFrame);

            // Convert mouse position to object local coordinates
            const centerX = transform.x;
            const centerY = transform.y;
            const angle = -transform.angle * Math.PI / 180; // Negative for inverse rotation

            const dx = x - centerX;
            const dy = y - centerY;

            const cos = Math.cos(angle);
            const sin = Math.sin(angle);

            const localX = dx * cos - dy * sin;
            const localY = dx * sin + dy * cos;

            // FIX: Constrain hotspot to current object bounds including scale
            const img = transform.image;
            if (img) {
                const scaleX = Math.abs(transform.scaleX || 1);
                const scaleY = Math.abs(transform.scaleY || 1);
                const maxX = (img.width * scaleX) / 2;
                const maxY = (img.height * scaleY) / 2;
                const minX = -maxX;
                const minY = -maxY;

                const constrainedX = Math.max(minX, Math.min(maxX, localX));
                const constrainedY = Math.max(minY, Math.min(maxY, localY));

                obj.setRotationHotspot(constrainedX, constrainedY);
            }

            this.renderCurrentFrameToMainCanvas();
            return;
        }

        // Dragging object
        if (this.isDraggingObject && this.selectedObjectInstance) {
            const obj = this.selectedObjectInstance;
            const newX = x - this.objectDragOffset.x;
            const newY = y - this.objectDragOffset.y;
            const transform = obj.getTransformAt(this.currentFrame);
            obj.setKeyframe(this.currentFrame, {
                x: newX,
                y: newY,
                scaleX: transform.scaleX,
                scaleY: transform.scaleY,
                angle: transform.angle,
                flipX: transform.flipX,
                flipY: transform.flipY,
                skewX: transform.skewX,
                skewY: transform.skewY,
                image: transform.image
            });

            // Update hotspot bounds after moving
            this.updateRotationHotspotBounds();

            this.updateObjectPropertiesPanel();
            this.renderCurrentFrameToMainCanvas();
            return;
        }

        // Resizing object
        if (this.isResizingObject && this.selectedObjectInstance) {
            const obj = this.selectedObjectInstance;
            const start = this.objectResizeStartData;

            const deltaX = x - start.mouseStartX;
            const deltaY = y - start.mouseStartY;

            const angle = -start.angle * Math.PI / 180;
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            const localDeltaX = deltaX * cos - deltaY * sin;
            const localDeltaY = deltaX * sin + deltaY * cos;

            const img = start.image;
            if (!img) return;

            const baseScaleX = start.scaleX;
            const baseScaleY = start.scaleY;
            const baseWidth = img.width * Math.abs(baseScaleX);
            const baseHeight = img.height * Math.abs(baseScaleY);

            let newScaleX = baseScaleX;
            let newScaleY = baseScaleY;
            let newX = start.x;
            let newY = start.y;

            if (e.shiftKey || start.shiftKey) {
                // Shift held: maintain aspect ratio (uniform scaling)
                let scaleFactor = 1;

                // Calculate scale factor based on which handle is being dragged
                switch (this.objectResizeHandle) {
                    case 'nw': // Top-left: dragging inward decreases size
                        scaleFactor = 1 - Math.max(localDeltaX / baseWidth, localDeltaY / baseHeight);
                        break;
                    case 'ne': // Top-right: dragging outward increases size
                        scaleFactor = 1 + Math.max(localDeltaX / baseWidth, -localDeltaY / baseHeight);
                        break;
                    case 'sw': // Bottom-left: dragging outward increases size
                        scaleFactor = 1 + Math.max(-localDeltaX / baseWidth, localDeltaY / baseHeight);
                        break;
                    case 'se': // Bottom-right: dragging outward increases size
                        scaleFactor = 1 + Math.max(localDeltaX / baseWidth, localDeltaY / baseHeight);
                        break;
                }

                const clampedScale = Math.max(0.1, Math.min(5.0, Math.abs(baseScaleX) * scaleFactor));

                // Preserve the sign (flip state) while scaling
                newScaleX = baseScaleX >= 0 ? clampedScale : -clampedScale;
                newScaleY = baseScaleY >= 0 ? clampedScale : -clampedScale;

                // Calculate the opposite corner position in world space (this should stay fixed)
                let oppositeCornerLocalX, oppositeCornerLocalY;
                switch (this.objectResizeHandle) {
                    case 'nw': // Dragging top-left, bottom-right stays fixed
                        oppositeCornerLocalX = (img.width * Math.abs(baseScaleX)) / 2;
                        oppositeCornerLocalY = (img.height * Math.abs(baseScaleY)) / 2;
                        break;
                    case 'ne': // Dragging top-right, bottom-left stays fixed
                        oppositeCornerLocalX = -(img.width * Math.abs(baseScaleX)) / 2;
                        oppositeCornerLocalY = (img.height * Math.abs(baseScaleY)) / 2;
                        break;
                    case 'sw': // Dragging bottom-left, top-right stays fixed
                        oppositeCornerLocalX = (img.width * Math.abs(baseScaleX)) / 2;
                        oppositeCornerLocalY = -(img.height * Math.abs(baseScaleY)) / 2;
                        break;
                    case 'se': // Dragging bottom-right, top-left stays fixed
                        oppositeCornerLocalX = -(img.width * Math.abs(baseScaleX)) / 2;
                        oppositeCornerLocalY = -(img.height * Math.abs(baseScaleY)) / 2;
                        break;
                }

                // Convert opposite corner to world coordinates
                const oppositeWorldX = start.x + (oppositeCornerLocalX * cos - oppositeCornerLocalY * sin);
                const oppositeWorldY = start.y + (oppositeCornerLocalX * sin + oppositeCornerLocalY * cos);

                // Calculate new opposite corner position with new scale
                const newOppositeLocalX = oppositeCornerLocalX * (Math.abs(newScaleX) / Math.abs(baseScaleX));
                const newOppositeLocalY = oppositeCornerLocalY * (Math.abs(newScaleY) / Math.abs(baseScaleY));

                // Calculate where center should be to keep opposite corner in same world position
                newX = oppositeWorldX - (newOppositeLocalX * cos - newOppositeLocalY * sin);
                newY = oppositeWorldY - (newOppositeLocalX * sin + newOppositeLocalY * cos);

            } else {
                // No shift: resize based on handle direction (independent width/height scaling)
                let scaleFactorX = 1;
                let scaleFactorY = 1;

                switch (this.objectResizeHandle) {
                    case 'nw': // Top-left: dragging inward decreases size
                        scaleFactorX = 1 - (localDeltaX / baseWidth);
                        scaleFactorY = 1 - (localDeltaY / baseHeight);
                        break;
                    case 'ne': // Top-right: X outward increases, Y inward decreases
                        scaleFactorX = 1 + (localDeltaX / baseWidth);
                        scaleFactorY = 1 - (localDeltaY / baseHeight);
                        break;
                    case 'sw': // Bottom-left: X inward decreases, Y outward increases
                        scaleFactorX = 1 - (localDeltaX / baseWidth);
                        scaleFactorY = 1 + (localDeltaY / baseHeight);
                        break;
                    case 'se': // Bottom-right: both outward increase
                        scaleFactorX = 1 + (localDeltaX / baseWidth);
                        scaleFactorY = 1 + (localDeltaY / baseHeight);
                        break;
                }

                const clampedScaleX = Math.max(0.1, Math.min(5.0, Math.abs(baseScaleX) * scaleFactorX));
                const clampedScaleY = Math.max(0.1, Math.min(5.0, Math.abs(baseScaleY) * scaleFactorY));

                // Preserve the sign (flip state) while scaling
                newScaleX = baseScaleX >= 0 ? clampedScaleX : -clampedScaleX;
                newScaleY = baseScaleY >= 0 ? clampedScaleY : -clampedScaleY;

                // Calculate the opposite corner position in world space (this should stay fixed)
                let oppositeCornerLocalX, oppositeCornerLocalY;
                switch (this.objectResizeHandle) {
                    case 'nw':
                        oppositeCornerLocalX = (img.width * Math.abs(baseScaleX)) / 2;
                        oppositeCornerLocalY = (img.height * Math.abs(baseScaleY)) / 2;
                        break;
                    case 'ne':
                        oppositeCornerLocalX = -(img.width * Math.abs(baseScaleX)) / 2;
                        oppositeCornerLocalY = (img.height * Math.abs(baseScaleY)) / 2;
                        break;
                    case 'sw':
                        oppositeCornerLocalX = (img.width * Math.abs(baseScaleX)) / 2;
                        oppositeCornerLocalY = -(img.height * Math.abs(baseScaleY)) / 2;
                        break;
                    case 'se':
                        oppositeCornerLocalX = -(img.width * Math.abs(baseScaleX)) / 2;
                        oppositeCornerLocalY = -(img.height * Math.abs(baseScaleY)) / 2;
                        break;
                }

                // Convert opposite corner to world coordinates
                const oppositeWorldX = start.x + (oppositeCornerLocalX * cos - oppositeCornerLocalY * sin);
                const oppositeWorldY = start.y + (oppositeCornerLocalX * sin + oppositeCornerLocalY * cos);

                // Calculate new opposite corner position with new scale
                const newOppositeLocalX = oppositeCornerLocalX * (Math.abs(newScaleX) / Math.abs(baseScaleX));
                const newOppositeLocalY = oppositeCornerLocalY * (Math.abs(newScaleY) / Math.abs(baseScaleY));

                // Calculate where center should be to keep opposite corner in same world position
                newX = oppositeWorldX - (newOppositeLocalX * cos - newOppositeLocalY * sin);
                newY = oppositeWorldY - (newOppositeLocalX * sin + newOppositeLocalY * cos);
            }

            obj.setKeyframe(this.currentFrame, {
                x: newX,
                y: newY,
                scaleX: newScaleX,
                scaleY: newScaleY,
                angle: start.angle,
                flipX: start.flipX,
                flipY: start.flipY,
                skewX: start.skewX,
                skewY: start.skewY,
                image: start.image
            });

            // Update hotspot bounds after resizing
            this.updateRotationHotspotBounds();

            this.updateObjectPropertiesPanel();
            this.renderCurrentFrameToMainCanvas();
            return;
        }

        // Rotating object
        if (this.isRotatingObject && this.selectedObjectInstance) {
            const obj = this.selectedObjectInstance;
            const start = this.objectRotateStartData;

            // Get the rotation hotspot in world coordinates
            const hotspot = obj.rotationHotspot || { x: 0, y: 0 };
            const cos = Math.cos(start.angle * Math.PI / 180);
            const sin = Math.sin(start.angle * Math.PI / 180);

            // Calculate world position of hotspot (pivot point)
            const pivotX = start.x + (hotspot.x * cos - hotspot.y * sin);
            const pivotY = start.y + (hotspot.x * sin + hotspot.y * cos);

            // Calculate angle from pivot point to current mouse position
            const dx = x - pivotX;
            const dy = y - pivotY;
            const currentAngle = Math.atan2(dy, dx) * 180 / Math.PI;

            // FIX: Calculate angle from pivot to start mouse position for reference
            const startDx = start.mouseStartX - pivotX;
            const startDy = start.mouseStartY - pivotY;
            const startAngle = Math.atan2(startDy, startDx) * 180 / Math.PI;

            // Calculate rotation delta and apply to original angle
            let angleDelta = currentAngle - startAngle;

            // Normalize angle delta to -180 to 180 range
            while (angleDelta > 180) angleDelta -= 360;
            while (angleDelta < -180) angleDelta += 360;

            let newAngle = (start.angle + angleDelta + 360) % 360;

            // FIX: When rotating around hotspot, we need to adjust object position
            // to keep the hotspot at the same world position
            const newCos = Math.cos(newAngle * Math.PI / 180);
            const newSin = Math.sin(newAngle * Math.PI / 180);

            // Calculate where the object center should be to keep hotspot at pivot
            const newX = pivotX - (hotspot.x * newCos - hotspot.y * newSin);
            const newY = pivotY - (hotspot.x * newSin + hotspot.y * newCos);

            obj.setKeyframe(this.currentFrame, {
                x: newX,
                y: newY,
                scaleX: start.scaleX,
                scaleY: start.scaleY,
                angle: newAngle,
                flipX: start.flipX,
                flipY: start.flipY,
                skewX: start.skewX,
                skewY: start.skewY,
                image: start.image
            });

            this.updateObjectPropertiesPanel();
            this.renderCurrentFrameToMainCanvas();
            return;
        }

        // Skewing object - NEW IMPLEMENTATION
        if (this.isSkewingObject && this.selectedObjectInstance) {
            const obj = this.selectedObjectInstance;
            const start = this.objectSkewStartData;

            const deltaX = x - start.mouseStartX;
            const deltaY = y - start.mouseStartY;

            const img = start.image;
            if (!img) return;

            let newSkewX = start.skewX;
            let newSkewY = start.skewY;

            const maxSkew = 45; // Maximum skew in degrees
            const skewSensitivity = 0.6; // How sensitive the skewing is

            switch (start.skewHandle) {
                case 'n': // Top edge - skew X
                case 's': // Bottom edge - skew X
                    newSkewX = Math.max(-maxSkew, Math.min(maxSkew, start.skewX + deltaX * skewSensitivity));
                    break;
                case 'e': // Right edge - skew Y  
                case 'w': // Left edge - skew Y
                    newSkewY = Math.max(-maxSkew, Math.min(maxSkew, start.skewY + deltaY * skewSensitivity));
                    break;
            }

            obj.setKeyframe(this.currentFrame, {
                x: start.x,
                y: start.y,
                scaleX: start.scaleX,
                scaleY: start.scaleY,
                angle: start.angle,
                flipX: start.flipX,
                flipY: start.flipY,
                skewX: newSkewX,
                skewY: newSkewY,
                image: start.image
            });
            this.updateObjectPropertiesPanel();
            this.renderCurrentFrameToMainCanvas();
            return;
        }
    }

    handleObjectToolMouseUp(e) {
        if (this.currentTool !== 'object-tool') return;
        this.isDraggingObject = false;
        this.isResizingObject = false;
        this.isRotatingObject = false;
        this.isRotatingObject = false;
        this.isSkewingObject = false;
        this.isDraggingRotationHotspot = false;
        this.objectResizeHandle = null;
    }

    // --- Touch support for object tool ---
    mainCanvasTouchHandler(e) {
        if (this.currentTool !== 'object-tool') return;
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            const rect = this.mainCanvas.getBoundingClientRect();
            const x = (touch.clientX - rect.left) / this.zoom;
            const y = (touch.clientY - rect.top) / this.zoom;
            // Simulate mouse down/move/up
            if (e.type === 'touchstart') this.handleObjectToolMouseDown({ clientX: touch.clientX, clientY: touch.clientY, preventDefault: () => { } });
            if (e.type === 'touchmove') this.handleObjectToolMouseMove({ clientX: touch.clientX, clientY: touch.clientY, preventDefault: () => { } });
            if (e.type === 'touchend' || e.type === 'touchcancel') this.handleObjectToolMouseUp({});
            e.preventDefault();
        }
    }

    flipObject(direction) {
        if (!this.selectedObjectInstance) return;

        const transform = this.selectedObjectInstance.getTransformAt(this.currentFrame);

        // FIX: Create a new transform object with all properties
        const newTransform = {
            x: transform.x,
            y: transform.y,
            scaleX: transform.scaleX || 1,
            scaleY: transform.scaleY || 1,
            angle: transform.angle || 0,
            flipX: transform.flipX || false,
            flipY: transform.flipY || false,
            skewX: transform.skewX || 0,
            skewY: transform.skewY || 0,
            image: transform.image
        };

        if (direction === 'horizontal') {
            // Toggle horizontal flip
            newTransform.flipX = !newTransform.flipX;
        } else if (direction === 'vertical') {
            // Toggle vertical flip
            newTransform.flipY = !newTransform.flipY;
        }

        // Update the transform with all properties
        this.selectedObjectInstance.setKeyframe(this.currentFrame, newTransform);

        this.updateObjectPropertiesPanel();
        this.renderCurrentFrameToMainCanvas();
    }

    isPointInObject(x, y, transform) {
        if (!transform.image) {
            // For objects without images, use a default 48x48 size
            const halfW = 24;
            const halfH = 24;

            const dx = x - transform.x;
            const dy = y - transform.y;

            if (transform.angle === 0) {
                return Math.abs(dx) <= halfW && Math.abs(dy) <= halfH;
            } else {
                // With rotation - transform point to object space
                const cos = Math.cos(-transform.angle * Math.PI / 180);
                const sin = Math.sin(-transform.angle * Math.PI / 180);
                const localX = dx * cos - dy * sin;
                const localY = dx * sin + dy * cos;

                return Math.abs(localX) <= halfW && Math.abs(localY) <= halfH;
            }
        }

        // Calculate the bounds of the object considering scale and rotation
        const img = transform.image;
        const halfW = (img.width * transform.scaleX) / 2;
        const halfH = (img.height * transform.scaleY) / 2;

        // Simple bounding box check first (for performance)
        const dx = x - transform.x;
        const dy = y - transform.y;

        // For simple hit detection, check if point is within scaled bounds
        if (transform.angle === 0) {
            // No rotation - simple bounding box
            return Math.abs(dx) <= halfW && Math.abs(dy) <= halfH;
        } else {
            // With rotation - transform point to object space
            const cos = Math.cos(-transform.angle * Math.PI / 180);
            const sin = Math.sin(-transform.angle * Math.PI / 180);
            const localX = dx * cos - dy * sin;
            const localY = dx * sin + dy * cos;

            return Math.abs(localX) <= halfW && Math.abs(localY) <= halfH;
        }
    }

    applyObjectEffects(ctx, obj) {
        if (!obj.visible) return false; // Don't render invisible objects

        // Save current context state
        ctx.save();

        // Apply alpha
        if (obj.alpha !== undefined) {
            ctx.globalAlpha = obj.alpha;
        }

        // Create filter string for CSS filters
        let filters = [];

        if (obj.brightness !== undefined && obj.brightness !== 100) {
            filters.push(`brightness(${obj.brightness}%)`);
        }

        if (obj.contrast !== undefined && obj.contrast !== 100) {
            filters.push(`contrast(${obj.contrast}%)`);
        }

        if (obj.saturation !== undefined && obj.saturation !== 100) {
            filters.push(`saturate(${obj.saturation}%)`);
        }

        if (obj.hue !== undefined && obj.hue !== 0) {
            filters.push(`hue-rotate(${obj.hue}deg)`);
        }

        if (filters.length > 0) {
            ctx.filter = filters.join(' ');
        }

        // Apply drop shadow
        if (obj.dropShadow && obj.dropShadow.enabled) {
            ctx.shadowOffsetX = obj.dropShadow.offsetX || 3;
            ctx.shadowOffsetY = obj.dropShadow.offsetY || 3;
            ctx.shadowBlur = obj.dropShadow.blur || 5;

            // Convert hex color to rgba with opacity
            const shadowColor = obj.dropShadow.color || '#000000';
            const shadowOpacity = obj.dropShadow.opacity || 0.5;
            const rgb = hexToRgb(shadowColor);
            ctx.shadowColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${shadowOpacity})`;
        }

        return true; // Continue with rendering
    }

    applyGlowEffect(ctx, obj, renderCallback) {
        if (!obj.glow || !obj.glow.enabled) {
            renderCallback();
            return;
        }

        const glowSize = obj.glow.size || 10;
        const glowColor = obj.glow.color || '#ffffff';
        const glowIntensity = obj.glow.intensity || 0.5;

        // Create glow by rendering multiple times with blur
        ctx.save();

        // Set glow properties
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = glowSize;
        ctx.globalAlpha = glowIntensity;

        // Render the object multiple times for stronger glow
        for (let i = 0; i < 3; i++) {
            ctx.shadowOffsetX = Math.cos(i * 2.1) * 1;
            ctx.shadowOffsetY = Math.sin(i * 2.1) * 1;
            renderCallback();
        }

        ctx.restore();

        // Render the object normally on top
        renderCallback();
    }

    renderObjectWithEffects(ctx, obj, transform, image) {
        if (!obj.visible || obj.alpha <= 0) return;

        ctx.save();

        // Apply transform
        ctx.translate(transform.x, transform.y);
        ctx.rotate(transform.angle * Math.PI / 180);
        ctx.scale(transform.scaleX * (transform.flipX ? -1 : 1),
            transform.scaleY * (transform.flipY ? -1 : 1));

        if (transform.skewX !== 0 || transform.skewY !== 0) {
            ctx.transform(1, Math.tan(transform.skewY * Math.PI / 180),
                Math.tan(transform.skewX * Math.PI / 180), 1, 0, 0);
        }

        // Calculate image dimensions
        const imgWidth = image.width;
        const imgHeight = image.height;
        const drawX = -imgWidth / 2;
        const drawY = -imgHeight / 2;

        // Apply drop shadow
        if (obj.dropShadow.enabled) {
            ctx.save();
            ctx.globalAlpha = (obj.dropShadow.opacity / 100) * (obj.alpha / 100);
            ctx.filter = `blur(${obj.dropShadow.blur}px)`;

            // Create shadow by drawing the image with shadow color
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = obj.dropShadow.color;

            // Draw shadow offset
            ctx.translate(obj.dropShadow.offsetX, obj.dropShadow.offsetY);

            // Create a temporary canvas to apply color to the image
            const shadowCanvas = document.createElement('canvas');
            shadowCanvas.width = imgWidth;
            shadowCanvas.height = imgHeight;
            const shadowCtx = shadowCanvas.getContext('2d');

            // Draw the image shape in shadow color
            shadowCtx.globalCompositeOperation = 'source-over';
            shadowCtx.drawImage(image, 0, 0);
            shadowCtx.globalCompositeOperation = 'source-in';
            shadowCtx.fillStyle = obj.dropShadow.color;
            shadowCtx.fillRect(0, 0, imgWidth, imgHeight);

            ctx.drawImage(shadowCanvas, drawX, drawY);
            ctx.restore();
        }

        // Apply glow effect
        if (obj.glow.enabled) {
            ctx.save();
            ctx.globalAlpha = (obj.glow.intensity / 100) * (obj.alpha / 100);

            // Create multiple glow layers for better effect
            const glowLayers = 3;
            for (let i = glowLayers; i > 0; i--) {
                ctx.save();
                ctx.filter = `blur(${obj.glow.size * (i / glowLayers)}px)`;
                ctx.globalCompositeOperation = 'destination-over';

                // Create glow canvas
                const glowCanvas = document.createElement('canvas');
                glowCanvas.width = imgWidth;
                glowCanvas.height = imgHeight;
                const glowCtx = glowCanvas.getContext('2d');

                glowCtx.drawImage(image, 0, 0);
                glowCtx.globalCompositeOperation = 'source-in';
                glowCtx.fillStyle = obj.glow.color;
                glowCtx.fillRect(0, 0, imgWidth, imgHeight);

                ctx.drawImage(glowCanvas, drawX, drawY);
                ctx.restore();
            }
            ctx.restore();
        }

        // Apply main image with filters
        ctx.save();
        ctx.globalAlpha = obj.alpha / 100;

        // Build CSS filter string
        let filters = [];

        if (obj.hue !== 0) {
            filters.push(`hue-rotate(${obj.hue}deg)`);
        }

        if (obj.saturation !== 100) {
            filters.push(`saturate(${obj.saturation}%)`);
        }

        if (obj.brightness !== 100) {
            filters.push(`brightness(${obj.brightness}%)`);
        }

        if (obj.contrast !== 100) {
            filters.push(`contrast(${obj.contrast}%)`);
        }

        if (filters.length > 0) {
            ctx.filter = filters.join(' ');
        }

        // Draw the main image
        ctx.drawImage(image, drawX, drawY);

        ctx.restore();
        ctx.restore();
    }

    // Add object rendering to your renderCurrentFrame method
    renderObjectInstances() {
        this.objectInstances.forEach(instance => {
            if (instance.visible === false) return;

            if (instance.layerId) {
                const objectLayer = this.layers.find(l => l.id === instance.layerId);
                if (objectLayer && !objectLayer.isVisible) {
                    return;
                }
            }

            const transform = instance.getTransformAt(this.currentFrame);
            if (!transform.image && !instance.name) return;

            this.ctx.save();

            // FIX: Disable antialiasing for pixel perfect objects
            this.ctx.imageSmoothingEnabled = false;
            this.ctx.webkitImageSmoothingEnabled = false;
            this.ctx.mozImageSmoothingEnabled = false;
            this.ctx.msImageSmoothingEnabled = false;

            // Apply drop shadow first (behind the object)
            if (instance.dropShadow && instance.dropShadow.enabled && transform.image) {
                this.ctx.save();

                // Set shadow properties
                this.ctx.shadowColor = instance.dropShadow.color;
                this.ctx.shadowBlur = instance.dropShadow.blur;
                this.ctx.shadowOffsetX = instance.dropShadow.offsetX;
                this.ctx.shadowOffsetY = instance.dropShadow.offsetY;
                this.ctx.globalAlpha = (instance.dropShadow.opacity / 100) * (instance.alpha !== undefined ? instance.alpha : 1);

                // Apply transform for shadow
                this.ctx.translate(transform.x, transform.y);
                this.ctx.rotate(transform.angle * Math.PI / 180);

                // Apply skew transform for shadow
                const skewX = (transform.skewX || 0) * Math.PI / 180;
                const skewY = (transform.skewY || 0) * Math.PI / 180;
                if (skewX !== 0 || skewY !== 0) {
                    this.ctx.transform(1, Math.tan(skewY), Math.tan(skewX), 1, 0, 0);
                }

                // Apply scaling with flip support for shadow
                let shadowScaleX = transform.scaleX || 1;
                let shadowScaleY = transform.scaleY || 1;
                if (transform.flipX) shadowScaleX = -Math.abs(shadowScaleX);
                if (transform.flipY) shadowScaleY = -Math.abs(shadowScaleY);
                this.ctx.scale(shadowScaleX, shadowScaleY);

                // Draw shadow (just the shape, shadow will be automatically created)
                const img = transform.image;
                this.ctx.drawImage(img, -img.width / 2, -img.height / 2, img.width, img.height);

                this.ctx.restore();
            }

            // Apply glow effect (multiple layers for better effect)
            if (instance.glow && instance.glow.enabled && transform.image) {
                const glowLayers = 3;
                for (let i = glowLayers; i > 0; i--) {
                    this.ctx.save();

                    // Create glow with blur and color
                    this.ctx.shadowColor = instance.glow.color;
                    this.ctx.shadowBlur = instance.glow.size * (i / glowLayers);
                    this.ctx.shadowOffsetX = 0;
                    this.ctx.shadowOffsetY = 0;
                    this.ctx.globalAlpha = (instance.glow.intensity / 100) * (instance.alpha !== undefined ? instance.alpha : 1) * (0.7 / i);

                    // Apply transform for glow
                    this.ctx.translate(transform.x, transform.y);
                    this.ctx.rotate(transform.angle * Math.PI / 180);

                    // Apply skew transform for glow
                    const skewX = (transform.skewX || 0) * Math.PI / 180;
                    const skewY = (transform.skewY || 0) * Math.PI / 180;
                    if (skewX !== 0 || skewY !== 0) {
                        this.ctx.transform(1, Math.tan(skewY), Math.tan(skewX), 1, 0, 0);
                    }

                    // Apply scaling with flip support for glow
                    let glowScaleX = transform.scaleX || 1;
                    let glowScaleY = transform.scaleY || 1;
                    if (transform.flipX) glowScaleX = -Math.abs(glowScaleX);
                    if (transform.flipY) glowScaleY = -Math.abs(glowScaleY);
                    this.ctx.scale(glowScaleX, glowScaleY);

                    // Draw glow
                    const img = transform.image;
                    this.ctx.drawImage(img, -img.width / 2, -img.height / 2, img.width, img.height);

                    this.ctx.restore();
                }
            }

            // Now draw the main object with all transforms and filters
            this.ctx.translate(transform.x, transform.y);
            this.ctx.rotate(transform.angle * Math.PI / 180);

            // Apply skew transform
            const skewX = (transform.skewX || 0) * Math.PI / 180;
            const skewY = (transform.skewY || 0) * Math.PI / 180;
            if (skewX !== 0 || skewY !== 0) {
                this.ctx.transform(1, Math.tan(skewY), Math.tan(skewX), 1, 0, 0);
            }

            // Apply scaling with flip support - corrected logic
            let finalScaleX = transform.scaleX || 1;
            let finalScaleY = transform.scaleY || 1;

            // Apply flipping by negating the scale
            if (transform.flipX) finalScaleX = -Math.abs(finalScaleX);
            if (transform.flipY) finalScaleY = -Math.abs(finalScaleY);

            this.ctx.scale(finalScaleX, finalScaleY);

            // Apply object-level alpha
            this.ctx.globalAlpha = instance.alpha !== undefined ? instance.alpha : 1;

            // Build CSS filter string for color effects
            let filters = [];

            if (instance.hue && instance.hue !== 0) {
                filters.push(`hue-rotate(${instance.hue}deg)`);
            }

            if (instance.saturation !== undefined && instance.saturation !== 100) {
                filters.push(`saturate(${instance.saturation}%)`);
            }

            if (instance.brightness !== undefined && instance.brightness !== 100) {
                filters.push(`brightness(${instance.brightness}%)`);
            }

            if (instance.contrast !== undefined && instance.contrast !== 100) {
                filters.push(`contrast(${instance.contrast}%)`);
            }

            // Apply all filters at once
            if (filters.length > 0) {
                this.ctx.filter = filters.join(' ');
            } else {
                this.ctx.filter = 'none';
            }

            if (transform.image) {
                const img = transform.image;
                this.ctx.drawImage(img, -img.width / 2, -img.height / 2, img.width, img.height);
            } else {
                // Draw default placeholder for objects without images
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
                this.ctx.fillText(instance.name[0] || '?', 0, 2);
            }

            this.ctx.restore();

            // Draw selection outline and controls if selected
            if (instance === this.selectedObjectInstance && this.currentTool === 'object-tool') {
                this.drawObjectTransformControls(transform, transform.image);
            }
        });
    }

    getTransformAt(frame) {
        // If tweening is disabled, return exact keyframe or default
        if (!this.tween) {
            return this.keyframes[frame] || this.getDefaultTransform();
        }

        // Find surrounding keyframes for interpolation
        const frames = Object.keys(this.keyframes).map(Number).sort((a, b) => a - b);

        // If no keyframes, return default
        if (frames.length === 0) {
            return this.getDefaultTransform();
        }

        // If exact keyframe exists, return it
        if (this.keyframes[frame]) {
            return { ...this.keyframes[frame] };
        }

        // Find the two keyframes to interpolate between
        let beforeFrame = -1;
        let afterFrame = -1;

        for (let i = 0; i < frames.length; i++) {
            if (frames[i] < frame) {
                beforeFrame = frames[i];
            } else if (frames[i] > frame && afterFrame === -1) {
                afterFrame = frames[i];
                break;
            }
        }

        // If only keyframes after current frame, use the first one
        if (beforeFrame === -1) {
            return { ...this.keyframes[afterFrame] };
        }

        // If only keyframes before current frame, use the last one
        if (afterFrame === -1) {
            return { ...this.keyframes[beforeFrame] };
        }

        // Interpolate between the two keyframes
        const beforeTransform = this.keyframes[beforeFrame];
        const afterTransform = this.keyframes[afterFrame];
        const progress = (frame - beforeFrame) / (afterFrame - beforeFrame);

        return {
            x: this.lerp(beforeTransform.x, afterTransform.x, progress),
            y: this.lerp(beforeTransform.y, afterTransform.y, progress),
            scale: this.lerp(beforeTransform.scale, afterTransform.scale, progress),
            angle: this.lerpAngle(beforeTransform.angle, afterTransform.angle, progress),
            image: afterTransform.image || beforeTransform.image
        };
    }

    lerp(a, b, t) {
        return a + (b - a) * t;
    }

    lerpAngle(a, b, t) {
        // Handle angle wrapping for smooth rotation
        let diff = b - a;
        if (diff > 180) diff -= 360;
        if (diff < -180) diff += 360;
        return a + diff * t;
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

function updateObjectPropertiesDisplay() {
    if (!selectedObjectId || !sceneObjects[selectedObjectId]) {
        document.getElementById('objectPropertiesPanel').style.display = 'none';
        return;
    }

    const obj = sceneObjects[selectedObjectId];
    const transform = obj.getTransformAt(currentFrame);

    document.getElementById('objectPropertiesPanel').style.display = 'block';
    document.getElementById('objectName').value = obj.name || '';
    document.getElementById('objectX').value = transform.x || 0;
    document.getElementById('objectY').value = transform.y || 0;
    document.getElementById('objectScaleX').value = transform.scaleX || 1;
    document.getElementById('objectScaleY').value = transform.scaleY || 1;
    document.getElementById('objectAngle').value = transform.angle || 0;
    document.getElementById('objectTween').checked = obj.tween;

    // Update hue control
    const hueInput = document.getElementById('objectHue');
    const hueValue = document.getElementById('objectHueValue');
    if (hueInput && hueValue) {
        hueInput.value = obj.hue || 0;
        hueValue.textContent = (obj.hue || 0) + '°';
    }

    // Update layer dropdown
    const layerSelect = document.getElementById('objectLayer');
    layerSelect.innerHTML = '';
    layers.forEach(layer => {
        const option = document.createElement('option');
        option.value = layer.id;
        option.textContent = layer.name;
        option.selected = layer.id === obj.layerId;
        layerSelect.appendChild(option);
    });
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

    // Add touch menubar initialization
    initializeTouchMenubar();

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

    // Show modal when button is clicked
    document.getElementById('showAIPromptBtn').addEventListener('click', function () {
        document.getElementById('aiPromptModal').classList.remove('hidden');
    });

    // Close modal
    document.getElementById('closeAIPromptModalBtn').addEventListener('click', function () {
        document.getElementById('aiPromptModal').classList.add('hidden');
    });

    // Copy prompt to clipboard
    document.getElementById('copyAIPromptBtn').addEventListener('click', function () {
        const textarea = document.getElementById('aiPromptTemplate');
        textarea.select();
        document.execCommand('copy');
        this.textContent = 'Copied!';
        setTimeout(() => { this.textContent = 'Copy Prompt'; }, 1200);
    });

    function updateAIPromptGenerated() {
        const style = document.getElementById('aiPromptStyle').value || 'pixel-art';
        const subject = document.getElementById('aiPromptSubject').value || 'a cat';
        const width = document.getElementById('aiPromptWidth').value || '320';
        const height = document.getElementById('aiPromptHeight').value || '240';

        const prompt = `Give me javascript code to draw a ${style} image of ${subject} on a canvas of size ${width}x${height} pixels.
Return only JavaScript code that uses the HTML5 Canvas API (ctx - already defined) to draw the image.
Do not include explanations, comments, or HTML—just the code. If the style is pixel art, create a const drawPixel(x, y, color) function to set pixel colors.`;

        document.getElementById('aiPromptGenerated').value = prompt;
    }

    // Update prompt when any field changes
    ['aiPromptStyle', 'aiPromptSubject', 'aiPromptWidth', 'aiPromptHeight'].forEach(id => {
        document.getElementById(id).addEventListener('input', updateAIPromptGenerated);
    });

    // Initialize on modal open
    document.getElementById('aiPromptModal').addEventListener('show', updateAIPromptGenerated);
    // Or call updateAIPromptGenerated() after modal is shown

    document.getElementById('copyAIPromptBtn').onclick = function () {
        const prompt = document.getElementById('aiPromptGenerated').value;
        navigator.clipboard.writeText(prompt);
        // Optionally show a "Copied!" message
    };

    // Force desktop mode always
    document.body.classList.add('desktop-mode');
    document.body.classList.remove('mobile-mode');

    // --- Set pixel perfect to true by default ---
    SpriteSpark.prototype.pixelPerfect = true;

    // --- Code Drawing Feature ---
    const codeGroup = document.getElementById('codeDrawingGroup');
    const codeTextarea = document.getElementById('codeDrawingTextarea');
    const applyBtn = document.getElementById('applyCodeDrawingBtn');
    const openModalBtn = document.getElementById('openCodeModalBtn');
    const codeModal = document.getElementById('codeDrawingModal');
    const codeModalTextarea = document.getElementById('codeDrawingModalTextarea');
    const closeModalBtn = document.getElementById('closeCodeModalBtn');
    const applyModalBtn = document.getElementById('applyCodeDrawingModalBtn');
    const backToPanelBtn = document.getElementById('backToPanelBtn');

    // Panel apply button
    if (applyBtn) {
        applyBtn.onclick = () => applyCodeDrawing(codeTextarea.value);
    }

    // Open modal
    if (openModalBtn) {
        openModalBtn.onclick = () => {
            codeModalTextarea.value = codeTextarea.value;
            codeModal.style.display = 'flex';
            codeModalTextarea.focus();
        };
    }

    // Close modal
    if (closeModalBtn) {
        closeModalBtn.onclick = () => {
            codeModal.style.display = 'none';
            codeTextarea.value = codeModalTextarea.value;
            codeTextarea.focus();
        }
    }

    // Apply in modal
    if (applyModalBtn) {
        applyModalBtn.onclick = () => applyCodeDrawing(codeModalTextarea.value);
    }

    // Back to panel (copy code back)
    if (backToPanelBtn) {
        backToPanelBtn.onclick = () => {
            codeTextarea.value = codeModalTextarea.value;
            codeModal.style.display = 'none';
            codeTextarea.focus();
        };
    }

    // Modal close on outside click
    if (codeModal) {
        codeModal.onclick = (e) => {
            if (e.target === codeModal) {
                codeModal.style.display = 'none';
                codeTextarea.value = codeModalTextarea.value;
                codeTextarea.focus();
            }
        };
    }

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



    // Helper: get current layer object
    function getCurrentLayer() {
        if (!app.activeLayerId) return null;
        return app.layers.find(l => l.id === app.activeLayerId);
    }

    // Apply code from textarea to canvas
    function applyCodeDrawing(code) {
        const layer = getCurrentLayer();
        if (!layer) {
            alert('No active layer selected!');
            return;
        }
        try {
            // Provide ctx and layer as variables
            const ctx = layer.canvas.getContext('2d');
            // eslint-disable-next-line no-new-func
            new Function('ctx', 'layer', code)(ctx, layer);
            app.syncGlobalLayersToCurrentFrame();
            app.renderCurrentFrameToMainCanvas();
            app.showNotification('Code applied!', 'info');
        } catch (err) {
            app.showNotification('Error: ' + err.message, 'warning');
        }
    }

    // Touch-friendly menubar handling
    function initializeTouchMenubar() {
        const menuItems = document.querySelectorAll('.menubar .menu-item');

        menuItems.forEach(menuItem => {
            const dropdown = menuItem.querySelector('.dropdown');

            if (dropdown) {
                let touchStartTime = 0;
                let touchMoved = false;
                let touchStartY = 0;

                // Handle touch start on the menu item itself
                menuItem.addEventListener('touchstart', function (e) {
                    // Don't prevent default if touching a dropdown item
                    if (e.target.closest('.dropdown li')) {
                        return;
                    }

                    e.preventDefault();
                    touchStartTime = Date.now();
                    touchMoved = false;
                    touchStartY = e.touches[0].clientY;

                    console.log('Touch start on menu item:', menuItem.textContent); // Debug log
                }, { passive: false });

                // Handle touch move
                menuItem.addEventListener('touchmove', function (e) {
                    if (Math.abs(e.touches[0].clientY - touchStartY) > 10) {
                        touchMoved = true;
                    }
                });

                // Handle touch end on menu item
                menuItem.addEventListener('touchend', function (e) {
                    // Don't handle if touching a dropdown item
                    if (e.target.closest('.dropdown li')) {
                        return;
                    }

                    e.preventDefault();

                    const touchDuration = Date.now() - touchStartTime;

                    console.log('Touch end on menu item:', menuItem.textContent, 'Duration:', touchDuration, 'Moved:', touchMoved); // Debug log

                    // If it was a quick tap and minimal movement, toggle menu
                    if (touchDuration < 500 && !touchMoved) {
                        // Close all other menus first
                        menuItems.forEach(item => {
                            if (item !== menuItem) {
                                const otherDropdown = item.querySelector('.dropdown');
                                if (otherDropdown) {
                                    otherDropdown.classList.remove('open');
                                }
                            }
                        });

                        // Toggle this menu
                        const isOpen = dropdown.classList.contains('open');
                        if (isOpen) {
                            dropdown.classList.remove('open');
                            console.log('Closing menu:', menuItem.textContent);
                        } else {
                            dropdown.classList.add('open');
                            console.log('Opening menu:', menuItem.textContent);
                        }
                    }
                }, { passive: false });

                // Handle dropdown item touches
                const dropdownItems = dropdown.querySelectorAll('li span[data-action], li[data-action]');
                dropdownItems.forEach(item => {
                    item.addEventListener('touchstart', function (e) {
                        e.stopPropagation();
                        console.log('Touch start on dropdown item:', this.textContent); // Debug log
                    }, { passive: false });

                    item.addEventListener('touchend', function (e) {
                        e.preventDefault();
                        e.stopPropagation();

                        const action = this.getAttribute('data-action') || this.parentElement.getAttribute('data-action');
                        console.log('Touch end on dropdown item:', this.textContent, 'Action:', action); // Debug log

                        if (action) {
                            // Close all menus
                            menuItems.forEach(item => {
                                const dropdown = item.querySelector('.dropdown');
                                if (dropdown) {
                                    dropdown.classList.remove('open');
                                }
                            });

                            // Execute the action using the existing handler
                            const fakeEvent = {
                                target: this,
                                preventDefault: () => { }
                            };
                            app.handleMenuClick(fakeEvent);
                        }
                    }, { passive: false });
                });
            }
        });

        // Close menus when touching outside
        document.addEventListener('touchstart', function (e) {
            if (!e.target.closest('.menubar')) {
                console.log('Touch outside menubar, closing all menus'); // Debug log
                menuItems.forEach(item => {
                    const dropdown = item.querySelector('.dropdown');
                    if (dropdown) {
                        dropdown.classList.remove('open');
                    }
                });
            }
        }, { passive: false });
    }
});