class SpriteObject {
    constructor({ id, name = "Object", x = 0, y = 0, scale = 1, angle = 0, image = null } = {}) {
        this.id = id || 'obj_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
        this.name = name;
        this.visible = true; // Visibility state
        // Per-frame keyframes: { frameIndex: {x, y, scale, angle, image} }
        this.keyframes = {};
        // Default transform (used if no keyframe for a frame)
        this.defaultTransform = { x, y, scale, angle, image };
    }

    setKeyframe(frame, { x, y, scale, angle, image }) {
        this.keyframes[frame] = { x, y, scale, angle, image };
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

        // Interpolate between the two keyframes with easing
        const beforeTransform = this.keyframes[beforeFrame];
        const afterTransform = this.keyframes[afterFrame];
        const totalFrames = afterFrame - beforeFrame;
        const currentProgress = frame - beforeFrame;
        const progress = currentProgress / totalFrames;

        // Apply easing for smoother animation (ease-in-out)
        const easedProgress = this.easeInOutCubic(progress);

        return {
            x: this.lerp(beforeTransform.x, afterTransform.x, easedProgress),
            y: this.lerp(beforeTransform.y, afterTransform.y, easedProgress),
            scale: this.lerp(beforeTransform.scale, afterTransform.scale, easedProgress),
            angle: this.lerpAngle(beforeTransform.angle, afterTransform.angle, easedProgress),
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
            scale: 1,
            angle: 0,
            image: null
        };
    }
}

window.SpriteObject = SpriteObject;