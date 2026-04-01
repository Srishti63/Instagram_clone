import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../../Api/axios";
import { useAuth } from "../../Context/AuthContext";

export default function CommentSection({ postId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/comments/${postId}`);
        setComments(res.data?.data || res.data || []);
      } catch (err) {
        console.error("Failed to fetch comments", err);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    try {
      setSubmitting(true);
      const res = await API.post(`/comments/${postId}`, { text: newComment.trim() });
      const addedComment = res.data?.data || res.data;
      
      // Optimistically add to top of the list if backend returns it
      if (addedComment) {
        // Manually attach user info to match populated response structure
        const commentToRender = {
          ...addedComment,
          userId: {
            _id: user._id,
            username: user.username,
            avatar: user.avatar
          }
        };
        setComments((prev) => [commentToRender, ...prev]);
      }
      setNewComment("");
    } catch (err) {
      console.error("POST COMMENT ERROR:", err.response?.data);
      alert(err.response?.data?.message || "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await API.delete(`/comments/c/${commentId}`);
      setComments((prev) => prev.filter(c => c._id !== commentId));
    } catch (err) {
      alert("Failed to delete comment");
    }
  };

  return (
    <div className="mt-2 flex flex-col gap-2 border-t border-gray-100 pt-3">
      {/* Comments List */}
      <div className="max-h-48 overflow-y-auto custom-scrollbar flex flex-col gap-3 pr-1">
        {loading ? (
          <div className="flex justify-center p-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-500"></div>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center text-sm text-gray-500 py-2">No comments yet. Be the first!</div>
        ) : (
          comments.map((comment) => {
            const isOwner = user?._id === comment.userId?._id;
            const avatar = comment.userId?.avatar?.url || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";
            
            return (
              <div key={comment._id} className="flex group items-start justify-between text-sm">
                <div className="flex gap-2 items-start">
                  <Link to={`/profile/${comment.userId?._id}`}>
                    <img src={avatar} className="w-6 h-6 rounded-full object-cover mt-0.5" alt="avatar" />
                  </Link>
                  <p className="leading-tight text-gray-800">
                    <Link to={`/profile/${comment.userId?._id}`} className="font-semibold mr-1.5 hover:underline text-black">
                      {comment.userId?.username}
                    </Link>
                    {comment.text}
                  </p>
                </div>
                {isOwner && (
                  <button 
                    onClick={() => handleDelete(comment._id)}
                    className="text-red-500 hover:text-red-700 text-xs px-1 font-medium transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-2">
        <img 
          src={user?.avatar?.url || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"} 
          className="w-7 h-7 rounded-ful l object-cover" 
          alt="currentUser" 
        />
        <input 
          type="text" 
          placeholder="Add a comment..." 
          className="flex-1 text-sm bg-transparent border-none outline-none focus:ring-0"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button 
          type="submit" 
          disabled={!newComment.trim() || submitting}
          className="text-blue-500 font-semibold text-sm disabled:opacity-50 hover:text-blue-700 transition"
        >
          Post
        </button>
      </form>
    </div>
  );
}
