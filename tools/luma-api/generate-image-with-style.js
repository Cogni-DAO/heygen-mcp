/**
 * Function to generate an image with style reference using the Luma API.
 *
 * @param {Object} args - Arguments for the image generation.
 * @param {string} args.prompt - The prompt for generating the image.
 * @param {Array} args.style_ref - Array of style reference images with URLs and weights.
 * @param {string} [args.model="photon-flash-1"] - The model to use for image generation.
 * @param {string} [args.aspect_ratio="16:9"] - The aspect ratio of the generated image.
 * @returns {Promise<Object>} - The result of the image generation.
 */
const executeFunction = async ({ prompt, style_ref, model = 'photon-flash-1', aspect_ratio = '16:9' }) => {
    const baseUrl = 'https://api.lumalabs.ai';
    const token = process.env.LUMA_API_KEY;

    if (!token) {
        return { error: 'LUMA_API_KEY environment variable is not set.' };
    }

    // Validate style_ref array
    if (!Array.isArray(style_ref) || style_ref.length === 0) {
        return { error: 'style_ref must be an array with at least one style reference image.' };
    }

    try {
        // Construct the URL for the request
        const url = `${baseUrl}/dream-machine/v1/generations/image`;

        // Set up headers for the request
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        // Prepare the request body
        const body = JSON.stringify({
            prompt,
            style_ref,
            model,
            aspect_ratio
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
        console.error('Error generating image with style:', error);
        return { error: 'An error occurred while generating the image with style reference.' };
    }
};

/**
 * Tool configuration for generating images with style reference using the Luma API.
 * @type {Object}
 */
const apiTool = {
    function: executeFunction,
    definition: {
        type: 'function',
        function: {
            name: 'GenerateImageWithStyle',
            description: 'Generate an image with style reference using the Luma API. Apply specific artistic styles to your generation.',
            parameters: {
                type: 'object',
                properties: {
                    prompt: {
                        type: 'string',
                        description: 'The prompt for generating the image.'
                    },
                    style_ref: {
                        type: 'array',
                        description: 'Array of style reference images with URLs and weights.',
                        items: {
                            type: 'object',
                            properties: {
                                url: {
                                    type: 'string',
                                    format: 'uri',
                                    description: 'URL of the style reference image.'
                                },
                                weight: {
                                    type: 'number',
                                    minimum: 0.0,
                                    maximum: 1.0,
                                    default: 0.8,
                                    description: 'Weight/influence of this style reference (0.0-1.0).'
                                }
                            },
                            required: ['url']
                        },
                        minItems: 1
                    },
                    model: {
                        type: 'string',
                        description: 'The model to use for image generation.',
                        enum: ['photon-1', 'photon-flash-1'],
                        default: 'photon-flash-1'
                    },
                    aspect_ratio: {
                        type: 'string',
                        description: 'The aspect ratio of the generated image.',
                        enum: ['1:1', '3:4', '4:3', '9:16', '16:9', '9:21', '21:9'],
                        default: '16:9'
                    }
                },
                required: ['prompt', 'style_ref']
            }
        }
    }
};

export { apiTool }; 