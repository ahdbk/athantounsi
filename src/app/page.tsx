import VideoPlayer from '@/components/VideoPlayer';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Milestone Video Player
        </h1>
        <VideoPlayer />
      </div>
    </div>
  );
}
