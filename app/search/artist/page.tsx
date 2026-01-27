'use client';

import React, { useState, useEffect } from 'react';
import {
    Button,
    TextField,
    Box,
    Typography,
} from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
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

type artist = {
    artistId: string;
    artistName: string;
    albumImage: string;
};

// アーティストのトップトラックを取得
async function fetchArtistTopTracks(artistId: string): Promise<item[]> {
    console.log('Fetching top tracks for artist:', artistId);

    const spotify_access_token = await getToken();
    const url = `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=JP`;

    const result = await fetch(url, {
        headers: { Authorization: `Bearer ${spotify_access_token}` }
    });

    const json = await result.json();
    let items: item[] = [];

    if (json.tracks) {
        items = json.tracks.slice(0, 10).map((t: any) => ({
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

// アーティストのアルバムを取得
async function fetchArtistAlbums(artistId: string): Promise<item[]> {
    console.log('Fetching albums for artist:', artistId);

    const spotify_access_token = await getToken();
    const url = `https://api.spotify.com/v1/artists/${artistId}/albums?limit=10&market=JP`;

    const result = await fetch(url, {
        headers: { Authorization: `Bearer ${spotify_access_token}` }
    });

    const json = await result.json();
    let items: item[] = [];

    if (json.items) {
        items = json.items.map((a: any) => ({
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

// 関連アーティストを取得（検索APIを使用）
async function fetchRelatedArtists(artistName: string): Promise<artist[]> {
    console.log('Fetching related artists for:', artistName);

    const spotify_access_token = await getToken();
    const url = `https://api.spotify.com/v1/search?q=${artistName}&type=artist&limit=10&offset=1`;

    try {
        const result = await fetch(url, {
            headers: { Authorization: `Bearer ${spotify_access_token}` }
        });

        if (!result.ok) {
            console.error('Related artists search error:', result.status);
            return [];
        }

        const json = await result.json();
        let items: artist[] = [];

        if (json.artists?.items) {
            items = json.artists.items.map((ar: any) => ({
                artistId: ar.id,
                artistName: ar.name,
                albumImage: ar.images?.[0]?.url || '',
            }));
        }

        return items;
    } catch (error) {
        console.error('Error fetching related artists:', error);
        return [];
    }
}

export default function Page() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [errors, setErrors] = useState({ query: false });
    const [artistData, setArtistData] = useState<artist | null>(null);
    const [topTracks, setTopTracks] = useState<item[]>([]);
    const [albums, setAlbums] = useState<item[]>([]);
    const [relatedArtists, setRelatedArtists] = useState<artist[]>([]);
    const [isScrolled, setIsScrolled] = useState(false);

    // URLからアーティスト情報を取得してコンテンツを読み込み
    useEffect(() => {
        const data = searchParams.get('data');
        if (data) {
            try {
                const decoded = JSON.parse(decodeURIComponent(atob(data)));
                setArtistData(decoded);

                // アーティストのコンテンツを取得
                const loadArtistContent = async () => {
                    const tracks = await fetchArtistTopTracks(decoded.artistId);
                    const artistAlbums = await fetchArtistAlbums(decoded.artistId);
                    const related = await fetchRelatedArtists(decoded.artistName);

                    setTopTracks(tracks);
                    setAlbums(artistAlbums);
                    setRelatedArtists(related);
                };

                loadArtistContent();
            } catch (error) {
                console.error('Error decoding artist data:', error);
            }
        }
    }, [searchParams]);

    const handleTrackClick = (track: item) => {
        console.log('Track clicked:', track.trackId);
        const encoded = btoa(encodeURIComponent(JSON.stringify(track)));
        router.push(`/review?data=${encoded}`);
    };

    const handleAlbumClick = (album: item) => {
        console.log('Album clicked:', album.albumId);
        const encoded = btoa(encodeURIComponent(JSON.stringify(album)));
        router.push(`/search/album?data=${encoded}`);
    };

    const handleArtistClick = (artist: artist) => {
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
            {/* スクロール可能なコンテンツエリア */}
            <Box sx={{ overflowY: 'auto' }} onScroll={handleScroll}>
                {/* アーティスト情報 */}
                {artistData && (
                    <Box
                        sx={{
                            bgcolor: '#ffffff',
                            borderBottom: '2px solid #e0e0e0',
                            p: 3,
                        }}
                    >
                        <Box sx={{ maxWidth: 1200, mx: 'auto', display: 'flex', gap: 3, alignItems: 'center' }}>
                            {artistData.albumImage && (
                                <Box
                                    component="img"
                                    src={artistData.albumImage}
                                    alt={artistData.artistName}
                                    sx={{
                                        width: 150,
                                        height: 150,
                                        borderRadius: '8px',
                                        objectFit: 'cover',
                                    }}
                                />
                            )}
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                                    {artistData.artistName}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    アーティスト
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                )}

                {/* セクション1: トップトラック */}
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
                            トップトラック
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
                            {topTracks.map((track) => (
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

                {/* セクション2: アルバム */}
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

                {/* セクション3: 関連アーティスト */}
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
                            関連アーティスト
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
                            {relatedArtists.map((artist) => (
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