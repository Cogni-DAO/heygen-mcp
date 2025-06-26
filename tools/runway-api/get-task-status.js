/**
 * Function to get the status of a task using the Runway API.
 *
 * @param {Object} args - Arguments for retrieving task status.
 * @param {string} args.taskId - The ID of the task to check.
 * @returns {Promise<Object>} - The task status and details.
 */
const executeFunction = async ({ taskId }) => {
    try {
        // Validate required parameters
        if (!taskId) {
            return {
                success: false,
                error: 'taskId is required'
            };
        }

        // Dynamic import to handle potential module loading issues
        const RunwayMLModule = await import('@runwayml/sdk');
        const RunwayML = RunwayMLModule.default;

        const apiKey = process.env.RUNWAY_API_KEY;
        if (!apiKey) {
            return {
                success: false,
                error: 'RUNWAY_API_KEY environment variable is not set.'
            };
        }

        const client = new RunwayML({ apiKey });

        // Retrieve the task details
        const task = await client.tasks.retrieve(taskId);

        return {
            success: true,
            taskId: task.id,
            status: task.status,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
            output: task.output,
            failureReason: task.failureReason,
            model: task.model,
            // Include any available prompt data
            promptText: task.promptText,
            promptImage: task.promptImage,
            ratio: task.ratio,
            duration: task.duration,
            progress: task.progress,
            estimatedTimeRemaining: task.estimatedTimeRemaining
        };

    } catch (error) {
        console.error('Error retrieving task status:', error);

        // Handle specific API errors
        if (error.status === 404) {
            return {
                success: false,
                error: 'Task not found',
                taskId: taskId
            };
        }

        return {
            success: false,
            error: 'An error occurred while retrieving the task status',
            message: error.message,
            taskId: taskId
        };
    }
};

/**
 * Tool configuration for getting task status using the Runway API.
 * @type {Object}
 */
const apiTool = {
    function: executeFunction,
    definition: {
        type: 'function',
        function: {
            name: 'GetTaskStatus',
            description: 'Get the status and details of a Runway API task by its ID. Check if a generation is complete, failed, or still in progress.',
            parameters: {
                type: 'object',
                properties: {
                    taskId: {
                        type: 'string',
                        description: 'The unique ID of the task to check. This is returned when you create a generation task.'
                    }
                },
                required: ['taskId']
            }
        }
    }
};

export { apiTool }; 