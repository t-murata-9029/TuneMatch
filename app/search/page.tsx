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
    Slider,
    FormControl,
    FormHelperText,
    FormGroup,
    FormControlLabel
} from '@mui/material';
import React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { postSearchState } from '../../types/forms/search';
import { useRouter } from 'next/navigation';

export default function page() {

    if (sessionStorage.getItem("selectedAlbum")) {
        sessionStorage.removeItem("selectedAlbum");
    }

    if (sessionStorage.getItem("selectedArtist")) {
        sessionStorage.removeItem("selectedArtist");
    }


    const router = useRouter();
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

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
    const [limit, setLimit] = React.useState(3);
    const [query, setQuery] = React.useState('');
    const [errors, setErrors] = React.useState({ query: false, type: false });

    // 🔹 入力や選択時にエラーを消す
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

    const handleLimitChange = (e: Event, value: number | number[]) => {
        setLimit(value as number);
    };

    const handleSubmit = () => {
        const newErrors = {
            query: query.trim() === "",
            type: type === "",
        };
        setErrors(newErrors);

        if (newErrors.query || newErrors.type) return;

        const queryData: postSearchState = { type, limit, query };
        sessionStorage.setItem('queryData', JSON.stringify(queryData));

        if (type === 'track') router.push('/search/track');
        else if (type === 'album') router.push('/search/album');
        else router.push('/search/artist');
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
                        <FormControl required error={errors.type}>
                            {errors.type && <FormHelperText>どれかを選択してください</FormHelperText>}
                            <RadioGroup
                                row
                                name="searchType"
                                value={type}
                                onChange={handleTypeChange}
                            >
                                <FormControlLabel value="artist" control={<Radio />} label="アーティスト" />
                                <FormControlLabel value="album" control={<Radio />} label="アルバム" />
                                <FormControlLabel value="track" control={<Radio />} label="曲" />
                            </RadioGroup>
                        </FormControl>

                        <Box sx={{ height: 16 }} /> {/* 空白 */}
                        表示数
                        <Slider
                            aria-label="Temperature"
                            value={limit}
                            onChange={handleLimitChange}
                            valueLabelDisplay="auto"
                            step={1}
                            marks
                            min={1}
                            max={10}
                        />

                        <Box sx={{ height: 16 }} /> {/* 空白 */}
                        <TextField
                            label="検索文字列"
                            variant="outlined"
                            value={query}
                            onChange={handleQueryChange}
                            error={errors.query}
                            helperText={errors.query ? "検索文字列を入力してください" : ""}
                        />

                        <Box sx={{ height: 16 }} /> {/* 空白 */}
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
