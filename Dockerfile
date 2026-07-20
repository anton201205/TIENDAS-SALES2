FROM node:20-slim
RUN apt-get update && apt-get install -y swi-prolog && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY motor_prolog/ .
COPY datos/ ../datos/
RUN npm install
CMD ["node", "server.js"]

FROM python:3.11-slim
RUN apt-get update && apt-get install -y swi-prolog default-jdk curl && rm -rf /var/lib/apt/lists/*
RUN curl -fL https://github.com/coursier/coursier/releases/latest/download/cs-x86_64-pc-linux.gz | gzip -d > cs \
    && chmod +x cs && ./cs setup --yes && rm cs
ENV PATH="/root/.local/share/coursier/bin:${PATH}"
WORKDIR /app
COPY . .
RUN pip install --no-cache-dir -r backend_python/requirements.txt
CMD ["python", "backend_python/app.py"]

