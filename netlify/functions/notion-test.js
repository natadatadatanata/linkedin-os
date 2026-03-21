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

  try {
    const body = JSON.parse(event.body || "{}");
    const notionToken = body.notionToken;
    const dbId = body.dbId;

    if (!notionToken || !dbId) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing notionToken or dbId" }) };
    }

    const res = await fetch(`https://api.notion.com/v1/databases/${dbId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${notionToken}`,
        "Notion-Version": "2022-06-28",
      },
    });

    const data = await res.json();
    if (!res.ok) {
      return { statusCode: res.status, headers, body: JSON.stringify({ error: data.message || "Notion API error" }) };
    }
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, title: data.title?.[0]?.plain_text || "Connected" }) };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
};
