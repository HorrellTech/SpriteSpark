class SceneObjectsManager {
    constructor(spriteApp) {
        this.app = spriteApp;
        this.selectedObjectId = null;
        this.draggedObjectId = null;
        this.expandedObjects = new Set();
        this.touchStartPos = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();

        // Only update the list if objectInstances is ready
        if (this.app.objectInstances) {
            this.updateSceneObjectsList();
        }
    }

    setupEventListeners() {
        const sceneObjectsList = document.getElementById('sceneObjectsList');
        const controls = document.querySelectorAll('.scene-objects-controls [data-action]');

        if (!sceneObjectsList) return;

        // Control buttons
        controls.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleControlAction(e.target.dataset.action);
            });
        });

        // List interactions
        sceneObjectsList.addEventListener('click', (e) => this.handleObjectClick(e));
        sceneObjectsList.addEventListener('dragstart', (e) => this.handleDragStart(e));
        sceneObjectsList.addEventListener('dragover', (e) => this.handleDragOver(e));
        sceneObjectsList.addEventListener('drop', (e) => this.handleDrop(e));
        sceneObjectsList.addEventListener('dragend', (e) => this.handleDragEnd(e));

        // Touch support
        sceneObjectsList.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        sceneObjectsList.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        sceneObjectsList.addEventListener('touchend', (e) => this.handleTouchEnd(e));
    }

    handleControlAction(action) {
        switch (action) {
            case 'add-scene-object':
                this.addNewObjectWithImageUpload();
                break;
            case 'delete-scene-object':
                //this.deleteSelectedObject();
                break;
            case 'move-object-up':
                this.moveObjectUp();
                break;
            case 'move-object-down':
                this.moveObjectDown();
                break;
            case 'toggle-object-visibility':
                this.toggleObjectVisibility();
                break;
            case 'duplicate-object':
                this.duplicateSelectedObject();
                break;
        }
    }

    addNewObjectWithImageUpload() {
        // Create a file input to allow image selection
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.loadImageAndCreateObject(file);
            } else {
                // If no file selected, create a basic object without image
                this.createBasicObject();
            }
            // Clean up
            document.body.removeChild(fileInput);
        });

        // Trigger file selection
        document.body.appendChild(fileInput);
        fileInput.click();
    }

    loadImageAndCreateObject(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // Resize image to maximum 512x512 keeping aspect ratio
                const resizedImage = this.resizeImageKeepingAspectRatio(img, 512);
                this.createObjectWithImage(resizedImage, file.name);
            };
            img.onerror = () => {
                console.error('Failed to load image');
                this.createBasicObject();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    resizeImageKeepingAspectRatio(image, maxSize) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Calculate new dimensions
        let { width, height } = image;
        const aspectRatio = width / height;
        
        if (width > height) {
            // Landscape - width is the longest axis
            if (width > maxSize) {
                width = maxSize;
                height = maxSize / aspectRatio;
            }
        } else {
            // Portrait or square - height is the longest axis
            if (height > maxSize) {
                height = maxSize;
                width = maxSize * aspectRatio;
            }
        }
        
        // Set canvas size to new dimensions
        canvas.width = Math.floor(width);
        canvas.height = Math.floor(height);
        
        // Draw resized image
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        
        // Create new image from canvas
        const resizedImage = new Image();
        resizedImage.src = canvas.toDataURL();
        return resizedImage;
    }

    createObjectWithImage(image, fileName) {
        // Create a new object instance at canvas center
        const centerX = this.app.canvasWidth / 2;
        const centerY = this.app.canvasHeight / 2;

        // First, add to object library
        const objectDef = {
            id: 'lib_' + Date.now() + '_' + Math.floor(Math.random() * 10000),
            name: fileName.replace(/\.[^/.]+$/, "") || `Object ${this.app.objectInstances.length + 1}`,
            image: image,
            width: image.width,
            height: image.height
        };

        this.app.objectLibrary.push(objectDef);
        this.app.updateObjectLibraryList();

        // Create object instance
        const newObject = new SpriteObject({
            name: objectDef.name,
            x: centerX,
            y: centerY,
            scaleX: 1,
            scaleY: 1,
            angle: 0,
            visible: true,
            alpha: 1,
            hue: 0,
            layerId: this.app.activeLayerId || (this.app.layers[0] && this.app.layers[0].id),
            image: image
        });

        // Set initial keyframe with the image
        newObject.setKeyframe(this.app.currentFrame, {
            x: centerX,
            y: centerY,
            scaleX: 1,
            scaleY: 1,
            angle: 0,
            flipX: false,
            flipY: false,
            skewX: 0,
            skewY: 0,
            image: image
        });

        this.app.objectInstances.push(newObject);
        this.selectedObjectId = newObject.id;
        this.app.selectedObjectInstance = newObject;
        
        // Switch to object tool
        this.app.currentTool = 'object-tool';
        document.querySelectorAll('.drawing-tool').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tool === 'object-tool');
        });

        // Show object tool section
        const objectToolSection = document.getElementById('objectToolSection');
        if (objectToolSection) {
            objectToolSection.style.display = 'block';
        }
        
        this.updateSceneObjectsList();
        this.app.updateObjectPropertiesPanel();
        this.app.renderObjectsList();
        this.app.renderCurrentFrameToMainCanvas();
    }

    createBasicObject() {
        // Create a new object instance at canvas center without image
        const centerX = this.app.canvasWidth / 2;
        const centerY = this.app.canvasHeight / 2;

        // Create object definition for library (without image)
        const objectDef = {
            id: 'lib_' + Date.now() + '_' + Math.floor(Math.random() * 10000),
            name: `Object ${this.app.objectInstances.length + 1}`,
            image: null,
            width: 32,
            height: 32
        };

        this.app.objectLibrary.push(objectDef);
        this.app.updateObjectLibraryList();

        const newObject = new SpriteObject({
            name: objectDef.name,
            x: centerX,
            y: centerY,
            scaleX: 1,
            scaleY: 1,
            angle: 0,
            visible: true,
            alpha: 1,
            hue: 0,
            layerId: this.app.activeLayerId || (this.app.layers[0] && this.app.layers[0].id),
            image: null
        });

        // Set initial keyframe
        newObject.setKeyframe(this.app.currentFrame, {
            x: centerX,
            y: centerY,
            scaleX: 1,
            scaleY: 1,
            angle: 0,
            flipX: false,
            flipY: false,
            skewX: 0,
            skewY: 0,
            image: null
        });

        this.app.objectInstances.push(newObject);
        this.selectedObjectId = newObject.id;
        this.app.selectedObjectInstance = newObject;
        
        // Switch to object tool
        this.app.currentTool = 'object-tool';
        document.querySelectorAll('.drawing-tool').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tool === 'object-tool');
        });

        // Show object tool section
        const objectToolSection = document.getElementById('objectToolSection');
        if (objectToolSection) {
            objectToolSection.style.display = 'block';
        }
        
        this.updateSceneObjectsList();
        this.app.updateObjectPropertiesPanel();
        this.app.renderObjectsList();
        this.app.renderCurrentFrameToMainCanvas();
    }

    addNewObject() {
        // Create a new object instance at canvas center
        const centerX = this.app.canvasWidth / 2;
        const centerY = this.app.canvasHeight / 2;

        const newObject = new SpriteObject({
            name: `Object ${this.app.objectInstances.length + 1}`,
            x: centerX,
            y: centerY,
            scaleX: 1,
            scaleY: 1,
            angle: 0,
            visible: true,
            alpha: 1,
            hue: 0,
            layerId: this.app.activeLayerId || (this.app.layers[0] && this.app.layers[0].id),
            image: null
        });

        // Set initial keyframe
        newObject.setKeyframe(this.app.currentFrame, {
            x: centerX,
            y: centerY,
            scaleX: 1,
            scaleY: 1,
            angle: 0,
            flipX: false,
            flipY: false,
            skewX: 0,
            skewY: 0,
            image: null
        });

        this.app.objectInstances.push(newObject);
        this.selectedObjectId = newObject.id;
        this.app.selectedObjectInstance = newObject;
        
        this.updateSceneObjectsList();
        this.app.updateObjectPropertiesPanel();
        this.app.renderObjectsList();
        this.app.renderCurrentFrameToMainCanvas();
    }

    deleteSelectedObject() {
        if (!this.selectedObjectId) return;

        const objectIndex = this.app.objectInstances.findIndex(obj => obj.id === this.selectedObjectId);
        if (objectIndex === -1) return;

        // Remove from objectInstances array
        this.app.objectInstances.splice(objectIndex, 1);
        
        // Clear selection
        this.selectedObjectId = null;
        this.app.selectedObjectInstance = null;
        
        this.updateSceneObjectsList();
        this.app.updateObjectPropertiesPanel();
        this.app.renderObjectsList();
        this.app.renderCurrentFrameToMainCanvas();
    }

    duplicateSelectedObject() {
        if (!this.selectedObjectId) return;

        const originalObj = this.app.objectInstances.find(obj => obj.id === this.selectedObjectId);
        if (!originalObj) return;

        // Create a duplicate
        const duplicateObj = new SpriteObject({
            name: originalObj.name + ' Copy',
            x: 0,
            y: 0,
            scaleX: 1,
            scaleY: 1,
            angle: 0,
            visible: originalObj.visible,
            alpha: originalObj.alpha,
            hue: originalObj.hue,
            layerId: originalObj.layerId,
            tween: originalObj.tween,
            image: null
        });

        // Copy all keyframes from original
        Object.entries(originalObj.keyframes).forEach(([frame, transform]) => {
            duplicateObj.setKeyframe(parseInt(frame), {
                x: transform.x + 20, // Offset slightly
                y: transform.y + 20,
                scaleX: transform.scaleX || 1,
                scaleY: transform.scaleY || 1,
                angle: transform.angle || 0,
                flipX: transform.flipX || false,
                flipY: transform.flipY || false,
                skewX: transform.skewX || 0,
                skewY: transform.skewY || 0,
                image: transform.image
            });
        });

        this.app.objectInstances.push(duplicateObj);
        this.selectedObjectId = duplicateObj.id;
        this.app.selectedObjectInstance = duplicateObj;
        
        this.updateSceneObjectsList();
        this.app.updateObjectPropertiesPanel();
        this.app.renderObjectsList();
        this.app.renderCurrentFrameToMainCanvas();
    }

    moveObjectUp() {
        if (!this.selectedObjectId) return;
        this.changeObjectOrder(this.selectedObjectId, -1);
    }

    moveObjectDown() {
        if (!this.selectedObjectId) return;
        this.changeObjectOrder(this.selectedObjectId, 1);
    }

    changeObjectOrder(objectId, direction) {
        const currentIndex = this.app.objectInstances.findIndex(obj => obj.id === objectId);
        if (currentIndex === -1) return;

        const newIndex = currentIndex + direction;
        if (newIndex < 0 || newIndex >= this.app.objectInstances.length) return;

        // Swap objects in array
        const temp = this.app.objectInstances[currentIndex];
        this.app.objectInstances[currentIndex] = this.app.objectInstances[newIndex];
        this.app.objectInstances[newIndex] = temp;

        this.updateSceneObjectsList();
        this.app.renderCurrentFrameToMainCanvas();
    }

    toggleObjectVisibility() {
        if (!this.selectedObjectId) return;
        
        const obj = this.app.objectInstances.find(obj => obj.id === this.selectedObjectId);
        if (!obj) return;

        obj.visible = !obj.visible;
        this.updateSceneObjectsList();
        this.app.renderCurrentFrameToMainCanvas();
    }

    handleObjectClick(e) {
        const objectItem = e.target.closest('.scene-object-item');
        if (!objectItem) return;

        const objectId = objectItem.dataset.objectId;
        const obj = this.app.objectInstances.find(obj => obj.id === objectId);
        
        if (e.target.classList.contains('scene-object-visibility')) {
            this.toggleSingleObjectVisibility(objectId);
            return;
        }

        // Allow selection of hidden objects for unhiding purposes
        // But don't allow them to be selected as the active object for manipulation
        if (obj && !obj.visible) {
            // Still update the visual selection but don't set as active object
            this.selectedObjectId = objectId;
            this.app.selectedObjectInstance = null; // Don't set as active for manipulation
            this.updateSceneObjectsList();
            this.app.updateObjectPropertiesPanel();
            return;
        }

        // Select visible object normally
        this.selectedObjectId = objectId;
        this.app.selectedObjectInstance = this.app.objectInstances.find(obj => obj.id === objectId);
        
        this.updateSceneObjectsList();
        this.app.updateObjectPropertiesPanel();
        this.app.renderObjectsList();
        this.app.renderCurrentFrameToMainCanvas();
    }

    toggleSingleObjectVisibility(objectId) {
        const obj = this.app.objectInstances.find(obj => obj.id === objectId);
        if (obj) {
            obj.visible = !obj.visible;
            
            // If we're hiding the currently selected object, keep it selected but clear active manipulation
            if (!obj.visible && this.selectedObjectId === objectId) {
                this.app.selectedObjectInstance = null; // Clear active manipulation
                this.app.updateObjectPropertiesPanel();
            } else if (obj.visible && this.selectedObjectId === objectId) {
                // If showing a selected object, make it active for manipulation
                this.app.selectedObjectInstance = obj;
                this.app.updateObjectPropertiesPanel();
            }
            
            this.updateSceneObjectsList();
            this.app.renderCurrentFrameToMainCanvas();
        }
    }

    handleDragStart(e) {
        const objectItem = e.target.closest('.scene-object-item');
        if (!objectItem) return;

        this.draggedObjectId = objectItem.dataset.objectId;
        objectItem.classList.add('dragging');
        
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', this.draggedObjectId);
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        const objectItem = e.target.closest('.scene-object-item');
        if (objectItem && objectItem.dataset.objectId !== this.draggedObjectId) {
            // Remove previous drag-over indicators
            document.querySelectorAll('.scene-object-item.drag-over').forEach(item => {
                item.classList.remove('drag-over');
            });
            objectItem.classList.add('drag-over');
        }
    }

    handleDrop(e) {
        e.preventDefault();
        
        const targetItem = e.target.closest('.scene-object-item');
        if (!targetItem || !this.draggedObjectId) return;

        const targetObjectId = targetItem.dataset.objectId;
        if (targetObjectId === this.draggedObjectId) return;

        // Reorder objects in the array
        const draggedIndex = this.app.objectInstances.findIndex(obj => obj.id === this.draggedObjectId);
        const targetIndex = this.app.objectInstances.findIndex(obj => obj.id === targetObjectId);
        
        if (draggedIndex !== -1 && targetIndex !== -1) {
            // Remove dragged object
            const draggedObj = this.app.objectInstances.splice(draggedIndex, 1)[0];
            // Insert at target position
            this.app.objectInstances.splice(targetIndex, 0, draggedObj);
        }
        
        // Clean up
        document.querySelectorAll('.scene-object-item.drag-over').forEach(item => {
            item.classList.remove('drag-over');
        });
        
        this.updateSceneObjectsList();
        this.app.renderCurrentFrameToMainCanvas();
    }

    handleDragEnd(e) {
        const objectItem = e.target.closest('.scene-object-item');
        if (objectItem) {
            objectItem.classList.remove('dragging');
        }
        
        document.querySelectorAll('.scene-object-item.drag-over').forEach(item => {
            item.classList.remove('drag-over');
        });
        
        this.draggedObjectId = null;
    }

    // Touch support methods
    handleTouchStart(e) {
        if (e.touches.length !== 1) return;
        
        const objectItem = e.target.closest('.scene-object-item');
        if (!objectItem) return;

        this.touchStartPos = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
        };
        this.draggedObjectId = objectItem.dataset.objectId;
    }

    handleTouchMove(e) {
        if (!this.draggedObjectId || e.touches.length !== 1) return;
        
        e.preventDefault();
        
        const currentPos = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
        };
        
        const distance = Math.sqrt(
            Math.pow(currentPos.x - this.touchStartPos.x, 2) + 
            Math.pow(currentPos.y - this.touchStartPos.y, 2)
        );
        
        if (distance > 10) { // Start drag after 10px movement
            const elementBelow = document.elementFromPoint(currentPos.x, currentPos.y);
            const targetItem = elementBelow?.closest('.scene-object-item');
            
            // Remove previous indicators
            document.querySelectorAll('.scene-object-item.drag-over').forEach(item => {
                item.classList.remove('drag-over');
            });
            
            if (targetItem && targetItem.dataset.objectId !== this.draggedObjectId) {
                targetItem.classList.add('drag-over');
            }
        }
    }

    handleTouchEnd(e) {
        if (!this.draggedObjectId) return;
        
        const targetItem = document.querySelector('.scene-object-item.drag-over');
        if (targetItem) {
            const targetObjectId = targetItem.dataset.objectId;
            
            // Reorder objects
            const draggedIndex = this.app.objectInstances.findIndex(obj => obj.id === this.draggedObjectId);
            const targetIndex = this.app.objectInstances.findIndex(obj => obj.id === targetObjectId);
            
            if (draggedIndex !== -1 && targetIndex !== -1) {
                const draggedObj = this.app.objectInstances.splice(draggedIndex, 1)[0];
                this.app.objectInstances.splice(targetIndex, 0, draggedObj);
                this.updateSceneObjectsList();
                this.app.renderCurrentFrameToMainCanvas();
            }
        }
        
        // Clean up
        document.querySelectorAll('.scene-object-item.drag-over').forEach(item => {
            item.classList.remove('drag-over');
        });
        
        this.draggedObjectId = null;
        this.touchStartPos = null;
    }

    updateSceneObjectsList() {
        const list = document.getElementById('sceneObjectsList');
        if (!list) return;
        
        // Safety check for objectInstances
        if (!this.app.objectInstances) {
            list.innerHTML = '<div style="text-align: center; color: var(--text-secondary); padding: 20px;">Loading...</div>';
            return;
        }
        
        if (this.app.objectInstances.length === 0) {
            list.innerHTML = '<div style="text-align: center; color: var(--text-secondary); padding: 20px;">No objects in scene</div>';
            return;
        }

        let html = '';
        
        // Render objects in reverse order (so first in array appears at top)
        for (let i = this.app.objectInstances.length - 1; i >= 0; i--) {
            const obj = this.app.objectInstances[i];
            const isSelected = obj.id === this.selectedObjectId;
            const isVisible = obj.visible !== false;
            const transform = obj.getTransformAt(this.app.currentFrame);
            
            // Get layer name with safety check
            const layer = this.app.layers ? this.app.layers.find(l => l.id === obj.layerId) : null;
            const layerName = layer ? layer.name : 'No Layer';
            
            // Gray out hidden objects instead of hiding them
            const hiddenClass = !isVisible ? 'object-hidden' : '';
            const selectedClass = isSelected ? 'selected' : '';
            
            html += `
                <div class="scene-object-item ${selectedClass} ${hiddenClass}" 
                     data-object-id="${obj.id}" 
                     draggable="true">
                    <span class="scene-object-drag-grip">⋮⋮</span>
                    <button class="scene-object-visibility ${!isVisible ? 'hidden' : ''}" 
                            title="Toggle Visibility">
                        ${isVisible ? '👁️' : '🙈'}
                    </button>
                    <span class="scene-object-name" contenteditable="${isVisible ? 'true' : 'false'}">${obj.name}</span>
                    <div class="scene-object-thumbnail">
                        ${transform.image ? '🖼️' : '📦'}
                    </div>
                    <div class="scene-object-info">
                        <span title="Layer">${layerName}</span>
                        <span title="Position">${Math.round(transform.x)},${Math.round(transform.y)}</span>
                        <span title="Scale">${Math.round((transform.scaleX || 1) * 100)}%</span>
                    </div>
                </div>
            `;
        }
        
        list.innerHTML = html;
        
        // Add name editing functionality (only for visible objects)
        list.querySelectorAll('.scene-object-name').forEach(nameElement => {
            const objectItem = nameElement.closest('.scene-object-item');
            const objectId = objectItem.dataset.objectId;
            const obj = this.app.objectInstances.find(o => o.id === objectId);
            
            // Only allow editing if object is visible
            if (obj && obj.visible) {
                nameElement.addEventListener('blur', (e) => {
                    obj.name = e.target.textContent.trim() || 'Unnamed Object';
                    this.app.updateObjectPropertiesPanel();
                });
                
                nameElement.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        e.target.blur();
                    }
                });
            }
        });
    }

    // Public methods for external access
    selectObject(objectId) {
        const obj = this.app.objectInstances.find(obj => obj.id === objectId);
        
        // Don't allow selection of hidden objects
        if (obj && !obj.visible) {
            return;
        }
        
        this.selectedObjectId = objectId;
        this.app.selectedObjectInstance = obj;
        this.updateSceneObjectsList();
        this.app.updateObjectPropertiesPanel();
        this.app.renderObjectsList();
        this.app.renderCurrentFrameToMainCanvas();
    }

    getSelectedObject() {
        return this.app.objectInstances.find(obj => obj.id === this.selectedObjectId);
    }

    refresh() {
        this.updateSceneObjectsList();
    }
}