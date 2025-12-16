"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Box, TextField, Button, CircularProgress } from "@mui/material";
import { supabase } from "@/lib/supabase.cliant";
import { getCurrentUser } from "@/lib/action";
import { User } from "@supabase/supabase-js";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { useRouter } from "next/navigation";
import React from "react";

type MatchData = {
    matchesId: number;
    partnerName: string;
    partnerId: string;
};

export default function ChatPage() {
    const [userData, setUserData] = useState<User | null>(null);
    const [matchData, setMatchData] = useState<MatchData | null>(null);
    const [messages, setMessages] = useState<
        { sender: string; text: string; sent_at: string; is_read: string }[]
    >([]);
    const [input, setInput] = useState("");

    const [loading, setLoading] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(true);

    const containerRef = useRef<HTMLDivElement | null>(null);

    const router = useRouter();

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
                sent_at: m.sent_at,
                is_read: m.is_read ? "既読" : "",
            }));

            setMessages(converted);

            const unread = data.filter(
                (m) => m.sender_id !== userData.id && m.is_read === false
            );

            if (unread.length > 0) {
                await supabase
                    .from("chat_messages")
                    .update({ is_read: true })
                    .in(
                        "id",
                        unread.map((u) => u.id)
                    );
            }

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

    // 既読更新時に相手側画面更新
    useEffect(() => {
        if (!matchData) return;

        const channel = supabase
            .channel("chat-message-update-realtime")
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "chat_messages",
                    filter: `match_id=eq.${matchData.matchesId}`,
                },
                async () => {
                    // UPDATE されたら再取得（is_read の反映など）
                    loadMessages();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [matchData, loadMessages]);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        // 即時スクロール（スムースにしたければ behavior: 'smooth'）
        el.scrollTop = el.scrollHeight;
        // または
        // el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }, [messages]);

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

    // 日本時間表記に変更
    const formatTime = (utcString: string) => {
        const d = new Date(utcString);

        // JST に補正
        const jst = new Date(d.getTime() + 9 * 60 * 60 * 1000);

        const h = String(jst.getHours()).padStart(2, "0");
        const m = String(jst.getMinutes()).padStart(2, "0");

        return `${h}:${m}`;
    };


    let prevDate = "";

    messages.map((msg, index) => {
        const dateStr = msg.sent_at.slice(0, 10); // 2025-12-11 みたいな日付だけ

        const showDateBar = dateStr !== prevDate;
        prevDate = dateStr;

        return (
            <div key={index}>
                {showDateBar && (
                    <div className="text-center text-gray-500 my-2">
                        {dateStr}
                    </div>
                )}

                <div>
                    {/* メッセージ本体 */}
                    {msg.text}
                </div>
            </div>
        );
    });

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                height: "100vh",
                p: 2,
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    p: 1.5,
                    borderBottom: "1px solid #ddd",
                    position: "sticky",
                    top: 0,
                    bgcolor: "#fff",
                    zIndex: 10,
                }}
            >
                <ArrowBackIosNewIcon
                    onClick={() => router.back()}
                    style={{ cursor: "pointer" }}
                />

                <div style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
                    {matchData.partnerName}
                </div>
            </Box>
            {/* メッセージ表示エリア */}
            <Box
                ref={containerRef}
                sx={{
                    flex: 1,
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                }}
            >
                <Box
                    sx={{
                        flex: 1,
                        overflowY: "auto",
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                        p: 2,
                        border: "1px solid #ddd",
                        borderRadius: "16px",
                        backgroundColor: "#fafafa",
                        boxShadow: "inset 0 0 8px rgba(0,0,0,0.05)",
                        margin: 2,
                    }}
                    ref={containerRef}
                >
                    {messages.map((msg, index) => {
                        const dateStr = msg.sent_at.slice(0, 10);
                        const prevDate =
                            index > 0 ? messages[index - 1].sent_at.slice(0, 10) : null;

                        return (
                            <React.Fragment key={index}>
                                {/* 日付が変わるタイミングでバー */}
                                {dateStr !== prevDate && (
                                    <div
                                        style={{
                                            textAlign: "center",
                                            color: "#777",
                                            margin: "10px 0",
                                            fontSize: "0.8rem",
                                        }}
                                    >
                                        {dateStr}
                                    </div>
                                )}

                                {/* メッセージ全体を横並び */}
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: msg.sender === "you" ? "row-reverse" : "row",
                                        alignItems: "flex-end",
                                        maxWidth: "70%",
                                        gap: 1,
                                        alignSelf: msg.sender === "you" ? "flex-end" : "flex-start",
                                    }}
                                >
                                    {/* 吹き出し */}
                                    <Box
                                        sx={{
                                            p: 1.2,
                                            borderRadius: 2,
                                            bgcolor: msg.sender === "you" ? "#1976d2" : "#fff",
                                            color: msg.sender === "you" ? "#fff" : "#000",
                                            boxShadow: 1,
                                            maxWidth: "100%",
                                        }}
                                    >
                                        {msg.text}
                                    </Box>

                                    <Box
                                        sx={{
                                            display: "flex",
                                            flexDirection: "column", // ← 縦にする！
                                            gap: 0.2,
                                            textAlign: msg.sender === "you" ? "right" : "left",
                                            alignItems: msg.sender === "you" ? "flex-end" : "flex-start",
                                        }}
                                    >
                                        {msg.sender === "you" && (
                                            <div
                                                style={{
                                                    fontSize: "0.7rem",
                                                    color: "#777",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {msg.is_read}
                                            </div>
                                        )}

                                        {/* 時間 */}
                                        <div
                                            style={{
                                                fontSize: "0.7rem",
                                                color: "#777",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {formatTime(msg.sent_at)}
                                        </div>
                                    </Box>
                                </Box>
                            </React.Fragment>
                        );
                    })}
                </Box>

                {/* --- 入力欄 --- */}
                <Box sx={{ display: "flex", gap: 1, p: 2, borderTop: "1px solid #ddd", bgcolor: "#fff" }}>
                    <TextField
                        fullWidth placeholder="メッセージを入力..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <Button variant="contained" onClick={handleSend}>
                        送信
                    </Button>
                </Box>
            </Box>

        </Box>
    );


}
