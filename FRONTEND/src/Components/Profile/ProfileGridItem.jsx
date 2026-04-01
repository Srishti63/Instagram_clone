import { Heart, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function ProfileGridItem({ post }) {
  const { _id, mediaUrl, likes = [], comments = [] } = post;
  console.log("Profile Grid Post Data:", post); // Temporary Debug

  return (
    <Link to={`/post/${_id}`} className="relative group aspect-square overflow-hidden cursor-pointer block border border-gray-200">
      <img 
        src={mediaUrl || "https://placehold.co/400x400/EEE/31343C?text=No+Image"} 
        alt="Post thumbnail" 
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      
      {/* Dark Overlay on Hover */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-6 z-10">
        
        {/* Likes Count */}
        <div className="flex items-center gap-2 text-white font-bold text-lg">
          <Heart fill="white" size={24} />
          <span>{likes.length}</span>
        </div>

        {/* Comments Count */}
        <div className="flex items-center gap-2 text-white font-bold text-lg">
          <MessageCircle fill="white" size={24} />
          <span>{comments.length}</span>
        </div>
        
      </div>
    </Link>
  );
}
