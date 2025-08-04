class AIDrawing {
    constructor(spriteSparkInstance) {
        this.app = spriteSparkInstance;
    }

    async generatePixelArt(prompt, width = 32, height = 32, style = 'pixel-art') {
        const apiKey = localStorage.getItem('openai_api_key');
        if (!apiKey) {
            alert('Please set your OpenAI API key first');
            return false;
        }

        try {
            // New: System prompt for JS drawing commands
            let systemPrompt = this.getContextDrawingPrompt(width, height, style);

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
                        { role: 'user', content: prompt }
                    ],
                    max_tokens: 2000,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`${response.status}: ${errorData.error?.message || 'API Error'}`);
            }

            const data = await response.json();
            const code = this.extractCodeBlock(data.choices[0].message.content);

            this.runDrawingCode(code, width, height);
            return true;
        } catch (error) {
            console.error('AI drawing failed:', error);
            throw error;
        }
    }

    getContextDrawingPrompt(width, height, style) {
        let styleHint = '';
        switch (style) {
            case 'pixel-art':
                styleHint = 'Color each pixel with a hex color. Use ctx.fillRect(x, y, 1, 1) to draw each pixel. ' + 
                'Use a limited retro color palette (8-16 colors). Keep it blocky and pixelated like classic video game sprites.';
                break;
            case 'pixel-art-character':
                styleHint = 'Create a character sprite with a limited retro color palette.'
                + 'Use ctx.fillRect(x, y, 1, 1) to draw each pixel. Focus on clear shapes and recognizable features. ' 
                + 'Use curves and lines for shape and details.';
            case 'simple-drawing':
                styleHint = 'Use simple shapes and colors. Use ctx.fillRect, ctx.beginPath, ctx.arc, ctx.moveTo, ctx.lineTo, ctx.stroke, ctx.fill, etc.';
                break;
            case 'advanced-drawing':
                styleHint = 'Use advanced techniques and effects. Use ctx.filter, ctx.globalAlpha, ctx.rotate, ctx.scale, etc. ' +
                'Use curves and lines for shape and details. use realistic shadows and highlights unless specified otherwise.';
                break;
            case 'line-art':
                styleHint = 'Use only black lines on transparent background. Use ctx.beginPath, ctx.moveTo, ctx.lineTo, ctx.stroke.';
                break;
            case 'minimalist':
                styleHint = 'Use only 2-4 colors, focus on essential shapes and negative space.';
                break;
            case 'custom':
                styleHint = '';
                break;
        }
        return `You are a JavaScript canvas drawing assistant. Given a prompt, 
        generate ONLY JavaScript code using the 2D canvas context variable "ctx" 
        to draw a ${width}x${height} image in the style "${style}". ${styleHint} Do not include explanations, 
        just a single code block.`;
    }

    getSystemPrompt(width, height, style) {
        let basePrompt = `You are a pixel art generator. Create a ${width}x${height} ${style} image. Return ONLY a JSON array where each row is an array of hex colors or null for transparent pixels.`;
        
        const stylePrompts = {
            'pixel-art': 'Use a limited retro color palette (8-16 colors). Keep it blocky and pixelated like classic video game sprites.',
            'simple-drawing': 'Use simple, clean shapes with basic colors. Focus on clarity and recognizability.',
            'line-art': 'Use primarily black (#000000) lines on transparent background (null). Keep it minimal and clean.',
            'minimalist': 'Use only 2-4 colors maximum. Focus on essential shapes and negative space.'
        };

        return `${basePrompt} ${stylePrompts[style] || stylePrompts['pixel-art']} Example: [["#FF0000", null, "#0000FF"], [null, "#00FF00", null]]`;
    }

    extractCodeBlock(content) {
        const codeMatch = content.match(/```(?:javascript)?\s*([\s\S]*?)```/i);
        if (codeMatch) return codeMatch[1];
        return content;
    }

    parsePixelData(content) {
        // Try to extract JSON array from the response
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            throw new Error('No valid JSON pixel data found in AI response');
        }
        
        try {
            return JSON.parse(jsonMatch[0]);
        } catch (e) {
            throw new Error('Invalid JSON format in AI response');
        }
    }

    drawPixelArrayToCanvas(pixelArray) {
        if (!this.app.activeLayerId) {
            throw new Error('No active layer selected');
        }

        const layer = this.app.layers.find(l => l.id === this.app.activeLayerId);
        if (!layer) {
            throw new Error('Active layer not found');
        }

        const ctx = layer.canvas.getContext('2d');
        
        // Calculate centered position
        const startX = Math.max(0, Math.floor((this.app.canvasWidth - pixelArray[0].length) / 2));
        const startY = Math.max(0, Math.floor((this.app.canvasHeight - pixelArray.length) / 2));

        // Draw each pixel
        for (let y = 0; y < pixelArray.length; y++) {
            for (let x = 0; x < pixelArray[y].length; x++) {
                const color = pixelArray[y][x];
                
                // Only draw non-null, non-transparent pixels
                if (color && color !== null && color !== 'null' && color !== 'transparent') {
                    // Ensure we're within canvas bounds
                    const drawX = startX + x;
                    const drawY = startY + y;
                    
                    if (drawX < this.app.canvasWidth && drawY < this.app.canvasHeight) {
                        ctx.fillStyle = color;
                        ctx.fillRect(drawX, drawY, 1, 1);
                    }
                }
            }
        }
    }

    runDrawingCode(code, width, height) {
        if (!this.app.activeLayerId) throw new Error('No active layer selected');
        const layer = this.app.layers.find(l => l.id === this.app.activeLayerId);
        if (!layer) throw new Error('Active layer not found');
        const ctx = layer.canvas.getContext('2d');

        // Optionally clear the layer before drawing
        ctx.clearRect(0, 0, width, height);

        // Run the code with ctx in scope
        try {
            // eslint-disable-next-line no-new-func
            new Function('ctx', code)(ctx);
        } catch (e) {
            throw new Error('Error running AI drawing code: ' + e.message);
        }
    }
}

