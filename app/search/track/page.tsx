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

    // 🔹 Spotify API 取得関数
    async function getMusic(): Promise<item[]> {
        const spotify_access_token = await getToken();
        const dataJson = sessionStorage.getItem("queryData");
        if (!dataJson) return [];

        const data = JSON.parse(dataJson);
        const query = data.query;
        const type = data.type;
        const limit = '3';
        const url = `https://api.spotify.com/v1/search?q=${query}&type=${type}&limit=${limit}`;

        const result = await fetch(url, {
            headers: { Authorization: `Bearer ${spotify_access_token}` }
        });

        const json = await result.json();
        let items: item[] = [];

        if (type === 'artist' && json.artists?.items) {
            items = json.artists.items.map((a: any) => ({
                image: a.images[0]?.url ?? '',
                trackName: a.name
            }));
        } else if (type === 'track' && json.tracks?.items) {
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
        } else if (type === 'album' && json.albums?.items) {
            items = json.albums.items.map((a: any) => ({
                image: a.images[0]?.url ?? '',
                trackName: a.name
            }));
        }

        return items;
    }

    // 🔹 useEffect で初回取得
    React.useEffect(() => {
        const fetchMusic = async () => {
            try {
                const items = await getMusic();
                setResults(items);
            } catch (e) {
                console.error('getMusic failed:', e);
            }
        };
        fetchMusic();
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
