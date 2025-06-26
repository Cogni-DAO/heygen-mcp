/**
 * Function to generate a video using the Runway Gen4 Turbo API from text prompts.
 *
 * @param {Object} args - Arguments for the video generation.
 * @param {string} args.promptText - The text prompt for generating the video.
 * @param {string} [args.model="gen4_turbo"] - The model to use for video generation.
 * @param {string} [args.ratio="1280:720"] - The aspect ratio of the generated video.
 * @param {number} [args.duration=5] - The duration of the video in seconds.
 * @param {number} [args.seed] - Optional seed for reproducible results.
 * @returns {Promise<Object>} - The result of the video generation.
 */
const executeFunction = async ({
    promptText,
    model = 'gen4_turbo',
    ratio = '1280:720',
    duration = 5,
    seed
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
            ratio,
            duration
        };

        // Add optional parameters if provided
        if (seed !== undefined) params.seed = seed;

        // Create and wait for the video generation task
        const task = await client.textToVideo
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
            promptText: task.promptText,
            ratio: task.ratio,
            duration: task.duration
        };

    } catch (error) {
        console.error('Error generating video from text:', error);

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
            error: 'An error occurred while generating the video from text',
            message: error.message
        };
    }
};

/**
 * Tool configuration for generating videos from text using the Runway Gen4 Turbo API.
 * @type {Object}
 */
const apiTool = {
    function: executeFunction,
    definition: {
        type: 'function',
        function: {
            name: 'GenerateVideoFromText',
            description: 'Generate a video using the Runway Gen4 Turbo API from text prompts only.',
            parameters: {
                type: 'object',
                properties: {
                    promptText: {
                        type: 'string',
                        description: 'The text prompt for generating the video. Be descriptive about the desired motion and scene.'
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
                required: ['promptText']
            }
        }
    }
};

export { apiTool }; 