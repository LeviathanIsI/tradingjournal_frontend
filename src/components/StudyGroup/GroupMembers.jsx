import React from "react";
import { Users, UserPlus, CheckCircle } from "lucide-react";

const GroupMembers = ({
  currentGroup,
  user,
  isCreator,
  isMember,
  setShowInviteForm,
}) => {
  return (
    <div className="bg-white dark:bg-gray-700/60 rounded-md border border-gray-200 dark:border-gray-600 shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
          <Users className="mr-2 h-5 w-5 text-blue-500 dark:text-blue-400" />
          Members ({currentGroup.members?.length || 0})
        </h2>
        {(isCreator || isMember) && (
          <button
            onClick={() => setShowInviteForm(true)}
            className="px-3 py-2 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-500 text-white rounded-md flex items-center text-sm transition-colors"
          >
            <UserPlus size={16} className="mr-1.5" />
            Invite
          </button>
        )}
      </div>

      {currentGroup.members?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {currentGroup.members.map((member) => (
            <div
              key={member._id}
              className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800/30"
            >
              <div className="w-10 h-10 rounded-md bg-blue-500 flex items-center justify-center text-white font-bold mr-3">
                {member.username?.charAt(0).toUpperCase() || "?"}
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {member.username}
                </p>
                {member._id === currentGroup.creator?._id && (
                  <p className="text-xs text-blue-500 dark:text-blue-400 flex items-center">
                    <CheckCircle size={12} className="mr-1" />
                    Group Creator
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-gray-50 dark:bg-gray-800/20 rounded-md">
          <Users size={40} className="mx-auto mb-2 text-gray-400" />
          <p className="text-gray-500 dark:text-gray-400">No members yet.</p>
        </div>
      )}

      {currentGroup.invitees?.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Pending Invitations
          </h3>
          <div className="space-y-2">
            {currentGroup.invitees.map((invite) => (
              <div
                key={invite.user._id}
                className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800/30"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-md bg-gray-400 flex items-center justify-center text-white font-bold mr-3">
                    {invite.user.username?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <span className="text-gray-900 dark:text-gray-100">
                    {invite.user.email}
                  </span>
                </div>
                <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-700/30 text-yellow-800 dark:text-yellow-300 rounded-md">
                  {invite.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupMembers;
