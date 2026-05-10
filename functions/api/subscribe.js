const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(body, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set("content-type", "application/json; charset=utf-8");

  return new Response(JSON.stringify(body), {
    ...init,
    headers,
  });
}

async function extractEmail(request) {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const data = await request.json().catch(() => null);
    return typeof data?.email === "string" ? data.email : "";
  }

  const formData = await request.formData().catch(() => null);
  return typeof formData?.get("email") === "string" ? formData.get("email") : "";
}

export async function onRequestPost(context) {
  const email = (await extractEmail(context.request)).trim().toLowerCase();

  if (!EMAIL_RE.test(email)) {
    return json(
      { ok: false, message: "Please enter a valid email address." },
      { status: 400 }
    );
  }

  try {
    await context.env.BLOG_DB.prepare(
      `INSERT INTO subscribers (email)
       VALUES (?)
       ON CONFLICT(email) DO NOTHING`
    )
      .bind(email)
      .run();

    return json({
      ok: true,
      message:
        "Thanks for subscribing. I'll add you to the mailing list before the next email goes out.",
    });
  } catch (error) {
    console.error("Failed to save subscriber", error);

    return json(
      {
        ok: false,
        message: "Something went wrong while saving your email. Please try again.",
      },
      { status: 500 }
    );
  }
}

export function onRequestGet() {
  return json(
    { ok: false, message: "Method not allowed." },
    { status: 405, headers: { allow: "POST" } }
  );
}
