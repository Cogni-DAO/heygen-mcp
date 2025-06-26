/**
 * Function to generate an image using the Runway Gen4 Image API with reference images.
 *
 * @param {Object} args - Arguments for the image generation.
 * @param {string} args.promptText - The text prompt with @ syntax for referencing images.
 * @param {Array} args.referenceImages - Array of reference image objects with uri and optional tag.
 * @param {string} [args.model="gen4_image"] - The model to use for image generation.
 * @param {string} [args.ratio="1920:1080"] - The aspect ratio of the generated image.
 * @param {number} [args.seed] - Optional seed for reproducible results.
 * @returns {Promise<Object>} - The result of the image generation.
 */
const executeFunction = async ({
    promptText,
    referenceImages,
    model = 'gen4_image',
    ratio = '1920:1080',
    seed
}) => {
    try {
        // Validate reference images
        if (!Array.isArray(referenceImages) || referenceImages.length === 0) {
            return {
                success: false,
                error: 'referenceImages must be a non-empty array'
            };
        }

        // Validate reference image format
        for (let i = 0; i < referenceImages.length; i++) {
            const img = referenceImages[i];
            if (!img.uri) {
                return {
                    success: false,
                    error: `Reference image at index ${i} must have a 'uri' property`
                };
            }
        }

        // Dynamic import to handle potential module loading issues
        const RunwayMLModule = await import('@runwayml/sdk');
        const RunwayML = RunwayMLModule.default;
        const { TaskFailedError } = RunwayMLModule;

        const apiKey = process.env.RUNWAY_API_KEY;
        if (!apiKey) {
            return {
                success: false,
                error: 'RUNWAY_API_KEY environment variable is not set.'
            };
        }

        const client = new RunwayML({ apiKey });

        // Prepare the request parameters
        const params = {
            model,
            promptText,
            ratio,
            referenceImages
        };

        // Add optional parameters if provided
        if (seed !== undefined) params.seed = seed;

        // Create and wait for the image generation task
        const task = await client.textToImage
            .create(params)
            .waitForTaskOutput();

        return {
            success: true,
            taskId: task.id,
            status: task.status,
            output: task.output,
            imageUrl: task.output && task.output[0] ? task.output[0] : null,
            createdAt: task.createdAt,
            model: task.model,
            promptText: task.promptText,
            ratio: task.ratio,
            referenceImages: task.referenceImages
        };

    } catch (error) {
        console.error('Error generating image with references:', error);

        if (error.name === 'TaskFailedError') {
            return {
                success: false,
                error: 'Image generation task failed',
                details: error.taskDetails,
                taskId: error.taskDetails?.id
            };
        }

        return {
            success: false,
            error: 'An error occurred while generating the image with references',
            message: error.message
        };
    }
};

/**
 * Tool configuration for generating images with reference images using the Runway Gen4 Image API.
 * @type {Object}
 */
const apiTool = {
    function: executeFunction,
    definition: {
        type: 'function',
        function: {
            name: 'GenerateImageWithReferences',
            description: 'Generate an image using the Runway Gen4 Image API with reference images. Use @ syntax in prompts to reference tagged images (e.g., "@cat sitting on @chair").',
            parameters: {
                type: 'object',
                properties: {
                    promptText: {
                        type: 'string',
                        description: 'The text prompt for generating the image. Use @ syntax to reference tagged images (e.g., "@EiffelTower painted in the style of @StarryNight").'
                    },
                    referenceImages: {
                        type: 'array',
                        description: 'Array of reference image objects. Each object should have "uri" (image URL or data URI) and optionally "tag" (for @ syntax referencing).',
                        items: {
                            type: 'object',
                            properties: {
                                uri: {
                                    type: 'string',
                                    description: 'Image URL or base64 data URI (data:image/jpeg;base64,...)'
                                },
                                tag: {
                                    type: 'string',
                                    description: 'Optional tag name for referencing this image in the prompt with @ syntax'
                                }
                            },
                            required: ['uri']
                        },
                        minItems: 1,
                        maxItems: 4
                    },
                    model: {
                        type: 'string',
                        description: 'The model to use for image generation.',
                        enum: ['gen4_image'],
                        default: 'gen4_image'
                    },
                    ratio: {
                        type: 'string',
                        description: 'The aspect ratio of the generated image.',
                        enum: ['1920:1080', '1080:1920', '1024:1024', '1280:720', '720:1280', '1536:640', '640:1536'],
                        default: '1920:1080'
                    },
                    seed: {
                        type: 'integer',
                        description: 'Optional seed for reproducible results. Use the same seed to get similar images.',
                        minimum: 0,
                        maximum: 2147483647
                    }
                },
                required: ['promptText', 'referenceImages']
            }
        }
    }
};

export { apiTool }; 