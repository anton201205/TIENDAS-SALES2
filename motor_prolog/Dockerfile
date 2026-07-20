FROM node:20-slim
RUN apt-get update && apt-get install -y swi-prolog && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY motor_prolog/ .
COPY datos/ ../datos/
RUN npm install
CMD ["node", "server.js"]