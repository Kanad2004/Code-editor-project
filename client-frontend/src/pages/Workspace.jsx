import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import Split from "react-split";
import DOMPurify from "dompurify";
import { IoPlay, IoSend } from "react-icons/io5";
import toast from "react-hot-toast";
import usePrivateApi from "../hooks/usePrivateApi";
import useLocalStorage from "../hooks/useLocalStorage";
import Editor from "../components/Editor";
import { SkeletonWorkspace } from "../components/SkeletonLoader";
import { STATUS_COLORS } from "../utils/constants";
import { CODE_TEMPLATES } from "../utils/codeTemplates";
import useTheme from "../hooks/useTheme";
import { showSubmissionToast } from "../components/Toast";
const Workspace = () => {
  const { slug } = useParams();
  const privateApi = usePrivateApi();
  const { theme } = useTheme();

  const [problem, setProblem] = useState(null);
  const [language, setLanguage] = useLocalStorage(`language_${slug}`, "cpp");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState(null);
  const [testOutput, setTestOutput] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState("problem"); // For mobile

  const pollIntervalRef = useRef(null);

  // Load saved code or template
  useEffect(() => {
    const savedCode = localStorage.getItem(`code_${slug}_${language}`);
    if (savedCode) {
      setCode(savedCode);
    } else {
      setCode(CODE_TEMPLATES[language] || CODE_TEMPLATES.cpp);
    }
  }, [slug, language]);

  // Fetch problem details
  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const response = await privateApi.get(`/problems/${slug}`);
        setProblem(response.data.data);
      } catch (err) {
        console.error("Failed to fetch problem", err);
        toast.error("Failed to load problem");
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [slug, privateApi]);

  // Polling function
  const pollForResult = (submissionId) => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await privateApi.get(`/submissions/${submissionId}`);
        const data = res.data.data;

        if (data.status !== "Pending" && data.status !== "Judging") {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
          setOutput({
            status: data.status,
            verdict: data.verdict,
            executionTime: data.execution_time,
            memory: data.memory_used,
          });
          setIsSubmitting(false);

          if (data.status === "Accepted") {
            showSubmissionToast("Accepted", "All test cases passed! 🎉");
          } else {
            showSubmissionToast(data.status, data.verdict);
          }
        }
      } catch (err) {
        console.error("Polling failed", err);
        clearInterval(pollIntervalRef.current);
        setIsSubmitting(false);
        setOutput({ status: "Error", verdict: "Failed to get result" });
        toast.error("Failed to get result");
      }
    }, 2000);
  };

  // Handle Submit
  const handleSubmit = async () => {
    if (!code.trim()) {
      toast.error("Please write some code first!");
      return;
    }

    setIsSubmitting(true);
    setOutput({ status: "Pending", verdict: "Submitting..." });

    try {
      const response = await privateApi.post("/submissions", {
        problem_id: problem._id,
        language: language,
        source_code: code,
      });

      const { submission_id } = response.data.data;
      setOutput({ status: "Judging", verdict: "Code is being judged..." });
      toast.loading("Judging your code...", { id: "submit" });
      pollForResult(submission_id);
    } catch (err) {
      console.error("Submission failed", err);
      setOutput({
        status: "Error",
        verdict: err.response?.data?.message || "Submission failed",
      });
      setIsSubmitting(false);
      toast.error("Submission failed");
    }
  };

  // Handle Run (Test with sample cases only)
  const handleRun = async () => {
    if (!code.trim()) {
      toast.error("Please write some code first!");
      return;
    }

    setIsRunning(true);
    setTestOutput({
      status: "Running",
      message: "Running sample test cases...",
    });
    toast.loading("Running test cases...", { id: "run" });

    try {
      // Simulate running against sample cases
      // In real implementation, you'd have a separate endpoint
      const response = await privateApi.post("/submissions/test", {
        problem_id: problem._id,
        language: language,
        source_code: code,
        test_cases: problem.sample_cases,
      });

      const result = response.data.data;
      setTestOutput(result);
      toast.success("Test completed!", { id: "run" });
    } catch (err) {
      console.error("Test run failed", err);
      setTestOutput({ status: "Error", message: "Failed to run tests" });
      toast.error("Test run failed", { id: "run" });
    } finally {
      setIsRunning(false);
    }
  };

  // Keyboard shortcut: Ctrl+Enter to submit
  useEffect(() => {
    const handleKeyPress = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (!isSubmitting) {
          handleSubmit();
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [code, isSubmitting, problem]);

  if (loading) return <SkeletonWorkspace />;
  if (!problem)
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Problem not found</h2>
      </div>
    );

  const sanitizedDescription = DOMPurify.sanitize(problem.description);

  return (
    <>
      {/* Mobile Tabs */}
      <div className="lg:hidden flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab("problem")}
          className={`flex-1 py-2 rounded ${
            activeTab === "problem" ? "bg-blue-500" : "bg-gray-700"
          }`}
        >
          Problem
        </button>
        <button
          onClick={() => setActiveTab("code")}
          className={`flex-1 py-2 rounded ${
            activeTab === "code" ? "bg-blue-500" : "bg-gray-700"
          }`}
        >
          Code
        </button>
        <button
          onClick={() => setActiveTab("output")}
          className={`flex-1 py-2 rounded ${
            activeTab === "output" ? "bg-blue-500" : "bg-gray-700"
          }`}
        >
          Output
        </button>
      </div>

      {/* Desktop Split View */}
      <div className="hidden lg:block h-[calc(100vh-120px)]">
        <Split
          sizes={[50, 50]}
          minSize={300}
          gutterSize={8}
          className="flex gap-2"
        >
          {/* Problem Details */}
          <div
            className={`${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            } p-6 rounded-lg overflow-auto`}
          >
            <h1 className="text-3xl font-bold mb-4">{problem.title}</h1>
            <span
              className={`inline-block px-3 py-1 rounded mb-4 ${
                problem.difficulty === "Easy"
                  ? "bg-green-500"
                  : problem.difficulty === "Medium"
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
            >
              {problem.difficulty}
            </span>

            <div
              className="prose prose-invert max-w-none mb-6"
              dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
            />

            <h2 className="text-xl font-semibold mb-3">Sample Test Cases</h2>
            {problem.sample_cases?.map((sample, index) => (
              <div
                key={index}
                className={`${
                  theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                } p-4 rounded mb-3`}
              >
                <h3 className="font-semibold mb-2">Sample {index + 1}</h3>
                <pre
                  className={`${
                    theme === "dark" ? "bg-gray-900" : "bg-gray-200"
                  } p-3 rounded`}
                >
                  <strong>Input:</strong> {sample.input}
                  <br />
                  <strong>Output:</strong> {sample.output}
                </pre>
              </div>
            ))}
          </div>

          {/* Code Editor & Output */}
          <div className="flex flex-col gap-3">
            <div
              className={`${
                theme === "dark" ? "bg-gray-800" : "bg-white"
              } rounded-lg overflow-hidden`}
            >
              <div className="flex items-center justify-between p-3 border-b border-gray-700">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className={`px-3 py-1 rounded ${
                    theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                  } border border-gray-600`}
                >
                  <option value="cpp">C++</option>
                  <option value="java">Java</option>
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                </select>

                <div className="flex gap-2">
                  <button
                    onClick={handleRun}
                    disabled={isRunning}
                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600 px-4 py-2 rounded disabled:bg-gray-600 transition"
                  >
                    <IoPlay /> {isRunning ? "Running..." : "Run"}
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded disabled:bg-gray-600 transition"
                  >
                    <IoSend /> {isSubmitting ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </div>
              <Editor
                language={language}
                code={code}
                setCode={setCode}
                problemSlug={slug}
              />
            </div>

            {/* Output Section */}
            <div
              className={`${
                theme === "dark" ? "bg-gray-800" : "bg-white"
              } p-4 rounded-lg flex-shrink-0`}
            >
              <div className="flex gap-4 mb-3">
                <button
                  onClick={() => setTestOutput(null)}
                  className={`px-4 py-1 rounded ${
                    !testOutput ? "bg-blue-500" : "bg-gray-700"
                  }`}
                >
                  Submission Result
                </button>
                <button
                  onClick={() => {}}
                  className={`px-4 py-1 rounded ${
                    testOutput ? "bg-blue-500" : "bg-gray-700"
                  }`}
                >
                  Test Output
                </button>
              </div>

              {!testOutput && output && (
                <div>
                  <h2 className="text-xl font-semibold mb-2">Result</h2>
                  <p
                    className={`text-lg font-bold ${
                      STATUS_COLORS[output.status] || "text-gray-400"
                    }`}
                  >
                    {output.status}
                  </p>
                  <pre
                    className={`${
                      theme === "dark" ? "bg-gray-900" : "bg-gray-200"
                    } p-3 rounded mt-2 whitespace-pre-wrap`}
                  >
                    {output.verdict}
                  </pre>
                  {output.executionTime && (
                    <p className="text-sm mt-2 text-gray-400">
                      Execution Time: {output.executionTime}ms | Memory:{" "}
                      {output.memory}KB
                    </p>
                  )}
                </div>
              )}

              {testOutput && (
                <div>
                  <h2 className="text-xl font-semibold mb-2">Test Output</h2>
                  <pre
                    className={`${
                      theme === "dark" ? "bg-gray-900" : "bg-gray-200"
                    } p-3 rounded whitespace-pre-wrap`}
                  >
                    {testOutput.message || JSON.stringify(testOutput, null, 2)}
                  </pre>
                </div>
              )}

              {!output && !testOutput && (
                <p className="text-gray-400">
                  Run or submit your code to see output here
                </p>
              )}
            </div>

            <p className="text-sm text-gray-400 text-center">
              💡 Tip: Press Ctrl+Enter to submit quickly
            </p>
          </div>
        </Split>
      </div>

      {/* Mobile View */}
      <div className="lg:hidden">
        {activeTab === "problem" && (
          <div
            className={`${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            } p-6 rounded-lg`}
          >
            <h1 className="text-2xl font-bold mb-4">{problem.title}</h1>
            <div
              className="prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
            />
            <h2 className="text-xl font-semibold mt-6 mb-2">Sample Cases</h2>
            {problem.sample_cases?.map((sample, index) => (
              <div
                key={index}
                className={`${
                  theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                } p-4 rounded mb-2`}
              >
                <h3 className="font-semibold">Sample {index + 1}</h3>
                <pre
                  className={`${
                    theme === "dark" ? "bg-gray-900" : "bg-gray-200"
                  } p-2 rounded mt-2`}
                >
                  <strong>Input:</strong> {sample.input}
                  <br />
                  <strong>Output:</strong> {sample.output}
                </pre>
              </div>
            ))}
          </div>
        )}

        {activeTab === "code" && (
          <div>
            <div className="flex justify-between mb-2">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className={`px-3 py-1 rounded ${
                  theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                }`}
              >
                <option value="cpp">C++</option>
                <option value="java">Java</option>
                <option value="python">Python</option>
              </select>
            </div>
            <div
              className={`${
                theme === "dark" ? "bg-gray-800" : "bg-white"
              } rounded-lg overflow-hidden`}
            >
              <Editor
                language={language}
                code={code}
                setCode={setCode}
                problemSlug={slug}
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleRun}
                disabled={isRunning}
                className="flex-1 bg-green-500 hover:bg-green-600 py-2 rounded disabled:bg-gray-600"
              >
                {isRunning ? "Running..." : "Run"}
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-blue-500 hover:bg-blue-600 py-2 rounded disabled:bg-gray-600"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        )}

        {activeTab === "output" && (
          <div
            className={`${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            } p-4 rounded-lg`}
          >
            {output ? (
              <div>
                <h2 className="text-xl font-semibold mb-2">Result</h2>
                <p
                  className={`text-lg font-bold ${
                    STATUS_COLORS[output.status]
                  }`}
                >
                  {output.status}
                </p>
                <pre
                  className={`${
                    theme === "dark" ? "bg-gray-900" : "bg-gray-200"
                  } p-3 rounded mt-2 whitespace-pre-wrap`}
                >
                  {output.verdict}
                </pre>
              </div>
            ) : (
              <p className="text-gray-400">
                No output yet. Run or submit your code.
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Workspace;
