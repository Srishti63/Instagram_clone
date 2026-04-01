import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../Api/axios";
import { useAuth } from "../Context/AuthContext";
import ProfileGridItem from "../Components/Profile/ProfileGridItem";
import { MessageCircle } from "lucide-react";

export default function Profile() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  
  const [profileData, setProfileData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  const navigate = useNavigate();

  const isOwnProfile = currentUser?._id === id;

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        // 1. Fetch user data (Using the correct profile endpoint from user.route.js)
        const userRes = await API.get(`/users/profile/${id}`);
        const userData = userRes.data?.data || userRes.data;
        setProfileData(userData);
        setFollowersCount(userData.followersCount || userData.subscribersCount || 0);
        setIsFollowing(userData.isFollowing || false); // Backend should ideally return this

        // 2. Fetch user's posts
        const postRes = await API.get(`/posts/user/${id}`);
        setUserPosts(postRes.data?.data || []);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    
    if (id) fetchProfileData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center mt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="text-center mt-20 text-gray-500">
        <h2 className="text-xl font-semibold text-gray-800">User not found</h2>
        <p className="mt-2">{error || "This link might be broken or the page may have been removed."}</p>
      </div>
    );
  }

  const handleFollowToggle = async () => {
    try {
      // Optimistic UI update
      setIsFollowing(!isFollowing);
      setFollowersCount(prev => isFollowing ? prev - 1 : prev + 1);
      
      await API.post(`/users/follow/${id}`);
    } catch (err) {
      // Revert upon failure
      setIsFollowing(isFollowing);
      setFollowersCount(prev => isFollowing ? prev + 1 : prev - 1);
      console.error("Failed to toggle follow status", err);
    }
  };

  const handleMessageClick = async () => {
    try {
      // Hit the backend endpoint to create or fetch the conversation
      await API.post("/chat/conversation", { receiverId: id });
      
      // Redirect to the messages page
      navigate("/messages");
    } catch (err) {
      console.error("Failed to start conversation:", err);
    }
  };

  return (
    <div className="max-w-[935px] mx-auto py-8 px-4 md:px-0">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start gap-8 md:gap-24 mb-12 max-w-[800px] mx-auto md:ml-16">
        {/* Avatar */}
        <div className="flex-shrink-0 flex justify-center md:justify-start">
          <img 
            src={profileData?.avatar?.url || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"} 
            alt="Profile Avatar" 
            className="w-24 h-24 md:w-36 md:h-36 rounded-full object-cover border border-gray-200"
          />
        </div>

        {/* Info & Stats */}
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
            <h1 className="text-xl md:text-2xl font-semibold">{profileData?.username}</h1>
            
            <div className="flex gap-2">
              {isOwnProfile ? (
                <>
                  <button className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 font-semibold text-sm rounded-lg transition">
                    Edit Profile
                  </button>
                  <button className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 font-semibold text-sm rounded-lg transition">
                    View Archive
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={handleFollowToggle}
                    className={`px-6 py-1.5 font-semibold text-sm rounded-lg transition ${
                      isFollowing 
                        ? "bg-gray-100 hover:bg-gray-200 text-black" 
                        : "bg-blue-500 hover:bg-blue-600 text-white"
                    }`}
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </button>
                  <button 
                    onClick={handleMessageClick}
                    className="flex justify-center items-center gap-1 px-4 py-1.5 bg-gray-100 hover:bg-gray-200 font-semibold text-sm rounded-lg transition text-black"
                  >
                    <MessageCircle size={16} className="text-black" />
                    Message
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Followers/Following Stats */}
          <div className="flex gap-8 mb-4 text-base">
            <div className="flex md:flex-row flex-col items-center md:gap-1">
              <span className="font-semibold">{userPosts.length}</span> posts
            </div>
            <div className="flex md:flex-row flex-col items-center md:gap-1 cursor-pointer hover:underline">
              <span className="font-semibold">{followersCount}</span> followers
            </div>
            <div className="flex md:flex-row flex-col items-center md:gap-1 cursor-pointer hover:underline">
              <span className="font-semibold">{profileData?.followingCount || profileData?.channelsSubscribedToCount || 0}</span> following
            </div>
          </div>

          {/* Name & Bio */}
          <div className="text-sm">
            <p className="font-semibold mb-1">{profileData?.fullName}</p>
            <p className="text-gray-800 whitespace-pre-wrap">
              {profileData?.bio || "No bio yet."}
            </p>
          </div>
        </div>
      </div>

      <hr className="border-gray-300 md:mb-0 mb-4" />

      {/* Tabs */}
      <div className="flex justify-center gap-12 font-semibold text-sm tracking-widest text-gray-500 mb-6 uppercase">
        <button className="py-4 border-t border-black text-black -mt-[1px]">
          Posts
        </button>
        {isOwnProfile && (
          <button className="py-4 border-t border-transparent hover:text-gray-800 -mt-[1px]">
            Saved
          </button>
        )}
      </div>

      {/* Post Grid */}
      {userPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-20 text-center">
          <div className="w-16 h-16 border-2 border-black rounded-full flex items-center justify-center mb-4">
            <span className="text-4xl text-black -mt-1">+</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold bg-clip-text text-black mb-2">No Posts Yet</h2>
          <p className="text-gray-500 text-sm max-w-[250px]">
            {isOwnProfile ? "When you share photos, they will appear on your profile." : `${profileData?.username} hasn't shared any photos.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1 md:gap-6">
          {userPosts.map((post) => (
            <ProfileGridItem key={post._id} post={post} />
          ))}
        </div>
      )}

    </div>
  );
}
