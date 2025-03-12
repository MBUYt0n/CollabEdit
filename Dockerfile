FROM node:18-alpine
RUN apk add --no-cache curl fish openjdk11
RUN curl -L https://dlcdn.apache.org/kafka/3.9.0/kafka_2.13-3.9.0.tgz -o kafka.tgz \
    && tar -xvzf kafka.tgz && mv kafka_2.13-3.9.0 /opt/kafka && rm kafka.tgz
ENV PATH="/opt/kafka/bin:${PATH}"
WORKDIR /home/CollabEdit
RUN npm init -y
RUN npm install ws websocket kafkajs express
EXPOSE 9092 3000
