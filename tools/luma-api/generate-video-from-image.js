/**
 * Function to generate a video from an image using the Luma Video Generation API.
 *
 * @param {Object} args - Arguments for the video generation.
 * @param {string} args.prompt - The prompt for generating the video.
 * @param {string} args.keyframe_url - The URL of the keyframe image.
 * @param {string} [args.model="ray-flash-2"] - The model to use for video generation.
 * @param {string} [args.aspect_ratio="16:9"] - The aspect ratio of the generated video.
 * @param {string} [args.resolution="720p"] - The resolution of the generated video.
 * @param {number} [args.duration=5] - The duration of the video in seconds.
 * @param {boolean} [args.loop=false] - Whether the video should loop seamlessly.
 * @returns {Promise<Object>} - The result of the video generation.
 */
const executeFunction = async ({ prompt, keyframe_url, model = 'ray-flash-2', aspect_ratio = '16:9', resolution = '720p', duration = 5, loop = false }) => {
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

        // Prepare the request body
        const body = JSON.stringify({
            prompt,
            keyframes: {
                frame0: {
                    type: 'image',
                    url: keyframe_url
                }
            },
            model,
            aspect_ratio,
            resolution,
            duration,
            loop
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
        console.error('Error generating video from image:', error);
        return { error: 'An error occurred while generating the video from image.' };
    }
};

/**
 * Tool configuration for generating videos from images using the Luma Video Generation API.
 * @type {Object}
 */
const apiTool = {
    function: executeFunction,
    definition: {
        type: 'function',
        function: {
            name: 'GenerateVideoFromImage',
            description: 'Generate a video from an image using the Luma Video Generation API.',
            parameters: {
                type: 'object',
                properties: {
                    prompt: {
                        type: 'string',
                        description: 'The prompt for generating the video.'
                    },
                    keyframe_url: {
                        type: 'string',
                        description: 'The URL of the keyframe image to animate.',
                        format: 'uri'
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
                required: ['prompt', 'keyframe_url']
            }
        }
    }
};

export { apiTool }; 