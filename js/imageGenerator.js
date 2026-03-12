// ================================================================
// PostGenius AI - Advanced Image Generation Module
// Supports multiple image generation providers
// ================================================================

class AdvancedImageGenerator {
    constructor() {
        this.providers = {
            unsplash: 'Unsplash (Free Stock Photos)',
            replicate: 'Replicate (AI Generated)',
            placeholder: 'Placeholder'
        };
        this.currentProvider = localStorage.getItem('imageProvider') || 'unsplash';
        this.replicateApiKey = localStorage.getItem('replicateApiKey') || '';
        this.geminiApiKey = localStorage.getItem('geminiApiKey') || '';
        this.useGeminiEnhancement = localStorage.getItem('useGeminiEnhancement') !== 'false';
    }

    // ================================================================
    // UNSPLASH - Free Stock Photos (No API Key Required)
    // ================================================================
    async generateFromUnsplash(keyword, platform) {
        try {
            const keywords = {
                instagram: 'marketing,lifestyle,design,social',
                twitter: 'business,trending,technology,news',
                linkedin: 'professional,business,technology,corporate',
                facebook: 'community,engagement,lifestyle,family',
                tiktok: 'trending,viral,content,entertainment',
                youtube: 'video,content,tutorial,production'
            };
            
            const searchKeyword = keywords[platform] || 'marketing,business';
            const imageUrl = `https://source.unsplash.com/random/?${searchKeyword}`;
            
            return {
                success: true,
                url: imageUrl,
                provider: 'unsplash',
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Unsplash error:', error);
            return {
                success: false,
                error: error.message,
                provider: 'unsplash'
            };
        }
    }

    // ================================================================
    // REPLICATE - AI Image Generation (Requires Free API Key)
    // ================================================================
    async generateFromReplicate(caption) {
        if (!this.replicateApiKey) {
            return {
                success: false,
                error: 'Replicate API key not set. Please add your key in settings.',
                provider: 'replicate'
            };
        }

        try {
            // Show loading
            this.updateLoadingState('Generating image with AI... (30-60 seconds)', true);

            // Step 1: Create prediction
            const createResponse = await fetch('https://api.replicate.com/v1/predictions', {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${this.replicateApiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    version: 'fab80469f4674ba98528ed586b3a7d77b0b70dab7eed64e481dc8fb09c1b1003',
                    input: {
                        prompt: caption,
                        negative_prompt: 'blurry, low quality, distorted',
                        num_inference_steps: 30,
                        guidance_scale: 7.5
                    }
                })
            });

            if (!createResponse.ok) {
                throw new Error(`Replicate API error: ${createResponse.statusText}`);
            }

            const prediction = await createResponse.json();
            const predictionId = prediction.id;

            // Step 2: Poll for completion
            let completed = false;
            let attempts = 0;
            const maxAttempts = 120; // 2 minutes max

            while (!completed && attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second

                const checkResponse = await fetch(
                    `https://api.replicate.com/v1/predictions/${predictionId}`,
                    {
                        headers: {
                            'Authorization': `Token ${this.replicateApiKey}`
                        }
                    }
                );

                const result = await checkResponse.json();

                if (result.status === 'succeeded') {
                    this.updateLoadingState('', false);
                    return {
                        success: true,
                        url: result.output[0],
                        provider: 'replicate',
                        timestamp: new Date().toISOString()
                    };
                } else if (result.status === 'failed') {
                    throw new Error('Image generation failed on Replicate');
                }

                attempts++;
                const progress = Math.min((attempts / maxAttempts) * 100, 99);
                this.updateLoadingState(`Generating image... ${Math.round(progress)}%`, true);
            }

            throw new Error('Image generation timeout');
        } catch (error) {
            console.error('Replicate error:', error);
            this.updateLoadingState('', false);
            return {
                success: false,
                error: error.message,
                provider: 'replicate'
            };
        }
    }

    // ================================================================
    // HUGGING FACE - AI Image Generation Alternative
    // ================================================================
    async generateFromHuggingFace(caption, apiKey) {
        if (!apiKey) {
            return {
                success: false,
                error: 'Hugging Face API key not set',
                provider: 'huggingface'
            };
        }

        try {
            this.updateLoadingState('Generating image with Hugging Face...', true);

            const response = await fetch(
                'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2',
                {
                    headers: { Authorization: `Bearer ${apiKey}` },
                    method: 'POST',
                    body: JSON.stringify({ inputs: caption })
                }
            );

            if (!response.ok) {
                throw new Error(`HF API error: ${response.statusText}`);
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);

            this.updateLoadingState('', false);
            return {
                success: true,
                url: url,
                provider: 'huggingface',
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Hugging Face error:', error);
            this.updateLoadingState('', false);
            return {
                success: false,
                error: error.message,
                provider: 'huggingface'
            };
        }
    }

    // ================================================================
    // GRADIENT IMAGE - Placeholder/Fallback
    // ================================================================
    async generateGradientImage(text) {
        return {
            success: true,
            url: this.createGradientCanvas(text),
            provider: 'placeholder',
            timestamp: new Date().toISOString()
        };
    }

    createGradientCanvas(text) {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');

        // Gradient background
        const gradient = ctx.createLinearGradient(0, 0, 1024, 1024);
        gradient.addColorStop(0, '#a855f7');
        gradient.addColorStop(0.5, '#ec4899');
        gradient.addColorStop(1, '#06b6d4');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1024, 1024);

        // Text
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = 'bold 48px Inter, Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const words = text.split(' ');
        const maxLength = 15;
        const lines = [];
        let currentLine = '';

        words.forEach(word => {
            if ((currentLine + word).length > maxLength) {
                if (currentLine) lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine += (currentLine ? ' ' : '') + word;
            }
        });
        if (currentLine) lines.push(currentLine);

        const startY = 512 - (lines.length * 60) / 2;
        lines.forEach((line, idx) => {
            ctx.fillText(line, 512, startY + idx * 60);
        });

        return canvas.toDataURL('image/png');
    }

