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
import Pagination from '@mui/material/Pagination';
import { Timestamp } from 'next/dist/server/lib/cache-handlers/types';
import { teal } from '@mui/material/colors';

type item = {
    artistName: string;
    albumId: string;
    albumName: string;
    albumImage: string;
};

// pagination押下時、アルバム取得関数
async function handlePageChange(page: number): Promise<item[]> {
    const spotify_access_token = await getToken();
    const dataJson = sessionStorage.getItem("queryData");
    if (!dataJson) return [];

    const data = JSON.parse(dataJson);
    const query = data.query;
    const type = data.type;
    const url = `https://api.spotify.com/v1/search?q=${query}&type=${type}&limit=10&offset=${(page - 1) * 10}`;

    const result = await fetch(url, {
        headers: { Authorization: `Bearer ${spotify_access_token}` }
    });

    const json = await result.json();
    let items: item[] = [];

    if (json.albums?.items) {
        items = json.albums.items.map((a: any) => ({
            artistName: a.artists[0].name,
            albumId: a.id,
            albumName: a.name,
            albumImage: a.images[1]?.url ?? a.images[0]?.url, // 画像がなかった時の保険
        }));
    }

    return items;
}

// pagination押下時、アルバム取得(アーティスト固定)関数
async function handlePageChangeArtist(page: number): Promise<item[]> {
    const spotify_access_token = await getToken();

    const dataJson = sessionStorage.getItem("selectedArtist");

    if (!dataJson) return [];

    const data = JSON.parse(dataJson);
    const artistId = data.artistId

    const url = `https://api.spotify.com/v1/artists/${artistId}/albums?limit=10&offset=${(page - 1) * 10}`;

    const result = await fetch(url, {
        headers: { Authorization: `Bearer ${spotify_access_token}` }
    });

    const json = await result.json();

    console.log(json);

    let items: item[] = [];

    if (json.items) {
        items = json.items.map((album: any) => ({
            artistName: album.artists?.[0]?.name ?? "",
            albumId: album.id,
            albumName: album.name,
            albumImage: album.images?.[0]?.url ?? "",
        }));
    }

    return items;
}

export default function Page() {
    const router = useRouter();

    const [results, setResults] = React.useState<item[]>([]);
    const [pageCount, setPageCount] = React.useState<number>();

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
        const url = `https://api.spotify.com/v1/search?q=${query}&type=${type}&limit=10`;

        const result = await fetch(url, {
            headers: { Authorization: `Bearer ${spotify_access_token}` }
        });

        const json = await result.json();
        let items: item[] = [];

        if (json.albums?.items) {
            items = json.albums.items.map((a: any) => ({
                artistName: a.artists[0].name,
                albumId: a.id,
                albumName: a.name,
                albumImage: a.images[1]?.url ?? a.images[0]?.url, // 画像がなかった時の保険
            }));
        }

        console.log(json);
        const responseTotal = json.albums.total;
        console.log(responseTotal);

        let pageCount = Math.ceil(responseTotal / 10);

        setPageCount(pageCount);

        return items;
    }

    // Spotify API アーティストIdから取得関数
    async function getArtistMusic(): Promise<item[]> {
        const spotify_access_token = await getToken();
        const dataJson = sessionStorage.getItem("selectedArtist");

        console.log(dataJson);

        if (!dataJson) return [];

        const data = JSON.parse(dataJson);
        const artistId = data.artistId

        const url = `https://api.spotify.com/v1/artists/${artistId}/albums?limit=10`;

        const result = await fetch(url, {
            headers: { Authorization: `Bearer ${spotify_access_token}` }
        });

        const json = await result.json();

        console.log(json);

        let items: item[] = [];

        if (json.items) {
            items = json.items.map((album: any) => ({
                artistName: album.artists?.[0]?.name ?? "",
                albumId: album.id,
                albumName: album.name,
                albumImage: album.images?.[0]?.url ?? "",
            }));
        }

        console.log(json);
        const responseTotal = json.total;
        console.log(responseTotal);

        let pageCount = Math.ceil(responseTotal / 10);

        setPageCount(pageCount);

        return items;
    }

    // どのAPIを使うか判定して返す関数
    function shouldFetchArtist(): boolean {
        return sessionStorage.getItem("selectedArtist") !== null;
    }

    async function fetchMusicData(): Promise<item[]> {
        if (shouldFetchArtist()) {
            return await getArtistMusic();
        } else {
            return await getMusic();
        }
    }

    // 🔹 useEffect で初回取得
    React.useEffect(() => {
        fetchMusicData()
            .then(data => setResults(data))
            .catch(err => console.error("fetchMusicData failed:", err));
    }, []);

    const handleCardClick = (item: item) => {
        sessionStorage.setItem("selectedAlbum", JSON.stringify(item));
        console.log(item);
        router.push('../search/track');
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
                                        alt={item.albumName}
                                    />
                                    <CardContent>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            {item.albumName}
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
                    <Box sx={{ height: 16 }} /> {/*空白追加*/}
                    <Pagination count={pageCount} variant="outlined" shape="rounded" color='primary'
                        onChange={async (event, page) => {
                            if (shouldFetchArtist()) {
                                const items = await handlePageChangeArtist(page);
                                setResults(items);
                            } else {
                                const items = await handlePageChange(page);
                                setResults(items);
                            }
                        }}
                    />
                </Box>
            </ThemeProvider>
        </NoSsr>
    );
}
