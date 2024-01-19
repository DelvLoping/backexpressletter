import OpenAI from "openai";

const contexteGlobal = {
  role: "system",
  content:
    "Vous êtes un service en ligne spécialisé dans la création de lettres personnalisées à envoyer par boîte postale.",
};
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function callAPIOpenAI(texte, context = []) {
  let contexteLocal = context;
  if (
    !contexteLocal[0] ||
    contexteLocal[0].content !== contexteGlobal.content
  ) {
    if (contexteLocal[0]?.role === "system") {
      contexteLocal[0] = contexteGlobal;
    } else {
      contexteLocal.unshift(contexteGlobal);
    }
  }
  if (texte) {
    contexteLocal.push({ role: "user", content: texte });

    const requestBody = {
      model: "gpt-3.5-turbo",
      messages: contexteLocal,
      stop: null,
    };

    try {
      //   const response = await openai.chat.completions.create(requestBody);
      //   contexteLocal.push(response.choices[0].message);
      contexteLocal.push({
        role: "assistant",
        content: "Je suis un assistant",
      });
      return contexteLocal;
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
