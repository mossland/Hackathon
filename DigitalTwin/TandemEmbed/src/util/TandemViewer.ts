export default class TandemViewer {
    private static _instance: TandemViewer;
    public static get instance(): TandemViewer {
        if (!TandemViewer._instance) {
            TandemViewer._instance = new TandemViewer();
        }
        return TandemViewer._instance;
    }

    public isInitialized: boolean = false;
    public viewer: any;
    public app: any;

    constructor() { }

    public async initialize(div: HTMLElement): Promise<void> {
        if (this.isInitialized) {
            return;
        }

        await this.initializeViewer(div);
        this.isInitialized = true;
    }

    private async initializeViewer(div: HTMLElement): Promise<void> {
        // Open Tandem Viewer
        const options = {
            env: "DtProduction",
            api: 'dt',
            productId: 'Digital Twins',
            corsWorker: true,
            accessToken: import.meta.env.VITE_TANDEM_ACCESS_TOKEN,
            useLocalStorage: false,
        };

        const av = (window as any).Autodesk.Viewing;
        await new Promise<void>((resolve) => {
            av.Initializer(options, async () => {
                this.viewer = new av.GuiViewer3D(div, {
                    extensions: ['Autodesk.BoxSelection'],
                    screenModeDelegate: av.NullScreenModeDelegate,
                    theme: 'dark-theme',
                });
                await this.viewer.start();
                
                av.endpoint.HTTP_REQUEST_HEADERS['Authorization'] = `Bearer ${import.meta.env.VITE_TANDEM_ACCESS_TOKEN}`;
                this.app = new (window as any).Autodesk.Tandem.DtApp();
                (window as any).DT_APP = this.app;
                resolve();
            });
        });
    }

    async fetchFacilities() {
        const FacilitiesSharedWithMe = await this.app.getCurrentTeamsFacilities();
        const myFacilities = await this.app.getUsersFacilities();
        return [].concat(FacilitiesSharedWithMe, myFacilities);
    }

    async openFacility(facility: any) {
        await this.app.displayFacility(facility, false, this.viewer);
    }
}