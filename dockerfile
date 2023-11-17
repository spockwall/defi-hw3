FROM nikolaik/python-nodejs
WORKDIR /app
COPY ./package*.json /app
RUN npm install
COPY . /app
