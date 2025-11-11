'use client';

import {
    useMediaQuery,
    Button,
    TextField,
    Box,
    CssBaseline,
    NoSsr,
    RadioGroup,
    Radio,
} from '@mui/material';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { supabase } from '@/lib/supabase.cliant';
import { getCurrentUser } from '@/lib/action';

async function getMusic() {

    // userData取得
    const userData = await getCurrentUser();

    if (userData == null) {
        return
    }

    //仮でユーザidから取得してる、でき次第書き換え(下の/連続まで)
    const user_id = userData.id;

    let spotify_access_token;

    try {

        const { data, error } = await supabase
            .from('users')
            .select('spotify_access_token')
            .eq('id', user_id)
            .single()

        if (error || !data) {
            console.error('トークン取得失敗', error)
            return
        }

        spotify_access_token = data.spotify_access_token;

    } catch (err) {
        console.error('Supabase select failed users', err);
    }

    console.log("acccesstoken:" + spotify_access_token);

    /////////////////////////////////////////////////////////////////////

    const dataJson = sessionStorage.getItem("queryData")

    let data;

    if (dataJson) {
        data = JSON.parse(dataJson);
    }

    const query = data.query;

    const type = data.type;

    const limit = '3';

    const url = `https://api.spotify.com/v1/search?q=${query}&type=${type}&limit=${limit}`;

    const result = await fetch(url, {
        headers: {
            Authorization: `Bearer ${spotify_access_token}`
        }
    }
    )

    const text = await result.text();
    console.log('Spotify raw response:', text);

    try {
        const data = JSON.parse(text);
        console.log('Parsed JSON:', data);
    } catch (err) {
        console.error('Not valid JSON:', text);
    }
}

export default function page() {

    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

    // 🔹 テーマ内で TextField の border スタイルを統一
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

    React.useEffect(() => {
        const fetchMusic = async () => {
            try {
                await getMusic();
            } catch (e) {
                console.error('getMusic failed:', e);
            }
        };

        fetchMusic();
    }, []);

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
                    <FormGroup sx={{ mb: 6 }}>
                        <RadioGroup row name="searchType" defaultValue="artist">
                            <FormControlLabel value="artist" control={<Radio />} label="アーティスト" />
                            <FormControlLabel value="album" control={<Radio />} label="アルバム" />
                            <FormControlLabel value="track" control={<Radio />} label="曲" />
                        </RadioGroup>
                        <Box sx={{ height: 16 }} />
                        <TextField id="outlined-basic" label="検索文字列" variant="outlined" />
                    </FormGroup>
                </Box>
            </ThemeProvider>
        </NoSsr>
    );
}
