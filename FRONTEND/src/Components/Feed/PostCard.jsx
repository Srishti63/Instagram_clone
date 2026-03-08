import { useState } from "react";
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import API from "../../Api/axios";

export default function PostCard({ post, onDelete }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Destructure safely
  const { _id, owner, mediaUrl, caption, likes = [] } = post || {};
  const [likeCount, setLikeCount] = useState(likes.length);

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
        ) : (
          <button className="text-gray-500 hover:text-gray-800">
            <MoreHorizontal size={20} />
          </button>
        )}
      </div>

      {/* Image / Media */}
      <div className="bg-black flex items-center justify-center min-h-[300px] max-h-[600px] overflow-hidden">
        <img 
          src={mediaUrl} 
          alt="Post content" 
          className="w-full object-contain"
        />
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
            <button className="hover:opacity-70 transition-opacity">
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

        {/* Add Comment (Placeholder) */}
        <div className="text-gray-500 text-sm mt-2 cursor-pointer">
          Add a comment...
        </div>
      </div>
    </div>
  );
}
