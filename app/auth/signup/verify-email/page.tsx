    import { Box, Typography } from "@mui/material";
    interface SearchPageProps {
        searchParams: {
            [key: string]: string | string[] | undefined;
        };
    }

    export default async function SearchPage({ searchParams }: SearchPageProps) {
        const email = searchParams.email;

        return (
            <Box>
                <Typography>{email}あてにメールを送信しました。</Typography>
                <Typography>メールボックスを確認して認証してください。</Typography>
            </Box>
        );
    }