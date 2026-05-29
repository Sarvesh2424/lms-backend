declare global {
  namespace Express {
    interface MulterFile {
      fieldname: string;
      originalname: string;
      encoding: string;
      mimetype: string;
      size: number;
      buffer: Buffer;
      destination?: string;
      filename?: string;
      path?: string;
      stream?: NodeJS.ReadableStream;
      [key: string]:
        | string
        | number
        | Buffer
        | NodeJS.ReadableStream
        | undefined;
    }
    interface Request {
      user?: {
        id: string;
        role: string;
        orgId: string;
        permissions?: Record<string, Record<string, boolean>>;
      };
      file?: MulterFile;
    }
  }
}
export {};
