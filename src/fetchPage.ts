import axios from 'axios';

export async function fetchPage(url: string): Promise<string | undefined> {
    try {
        const html = await axios.get(url)
        return html.data
    } catch (error: any) {
        console.error(`There was an error with ${error.config?.url}.`);
        console.error(error.toJSON());
    }
}
