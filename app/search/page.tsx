'use client';

import React, { useState, useEffect } from 'react';
import {
    Button,
    TextField,
    Box,
    RadioGroup,
    Radio,
    FormControl,
    FormHelperText,
    FormControlLabel,
    Typography,
    Card,
    CardMedia,
    CardContent,
    Grid,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { postSearchState } from '@/types/forms/search';
import { Timestamp } from 'next/dist/server/lib/cache-handlers/types';
import getToken from '@/utils/spotify/getToken';
import TrackCard from '@/components/TrackCard'; // パスは適宜調整してください

type item = {
    artistId: string;
    artistName: string;
    albumId: string;
    albumName: string;
    albumImage: string;
    albumReleaseDate: Timestamp;
    albumTotalTracks: number;
    trackId: string;
    trackName: string;
    trackNumber: number;
    durationMs: number
};

// Spotify API 曲名から取得関数
async function fetchTracks(query: string): Promise<item[]> {

    console.log('Fetching tracks for query:', query);

    const spotify_access_token = await getToken();
    const url = `https://api.spotify.com/v1/search?q=${query}&type=track&limit=10`;

    const result = await fetch(url, {
        headers: { Authorization: `Bearer ${spotify_access_token}` }
    });

    const json = await result.json();
    let items: item[] = [];

    if (json.tracks?.items) {
        items = json.tracks.items.map((t: any) => ({
            artistId: t.artists[0].id,
            artistName: t.artists[0].name,
            albumId: t.album.id,
            albumName: t.album.name,
            albumImage: t.album.images[1]?.url || t.album.images[0]?.url,
            albumReleaseDate: t.album.release_date,
            albumTotalTracks: t.album.total_tracks,
            trackId: t.id,
            trackName: t.name,
            trackNumber: t.track_number,
            durationMs: t.duration_ms,
        }));
    }

    return items;
}

export default function Page() {
    const router = useRouter();
    const [type, setType] = useState('');
    const [query, setQuery] = useState('');
    const [errors, setErrors] = useState({ query: false, type: false });
    const [tracks, setTracks] = useState<item[]>([]);

    const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
        if (errors.query && e.target.value.trim() !== "") {
            setErrors((prev) => ({ ...prev, query: false }));
        }
    };

    const handleTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setType(e.target.value);
        if (errors.type && e.target.value !== "") {
            setErrors((prev) => ({ ...prev, type: false }));
        }
    };

    const handleSubmit = async () => {
        if (query.trim() === "") {
            setErrors({ query: true, type: false });
            return;
        }

        setErrors({ query: false, type: false });

        console.log('handleSubmit called with query:', query);
        const results = await fetchTracks(query);
        console.log('Fetched results:', results);
        setTracks(results);
    };

    const handleTrackClick = (trackId: string) => {
        console.log('Track clicked:', trackId);
        // ここにトラッククリック時の処理を追加
    };

    return (
        <Box sx={{ height: '116vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* セクション1: 検索ボックスエリア */}
            <Box
                sx={{
                    height: '11vh',
                    bgcolor: '#f5f5f5',
                    borderBottom: '2px solid #e0e0e0',
                    display: 'flex',
                    alignItems: 'center',
                    px: 4,
                }}
            >
                <Box sx={{ maxWidth: 600, width: '100%' }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            label="検索"
                            variant="outlined"
                            size="small"
                            value={query}
                            onChange={handleQueryChange}
                            error={errors.query}
                            helperText={errors.query ? "入力してください" : ""}
                            sx={{ flex: 1, minWidth: 200 }}
                        />

                        <Button
                            variant="contained"
                            onClick={handleSubmit}
                            sx={{ px: 3, py: 1 }}
                        >
                            検索
                        </Button>
                    </Box>
                </Box>
            </Box>

            {/* セクション2: 曲の検索結果 */}
            <Box
                sx={{
                    height: '40vh',
                    bgcolor: '#ffffff',
                    borderBottom: '2px solid #e0e0e0',
                    p: 3,
                    overflow: 'hidden',
                }}
            >
                <Box sx={{ maxWidth: 1200, mx: 'auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                        曲
                    </Typography>
                    <Box sx={{ 
                        display: 'flex', 
                        gap: 2, 
                        flexWrap: 'nowrap',
                        overflowX: 'auto',
                        overflowY: 'hidden',
                        flex: 1,
                        '&::-webkit-scrollbar': {
                            height: '8px',
                        },
                        '&::-webkit-scrollbar-track': {
                            backgroundColor: '#f1f1f1',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: '#888',
                            borderRadius: '4px',
                        },
                        '&::-webkit-scrollbar-thumb:hover': {
                            backgroundColor: '#555',
                        },
                    }}>
                        {tracks.map((track) => (
                            <TrackCard
                                key={track.trackId}
                                trackId={track.trackId}
                                trackName={track.trackName}
                                artistName={track.artistName}
                                albumImage={track.albumImage}
                                onClick={() => handleTrackClick(track.trackId)}
                            />
                        ))}
                    </Box>
                </Box>
            </Box>

            {/* セクション3: アルバム */}
            <Box
                sx={{
                    height: '35vh',
                    bgcolor: '#fafafa',
                    borderBottom: '2px solid #e0e0e0',
                    p: 3,
                    overflow: 'auto',
                }}
            >
                <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                        アルバム
                    </Typography>
                </Box>
            </Box>

            {/* セクション4: アーティスト */}
            <Box
                sx={{
                    height: '35vh',
                    bgcolor: '#f5f5f5',
                    p: 3,
                    overflow: 'auto',
                }}
            >
                <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                        アーティスト
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
}