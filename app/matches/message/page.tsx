"use client";

import { useState, useEffect, useCallback } from "react";
import { Box, TextField, Button, CircularProgress } from "@mui/material";
import { supabase } from "@/lib/supabase.cliant";
import { getCurrentUser } from "@/lib/action";
import { User } from "@supabase/supabase-js";

type MatchData = {
    matchesId: number;
    partnerId: string;
};

export default function ChatPage() {
    const [userData, setUserData] = useState<User | null>(null);
    const [matchData, setMatchData] = useState<MatchData | null>(null);
    const [messages, setMessages] = useState<
        { sender: string; text: string }[]
    >([]);
    const [input, setInput] = useState("");

    const [loading, setLoading] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(true);

    // メッセージ履歴読み込み
    const loadMessages = useCallback(async () => {
        if (!userData || !matchData) return;

        setLoadingMessages(true);

        const { data } = await supabase
            .from("chat_messages")
            .select("*")
            .eq("match_id", matchData.matchesId)
            .order("sent_at");

        if (data) {
            const converted = data.map((m) => ({
                sender: m.sender_id === userData.id ? "you" : "other",
                text: m.message_text,
            }));
            setMessages(converted);
        }

        setLoadingMessages(false);
    }, [userData, matchData]);


    // 初期ロード
    useEffect(() => {
        const init = async () => {
            const raw = sessionStorage.getItem("MessageRecipient");
            if (raw) setMatchData(JSON.parse(raw));

            const user = await getCurrentUser();
            setUserData(user);

            setLoading(false);
        };
        init();
    }, []);

    // userData と matchData 揃ったらメッセージ取得
    useEffect(() => {
        if (userData && matchData) {
            loadMessages();
        }
    }, [userData, matchData, loadMessages]);


    // 新着メッセージ受信
    useEffect(() => {
        if (!matchData) return;

        const channel = supabase
            .channel("chat-message-realtime")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "chat_messages",
                    filter: `match_id=eq.${matchData.matchesId}`,
                },
                async () => {
                    // **INSERT が飛んできたら SQL から再取得するように変更**
                    loadMessages();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [matchData, loadMessages]);



    if (loading) return null;
    if (!userData || !matchData) return null;

    const handleSend = async () => {
        if (!input.trim()) return;

        await supabase.from("chat_messages").insert([
            {
                match_id: matchData.matchesId,
                sender_id: userData.id,
                recipient_id: matchData.partnerId,
                message_text: input,
                sent_at: new Date().toISOString(),
            },
        ]);

        setInput("");

        // 送信後も SQL 側から取得
        loadMessages();
    };


    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                height: "100vh",
                p: 2,
                bgcolor: "#f5f5f5",
            }}
        >
            <Box
                sx={{
                    flex: 1,
                    overflowY: "auto",
                    mb: 2,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                }}
            >
                {loadingMessages ? (
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            height: "100%",
                            color: "#666",
                        }}
                    >
                        <CircularProgress size={30} />
                    </Box>
                ) : (
                    messages.map((msg, index) => (
                        <Box
                            key={index}
                            sx={{
                                alignSelf:
                                    msg.sender === "you"
                                        ? "flex-end"
                                        : "flex-start",
                                maxWidth: "70%",
                                p: 1.5,
                                borderRadius: 2,
                                bgcolor:
                                    msg.sender === "you"
                                        ? "#1976d2"
                                        : "#fff",
                                color:
                                    msg.sender === "you" ? "#fff" : "#000",
                                boxShadow: 1,
                            }}
                        >
                            {msg.text}
                        </Box>
                    ))
                )}
            </Box>

            <Box sx={{ display: "flex", gap: 1 }}>
                <TextField
                    fullWidth
                    placeholder="メッセージを入力..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <Button variant="contained" onClick={handleSend}>
                    送信
                </Button>
            </Box>
        </Box>
    );
}
