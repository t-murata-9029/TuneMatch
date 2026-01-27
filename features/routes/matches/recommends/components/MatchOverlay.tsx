import { Box, Typography, Fade, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { User } from "@/types/db";
import { Dispatch, SetStateAction, useEffect } from "react";

interface MatchOverlayProps {
    targetUser: User | null;
    setIsMatched: Dispatch<SetStateAction<string | null>>;
}

const MatchOverlay = ({ targetUser, setIsMatched }: MatchOverlayProps) => {

    // ⏱ 3秒後に自動クローズ
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsMatched(null);
        }, 3000);

        return () => clearTimeout(timer);
    }, [setIsMatched]);

    return (
        <Fade in={true} timeout={1000}>
            <Box
                sx={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 9999,
                    backgroundColor: "rgba(255, 69, 0, 0.95)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Typography
                    variant="h1"
                    sx={{
                        fontSize: { xs: "15vw", md: "10vw" },
                        fontWeight: 900,
                        color: "white",
                        textShadow: "5px 5px 10px rgba(0,0,0,0.5)",
                    }}
                >
                    MATCH!!!
                </Typography>

                {targetUser && (
                    <Typography variant="h4" color="white" mt={4}>
                        {targetUser.username}さんとマッチしました！
                    </Typography>
                )}

                {/* 下中央の × ボタン */}
                <IconButton
                    onClick={() => setIsMatched(null)}
                    sx={{
                        position: "absolute",
                        bottom: 32,
                        color: "white", // IconButton 自体も白
                        border: "2px solid white",
                        width: 56,
                        height: 56,
                    }}
                >
                    <CloseIcon sx={{ color: "white" }} />  {/* ← ここが重要 */}
                </IconButton>

            </Box>
        </Fade>
    );
};

export default MatchOverlay;
