/**
 * Function to modify an existing image using the Luma API.
 *
 * @param {Object} args - Arguments for the image modification.
 * @param {string} args.prompt - The prompt for modifying the image.
 * @param {Object} args.modify_image_ref - Reference to the image to modify with URL and weight.
 * @param {string} [args.model="photon-flash-1"] - The model to use for image generation.
 * @param {string} [args.aspect_ratio="16:9"] - The aspect ratio of the generated image.
 * @returns {Promise<Object>} - The result of the image modification.
 */
const executeFunction = async ({ prompt, modify_image_ref, model = 'photon-flash-1', aspect_ratio = '16:9' }) => {
    const baseUrl = 'https://api.lumalabs.ai';
    const token = process.env.LUMA_API_KEY;

    if (!token) {
        return { error: 'LUMA_API_KEY environment variable is not set.' };
    }

    // Validate modify_image_ref object
    if (!modify_image_ref || typeof modify_image_ref !== 'object' || !modify_image_ref.url) {
        return { error: 'modify_image_ref must be an object with url and optional weight.' };
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
            modify_image_ref,
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
        console.error('Error modifying image:', error);
        return { error: 'An error occurred while modifying the image.' };
    }
};

/**
 * Tool configuration for modifying images using the Luma API.
 * @type {Object}
 */
const apiTool = {
    function: executeFunction,
    definition: {
        type: 'function',
        function: {
            name: 'ModifyImage',
            description: 'Modify an existing image using the Luma API. Refine images by prompting what changes you want to make. Works well for changing objects/shapes but may need lower weight (0.0-0.1) for color changes.',
            parameters: {
                type: 'object',
                properties: {
                    prompt: {
                        type: 'string',
                        description: 'The prompt describing what changes to make to the image.'
                    },
                    modify_image_ref: {
                        type: 'object',
                        description: 'Reference to the image to modify with URL and weight.',
                        properties: {
                            url: {
                                type: 'string',
                                format: 'uri',
                                description: 'URL of the image to modify.'
                            },
                            weight: {
                                type: 'number',
                                minimum: 0.0,
                                maximum: 1.0,
                                default: 1.0,
                                description: 'Weight/influence of the input image (0.0-1.0). Higher = closer to original, lower = more creative. Use 0.0-0.1 for color changes.'
                            }
                        },
                        required: ['url']
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
                required: ['prompt', 'modify_image_ref']
            }
        }
    }
};

export { apiTool }; 