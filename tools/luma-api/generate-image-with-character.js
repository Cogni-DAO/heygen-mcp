/**
 * Function to generate an image with character reference using the Luma API.
 *
 * @param {Object} args - Arguments for the image generation.
 * @param {string} args.prompt - The prompt for generating the image.
 * @param {Object} args.character_ref - Character reference object with identity and images.
 * @param {string} [args.model="photon-flash-1"] - The model to use for image generation.
 * @param {string} [args.aspect_ratio="16:9"] - The aspect ratio of the generated image.
 * @returns {Promise<Object>} - The result of the image generation.
 */
const executeFunction = async ({ prompt, character_ref, model = 'photon-flash-1', aspect_ratio = '16:9' }) => {
    const baseUrl = 'https://api.lumalabs.ai';
    const token = process.env.LUMA_API_KEY;

    if (!token) {
        return { error: 'LUMA_API_KEY environment variable is not set.' };
    }

    // Validate character_ref object
    if (!character_ref || typeof character_ref !== 'object') {
        return { error: 'character_ref must be an object with identity and images.' };
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
            character_ref,
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
        console.error('Error generating image with character:', error);
        return { error: 'An error occurred while generating the image with character reference.' };
    }
};

/**
 * Tool configuration for generating images with character reference using the Luma API.
 * @type {Object}
 */
const apiTool = {
    function: executeFunction,
    definition: {
        type: 'function',
        function: {
            name: 'GenerateImageWithCharacter',
            description: 'Generate an image with character reference using the Luma API. Create consistent and personalized characters using up to 4 reference images.',
            parameters: {
                type: 'object',
                properties: {
                    prompt: {
                        type: 'string',
                        description: 'The prompt for generating the image.'
                    },
                    character_ref: {
                        type: 'object',
                        description: 'Character reference object with identity and images.',
                        properties: {
                            identity0: {
                                type: 'object',
                                properties: {
                                    images: {
                                        type: 'array',
                                        description: 'Array of character reference image URLs (1-4 images for better consistency).',
                                        items: {
                                            type: 'string',
                                            format: 'uri'
                                        },
                                        minItems: 1,
                                        maxItems: 4
                                    }
                                },
                                required: ['images']
                            }
                        },
                        required: ['identity0']
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
                required: ['prompt', 'character_ref']
            }
        }
    }
};

export { apiTool }; 