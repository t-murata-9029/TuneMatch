'use client';

import {
    useMediaQuery,
    Button,
    TextField,
    Box,
    NoSsr,
    RadioGroup,
    Radio,
    Slider,
    FormControl,
    FormHelperText,
} from '@mui/material';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import React, { useEffect } from 'react';
import { createTheme } from '@mui/material/styles';
import { postSearchState } from '@/types/forms/search';
import { useRouter } from 'next/navigation';

export default function page() {

    const router = useRouter();

    const [type, setType] = React.useState('');
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

    const handleSubmit = () => {
        const newErrors = {
            query: query.trim() === "",
            type: type === "",
        };
        setErrors(newErrors);

        if (newErrors.query || newErrors.type) return;

        const queryData: postSearchState = { type, query };
        sessionStorage.setItem('queryData', JSON.stringify(queryData));

        if (type === 'track') router.push('/search/track');
        else if (type === 'album') router.push('/search/album');
        else router.push('/search/artist');
    };

    useEffect(() => {
        sessionStorage.removeItem("selectedAlbum");
        sessionStorage.removeItem("selectedArtist");
    }, []);

    return (
        <NoSsr>
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

        </NoSsr>
    );
}
