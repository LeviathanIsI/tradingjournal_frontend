import React from "react";
import { X } from "lucide-react";

const InvitationModal = ({
  showInviteForm,
  setShowInviteForm,
  inviteEmail,
  setInviteEmail,
  handleInviteSubmit,
}) => {
  if (!showInviteForm) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white dark:bg-gray-700/60 rounded-sm p-4 sm:p-6 w-full max-w-md 
        border border-gray-200 dark:border-gray-600/50 shadow-sm"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
            Invite Member
          </h3>
          <button
            onClick={() => setShowInviteForm(false)}
            className="p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600/70 
            text-gray-500 dark:text-gray-400"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>
        <form onSubmit={handleInviteSubmit}>
          <div className="mb-4">
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600/70 rounded-sm 
              bg-white dark:bg-gray-600/50 text-gray-900 dark:text-gray-100"
              placeholder="Enter email address"
              required
            />
          </div>
          <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => setShowInviteForm(false)}
              className="w-full sm:w-auto px-4 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600/70 rounded-sm 
              bg-white dark:bg-gray-600/50 text-gray-700 dark:text-gray-300 
              hover:bg-gray-50 dark:hover:bg-gray-600/70 text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-blue-600 text-white rounded-sm 
              hover:bg-blue-700 dark:hover:bg-blue-500 text-sm sm:text-base"
            >
              Send Invitation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvitationModal;
