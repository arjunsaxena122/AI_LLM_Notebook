"use client";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import {
  Plus,
  Send,
  File,
  Menu,
  X,
  Trash2,
  Upload,
  FileText,
} from "lucide-react";
import axios from "axios";

interface UploadedFile {
  id: number;
  name: string;
  size: string;
  uploadDate: string;
  type: string;
}

export default function Home() {
  const [userQuery, setUserQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [messages, setMessages] = useState<
    Array<{ id: number; text: string; type: "user" | "bot"; file?: string }>
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUploadFile(file);
    }
  };

  const handleUploadFile = async (file: File) => {
    const data = new FormData();
    data.append("file", file);
    setIsUploading(true);

    try {
      const res = await axios.post("/api/v1/upload", data);

      if (res?.status === 200) {
        const newFile: UploadedFile = {
          id: Date.now(),
          name: file.name,
          size: formatFileSize(file.size),
          uploadDate: new Date().toLocaleDateString(),
          type: file.type || "unknown",
        };
        setUploadedFiles((prev) => [newFile, ...prev]);

        const successMessage = {
          id: Date.now() + 1,
          text: `File "${file.name}" uploaded successfully!`,
          type: "bot" as const,
        };
        setMessages((prev) => [...prev, successMessage]);
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.log(error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "Failed to upload file. Please try again.",
        type: "bot" as const,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUserQuery = async () => {
    if (!userQuery.trim()) return;
    const userMessage = {
      id: Date.now(),
      text: userQuery,
      type: "user" as const,
    };
    setMessages((prev) => [...prev, userMessage]);

    const currentQuery = userQuery;
    setUserQuery("");
    setIsLoading(true);

    try {
      const { data } = await axios.post("/api/v1/chat", { query: userQuery });

      // Add bot response (you can customize this based on your API response)
      const botMessage = {
        id: Date.now() + 1,
        text: data.data || "I'm processing your request...",
        type: "bot" as const,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.log(error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I couldn't process your request. Please try again.",
        type: "bot" as const,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleUserQuery();
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const deleteFile = (fileId: number) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  const getFileIcon = (type: string) => {
    if (type.includes("pdf"))
      return <FileText className="text-red-500" size={16} />;
    if (type.includes("image"))
      return <File className="text-blue-500" size={16} />;
    if (type.includes("text"))
      return <FileText className="text-green-500" size={16} />;
    return <File className="text-gray-500" size={16} />;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div
        className={`${
          isSidebarOpen ? "w-80" : "w-0"
        } transition-all duration-300 overflow-hidden bg-white border-r border-gray-200 flex flex-col`}
      >
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800 flex items-center">
              <Upload size={20} className="mr-2" />
              Uploaded Files
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden"
            >
              <X size={16} />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {uploadedFiles.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">
              <Upload size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-sm">No files uploaded yet</p>
              <p className="text-xs text-gray-400 mt-1">
                Click the + button to upload files
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      {getFileIcon(file.type)}
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-medium text-gray-800 truncate"
                          title={file.name}
                        >
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {file.size} • {file.uploadDate}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteFile(file.id)}
                      className="ml-2 h-6 w-6 p-0 hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hover:bg-gray-100"
            >
              <Menu size={20} />
            </Button>
            <h1 className="text-xl font-semibold text-gray-800">
              Chat Assistant
            </h1>
            {uploadedFiles.length > 0 && (
              <div className="text-sm text-gray-500">
                {uploadedFiles.length} file
                {uploadedFiles.length !== 1 ? "s" : ""} uploaded
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-20">
              <h2 className="text-2xl font-semibold mb-2">
                How can I help you today?
              </h2>
              <p>Upload a file using the + button or start a conversation</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-lg ${
                    message.type === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-white border border-gray-200 text-gray-800"
                  }`}
                >
                  {message.file ? (
                    <div className="flex items-center space-x-2">
                      <File size={16} />
                      <span>{message.text}</span>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{message.text}</p>
                  )}
                </div>
              </div>
            ))
          )}

          {(isLoading || isUploading) && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 text-gray-800 px-4 py-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  <span>
                    {isUploading ? "Uploading file..." : "Processing..."}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white border-t border-gray-200 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="relative flex items-end space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={triggerFileInput}
                disabled={isUploading}
                className="mb-2 text-black"
                title="Upload file"
              >
                <Plus size={20} />
              </Button>

              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif"
              />

              <div className="flex-1 relative">
                <textarea
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Message..."
                  className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent max-h-32 text-black"
                  rows={1}
                  style={{
                    minHeight: "48px",
                    height: "auto",
                  }}
                />

                <Button
                  onClick={handleUserQuery}
                  disabled={!userQuery.trim() || isLoading}
                  size="icon"
                  className="absolute right-2 bottom-2 h-8 w-8 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-black"
                >
                  <Send size={16} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
