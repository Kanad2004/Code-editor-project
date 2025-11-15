import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import usePrivateApi from '../hooks/usePrivateApi';
import Editor from '../components/Editor';
import Loader from '../components/Loader';

const defaultCode = `// Your C++ code here
#include <iostream>

int main() {
    std::cout << "Hello, World!";
    return 0;
}
`;

const Workspace = () => {
  const { slug } = useParams();
  const privateApi = usePrivateApi();

  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState(defaultCode);
  const [language, setLanguage] = useState('cpp');
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ref to store the interval ID for polling
  const pollIntervalRef = useRef(null);

  // Fetch problem details
  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const response = await privateApi.get(`/problems/${slug}`);
        setProblem(response.data.data);
      } catch (err) {
        console.error('Failed to fetch problem', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
    
    // Cleanup polling on component unmount
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [slug, privateApi]);

  // Polling function
  const pollForResult = (submissionId) => {
    // Clear any existing interval
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    
    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await privateApi.get(`/submissions/${submissionId}`);
        const data = res.data.data;

        if (data.status !== 'Pending' && data.status !== 'Judging') {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
          setOutput({ status: data.status, verdict: data.verdict });
          setIsSubmitting(false);
        }
      } catch (err) {
        console.error('Polling failed', err);
        clearInterval(pollIntervalRef.current);
        setIsSubmitting(false);
        setOutput({ status: 'Error', verdict: 'Failed to get result' });
      }
    }, 2000); // Poll every 2 seconds
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setOutput({ status: 'Pending', verdict: 'Submitting...' });
    
    try {
      const response = await privateApi.post('/submissions', {
        problem_id: problem._id,
        language: language,
        source_code: code,
      });
      
      const { submission_id } = response.data.data;
      setOutput({ status: 'Judging', verdict: 'Code is being judged...' });
      pollForResult(submission_id); // Start polling
      
    } catch (err) {
      console.error('Submission failed', err);
      setOutput({ status: 'Error', verdict: 'Submission failed' });
      setIsSubmitting(false);
    }
  };

  if (loading) return <Loader />;
  if (!problem) return <h2>Problem not found</h2>;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Accepted': return 'text-green-400';
      case 'Wrong Answer': return 'text-red-400';
      case 'Time Limit Exceeded': return 'text-yellow-400';
      case 'Compilation Error': return 'text-yellow-400';
      case 'Runtime Error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full">
      {/* Problem Details */}
      <div className="lg:w-1/2 bg-gray-800 p-6 rounded-lg overflow-auto">
        <h1 className="text-3xl font-bold mb-4">{problem.title}</h1>
        <p
          className="prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: problem.description }}
        />
        <h2 className="text-xl font-semibold mt-6 mb-2">Sample Cases</h2>
        {problem.sample_cases.map((sample, index) => (
          <div key={index} className="bg-gray-700 p-4 rounded mb-2">
            <h3 className="font-semibold">Sample {index + 1}</h3>
            <pre className="bg-gray-900 p-2 rounded mt-2">
              <strong>Input:</strong> {sample.input}
              <br />
              <strong>Output:</strong> {sample.output}
            </pre>
          </div>
        ))}
      </div>

      {/* Code Editor & Output */}
      <div className="lg:w-1/2 flex flex-col gap-4">
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <Editor language={language} code={code} setCode={setCode} />
        </div>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:bg-gray-600"
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
        {output && (
          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Result</h2>
            <p className={`text-lg font-bold ${getStatusColor(output.status)}`}>
              {output.status}
            </p>
            <pre className="bg-gray-900 p-3 rounded mt-2 whitespace-pre-wrap">
              {output.verdict}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default Workspace;