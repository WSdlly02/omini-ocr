# Ollama Omni-OCR

This contains everything you need to run your app locally using Ollama.

## Run Locally

**Prerequisites:**
1. Node.js
2. [Ollama](https://ollama.com/) installed and running.
3. Pull the model: `ollama pull qwen3-vl:8b-instruct`

**Important: Configure Ollama for External Access (CORS)**

By default, Ollama only allows requests from localhost. To use this app (especially if accessing from a different device), you need to configure Ollama to allow Cross-Origin requests.

**Linux / macOS:**
```bash
OLLAMA_ORIGINS="*" OLLAMA_HOST="0.0.0.0" ollama serve
```

**Windows (PowerShell):**
```powershell
$env:OLLAMA_ORIGINS="*"; $env:OLLAMA_HOST="0.0.0.0"; ollama serve
```

**Steps:**

1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`
3. Open the app in your browser.
4. The app is configured to use `${window.location.origin}/ollama/v1/` as the base URL, which is proxied to `http://localhost:11434/v1` during development.

## Docker Deployment

You can also run the application using Docker. This setup includes Caddy as a web server with **mandatory HTTPS** support to ensure all browser features (like clipboard copy) work correctly.

### Build and Run

```bash
# Build the image
docker build -t ollama-omni-ocr .

# Run the container
# This will listen on port 443 for HTTPS access
docker run -d \
  -p 443:443 \
  --add-host=host.docker.internal:host-gateway \
  -e OLLAMA_HOST=http://host.docker.internal:11434 \
  --name omni-ocr \
  ollama-omni-ocr
```

**Accessing the App:**
Open `https://<your-ip-or-hostname>` in your browser. Since it uses a self-signed certificate, you will need to click "Advanced" and "Proceed" to enter the site.

**Podman Users:**
```bash
podman run -d \
  -p 9443:443 \
  --add-host=host.docker.internal:host-gateway \
  -e OLLAMA_HOST=http://host.docker.internal:11434 \
  --name omni-ocr \
  localhost/ollama-omni-ocr
```