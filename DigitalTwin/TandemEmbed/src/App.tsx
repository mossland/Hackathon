import { useEffect, useRef, useState } from 'react';

import TandemClient from './util/TandemClient';
import TandemViewer from './util/TandemViewer';

import styles from './App.module.scss';
import './App.scss'


function App() {
	const classToStreamNameMap = new Map<string, string>();
	classToStreamNameMap.set('StepLED.L.B.1', 'led_r_br');
	classToStreamNameMap.set('StepLED.L.B.2', 'led_g_br');
	classToStreamNameMap.set('StepLED.L.B.3', 'led_b_br');
	classToStreamNameMap.set('StepLED.Sw', 'led_sw_pr');
	

	const [tandemViewer, setTandemViewer] = useState<TandemViewer | null>(null);
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
			if (!tandemViewer) {
				return;
			}
			await tandemViewer.initialize(viewerRef.current as HTMLElement);
			const facilityList = await tandemViewer.fetchFacilities();
			await tandemViewer.openFacility(facilityList[0]);
			console.log(Object.keys(tandemViewer.viewer.listeners));
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
					listener.callbackFn = () => {};
				});
			}
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
