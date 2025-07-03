FROM golang:1.24 AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go install github.com/swaggo/swag/cmd/swag@latest
RUN swag init -g api/cmd/server/main.go

RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /Medical-Portal ./api/cmd/server

RUN wget -q -O /migrate.tar.gz https://github.com/golang-migrate/migrate/releases/download/v4.17.0/migrate.linux-amd64.tar.gz && \
    tar -xzf /migrate.tar.gz && \
    mv migrate /migrate

FROM gcr.io/distroless/static-debian11

USER nonroot:nonroot

WORKDIR /

COPY --from=builder /Medical-Portal /Medical-Portal

COPY --from=builder /app/migrations /migrations
COPY --from=builder /app/web /web
COPY --from=builder /app/docs /docs

COPY --from=builder /migrate /usr/local/bin/migrate

EXPOSE 8080

ENTRYPOINT [ "/Medical-Portal" ]