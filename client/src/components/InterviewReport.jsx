import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const InterviewReport = ({ report, overallScore, reportLoading, interview }) => {
  const [feedbackTab, setFeedbackTab] = useState('overall');
  const [openQuestion, setOpenQuestion] = useState(null);
  const navigate = useNavigate();

  // Calculate average skill scores
  const avgSkills = report.length > 0 ? report.reduce((acc, item) => {
    acc.communication += item.skillAnalysis.communication;
    acc.grammar += item.skillAnalysis.grammar;
    acc.attitude += item.skillAnalysis.attitude;
    acc.softSkills += item.skillAnalysis.softSkills;
    return acc;
  }, { communication: 0, grammar: 0, attitude: 0, softSkills: 0 }) : { communication: 0, grammar: 0, attitude: 0, softSkills: 0 };

  if (report.length > 0) {
    avgSkills.communication = Math.round(avgSkills.communication / report.length * 10) / 10;
    avgSkills.grammar = Math.round(avgSkills.grammar / report.length * 10) / 10;
    avgSkills.attitude = Math.round(avgSkills.attitude / report.length * 10) / 10;
    avgSkills.softSkills = Math.round(avgSkills.softSkills / report.length * 10) / 10;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#f8fafc] to-[#e0e7ff] py-8 px-2">
      <h1 className="text-2xl md:text-3xl font-extrabold mb-4">Interview Feedback & Report</h1>
      {reportLoading ? (
        <div className="text-lg text-[#3b3bb3] font-semibold">Generating your report...</div>
      ) : (
        <div className="w-full max-w-4xl bg-white rounded-xl shadow p-6">
          {/* Tab Navigation */}
          <div className="flex gap-2 mb-6 border-b">
            <button 
              className={`px-4 py-2 rounded-t-lg font-semibold ${feedbackTab === 'overall' ? 'bg-[#3b3bb3] text-white' : 'bg-gray-100 text-gray-700'}`} 
              onClick={() => setFeedbackTab('overall')}
            >
              Overall Score
            </button>
            <button 
              className={`px-4 py-2 rounded-t-lg font-semibold ${feedbackTab === 'interview' ? 'bg-[#3b3bb3] text-white' : 'bg-gray-100 text-gray-700'}`} 
              onClick={() => setFeedbackTab('interview')}
            >
              Interview
            </button>
            <button 
              className={`px-4 py-2 rounded-t-lg font-semibold ${feedbackTab === 'skills' ? 'bg-[#3b3bb3] text-white' : 'bg-gray-100 text-gray-700'}`} 
              onClick={() => setFeedbackTab('skills')}
            >
              Skills
            </button>
            <button 
              className={`px-4 py-2 rounded-t-lg font-semibold ${feedbackTab === 'questions' ? 'bg-[#3b3bb3] text-white' : 'bg-gray-100 text-gray-700'}`} 
              onClick={() => setFeedbackTab('questions')}
            >
              Questions
            </button>
          </div>

          {/* Overall Score Tab */}
          {feedbackTab === 'overall' && (
            <div>
              <div className="text-3xl font-bold mb-6 text-center text-[#3b3bb3]">
                Overall Performance Score: <span className="text-black">{overallScore} / 10</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-4 text-blue-800">Performance Breakdown</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Content Accuracy</span>
                      <span className="font-bold text-blue-600">{overallScore}/10</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Communication</span>
                      <span className="font-bold text-blue-600">{avgSkills.communication}/10</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Grammar & Language</span>
                      <span className="font-bold text-blue-600">{avgSkills.grammar}/10</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Professional Attitude</span>
                      <span className="font-bold text-blue-600">{avgSkills.attitude}/10</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Soft Skills</span>
                      <span className="font-bold text-blue-600">{avgSkills.softSkills}/10</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-4 text-green-800">Recommendations</h3>
                  <div className="space-y-2 text-sm">
                    {overallScore < 7 && (
                      <div className="flex items-start">
                        <span className="text-red-500 mr-2">•</span>
                        <span>Focus on improving content accuracy and technical knowledge</span>
                      </div>
                    )}
                    {avgSkills.communication < 7 && (
                      <div className="flex items-start">
                        <span className="text-orange-500 mr-2">•</span>
                        <span>Work on clear communication and articulation</span>
                      </div>
                    )}
                    {avgSkills.grammar < 7 && (
                      <div className="flex items-start">
                        <span className="text-orange-500 mr-2">•</span>
                        <span>Improve grammar and language proficiency</span>
                      </div>
                    )}
                    {avgSkills.attitude < 7 && (
                      <div className="flex items-start">
                        <span className="text-orange-500 mr-2">•</span>
                        <span>Maintain professional attitude and enthusiasm</span>
                      </div>
                    )}
                    {avgSkills.softSkills < 7 && (
                      <div className="flex items-start">
                        <span className="text-orange-500 mr-2">•</span>
                        <span>Develop problem-solving and interpersonal skills</span>
                      </div>
                    )}
                    {(overallScore >= 7 && avgSkills.communication >= 7 && avgSkills.grammar >= 7 && avgSkills.attitude >= 7 && avgSkills.softSkills >= 7) && (
                      <div className="flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        <span>Excellent performance! Keep up the great work</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Interview Tab */}
          {feedbackTab === 'interview' && (
            <div>
              <h3 className="text-xl font-bold mb-4 text-[#3b3bb3]">Interview Recordings</h3>
              <div className="space-y-4">
                {report.map((item, idx) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <h4 className="font-bold text-[#3b3bb3] mb-2">Question {idx + 1}</h4>
                    <p className="text-gray-700 mb-3">{item.question}</p>
                    <div className="space-y-2">
                      {item.video && (
                        <div>
                          <label className="block text-sm font-semibold mb-1">Video Recording:</label>
                          <video controls className="w-full max-w-md rounded" src={item.video} />
                        </div>
                      )}
                      {item.audio && (
                        <div>
                          <label className="block text-sm font-semibold mb-1">Audio Recording:</label>
                          <audio controls className="w-full" src={item.audio} />
                        </div>
                      )}
                      {!item.video && !item.audio && (
                        <p className="text-gray-500 italic">No recording available for this question</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills Tab */}
          {feedbackTab === 'skills' && (
            <div>
              <h3 className="text-xl font-bold mb-4 text-[#3b3bb3]">Skills Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">Communication</span>
                      <span className="font-bold text-[#3b3bb3]">{avgSkills.communication}/10</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className={`h-3 rounded-full ${avgSkills.communication < 4 ? 'bg-red-500' : avgSkills.communication < 7 ? 'bg-yellow-500' : 'bg-green-500'}`} 
                           style={{ width: `${(avgSkills.communication / 10) * 100}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">Grammar & Language</span>
                      <span className="font-bold text-[#3b3bb3]">{avgSkills.grammar}/10</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className={`h-3 rounded-full ${avgSkills.grammar < 4 ? 'bg-red-500' : avgSkills.grammar < 7 ? 'bg-yellow-500' : 'bg-green-500'}`} 
                           style={{ width: `${(avgSkills.grammar / 10) * 100}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">Professional Attitude</span>
                      <span className="font-bold text-[#3b3bb3]">{avgSkills.attitude}/10</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className={`h-3 rounded-full ${avgSkills.attitude < 4 ? 'bg-red-500' : avgSkills.attitude < 7 ? 'bg-yellow-500' : 'bg-green-500'}`} 
                           style={{ width: `${(avgSkills.attitude / 10) * 100}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">Soft Skills</span>
                      <span className="font-bold text-[#3b3bb3]">{avgSkills.softSkills}/10</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className={`h-3 rounded-full ${avgSkills.softSkills < 4 ? 'bg-red-500' : avgSkills.softSkills < 7 ? 'bg-yellow-500' : 'bg-green-500'}`} 
                           style={{ width: `${(avgSkills.softSkills / 10) * 100}%` }}></div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-bold mb-3 text-[#3b3bb3]">Skill Insights</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Communication:</strong> {avgSkills.communication >= 7 ? 'Excellent clarity and articulation' : avgSkills.communication >= 4 ? 'Good communication with room for improvement' : 'Needs improvement in clarity and articulation'}</p>
                    <p><strong>Grammar:</strong> {avgSkills.grammar >= 7 ? 'Strong language proficiency' : avgSkills.grammar >= 4 ? 'Adequate language skills' : 'Grammar and vocabulary need improvement'}</p>
                    <p><strong>Attitude:</strong> {avgSkills.attitude >= 7 ? 'Professional and enthusiastic approach' : avgSkills.attitude >= 4 ? 'Good professional demeanor' : 'Work on maintaining professional attitude'}</p>
                    <p><strong>Soft Skills:</strong> {avgSkills.softSkills >= 7 ? 'Strong problem-solving and interpersonal skills' : avgSkills.softSkills >= 4 ? 'Good soft skills foundation' : 'Focus on developing soft skills'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Questions Tab */}
          {feedbackTab === 'questions' && (
            <div className="max-h-[500px] overflow-y-auto">
              {report.map((item, idx) => (
                <div key={idx} className="mb-4 border rounded-lg p-4">
                  <button
                    className="w-full text-left font-bold text-[#3b3bb3] py-2 flex justify-between items-center focus:outline-none"
                    onClick={() => setOpenQuestion(openQuestion === idx ? null : idx)}
                  >
                    <span>Q{idx + 1}: {item.question}</span>
                    <span>{openQuestion === idx ? '−' : '+'}</span>
                  </button>
                  {openQuestion === idx && (
                    <div className="p-4 bg-gray-50 rounded-b space-y-3">
                      <div>
                        <span className="font-semibold">Your Answer:</span> 
                        <p className="mt-1 text-gray-700">{item.user || <span className="italic text-gray-400">No answer</span>}</p>
                      </div>
                      {item.transcribedText && item.transcribedText !== item.user && (
                        <div>
                          <span className="font-semibold text-blue-600">Transcribed from Voice:</span> 
                          <p className="mt-1 text-blue-700 italic">{item.transcribedText}</p>
                        </div>
                      )}
                      {item.audio && (
                        <div>
                          <span className="font-semibold">Audio Recording:</span>
                          <audio src={item.audio} controls className="mt-1 w-full" />
                        </div>
                      )}
                      <div>
                        <span className="font-semibold">Ideal Answer:</span>
                        <p className="mt-1 text-gray-700">{item.ideal}</p>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        <div className="bg-blue-50 p-2 rounded">
                          <span className="font-semibold">Content Score:</span> {item.score}/10
                        </div>
                        <div className="bg-green-50 p-2 rounded">
                          <span className="font-semibold">Communication:</span> {item.skillAnalysis.communication}/10
                        </div>
                        <div className="bg-yellow-50 p-2 rounded">
                          <span className="font-semibold">Grammar:</span> {item.skillAnalysis.grammar}/10
                        </div>
                        <div className="bg-purple-50 p-2 rounded">
                          <span className="font-semibold">Attitude:</span> {item.skillAnalysis.attitude}/10
                        </div>
                      </div>
                      {item.relevanceScore !== undefined && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                          <div className="bg-red-50 p-2 rounded">
                            <span className="font-semibold">Relevance Score:</span> {item.relevanceScore}/10
                          </div>
                          <div className="bg-orange-50 p-2 rounded">
                            <span className="font-semibold">Soft Skills:</span> {item.skillAnalysis.softSkills}/10
                          </div>
                        </div>
                      )}
                      {item.skill && (
                        <div>
                          <span className="font-semibold">Skill Category:</span> {item.skill}
                        </div>
                      )}
                      {item.feedback && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <span className="font-semibold text-blue-800">Detailed Feedback:</span>
                          <p className="mt-1 text-blue-700 text-sm">{item.feedback}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-center mt-8">
            <button
              className="bg-[#3b3bb3] text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:bg-[#23237a] transition-all text-lg"
              onClick={() => navigate('/interviews')}
            >
              Back to Interviews
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewReport; 