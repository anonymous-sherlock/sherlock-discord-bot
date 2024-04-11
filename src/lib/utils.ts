// LowerCase Conversion 
export const convertTolowerCase = (text: string) => {
    return text.toLowerCase();
}

// Pure Alphabets extraction 
export const removeNonAlpha = (text: string) => {
    // This specific Regex means that replace all 
    //non alphabets with empty string. 
    return text.replace(/[^a-zA-Z\s]+/g, '');
}

export function extractUrls(text: string): { urls: string[], textWithoutUrls: string } {
    // Extract URLs using regular expression
    const urls = text.match(/\bhttps?:\/\/\S+/gi) || [];
    // Remove URLs from the text
    const textWithoutUrls = text.replace(/\bhttps?:\/\/\S+/gi, '');
    return { urls, textWithoutUrls };
}

function splitResponse(response: string) {
    const maxChunkLength = 2000;
    let chunks = [];
    for (let i = 0; i < response.length; i += maxChunkLength) {
        chunks.push(response.substring(i, i + maxChunkLength));
    }
    return chunks;
}