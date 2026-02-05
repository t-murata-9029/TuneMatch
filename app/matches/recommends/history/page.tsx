import HistoryList from "@/features/routes/matches/history/components/HistoryList";
import MatchBar from "@/features/routes/matches/recommends/components/MatchBar";
import { Stack } from "@mui/material";

export default function historyPage() {
    return (
        <>
            <Stack spacing={2} sx={{ p: 2 }}>
                <MatchBar />
                <HistoryList />
            </Stack>
        </>
    )
}