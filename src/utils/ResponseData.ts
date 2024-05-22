export class ResponseData {
    status: "success" | "error";
    statusCode: 200 | 400 | 401 |  402 | 403 | 404 | 405 | 500;
    message: string | null;
    data: any | any[];

    constructor(
        status: "success" | "error", 
        statusCode: 200 | 400 | 401 | 402 | 403 | 404 | 405 | 500, 
        message: string | null, 
        data: any) {
        this.status = status;
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
    }
}