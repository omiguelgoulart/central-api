import { UploadApiResponse } from "cloudinary";

import { cloudinary } from "../lib/cloudinary";

export function uploadCloudinary(
  buffer: Buffer,
  folder: string
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result) {
          reject(new Error("Falha ao enviar imagem para o Cloudinary."));
          return;
        }

        resolve(result);
      }
    );

    stream.end(buffer);
  });
}