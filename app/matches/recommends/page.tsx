
import MatchBar from "@/features/routes/matches/recommends/components/MatchBar";
import RecommendsList from "@/features/routes/matches/recommends/components/RecommendsList";
import { Stack } from "@mui/material";

export default function page() {

    return (
        <>
            <Stack spacing={2} sx={{ p: 2 }}>
                <MatchBar />
                <RecommendsList />
            </Stack>
        </>
    )
}