class AIDrawingCommands {
    constructor(spriteSparkInstance) {
        this.app = spriteSparkInstance;
    }

    async generateDrawingFromPrompt(prompt, style = 'simple-drawing') {
        const apiKey = localStorage.getItem('openai_api_key');
        if (!apiKey) {
            throw new Error('API key not set');
        }

        try {
            const systemPrompt = `Convert the user's request into javascript context commands for a ${this.app.canvasWidth}x${this.app.canvasHeight} pixel canvas. Return ONLY a JSON array of drawing commands. Available commands:
            
            Keep coordinates within canvas bounds (0-${this.app.canvasWidth-1}, 0-${this.app.canvasHeight-1}).`;

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
                        { role: 'user', content: prompt }
                    ],
                    max_tokens: 2000
                })
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            const commands = JSON.parse(data.choices[0].message.content);
            this.executeDrawingCommands(commands);
            return true;
        } catch (error) {
            console.error('AI command generation failed:', error);
            throw error;
        }
    }

    executeDrawingCommands(commands) {
        if (!this.app.activeLayerId) {
            throw new Error('No active layer selected');
        }

        const layer = this.app.layers.find(l => l.id === this.app.activeLayerId);
        if (!layer) {
            throw new Error('Active layer not found');
        }

        const ctx = layer.canvas.getContext('2d');

        commands.forEach(cmd => {
            ctx.strokeStyle = cmd.color || '#000000';
            ctx.fillStyle = cmd.color || '#000000';
            ctx.lineWidth = cmd.thickness || 1;

            switch (cmd.type) {
                case 'line':
                    ctx.beginPath();
                    ctx.moveTo(cmd.x1, cmd.y1);
                    ctx.lineTo(cmd.x2, cmd.y2);
                    ctx.stroke();
                    break;
                case 'circle':
                    ctx.beginPath();
                    ctx.arc(cmd.x, cmd.y, cmd.radius, 0, 2 * Math.PI);
                    if (cmd.filled) {
                        ctx.fill();
                    } else {
                        ctx.stroke();
                    }
                    break;
                case 'rectangle':
                    if (cmd.filled) {
                        ctx.fillRect(cmd.x, cmd.y, cmd.width, cmd.height);
                    } else {
                        ctx.strokeRect(cmd.x, cmd.y, cmd.width, cmd.height);
                    }
                    break;
            }
        });
    }
}