/**
 * Function to generate a video using the Luma Video Generation API.
 *
 * @param {Object} args - Arguments for the video generation.
 * @param {string} args.prompt - The prompt for generating the video.
 * @param {string} [args.model="ray-flash-2"] - The model to use for video generation.
 * @param {string} [args.aspect_ratio="16:9"] - The aspect ratio of the generated video.
 * @param {string} [args.resolution="720p"] - The resolution of the generated video.
 * @param {number} [args.duration=5] - The duration of the video in seconds.
 * @param {boolean} [args.loop=false] - Whether the video should loop seamlessly.
 * @returns {Promise<Object>} - The result of the video generation.
 */
const executeFunction = async ({ prompt, model = 'ray-flash-2', aspect_ratio = '16:9', resolution = '720p', duration = 5, loop = false }) => {
    const baseUrl = 'https://api.lumalabs.ai';
    const token = process.env.LUMA_API_KEY;

    if (!token) {
        return { error: 'LUMA_API_KEY environment variable is not set.' };
    }

    try {
        // Construct the URL for the request
        const url = `${baseUrl}/dream-machine/v1/generations/video`;

        // Set up headers for the request
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        // Prepare the request body - matching successful built-in MCP format
        const body = JSON.stringify({
            generation_type: 'video',
            prompt,
            model,
            aspect_ratio,
            resolution,
            duration: `${duration}s`,
            loop,
            keyframes: null,
            callback_url: null,
            concepts: null
        });

        // Perform the fetch request
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body
        });

        // Check if the response was successful
        if (!response.ok) {
            let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            try {
                const errorData = await response.json();
                errorMessage = JSON.stringify(errorData);
            } catch (e) {
                // Response wasn't JSON, use the HTTP status message
            }
            throw new Error(errorMessage);
        }

        // Parse and return the response data
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error generating video:', error);
        return { error: 'An error occurred while generating the video.' };
    }
};

/**
 * Tool configuration for generating videos using the Luma Video Generation API.
 * @type {Object}
 */
const apiTool = {
    function: executeFunction,
    definition: {
        type: 'function',
        function: {
            name: 'GenerateVideo',
            description: 'Generate a video using the Luma Video Generation API.',
            parameters: {
                type: 'object',
                properties: {
                    prompt: {
                        type: 'string',
                        description: 'The prompt for generating the video.'
                    },
                    model: {
                        type: 'string',
                        description: 'The model to use for video generation.',
                        enum: ['ray-1-6', 'ray-2', 'ray-flash-2'],
                        default: 'ray-flash-2'
                    },
                    aspect_ratio: {
                        type: 'string',
                        description: 'The aspect ratio of the generated video.',
                        enum: ['1:1', '3:4', '4:3', '9:16', '16:9', '9:21', '21:9'],
                        default: '16:9'
                    },
                    resolution: {
                        type: 'string',
                        description: 'The resolution of the generated video.',
                        enum: ['540p', '720p', '1080p', '4k'],
                        default: '720p'
                    },
                    duration: {
                        type: 'number',
                        description: 'The duration of the video in seconds.',
                        minimum: 1,
                        maximum: 10,
                        default: 5
                    },
                    loop: {
                        type: 'boolean',
                        description: 'Whether the video should loop seamlessly.',
                        default: false
                    }
                },
                required: ['prompt']
            }
        }
    }
};

export { apiTool }; 