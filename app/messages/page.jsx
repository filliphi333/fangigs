'use client';
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useParams } from "next/navigation";

export default function ConversationThread() {
  const { id } = useParams(); // conversation_id
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("id, sender_id, content, created_at")
        .eq("conversation_id", id)
        .order("created_at", { ascending: true });

      if (error) console.error(error);
      else setMessages(data);

      setLoading(false);
    };

    fetchMessages();
  }, [id]);

  const handleSend = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !newMessage.trim()) return;

    const { error } = await supabase.from("messages").insert({
      conversation_id: id,
      sender_id: user.id,
      content: newMessage,
    });

    if (error) console.error(error);
    else {
      setMessages(prev => [...prev, {
        sender_id: user.id,
        content: newMessage,
        created_at: new Date().toISOString(),
      }]);
      setNewMessage("");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">Conversation</h1>
      {loading ? (
        <p>Loading messages...</p>
      ) : (
        <div className="space-y-4 mb-6">
          {messages.map((msg, i) => (
            <div key={i} className={`p-3 rounded max-w-[70%] ${msg.sender_id === supabase.auth.user()?.id ? 'bg-blue-100 ml-auto' : 'bg-gray-200'}`}>
              <p className="text-sm">{msg.content}</p>
              <p className="text-xs text-gray-500 text-right">{new Date(msg.created_at).toLocaleTimeString()}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          className="flex-1 border rounded p-2"
          placeholder="Write a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button onClick={handleSend} className="bg-blue-600 text-white px-4 rounded">
          Send
        </button>
      </div>
    </div>
  );
}
