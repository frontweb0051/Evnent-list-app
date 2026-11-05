/*
JavaScript自体で定義された組み込みのErrorクラスの「擬似コード」
class Error {
  constructor(message) {
    this.message = message;
    this.name = "Error"; // (組み込みのエラークラスごとに異なる名前)
    this.stack = <nested calls>; // 非標準ですが、ほとんどの環境はサポートしています
  }
}
extends Error : Errorクラスの内容を引き継ぐ
super : 親のコンストラクタを呼び出す

class ValidationError extends Error {
  constructor(message) {
    super(message); // (1)
    this.name = "ValidationError"; // (2)
  }
}
*/


export class ApiError extends Error {
  status: number;
  code: string;
  fields: Record<string, string>;

  constructor(status: number, code: string, message: string, fields: Record<string, string> = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

export async function createApiError(res:Response, Message: string):Promise<ApiError> {
  /*
  const json = await res.json().catch(() => null); 
  下記と同意

  let json = null;
  try {
    json = await res.json();
  } catch (err) {
    json = null;
  }
  */
  const json = await res.json().catch(()=>null);
  const e = json?.error;

  return new ApiError(
    res.status,
    e?.code ?? "UNKNOWN",
    e?.message ?? Message,
    e?.fields ?? {}
  )
}