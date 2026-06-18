import React from 'react';

const TaskList = ({ tasks, onTaskClick }) => {
    if (!tasks || tasks.length === 0) {
        return (
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-8 text-center border border-white/60">
                <div className="text-4xl mb-3">📋</div>
                <p className="text-gray-500 text-sm">No tasks available</p>
                <p className="text-gray-400 text-xs mt-1">Create a new task to get started</p>
            </div>
        );
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'completed':
                return 'bg-green-100 text-green-700 border-green-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusDot = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-400 animate-pulse';
            case 'completed':
                return 'bg-green-400';
            default:
                return 'bg-gray-400';
        }
    };

    return (
        <div className="bg-white/50 backdrop-blur-sm rounded-2xl border border-white/60 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700">📋 Recent Tasks</h3>
                <span className="text-xs text-gray-400">{tasks.length} tasks</span>
            </div>
            <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
                {tasks.map((task) => (
                    <div
                        key={task.id}
                        onClick={() => onTaskClick && onTaskClick(task)}
                        className="px-4 py-3 hover:bg-white/30 transition-all duration-200 cursor-pointer group"
                    >
                        <div className="flex items-start gap-3">
                            {/* Status dot */}
                            <div className="flex-shrink-0 mt-1.5">
                                <div className={`w-2 h-2 rounded-full ${getStatusDot(task.status)}`}></div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800 group-hover:text-gray-900 truncate">
                                    {task.title}
                                </p>
                                {task.description && (
                                    <p className="text-xs text-gray-500 truncate mt-0.5">
                                        {task.description}
                                    </p>
                                )}
                                {task.due_date && (
                                    <p className="text-xs text-gray-400 mt-1">
                                        📅 Due: {new Date(task.due_date).toLocaleDateString('id-ID')}
                                    </p>
                                )}
                            </div>

                            {/* Status badge */}
                            <div className="flex-shrink-0">
                                <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(task.status)}`}>
                                    {task.status}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TaskList;