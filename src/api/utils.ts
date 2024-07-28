import { createWriteStream } from "fs";
import { pipeline } from "stream";
import { promisify } from "util";
import axios from "axios";

const streamPipeline = promisify(pipeline);

async function downloadImage(url: string, outputPath: string): Promise<void> {
  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
  });
  if (response.status !== 200) {
    throw new Error(`Failed to fetch image from ${url}: ${response.statusText}`);
  }

  await streamPipeline(response.data, createWriteStream(outputPath));
}

export { downloadImage };
