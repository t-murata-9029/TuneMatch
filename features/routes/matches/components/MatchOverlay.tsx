// MatchOverlay.tsx
import { Box, Typography, Fade } from '@mui/material';
import { User } from '@/types/db'

interface MatchOverlayProps {
    // targetUser は User 型であることを指定
    targetUser: User | null; // nullを許容する場合は| nullを付けます
}

const MatchOverlay = ({ targetUser }: MatchOverlayProps) => (
    // targetUser (マッチした相手の情報) は必須ではないですが、
    // マッチ画面で相手の名前などを表示したい場合は使えます。
    <Fade in={true} timeout={1000}>
        <Box
            sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 9999,
                backgroundColor: 'rgba(255, 69, 0, 0.95)', // 派手な背景色
                display: 'flex',
                flexDirection: 'column', // 縦に並べる
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <Typography
                variant="h1"
                sx={{
                    fontSize: { xs: '15vw', md: '10vw' },
                    fontWeight: '900',
                    color: 'white',
                    textShadow: '5px 5px 10px rgba(0,0,0,0.5)',
                    animation: 'pulse 1.5s infinite',
                    '@keyframes pulse': {
                        '0%': { transform: 'scale(1)', opacity: 1 },
                        '50%': { transform: 'scale(1.05)', opacity: 0.9 },
                        '100%': { transform: 'scale(1)', opacity: 1 },
                    }
                }}
            >
                MATCH!!!
            </Typography>
            {targetUser && (
                <Typography variant="h4" color="white" mt={4}>
                    {targetUser.username}さんとマッチしました！
                </Typography>
            )}
        </Box>
    </Fade>
);

export default MatchOverlay;