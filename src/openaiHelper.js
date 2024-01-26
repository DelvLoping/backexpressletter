import OpenAI from "openai";

import { getEncoding } from "js-tiktoken";
const encoding = getEncoding("cl100k_base");

const contexteGlobal = {
  role: "system",
  content:
    "Vous êtes un service en ligne spécialisé dans la création de lettres personnalisées à envoyer par boîte postale, tes réponses seront au format d'éditeur QuillJS qui utilise par exemple les balises (HTML) suivantes : <p>,<s>,<br>,<h1>,<h2>,<h4>,<u>,<ol>,<li>,<ul>,<em>,<strong>,<a>,<img> et les classes(CSS) suivantes : 'ql-align-justify', 'ql-align-right', 'ql-align-center', 'ql-align-center', 'ql-align-center', 'ql-align-right', 'ql-indent-1', 'ql-indent-2'. Tu peux par exemple commencer avec les informations de l'expéditeur <p class='ql-align-left'>expéditeur adresse </p>. Tu peux aussi faire le destinataire avec la classe ql-align-right <p class='ql-align-right'>destinataire adresse </p>, et faire l'objet en gras comme ceci <p><strong>Objet [objet de la lettre]: </strong> </p>. Surtout tu dois garder les balises images"
};
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const applySystemOnContext = (context) => {
  if (!context[0] || context[0].content !== contexteGlobal.content) {
    if (context[0]?.role === "system") {
      context[0] = contexteGlobal;
    } else {
      context.unshift(contexteGlobal);
    }
  }
  return context;
};

const trimContextHistory = (context) => {
  if (context.length > 2) {
    context = context.slice(context.length - 1, context.length);
  }
  return context;
};

const calculateTokenUsage = (messages) => {
  let numTokens = 0;

  for (const message of messages) {
    // Calculate tokens for message structure
    numTokens += 4; // <role/name>\n{content}\n
    for (const [key, value] of Object.entries(message)) {
      numTokens += encoding.encode(value).length;
      if (key === "name") numTokens -= 1; // Subtract 1 for role, which is always 1 token
    }
  }

  // Additional tokens for reply primed with <im_start>assistant
  numTokens += 2;

  return numTokens;
};

async function callAPIOpenAI(texte, context = []) {
  let newContext = context;
  newContext = trimContextHistory(newContext);
  newContext = applySystemOnContext(newContext);

  if (texte) {
    newContext.push({ role: "user", content: texte });

    const requestBody = {
      model: "gpt-3.5-turbo",
      messages: newContext,
      stop: null,
      stream: false,
    };

    try {
      // Check token usage
      const tokenUsage = calculateTokenUsage(newContext);
      const tokenPrice = 0.001;
      console.log(tokenUsage, (tokenUsage / 1000) * tokenPrice + "$");
      if (tokenUsage > 5000) {
        return "token limit exceeded";
      }

      // Call the OpenAI API
      const response = await openai.chat.completions.create(requestBody);
      newContext.push(response.choices[0].message);
      return newContext;
    } catch (error) {
      console.error("Error from OpenAI API :" + error.message);
      throw error;
    }
  } else {
    console.error("Prompt is empty");
    throw new Error("Prompt is empty");
  }
}

export { callAPIOpenAI };
