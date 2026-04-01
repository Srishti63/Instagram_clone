import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import API from "../Api/axios";
import PostCard, { PostSkeleton } from "../Components/Feed/PostCard";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [hiddenPosts, setHiddenPosts] = useState([]);
  const [showHiddenView, setShowHiddenView] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const location = useLocation();

  // Reset to main feed if the user clicks the Home link in the sidebar again
  useEffect(() => {
    setShowHiddenView(false);
  }, [location.key]);

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
      <div className="py-8 max-w-[470px] mx-auto">
        {/* Render 3 skeletons to simulate a loading feed */}
        {[1, 2, 3].map((n) => (
          <PostSkeleton key={n} />
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-center mt-20 text-red-500">{error}</div>;
  }

  const handleDeletePost = (postId) => {
    setPosts((prevPosts) => prevPosts.filter((p) => p._id !== postId));
  };

  const handleHidePost = (postId) => {
    // Optimistically remove it from the feed view and move to hidden list
    setPosts((prevPosts) => {
      const postToHide = prevPosts.find(p => p._id === postId);
      if (postToHide) {
        setHiddenPosts(prev => [...prev, postToHide]);
      }
      return prevPosts.filter((p) => p._id !== postId);
    });
  };

  const handleUnhidePost = (postId) => {
    setHiddenPosts(prevHidden => {
      const postToUnhide = prevHidden.find(p => p._id === postId);
      if (postToUnhide) {
        // Put it back at the top of the feed for visibility
        setPosts(prev => [postToUnhide, ...prev]);
      }
      return prevHidden.filter(p => p._id !== postId);
    });
  };

  return (
    <div className="py-8 max-w-[470px] mx-auto">
      
      {/* Hidden Posts Toggle Button */}
      {hiddenPosts.length > 0 && (
        <div className="mb-6 flex justify-end">
          <button 
            onClick={() => setShowHiddenView(!showHiddenView)}
            className="text-sm font-semibold text-blue-500 hover:text-blue-700 transition"
          >
            {showHiddenView ? "Back to Feed" : `View Hidden Posts (${hiddenPosts.length})`}
          </button>
        </div>
      )}

      {showHiddenView ? (
        // Hidden Posts View
        <div>
          <h2 className="text-xl font-bold mb-4 text-gray-800">Hidden Posts</h2>
          {hiddenPosts.length === 0 ? (
            <p className="text-gray-500 text-center mt-10">You have no hidden posts.</p>
          ) : (
            hiddenPosts.map((post) => (
              <div key={post._id} className="relative">
                <PostCard 
                  post={post} 
                  onDelete={handleDeletePost} 
                />
                
                {/* Overlay Unhide Button */}
                <div className="absolute top-4 right-4 z-20">
                  <button 
                    onClick={() => handleUnhidePost(post._id)}
                    className="bg-black/70 text-white px-4 py-2 rounded-full font-semibold text-sm hover:bg-black transition backdrop-blur-sm"
                  >
                    Unhide
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        // Main Feed View
        posts.length === 0 ? (
          <div className="text-center mt-20 text-gray-500">
            <h2 className="text-xl font-semibold text-gray-800">Welcome to InstaClone!</h2>
            <p className="mt-2">Follow some people to see their posts here.</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard 
              key={post._id} 
              post={post} 
              onDelete={handleDeletePost} 
              onHide={handleHidePost}
            />
          ))
        )
      )}
    </div>
  );
}
