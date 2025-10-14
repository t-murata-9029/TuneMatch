'use client'

import { SignupFormState } from "@/types/forms/auth";
import { Box, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, TextField, Typography, Button } from "@mui/material";
import { useState } from "react";
import { executeSignup } from "../endpoints";

export default function Signup() {

    /* 初期値 */
    const initialFormState: SignupFormState = {
        email: '',
        password: '',
        username: '',
        profile_text: '',
        gender: 'male',
    };

    /* データ保存用 */
    const [formData, setFormData] = useState<SignupFormState>(initialFormState);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));


    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log("フォーム送信データ:", formData);
        executeSignup(formData)
    }

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ maxWidth: 400, margin: 'auto', padding: 3 }}
        >
            <Typography variant="h5" gutterBottom>アカウント作成</Typography>

            <FormControl fullWidth margin="normal">
                <FormLabel htmlFor="email-input">メールアドレス</FormLabel>
                <TextField
                    id="email-input"
                    fullWidth
                    size="small"
                    placeholder="example1234@tunematch.com"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
            </FormControl>

            <FormControl fullWidth margin="normal">
                <FormLabel htmlFor="password-input">パスワード</FormLabel>
                <TextField
                    id="password-input"
                    fullWidth
                    size="small"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
            </FormControl>

            <FormControl fullWidth margin="normal">
                <FormLabel htmlFor="username-input">ユーザー名</FormLabel>
                <TextField
                    id="username-input"
                    fullWidth
                    size="small"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    helperText="公開されます（例: music_lover_777）"
                />
            </FormControl>

            <FormControl component="fieldset" margin="normal">
                <FormLabel id="gender-radio-group-label">性別</FormLabel>
                <RadioGroup
                    aria-labelledby="gender-radio-group-label"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    row // 横並びにする
                >
                    <FormControlLabel value="male" control={<Radio size="small" />} label="男性" />
                    <FormControlLabel value="female" control={<Radio size="small" />} label="女性" />
                </RadioGroup>
            </FormControl>

            {/* 自己紹介文 */}
            <FormControl fullWidth margin="normal">
                <FormLabel htmlFor="profile-text-input">自己紹介文</FormLabel>
                <TextField
                    id="profile-text-input"
                    fullWidth
                    multiline // 複数行を有効化
                    minRows={3}
                    size="small"
                    name="profile_text"
                    placeholder="あなたの好きな音楽のジャンルやアーティストを教えてください。"
                    value={formData.profile_text}
                    onChange={handleChange}
                    aria-label="自己紹介文"
                />
            </FormControl>

            {/* 送信ボタン */}
            <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{ mt: 3 }}
            >
                アカウントを作成
            </Button>
        </Box>
    );
}