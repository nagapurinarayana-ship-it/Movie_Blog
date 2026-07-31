export async function onRequestGet(context) {
  const apiKey = context.env.OMDB_API_KEY;

  if (!apiKey) {
    return Response.json(
      { error: "OMDB API key not configured" },
      { status: 500 }
    );
  }

  try {
    const incomingUrl = new URL(context.request.url);
    const params = new URLSearchParams(incomingUrl.searchParams);

    params.set("apikey", apiKey);

    const omdbUrl = `https://www.omdbapi.com/?${params.toString()}`;
    const response = await fetch(omdbUrl);

    if (!response.ok) {
      return Response.json(
        { error: "OMDb request failed" },
        { status: response.status }
      );
    }

    const data = await response.json();

    return Response.json(data, {
      headers: {
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (error) {
    return Response.json(
      {
        error: "Upstream request failed",
        details: error.message,
      },
      { status: 502 }
    );
  }
}
