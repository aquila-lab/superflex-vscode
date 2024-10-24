import React from 'react';

import { VSCodeWrapper } from '../api/vscodeApi';

const ProfileView: React.FunctionComponent<{
  vscodeAPI: Pick<VSCodeWrapper, 'postMessage' | 'onMessage'>;
}> = ({ vscodeAPI }) => {
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">User Profile</h2>
      {/* Add more profile-related components or information here */}
    </div>
  );
};

export default ProfileView;
