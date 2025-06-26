/**
 * Function to generate an image using the Runway Gen4 Image API.
 *
 * @param {Object} args - Arguments for the image generation.
 * @param {string} args.promptText - The text prompt for generating the image.
 * @param {string} [args.model="gen4_image"] - The model to use for image generation.
 * @param {string} [args.ratio="1920:1080"] - The aspect ratio of the generated image.
 * @param {number} [args.seed] - Optional seed for reproducible results.
 * @param {string} [args.style] - Style preset for the image generation.
 * @returns {Promise<Object>} - The result of the image generation.
 */
const executeFunction = async ({
    promptText,
    model = 'gen4_image',
    ratio = '1920:1080',
    seed,
    style
}) => {
    try {
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
            ratio
        };

        // Add optional parameters if provided
        if (seed !== undefined) params.seed = seed;
        if (style) params.style = style;

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
            ratio: task.ratio
        };

    } catch (error) {
        console.error('Error generating image:', error);

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
            error: 'An error occurred while generating the image',
            message: error.message
        };
    }
};

/**
 * Tool configuration for generating images using the Runway Gen4 Image API.
 * @type {Object}
 */
const apiTool = {
    function: executeFunction,
    definition: {
        type: 'function',
        function: {
            name: 'GenerateImage',
            description: 'Generate an image using the Runway Gen4 Image API with text prompts.',
            parameters: {
                type: 'object',
                properties: {
                    promptText: {
                        type: 'string',
                        description: 'The text prompt for generating the image. Be descriptive and specific.'
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
                    },
                    style: {
                        type: 'string',
                        description: 'Optional style preset for the image generation.',
                        enum: ['photorealistic', 'cinematic', 'artistic', 'illustration', 'concept_art']
                    }
                },
                required: ['promptText']
            }
        }
    }
};

export { apiTool }; 