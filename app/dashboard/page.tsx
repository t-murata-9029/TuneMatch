'use client'

import * as React from 'react';

import {
    Box,
    Grid,
    Typography,
    useTheme,
    Link,
    Button,
    CssBaseline,
    List,
    ListItem,
    ListItemText,
    Chip,
    Skeleton,
    Card,
    CardActionArea,
    CardContent
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import HandshakeIcon from '@mui/icons-material/Handshake';
import MessageIcon from '@mui/icons-material/Message';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useEffect, useState } from 'react';
import { getCurrentUser } from '@/lib/action';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase.cliant';
import { Music_reviews } from '@/types/db';

const MenuPage = () => {

    const [userData, setUserData] = useState<User | null>(null);
    const [latestReviews, setLatestReviews] = useState<any[]>([]);
    const [unreadMessages, setUnreadMessages] = useState<any[]>([]);
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const [messagesLoading, setMessagesLoading] = useState(true);

    // メッセージの時間フォーマット関数
    const formatMessageTime = (sentAt: string) => {
        const messageDate = new Date(sentAt);
        const today = new Date();
        
        // 時間をリセットして日付のみで比較
        const messageDateOnly = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate());
        const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        
        // 今日の場合は時間を表示
        if (messageDateOnly.getTime() === todayOnly.getTime()) {
            return messageDate.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
        }
        
        // 今日より古い場合は日付を表示
        return messageDate.toLocaleDateString('ja-JP', { month: '2-digit', day: '2-digit' });
    };

    useEffect(() => {
        const getUser = async () => {
            const user = await getCurrentUser();
            setUserData(user);
        }
        getUser();
    }, []);

    // 最新レビュー取得（全ユーザーから）
    useEffect(() => {
        const fetchLatestReviews = async () => {
            try {
                const { data, error } = await supabase
                    .from('music_reviews')
                    .select(`
                        id,
                        user_id,
                        track_id,
                        review_text,
                        rating,
                        created_at,
                        spotify_tracks (
                            name,
                            spotify_album (
                                image_url
                            )
                        )
                    `)
                    .order('created_at', { ascending: false })
                    .limit(5);

                if (error) {
                    console.error('レビュー取得エラー:', error);
                } else {
                    setLatestReviews(data || []);
                }
            } catch (err) {
                console.error('レビュー取得エラー:', err);
            } finally {
                setReviewsLoading(false);
            }
        };

        fetchLatestReviews();
    }, []);

    // 未読メッセージ取得
    useEffect(() => {
        const fetchUnreadMessages = async () => {
            if (!userData?.id) return;

            try {
                const { data, error } = await supabase
                    .from('chat_messages')
                    .select(`
                        id,
                        match_id,
                        sender_id,
                        recipient_id,
                        message_text,
                        is_read,
                        sent_at,
                        users!chat_messages_sender_id_fkey (
                            id,
                            username
                        )
                    `)
                    .eq('recipient_id', userData.id)
                    .eq('is_read', false)
                    .order('sent_at', { ascending: false });

                if (error) {
                    console.error('メッセージ取得エラー:', error);
                } else {
                    // sender_id ごとにグループ化して、最新のメッセージのみを取得
                    const uniqueMessages = Array.from(
                        new Map(
                            data?.map((msg: any) => [msg.sender_id, msg]) || []
                        ).values()
                    );
                    setUnreadMessages(uniqueMessages);
                }
            } catch (err) {
                console.error('メッセージ取得エラー:', err);
            } finally {
                setMessagesLoading(false);
            }
        };

        fetchUnreadMessages();
    }, [userData?.id]);

    // --- ナビゲーションカードデータ ---
    const navCards = [
        {
            title: 'レビュー',
            description: '聞いた曲をレビューしましょう。',
            icon: <AudiotrackIcon sx={{ fontSize: 40 }} />,
            href: '/search'
        },
        {
            title: 'マッチ',
            description: '感性をベースにマッチングします。',
            icon: <HandshakeIcon sx={{ fontSize: 40 }} />,
            href: '/matches/recommends'
        },
        {
            title: 'メッセージ',
            description: 'マッチした人とメッセージをします。',
            icon: <MessageIcon sx={{ fontSize: 40 }} />,
            href: '/matches/message'
        },
        {
            title: 'マイページ',
            description: 'プロフィールを確認、変更できます。',
            icon: <HomeIcon sx={{ fontSize: 40 }} />,
            href: '/user/' + (userData ? userData.id : ''),
        },
    ];

    return (
        <Box sx={{ flexGrow: 1, p: 4, minHeight: '100vh' }}>
            {/* ナビゲーションカード */}
            <Grid container spacing={4} sx={{ mb: 6 }}>
                {navCards.map((card) => (
                    <Grid key={card.title} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                        <Link href={card.href} underline="none">
                            <Card
                                sx={{
                                    height: '100%',
                                    transition: '0.3s',
                                    '&:hover': {
                                        boxShadow: 6,
                                        transform: 'translateY(-5px)',
                                    }
                                }}
                            >
                                <CardActionArea sx={{ height: '100%', p: 2 }}>
                                    <CardContent>
                                        <Box sx={{ mb: 2 }}>
                                            {card.icon}
                                        </Box>
                                        <Typography
                                            gutterBottom
                                            variant="h5"
                                            component="div"
                                            sx={{ fontWeight: '600' }}
                                        >
                                            {card.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {card.description}
                                        </Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Link>
                    </Grid>
                ))}
            </Grid>

            {/* 最新レビューと未読メッセージセクション */}
            <Grid container spacing={6} sx={{ mt: 2 }}>
                {/* 最新レビュー */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Box
                        sx={{
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                            p: 3,
                            backgroundColor: 'background.paper'
                        }}
                    >
                        <Typography variant="h6" sx={{ fontWeight: '600', mb: 3 }}>
                            最新のレビュー
                        </Typography>

                        {reviewsLoading ? (
                            <Box>
                                {[...Array(3)].map((_, i) => (
                                    <Box key={i} sx={{ mb: 2 }}>
                                        <Skeleton variant="text" width="80%" />
                                        <Skeleton variant="text" width="60%" />
                                    </Box>
                                ))}
                            </Box>
                        ) : latestReviews.length > 0 ? (
                            <List sx={{ p: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {latestReviews.map((review) => (
                                    <Card
                                        key={review.id}
                                        sx={{
                                            cursor: 'pointer',
                                            transition: '0.3s',
                                            '&:hover': {
                                                boxShadow: 4,
                                                transform: 'translateX(4px)'
                                            }
                                        }}
                                        onClick={() => window.location.href = `/review?trackId=${review.track_id}`}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', p: 2, gap: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                                                {review.spotify_tracks?.spotify_album?.image_url && (
                                                    <Box
                                                        component="img"
                                                        src={review.spotify_tracks.spotify_album.image_url || '/noimage.png'}
                                                        alt="album"
                                                        sx={{ width: 50, height: 50, borderRadius: 1, objectFit: 'cover' }}
                                                    />
                                                )}
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: '600', mb: 0.5 }}>
                                                        {review.spotify_tracks?.name || '曲名なし'}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        評価: {review.rating}⭐
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem', mt: 0.5 }}>
                                                        {review.review_text && review.review_text.length > 60 
                                                            ? review.review_text.substring(0, 60) + '...'
                                                            : review.review_text
                                                        }
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <ChevronRightIcon sx={{ color: 'text.secondary' }} />
                                        </Box>
                                    </Card>
                                ))}
                            </List>
                        ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                                レビューがまだありません
                            </Typography>
                        )}

                        <Button
                            variant="outlined"
                            sx={{ mt: 2 }}
                            href="/search"
                        >
                            レビューを書く
                        </Button>
                    </Box>
                </Grid>

                {/* 未読メッセージ */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Box
                        sx={{
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                            p: 3,
                            backgroundColor: 'background.paper'
                        }}
                    >
                        <Typography variant="h6" sx={{ fontWeight: '600', mb: 3 }}>
                            未読メッセージ
                        </Typography>

                        {messagesLoading ? (
                            <Box>
                                {[...Array(3)].map((_, i) => (
                                    <Box key={i} sx={{ mb: 2 }}>
                                        <Skeleton variant="text" width="80%" />
                                        <Skeleton variant="text" width="60%" />
                                    </Box>
                                ))}
                            </Box>
                        ) : unreadMessages.length > 0 ? (
                            <List sx={{ p: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {unreadMessages.map((message) => (
                                    <Card
                                        key={message.id}
                                        sx={{
                                            cursor: 'pointer',
                                            transition: '0.3s',
                                            '&:hover': {
                                                boxShadow: 4,
                                                transform: 'translateX(4px)'
                                            }
                                        }}
                                        onClick={() => window.location.href = `/matches/message?matchId=${message.match_id}`}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', p: 2, gap: 2 }}>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="subtitle2" sx={{ fontWeight: '600', mb: 0.5 }}>
                                                    {message.users?.username || 'ユーザーなし'}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
                                                    {formatMessageTime(message.sent_at)}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem', mt: 0.5 }}>
                                                    {message.message_text && message.message_text.length > 60
                                                        ? message.message_text.substring(0, 60) + '...'
                                                        : message.message_text
                                                    }
                                                </Typography>
                                            </Box>
                                            <ChevronRightIcon sx={{ color: 'text.secondary', flexShrink: 0 }} />
                                        </Box>
                                    </Card>
                                ))}
                            </List>
                        ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                                未読メッセージはありません
                            </Typography>
                        )}
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

export default MenuPage;