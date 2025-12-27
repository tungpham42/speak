import { Handler } from "@netlify/functions";
import axios from "axios";

export const handler: Handler = async (event) => {
  try {
    const { text, lang } = event.queryStringParameters || {};

    if (!text || !lang) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing parameters" }),
      };
    }

    const googleTTSUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${lang}&q=${encodeURIComponent(
      text
    )}`;

    // 2. Fetch binary data from Google
    const response = await axios.get(googleTTSUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      responseType: "arraybuffer", // Important for backend handling
    });

    // 3. Convert to Base64 for Netlify response
    const base64Audio = Buffer.from(response.data, "binary").toString("base64");

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Access-Control-Allow-Origin": "*", // CORS Allow
      },
      body: base64Audio,
      isBase64Encoded: true,
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
