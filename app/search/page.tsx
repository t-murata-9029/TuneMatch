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
import { postSearchState } from '../../types/forms/search';
import { useRouter } from 'next/navigation';

export default function page() {

    const router = useRouter();

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

    const [type, setType] = React.useState('');
    const [query, setQuery] = React.useState('');

    const handleSubmit = () => {
        const queryData: postSearchState = {
            type: type,
            query: query
        };
        sessionStorage.setItem('queryData', JSON.stringify(queryData));
        router.push('/search/track');
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
                    <FormGroup sx={{ mb: 6 }}>
                        <RadioGroup
                            row name="searchType"
                            defaultValue="artist"
                            value={type}
                            onChange={(e) => setType(e.target.value)}>
                            <FormControlLabel value="artist" control={<Radio />} label="アーティスト" />
                            <FormControlLabel value="album" control={<Radio />} label="アルバム" />
                            <FormControlLabel value="track" control={<Radio />} label="曲" />
                        </RadioGroup>
                        <Box sx={{ height: 16 }} /> {/*空白追加*/}
                        <TextField
                            id="outlined-basic"
                            label="検索文字列"
                            variant="outlined"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)} />
                        <Box sx={{ height: 16 }} /> {/*空白追加*/}
                        <Button
                            variant="outlined"
                            onClick={handleSubmit}
                            sx={{ width: 'auto', alignSelf: 'flex-end', px: 3, py: 1.5 }}
                        >
                            検索
                        </Button>
                    </FormGroup>
                </Box>
            </ThemeProvider>
        </NoSsr>
    );
}
