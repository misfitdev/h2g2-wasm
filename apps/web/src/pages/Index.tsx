import { Terminal } from '@/components/Terminal';
import { FishEasterEgg } from '@/components/FishEasterEgg';

const Index = () => {
  if (new URLSearchParams(window.location.search).get('ee') === 'fish') {
    return <FishEasterEgg />;
  }

  return (
    <main className="h-screen w-screen overflow-hidden bg-background">
      <Terminal />
    </main>
  );
};

export default Index;
