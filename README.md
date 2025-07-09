# 🎨 SpriteSpark Animation Studio
![Alt Text](animation.gif)

**A powerful web-based pixel art and 2D animation studio with advanced drawing tools, AI integration, and professional animation features.**

🌟 **Live Demo:** https://horrelltech.github.io/SpriteSpark/

---

## ✨ Core Features Overview

SpriteSpark is designed for both beginners and professional animators, offering everything from simple pixel art creation to complex multi-layered animations with advanced vector tools and AI assistance.

### 🎨 **Drawing Tools & Canvas**

#### **Basic Drawing Tools**
* **🖊️ Pixel-Perfect Pen**: Primary tool for crisp, anti-alias-free pixel art (click pen icon in left toolbar)
* **🖌️ Brush Tool**: Variable-size brush with pressure sensitivity support for stylus/tablet users
* **🧽 Eraser**: Remove artwork sections (eraser icon) - supports all brush size options
* **🪣 Fill Tool (Bucket)**: Smart flood fill with adjustable tolerance (bucket icon in toolbar)
  - *Tolerance setting in tool options panel controls fill sensitivity*
  - *"Detect All Layers" option fills based on combined layer visibility*

#### **Shape & Vector Tools**
* **📐 Line Tool**: Draw perfectly straight lines with live preview
* **▭ Rectangle Tool**: Create precise rectangles and squares
* **⭕ Ellipse Tool**: Draw circles and ovals with pixel-perfect edges

#### **Advanced Vector Tools**
* **🎯 Vector Tool**: Professional point-based drawing system
  - *Click to place vector points, drag to reposition*
  - *Right-click to remove points*
  - *Multiple modes: Path, Shape, Bezier curves*
  - *Apply button appears when 2+ points are placed*
  - *Press Enter to apply, Escape to cancel*

* **🌊 Spline Tool**: Create smooth curves through control points
  - *Click to place control points*
  - *Drag points to reshape curves*
  - *Adjustable curve intensity and type (Catmull-Rom, Bezier, B-Spline)*
  - *Real-time curve preview with control lines*
  - *Right-click to remove points*

* **🎨 Curve Brush**: Interactive curve creation tool
  - *Place points to define curve path*
  - *Drag control points to adjust curve shape*
  - *Apply button appears at curve center*
  - *Perfect for organic, flowing lines*

#### **Selection & Transform Tools**
* **▭ Rectangle Select**: Make rectangular selections (dashed rectangle icon)
* **🫱 Lasso Select**: Free-form selection for irregular shapes
* **👆 Pointer Tool**: Move and manipulate selected areas
* **🔄 Transform Controls**: Rotate, scale, and position selected content
  - *Middle-click on selection to enable rotation mode*

### 🎯 **Advanced Drawing Features**

#### **Symmetry & Mirroring**
* **🪞 Symmetry Tools**: Real-time mirroring while drawing (symmetry panel in left sidebar)
  - **Horizontal Mirror**: Draw on one side, automatically mirrors to the other
  - **Vertical Mirror**: Top-to-bottom mirroring
  - **Diagonal Mirrors**: 45-degree angle mirroring
  - *Animated guide lines show symmetry axes*
  - *Perfect for character design and symmetric patterns*

#### **Drawing Assistance**
* **👻 Ghost Cursor**: Visual brush preview (toggle in tool options)
* **🎯 Pixel Perfect Mode**: Ensures clean, crisp lines for pixel art
* **📐 Grid System**: Overlay grid for precise alignment (toggle in canvas options)
* **🧅 Onion Skinning**: See previous/next frames transparently while drawing

#### **Pressure & Input Support**
* **✍️ Stylus Pressure Sensitivity**: Dynamic brush sizing with drawing tablets
* **🖱️ Mouse Precision**: Optimized for precise pixel-level control
* **📱 Touch Support**: Full touch screen compatibility with gesture controls

### 🎬 **Animation System**

#### **Timeline & Frame Management**
Located at the bottom of the screen:
* **➕ Add Frame**: Plus (+) button creates new animation frames
* **📄 Duplicate Frame**: Copy current frame as starting point for next
* **🗑️ Delete Frame**: Remove unwanted frames (trash icon)
* **🔄 Reorder Frames**: Drag and drop frames to rearrange sequence
* **👁️ Frame Visibility**: Toggle frames active/inactive for animation

