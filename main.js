import express from "express";
import dotenv from "dotenv";

import { GoogleGenerativeAI } from "@google/generative-ai";

import { livros } from "./mock/livros.mock.js";
import { conhecimento } from "./mock/conhecimento.mock.js";
import { personalidade } from "./mock/personalidade.mock.js";

dotenv.config();

const app = express();
app.use(express.json());

app.post("/conversation", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).send({ error: "Informe alguma mensagem!" });
    }

    const genAI = new GoogleGenerativeAI(process.env.API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Você agora é o atendente virtual de chatbot da Livraria Universitária da UEPB. Seu objetivo é responder de forma rápida, educada e objetiva às perguntas dos compradores, fornecendo informações sobre o comércio.

    Responda a seguinte mensagem ${message}, com base nas informações abaixo: 

    Regras:
    - Livros disponíveis: ${JSON.stringify(livros, null, 2)}
    - Personalidade do atendente: ${JSON.stringify(personalidade, null, 2)}
    - Conhecimento sobre o comércio: ${JSON.stringify(conhecimento, null, 2)}
    `;

    const result = await model.generateContent(prompt);
    const responseText =
      result.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Erro ao gerar resposta.";

    res.status(200).send(responseText);
  } catch (error) {
    console.error("Error generating response:", error);
    res
      .status(500)
      .send({ error: "An error occurred while generating the response." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`SERVER IS RUNNING: listening on port ${PORT}!`);
});