const { describe, it, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const { extractPreferences, parsePreferences } = require("../utils/aiService.js");
const { aiRecommendationRequestSchema } = require("../schema.js");

const validPreferences = {
  isTravelRequest: true,
  destination: "India",
  minPrice: null,
  maxPrice: 200,
  categories: ["mountains"],
  keywords: ["peaceful"],
  unsupported: [],
};

function geminiReply(data, status = 200) {
  return new Response(
    JSON.stringify({
      candidates: [{ content: { parts: [{ text: JSON.stringify(data) }] } }],
    }),
    { status },
  );
}

const originalConsoleError = console.error;
beforeEach(() => {
  console.error = () => {};
});
afterEach(() => {
  console.error = originalConsoleError;
});

function assertApiError(statusCode, code) {
  return (error) => {
    assert.equal(error.statusCode, statusCode);
    assert.equal(error.code, code);
    return true;
  };
}

describe("aiRecommendationRequestSchema", () => {
  it("accepts and trims a normal prompt", () => {
    const { error, value } = aiRecommendationRequestSchema.validate({
      prompt: "  Mountain stay in India  ",
    });
    assert.equal(error, undefined);
    assert.equal(value.prompt, "Mountain stay in India");
  });

  it("rejects missing, non-string, too short, and too long prompts", () => {
    for (const body of [{}, { prompt: 42 }, { prompt: "  a " }, { prompt: "a".repeat(301) }]) {
      assert.ok(aiRecommendationRequestSchema.validate(body).error);
    }
  });
});

describe("parsePreferences", () => {
  it("returns validated preferences and fills defaults", () => {
    const result = parsePreferences(
      JSON.stringify({ isTravelRequest: true, keywords: ["Beach"] }),
    );
    assert.deepEqual(result, {
      isTravelRequest: true,
      destination: null,
      minPrice: null,
      maxPrice: null,
      categories: [],
      keywords: ["beach"],
      unsupported: [],
    });
  });

  it("removes fields the application does not support", () => {
    const result = parsePreferences(
      JSON.stringify({ ...validPreferences, $where: "sleep(1000)" }),
    );
    assert.equal("$where" in result, false);
  });

  const invalidCases = {
    "text that is not JSON": "Sure! Here are some stays...",
    "an unknown category": JSON.stringify({ ...validPreferences, categories: ["hacked"] }),
    "a negative price": JSON.stringify({ ...validPreferences, maxPrice: -1 }),
    "minPrice above maxPrice": JSON.stringify({ ...validPreferences, minPrice: 500, maxPrice: 100 }),
    "a destination containing regex symbols": JSON.stringify({ ...validPreferences, destination: ".*" }),
    "a keyword containing a query operator": JSON.stringify({ ...validPreferences, keywords: ["$ne"] }),
  };

  for (const [label, text] of Object.entries(invalidCases)) {
    it(`rejects ${label}`, () => {
      assert.throws(() => parsePreferences(text), assertApiError(502, "AI_INVALID_RESPONSE"));
    });
  }
});

describe("extractPreferences", () => {
  const originalFetch = global.fetch;
  const originalKey = process.env.GEMINI_API_KEY;

  beforeEach(() => {
    process.env.GEMINI_API_KEY = "test-key";
  });

  afterEach(() => {
    global.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalKey;
  });

  it("sends the prompt as user content with the key in a header", async () => {
    let request;
    global.fetch = async (url, options) => {
      request = { url, options };
      return geminiReply(validPreferences);
    };

    const result = await extractPreferences("Mountain stay in India under $200");
    const body = JSON.parse(request.options.body);

    assert.deepEqual(result, validPreferences);
    assert.equal(request.options.headers["x-goog-api-key"], "test-key");
    assert.equal(request.url.includes("test-key"), false);
    assert.equal(body.contents[0].parts[0].text, "Mountain stay in India under $200");
    assert.equal(body.systemInstruction.parts[0].text.includes("Mountain stay"), false);
  });

  it("rejects requests that are not about travel", async () => {
    global.fetch = async () => geminiReply({ ...validPreferences, isTravelRequest: false });
    await assert.rejects(
      extractPreferences("Write me a poem"),
      assertApiError(422, "NOT_A_TRAVEL_REQUEST"),
    );
  });

  it("reports the AI as unavailable when the provider returns an error", async () => {
    global.fetch = async () => new Response("quota exceeded", { status: 429 });
    await assert.rejects(extractPreferences("Beach stay"), assertApiError(503, "AI_UNAVAILABLE"));
  });

  it("reports the AI as unavailable on network failures and timeouts", async () => {
    global.fetch = async () => {
      throw new DOMException("The operation timed out.", "TimeoutError");
    };
    await assert.rejects(extractPreferences("Beach stay"), assertApiError(503, "AI_UNAVAILABLE"));
  });

  it("rejects a provider response with no text", async () => {
    global.fetch = async () => new Response(JSON.stringify({ candidates: [] }));
    await assert.rejects(extractPreferences("Beach stay"), assertApiError(502, "AI_INVALID_RESPONSE"));
  });

  it("does not call the provider when the API key is missing", async () => {
    delete process.env.GEMINI_API_KEY;
    let called = false;
    global.fetch = async () => {
      called = true;
    };
    await assert.rejects(extractPreferences("Beach stay"), assertApiError(503, "AI_UNAVAILABLE"));
    assert.equal(called, false);
  });
});
