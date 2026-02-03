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
import TrackCard from '@/components/TrackCard';

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

// Spotify API アルバム取得関数
async function fetchAlbums(query: string): Promise<item[]> {

    console.log('Fetching albums for query:', query);

    const spotify_access_token = await getToken();
    const url = `https://api.spotify.com/v1/search?q=${query}&type=album&limit=10`;

    const result = await fetch(url, {
        headers: { Authorization: `Bearer ${spotify_access_token}` }
    });

    const json = await result.json();
    let items: item[] = [];

    if (json.albums?.items) {
        items = json.albums.items.map((a: any) => ({
            artistId: a.artists[0].id,
            artistName: a.artists[0].name,
            albumId: a.id,
            albumName: a.name,
            albumImage: a.images[1]?.url || a.images[0]?.url,
            albumReleaseDate: a.release_date,
            albumTotalTracks: a.total_tracks,
            trackId: a.id,
            trackName: a.name,
            trackNumber: 0,
            durationMs: 0,
        }));
    }

    return items;
}

// Spotify API アーティスト取得関数
async function fetchArtists(query: string): Promise<item[]> {

    console.log('Fetching artists for query:', query);

    const spotify_access_token = await getToken();
    const url = `https://api.spotify.com/v1/search?q=${query}&type=artist&limit=10`;

    const result = await fetch(url, {
        headers: { Authorization: `Bearer ${spotify_access_token}` }
    });

    const json = await result.json();
    let items: item[] = [];

    if (json.artists?.items) {
        items = json.artists.items.map((ar: any) => ({
            artistId: ar.id,
            artistName: ar.name,
            albumId: '',
            albumName: '',
            albumImage: ar.images[1]?.url || ar.images[0]?.url || '',
            albumReleaseDate: '',
            albumTotalTracks: 0,
            trackId: ar.id,
            trackName: ar.name,
            trackNumber: 0,
            durationMs: 0,
        }));
    }

    return items;
}

// Spotify公式プレイリストからトップトラックを取得
async function fetchTopTracks(): Promise<item[]> {
    console.log('Fetching top tracks from Global Top 50 playlist');

    const spotify_access_token = await getToken();
    // Global Top 50プレイリストID
    const playlistId = '37i9dQZEVXbMDoHDwVN2tF';
    const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=10`;

    try {
        const result = await fetch(url, {
            headers: { 
                'Authorization': `Bearer ${spotify_access_token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Playlist API response status:', result.status);

        if (!result.ok) {
            console.error('Playlist API error:', result.status, result.statusText);
            const errorData = await result.json();
            console.error('Error details:', errorData);
            throw new Error(`Playlist API error: ${result.status}`);
        }

        const json = await result.json();
        let items: item[] = [];

        if (json.items) {
            items = json.items.map((item: any) => {
                const track = item.track;
                return {
                    artistId: track.artists[0]?.id || '',
                    artistName: track.artists[0]?.name || 'Unknown',
                    albumId: track.album?.id || '',
                    albumName: track.album?.name || 'Unknown',
                    albumImage: track.album?.images[1]?.url || track.album?.images[0]?.url || '',
                    albumReleaseDate: track.album?.release_date || '',
                    albumTotalTracks: track.album?.total_tracks || 0,
                    trackId: track.id,
                    trackName: track.name,
                    trackNumber: track.track_number || 0,
                    durationMs: track.duration_ms || 0,
                };
            });
        }

        console.log('Top tracks fetched:', items);
        return items;
    } catch (error) {
        console.error('Error fetching top tracks:', error);
        // フォールバック：人気の検索クエリを使用して曲を取得
        console.log('Falling back to search for popular tracks');
        try {
            const popularTracks = await fetchTracks('trending');
            return popularTracks;
        } catch (fallbackError) {
            console.error('Fallback also failed:', fallbackError);
            return [];
        }
    }
}

