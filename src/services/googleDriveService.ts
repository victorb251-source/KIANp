
declare const gapi: any;
declare const google: any;

const SCOPES = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly';
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];
const APP_DATA_FILE_NAME = 'kian_app_data.json';

let tokenClient: any;
let gapiInited = false;
let gisInited = false;

export const initGoogleDrive = async (clientId: string, onInitCallback: () => void) => {
    return new Promise<void>((resolve, reject) => {
        const checkGapi = () => {
             if ((window as any).gapi) {
                 gapi.load('client', async () => {
                    await gapi.client.init({
                        clientId: clientId,
                        discoveryDocs: DISCOVERY_DOCS,
                    });
                    gapiInited = true;
                    if (gisInited) onInitCallback();
                    resolve();
                 });
             } else {
                 setTimeout(checkGapi, 100);
             }
        };
        checkGapi();

        const checkGis = () => {
            if ((window as any).google) {
                tokenClient = google.accounts.oauth2.initTokenClient({
                    client_id: clientId,
                    scope: SCOPES,
                    callback: '', // defined at request time
                });
                gisInited = true;
                if (gapiInited) onInitCallback();
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
            // Fetch user info using GAPI
            try {
                // We use drive about to get user info if OIDC is not fully implemented in this simple flow
                const about = await gapi.client.drive.about.get({ fields: "user" });
                resolve(about.result.user);
            } catch (e) {
                console.warn("Could not fetch detailed user info", e);
                resolve({ displayName: "Usuário", emailAddress: "Conta Google", photoLink: "" });
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

export const listPdfs = async (): Promise<any[]> => {
    try {
        const response = await gapi.client.drive.files.list({
            'pageSize': 20,
            'fields': "nextPageToken, files(id, name, mimeType, thumbnailLink)",
            'q': "mimeType = 'application/pdf' and trashed = false"
        });
        return response.result.files;
    } catch (err) {
        console.error("Error listing files", err);
        throw err;
    }
};

export const getFileContent = async (fileId: string): Promise<ArrayBuffer> => {
    try {
        const response = await gapi.client.drive.files.get({
            fileId: fileId,
            alt: 'media'
        });
        // GAPI returns body in response.body, but for binary we might need a workaround or specific fetch
        // GAPI client is text based usually. For binary large files, better use fetch with the token.
        const token = gapi.client.getToken().access_token;
        const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return await res.arrayBuffer();
    } catch (err) {
        console.error("Error getting file content", err);
        throw err;
    }
};

// --- APP DATA SYNC ---

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
