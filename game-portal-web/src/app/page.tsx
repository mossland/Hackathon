import dynamic from 'next/dynamic';

import Storage from './Storage';
import { GameListViewLoading } from './GameListView';

export default function Home({ searchParams }: { searchParams: { token?: string } }) {
  const token = searchParams.token ?? '';
  const GameListView = dynamic(() => import('./GameListView'), { ssr: false, loading: GameListViewLoading });

  return (
    <>
      <Storage token={token} />
      <GameListView />
    </>
  );
}