#### **Playback Controls**
* **▶️ Play/Pause**: Start and stop animation preview (play button in timeline)
* **⚡ FPS Control**: Adjust playback speed (1-60 FPS slider)
* **🔁 Loop Toggle**: Set animation to repeat continuously
* **🧅 Onion Skinning**: Transparent overlay of adjacent frames for smooth animation
* **🎬 Live Preview**: See animation playing while you draw

#### **Professional Animation Features**
* **📏 Frame Thumbnails**: Visual timeline with resizable frame previews
* **🎭 Frame States**: Enable/disable frames without deleting
* **⏭️ Frame Navigation**: Click frames or use arrow keys to navigate
* **🎯 Animation Preview**: Toggle "Animate While Drawing" to see loops in real-time

### 📚 **Layer System**

#### **Layer Management** (Right Panel)
* **📑 Layer Stack**: Non-destructive layer system with unlimited layers
* **➕ Add Layer**: Plus (+) button above layer list
* **🗑️ Delete Layer**: Trash icon next to each layer
* **↕️ Reorder Layers**: Drag layers up/down to change drawing order
* **👁️ Layer Visibility**: Eye icon to show/hide individual layers
* **📝 Layer Naming**: Double-click layer names to rename

#### **Layer Properties** (Click layer to access)
* **🔍 Opacity Slider**: Adjust layer transparency (0-100%)
* **🎨 Blend Modes**: Professional blending options:
  - *Normal, Multiply, Screen, Overlay, Soft Light, Hard Light*
  - *Color Dodge, Color Burn, Darken, Lighten, Difference, Exclusion*
* **✨ Layer Effects**: Glow, shadow, and outline effects per layer

### 🎨 **Color System**

#### **Color Selection** (Left Panel)
* **🎯 Primary/Secondary Colors**: Large color squares - click to open full color picker
* **🔄 Color Swap**: Right-click on canvas to instantly swap primary/secondary
* **🎨 Color Palette**: 32 preset colors below main color selection
  - *Left-click: set primary color*
  - *Right-click: set secondary color*
* **🌈 Color Picker**: Full HSV color wheel with RGB/HSV/Hex inputs

#### **Advanced Color Tools**
* **💧 Eyedropper**: Sample colors from canvas (eyedropper tool or Ctrl+Click)
* **🎨 Color History**: Recently used colors automatically saved
* **🌈 Theme-Aware Palettes**: Color schemes that adapt to interface themes

### 🔧 **Tool Options & Settings**

#### **Tool Properties Panel** (Left Side, below tools)
Dynamic options that change based on selected tool:
* **📏 Brush Size**: 1-100px slider for drawing tools
* **🌊 Spline Settings**:
  - *Curve Intensity*: Controls how curved the splines are
  - *Spline Type*: Catmull-Rom, Bezier, B-Spline options
  - *Curve Smoothing*: Quality of curve rendering
  - *Show Control Lines*: Visual guides between points
* **🎯 Vector Settings**:
  - *Vector Mode*: Path, Shape, or Bezier curve modes
  - *Fill/Stroke Options*: Fill shapes or outline only
  - *Stroke Width*: Line thickness for vector paths
  - *Snap to Grid*: Align points to grid automatically
* **🪣 Fill Options**: Tolerance for bucket fill tool
* **👻 Ghost Settings**: Brush preview opacity and visibility

#### **Canvas Options**
* **🔍 Zoom**: 25%-800% with zoom input field and +/- buttons
* **📐 Grid Toggle**: Show/hide alignment grid
* **📏 Canvas Size**: Adjust animation dimensions with placement options
* **🎭 Live Animation**: Preview animation while working

### ⚙️ **Professional Workflow**

#### **Undo/Redo System**
* **↶ Undo**: Ctrl+Z or undo button (50-step history)
* **↷ Redo**: Ctrl+Y or redo button
* **📝 Comprehensive History**: Tracks drawing, layer changes, frame operations, effects

#### **Keyboard Shortcuts**
* **Drawing**: Ctrl+Z (Undo), Ctrl+Y (Redo), Ctrl+C/V/X (Copy/Paste/Cut)
* **Navigation**: Arrow keys (frame navigation), Delete (clear selection)
* **Tools**: Number keys 1-9 for quick tool switching
* **Canvas**: Ctrl+Mouse Wheel (zoom), Middle-click (pan)
* **Selection**: Ctrl+A (select all), Escape (clear selection)

#### **Canvas Navigation**
* **🖱️ Pan**: Middle mouse button or two-finger touch drag
* **🔍 Zoom**: Ctrl + Mouse Wheel or pinch gestures
* **🎯 Fit to Screen**: Reset view button in toolbar
* **📱 Touch Gestures**: Optimized for tablets and touch devices

