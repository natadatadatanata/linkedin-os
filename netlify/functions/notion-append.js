exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const notionToken = body.notionToken;
    const pageId = body.pageId;
    const text = body.text;

    if (!notionToken || !pageId || !text) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing notionToken, pageId, or text" }) };
    }

    const res = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${notionToken}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        children: [
          {
            object: "block",
            type: "paragraph",
            paragraph: {
              rich_text: [{ type: "text", text: { content: text } }]
            }
          }
        ]
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { statusCode: res.status, headers, body: JSON.stringify({ error: data.message || "Notion API error" }) };
    }
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
};
