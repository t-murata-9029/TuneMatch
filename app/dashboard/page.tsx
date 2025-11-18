'use client'

import * as React from 'react';

import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    CardActionArea,
    useTheme,
    Link,
    ThemeProvider,
    Button,
    CssBaseline
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import HandshakeIcon from '@mui/icons-material/Handshake';
import MessageIcon from '@mui/icons-material/Message';
import { getCurrentUser } from '@/lib/action';
import { supabase } from '@/lib/supabase.cliant';
import { useEffect, useState } from 'react';
import { error } from 'console';
import main_theme from '@/theme/theme';

const MenuPage = () => {
    const theme = useTheme();

    const [userId, setUserId] = useState("")

    useEffect(() => {
        const getUserId = async () => {
            const { data, error } = await supabase.auth.getUser();

            if (error) {
                console.log(data)
                throw error;
            }
            if (data != null) {
                setUserId(data.user.id);
            }

        };
        getUserId();
    }, []);

    // --- ナビゲーションカードデータ ---
    const navCards = [
        {
            title: 'レビュー',
            description: '聞いた曲をレビューしましょう。',
            icon: <AudiotrackIcon sx={{ fontSize: 40 }} />,
            href: '/review'
        },
        {
            title: 'マッチ',
            description: '感性をベースにマッチングします。',
            icon: <HandshakeIcon sx={{ fontSize: 40 }} />,
            href: '#'
        },
        {
            title: 'メッセージ',
            description: 'マッチした人とメッセージをします。',
            icon: <MessageIcon sx={{ fontSize: 40 }} />,
            href: '#'
        },
        {
            title: 'マイページ',
            description: 'プロフィールを確認、変更できます。',
            icon: <HomeIcon sx={{ fontSize: 40 }} />,
            href: '/user/' + userId
        },
    ];

    return (
        <ThemeProvider theme={main_theme}>
            <Box sx={{ flexGrow: 1, p: 4, bgcolor: theme.palette.grey[50], minHeight: '100vh' }}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
                    TuneMatch
                </Typography>
                <Grid container spacing={4}>
                    {navCards.map((card) => (
                        <Grid key={card.title} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                            <Link href={card.href} underline="none">
                                <Card
                                    sx={{
                                        height: '100%',
                                        transition: '0.3s',
                                        '&:hover': {
                                            boxShadow: 6,
                                            transform: 'translateY(-5px)',
                                        }
                                    }}
                                >
                                    <CardActionArea sx={{ height: '100%', p: 2 }}>
                                        <CardContent>
                                            <Box sx={{ mb: 2 }}>
                                                {card.icon}
                                            </Box>
                                            <Typography
                                                gutterBottom
                                                variant="h5"
                                                component="div"
                                                sx={{ fontWeight: '600' }}
                                            >
                                                {card.title}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {card.description}
                                            </Typography>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            </Link>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </ThemeProvider>
    );
};

export default MenuPage;