### 🎭 **Effects & Filters**

#### **Layer Effects** (Effects menu)
* **✨ Glow Effect**: Customizable outer glow with color and size
* **🌟 Neon Effect**: Bright, colorful neon-style glow
* **📦 Drop Shadow**: Offset shadow with blur and opacity controls
* **🔳 Outline Effect**: Clean border around layer content
* **⚡ Emboss Effect**: 3D raised appearance

#### **Image Adjustments**
* **🌈 HSL Adjustment**: Hue, Saturation, Lightness controls
* **🎨 Recolor Tool**: Replace specific colors with tolerance
* **🔆 Brightness/Contrast**: Professional image adjustment
* **🌫️ Blur/Sharpen**: Lens effects with customizable intensity
* **🎪 Vignette**: Darkened edges effect
* **🐠 Fish Eye**: Lens distortion effect
* **📐 Pixelate**: Retro pixelation filter

#### **Transform Effects**
* **🔄 Rotate 90°**: Perfect rotation maintaining pixel alignment
* **↔️ Flip Horizontal**: Mirror image left-to-right
* **↕️ Flip Vertical**: Mirror image top-to-bottom

### 🎨 **Themes & Interface**

#### **Visual Themes** (Top-right dropdown)
Professional themes for different workflows:
* **🌙 Dark Themes**: Dark, Blue, Purple, Midnight, Nord Dark, Dracula
* **☀️ Light Themes**: Light, High Contrast
* **🎯 Specialized**: Cyberpunk, Neon, Solarized, Iron Man, Sakura
* **🎨 Custom**: Gold, Red, Orange, Green color schemes

#### **Responsive Design**
* **💻 Desktop Mode**: Full professional layout with all panels
* **📱 Mobile Mode**: Touch-optimized with collapsible panels
* **📋 Panel Management**: Show/hide left, right, and bottom panels
* **📏 Resizable Panels**: Drag panel edges to customize workspace

### 💾 **Project Management**

#### **File Operations** (Top toolbar)
* **💾 Save Project**: Export complete project as .json file
  - *Includes all frames, layers, settings, animation data*
  - *Can be reopened to continue work*
* **📁 Load Project**: Import previously saved .json projects
* **📤 Export Options**:
  - **🎬 Animated GIF**: Export complete animation for sharing
  - **🎥 WebM Video**: High-quality video format
  - **🖼️ PNG Frame**: Save current frame as static image
  - **📸 All Frames**: Export each frame as separate PNG files

#### **Advanced Export**
* **⚙️ GIF Settings**: FPS, quality, and optimization options
* **🎥 Video Export**: Multiple format support with quality settings
* **📐 Size Options**: Export at different resolutions
* **🎭 Frame Selection**: Export specific frame ranges

### 🤖 **AI Tools** (Experimental)

#### **AI Image Generator**
* **🎨 Text-to-Art**: Generate images from text descriptions
* **🔧 API Integration**: Uses Gemini AI (requires API key setup)
* **🎯 Canvas Integration**: Generated art appears on active layer
* **🎨 Style Options**: Pixel art, realistic, and custom styles
* **📐 Size Control**: Multiple canvas size options

#### **AI Setup Instructions**
1. Get Gemini API key from Google AI Studio
2. Click "Set API Key" in AI menu
3. Enter your API key (stored locally)
4. Use AI Image Generator with custom prompts

*Note: AI animation features are currently in development*

### 📱 **Input & Device Support**

#### **Input Methods**
* **🖱️ Mouse & Keyboard**: Complete desktop experience
* **✍️ Stylus/Drawing Tablet**: Pressure sensitivity support
* **📱 Touch Devices**: Optimized for tablets and smartphones
  - *Single finger: draw and interact*
  - *Two-finger pinch: zoom*
  - *Two-finger drag: pan canvas*
  - *Touch gestures: intuitive navigation*

#### **Accessibility**
* **⌨️ Keyboard Navigation**: All features accessible via keyboard
* **🎨 High Contrast**: Theme options for visual accessibility
* **📏 Scalable Interface**: Zoom and resize options
* **🔊 Visual Feedback**: Clear tool states and notifications

---

## 🚀 **Quick Start Guide**

