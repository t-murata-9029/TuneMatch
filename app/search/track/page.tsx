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
    Pagination,
    Breadcrumbs,
    Link,
} from '@mui/material';
import React from 'react';
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

// Spotify API 曲名から取得関数
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
async function handlePageChangeAlbum(page: number): Promise<item[]> {
    const spotify_access_token = await getToken();
    const dataJson = sessionStorage.getItem("selectedAlbum");

    console.log(dataJson);

    if (!dataJson) return [];

    const data = JSON.parse(dataJson);
    const albumId = data.albumId

    const url = `https://api.spotify.com/v1/albums/${albumId}/tracks?limit=10&offset=${(page - 1) * 10}`;

    const result = await fetch(url, {
        headers: { Authorization: `Bearer ${spotify_access_token}` }
    });

    const json = await result.json();

    console.log(json);

    const getReleaseDateUrl = `https://api.spotify.com/v1/albums/${albumId}`;

    const resultDate = await fetch(getReleaseDateUrl, {
        headers: { Authorization: `Bearer ${spotify_access_token}` }
    });

    const dateJson = await resultDate.json();

    let items: item[] = [];

    if (json.items) {
        items = json.items.map((t: any) => ({
            artistId: t.artists[0]?.id,
            artistName: t.artists[0]?.name,
            albumId: albumId,
            albumName: data.albumName,
            albumImage: data.albumImage,
            albumReleaseDate: dateJson.release_date,
            albumTotalTracks: dateJson.total_tracks,
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

    const [results, setResults] = React.useState<item[]>([]);
    const [pageCount, setPageCount] = React.useState<number>();
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

    const [breadcrumbs, setBreadcrumbs] = React.useState<React.ReactNode[]>([]);

    // Spotify API 曲名から取得関数
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

        console.log(json);
        const responseTotal = json.total_tracks;
        console.log(responseTotal);

        let pageCount = Math.ceil(responseTotal / 10);

        setPageCount(pageCount);

        setBreadcrumbs([
            <Link underline="hover" key="1" color="inherit" href="/search">
                Search
            </Link>,
            <Link underline="none"
                key="2"
                color="text.primary"
                aria-current="page"
                onClick={(e) => e.preventDefault()} // クリック無効
            >
                Track
            </Link>
        ]);

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

        const url = `https://api.spotify.com/v1/albums/${albumId}/tracks?limit=10`;

        const result = await fetch(url, {
            headers: { Authorization: `Bearer ${spotify_access_token}` }
        });

        const json = await result.json();

        console.log(json);

        const getReleaseDateUrl = `https://api.spotify.com/v1/albums/${albumId}`;

        const resultDate = await fetch(getReleaseDateUrl, {
            headers: { Authorization: `Bearer ${spotify_access_token}` }
        });

        const dateJson = await resultDate.json();

        console.log(dateJson);

        const release_date = dateJson.release_date;
        console.log(release_date);

        const total_tracks = dateJson.total_tracks;

        let items: item[] = [];

        if (json.items) {
            items = json.items.map((t: any) => ({
                artistId: t.artists[0]?.id,
                artistName: t.artists[0]?.name,
                albumId: data.albumId,
                albumName: data.albumName,
                albumImage: data.albumImage,
                albumReleaseDate: release_date,
                albumTotalTracks: total_tracks,
                trackId: t.id,
                trackName: t.name,
                trackNumber: t.track_number,
                durationMs: t.duration_ms,
            }));
        }

        const responseTotal = dateJson.total_tracks;
        console.log(responseTotal);

        let pageCount = Math.ceil(responseTotal / 10);

        setPageCount(pageCount);

        if (sessionStorage.getItem("selectedArtist")) {
            setBreadcrumbs([
                <Link underline="hover" key="1" color="inherit" href="/search">
                    Search
                </Link>,
                <Link underline="hover" key="2" color="inherit" href="/search/artist">
                    Artist
                </Link>,
                <Link underline="hover" key="3" color="inherit" href="/search/album">
                    Album
                </Link>,
                <Link underline="none"
                    key="4"
                    color="text.primary"
                    aria-current="page"
                    onClick={(e) => e.preventDefault()} // クリック無効
                >
                    Track
                </Link>
            ]);
        } else {
            setBreadcrumbs([
                <Link underline="hover" key="1" color="inherit" href="/search">
                    Search
                </Link>,
                <Link underline="hover" key="2" color="inherit" href="/search/album">
                    Album
                </Link>,
                <Link underline="none"
                    key="3"
                    color="text.primary"
                    aria-current="page"
                    onClick={(e) => e.preventDefault()} // クリック無効
                >
                    Track
                </Link>
            ]);
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
            <Box sx={{ height: 16 }} /> {/*空白追加*/}
            <Box sx={{ pl: 2, mb: 1 }}>
                <Breadcrumbs separator="›" aria-label="breadcrumb">
                    {breadcrumbs}
                </Breadcrumbs>
            </Box>
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
                            <Card sx={{
                                display: 'flex', alignItems: 'center', p: 2, cursor: 'pointer', transition: '0.3s',
                                '&:hover': {
                                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                                },
                            }}
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
                <Box sx={{ height: 16 }} /> {/*空白追加*/}
                <Pagination count={pageCount} variant="outlined" shape="rounded" color='primary'
                    onChange={async (event, page) => {
                        if (shouldFetchAlbum()) {
                            const items = await handlePageChangeAlbum(page);
                            setResults(items);
                        } else {
                            const items = await handlePageChange(page);
                            setResults(items);
                        }
                    }}
                />
            </Box>
        </NoSsr>
    );
}
