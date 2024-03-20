FROM golang:latest
WORKDIR /app
COPY go.mod ./
COPY go.sum ./
RUN go mod download
COPY ./ ./
CMD ["sh", "-c", "go run src/init/main.go && go run src/server/main.go"]
