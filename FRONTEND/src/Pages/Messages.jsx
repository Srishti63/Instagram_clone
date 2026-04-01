import { useState, useEffect, useRef } from "react";
import ConversationList from "../Components/Chat/ConversationList";
import ChatWindow from "../Components/Chat/ChatWindow";
import { MessageCircle } from "lucide-react";
import API from "../Api/axios";
import { useSocket } from "../Context/SocketContext";
import { DoublyLinkedList, Node } from "../utils/DoublyLinkedList";


export default function Messages() {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  // LRU Data structures
  const mapRef = useRef(new Map());
  const dllRef = useRef(new DoublyLinkedList());

  // Fetch past conversations when the component mounts
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const res = await API.get("/chat/conversations");
        // Backend already returns B-Tree sorted list. We just load it efficiently into our LRU.
        const data = res.data?.data || res.data || [];
        mapRef.current.clear();
        dllRef.current = new DoublyLinkedList();

        data.forEach((conv) => {
          const node = new Node(conv._id, conv);
          mapRef.current.set(conv._id, node);
          dllRef.current.pushBack(node);
        });

        setConversations(dllRef.current.toArray());
      } catch (err) {
        console.error("Error fetching conversations:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  // Listen to the socket to update the sidebar when a new message arrives
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      const convMap = mapRef.current;
      const dll = dllRef.current;

      if (convMap.has(msg.conversationId)) {
        // O(1) HashMap lookup
        const node = convMap.get(msg.conversationId);

        // Update conversation properties
        node.value = {
          ...node.value,
          lastMessage: {
            ...node.value.lastMessage,
            text: msg.text,
          },
        };

        // O(1) Move to front of Double Linked List
        dll.moveToFront(node);

        // Trigger React re-render mapping DLL back to Array
        setConversations(dll.toArray());
      }
    };

    socket.on("receive_message", handleNewMessage);

    return () => {
      socket.off("receive_message", handleNewMessage);
    };
  }, [socket]);

  return (
    <div className="h-screen bg-black flex items-center justify-center p-0 md:p-4 overflow-hidden pt-16 md:pt-4 ml-0 md:ml-64 text-white">
      {/* Container wrapper similar to Insta Web */}
      <div className="w-full max-w-5xl h-full border border-neutral-800 bg-black md:rounded-lg flex overflow-hidden shadow-sm">
        
        {/* Left Pane: Contacts List */}
        <div className={`w-full md:w-[350px] border-r border-neutral-800 flex-shrink-0 flex flex-col ${activeConversation ? 'hidden md:flex' : 'flex'}`}>
          <div className="h-16 border-b border-neutral-800 flex items-center px-4 justify-center md:justify-start flex-shrink-0">
            <h2 className="font-bold text-lg text-white">Messages</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center mt-10">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500"></div>
              </div>
            ) : conversations.length === 0 ? (
              <p className="text-neutral-500 text-center mt-10 px-4">No conversations yet.</p>
            ) : (
              <ConversationList 
                conversations={conversations} 
                activeId={activeConversation?._id}
                onSelect={(conv) => setActiveConversation(conv)}
              />
            )}
          </div>
        </div>

        {/* Right Pane: Chat Window */}
        <div className={`flex-1 flex flex-col bg-black ${!activeConversation ? 'hidden md:flex' : 'flex'}`}>
          {activeConversation ? (
            <ChatWindow 
              conversation={activeConversation} 
              onBack={() => setActiveConversation(null)} 
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-white">
              <div className="w-24 h-24 border-2 border-white rounded-full flex items-center justify-center mb-4">
                <MessageCircle size={48} strokeWidth={1} />
              </div>
              <h2 className="text-xl font-medium mb-2">Your Messages</h2>
              <p className="text-neutral-400 text-sm mb-6">Send private photos and messages to a friend or group.</p>
              <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1.5 px-4 rounded-lg transition-colors text-sm">
                Send Message
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
