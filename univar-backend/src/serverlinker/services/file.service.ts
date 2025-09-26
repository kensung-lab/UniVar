import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FileService {
  async getFromLocal(
    filename: string,
    directory: string = null,
  ): Promise<Buffer> {
    let result = null;
    try {
      let filePath = filename;
      if (directory) {
        filePath = path.join(directory, filename);
      }

      // Read the file and return the buffer
      result = fs.promises.readFile(filePath);
    } catch (e) {
      console.log('Error!!', e);
      console.log(e);
      throw e;
    }

    return result;
  }

  async storeFilesToLocal(fileInfo: {
    filePath: string;
    fileBuffer?: Buffer;
    fileString?: string;
  }) {
    const { filePath, fileBuffer, fileString } = fileInfo;
    const folderPath = filePath.split('/').slice(0, -1).join('/');
    await fs.promises.mkdir(folderPath, { recursive: true });
    if (fileBuffer) {
      await fs.promises.writeFile(filePath, fileBuffer);
    } else if (fileString) {
      fs.writeFileSync(filePath, fileString, 'utf8');
    }
  }

  async uploadToLocal(
    filepath: string,
    filename: string,
    file: string | Buffer,
  ) {
    try {
      const filePath = path.join(
        `${process.env.EXPORT_FILE_PATH}/${filepath}`,
        filename,
      );
      const folderPath = path.dirname(filePath);

      // Ensure the directory exists, create it if it doesn't
      await fs.promises.mkdir(folderPath, { recursive: true });

      // Write the file to the local directory
      await fs.promises.writeFile(filePath, file);

      // Change the file permissions to 775
      await fs.promises.chmod(filePath, 0o775);

      // Return the path of the saved file or a success message
      return `File saved to ${filePath}`;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  async deleteFromLocal(filepath: string, filename: string) {
    try {
      const filePath = path.join(
        `${process.env.EXPORT_FILE_PATH}/${filepath}`,
        filename,
      );

      // Remove the file
      await fs.promises.rm(filePath, { force: true });

      // Return a success message
      return `File deleted: ${filePath}`;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  getFileNameFromPath(filePath: string) {
    return path.basename(filePath);
  }
}
