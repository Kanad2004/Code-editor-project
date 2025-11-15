import React from 'react';
import { toast } from 'react-hot-toast';
import { IoCheckmarkCircle, IoCloseCircle, IoInformationCircle, IoWarning } from 'react-icons/io5';

// Custom toast helper functions
export const showSuccessToast = (message) => {
  toast.success(message, {
    icon: <IoCheckmarkCircle className="text-green-500" size={24} />,
    style: {
      background: '#1f2937',
      color: '#fff',
      borderRadius: '8px',
      padding: '16px',
    },
  });
};

export const showErrorToast = (message) => {
  toast.error(message, {
    icon: <IoCloseCircle className="text-red-500" size={24} />,
    style: {
      background: '#1f2937',
      color: '#fff',
      borderRadius: '8px',
      padding: '16px',
    },
  });
};

export const showInfoToast = (message) => {
  toast(message, {
    icon: <IoInformationCircle className="text-blue-500" size={24} />,
    style: {
      background: '#1f2937',
      color: '#fff',
      borderRadius: '8px',
      padding: '16px',
    },
  });
};

export const showWarningToast = (message) => {
  toast(message, {
    icon: <IoWarning className="text-yellow-500" size={24} />,
    style: {
      background: '#1f2937',
      color: '#fff',
      borderRadius: '8px',
      padding: '16px',
    },
  });
};

// Custom toast component for code submission results
export const showSubmissionToast = (status, message) => {
  const config = {
    Accepted: {
      icon: <IoCheckmarkCircle className="text-green-500" size={24} />,
      background: 'linear-gradient(to right, #059669, #10b981)',
    },
    'Wrong Answer': {
      icon: <IoCloseCircle className="text-red-500" size={24} />,
      background: 'linear-gradient(to right, #dc2626, #ef4444)',
    },
    'Time Limit Exceeded': {
      icon: <IoWarning className="text-yellow-500" size={24} />,
      background: 'linear-gradient(to right, #d97706, #f59e0b)',
    },
    'Compilation Error': {
      icon: <IoWarning className="text-yellow-500" size={24} />,
      background: 'linear-gradient(to right, #d97706, #f59e0b)',
    },
    'Runtime Error': {
      icon: <IoCloseCircle className="text-red-500" size={24} />,
      background: 'linear-gradient(to right, #dc2626, #ef4444)',
    },
  };

  const statusConfig = config[status] || config['Wrong Answer'];

  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        style={{ background: statusConfig.background }}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">{statusConfig.icon}</div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-bold text-white">{status}</p>
              <p className="mt-1 text-sm text-gray-100">{message}</p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-200">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-white hover:bg-black hover:bg-opacity-20 focus:outline-none"
          >
            Close
          </button>
        </div>
      </div>
    ),
    {
      duration: 5000,
    }
  );
};

// Loading toast with custom message
export const showLoadingToast = (message, id) => {
  toast.loading(message, {
    id: id,
    style: {
      background: '#1f2937',
      color: '#fff',
      borderRadius: '8px',
      padding: '16px',
    },
  });
};

// Dismiss specific toast
export const dismissToast = (id) => {
  toast.dismiss(id);
};

// Promise-based toast for async operations
export const showPromiseToast = async (promise, messages) => {
  return toast.promise(
    promise,
    {
      loading: messages.loading || 'Loading...',
      success: messages.success || 'Success!',
      error: messages.error || 'Error occurred',
    },
    {
      style: {
        background: '#1f2937',
        color: '#fff',
        borderRadius: '8px',
        padding: '16px',
      },
    }
  );
};

// Custom Toast Component (if you want to render in a specific way)
const Toast = ({ type = 'info', message, onClose }) => {
  const icons = {
    success: <IoCheckmarkCircle className="text-green-500" size={24} />,
    error: <IoCloseCircle className="text-red-500" size={24} />,
    info: <IoInformationCircle className="text-blue-500" size={24} />,
    warning: <IoWarning className="text-yellow-500" size={24} />,
  };

  const bgColors = {
    success: 'bg-green-500 bg-opacity-10 border-green-500',
    error: 'bg-red-500 bg-opacity-10 border-red-500',
    info: 'bg-blue-500 bg-opacity-10 border-blue-500',
    warning: 'bg-yellow-500 bg-opacity-10 border-yellow-500',
  };

  return (
    <div className={`flex items-center gap-3 p-4 rounded-lg border ${bgColors[type]} animate-slide-in`}>
      {icons[type]}
      <p className="flex-1 text-sm">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition"
        >
          <IoCloseCircle size={20} />
        </button>
      )}
    </div>
  );
};

export default Toast;
