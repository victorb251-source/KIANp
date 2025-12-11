

declare const gapi: any;
declare const google: any;

const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];
const APP_DATA_FILE_NAME = 'kian_app_data.json';

let tokenClient: any;
let gapiInited = false;
let gisInited = false;

// Dynamically load Google scripts
const loadScript = (src: string, id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (document.getElementById(id)) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.id = id;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load script ${src}`));
        document.body.appendChild(script);
    });
};

export const initGoogleDrive = async (clientId: string) => {
    // Load scripts first if not present
    await loadScript('https://apis.google.com/js/api.js', 'gapi-script');
    await loadScript('https://accounts.google.com/gsi/client', 'gis-script');

    return new Promise<void>((resolve, reject) => {
        const checkGapi = () => {
             if ((window as any).gapi) {
                 gapi.load('client', async () => {
                    try {
                        await gapi.client.init({
                            clientId: clientId,
                            discoveryDocs: DISCOVERY_DOCS,
                        });
                        gapiInited = true;
                        if (gisInited) resolve();
                    } catch (e) {
                        reject(e);
                    }
                 });
             } else {
                 setTimeout(checkGapi, 100);
             }
        };
        checkGapi();

        const checkGis = () => {
            if ((window as any).google) {
                try {
                    tokenClient = google.accounts.oauth2.initTokenClient({
                        client_id: clientId,
                        scope: SCOPES,
                        callback: '', // defined at request time
                    });
                    gisInited = true;
                    if (gapiInited) resolve();
                } catch (e) {
                    reject(e);
                }
            } else {
                setTimeout(checkGis, 100);
            }
        };
        checkGis();
    });
};

export const signIn = async (): Promise<any> => {
    return new Promise((resolve, reject) => {
        if (!tokenClient) return reject("Google Client not initialized");
        
        tokenClient.callback = async (resp: any) => {
            if (resp.error) {
                reject(resp);
            }
            try {
                // Get user info
                const about = await gapi.client.drive.about.get({ fields: "user" });
                resolve(about.result.user);
            } catch (e) {
                console.warn("Could not fetch user info", e);
                // Fallback user if API fails but token works
                resolve({ displayName: "Usuário Conectado", emailAddress: "", photoLink: "" });
            }
        };
        
        if (gapi.client.getToken() === null) {
            tokenClient.requestAccessToken({ prompt: 'consent' });
        } else {
            tokenClient.requestAccessToken({prompt: ''});
        }
    });
};

export const signOut = () => {
    const token = gapi.client.getToken();
    if (token !== null) {
        google.accounts.oauth2.revoke(token.access_token);
        gapi.client.setToken('');
    }
};

// Find the data file in Drive
export const findAppDataFile = async (): Promise<string | null> => {
    try {
        const response = await gapi.client.drive.files.list({
            q: `name = '${APP_DATA_FILE_NAME}' and trashed = false`,
            fields: 'files(id, name)',
            spaces: 'drive'
        });
        const files = response.result.files;
        if (files && files.length > 0) {
            return files[0].id;
        }
        return null;
    } catch (e) {
        console.error("Error finding app data file", e);
        return null;
    }
};

// Create the data file
export const createAppDataFile = async (data: any): Promise<string> => {
    const fileContent = JSON.stringify(data);
    const metadata = {
        name: APP_DATA_FILE_NAME,
        mimeType: 'application/json',
    };
    
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', new Blob([fileContent], { type: 'application/json' }));

    const token = gapi.client.getToken().access_token;
    
    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form
    });
    const result = await response.json();
    return result.id;
};

// Update the data file
export const updateAppDataFile = async (fileId: string, data: any) => {
     const fileContent = JSON.stringify(data);
     const token = gapi.client.getToken().access_token;
     
     await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
        method: 'PATCH',
        headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: fileContent
    });
};

// Load data from the file
export const loadAppData = async (fileId: string): Promise<any> => {
    try {
        const token = gapi.client.getToken().access_token;
        const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return await res.json();
    } catch (e) {
        console.error("Error loading app data", e);
        throw e;
    }
};

// List PDF files
export const listPdfs = async (): Promise<any[]> => {
    try {
        // Ensure we have a token or valid session
        const token = gapi.client.getToken();
        if (!token) {
            // Attempt to use tokenClient to get a token if silent auth is possible, 
            // but usually this function is called after user is signed in.
            // Returning empty list or throwing error is appropriate.
            console.warn("No access token available for listing PDFs");
            return [];
        }

        const response = await gapi.client.drive.files.list({
            q: "mimeType='application/pdf' and trashed = false",
            fields: 'files(id, name, mimeType, thumbnailLink)',
            spaces: 'drive',
            pageSize: 50,
            orderBy: 'modifiedTime desc'
        });
        return response.result.files || [];
    } catch (e) {
        console.error("Error listing PDFs", e);
        throw e;
    }
};
