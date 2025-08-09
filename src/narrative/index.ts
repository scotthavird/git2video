export type Persona = 'executive' | 'product' | 'engineering' | 'qa' | 'design' | 'marketing' | 'general' | 'external';

export interface NarrativeConfig {
  baseUrl: string; // Ollama base URL
  model: string; // e.g., 'llama3.1:8b'
  persona: Persona;
  temperature?: number;
  maxTokens?: number;
}

export interface NarrativeInput {
  pr: any; // PRVideoData
  metadata: any; // VideoMetadata
  readmeText?: string;
}

export interface NarrativeResult {
  transcript: string;
  model: string;
  persona: Persona;
}

async function callOllamaChat(
  baseUrl: string,
  body: Record<string, any>,
  timeoutMs: number = 60000
): Promise<any> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, '')}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Ollama error ${res.status}: ${text}`);
    }
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

function buildSystemPrompt(persona: Persona): string {
  const personaLine =
    persona === 'executive'
      ? 'an executive narrator focused on business impact, risk, and outcomes'
      : persona === 'product'
      ? 'a product-minded narrator focused on users, value, and roadmap alignment'
      : persona === 'engineering'
      ? 'a senior engineering narrator focused on architecture, tradeoffs, and quality'
      : persona === 'qa'
      ? 'a quality-focused narrator emphasizing reliability, tests, and risks'
      : persona === 'design'
      ? 'a design-focused narrator emphasizing UX, accessibility, and cohesion'
      : persona === 'marketing'
      ? 'a marketing-focused narrator emphasizing story, benefits, and differentiation'
      : persona === 'external'
      ? 'a neutral narrator suitable for public audiences'
      : 'a clear, concise narrator for a general audience';
  return `You are ${personaLine}. Produce a concise, engaging voiceover transcript for a short video summarizing a GitHub Pull Request.`;
}

function truncate(text: string, maxChars: number): string {
  if (!text) return '';
  return text.length <= maxChars ? text : text.slice(0, maxChars) + '\n...';
}

function buildUserPrompt(input: NarrativeInput, persona: Persona): string {
  const pr = input.pr;
  const md = input.metadata;
  const title = pr?.pullRequest?.title || md?.title || 'Pull Request';
  const prDesc = pr?.pullRequest?.body || '';
  const stats = pr?.codeStats || {};
  const commits = Array.isArray(pr?.commits) ? pr.commits : [];
  const files = Array.isArray(pr?.files) ? pr.files : [];
  const reviews = Array.isArray(pr?.reviews) ? pr.reviews : [];

  const commitMsgs = commits.map((c: any) => c?.commit?.message).filter(Boolean).slice(0, 20);
  const fileSummaries = files.map((f: any) => `${f.filename} (${f.status}, +${f.additions}/-${f.deletions})`).slice(0, 30);
  const reviewNotes = reviews.map((r: any) => `${r.state}${r.body ? `: ${r.body}` : ''}`).slice(0, 10);

  const readme = truncate(input.readmeText || '', 4000);
  const projectContext = readme ? `\n\nProject README (truncated):\n${readme}` : '';

  const audienceHint =
    persona === 'executive'
      ? 'Prioritize business impact, risks, timelines, stakeholders, and measurable outcomes.'
      : persona === 'product'
      ? 'Prioritize user value, UX implications, and roadmap alignment; avoid deep technical jargon.'
      : persona === 'engineering'
      ? 'Prioritize architecture, complexity, tradeoffs, reliability, and performance.'
      : persona === 'qa'
      ? 'Prioritize test coverage, edge cases, risk mitigation, and release readiness.'
      : persona === 'design'
      ? 'Prioritize UX rationale, accessibility, visual consistency, and component reuse.'
      : persona === 'marketing'
      ? 'Prioritize story, benefits, positioning, and key differentiators.'
      : persona === 'external'
      ? 'Assume no internal knowledge; avoid confidential details; keep it neutral.'
      : 'Be clear and concise for a general audience.';

  return `Create a voiceover transcript (60-120 seconds) narrating this PR. Write in first person plural (we) and keep 4-7 short paragraphs. End with a one-sentence wrap-up. Do not include scene directions.

Title: ${title}
PR Description: ${truncate(prDesc, 2000)}
Key Stats: additions=${stats.totalAdditions || pr?.pullRequest?.additions || 0}, deletions=${stats.totalDeletions || pr?.pullRequest?.deletions || 0}, files=${stats.totalFiles || pr?.pullRequest?.changed_files || 0}
Commits (sample):\n- ${commitMsgs.join('\n- ')}
Files (sample):\n- ${fileSummaries.join('\n- ')}
Reviews (sample):\n- ${reviewNotes.join('\n- ')}
${projectContext}

Audience guidance: ${audienceHint}`;
}

export async function generateNarrative(input: NarrativeInput, config: NarrativeConfig): Promise<NarrativeResult> {
  const messages = [
    { role: 'system', content: buildSystemPrompt(config.persona) },
    { role: 'user', content: buildUserPrompt(input, config.persona) },
  ];

  const response = await callOllamaChat(config.baseUrl, {
    model: config.model,
    messages,
    stream: false,
    options: {
      temperature: config.temperature ?? 0.3,
      num_ctx: 8192,
      num_predict: config.maxTokens ?? 800,
    },
  });

  const content = response?.message?.content || '';
  return {
    transcript: content.trim(),
    model: config.model,
    persona: config.persona,
  };
}


