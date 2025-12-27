import { Handler } from "@netlify/functions";
import fetch from "node-fetch";

export const handler: Handler = async (event) => {
  try {
    const { text, lang } = event.queryStringParameters || {};

    if (!text || !lang) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": "inline",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ error: "Missing parameters" }),
      };
    }

    const googleTTSUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${lang}&q=${encodeURIComponent(
      text
    )}`;

    const response = await fetch(googleTTSUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": "inline",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ error: "Google API Error" }),
      };
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Audio = buffer.toString("base64");

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": "inline",
        // 2. Allow the browser to read this response
        "Access-Control-Allow-Origin": "*",
      },
      body: base64Audio,
      isBase64Encoded: true,
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": "inline",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
