import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT, buildGenerationPrompt, SUB_MODES } from "../../../lib/craft-rules.js";
import { extractJSON } from "../../../lib/extract-json.js";

const NUCLEUS_ENDPOINT = process.env.NUCLEUS_ENDPOINT || "https://hamilton-beach-nucleus.vercel.app";

function getClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

async function callNucleus(requestText, platformLane, sku) {
  const res = await fetch(`${NUCLEUS_ENDPOINT}/api/nucleus`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      request_text: requestText,
      output_type: "reddit_post",
      platform_lane: platformLane || "built_for_this",
      channel: "reddit",
      sku: sku || "unspecified",
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Nucleus returned ${res.status}: ${errText}`);
  }
  return res.json();
}

async function generateRedditCopy(client, contextPackage, subMode, metadata) {
  const userPrompt = buildGenerationPrompt(contextPackage, subMode, metadata);
  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });
  const text = msg.content[0]?.text || "";
  return extractJSON(text);
}

// Single request: generate all 4 sub-modes for one prompt
async function generateAllModes(client, nucleusResponse, metadata) {
  const subModes = ["organic_reply", "organic_post", "promoted_text", "conversation_ad"];
  const results = {};

  const promises = subModes.map(async (mode) => {
    try {
      const copy = await generateRedditCopy(client, nucleusResponse.context_package, mode, metadata);
      results[mode] = { success: true, ...copy };
    } catch (err) {
      results[mode] = { success: false, error: err.message };
    }
  });

  await Promise.all(promises);
  return results;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { rows, batch_defaults } = body;

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return Response.json({ error: "rows array is required" }, { status: 400 });
    }
    if (rows.length > 50) {
      return Response.json({ error: "Maximum 50 rows per batch" }, { status: 400 });
    }

    const client = getClient();
    const defaults = batch_defaults || {};
    const results = [];

    for (const row of rows) {
      const requestText = row.request_text;
      if (!requestText || !requestText.trim()) {
        results.push({ request_text: requestText, error: "request_text is required", modes: {} });
        continue;
      }

      const platformLane = row.platform_lane || defaults.platform_lane || "built_for_this";
      const targetSubreddits = row.target_subreddits || defaults.target_subreddits || "";
      const keywords = row.keywords || defaults.keywords || "";
      const sku = row.sku || defaults.sku || "";
      const journeyStage = row.journey_stage || defaults.journey_stage || "";

      try {
        const nucleusResponse = await callNucleus(requestText, platformLane, sku);
        const metadata = {
          target_subreddits: targetSubreddits,
          keywords,
          sku,
          journey_stage: journeyStage,
        };
        const modes = await generateAllModes(client, nucleusResponse, metadata);

        results.push({
          request_text: requestText,
          platform_lane: platformLane,
          target_subreddits: targetSubreddits,
          keywords,
          sku,
          journey_stage: journeyStage,
          nucleus: {
            intent: nucleusResponse.intent,
            metadata: nucleusResponse._metadata,
          },
          modes,
        });
      } catch (err) {
        results.push({
          request_text: requestText,
          error: err.message,
          modes: {},
        });
      }
    }

    return Response.json({ results, generated_at: new Date().toISOString() });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
