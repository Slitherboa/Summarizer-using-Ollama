import os
from typing import List
import ollama

MODEL_NAME = os.getenv('LLAMA_MODEL', 'smolLM2')
MAX_CHARS_PER_CHUNK = int(os.getenv('LLM_MAX_CHARS', '4000'))
MAX_CHUNKS = int(os.getenv('LLM_MAX_CHUNKS', '4'))
NUM_PREDICT = int(os.getenv('LLM_NUM_PREDICT', '300'))
TEMPERATURE = float(os.getenv('LLM_TEMPERATURE', '0.2'))


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
    response = ollama.chat(
        model=MODEL_NAME,
        messages=[{"role": "user", "content": prompt}],
        options={
            "num_predict": max_tokens,
            "temperature": TEMPERATURE,
        },
    )
    return (response.get('message', {}) or {}).get('content', '').strip()


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
        "If the answer cannot be found in the context, say you don't have enough information.\n\n"
        f"Context:\n{context_text}\n\nQuestion: {question}\n\nAnswer:"
    )
    return _chat(prompt, max_tokens=NUM_PREDICT)
