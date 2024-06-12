# Roast My Repo

A jam w/ @josephrmartinez to experiment with getting higher level advice on code architecture / design from an LLM than we generally can get from sending little snippets of code in ChatGPT.

- Sends all the files in a local directory up to an LLM in a single context
- A system prompt instructing it to act like a Staff Software Architect
    - Note: seems to overly bias the LLM into finding the explicitly mentioned anti-patterns
- "Repair" mode will make the changes to the files directly
- "Roast" mode will output an HTML file with the feedback

## Usage

NOTE: this doesn't currently ignore things like `node_modules/` or build directories, so I generally point it to my src/ directories. Could read the `.gitignore` to directory-tree's `ignore` at some point.

```
echo "OPENAI_API_KEY=sk-proj-*********" > .env

yarn roast {relative/path/to/your/src}
```
