// ArtistLink.tsx
import { useRouter } from 'next/navigation';

type ArtistLinkProps = {
    artistId: string;
    artistName: string;
};

export default function ArtistLink({ artistId, artistName }: ArtistLinkProps) {
    const router = useRouter();

    const handleClick = () => {
        const artist = { artistId, artistName, albumImage: '' };
        const encoded = btoa(encodeURIComponent(JSON.stringify(artist)));
        router.push(`/search/artist?data=${encoded}`);
    };

    return (
        <span 
            onClick={handleClick}
            style={{ cursor: 'pointer', color: '#3b82f6', textDecoration: 'underline' }}
        >
            {artistName}
        </span>
    );
}