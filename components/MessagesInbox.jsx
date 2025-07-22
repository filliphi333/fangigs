import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function MessagesInbox({ userId }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const fetchConversations = async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select(`
          id,
          created_at,
          participant1,
          participant2,
          messages (
            sender_id,
            content,
            created_at
          ),
          participant1:participant1 (
            id,
            full_name,
            headshot_image
          ),
          participant2:participant2 (
            id,
            full_name,
            headshot_image
          )
        `)
        .or(`participant1.eq.${userId},participant2.eq.${userId}`)
        .order("created_at", { ascending: false });

      if (error || !data) {
        console.error("Error fetching conversations:", error || "No data returned");
      } else {
        setConversations(data);
      }

      setLoading(false);
    };

    if (userId) fetchConversations();
  }, [userId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const { error } = await supabase.from("messages").insert([
      {
        conversation_id: selectedConversation.id,
        sender_id: userId,
        content: newMessage.trim(),
      },
    ]);

    if (error) {
      console.error("Failed to send message:", error);
      return;
    }

    // Refresh messages
    const updatedConvo = await supabase
      .from("conversations")
      .select(
        `id, messages(sender_id, content, created_at)`
      )
      .eq("id", selectedConversation.id)
      .single();

    if (updatedConvo.data) {
      setSelectedConversation((prev) => ({
        ...prev,
        messages: updatedConvo.data.messages,
      }));
      setNewMessage("");
    }
  };

  if (loading) return <p>Loading conversations...</p>;
  if (conversations.length === 0) return <p>No messages yet.</p>;

  if (selectedConversation) {
    const otherUser =
      selectedConversation.participant1?.id === userId
        ? selectedConversation.participant2
        : selectedConversation.participant1;

    return (
      <div>
        <button
          onClick={() => setSelectedConversation(null)}
          className="mb-4 text-blue-600 text-sm hover:underline"
        >
          ← Back to inbox
        </button>

        <h3 className="text-lg font-bold mb-2">
          Chat with {otherUser?.full_name || "Unknown"}
        </h3>

        <div className="space-y-2 max-h-80 overflow-y-auto border p-3 rounded mb-4 bg-gray-50">
          {selectedConversation.messages.map((msg, index) => (
            <div
              key={index}
              className={`p-2 rounded max-w-xs ${
                msg.sender_id === userId
                  ? "ml-auto bg-blue-100 text-right"
                  : "bg-gray-100 text-left"
              }`}
            >
              <p className="text-sm">{msg.content}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(msg.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border rounded px-3 py-2 text-sm"
          />
          <button
            onClick={handleSendMessage}
            className="bg-blue-600 text-white font-semibold px-4 rounded hover:bg-blue-700"
          >
            Send
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {conversations.map((convo) => {
        const otherUser =
          convo.participant1?.id === userId
            ? convo.participant2
            : convo.participant1;
        const lastMessage = convo.messages?.[0];

        return (
          <div
            key={convo.id}
            className="flex items-center gap-4 p-3 border rounded hover:bg-blue-50 transition"
          >
            <img
              src={
                otherUser?.headshot_image
                  ? `https://xeqkvaqpgqyjlybexxmm.supabase.co/storage/v1/object/public/avatars/${otherUser.headshot_image}`
                  : "/placeholder-avatar.png"
              }
              alt="avatar"
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex-1">
              <p className="font-semibold">
                {otherUser?.full_name || "Unknown"}
              </p>
              <p className="text-sm text-gray-600 truncate">
                {lastMessage?.content}
              </p>
              <p className="text-xs text-gray-400">
                {lastMessage?.created_at &&
                  new Date(lastMessage.created_at).toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => setSelectedConversation(convo)}
              className="text-blue-600 font-semibold text-sm"
            >
              View
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default MessagesInbox;
