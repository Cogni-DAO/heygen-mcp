/**
 * Function to upscale a video using the Runway Video Upscale API.
 *
 * @param {Object} args - Arguments for the video upscaling.
 * @param {string} args.promptVideo - The video URL or data URI to upscale.
 * @param {string} [args.model="upscale_video"] - The model to use for video upscaling.
 * @returns {Promise<Object>} - The result of the video upscaling.
 */
const executeFunction = async ({
    promptVideo,
    model = 'upscale_video'
}) => {
    try {
        // Validate required parameters
        if (!promptVideo) {
            return {
                success: false,
                error: 'promptVideo is required'
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
            promptVideo
        };

        // Create and wait for the video upscaling task
        const task = await client.videoUpscale
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
            promptVideo: task.promptVideo
        };

    } catch (error) {
        console.error('Error upscaling video:', error);

        if (error.name === 'TaskFailedError') {
            return {
                success: false,
                error: 'Video upscaling task failed',
                details: error.taskDetails,
                taskId: error.taskDetails?.id
            };
        }

        return {
            success: false,
            error: 'An error occurred while upscaling the video',
            message: error.message
        };
    }
};

/**
 * Tool configuration for upscaling videos using the Runway Video Upscale API.
 * @type {Object}
 */
const apiTool = {
    function: executeFunction,
    definition: {
        type: 'function',
        function: {
            name: 'UpscaleVideo',
            description: 'Upscale a video to higher resolution using the Runway Video Upscale API. Improves video quality and resolution.',
            parameters: {
                type: 'object',
                properties: {
                    promptVideo: {
                        type: 'string',
                        description: 'The video URL or base64 data URI to upscale. Should be a video file that you want to improve in quality.'
                    },
                    model: {
                        type: 'string',
                        description: 'The model to use for video upscaling.',
                        enum: ['upscale_video'],
                        default: 'upscale_video'
                    }
                },
                required: ['promptVideo']
            }
        }
    }
};

export { apiTool }; 