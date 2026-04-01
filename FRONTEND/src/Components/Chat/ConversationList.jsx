import { useAuth } from "../../Context/AuthContext";
import { Link } from "react-router-dom";

export default function ConversationList({ conversations, activeId, onSelect }) {
  const { user: currentUser } = useAuth();

  return (
    <div className="flex flex-col">
      {conversations.map((conv) => {
        // Find the other participant to display their info
        const otherUser = conv.participants?.find((p) => String(p._id) !== String(currentUser?._id));
        
        // Fallbacks
        const username = otherUser?.username || "Unknown User";
        const avatar = otherUser?.avatar?.url || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";
        
        // Find last message preview
        const lastMsgText = conv.lastMessage?.text || "No messages yet";
        
        const isActive = activeId === conv._id;

        return (
          <div 
            key={conv._id}
            onClick={() => onSelect(conv)}
            className={`flex items-center gap-3 p-4 cursor-pointer transition-colors
              ${isActive ? 'bg-neutral-800' : 'hover:bg-neutral-900'}
            `}
          >
            <img 
              src={avatar} 
              alt={username} 
              className="w-14 h-14 rounded-full object-cover border border-neutral-800 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <Link 
                to={`/profile/${otherUser?._id}`}
                onClick={(e) => e.stopPropagation()}
                className="font-semibold text-sm truncate hover:underline block text-white"
              >
                {username}
              </Link>
              <p className={`text-sm truncate ${isActive ? 'text-white font-medium' : 'text-neutral-400'}`}>
                {lastMsgText}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

