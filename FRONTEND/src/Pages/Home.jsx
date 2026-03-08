import { useState, useEffect } from "react";
import API from "../Api/axios";
import PostCard from "../Components/Feed/PostCard";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        setLoading(true);
        // We assume /posts/ returns a generic feed for now
        const response = await API.get("/posts/");
        
        // Handle varying response structures cleanly
        const responseData = response.data?.data;
        if (responseData) {
          // The backend returns { totalPosts, currentPage, totalPages, posts: [...] }
          setPosts(responseData.posts || responseData);
        } else {
          setPosts(response.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch posts:", err);
        setError("Could not load the feed. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center mt-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center mt-20 text-red-500">{error}</div>;
  }

  const handleDeletePost = (postId) => {
    setPosts((prevPosts) => prevPosts.filter((p) => p._id !== postId));
  };

  return (
    <div className="py-8">
      {posts.length === 0 ? (
        <div className="text-center mt-20 text-gray-500">
          <h2 className="text-xl font-semibold text-gray-800">Welcome to InstaClone!</h2>
          <p className="mt-2">Follow some people to see their posts here.</p>
        </div>
      ) : (
        posts.map((post) => (
          <PostCard key={post._id} post={post} onDelete={handleDeletePost} />
        ))
      )}
    </div>
  );
}
