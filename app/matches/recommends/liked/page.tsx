import LikedList from "@/features/routes/matches/liked/components/LikedList";
import MatchBar from "@/features/routes/matches/recommends/components/MatchBar";

export default function likedPage(){
    return(
        <>
            <MatchBar />
            <LikedList />
        </>
    );
}