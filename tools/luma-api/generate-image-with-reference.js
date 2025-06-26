/**
 * Function to generate an image with reference images using the Luma API.
 *
 * @param {Object} args - Arguments for the image generation.
 * @param {string} args.prompt - The prompt for generating the image.
 * @param {Array} args.image_ref - Array of reference images with URLs and weights.
 * @param {string} [args.model="photon-flash-1"] - The model to use for image generation.
 * @param {string} [args.aspect_ratio="16:9"] - The aspect ratio of the generated image.
 * @returns {Promise<Object>} - The result of the image generation.
 */
const executeFunction = async ({ prompt, image_ref, model = 'photon-flash-1', aspect_ratio = '16:9' }) => {
    const baseUrl = 'https://api.lumalabs.ai';
    const token = process.env.LUMA_API_KEY;

    if (!token) {
        return { error: 'LUMA_API_KEY environment variable is not set.' };
    }

    // Validate image_ref array
    if (!Array.isArray(image_ref) || image_ref.length === 0 || image_ref.length > 4) {
        return { error: 'image_ref must be an array with 1-4 reference images.' };
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
            image_ref,
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
        console.error('Error generating image with reference:', error);
        return { error: 'An error occurred while generating the image with reference.' };
    }
};

/**
 * Tool configuration for generating images with reference images using the Luma API.
 * @type {Object}
 */
const apiTool = {
    function: executeFunction,
    definition: {
        type: 'function',
        function: {
            name: 'GenerateImageWithReference',
            description: 'Generate an image with reference images using the Luma API. Use up to 4 reference images to guide the generation.',
            parameters: {
                type: 'object',
                properties: {
                    prompt: {
                        type: 'string',
                        description: 'The prompt for generating the image.'
                    },
                    image_ref: {
                        type: 'array',
                        description: 'Array of reference images with URLs and weights (1-4 images).',
                        items: {
                            type: 'object',
                            properties: {
                                url: {
                                    type: 'string',
                                    format: 'uri',
                                    description: 'URL of the reference image.'
                                },
                                weight: {
                                    type: 'number',
                                    minimum: 0.0,
                                    maximum: 1.0,
                                    default: 0.85,
                                    description: 'Weight/influence of this reference image (0.0-1.0).'
                                }
                            },
                            required: ['url']
                        },
                        minItems: 1,
                        maxItems: 4
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
                required: ['prompt', 'image_ref']
            }
        }
    }
};

export { apiTool }; 