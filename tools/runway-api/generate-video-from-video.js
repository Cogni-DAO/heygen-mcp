/**
 * Function to generate a video from an existing video using the Runway API with reference images.
 * This supports the "restyled first frame" workflow where you can provide reference images
 * for styling specific frames of the input video.
 *
 * @param {Object} args - Arguments for the video-to-video generation.
 * @param {string} args.promptVideo - The input video URL or data URI to transform.
 * @param {string} args.promptText - Text prompt describing the desired transformation with @ syntax for reference images.
 * @param {Array} [args.referenceImages] - Array of reference image objects with uri and optional tag for @ syntax.
 * @param {string} [args.model="gen4_turbo"] - The model to use for video generation.
 * @param {string} [args.ratio="1280:720"] - The aspect ratio of the generated video.
 * @param {number} [args.duration=5] - The duration of the video in seconds.
 * @param {number} [args.seed] - Optional seed for reproducible results.
 * @returns {Promise<Object>} - The result of the video generation.
 */
const executeFunction = async ({
    promptVideo,
    promptText,
    referenceImages = [],
    model = 'gen4_turbo',
    ratio = '1280:720',
    duration = 5,
    seed
}) => {
    try {
        // Validate required parameters
        if (!promptVideo) {
            return {
                success: false,
                error: 'promptVideo is required'
            };
        }

        if (!promptText) {
            return {
                success: false,
                error: 'promptText is required'
            };
        }

        // Validate reference images if provided
        if (referenceImages.length > 0) {
            for (let i = 0; i < referenceImages.length; i++) {
                const img = referenceImages[i];
                if (!img.uri) {
                    return {
                        success: false,
                        error: `Reference image at index ${i} must have a 'uri' property`
                    };
                }
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
            promptVideo,
            promptText,
            ratio,
            duration
        };

        // Add optional parameters if provided
        if (referenceImages.length > 0) {
            params.referenceImages = referenceImages;
        }
        if (seed !== undefined) params.seed = seed;

        // Create and wait for the video-to-video generation task
        const task = await client.videoToVideo
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
            promptVideo: task.promptVideo,
            promptText: task.promptText,
            referenceImages: task.referenceImages,
            ratio: task.ratio,
            duration: task.duration
        };

    } catch (error) {
        console.error('Error generating video from video:', error);

        if (error.name === 'TaskFailedError') {
            return {
                success: false,
                error: 'Video-to-video generation task failed',
                details: error.taskDetails,
                taskId: error.taskDetails?.id
            };
        }

        return {
            success: false,
            error: 'An error occurred while generating the video from video',
            message: error.message
        };
    }
};

/**
 * Tool configuration for generating videos from videos using the Runway API with reference images.
 * @type {Object}
 */
const apiTool = {
    function: executeFunction,
    definition: {
        type: 'function',
        function: {
            name: 'GenerateVideoFromVideo',
            description: 'Generate a video from an existing video using the Runway API with reference images. Perfect for "restyled first frame" workflows where you want to transform an existing video using reference images for styling.',
            parameters: {
                type: 'object',
                properties: {
                    promptVideo: {
                        type: 'string',
                        description: 'The input video URL or base64 data URI to transform. This will be the base video that gets restyled.'
                    },
                    promptText: {
                        type: 'string',
                        description: 'Text prompt describing the desired transformation. Use @ syntax to reference tagged images (e.g., "Transform the first frame to look like @styleRef while maintaining the original motion").'
                    },
                    referenceImages: {
                        type: 'array',
                        description: 'Array of reference image objects for styling. Each object should have "uri" (image URL or data URI) and optionally "tag" (for @ syntax referencing). Perfect for providing restyled first frames or style references.',
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
                        maxItems: 4
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
                required: ['promptVideo', 'promptText']
            }
        }
    }
};

export { apiTool }; 