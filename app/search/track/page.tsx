'use client';

import {
    useMediaQuery,
    Box,
    CssBaseline,
    NoSsr,
    Card,
    CardContent,
    CardMedia,
    Typography,
    Grid,
} from '@mui/material';
import React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import getToken from '@/utils/spotify/getToken';
import { useRouter } from 'next/navigation';
import { Timestamp } from 'next/dist/server/lib/cache-handlers/types';

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

export default function Page() {
    const router = useRouter();

    const [results, setResults] = React.useState<item[]>([]);
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

    // 🔹 テーマ
    const theme = React.useMemo(
        () =>
            createTheme({
                palette: { mode: prefersDarkMode ? 'dark' : 'light' },
                components: {
                    MuiOutlinedInput: {
                        styleOverrides: {
                            root: {
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: prefersDarkMode ? '#ffffff' : '#000000',
                                    borderWidth: 2,
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: prefersDarkMode ? '#64b5f6' : '#42a5f5',
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: prefersDarkMode ? '#2196f3' : '#1565c0',
                                },
                            },
                        },
                    },
                },
            }),
        [prefersDarkMode]
    );

    // Spotify API 曲名から取得関数
    async function getMusic(): Promise<item[]> {
        const spotify_access_token = await getToken();
        const dataJson = sessionStorage.getItem("queryData");
        if (!dataJson) return [];

        const data = JSON.parse(dataJson);
        const query = data.query;
        const type = data.type;
        const limit = data.limit;
        const url = `https://api.spotify.com/v1/search?q=${query}&type=${type}&limit=${limit}`;

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
                albumImage: t.album.images[1].url,
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

    // Spotify API アルバムIdから取得関数
    async function getAlbumMusic(): Promise<item[]> {
        const spotify_access_token = await getToken();
        const dataJson = sessionStorage.getItem("selectedAlbum");

        console.log(dataJson);

        if (!dataJson) return [];

        const data = JSON.parse(dataJson);
        const albumId = data.albumId

        const url = `https://api.spotify.com/v1/albums/${albumId}`;

        const result = await fetch(url, {
            headers: { Authorization: `Bearer ${spotify_access_token}` }
        });

        const json = await result.json();

        console.log(json);

        let items: item[] = [];

        if (json.tracks?.items) {
            items = json.tracks.items.map((t: any) => ({
                artistId: t.artists[0]?.id,
                artistName: t.artists[0]?.name,
                albumId: json.id,
                albumName: json.name,
                albumImage: json.images[1]?.url,
                albumReleaseDate: json.release_date,
                albumTotalTracks: json.total_tracks,
                trackId: t.id,
                trackName: t.name,
                trackNumber: t.track_number,
                durationMs: t.duration_ms,
            }));
        }

        return items;
    }

    // どのAPIを使うか判定して返す関数
    function shouldFetchAlbum(): boolean {
        return sessionStorage.getItem("selectedAlbum") !== null;
    }

    async function fetchMusicData(): Promise<item[]> {
        if (shouldFetchAlbum()) {
            return await getAlbumMusic();
        } else {
            return await getMusic();
        }
    }

    // useEffect
    React.useEffect(() => {
        fetchMusicData()
            .then(data => setResults(data))
            .catch(err => console.error("fetchMusicData failed:", err));
    }, []);
    const handleCardClick = (item: item) => {
        sessionStorage.setItem("selectedItem", JSON.stringify(item));
        router.push('../../review');
    };

    return (
        <NoSsr>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: '100vh',
                        p: 2,
                    }}
                >
                    検索結果
                    <Box sx={{ height: 16 }} /> {/*空白追加*/}
                    <Grid container spacing={2} direction="column" alignItems="center">
                        {results.map((item, index) => (
                            <Grid key={index} sx={{ width: { xs: '90%', sm: '100%', md: '100%' } }}>
                                <Card sx={{ display: 'flex', alignItems: 'center', p: 2 }}
                                    onClick={() => handleCardClick(item)}>
                                    <CardMedia
                                        component="img"
                                        sx={{ width: 100, height: 100, borderRadius: 2, mr: 3 }}
                                        image={item.albumImage}
                                        alt={item.trackName}
                                    />
                                    <CardContent>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            {item.trackName}
                                        </Typography>
                                        <Box sx={{ height: 16 }} /> {/*空白追加*/}
                                        <Typography variant="body2" color="text.secondary">
                                            {item.artistName} {/* アーティスト名 */}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </ThemeProvider>
        </NoSsr>
    );
}
