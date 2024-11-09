CURL Commands


1. curl -X POST http://localhost:3000/api/mqtt/subscribe -H "Content-Type: application/json" -d '{"topic": "your/topic"}'  -H "guid:70818c9a-adea-4222-9040-f9c3ff3d93b9"    

2. curl -X POST http://localhost:3000/api/mqtt/publish -H "Content-Type: application/json" -H "guid:70818c9a-adea-4222-9040-f9c3ff3d93b9" -d '{"topic": "your/topic", "message": "Avinash"}' 

3. curl -X GET http://localhost:3000/api/mqtt/messages  -H "guid:70818c9a-adea-4222-9040-f9c3ff3d93b9"         