export default function Page() {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [errors, setErrors] = useState({ query: false });
    const [tracks, setTracks] = useState<item[]>([]);
    const [albums, setAlbums] = useState<item[]>([]);
    const [artists, setArtists] = useState<item[]>([]);
    const [isScrolled, setIsScrolled] = useState(false);

    // マウント時にデフォルトでトップヒットを取得
    useEffect(() => {
        const loadDefaultContent = async () => {
            const topTracks = await fetchTracks('top tracks Japan');
            const topAlbums = await fetchAlbums('top albums Japan');
            const topArtists = await fetchArtists('top artist Japan');
            setTracks(topTracks);
            setAlbums(topAlbums);
            setArtists(topArtists);
        };

        loadDefaultContent();
    }, []);

    const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
        if (errors.query && e.target.value.trim() !== "") {
            setErrors((prev) => ({ ...prev, query: false }));
        }
    };

    const handleSubmit = async () => {
        if (query.trim() === "") {
            setErrors({ query: true });
            return;
        }

        setErrors({ query: false });

        console.log('handleSubmit called with query:', query);
        const trackResults = await fetchTracks(query);
        const albumResults = await fetchAlbums(query);
        const artistResults = await fetchArtists(query);
        console.log('Fetched track results:', trackResults);
        console.log('Fetched album results:', albumResults);
        console.log('Fetched artist results:', artistResults);
        setTracks(trackResults);
        setAlbums(albumResults);
        setArtists(artistResults);
    };

    const handleTrackClick = (track: item) => {
        console.log('Track clicked:', track.trackId);
        // JSONをbase64エンコードしてURLに含める
        const encoded = btoa(encodeURIComponent(JSON.stringify(track)));
        router.push(`/review?data=${encoded}`);
    };

    const handleAlbumClick = (album: item) => {
        console.log('Album clicked:', album.albumId);
        const encoded = btoa(encodeURIComponent(JSON.stringify(album)));
        router.push(`/search/album?data=${encoded}`);
    };

    const handleArtistClick = (artist: item) => {
        console.log('Artist clicked:', artist.artistId);
        const encoded = btoa(encodeURIComponent(JSON.stringify(artist)));
        router.push(`/search/artist?data=${encoded}`);
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const scrollTop = e.currentTarget.scrollTop;
        setIsScrolled(scrollTop > 10);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {/* 固定ヘッダー: 検索ボックスエリア */}
            <Box
                sx={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 1000,
                    height: '11vh',
                    bgcolor: isScrolled ? 'rgba(245, 245, 245, 0.85)' : '#f5f5f5',
                    backdropFilter: isScrolled ? 'blur(10px)' : 'none',
                    borderBottom: '2px solid #e0e0e0',
                    display: 'flex',
                    alignItems: 'center',
                    px: 4,
                    transition: 'all 0.3s ease',
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
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSubmit();
                                }
                            }}
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

            {/* スクロール可能なコンテンツエリア */}
            <Box sx={{ overflowY: 'auto' }} onScroll={handleScroll}>
                {/* セクション2: 曲の検索結果 */}
                <Box
                    sx={{
                        height: '43vh',
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
                                    onClick={() => handleTrackClick(track)}
                                />
                            ))}
                        </Box>
                    </Box>
                </Box>

                {/* セクション3: アルバム */}
                <Box
                    sx={{
                        height: '43vh',
                        bgcolor: '#ffffff',
                        borderBottom: '2px solid #e0e0e0',
                        p: 3,
                        overflow: 'hidden',
                    }}
                >
                    <Box sx={{ maxWidth: 1200, mx: 'auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                            アルバム
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
                            {albums.map((album) => (
                                <TrackCard
                                    key={album.albumId}
                                    trackId={album.albumId}
                                    trackName={album.albumName}
                                    artistName={album.artistName}
                                    albumImage={album.albumImage}
                                    onClick={() => handleAlbumClick(album)}
                                />
                            ))}
                        </Box>
                    </Box>
                </Box>

                {/* セクション4: アーティスト */}
                <Box
                    sx={{
                        height: '43vh',
                        bgcolor: '#ffffff',
                        p: 3,
                        overflow: 'hidden',
                    }}
                >
                    <Box sx={{ maxWidth: 1200, mx: 'auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                            アーティスト
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
                            {artists.map((artist) => (
                                <TrackCard
                                    key={artist.artistId}
                                    trackId={artist.artistId}
                                    trackName={artist.artistName}
                                    artistName=""
                                    albumImage={artist.albumImage}
                                    onClick={() => handleArtistClick(artist)}
                                />
                            ))}
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}