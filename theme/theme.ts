import { createTheme } from "@mui/material";

const main_theme = createTheme({
    palette: {
        primary: {
            main: '#FF69B4',
            contrastText: '#ffffffff',
        },
        background: {
            default: '#bdbdbd',
        },
        text: { primary: '#FF7F50' },
    },
});

export default main_theme;