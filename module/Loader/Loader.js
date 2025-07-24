class Loader{
    constructor() {
        
    }
    async load(url) {
        let file = null;
        if (!url) throw new Error('URL is required');
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
            file =  await response;
        } catch (error) {
            console.error('File Load Error:', error);
            throw error;
        }
        return file;
    }
}