import dynamic from 'next/dynamic';

import { GameListViewLoading } from './GameListView';

export default function Home({ searchParams }: { searchParams: { token?: string } }) {
  const token = searchParams.token ?? '';
  const GameListView = dynamic(() => import('./GameListView'), { ssr: false, loading: GameListViewLoading });
  const Storage = dynamic(() => import('./Storage'), { ssr: false });

  return (
    <>
      <Storage token={token} />
      <GameListView />
    </>
  );
}
