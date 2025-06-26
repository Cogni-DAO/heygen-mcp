/**
 * Function to cancel a task using the Runway API.
 *
 * @param {Object} args - Arguments for canceling a task.
 * @param {string} args.taskId - The ID of the task to cancel.
 * @returns {Promise<Object>} - The result of the task cancellation.
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

        // Try using the cancel method - this may need adjustment based on actual SDK
        const result = await client.tasks.cancel(taskId);

        return {
            success: true,
            taskId: taskId,
            status: result.status,
            message: 'Task cancellation requested',
            canceledAt: result.canceledAt || new Date().toISOString()
        };

    } catch (error) {
        console.error('Error canceling task:', error);

        // Handle specific API errors
        if (error.status === 404) {
            return {
                success: false,
                error: 'Task not found',
                taskId: taskId
            };
        }

        if (error.status === 400 && error.message?.includes('cannot be canceled')) {
            return {
                success: false,
                error: 'Task cannot be canceled (may already be completed or failed)',
                taskId: taskId
            };
        }

        return {
            success: false,
            error: 'An error occurred while canceling the task',
            message: error.message,
            taskId: taskId
        };
    }
};

/**
 * Tool configuration for canceling tasks using the Runway API.
 * @type {Object}
 */
const apiTool = {
    function: executeFunction,
    definition: {
        type: 'function',
        function: {
            name: 'CancelTask',
            description: 'Cancel a running or pending task using the Runway API. This will stop the generation process and free up resources.',
            parameters: {
                type: 'object',
                properties: {
                    taskId: {
                        type: 'string',
                        description: 'The unique ID of the task to cancel. Only tasks in PENDING or RUNNING status can be canceled.'
                    }
                },
                required: ['taskId']
            }
        }
    }
};

export { apiTool }; 