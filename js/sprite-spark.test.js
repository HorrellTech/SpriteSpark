// Update the generateAIDrawing method to use drawing commands
async generateAIDrawing(prompt, size, style) {
    const apiKey = localStorage.getItem('openai_api_key');
    if (!apiKey) {
        alert('Please set your OpenAI API key first');
        return;
    }

    const generateBtn = document.getElementById('generateAIArt');
    const originalText = generateBtn.textContent;
    generateBtn.textContent = 'Generating...';
    generateBtn.disabled = true;

    try {
        console.log('Making API request with prompt:', prompt);
        console.log('Using canvas size:', size, 'x', size);

        // Create system prompt for drawing commands
        const systemPrompt = `You are a drawing assistant that creates images using simple drawing commands. 
Create a ${size}x${size} image for the given prompt using ONLY these commands:

Available commands:
- circle(x, y, radius, filled, color) - Draw a circle
- rectangle(x, y, width, height, filled, color) - Draw a rectangle  
- line(x1, y1, x2, y2, color) - Draw a line
- ellipse(x, y, radiusX, radiusY, filled, color) - Draw an ellipse

Rules:
- Coordinates must be within 0 to ${size-1}
- Colors must be hex format like "#FF0000"
- filled parameter is true/false for shapes
- Return ONLY a JSON array of commands, no explanations
- Keep it simple with 5-15 commands max

Style: ${style}

Example format:
[
  {"type": "circle", "x": 16, "y": 16, "radius": 8, "filled": true, "color": "#FF0000"},
  {"type": "line", "x1": 0, "y1": 0, "x2": 31, "y2": 31, "color": "#0000FF"}
]`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: `Create drawing commands for: ${prompt}` }
                ],
                max_tokens: 1000,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content.trim();
        
        let commands;
        try {
            // Try to parse JSON directly
            commands = JSON.parse(content);
        } catch (parseError) {
            // Try to extract JSON from response
            const jsonMatch = content.match(/\[[\s\S]*\]/);
            if (!jsonMatch) {
                throw new Error('No valid JSON commands found in AI response');
            }
            commands = JSON.parse(jsonMatch[0]);
        }

        // Validate and execute commands
        this.executeDrawingCommands(commands, size);

    } catch (error) {
        console.error('AI generation failed:', error);
        
        // Create simple fallback
        const fallbackCommands = this.createFallbackCommands(size, prompt);
        this.executeDrawingCommands(fallbackCommands, size);
        
        this.showNotification('AI response failed. Created a simple fallback design.', 'warning');

    } finally {
        generateBtn.textContent = originalText;
        generateBtn.disabled = false;
    }
}

// Add drawing command interpreter
executeDrawingCommands(commands, canvasSize) {
    if (!this.activeLayerId) {
        alert('Please select a layer first');
        return;
    }

    this.undoAdd();
    const layer = this.layers.find(l => l.id === this.activeLayerId);
    if (!layer) return;

    const ctx = layer.canvas.getContext('2d');
    
    // Validate and execute each command
    commands.forEach((cmd, index) => {
        try {
            this.executeDrawingCommand(ctx, cmd, canvasSize);
        } catch (error) {
            console.warn(`Failed to execute command ${index}:`, cmd, error);
        }
    });

    this.syncGlobalLayersToCurrentFrame();
    this.renderCurrentFrameToMainCanvas();
}

executeDrawingCommand(ctx, cmd, canvasSize) {
    if (!cmd || typeof cmd !== 'object' || !cmd.type) {
        throw new Error('Invalid command format');
    }

    // Validate coordinates are within bounds
    const validateCoord = (coord, name) => {
        if (typeof coord !== 'number' || coord < 0 || coord >= canvasSize) {
            throw new Error(`Invalid ${name}: ${coord}`);
        }
    };

    // Validate color format
    const validateColor = (color) => {
        if (typeof color !== 'string' || !/^#[0-9A-Fa-f]{6}$/.test(color)) {
            throw new Error(`Invalid color: ${color}`);
        }
    };

    ctx.save();

    switch (cmd.type) {
        case 'circle':
            validateCoord(cmd.x, 'x');
            validateCoord(cmd.y, 'y');
            validateColor(cmd.color);
            if (typeof cmd.radius !== 'number' || cmd.radius <= 0) {
                throw new Error(`Invalid radius: ${cmd.radius}`);
            }

            ctx.beginPath();
            ctx.arc(cmd.x, cmd.y, cmd.radius, 0, 2 * Math.PI);
            
            if (cmd.filled) {
                ctx.fillStyle = cmd.color;
                ctx.fill();
            } else {
                ctx.strokeStyle = cmd.color;
                ctx.lineWidth = 1;
                ctx.stroke();
            }
            break;

        case 'rectangle':
            validateCoord(cmd.x, 'x');
            validateCoord(cmd.y, 'y');
            validateColor(cmd.color);
            if (typeof cmd.width !== 'number' || cmd.width <= 0) {
                throw new Error(`Invalid width: ${cmd.width}`);
            }
            if (typeof cmd.height !== 'number' || cmd.height <= 0) {
                throw new Error(`Invalid height: ${cmd.height}`);
            }

            if (cmd.filled) {
                ctx.fillStyle = cmd.color;
                ctx.fillRect(cmd.x, cmd.y, cmd.width, cmd.height);
            } else {
                ctx.strokeStyle = cmd.color;
                ctx.lineWidth = 1;
                ctx.strokeRect(cmd.x, cmd.y, cmd.width, cmd.height);
            }
            break;

        case 'line':
            validateCoord(cmd.x1, 'x1');
            validateCoord(cmd.y1, 'y1');
            validateCoord(cmd.x2, 'x2');
            validateCoord(cmd.y2, 'y2');
            validateColor(cmd.color);

            ctx.strokeStyle = cmd.color;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(cmd.x1, cmd.y1);
            ctx.lineTo(cmd.x2, cmd.y2);
            ctx.stroke();
            break;

        case 'ellipse':
            validateCoord(cmd.x, 'x');
            validateCoord(cmd.y, 'y');
            validateColor(cmd.color);
            if (typeof cmd.radiusX !== 'number' || cmd.radiusX <= 0) {
                throw new Error(`Invalid radiusX: ${cmd.radiusX}`);
            }
            if (typeof cmd.radiusY !== 'number' || cmd.radiusY <= 0) {
                throw new Error(`Invalid radiusY: ${cmd.radiusY}`);
            }

            ctx.beginPath();
            ctx.ellipse(cmd.x, cmd.y, cmd.radiusX, cmd.radiusY, 0, 0, 2 * Math.PI);
            
            if (cmd.filled) {
                ctx.fillStyle = cmd.color;
                ctx.fill();
            } else {
                ctx.strokeStyle = cmd.color;
                ctx.lineWidth = 1;
                ctx.stroke();
            }
            break;

        default:
            throw new Error(`Unknown command type: ${cmd.type}`);
    }

    ctx.restore();
}

createFallbackCommands(size, prompt) {
    const center = Math.floor(size / 2);
    const radius = Math.floor(size / 4);
    
    // Simple fallback based on prompt keywords
    let color = '#FF0000';
    if (prompt.toLowerCase().includes('blue')) color = '#0000FF';
    else if (prompt.toLowerCase().includes('green')) color = '#00FF00';
    else if (prompt.toLowerCase().includes('yellow')) color = '#FFFF00';
    
    return [
        {
            type: 'circle',
            x: center,
            y: center,
            radius: radius,
            filled: true,
            color: color
        }
    ];
}