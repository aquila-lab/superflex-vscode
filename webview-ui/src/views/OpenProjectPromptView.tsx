import React from 'react';

const OpenProjectPromptView = (): JSX.Element => {
  return (
    <div className="flex flex-col justify-center items-center h-full vscode-dark text-white px-5 pb-4">
      <h3 className="text-2xl font-bold mb-4">No open project</h3>
      <p className="text-center">
        Please open a project to start using Superflex. If you have already opened a project, and still see this. Please
        restart Visual Studio Code.
      </p>
    </div>
  );
};

export default OpenProjectPromptView;
