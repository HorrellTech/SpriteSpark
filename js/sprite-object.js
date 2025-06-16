class SpriteObject {
    constructor({ id, name = "Object", x = 0, y = 0, scale = 1, angle = 0, image = null } = {}) {
        this.id = id || 'obj_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
        this.name = name;
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
        // If exact keyframe, return it
        if (this.keyframes[frame]) return { ...this.keyframes[frame] };

        // Find previous and next keyframes for tweening
        const frames = Object.keys(this.keyframes).map(Number).sort((a, b) => a - b);
        if (frames.length === 0) return { ...this.defaultTransform };

        let prev = frames[0], next = frames[frames.length - 1];
        for (let i = 0; i < frames.length; i++) {
            if (frames[i] <= frame) prev = frames[i];
            if (frames[i] > frame) { next = frames[i]; break; }
        }

        // If before first or after last keyframe
        if (frame <= frames[0]) return { ...this.keyframes[frames[0]] };
        if (frame >= frames[frames.length - 1]) return { ...this.keyframes[frames[frames.length - 1]] };

        // Tween between prev and next
        const t = (frame - prev) / (next - prev);
        const a = this.keyframes[prev], b = this.keyframes[next];
        return {
            x: a.x + (b.x - a.x) * t,
            y: a.y + (b.y - a.y) * t,
            scale: a.scale + (b.scale - a.scale) * t,
            angle: a.angle + (b.angle - a.angle) * t,
            image: b.image || a.image // No image tween, just snap to next if set
        };
    }
}

window.SpriteObject = SpriteObject;