import React from 'react';

const PreTest = ({ 
  interview, 
  cameraOn, 
  micOn, 
  videoRef, 
  handleToggleMedia, 
  handleTestStart,
  startWarning, 
  showExitModal, 
  modalAction, 
  setShowExitModal, 
  setModalAction, 
  setStartWarning, 
  setPreTest, 
  navigate 
}) => {
  return (
    <div className="flex flex-col items-center p-4 md:p-8 min-h-screen bg-blue-50">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-4">Let's Get Started</h1>
      <p className="text-center text-lg mb-6">Please allow access to your <a href="#" className="text-blue-600 underline">camera and microphone</a> to proceed.</p>
      <div className="w-full max-w-4xl flex flex-col md:flex-row gap-4">
        {/* Job Info */}
        <div className="flex-1 bg-white rounded-lg shadow p-4 mb-4 md:mb-0">
          <p className="font-bold">Job Role/Job Position: <span className="font-normal">{interview.title}</span></p>
          <p className="font-bold">Job Description/Tech Stack: <span className="font-normal">{interview.role}</span></p>
          <p className="font-bold">Years of Experience: <span className="font-normal">{interview.yearsOfExperience || interview.experience || interview.jobExperience || 'N/A'}</span></p>
        </div>
        {/* Camera/Mic Controls */}
        <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-lg shadow p-4">
          <video ref={videoRef} autoPlay muted className={`w-40 h-32 mb-2 ${cameraOn ? "" : "hidden"}`} />
          <div className="flex gap-4 mb-2">
            <button
              className={`px-4 py-2 rounded ${cameraOn ? "bg-green-500 text-white" : "bg-gray-300 text-gray-700"}`}
              onClick={() => handleToggleMedia("camera")}
            >
              {cameraOn ? "Turn Off Camera" : "Turn On Camera"}
            </button>
            <button
              className={`px-4 py-2 rounded ${micOn ? "bg-green-500 text-white" : "bg-gray-300 text-gray-700"}`}
              onClick={() => handleToggleMedia("mic")}
            >
              {micOn ? "Turn Off Mic" : "Turn On Mic"}
            </button>
          </div>
          {/* Debug info */}
          <div className="text-xs text-gray-600 mt-2 text-center">
            <div>Camera: {cameraOn ? "✅ On" : "❌ Off"}</div>
            <div>Microphone: {micOn ? "✅ On" : "❌ Off"}</div>
            {!cameraOn && (
              <div className="text-red-600 mt-1">
                Click "Turn On Camera" to enable camera access
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Information Section */}
      <div className="w-full max-w-4xl mt-6">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded">
          <p className="font-bold flex items-center"><span className="mr-2">&#9432;</span> Information</p>
          <p className="text-sm mt-1">Enable Video Web Cam and Microphone to Start your AI Generated Mock Interview. It has 5 questions which you can answer and at the last you will get the report on the basis of your answer.<br/>
          <span className="font-bold">NOTE:</span> We never record your video, Web cam access you can disable at any time if you want.</p>
        </div>
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded">
          <p className="font-bold flex items-center"><span className="mr-2">&#10003;</span> AI Analysis Available</p>
          <p className="text-sm mt-1">AI analysis and feedback will be available after you finish your test.</p>
        </div>
        {/* Troubleshooting Section */}
        {!cameraOn && (
          <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded mt-4">
            <p className="font-bold flex items-center"><span className="mr-2">&#128736;</span> Camera Troubleshooting</p>
            <div className="text-sm mt-1 space-y-1">
              <p>• Make sure your browser has permission to access camera and microphone</p>
              <p>• Check that no other app is using your camera</p>
              <p>• Try refreshing the page and allowing permissions again</p>
              <p>• Ensure you're using HTTPS (required for camera access)</p>
              <p>• Try a different browser if issues persist</p>
            </div>
          </div>
        )}
      </div>
      {/* Start/Exit Buttons Row */}
      {startWarning && (
        <div className="mt-4 text-red-600 font-semibold">{startWarning}</div>
      )}
      <div className="flex gap-4 mt-8">
        <button
          className={`px-6 py-3 rounded text-white text-lg font-semibold ${cameraOn && micOn ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"}`}
          disabled={!(cameraOn && micOn)}
          onClick={() => {
            if (cameraOn && micOn) {
              setModalAction('start');
              setShowExitModal(true);
              setStartWarning("");
            } else {
              setStartWarning("Please enable both camera and microphone to start the test.");
            }
          }}
        >
          Start Test
        </button>
        <button
          className="px-6 py-3 rounded text-white text-lg font-semibold bg-red-500 hover:bg-red-600"
          onClick={() => {
            setModalAction('exit');
            setShowExitModal(true);
          }}
        >
          Exit Test
        </button>
      </div>
      {/* Confirmation Modal Popup for Start/Exit */}
      {showExitModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md flex flex-col items-center">
            <h2 className={`text-2xl font-bold mb-4 ${modalAction === 'exit' ? 'text-red-600' : 'text-blue-600'}`}>{modalAction === 'exit' ? 'Exit Mock Interview?' : 'Start Mock Interview?'}</h2>
            <p className="mb-6 text-gray-700 text-center">
              {modalAction === 'exit'
                ? 'Are you sure you want to exit? Your progress will not be saved.'
                : 'Are you sure you want to start the test? You will not be able to return to this screen.'}
            </p>
            <div className="flex gap-4 w-full justify-center">
              <button
                className="px-6 py-2 rounded bg-gray-300 text-gray-800 font-semibold hover:bg-gray-400"
                onClick={() => setShowExitModal(false)}
              >
                Cancel
              </button>
              <button
                className={`px-6 py-2 rounded font-semibold ${modalAction === 'exit' ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                onClick={() => {
                  setShowExitModal(false);
                  if (modalAction === 'exit') {
                    navigate('/interviews');
                  } else if (modalAction === 'start') {
                    handleTestStart();
                  }
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreTest; 