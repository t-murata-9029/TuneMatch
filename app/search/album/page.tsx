'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Box, Typography, CircularProgress, Button } from '@mui/material';
import getToken from '@/utils/spotify/getToken';
import ArtistLink from '@/components/ArtistLink';

type item = {
    artistId: string;
    artistName: string;
    albumId: string;
    albumName: string;
    albumImage: string;
    albumReleaseDate: string;
    albumTotalTracks: number;
    trackId: string;
    trackName: string;
    trackNumber: number;
    durationMs: number;
};

type AlbumTrack = {
    id: string;
    name: string;
    track_number: number;
    duration_ms: number;
    artists: { name: string }[];
};

// ミリ秒を分:秒に変換
function formatDuration(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Spotify APIからアルバムの収録曲を取得
async function fetchAlbumTracks(albumId: string): Promise<AlbumTrack[]> {
    const spotify_access_token = await getToken();
    const url = `https://api.spotify.com/v1/albums/${albumId}/tracks`;

    const result = await fetch(url, {
        headers: { Authorization: `Bearer ${spotify_access_token}` }
    });

    const json = await result.json();
    return json.items || [];
}

export default function AlbumPage() {
    const searchParams = useSearchParams();
    const encodedData = searchParams.get('data');

    if (!encodedData) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <Typography>データが見つかりません</Typography>
            </Box>
        );
    }

    const data: item = JSON.parse(decodeURIComponent(atob(encodedData))) as item;

    const router = useRouter();
    const [tracks, setTracks] = useState<AlbumTrack[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedTrackId, setExpandedTrackId] = useState<string | null>(null);

    useEffect(() => {
        async function loadTracks() {
            try {
                const albumTracks = await fetchAlbumTracks(data.albumId);
                setTracks(albumTracks);
            } catch (error) {
                console.error('アルバム取得エラー:', error);
            } finally {
                setLoading(false);
            }
        }

        loadTracks();
    }, [data.albumId]);

    // リリース年を取得
    const releaseYear = data.albumReleaseDate ? new Date(data.albumReleaseDate).getFullYear() : '';

    // Spotify埋め込みプレイヤーのURLを生成
    const getEmbedUrl = (trackId: string) => {
        return `https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`;
    };

    // トラックをクリックしたときの処理
    const handleTrackClick = (trackId: string) => {
        setExpandedTrackId(expandedTrackId === trackId ? null : trackId);
    };

    // レビュー投稿ボタンクリック時の処理
    const handleReviewClick = (e: React.MouseEvent, track: AlbumTrack) => {
        e.stopPropagation(); // 親のクリックイベント（プレイヤー展開）を防ぐ
        
        const trackData: item = {
            artistId: data.artistId,
            artistName: track.artists[0].name,
            albumId: data.albumId,
            albumName: data.albumName,
            albumImage: data.albumImage,
            albumReleaseDate: data.albumReleaseDate,
            albumTotalTracks: data.albumTotalTracks,
            trackId: track.id,
            trackName: track.name,
            trackNumber: track.track_number,
            durationMs: track.duration_ms,
        };
        
        const encoded = btoa(encodeURIComponent(JSON.stringify(trackData)));
        router.push(`/review?data=${encoded}`);
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', color: '#000', mt: '-5px' }}>
            {/* ヘッダー部分 */}
            <Box
                sx={{
                    background: 'linear-gradient(180deg, #e0e0e0 0%, #f5f5f5 100%)',
                    p: 4,
                    display: 'flex',
                    gap: 3,
                    alignItems: 'flex-end',
                }}
            >
                {/* アルバムアートワーク */}
                <Box
                    sx={{
                        width: 232,
                        height: 232,
                        flexShrink: 0,
                        boxShadow: '0 4px 60px rgba(0,0,0,.5)',
                    }}
                >
                    <img
                        src={data.albumImage || '/noimage.png'}
                        alt={data.albumName}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                </Box>

                {/* アルバム情報 */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 700, color: '#000' }}>
                        アルバム
                    </Typography>
                    <Typography
                        variant="h2"
                        sx={{
                            fontWeight: 900,
                            fontSize: { xs: '2rem', md: '3rem', lg: '4rem' },
                            mb: 1,
                            color: '#000',
                        }}
                    >
                        {data.albumName}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#000' }}>
                            <ArtistLink artistId={data.artistId} artistName={data.artistName} />
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#000' }}>•</Typography>
                        <Typography variant="body2" sx={{ color: '#000' }}>{releaseYear}</Typography>
                        <Typography variant="body2" sx={{ color: '#000' }}>•</Typography>
                        <Typography variant="body2" sx={{ color: '#000' }}>{data.albumTotalTracks}曲</Typography>
                    </Box>
                </Box>
            </Box>

            {/* トラックリスト */}
            <Box sx={{ p: 4 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress sx={{ color: '#1976d2' }} />
                    </Box>
                ) : (
                    <Box>
                        {/* ヘッダー */}
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: '16px 4fr 2fr 1fr 120px',
                                gap: 2,
                                px: 2,
                                py: 1,
                                borderBottom: '1px solid rgba(0,0,0,0.1)',
                                mb: 2,
                            }}
                        >
                            <Typography variant="caption" sx={{ color: 'rgba(0,0,0,0.6)' }}>
                                #
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(0,0,0,0.6)' }}>
                                タイトル
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(0,0,0,0.6)' }}>
                                アーティスト
                            </Typography>
                            <Typography
                                variant="caption"
                                sx={{ color: 'rgba(0,0,0,0.6)', textAlign: 'right' }}
                            >
                                時間
                            </Typography>
                            <Box></Box>
                        </Box>

                        {/* トラック一覧 */}
                        {tracks.map((track) => (
                            <Box key={track.id}>
                                <Box
                                    onClick={() => handleTrackClick(track.id)}
                                    sx={{
                                        display: 'grid',
                                        gridTemplateColumns: '16px 4fr 2fr 1fr 120px',
                                        gap: 2,
                                        px: 2,
                                        py: 1.5,
                                        borderRadius: 1,
                                        '&:hover': {
                                            bgcolor: 'rgba(0,0,0,0.05)',
                                        },
                                        cursor: 'pointer',
                                    }}
                                >
                                    <Typography variant="body2">
                                        {track.track_number}
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 400 }}>
                                        {track.name}
                                    </Typography>
                                    <Typography variant="body2">
                                        {track.artists.map((artist) => artist.name).join(', ')}
                                    </Typography>
                                    <Typography variant="body2" textAlign="right">
                                        {formatDuration(track.duration_ms)}
                                    </Typography>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={(e) => handleReviewClick(e, track)}
                                        sx={{ fontSize: '0.75rem' }}
                                    >
                                        レビュー投稿
                                    </Button>
                                </Box>

                                {/* Spotify埋め込みプレイヤー（クリックで展開） */}
                                {expandedTrackId === track.id && (
                                    <Box sx={{ px: 2, py: 2 }}>
                                        <iframe
                                            src={getEmbedUrl(track.id)}
                                            width="100%"
                                            height="152"
                                            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
                                            loading="lazy"
                                            style={{ borderRadius: '12px', border: 'none' }}
                                        />
                                    </Box>
                                )}
                            </Box>
                        ))}
                    </Box>
                )}
            </Box>
        </Box>
    );
}