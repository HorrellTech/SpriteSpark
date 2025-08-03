class SpriteObject {
    constructor(options = {}) {
        this.id = options.id || 'obj_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
        this.name = options.name || 'Object';
        this.visible = options.visible !== undefined ? options.visible : true;
        this.alpha = options.alpha !== undefined ? options.alpha : 1;
        this.hue = options.hue || 0;
        this.layerId = options.layerId || null;
        this.tween = options.tween !== undefined ? options.tween : true;
        this.keyframes = {};

        // Set initial keyframe with proper scale handling
        const initialTransform = {
            x: options.x || 0,
            y: options.y || 0,
            // Handle both old single scale and new separate scales
            scaleX: options.scaleX !== undefined ? options.scaleX : (options.scale || 1),
            scaleY: options.scaleY !== undefined ? options.scaleY : (options.scale || 1),  
            angle: options.angle || 0,
            image: options.image || null
        };

        this.setKeyframe(0, initialTransform);
    }

    setKeyframe(frame, { x, y, scaleX, scaleY, angle, image }) {
        this.keyframes[frame] = { x, y, scaleX, scaleY, angle, image };
    }

    removeKeyframe(frame) {
        delete this.keyframes[frame];
    }

    getTransformAt(frame) {
        // If tweening is disabled, return exact keyframe or default
        if (!this.tween) {
            const keyframe = this.keyframes[frame];
            if (keyframe) {
                // Convert old scale to separate scales if needed
                if (keyframe.scale !== undefined && (keyframe.scaleX === undefined || keyframe.scaleY === undefined)) {
                    return {
                        ...keyframe,
                        scaleX: keyframe.scaleX || keyframe.scale,
                        scaleY: keyframe.scaleY || keyframe.scale,
                        scale: undefined
                    };
                }
                return { ...keyframe };
            }
            return this.getDefaultTransform();
        }

        // Find surrounding keyframes for interpolation
        const frames = Object.keys(this.keyframes).map(Number).sort((a, b) => a - b);

        // If no keyframes, return default
        if (frames.length === 0) {
            return this.getDefaultTransform();
        }

        // If exact keyframe exists, return it (with scale conversion if needed)
        if (this.keyframes[frame]) {
            const keyframe = this.keyframes[frame];
            if (keyframe.scale !== undefined && (keyframe.scaleX === undefined || keyframe.scaleY === undefined)) {
                return {
                    ...keyframe,
                    scaleX: keyframe.scaleX || keyframe.scale,
                    scaleY: keyframe.scaleY || keyframe.scale,
                    scale: undefined
                };
            }
            return { ...keyframe };
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
            const keyframe = this.keyframes[afterFrame];
            if (keyframe.scale !== undefined && (keyframe.scaleX === undefined || keyframe.scaleY === undefined)) {
                return {
                    ...keyframe,
                    scaleX: keyframe.scaleX || keyframe.scale,
                    scaleY: keyframe.scaleY || keyframe.scale,
                    scale: undefined
                };
            }
            return { ...keyframe };
        }

        // If only keyframes before current frame, use the last one
        if (afterFrame === -1) {
            const keyframe = this.keyframes[beforeFrame];
            if (keyframe.scale !== undefined && (keyframe.scaleX === undefined || keyframe.scaleY === undefined)) {
                return {
                    ...keyframe,
                    scaleX: keyframe.scaleX || keyframe.scale,
                    scaleY: keyframe.scaleY || keyframe.scale,
                    scale: undefined
                };
            }
            return { ...keyframe };
        }

        // Interpolate between the two keyframes
        const beforeTransform = this.keyframes[beforeFrame];
        const afterTransform = this.keyframes[afterFrame];
        const progress = (frame - beforeFrame) / (afterFrame - beforeFrame);

        // Convert old scale to separate scales for interpolation
        const beforeScaleX = beforeTransform.scaleX !== undefined ? beforeTransform.scaleX : (beforeTransform.scale || 1);
        const beforeScaleY = beforeTransform.scaleY !== undefined ? beforeTransform.scaleY : (beforeTransform.scale || 1);
        const afterScaleX = afterTransform.scaleX !== undefined ? afterTransform.scaleX : (afterTransform.scale || 1);
        const afterScaleY = afterTransform.scaleY !== undefined ? afterTransform.scaleY : (afterTransform.scale || 1);

        return {
            x: this.lerp(beforeTransform.x, afterTransform.x, progress),
            y: this.lerp(beforeTransform.y, afterTransform.y, progress),
            scaleX: this.lerp(beforeScaleX, afterScaleX, progress),
            scaleY: this.lerp(beforeScaleY, afterScaleY, progress),
            scale: undefined, // Scale is not used in this context
            angle: this.lerpAngle(beforeTransform.angle, afterTransform.angle, progress),
            image: afterTransform.image || beforeTransform.image
        };
    }

    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    lerp(a, b, t) {
        return a + (b - a) * t;
    }

    lerpAngle(a, b, t) {
        // Handle angle wrapping for smooth rotation
        let diff = b - a;
        if (diff > 180) diff -= 360;
        if (diff < -180) diff += 360;
        return (a + diff * t) % 360;
    }

    getDefaultTransform() {
        return {
            x: this.canvasWidth / 2 || 160,
            y: this.canvasHeight / 2 || 120,
            scaleX: 1,
            scaleY: 1,
            scale: 1,
            angle: 0,
            image: null
        };
    }
}

window.SpriteObject = SpriteObject;