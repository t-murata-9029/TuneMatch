import React from 'react';
import { Card, CardMedia, CardContent, Typography } from '@mui/material';

type TrackCardProps = {
    trackId: string;
    trackName: string;
    artistName: string;
    albumImage: string;
    onClick?: () => void;
};

export default function TrackCard({ 
    trackId, 
    trackName, 
    artistName, 
    albumImage,
    onClick 
}: TrackCardProps) {
    return (
        <Card 
            key={trackId} 
            onClick={onClick}
            sx={{ 
                height: '26vh', 
                width: '180px',
                flexShrink: 0,
                cursor: 'pointer',
                bgcolor: '#e3f2fd',
                display: 'flex',
                flexDirection: 'column',
                padding: '12px 8px 0 8px',
                '&:hover': { boxShadow: 6 } 
            }}
        >
            <CardMedia
                component="img"
                image={albumImage}
                alt={trackName}
                sx={{ 
                    height: '18vh', 
                    width: '164px',
                    objectFit: 'contain',
                    margin: '0 auto'
                }}
            />
            <CardContent sx={{ p: 1, height: '6vh', overflow: 'hidden' }}>
                <Typography
                    variant="body2"
                    sx={{
                        fontWeight: 'bold',
                        mb: 0.3,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontSize: '0.75rem'
                    }}
                >
                    {trackName}
                </Typography>
                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        display: 'block',
                        fontSize: '0.65rem'
                    }}
                >
                    {artistName}
                </Typography>
            </CardContent>
        </Card>
    );
}