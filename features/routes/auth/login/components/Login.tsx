'use client'

import { LoginFormState } from "@/types/forms/auth";
import { Box, Button, FormControl, FormLabel, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { executeLogin } from "../endpoints";
import { useRouter } from "next/navigation";

export default function Login() {
    // 初期化
    const initialFormState: LoginFormState = {
        email: '',
        password: '',
    }

    const router = useRouter();
    const [formData, setFormData] = useState<LoginFormState>(initialFormState);
    const [loginError, setLoginError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        // エラーをリセット
        setLoginError(null)

        e.preventDefault();

        try {
            await executeLogin(formData)
        } catch (error: unknown) {
            setLoginError("メールアドレスまたはパスワードが違います。");
        }

        // ログイン時にエラーが無かったら画面遷移
        if(loginError){
            router.push('/dashboard');
        }

    }

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ maxWidth: 400, margin: 'auto', padding: 3 }}
        >
            <Typography variant="h5" gutterBottom>ログイン</Typography>
            {loginError && <Typography variant="inherit" style={{ color: 'red' }}>{loginError}</Typography>}
            <FormControl fullWidth margin="normal">
                <FormLabel htmlFor="email-input">メールアドレス</FormLabel>
                <TextField
                    id="email-input"
                    fullWidth
                    multiline // 複数行を有効化
                    size="small"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    aria-label="メールアドレス"
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
            <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{ mt: 3 }}
            >
                ログイン
            </Button>
        </Box>
    );
}