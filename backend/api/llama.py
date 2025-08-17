import os
from typing import List, Tuple
import math

try:
    import ollama  # type: ignore
except Exception:
    ollama = None  # type: ignore

try:
    from openai import OpenAI  # type: ignore
except Exception:
    OpenAI = None  # type: ignore

LLM_PROVIDER = os.getenv('LLM_PROVIDER', 'ollama').lower()

# Ollama models
MODEL_NAME = os.getenv('LLAMA_MODEL', 'smolLM2')
EMBED_MODEL = os.getenv('EMBED_MODEL', 'nomic-embed-text')

# OpenAI models
OPENAI_MODEL = os.getenv('OPENAI_MODEL', 'gpt-4o-mini')
OPENAI_EMBED_MODEL = os.getenv('OPENAI_EMBED_MODEL', 'text-embedding-3-small')
MAX_CHARS_PER_CHUNK = int(os.getenv('LLM_MAX_CHARS', '4000'))
MAX_CHUNKS = int(os.getenv('LLM_MAX_CHUNKS', '4'))
NUM_PREDICT = int(os.getenv('LLM_NUM_PREDICT', '300'))
TEMPERATURE = float(os.getenv('LLM_TEMPERATURE', '0.2'))
RELEVANCE_THRESHOLD = float(os.getenv('RELEVANCE_THRESHOLD', '0.30'))


def split_text_into_chunks(text: str, max_chars: int = MAX_CHARS_PER_CHUNK) -> List[str]:
    if len(text) <= max_chars:
        return [text]
    paragraphs = text.split('\n\n')
    chunks: List[str] = []
    current: List[str] = []
    current_len = 0
    for p in paragraphs:
        p_len = len(p) + 2
        if current_len + p_len > max_chars and current:
            chunks.append('\n\n'.join(current))
            current = [p]
            current_len = len(p)
        else:
            current.append(p)
            current_len += p_len
    if current:
        chunks.append('\n\n'.join(current))
    return chunks


def _chat(prompt: str, max_tokens: int = NUM_PREDICT) -> str:
    if LLM_PROVIDER == 'openai':
        if OpenAI is None:
            raise RuntimeError('openai package not installed. Please add it to requirements and set OPENAI_API_KEY.')
        client = OpenAI()
        resp = client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=max_tokens,
            temperature=TEMPERATURE,
        )
        content = (resp.choices[0].message.content or '').strip() if resp.choices else ''
        return content
    # default to ollama
    if ollama is None:
        raise RuntimeError('ollama package not installed and LLM_PROVIDER is not openai.')
    response = ollama.chat(
        model=MODEL_NAME,
        messages=[{"role": "user", "content": prompt}],
        options={
            "num_predict": max_tokens,
            "temperature": TEMPERATURE,
        },
    )
    return (response.get('message', {}) or {}).get('content', '').strip()


def get_embedding(text: str) -> List[float]:
    if LLM_PROVIDER == 'openai':
        if OpenAI is None:
            raise RuntimeError('openai package not installed. Please add it to requirements and set OPENAI_API_KEY.')
        client = OpenAI()
        resp = client.embeddings.create(model=OPENAI_EMBED_MODEL, input=text)
        if not resp.data:
            return []
        return resp.data[0].embedding or []
    # default to ollama
    if ollama is None:
        raise RuntimeError('ollama package not installed and LLM_PROVIDER is not openai.')
    response = ollama.embeddings(model=EMBED_MODEL, prompt=text)
    embedding = response.get('embedding')
    if not embedding:
        return []
    return embedding


def cosine_similarity(a: List[float], b: List[float]) -> float:
    if not a or not b or len(a) != len(b):
        return 0.0
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(y * y for y in b))
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0
    return dot / (norm_a * norm_b)


def is_question_relevant(summary_text: str, question: str, *, threshold: float = RELEVANCE_THRESHOLD) -> Tuple[bool, float]:
    summary_emb = get_embedding(summary_text)
    question_emb = get_embedding(question)
    sim = cosine_similarity(summary_emb, question_emb)
    return (sim >= threshold, sim)


def summarize_text(text: str) -> str:
    chunks = split_text_into_chunks(text)
    if len(chunks) > MAX_CHUNKS:
        chunks = chunks[:MAX_CHUNKS]
    bullet_summaries: List[str] = []
    for chunk in chunks:
        prompt = (
            "Summarize the following text into clear, structured bullet points with headings where appropriate. "
            "Be concise and non-redundant.\n\n" + chunk
        )
        bullet_summaries.append(_chat(prompt))
    if len(bullet_summaries) == 1:
        return bullet_summaries[0]
    merge_prompt = (
        "Merge the following bullet-point summaries into one coherent, de-duplicated summary with clear headings.\n\n" +
        "\n\n".join(f"Chunk {i+1}:\n{bs}" for i, bs in enumerate(bullet_summaries))
    )
    return _chat(merge_prompt)


def answer_question(context_text: str, question: str) -> str:
    prompt = (
        "You are a helpful assistant. Use ONLY the provided context to answer the user's question. "
        "If the answer cannot be found in the context or is unrelated to the context, say you don't have enough information.\n\n"
        f"Context:\n{context_text}\n\nQuestion: {question}\n\nAnswer:"
    )
    return _chat(prompt, max_tokens=NUM_PREDICT)
