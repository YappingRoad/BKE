export default class File {
    static async save(blob: Blob, name: string) {
        if ('showSaveFilePicker' in window && window.self === window.top) { // Feature detection
            try {
                const handle = await ((window as any).showSaveFilePicker({ suggestedName: name }) as Promise<any>);
                const writable = await handle.createWritable();
                await writable.write(blob);
                await writable.close();
            } catch (error) {
                console.error('Error saving file:', error);
            }
        } else {
            // Fallback for older browsers or iframes
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }


    }
}