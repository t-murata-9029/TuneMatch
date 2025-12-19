"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Box, TextField, Button, CircularProgress } from "@mui/material";
import { supabase } from "@/lib/supabase.cliant";
import { getCurrentUser } from "@/lib/action";
import { User } from "@supabase/supabase-js";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { useRouter } from "next/navigation";
import React from "react";
import { Key } from "@mui/icons-material";

type MatchData = {
    matchesId: number;
    partnerName: string;
    partnerId: string;
};

type item = {
    matchesId: number;
    partnerId: string;
    partnerName: string;
    partnerImage: string;
    matchRate: number;
    latestMessageAt?: string | null;
    latestMessageText: string;
    unreadCount: number;
}

export default function ChatPage() {
    const [userData, setUserData] = useState<User | null>(null);
    const [matchData, setMatchData] = useState<MatchData | null>(null);
    const [messages, setMessages] = useState<
        { sender: string; text: string; sent_at: string; is_read: string }[]
    >([]);
    const [input, setInput] = useState("");

    const [loading, setLoading] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(true);

    const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

    const [allItems, setAllItems] = React.useState<item[]>([]);

    const containerRef = useRef<HTMLDivElement | null>(null);

    const router = useRouter();

    const updateLatestMessage = useCallback((newMessage: any) => {
        setAllItems((prev) =>
            [...prev]
                .map((item) =>
                    item.matchesId === newMessage.match_id
                        ? {
                            ...item,
                            latestMessageAt: newMessage.sent_at,
                            latestMessageText: newMessage.message_text 
                            ? newMessage.message_text.slice(0, 10) + (newMessage.message_text.length > 20 ? "..." : "")
                            : "",
                        }
                        : item
                )
                .sort((a, b) => {
                    if (!a.latestMessageAt && !b.latestMessageAt) return 0;
                    if (!a.latestMessageAt) return 1;
                    if (!b.latestMessageAt) return -1;

                    return (
                        new Date(b.latestMessageAt).getTime() -
                        new Date(a.latestMessageAt).getTime()
                    );
                })
        );
    }, []);

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

                setAllItems((prev) =>
                    prev.map((item) =>
                        item.matchesId === matchData.matchesId
                            ? { ...item, unreadCount: 0 }
                            : item
                    )
                );
            }

        }

        setLoadingMessages(false);
    }, [userData, matchData]);

    const updateUnreadCount = useCallback(
        async (match_id: number) => {
            if (!userData) return;

            const { count } = await supabase
                .from("chat_messages")
                .select("id", { count: "exact", head: true })
                .eq("match_id", match_id)
                .eq("is_read", false)
                .neq("sender_id", userData.id);

            setAllItems((prev) =>
                prev.map((item) =>
                    item.matchesId === match_id
                        ? { ...item, unreadCount: count ?? 0 }
                        : item
                )
            );
        },
        [userData]
    );

    // 初期ロード
    useEffect(() => {
        const init = async () => {
            const raw = sessionStorage.getItem("MessageRecipient");
            if (raw) {
                const data = JSON.parse(raw);
                setMatchData(data);
                setSelectedMatchId(String(data.matchesId));
            }

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

    useEffect(() => {
        const fetchMatches = async () => {
            const userData = await getCurrentUser();
            if (!userData) return;

            const user_id = userData.id;

            // ① matches 取得
            const { data: matches, error: matchError } = await supabase
                .from("matches")
                .select("*")
                .or(`user1_id.eq.${user_id},user2_id.eq.${user_id}`);

            if (matchError || !matches) {
                console.error("マッチ相手取得時エラー：", matchError);
                return;
            }

            // ② 最新メッセージ時間付与
            const itemsWithLatestMessage = await Promise.all(
                matches.map(async (match) => {
                    const { data: latestMessage, error } = await supabase
                        .from("chat_messages")
                        .select("sent_at")
                        .eq("match_id", match.id)
                        .order("sent_at", { ascending: false })
                        .limit(1)
                        .maybeSingle();

                    if (error) {
                        console.error("メッセージ取得エラー:", error);
                    }

                    return {
                        ...match,
                        latestMessageAt: latestMessage?.sent_at ?? null,
                    };
                })
            );

            // ③ partnerUserId を決める
            const itemsWithPartnerId = itemsWithLatestMessage.map((match) => {
                const partnerUserId =
                    match.user1_id === user_id
                        ? match.user2_id
                        : match.user1_id;

                return {
                    ...match,
                    partnerUserId,
                };
            });

            // ④ partnerUserId をまとめて取得
            const partnerIds = itemsWithPartnerId.map(
                (item) => item.partnerUserId
            );

            const { data: partners, error: userError } = await supabase
                .from("users")
                .select("id, username")
                .in("id", partnerIds);

            if (userError || !partners) {
                console.error("ユーザー取得エラー:", userError);
                return;
            }

            // ⑤ Map 化
            const partnerMap = new Map(
                partners.map((u) => [u.id, u])
            );

            // ⑥ item 型に整形（最終形）
            const finalItems = await Promise.all(
                itemsWithPartnerId.map(async (item) => {
                    const partner = partnerMap.get(item.partnerUserId);

                    const userImg = "https://tpwncberbdmckktfcnpg.supabase.co/storage/v1/object/public/user_images/" + item.partnerUserId + "/" + item.partnerUserId;

                    const { data: latestMessage } = await supabase
                        .from("chat_messages")
                        .select("message_text")
                        .eq("match_id", item.id)
                        .order("sent_at", { ascending: false })
                        .limit(1)
                        .maybeSingle();

                    const { count } = await supabase
                        .from("chat_messages")
                        .select("id", { count: "exact", head: true })
                        .eq("match_id", item.matchesId)
                        .eq("is_read", false)
                        .neq("sender_id", user_id);

                    return {
                        matchesId: item.id,
                        partnerId: item.partnerUserId,
                        partnerName: partner?.username ?? "不明",
                        partnerImage: userImg ?? "/no-image.png",
                        matchRate: item.vibe_match_percentage,
                        latestMessageAt: item.latestMessageAt,
                        latestMessageText: latestMessage?.message_text
                            ? latestMessage.message_text.slice(0, 20) + (latestMessage.message_text.length > 20 ? "..." : "")
                            : "", unreadCount: count ?? 0,
                    };
                })
            );

            // 最新メッセージ順でソート
            finalItems.sort((a, b) => {
                if (!a.latestMessageAt && !b.latestMessageAt) return 0;
                if (!a.latestMessageAt) return 1;
                if (!b.latestMessageAt) return -1;

                return (
                    new Date(b.latestMessageAt).getTime() - new Date(a.latestMessageAt).getTime()
                );
            });

            // ページング用
            setAllItems(finalItems);

        };


        fetchMatches();
    }, []);

    useEffect(() => {
        if (!userData) return;

        const channel = supabase
            .channel("chat-sidebar")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "chat_messages",
                },
                (payload) => {
                    updateLatestMessage(payload.new);

                    updateUnreadCount(matchData?.matchesId ?? 0);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userData, updateLatestMessage, updateUnreadCount]);

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
                () => {
                    loadMessages(); // 右側更新
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
        // メッセージの最後までスクロール
        el.scrollTop = el.scrollHeight;
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

        updateLatestMessage({
            match_id: matchData.matchesId,
            sent_at: new Date().toISOString(),
        });

        setInput("");

        // 送信後も SQL 側から取得
        loadMessages();
    };

    // 日本時間表記に変更
    const formatTime = (utcString: string) => {
        const d = new Date(utcString);
        return new Intl.DateTimeFormat("ja-JP", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
            timeZone: "Asia/Tokyo",
        }).format(d);
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
                height: "87vh",
                overflow: "hidden", // 画面全体のスクロールを防ぐ
                p: 0, // paddingを削除
            }}
        >
            {/* 左カラム（3割） */}
            <Box
                sx={{
                    width: "30%",
                    borderRight: "1px solid #ddd",
                    display: "flex",
                    flexDirection: "column",
                    bgcolor: "#f0f4f8",
                    height: "87vh", // maxHeightではなくheightに
                    overflowY: "auto",
                }}
            >
                <Box sx={{ p: 2, fontWeight: "bold" }}>
                    マッチング相手
                </Box>

                {allItems.map((item, index) => {
                    const isSelected = String(item.matchesId) === selectedMatchId;

                    return (
                        <Box
                            onClick={() => {
                                setMatchData({
                                    matchesId: item.matchesId,
                                    partnerId: item.partnerId,
                                    partnerName: item.partnerName,
                                });
                                setSelectedMatchId(String(item.matchesId));
                                router.push(`/matches/message`);
                            }}
                            key={item.matchesId}
                            sx={{
                                p: 2,
                                mx: 1,
                                mb: 1,
                                borderRadius: 2,
                                cursor: "pointer",
                                bgcolor: isSelected ? "#e3f2fd" : "#fff",
                                borderLeft: isSelected ? "4px solid #1976d2" : "4px solid transparent",
                                boxShadow: isSelected ? 3 : 1,
                                "&:hover": {
                                    bgcolor: isSelected ? "#e3f2fd" : "#f0f0f0",
                                    boxShadow: isSelected ? null : '0 8px 16px rgba(0, 0, 0, 0.2)',
                                },
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: "bold" }}>
                                <span>{item.partnerName}</span>
                                {item.unreadCount > 0 && (
                                    <Box
                                        sx={{
                                            bgcolor: "#1976d2",
                                            color: "#fff",
                                            borderRadius: "50%",
                                            width: 20,
                                            height: 20,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "0.7rem",
                                        }}
                                    >
                                        {item.unreadCount}
                                    </Box>
                                )}
                            </div>
                            <div style={{ fontSize: "0.8rem", color: "#777" }}>
                                {item.latestMessageText}
                            </div>
                        </Box>
                    );
                })}
            </Box>

            {/* 右カラム（7割） */}
            <Box
                sx={{
                    width: "70%",
                    display: "flex",
                    flexDirection: "column",
                    height: "87vh", // 高さを100vhに固定
                    overflow: "hidden", // 右カラム全体のスクロールを防ぐ
                }}
            >
                {/* ヘッダー */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        p: 1.5,
                        borderBottom: "1px solid #ddd",
                        bgcolor: "#f5f5f5",
                        flexShrink: 0, // ヘッダーが縮まないようにする
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
                        flex: 1, // 残りのスペースを全て使う
                        overflowY: "auto",
                        display: "flex",
                        flexDirection: "column",
                        p: 2,
                        border: "1px solid #ddd",
                        borderRadius: "16px",
                        backgroundColor: "#fafafa",
                        boxShadow: "inset 0 0 8px rgba(0,0,0,0.05)",
                        m: 2,
                    }}
                >
                    {messages.map((msg, index) => {
                        const dateStr = msg.sent_at.slice(0, 10);
                        const prevDate = index > 0 ? messages[index - 1].sent_at.slice(0, 10) : null;

                        return (
                            <React.Fragment key={index}>
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

                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: msg.sender === "you" ? "row-reverse" : "row",
                                        alignItems: "flex-end",
                                        maxWidth: "70%",
                                        gap: 1,
                                        alignSelf: msg.sender === "you" ? "flex-end" : "flex-start",
                                        mb: 1,
                                    }}
                                >
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
                                            flexDirection: "column",
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

                {/* 入力欄 */}
                <Box
                    sx={{
                        display: "flex",
                        gap: 1,
                        p: 2,
                        borderTop: "1px solid #ddd",
                        bgcolor: "#fff",
                        flexShrink: 0, // 入力欄が縮まないようにする
                    }}
                >
                    <TextField
                        fullWidth
                        placeholder="メッセージを入力..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                    />
                    <Button variant="contained" onClick={handleSend}>
                        送信
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}
