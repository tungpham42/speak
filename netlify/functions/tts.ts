import { Handler } from "@netlify/functions";
import axios from "axios";

export const handler: Handler = async (event) => {
  const { text, lang } = event.queryStringParameters || {};

  if (!text || !lang) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing parameters" }),
    };
  }

  try {
    // Gọi đến Google TTS
    // client=tw-ob: Client public của Google
    // tl=ja: Target language là tiếng Nhật
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${lang}&q=${encodeURIComponent(
      text
    )}`;

    const response = await axios.get(url, {
      responseType: "arraybuffer", // Quan trọng: nhận về dữ liệu nhị phân
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Access-Control-Allow-Origin": "*", // Giả lập trình duyệt để tránh bị chặn
      },
    });

    // Chuyển đổi buffer sang base64 để gửi về frontend
    const audioBase64 = Buffer.from(response.data, "binary").toString("base64");

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        audioContent: `data:audio/mpeg;base64,${audioBase64}`,
      }),
    };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: "Error fetching audio" };
  }
};
