/**
 * Function to generate a video from an image using the Runway Gen4 Turbo API.
 *
 * @param {Object} args - Arguments for the video generation.
 * @param {string} args.promptImage - The image URL or data URI to use as the base for video generation.
 * @param {string} [args.promptText] - Optional text prompt to guide the video generation.
 * @param {string} [args.model="gen4_turbo"] - The model to use for video generation.
 * @param {string} [args.ratio="1280:720"] - The aspect ratio of the generated video.
 * @param {number} [args.duration=5] - The duration of the video in seconds.
 * @param {number} [args.seed] - Optional seed for reproducible results.
 * @returns {Promise<Object>} - The result of the video generation.
 */
const executeFunction = async ({
    promptImage,
    promptText,
    model = 'gen4_turbo',
    ratio = '1280:720',
    duration = 5,
    seed
}) => {
    try {
        // Validate required parameters
        if (!promptImage) {
            return {
                success: false,
                error: 'promptImage is required'
            };
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
            promptImage,
            ratio,
            duration
        };

        // Add optional parameters if provided
        if (promptText) params.promptText = promptText;
        if (seed !== undefined) params.seed = seed;

        // Create and wait for the video generation task
        const task = await client.imageToVideo
            .create(params)
            .waitForTaskOutput();

        return {
            success: true,
            taskId: task.id,
            status: task.status,
            output: task.output,
            videoUrl: task.output && task.output[0] ? task.output[0] : null,
            createdAt: task.createdAt,
            model: task.model,
            promptImage: task.promptImage,
            promptText: task.promptText,
            ratio: task.ratio,
            duration: task.duration
        };

    } catch (error) {
        console.error('Error generating video from image:', error);

        if (error.name === 'TaskFailedError') {
            return {
                success: false,
                error: 'Video generation task failed',
                details: error.taskDetails,
                taskId: error.taskDetails?.id
            };
        }

        return {
            success: false,
            error: 'An error occurred while generating the video from image',
            message: error.message
        };
    }
};

/**
 * Tool configuration for generating videos from images using the Runway Gen4 Turbo API.
 * @type {Object}
 */
const apiTool = {
    function: executeFunction,
    definition: {
        type: 'function',
        function: {
            name: 'GenerateVideoFromImage',
            description: 'Generate a video from an image using the Runway Gen4 Turbo API. Animate existing images with optional text guidance.',
            parameters: {
                type: 'object',
                properties: {
                    promptImage: {
                        type: 'string',
                        description: 'The image URL or base64 data URI to use as the base for video generation. This will be the starting frame of the video.'
                    },
                    promptText: {
                        type: 'string',
                        description: 'Optional text prompt to guide the video generation. Describe the motion or animation you want to see.'
                    },
                    model: {
                        type: 'string',
                        description: 'The model to use for video generation.',
                        enum: ['gen4_turbo'],
                        default: 'gen4_turbo'
                    },
                    ratio: {
                        type: 'string',
                        description: 'The aspect ratio of the generated video.',
                        enum: ['1280:720', '720:1280', '1024:1024', '1920:1080', '1080:1920'],
                        default: '1280:720'
                    },
                    duration: {
                        type: 'number',
                        description: 'The duration of the video in seconds.',
                        minimum: 5,
                        maximum: 10,
                        default: 5
                    },
                    seed: {
                        type: 'integer',
                        description: 'Optional seed for reproducible results. Use the same seed to get similar videos.',
                        minimum: 0,
                        maximum: 2147483647
                    }
                },
                required: ['promptImage']
            }
        }
    }
};

export { apiTool }; 