const { OpenAI } = require("openai");

async function flushStorage() {
  const openai = new OpenAI();

  const files = await openai.files.list();

  for (const file of files.data) {
    console.info(`Deleting ${file.id}`);
    openai.files.del(file.id);
  }
}

flushStorage();
