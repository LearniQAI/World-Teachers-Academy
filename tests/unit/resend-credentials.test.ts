// Email sending must never pretend to succeed. Without RESEND_API_KEY (CI and
// protected Previews) the module must still load, and sending must fail with a
// clear error before any network request is made. With a key that the email
// service rejects, sending must also fail rather than report success.
// No real API key is used here: the key below is a made-up test value and all
// network calls are intercepted.
import { test } from "node:test";
import assert from "node:assert/strict";

const realFetch = globalThis.fetch;
let fetchCalls = 0;

test("without RESEND_API_KEY: the module loads and sending fails clearly, with no request made", async () => {
  delete process.env.RESEND_API_KEY;
  globalThis.fetch = (async () => {
    fetchCalls++;
    throw new Error("network must not be used");
  }) as typeof fetch;
  try {
    const { sendOtpEmail } = await import("../../lib/resend.ts");
    await assert.rejects(sendOtpEmail("someone@example.com", "123456"), /not configured/);
    assert.equal(fetchCalls, 0);
  } finally {
    globalThis.fetch = realFetch;
  }
});

test("when the email service rejects the request, sending fails instead of reporting success", async () => {
  process.env.RESEND_API_KEY = "re_unit_test_not_a_real_key";
  globalThis.fetch = (async () => {
    fetchCalls++;
    return new Response(JSON.stringify({ name: "validation_error", message: "API key is invalid", statusCode: 401 }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }) as typeof fetch;
  try {
    const { sendOtpEmail } = await import("../../lib/resend.ts");
    await assert.rejects(sendOtpEmail("someone@example.com", "123456"));
    assert.ok(fetchCalls > 0, "the email service should have been called once a key is set");
  } finally {
    globalThis.fetch = realFetch;
    delete process.env.RESEND_API_KEY;
  }
});
