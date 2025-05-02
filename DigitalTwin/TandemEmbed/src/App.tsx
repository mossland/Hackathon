import { useEffect, useRef, useState } from 'react';

import TandemViewer from './util/TandemViewer';

import styles from './App.module.scss';
import './App.scss'

function App() {
	const [ tandemViewer, setTandemViewer ] = useState<TandemViewer | null>(null);
	const viewerRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const initTandemViewer = async () => {
			if (!tandemViewer) {
				return;
			}
			await tandemViewer.initialize(viewerRef.current as HTMLElement);
			const facilityList = await tandemViewer.fetchFacilities();
			await tandemViewer.openFacility(facilityList[0]);
			
			tandemViewer.viewer.listeners['aggregateSelection'].push({
				once: false,
				priority: 0,
				callbackFn: (e: any) => {
					console.log('==========');
					console.log(e)
					console.log('==========');
				},
			});
		};
		if (!tandemViewer) {
			const v = TandemViewer.instance;
			setTandemViewer(_ => v);
			(window as any).tandemViewer = v;
		} else if (!tandemViewer.isInitialized) {
			initTandemViewer();
		}
	}, [tandemViewer]);

	return (
		<>
			<div className={styles.viewerContainer}>
				<div id={styles.viewer} ref={viewerRef}></div>
			</div>
		</>
	)
}

export default App
