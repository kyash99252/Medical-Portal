FROM golang:1.24

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go install github.com/swaggo/swag/cmd/swag@latest
RUN go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest

RUN swag init -g api/cmd/server/main.go

RUN go build -o Medical-Portal ./api/cmd/server

EXPOSE 8080

ENTRYPOINT ["./Medical-Portal"]