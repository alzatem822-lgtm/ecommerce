#!/bin/bash

echo "🚀 Iniciando contenedores Docker..."
docker-compose up -d

echo "⏳ Esperando a que los servicios estén listos..."
sleep 10

echo "✅ Servicios iniciados:"
echo "   - App: http://localhost:3000"
echo "   - PostgreSQL: localhost:5432"
echo "   - Redis: localhost:6379"