### **Interface Overview**
1. **📋 Top Menubar**: File operations, themes, help
2. **🛠️ Toolbar**: Quick access to save, undo, export
3. **⬅️ Left Panel**: Drawing tools, colors, canvas settings
4. **➡️ Right Panel**: Layers, animation controls, effects
5. **⬇️ Bottom Panel**: Timeline with frames and playback
6. **🎨 Center Canvas**: Main drawing area with zoom/pan

### **Creating Your First Animation**

#### **Step 1: Set Up Your Canvas**
1. **📐 Canvas Size**: Use default 320x240 or adjust in canvas options
2. **🎨 Choose Colors**: Click primary color square to open color picker
3. **🖊️ Select Tool**: Pen tool is perfect for pixel art (default selection)

#### **Step 2: Draw Your First Frame**
1. **🎨 Draw**: Click and drag on canvas to create your artwork
2. **📑 Add Layer**: Use "+" button in layers panel for background/foreground separation
3. **🔍 Use Zoom**: Ctrl+Mouse Wheel for detailed pixel work

#### **Step 3: Create Animation Frames**
1. **➕ Add Frame**: Click "+" in timeline to create frame 2
2. **🎨 Modify**: Make small changes to create motion
3. **🧅 Onion Skin**: Toggle to see previous frame while drawing
4. **🔄 Repeat**: Add more frames for longer animations

#### **Step 4: Preview and Export**
1. **▶️ Play**: Click play button in timeline to preview animation
2. **⚡ Adjust FPS**: Use FPS slider for timing control
3. **💾 Save**: Save project as .json for future editing
4. **📤 Export**: Export as GIF or video for sharing

### **Pro Tips for Advanced Users**

#### **Pixel Art Techniques**
* **🎯 Pixel Perfect**: Keep enabled for clean, crisp artwork
* **📏 Grid Guide**: Use grid overlay for consistent pixel placement
* **🪞 Symmetry**: Enable for character design and patterns
* **🔍 Zoom High**: Work at 400-800% zoom for precise detail work

#### **Vector Tool Mastery**
* **🎯 Point Placement**: Click carefully to place vector points
* **🔄 Curve Adjustment**: Drag points to reshape curves in real-time
* **⌨️ Keyboard Control**: Enter to apply, Escape to cancel
* **🎨 Mode Selection**: Use Path for lines, Shape for filled areas

#### **Animation Workflow**
* **🧅 Onion Skinning**: Essential for smooth motion
* **📑 Layer Separation**: Use different layers for background, character, effects
* **🎬 Live Preview**: "Animate While Drawing" shows motion as you work
* **📋 Frame Management**: Use active/inactive states instead of deleting frames

#### **Professional Features**
* **🎨 Blend Modes**: Experiment with Multiply for shadows, Screen for highlights
* **✨ Layer Effects**: Add glow for magical effects, outlines for definition
* **🎭 Themes**: Switch themes to reduce eye strain during long sessions
* **⌨️ Shortcuts**: Learn keyboard shortcuts for faster workflow

#### **Performance Tips**
* **💾 Save Frequently**: Browser may clear data on tab close
* **📏 Optimize Size**: Smaller canvas sizes perform better for complex animations
* **📑 Layer Limits**: Keep reasonable layer counts for smooth performance
* **🎥 Export Smart**: Use appropriate formats - GIF for web, PNG sequence for editing

---

## 🛠️ **Advanced Techniques**

### **Vector & Spline Workflows**
Perfect for creating smooth, professional-quality artwork:

1. **🎯 Plan Your Points**: Sketch rough layout before placing vector points
2. **🌊 Curve Control**: Use spline intensity to control curve smoothness
3. **🔄 Iterative Design**: Build complex shapes with multiple vector/spline passes
4. **🎨 Combine Tools**: Mix vector curves with pixel art details

### **Professional Animation**
Create studio-quality animations:

1. **📋 Storyboard**: Plan key poses before animating
2. **🧅 Onion Layers**: Use multiple onion skin frames for complex motion
3. **📑 Layer Animation**: Animate different elements on separate layers
4. **⏱️ Timing Control**: Vary FPS for different motion types
5. **🎭 Secondary Motion**: Add subtle effects with additional layers

### **Collaborative Workflow**
Share and iterate on projects:

1. **💾 Project Files**: Share .json files to collaborate
2. **📤 Export Frames**: Export PNG sequences for external editing
3. **🎨 Style Sheets**: Create color palettes for consistent art style
4. **📋 Documentation**: Use layer names and organization for team projects

---

**🎉 Ready to create amazing animations? Open SpriteSpark and start bringing your ideas to life!**