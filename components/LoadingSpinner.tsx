export default function LoadingSpinner() {
    return (
        <div className="flex justify-center items-center min-h-[85vh]">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-pink-500 border-t-transparent" />
        </div>
    );
}