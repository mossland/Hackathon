import { useEffect, useRef, useState } from 'react';

import TandemClient from './util/TandemClient';
import TandemViewer from './util/TandemViewer';
import ConnectionConfigManager, { IConnectionConfig } from './util/ConnectionConfigManager';

import styles from './App.module.scss';
import './App.scss'

export interface IStreamData {
	metadata: IConnectionConfig;
	value: any[];
}


function App() {
	const [tandemViewer, setTandemViewer] = useState<TandemViewer | null>(null);

	const [showUi, setShowUi] = useState<boolean>(true);
	const [streamData, setStreamData] = useState<IStreamData | null>(null);

	const viewerRef = useRef<HTMLDivElement>(null);
	function corruptedStringToUint8Array(str: string) {
		const uint8Array = new Uint8Array(str.length * 2);
		for (let i = 0; i < str.length; i++) {
			const code = str.charCodeAt(i);
			uint8Array[i * 2] = code & 0xFF;
			uint8Array[i * 2 + 1] = (code >> 8) & 0xFF;
		}
		return uint8Array;
	}
	function uint8ToBase64Url(uint8Array: Uint8Array) {
		let binary = '';
		uint8Array.forEach((byte: number) => binary += String.fromCharCode(byte));
		const base64 = btoa(binary);
		return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
	}
	function getClassNameByDbId(dbId: number, dbId2Class: any) {
		const { sid2idx, buf, idx } = dbId2Class;
		const classIdx = sid2idx[dbId] - 1; // dbId로 클래스 인덱스 얻기
		if (classIdx < 0) {
			return '';
		}
		const start = idx[classIdx];    // 시작 위치
		const end = idx[classIdx + 1];  // 끝 위치
		return buf.substring(start, end); // 클래스 이름 추출
	}

	useEffect(() => {
		const initTandemViewer = async () => {
			await ConnectionConfigManager.instance.loadData();
			if (!tandemViewer) {
				return;
			}
			await tandemViewer.initialize(viewerRef.current as HTMLElement);
			const facilityList = await tandemViewer.fetchFacilities();
			await tandemViewer.openFacility(facilityList[0]);
			// console.log(Object.keys(tandemViewer.viewer.listeners));
			tandemViewer.viewer.listeners['aggregateSelection'].push({
				once: false,
				priority: 0,
				callbackFn: async (e: any) => {
					if (e.selections.length > 0) {
						const model = e.selections[0].model;
						const dbId = e.selections[0].dbIdArray[0];
						console.log(`modelId: ${model.modelFacets.id}`);
						console.log(`modelUrn: ${model.modelFacets.modelUrn}`);
						console.log(`dbId: ${dbId}`);

						let extId = '';
						(model.myData.autoDbIds.extIdToIndex as Map<string, number>).forEach((value, key) => {
							if (value === dbId) {
								extId = uint8ToBase64Url(corruptedStringToUint8Array(key));
							}
						});
						console.log(`extId: ${extId}`);

						const className = getClassNameByDbId(dbId, model.myData.dbId2Class);
						console.log(`className: ${className}`);

						const data = await TandemClient.instance.scanModel(model.modelFacets.modelUrn);
						const scanData = data.filter((d) => {
							if (typeof d === 'string') {
								return false;
							} else {
								if (d.k && d.k === extId) {
									return true;
								}
							}
						});
						console.log(scanData);
						const conn = scanData.map((sd) => {
							const connectionConfig: IConnectionConfig[] = [];
							Object.values(sd).filter((sdv: any[]) => {
								if (typeof sdv[0] === typeof 'string') {
									const config = ConnectionConfigManager.instance.fetchDataFromName(sdv[0]);
									if (config.length > 0) {
										config.forEach((c) => {
											connectionConfig.push(c);
										});
									};
									return config.length > 0;
								} else {
									return false;
								}
							});
							return connectionConfig;
						});
						const connList = conn.reduce((acc: IConnectionConfig[], c) => {
							acc.push(...c);
							return acc;
						}, []);

						if (connList.length > 0) {
							console.log(connList[0]);
							const streamData = await TandemClient.instance.getStreamData(connList[0], model.modelFacets.modelUrn);
							if (streamData) {
								setStreamData({
									metadata: connList[0],
									value: streamData,
								});
								setShowUi(true);
							}
						}
					}
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

		return () => {
			if (tandemViewer) {
				tandemViewer.viewer.listeners['aggregateSelection'].forEach((listener: any) => {
					listener.callbackFn = () => { };
				});
			}
		}
	}, [tandemViewer]);

	return (
		<>
			<div className={styles.viewerContainer}>
				<div id={styles.viewer} ref={viewerRef}></div>
			</div>
			{
				showUi && (
					<div className={styles.uiContainer}>
						{
							streamData ?
								<div className={styles.uiCard}>
									<div className={styles.cardHead}>
										<h1>{streamData?.metadata.Name}</h1>
										<div className={styles.subtitle}>
											{streamData?.metadata["Assembly Code"]} / {streamData?.metadata["Classification"]} / {streamData?.metadata.fullId}
										</div>
									</div>
									<div className={styles.cardBody}>
										<div className={styles.cardBodyItem}>
											<h2>Temperature</h2>
											<p>
												{JSON.stringify(streamData?.value)}
											</p>
										</div>
									</div>
								</div>
							:
								null
						}

					</div>
				)
			}

		</>
	)
}

export default App
