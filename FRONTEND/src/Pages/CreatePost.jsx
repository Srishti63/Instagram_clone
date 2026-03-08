import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import API from "../Api/axios";
import { useNavigate } from "react-router-dom";

export default function CreatePost() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith("image/")) {
        setError("Please select a valid image file.");
        return;
      }
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setError("");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      if (!droppedFile.type.startsWith("image/")) {
        setError("Please select a valid image file.");
        return;
      }
      setFile(droppedFile);
      setPreview(URL.createObjectURL(droppedFile));
      setError("");
    }
  };

  const removeImage = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select an image to post.");
      return;
    }

    setLoading(true);
    setError("");

    // Create FormData object to send the file and text
    const formData = new FormData();
    formData.append("media", file); // The backend expects 'media' exactly as defined in the multer middleware
    if (caption.trim() !== "") {
      formData.append("caption", caption);
    }

    try {
      await API.post("/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      // Clear and redirect home to see the post
      setFile(null);
      setPreview(null);
      setCaption("");
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Create New Post</h1>

      {error && (
        <div className="p-3 mb-6 text-sm text-red-500 bg-red-50 rounded-lg text-center font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6">
        
        {/* Image Upload Area */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Photo</label>
          
          {!preview ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="mt-1 flex justify-center px-6 pt-10 pb-12 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition"
            >
              <div className="space-y-2 flex flex-col items-center">
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="text-sm text-gray-600">
                  <span className="text-pink-500 font-semibold">Upload a file</span> or drag and drop
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>
          ) : (
            <div className="relative rounded-lg overflow-hidden bg-black flex items-center justify-center max-h-[500px]">
              <img src={preview} alt="Upload preview" className="object-contain max-h-[500px] w-full" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-3 right-3 p-1.5 bg-black/60 rounded-full text-white hover:bg-black/80 transition"
              >
                <X size={20} />
              </button>
            </div>
          )}
          
          {/* Hidden File Input */}
          <input
            id="file-upload"
            name="file-upload"
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileSelect}
          />
        </div>

        {/* Caption Area */}
        <div className="mb-8">
          <label htmlFor="caption" className="block text-sm font-medium text-gray-700 mb-2">
            Caption
          </label>
          <textarea
            id="caption"
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none resize-none"
            placeholder="Write a caption..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !file}
          className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-semibold text-white bg-gradient-to-r from-pink-500 to-orange-400 hover:opacity-90 focus:outline-none disabled:opacity-50 transition"
        >
          {loading ? (
            "Sharing..."
          ) : (
            <>
              <Upload size={20} /> Share Post
            </>
          )}
        </button>
      </form>
    </div>
  );
}
