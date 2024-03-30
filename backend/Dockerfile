FROM golang:1.22
WORKDIR /app/backend
COPY . /app/backend
RUN go mod download
CMD ["sh", "-c", "go run src/init/main.go && go run src/server/main.go"]
