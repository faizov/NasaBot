# Установка базового образа Node.js
FROM node:16-alpine

# Создание директории для приложения
WORKDIR /app

RUN apk add --update --no-cache \
    make \
    g++ \
    jpeg-dev \
    cairo-dev \
    giflib-dev \
    pango-dev \
    libtool \
    autoconf \
    automake

# Копирование зависимостей и установка их
COPY package*.json ./

RUN npm install

# Копирование исходного кода приложения
COPY . .

ENV PORT=3000

EXPOSE $PORT

# Запуск приложения
CMD [ "npm", "start" ]
