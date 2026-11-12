type Cookie = { name: string; value: string; opts?: Record<string, unknown> };
export class NextResponse {
  status: number; body: unknown; headers: Record<string, string>; cookieJar: Cookie[] = [];
  cookies = { set: (name: string, value: string, opts?: Record<string, unknown>) => { this.cookieJar.push({ name, value, opts }); } };
  constructor(body: unknown, init?: { status?: number; headers?: Record<string, string> }) { this.body = body; this.status = init?.status ?? 200; this.headers = init?.headers ?? {}; }
  static json(body: unknown, init?: { status?: number; headers?: Record<string, string> }) { return new NextResponse(body, init); }
  async json() { return this.body; }
}
export type NextRequest = never;
