import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { Picker } from "emoji-mart";
import "emoji-mart/css/emoji-mart.css";

export default function MessageThread({ conversation, currentUserId }) {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const bottomRef = useRef();

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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleEmojiSelect = (emoji) => {
    setNewMsg((prev) => prev + emoji.native);
  };

  const sendMessage = async () => {
    if (!newMsg.trim() && !selectedFile) return;

    let fileUrl = null;
    let fileType = null;

    if (selectedFile) {
      const filePath = `attachments/${Date.now()}_${selectedFile.name}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("message-attachments")
        .upload(filePath, selectedFile);

      if (uploadError) {
        console.error("Upload failed:", uploadError);
        return;
      }

      const { publicUrl } = supabase.storage
        .from("message-attachments")
        .getPublicUrl(filePath);

      fileUrl = publicUrl;
      fileType = selectedFile.type;
    }

    const { data, error } = await supabase.from("messages").insert({
      conversation_id: conversation.id,
      sender_id: currentUserId,
      recipient_id:
        currentUserId === conversation.participant_1_id
          ? conversation.participant_2_id
          : conversation.participant_1_id,
      content: newMsg,
      file_url: fileUrl,
      file_type: fileType,
    });

    if (!error) {
      setMessages((prev) => [
        ...prev,
        {
          ...data[0],
          content: newMsg,
          file_url: fileUrl,
          file_type: fileType,
          sender_id: currentUserId,
        },
      ]);
      setNewMsg("");
      setSelectedFile(null);
      setPreviewUrl(null);
    } else {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* MESSAGES */}
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
            {msg.file_url && (
              <div className="mt-2">
                {msg.file_type?.startsWith("image/") ? (
                  <img
                    src={msg.file_url}
                    alt="attachment"
                    className="max-w-full rounded"
                  />
                ) : (
                  <a
                    href={msg.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-sm"
                  >
                    Download File
                  </a>
                )}
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* INPUT BAR */}
<div className="mt-2 flex items-center space-x-2 relative">
  {/* Emoji Picker Toggle Button */}
  <button onClick={() => setShowEmojiPicker((prev) => !prev)} className="text-xl">
    😊
  </button>

  {/* Emoji Picker UI */}
  {showEmojiPicker && (
    <div className="absolute bottom-12 left-0 z-50">
      <Picker onSelect={handleEmojiSelect} />
    </div>
  )}

  {/* Attachment Button */}
  <label className="bg-gray-100 border border-gray-300 rounded px-3 py-2 cursor-pointer text-sm hover:bg-gray-200">
    📎 Attach
    <input
      type="file"
      onChange={handleFileChange}
      className="hidden"
    />
  </label>

  {/* Message Input */}
  <input
    type="text"
    value={newMsg}
    onChange={(e) => setNewMsg(e.target.value)}
    placeholder="Type a message..."
    className="flex-1 border rounded px-3 py-2"
  />

  {/* Send Button */}
  <button
    onClick={sendMessage}
    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
  >
    Send
  </button>
</div>



      {previewUrl && (
        <div className="mt-2 p-2 border rounded bg-gray-100 text-sm">
          <p>Preview:</p>
          {selectedFile?.type?.startsWith("image/") ? (
            <img
              src={previewUrl}
              alt="preview"
              className="max-w-[200px] rounded"
            />
          ) : (
            <p>{selectedFile.name}</p>
          )}
        </div>
      )}
    </div>
  );
}
