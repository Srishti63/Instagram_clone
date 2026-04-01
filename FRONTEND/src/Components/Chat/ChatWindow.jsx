import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send, Phone, Video, Info, Smile } from "lucide-react";
import { useAuth } from "../../Context/AuthContext";
import { useSocket } from "../../Context/SocketContext";
import API from "../../Api/axios";
import { Link } from "react-router-dom";

export default function ChatWindow({ conversation, onBack }) {
  const { user: currentUser } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [showEmoji, setShowEmoji] = useState(false);
  const emojis = ["😂", "❤️", "🔥", "😍", "🥺", "🙌", "😊", "✨", "🙏", "😭", "👍", "💯", "🥱", "💕", "😎", "🥳", "🥰", "👏", "🤪", "👀"];
  
  const bottomRef = useRef(null);

  // Identify the other participant
  const otherUser = conversation?.participants?.find(p => String(p._id) !== String(currentUser?._id));
  const username = otherUser?.username || "Unknown";
  const avatar = otherUser?.avatar?.url || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";

  useEffect(() => {
    // Fetch initial messages for this conversation
    const fetchMessages = async () => {
      if (!conversation?._id) return;
      
      try {
        setLoading(true);
        const res = await API.get(`/chat/${conversation._id}/messages`);
        setMessages(res.data?.data || res.data || []);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [conversation?._id]);

  useEffect(() => {
    // Listen for incoming messages from the socket
    if (!socket) return;

    const handleNewMessage = (msg) => {
      // Only append if it belongs to the current open conversation
      if (msg.conversationId === conversation._id) {
        setMessages(prev => [...prev, msg]);
      }
    };

    socket.on("receive_message", handleNewMessage);

    return () => {
      socket.off("receive_message", handleNewMessage);
    };
  }, [socket, conversation?._id]);

  useEffect(() => {
    // Auto-scroll to bottom on new message
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addEmoji = (emoji) => {
    setNewMessage(prev => prev + emoji);
  };

  const formatTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!newMessage.trim() || !socket || !otherUser) return;

    const msgData = {
      conversationId: conversation._id,
      senderId: currentUser._id,
      receiverId: otherUser._id,
      text: newMessage.trim(),
    };

    // Emit to backend socket. The backend socket will save it to DB and emit back to receiver.
    // Note: Depends on backend implementation. We might also need to call an API.
    socket.emit("send_message", msgData);
    
    // Optimistically add to UI just in case the backend socket doesn't emit back to the sender
    // We will rely on backend socket logic mostly, but if there's lag, this helps.
    setNewMessage("");
  };

  return (
    <div className="flex flex-col h-full bg-black text-white relative">
      {/* Header */}
      <div className="h-16 border-b border-neutral-800 flex items-center justify-between px-4 sticky top-0 bg-black z-10 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="md:hidden text-white hover:text-gray-300">
            <ArrowLeft size={24} />
          </button>
          <Link to={`/profile/${otherUser?._id}`} className="flex items-center gap-3 hover:opacity-80 transition text-white">
            <img src={avatar} alt="avatar" className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover" />
            <h2 className="font-semibold text-lg hover:underline">{username}</h2>
          </Link>
        </div>
        <div className="flex items-center gap-4 text-white">
          <button className="hover:text-gray-300 transition"><Phone size={24} strokeWidth={1.5} /></button>
          <button className="hover:text-gray-300 transition"><Video size={24} strokeWidth={1.5} /></button>
          <button className="hover:text-gray-300 transition"><Info size={24} strokeWidth={1.5} /></button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar">
        {loading ? (
          <div className="flex justify-center my-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-neutral-400">
            <img src={avatar} alt="avatar" className="w-24 h-24 rounded-full object-cover mb-4" />
            <h3 className="text-xl font-semibold mb-1 text-white">{username}</h3>
            <p className="text-sm">Start a conversation with {username}</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            // Determine if current log-in user is sender
            // sender can be a populated object or just an ID string
            const senderId = typeof msg.sender === 'object' ? msg.sender?._id : msg.sender;
            const isMe = senderId === currentUser?._id;

            return (
              <div 
                key={msg._id || index} 
                className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                {!isMe && (
                  <img src={avatar} alt="avatar" className="w-7 h-7 rounded-full object-cover mr-2 self-end" />
                )}
                <div className="flex flex-col gap-1 max-w-[75%]">
                  <div 
                    className={`px-4 py-2 rounded-2xl break-words
                      ${isMe ? 'bg-blue-500 text-white rounded-br-none' : 'bg-neutral-800 text-white rounded-bl-none'}
                    `}
                  >
                    {msg.text}
                  </div>
                  <span className={`text-[10px] text-neutral-500 ${isMe ? 'text-right' : 'text-left'}`}>
                    {formatTime(msg.createdAt)}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} className="h-1" />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-black border-t border-neutral-800 shrink-0 relative">
        {showEmoji && (
          <div className="absolute bottom-full left-4 mb-2 bg-neutral-900 border border-neutral-800 p-2 rounded-lg shadow-xl z-50">
            <div className="grid grid-cols-5 gap-2">
              {emojis.map(emoji => (
                <button 
                  type="button" 
                  key={emoji} 
                  onClick={() => addEmoji(emoji)}
                  className="text-xl hover:bg-neutral-800 p-1 rounded"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}
        <form 
          onSubmit={handleSend}
          className="flex items-center bg-neutral-900 border border-neutral-800 rounded-full px-4 py-2"
        >
          <button 
            type="button" 
            onClick={() => setShowEmoji(!showEmoji)}
            className="text-neutral-400 hover:text-white mr-2 transition focus:outline-none"
          >
            <Smile size={24} strokeWidth={1.5} />
          </button>
          <input 
            type="text" 
            placeholder="Message..." 
            className="flex-1 bg-transparent border-none outline-none text-sm px-2 text-white placeholder-neutral-500"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button 
            type="submit" 
            disabled={!newMessage.trim()}
            className="text-blue-500 hover:text-blue-700 disabled:opacity-50 font-semibold text-sm transition focus:outline-none"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
