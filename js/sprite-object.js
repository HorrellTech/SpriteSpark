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

            flipX: options.flipX || false,
            flipY: options.flipY || false,

            skewX: options.skewX || 0,
            skewY: options.skewY || 0,

            image: options.image || null
        };

        this.setKeyframe(0, initialTransform);
    }

    setKeyframe(frame, { x, y, scaleX, scaleY, angle, flipX, flipY, skewX, skewY, image }) {
        this.keyframes[frame] = {
            x, y,
            scaleX: scaleX || 1,
            scaleY: scaleY || 1,
            angle: angle || 0,
            flipX: flipX || false,
            flipY: flipY || false,
            skewX: skewX || 0,
            skewY: skewY || 0,
            image
        };
    }

    removeKeyframe(frame) {
        delete this.keyframes[frame];
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

        // FIX: Interpolate ALL transform properties
        return {
            x: this.lerp(beforeTransform.x, afterTransform.x, progress),
            y: this.lerp(beforeTransform.y, afterTransform.y, progress),
            scaleX: this.lerp(beforeTransform.scaleX || 1, afterTransform.scaleX || 1, progress),
            scaleY: this.lerp(beforeTransform.scaleY || 1, afterTransform.scaleY || 1, progress),
            angle: this.lerpAngle(beforeTransform.angle, afterTransform.angle, progress),
            flipX: afterTransform.flipX || beforeTransform.flipX || false, // Flip doesn't interpolate
            flipY: afterTransform.flipY || beforeTransform.flipY || false,
            skewX: this.lerp(beforeTransform.skewX || 0, afterTransform.skewX || 0, progress),
            skewY: this.lerp(beforeTransform.skewY || 0, afterTransform.skewY || 0, progress),
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

    normalizeTransform(keyframe) {
        return {
            x: keyframe.x || 0,
            y: keyframe.y || 0,
            scaleX: keyframe.scaleX !== undefined ? keyframe.scaleX : (keyframe.scale || 1),
            scaleY: keyframe.scaleY !== undefined ? keyframe.scaleY : (keyframe.scale || 1),
            angle: keyframe.angle || 0,
            flipX: keyframe.flipX || false,
            flipY: keyframe.flipY || false,
            skewX: keyframe.skewX || 0,
            skewY: keyframe.skewY || 0,
            image: keyframe.image
        };
    }

    getDefaultTransform() {
        return {
            x: this.canvasWidth / 2,
            y: this.canvasHeight / 2,
            scaleX: 1,
            scaleY: 1,
            angle: 0,
            flipX: false,
            flipY: false,
            skewX: 0,
            skewY: 0,
            image: null
        };
    }
}

window.SpriteObject = SpriteObject;