import LikedList from "@/features/routes/matches/liked/components/LikedList";
import MatchBar from "@/features/routes/matches/recommends/components/MatchBar";
import { Box, Stack } from "@mui/material";

export default function likedPage() {
    return (
        <>
            <Stack spacing={2} sx={{ p: 2 }}>
                <MatchBar />
                <LikedList />
            </Stack>
        </>
    );
}