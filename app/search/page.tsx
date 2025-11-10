'use client';

import {
    useMediaQuery,
    Button,
    TextField,
    Box,
    CssBaseline,
    NoSsr,
} from '@mui/material';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';

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
                    <FormGroup sx={{ mb: 4 }}>
                        <FormControlLabel control={<Checkbox value="artist" />} label="アーティスト" />
                        <FormControlLabel control={<Checkbox value="album" />} label="アルバム" />
                        <FormControlLabel control={<Checkbox value="track"/>} label="曲" />
                        <TextField id="outlined-basic" label="検索文字列" variant="outlined" />
                    </FormGroup>
                </Box>
            </ThemeProvider>
        </NoSsr>
    );
}
