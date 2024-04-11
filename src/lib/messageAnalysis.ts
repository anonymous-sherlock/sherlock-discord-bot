import natural from "natural";
import { removeStopwords } from 'stopword';
import dataSet from "../data/promotional.json";
import wordDictionary from "../data/word-dict.json";
import { convertTolowerCase, extractUrls, removeNonAlpha } from "./utils";
import * as tf from '@tensorflow/tfjs'
const wordDict: Record<string, string> = wordDictionary
type PromotionDataSetType = {
    v1: "spam" | "ham",
    v2: string
}
const data: PromotionDataSetType[] = dataSet as PromotionDataSetType[]


// Contractions to standard lexicons Conversion 
const convertToStandard = (text: string) => {
    const data = text.split(' ');
    data.forEach((word, index) => {
        Object.keys(wordDict).forEach(key => {
            if (key === word.toLowerCase()) {
                data[index] = wordDict[key]
            };
        });
    });
    return data.join(' ');
}

// Convert text data into numerical vectors
// Convert text data into numerical vectors
function textToVector(text: string) {
    // Perform preprocessing steps
    const tokenConstructor = new natural.WordTokenizer();
    const tokenizedData = tokenConstructor.tokenize(text);
    if (!tokenizedData) return [];
    const filteredData = removeStopwords(tokenizedData);
    // Convert tokens to numerical vectors (e.g., TF-IDF)
    const vector = filteredData.map(token => {
        // Convert token to numerical value (e.g., TF-IDF score)
        return Number(token);
    });
    // Pad the vector to ensure it has the correct shape
    const paddedVector = vector.concat(Array.from({ length: 5572 - vector.length }, () => 0));
    return paddedVector;
}


const model = tf.sequential({
    layers: [
        tf.layers.dense({ inputShape: [5572], units: 32, activation: 'relu6' }),
        tf.layers.dense({ units: 10, activation: 'softmax' }),
    ]
});
// Compile the model
model.compile({
    optimizer: 'adam',
    loss: 'binaryCrossentropy',
    metrics: ['accuracy']
});

const texts = data.map(entry => entry.v2.toString().toLowerCase());
const vectors = data.map(entry => textToVector(entry.v2.toString().toLowerCase()));
const labels = data.map(entry => entry.v1 === 'spam' ? 1 : 0);
// Convert arrays to tensors
const xTrain = tf.tensor2d(vectors as Array<Array<number>>);
// Convert labels to one-hot encoded format
const numClasses = 2; // Assuming 2 classes: spam and ham
const yTrain = tf.oneHot(tf.tensor1d(labels, 'int32'), numClasses);
async function trainModel() {
    await model.fit(xTrain, yTrain, {
        epochs: 10,
        batchSize: 32,
        validationSplit: 0.2,
        callbacks: {
            onEpochEnd: (epoch, logs) => {
                console.log(`Epoch ${epoch + 1}: Loss - ${logs?.loss}, Accuracy - ${logs?.acc}`);
            }
        }
    });
    console.log('Model training completed.');
}

// trainModel();

export async function getMessageAnalysis(text: string) {
    // Expand contractions
    const expandedText = convertToStandard(text);
    console.log("Lexed Data: ", expandedText);
    const { urls, textWithoutUrls } = extractUrls(expandedText)
    console.log("urls: ", urls);
    // Convert to lowercase
    const lowerCaseData = convertTolowerCase(textWithoutUrls);
    console.log("LowerCase Format: ", lowerCaseData);
    // Remove non alphabets and special characters 
    const onlyAlpha = removeNonAlpha(textWithoutUrls);
    // Tokenization
    const tokenConstructor = new natural.WordTokenizer();
    const tokenizedData = tokenConstructor.tokenize(onlyAlpha);
    console.log("Tokenized Data: ", tokenizedData);
    if (!tokenizedData) return;
    // Remove Stopwords 
    const filteredData = removeStopwords(tokenizedData);
    console.log("After removing stopwords: ", filteredData);
    // Stemming 
    const Sentianalyzer = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');
    const analysis_score = Sentianalyzer.getSentiment(filteredData);
    console.log("Sentiment Score: ", analysis_score);
    return analysis_score
}