    // ================================================================
    // GOOGLE GEMINI - Prompt Enhancement & Optimization
    // ================================================================
    async enhancePromptWithGemini(caption, platform, businessType) {
        if (!this.useGeminiEnhancement || !this.geminiApiKey) {
            return caption; // Return original if Gemini not configured
        }

        try {
            this.updateLoadingState('🎨 Enhancing prompt with AI...', true);

            const prompt = `You are an expert at creating detailed, vivid image generation prompts. 
            
Given this content:
- Caption: "${caption}"
- Platform: ${platform}
- Business Type: ${businessType}

Create a single, detailed image generation prompt (2-3 sentences) that:
1. Is highly descriptive and visual
2. Includes specific style and quality details
3. Avoids text and watermarks
4. Would create a professional, engaging image
5. Is optimized for the ${platform} platform

Return ONLY the improved prompt, nothing else.`;

            const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 200
                    }
                }),
                // API key is passed as query parameter
            });

            if (!response.ok) {
                console.warn('Gemini enhancement failed:', response.statusText);
                return caption; // Fallback to original
            }

            const data = await response.json();
            
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                const enhancedPrompt = data.candidates[0].content.parts[0].text.trim();
                console.log('Enhanced prompt:', enhancedPrompt);
                return enhancedPrompt;
            }

            return caption;
        } catch (error) {
            console.error('Gemini enhancement error:', error);
            return caption; // Fallback to original on error
        }
    }

    async enhancePromptWithGeminiV2(caption, platform, businessType) {
        if (!this.useGeminiEnhancement || !this.geminiApiKey) {
            return caption;
        }

        try {
            this.updateLoadingState('🎨 Enhancing prompt with AI...', true);

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.geminiApiKey}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: `You are an image generation prompt expert. Transform this into a vivid, detailed image prompt:
                                
Caption: "${caption}"
Platform: ${platform}
Business: ${businessType}

Create 1-2 sentence detailed visual prompt. Include: style, mood, colors, composition, quality level. Avoid text/watermarks.`
                            }]
                        }],
                        generationConfig: {
                            temperature: 0.7,
                            maxOutputTokens: 150
                        }
                    })
                }
            );

            if (!response.ok) {
                return caption;
            }

            const data = await response.json();
            if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
                return data.candidates[0].content.parts[0].text.trim();
            }

            return caption;
        } catch (error) {
            console.error('Gemini error:', error);
            return caption;
        }
    }

    // ================================================================
    // MAIN GENERATION METHOD
    // ================================================================
    async generate(caption, platform, options = {}) {
        const provider = options.provider || this.currentProvider;

        try {
            // Enhance caption with Google Gemini if enabled
            let enhancedCaption = caption;
            if (this.useGeminiEnhancement && this.geminiApiKey) {
                const businessType = options.businessType || 'general';
                enhancedCaption = await this.enhancePromptWithGeminiV2(caption, platform, businessType);
            }

            let result;

            switch (provider) {
                case 'replicate':
                    result = await this.generateFromReplicate(enhancedCaption);
                    break;
                case 'huggingface':
                    result = await this.generateFromHuggingFace(
                        enhancedCaption,
                        options.apiKey || localStorage.getItem('huggingfaceApiKey')
                    );
                    break;
                case 'placeholder':
                    result = await this.generateGradientImage(caption);
                    break;
                case 'unsplash':
                default:
                    result = await this.generateFromUnsplash(caption, platform);
            }

            // Store last generated image info
            if (result.success) {
                sessionStorage.setItem('lastGeneratedImage', JSON.stringify(result));
            }

            return result;
        } catch (error) {
            console.error('Image generation error:', error);
            // Fallback to Unsplash
            return await this.generateFromUnsplash(caption, platform);
        }
    }

    // ================================================================
    // SETTINGS & UTILITIES
    // ================================================================
    setApiKey(provider, apiKey) {
        if (provider === 'gemini') {
            localStorage.setItem('geminiApiKey', apiKey);
            this.geminiApiKey = apiKey;
        } else {
            const key = provider === 'replicate' ? 'replicateApiKey' : 'huggingfaceApiKey';
            localStorage.setItem(key, apiKey);
            if (provider === 'replicate') {
                this.replicateApiKey = apiKey;
            }
        }
    }

    setGeminiEnhancement(enabled) {
        this.useGeminiEnhancement = enabled;
        localStorage.setItem('useGeminiEnhancement', enabled);
    }

    setProvider(provider) {
        this.currentProvider = provider;
        localStorage.setItem('imageProvider', provider);
    }

    updateLoadingState(message, show) {
        const loader = document.getElementById('imageGenerationLoader');
        if (loader) {
            if (show) {
                loader.style.display = 'block';
                loader.innerHTML = `
                    <div style="text-align: center; padding: 2rem;">
                        <div class="spinner-loader" style="margin: 0 auto; margin-bottom: 1rem;"></div>
                        <p style="color: #cbd5e1;">${message}</p>
                    </div>
                `;
            } else {
                loader.style.display = 'none';
            }
        }
    }

    getProviders() {
        return this.providers;
    }

    getCurrentProvider() {
        return this.currentProvider;
    }
}

// Export
window.AdvancedImageGenerator = AdvancedImageGenerator;
