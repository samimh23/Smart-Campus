"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, Loader2, RotateCcw } from "lucide-react";
import apiService from "@/apiService/apiService";

export default function ExplainPage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [steps, setSteps] = useState<any>([]);
  const [loading, setLoading] = useState(false);

  // 📤 Upload image to API
  const handleUpload = async (selectedFile: File) => {
    const formData = new FormData();
    formData.append("file", selectedFile);
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setFileUrl(data.url);
    } catch (err) {
      console.error(err);
      alert("Failed to upload image.");
    } finally {
      setLoading(false);
    }
  };

  // 🖱 Handle file input or drop
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      handleUpload(selected);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const selected = e.dataTransfer.files[0];
    if (selected) {
      setFile(selected);
      handleUpload(selected);
    }
  };

  // 🧠 Call backend explain API
  const handleExplain = async () => {
    if (!fileUrl || !prompt) return alert("Upload an image and write your question first.");
    setLoading(true);
    setSteps([]);
    try {
      const res = await apiService.post("/ai-explain/explain-image", { imageUrl: fileUrl, prompt });
      if (res) setSteps(res);
      else setSteps([{ text: "No steps found." }]);
    } catch (err) {
      console.error(err);
      alert("Failed to get AI explanation.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setFileUrl(null);
    setPrompt("");
    setSteps([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center py-12 px-4">
      <motion.h1
        className="text-4xl font-semibold text-gray-800 mb-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        🧠 AI Image Explainer
      </motion.h1>

      <AnimatePresence>
        {/* Step 1: Upload */}
        {!fileUrl && (
          <motion.div
            key="upload"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => document.getElementById("fileInput")?.click()}
            className="w-full max-w-md border-2 border-dashed border-gray-300 rounded-3xl p-10 bg-white shadow-md flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {loading ? (
              <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            ) : (
              <>
                <UploadCloud className="w-12 h-12 text-gray-400 mb-3" />
                <p className="text-gray-600 text-center font-medium">
                  Drag & drop or click to upload an image
                </p>
                <input
                  id="fileInput"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </>
            )}
          </motion.div>
        )}

        {/* Step 2: Image + prompt + explain */}
        {fileUrl && steps.length === 0 && (
          <motion.div
            key="explain"
            className="w-full max-w-md flex flex-col items-center space-y-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.img
              src={fileUrl}
              alt="Uploaded"
              className="rounded-2xl w-full object-cover shadow-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            />
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="What would you like the AI to explain about this image?"
              className="w-full border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-700 shadow-sm"
            />
            <button
              onClick={handleExplain}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 flex items-center justify-center"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Explain Image"}
            </button>
            <button
              onClick={handleReset}
              className="text-gray-500 hover:text-gray-700 text-sm mt-2"
            >
              ⏎ Upload another image
            </button>
          </motion.div>
        )}

        {/* Step 3: Show results */}
        {steps.length > 0 && (
          <motion.div
            key="results"
            className="w-full max-w-md space-y-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.img
              src={fileUrl!}
              alt="Analyzed"
              className="rounded-2xl w-full object-cover shadow-md"
            />
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 mt-4">
                🪄 Explanation Steps
              </h2>
              {steps.map((step, idx) => (
                <motion.div
                  key={idx}
                  className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex items-start space-x-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <div className="flex items-start space-x-3"> <div className="flex-shrink-0"> <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold"> {idx + 1} </div> </div> <div className="text-gray-700"> {step.text} </div> </div>
                </motion.div>
              ))}
            </div>

            {/* Textarea + explain again */}
            <div className="space-y-3 mt-6">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask a new question about this image..."
                className="w-full border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-700 shadow-sm"
              />
              <button
                onClick={handleExplain}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 flex items-center justify-center"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Ask Again"}
              </button>
              <button
                onClick={handleReset}
                className="flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800 mt-2"
              >
                <RotateCcw className="w-4 h-4" /> Upload another image
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}