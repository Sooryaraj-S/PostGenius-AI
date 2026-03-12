// ================================================================
// PostGenius AI - Claude AI Integration for Content Generation
// Uses Anthropic's Claude API for real, intelligent content creation
// ================================================================

class ClaudeContentGenerator {
    constructor(apiKey = null) {
        this.apiKey = apiKey || localStorage.getItem('claudeApiKey');
        this.apiUrl = 'https://api.anthropic.com/v1/messages';
    }

    // Update API key
    setApiKey(key) {
        this.apiKey = key;
        localStorage.setItem('claudeApiKey', key);
    }

    // Test Claude API connection
    async testConnection() {
        if (!this.apiKey) {
            return { success: false, message: 'No Claude API key provided' };
        }

        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'x-api-key': this.apiKey,
                    'anthropic-version': '2023-06-01',
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'claude-3-5-sonnet-20241022',
                    max_tokens: 100,
                    messages: [
                        {
                            role: 'user',
                            content: 'Say "Claude AI connection successful" briefly.'
                        }
                    ]
                })
            });

            if (!response.ok) {
                const error = await response.json();
                return { 
                    success: false, 
                    message: error.error?.message || 'API Error' 
                };
            }

            const data = await response.json();
            return { 
                success: true, 
                message: 'Claude AI connection successful!',
                model: 'claude-3-5-sonnet-20241022'
            };
        } catch (error) {
            return { 
                success: false, 
                message: 'Connection failed: ' + error.message 
            };
        }
    }

    // Generate caption using Claude
    async generateCaption(platform, businessType, topic, audience, tone) {
        if (!this.apiKey) {
            return 'Claude API key not configured. Add it in settings!';
        }

        const prompt = `Create a compelling social media caption for ${platform} about: "${topic}"
Business Type: ${businessType}
Target Audience: ${audience}
Tone: ${tone}

Requirements:
- Platform appropriate (${this.getPlatformGuidelines(platform)})
- Engaging and authentic
- Call-to-action if appropriate
- Keep it concise

Generate ONLY the caption, no explanations.`;

        return await this.callClaude(prompt);
    }

    // Generate ad copy using Claude
    async generateAdCopy(platform, businessType, offer, audience) {
        if (!this.apiKey) {
            return 'Configure Claude API key for AI-powered ad copy!';
        }

        const prompt = `Create a high-converting ad copy for ${platform} promoting: "${offer}"
Business: ${businessType}
Target Audience: ${audience}

Requirements:
- Grab attention immediately
- Address pain points
- Include value proposition
- Clear call-to-action
- Platform-appropriate tone

Generate ONLY the ad copy, no explanations.`;

        return await this.callClaude(prompt);
    }

    // Generate hashtags using Claude
    async generateHashtags(platform, topic, businessType) {
        if (!this.apiKey) {
            return this.getFallbackHashtags(platform);
        }

        const prompt = `Generate 10 high-performing hashtags for ${platform} about "${topic}" for a ${businessType} business.

Requirements:
- Mix of popular and niche tags
- Directly relevant to topic
- Platform-optimized
- Trending and evergreen mix

Return as: #tag1 #tag2 #tag3... (space-separated, no explanations)`;

        return await this.callClaude(prompt);
    }

    // Generate engagement tips using Claude
    async generateEngagementTips(platform, businessType, topic) {
        if (!this.apiKey) {
            return this.getFallbackTips(platform);
        }

        const prompt = `Generate 3-4 actionable engagement tips for ${platform} posts about "${topic}" for a ${businessType} business.

Requirements:
- Specific and actionable
- Platform-native tactics
- Data-backed if possible
- Easy to implement

Return as bullet points, concise.`;

        return await this.callClaude(prompt);
    }

    // Generate content strategy tips
    async generateStrategyTips(platform, businessType, goal) {
        if (!this.apiKey) {
            return this.getFallbackStrategyTips();
        }

        const prompt = `Generate 3-4 strategic tips for maximizing ${platform} presence for a ${businessType} business with goal: "${goal}"

Requirements:
- High-level strategy
- Platform-specific best practices
- Measurable outcomes
- Actionable insight

Return as concise bullet points.`;

        return await this.callClaude(prompt);
    }

    // Generic Claude API caller
    async callClaude(prompt, maxTokens = 300) {
        if (!this.apiKey) {
            return 'Claude API key required for AI content generation.';
        }

        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'x-api-key': this.apiKey,
                    'anthropic-version': '2023-06-01',
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'claude-3-5-sonnet-20241022',
                    max_tokens: maxTokens,
                    system: `You are PostGenius AI, an expert content creator and social media marketing specialist. 
You create engaging, platform-optimized content that drives results. 
Be concise, authentic, and action-oriented.
Follow platform guidelines strictly.`,
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ]
                })
            });

            if (!response.ok) {
                const error = await response.json();
                console.error('Claude API Error:', error);
                return 'Claude API Error: ' + (error.error?.message || 'Unknown error');
            }

            const data = await response.json();
            if (data.content && data.content[0]) {
                return data.content[0].text;
            }
            return 'No response generated';

        } catch (error) {
            console.error('Claude API Call Error:', error);
            return 'Error calling Claude API: ' + error.message;
        }
    }

    // Helper: Platform-specific guidelines
    getPlatformGuidelines(platform) {
        const guidelines = {
            instagram: 'Use emojis, hashtags, storytelling, 150-300 chars ideal',
            twitter: 'Concise, witty, 280 chars max, trending awareness',
            linkedin: 'Professional, value-focused, thought leadership',
            facebook: 'Community-friendly, shareable, call-to-action buttons',
            tiktok: 'Trendy, authentic, trend-hopping, 15-60 seconds of content',
            youtube: 'Detailed, SEO-optimized, click-worthy',
            pinterest: 'Visual-focused, SEO keywords, aspirational'
        };
        return guidelines[platform] || guidelines.instagram;
    }

    // Fallback hashtags when API unavailable
    getFallbackHashtags(platform) {
        const hashtags = {
            instagram: '#MarketingHacks #SocialMediaMarketing #ContentCreator #DigitalMarketing #SmallBusiness #Entrepreneur #BrandGrowth #FYP #Viral #PostGenius',
            twitter: '#MarketingHacks #AI #Marketing #Business #ContentCreation #SocialMedia #Growth #Tech #Innovation #Trending',
            linkedin: '#MarketingStrategy #DigitalTransformation #Innovation #Leadership #BusinessGrowth #AI #Technology #CareerGrowth',
            facebook: '#Marketing #SmallBusiness #DigitalMarketing #BusinessTips #Growth #Entrepreneur #SocialMedia #OnlineMarketing',
            tiktok: '#FYP #ForYouPage #Viral #Marketing #Business #Content #Trending #Socialmedia #SmallBusiness #ContentCreator',
            youtube: '#Marketing #ContentCreator #YouTubeMarketing #BrandBuilding #SocialMedia #DigitalMarketing #BusinessGrowth'
        };
        return hashtags[platform] || hashtags.instagram;
    }

    // Fallback tips when API unavailable
    getFallbackTips(platform) {
        const tips = {
            instagram: [
                'Use Instagram Reels with trending audio for 60% more visibility',
                'Post carousel content (3-4 slides) for maximum engagement',
                'Ask questions in captions to boost comments',
                'Use location tags to reach local audiences'
            ],
            twitter: [
                'Post within 30 minutes of trending topics for max reach',
                'Use 2-3 relevant mentions and hashtags per tweet',
                'Retweet with thoughtful commentary to join conversations',
                'Ask questions to drive engagement and replies'
            ],
            linkedin: [
                'Start with a compelling hook in first 2 lines',
                'Use short paragraphs for mobile readability',
                'Include 3-5 relevant hashtags',
                'Share personal insights or stories for authenticity'
            ],
            facebook: [
                'Videos get 5x more engagement than text posts',
                'Post during peak audience activity times',
                'Use clear CTA buttons for conversions',
                'Encourage shares over likes for organic reach'
            ],
            tiktok: [
                'Hook viewers in first 3 seconds for retention',
                'Use trending sounds and hashtags for discovery',
                'Post consistently 3-5 times per week',
                'Engage with comments in first hour after posting'
            ]
        };
        return tips[platform] || tips.instagram;
    }

    // Fallback strategy tips
    getFallbackStrategyTips() {
        return [
            'Post consistently - maintain a regular schedule for audience expectations',
            'Engage authentically - respond to comments and build community',
            'Analyze metrics - track what content resonates and adjust strategy',
            'Stay on-brand - maintain consistent voice across all platforms'
        ];
    }
}

// Global instance for easy access
window.claudeAI = new ClaudeContentGenerator();
