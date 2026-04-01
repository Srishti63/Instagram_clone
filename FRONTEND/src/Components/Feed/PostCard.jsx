import { useState, useRef, useEffect } from "react";
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import API from "../../Api/axios";
import CommentSection from "./CommentSection";

export default function PostCard({ post, onDelete, onHide }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [showHeartAnim, setShowHeartAnim] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const dropdownRef = useRef(null);
  
  // Destructure safely
  const { _id, owner, mediaUrl, caption, likes = [], createdAt } = post || {};
  const [likeCount, setLikeCount] = useState(likes.length);

  // Time ago formatter helper
  const getTimeAgo = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

  // Fallbacks if data is missing
  const username = owner?.username || "Unknown";
  const avatarUrl = owner?.avatar?.url || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";

  const isOwner = user?._id === owner?._id;

  const handleLike = () => {
    // We will wire this up to the backend later
    if (liked) {
      setLikeCount(prev => prev - 1);
      setLiked(false);
    } else {
      setLikeCount(prev => prev + 1);
      setLiked(true);
    }
  };

  const handleDoubleTap = () => {
    if (!liked) {
      handleLike();
    }
    // Trigger animation
    setShowHeartAnim(true);
    setTimeout(() => {
      setShowHeartAnim(false);
    }, 1000); // Heart pulses and disappears after 1s
  };

  const handleShare = async () => {
    const postUrl = `${window.location.origin}/post/${_id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post by ${username}`,
          text: caption || "Check out this post on InstaClone!",
          url: postUrl,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      // Fallback
      navigator.clipboard.writeText(postUrl);
      alert("Link copied to clipboard!");
    }
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowOptions(false);
      }
    };
    if (showOptions) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showOptions]);

  const handleHide = () => {
    if (onHide) {
      onHide(_id);
    } else {
      // Fallback: hide locally
      setIsHidden(true);
    }
    setShowOptions(false);
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      setIsDeleting(true);
      await API.delete(`/posts/${_id}`);
      if (onDelete) onDelete(_id);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete post");
      setIsDeleting(false);
    }
  };

  if (isHidden) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg mb-6 max-w-[470px] mx-auto overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3">
        <Link to={`/profile/${owner?._id}`} className="flex items-center gap-3">
          <img 
            src={avatarUrl} 
            alt={username} 
            className="w-8 h-8 rounded-full object-cover border border-gray-100"
          />
          <span className="font-semibold text-sm">{username}</span>
        </Link>
        
        {isOwner ? (
          <button 
            onClick={handleDelete} 
            disabled={isDeleting}
            className="text-red-500 hover:text-red-700 transition disabled:opacity-50"
            title="Delete Post"
          >
            <Trash2 size={20} />
          </button>
        ) : onHide ? (
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setShowOptions(!showOptions)}
              className="text-gray-500 hover:text-gray-800 p-1"
            >
              <MoreHorizontal size={20} />
            </button>
            
            {/* Dropdown Menu */}
            {showOptions && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10 py-1 font-medium text-sm">
                <button 
                  onClick={handleHide}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-800 transition-colors"
                >
                  Hide
                </button>
                <button 
                  onClick={() => setShowOptions(false)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500 transition-colors border-t border-gray-100"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Image / Media */}
      <div 
        className="bg-black flex items-center justify-center min-h-[300px] max-h-[600px] overflow-hidden relative cursor-pointer"
        onDoubleClick={handleDoubleTap}
      >
        <img 
          src={mediaUrl} 
          alt="Post content" 
          className="w-full object-contain select-none"
        />
        
        {/* Double-tap Heart Animation overlay */}
        {showHeartAnim && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <Heart 
              className="text-white drop-shadow-xl animate-ping" 
              size={100} 
              fill="white" 
            />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleLike} 
              className={`hover:opacity-70 transition-opacity ${liked ? "text-red-500" : "text-black"}`}
            >
              <Heart size={26} fill={liked ? "currentColor" : "none"} strokeWidth={liked ? 0 : 1.5} />
            </button>
            <button className="hover:opacity-70 transition-opacity">
              <MessageCircle size={26} strokeWidth={1.5} />
            </button>
            <button onClick={handleShare} className="hover:opacity-70 transition-opacity" title="Share">
              <Send size={26} strokeWidth={1.5} />
            </button>
          </div>
          <button className="hover:opacity-70 transition-opacity">
            <Bookmark size={26} strokeWidth={1.5} />
          </button>
        </div>

        {/* Likes Count */}
        <div className="font-semibold text-sm mb-1">
          {likeCount} {likeCount === 1 ? "like" : "likes"}
        </div>

        {/* Caption */}
        {caption && (
          <div className="text-sm">
            <Link to={`/profile/${owner?._id}`} className="font-semibold mr-2">
              {username}
            </Link>
            {caption}
          </div>
        )}

        {/* Comments Section Toggle */}
        <div className="mt-2">
          {!showComments ? (
            <div 
              className="text-gray-500 text-sm cursor-pointer flex justify-between items-center"
              onClick={() => setShowComments(true)}
            >
              <span className="hover:text-gray-700 transition-colors">View all comments</span>
              {/* Time Ago */}
              {createdAt && (
                <span className="text-xs text-gray-400 uppercase tracking-wide">
                  {getTimeAgo(createdAt)}
                </span>
              )}
            </div>
          ) : (
            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-1">
                <span 
                  className="text-gray-800 text-sm font-semibold cursor-pointer hover:underline"
                  onClick={() => setShowComments(false)}
                >
                  Hide comments
                </span>
                {createdAt && (
                  <span className="text-xs text-gray-400 uppercase tracking-wide">
                    {getTimeAgo(createdAt)}
                  </span>
                )}
              </div>
              <CommentSection postId={_id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Skeleton Loader for Posts
export function PostSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg mb-6 max-w-[470px] mx-auto overflow-hidden animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-200"></div>
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
        </div>
        <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
      </div>

      {/* Media Skeleton */}
      <div className="bg-gray-200 min-h-[300px] w-full"></div>

      {/* Actions and Text Skeleton */}
      <div className="p-3">
        <div className="flex gap-4 mb-4">
          <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
          <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
          <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
        </div>
        <div className="h-4 w-1/4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 w-3/4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}
