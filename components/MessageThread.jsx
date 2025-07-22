import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

export default function MessageThread({ conversation, currentUserId }) {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const bottomRef = useRef();

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversation.id)
        .order("created_at", { ascending: true });

      if (!error) setMessages(data);
      else console.error("Error loading messages:", error);
    };

    if (conversation?.id) fetchMessages();
  }, [conversation]);

  // Auto scroll
  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMsg.trim()) return;

    const { error, data } = await supabase.from("messages").insert({
      conversation_id: conversation.id,
      sender_id: currentUserId,
      recipient_id:
        currentUserId === conversation.participant_1_id
          ? conversation.participant_2_id
          : conversation.participant_1_id,
      content: newMsg,
    });

    if (!error) {
      setMessages((prev) => [...prev, { ...data[0], content: newMsg, sender_id: currentUserId }]);
      setNewMsg("");
    } else {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-2 p-4 bg-white rounded shadow">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
              msg.sender_id === currentUserId
                ? "bg-blue-600 text-white ml-auto"
                : "bg-gray-200 text-gray-900"
            }`}
          >
            {msg.content}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="mt-2 flex">
        <input
          type="text"
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 border rounded-l px-3 py-2 focus:outline-none"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  );
}
