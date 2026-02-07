#!/bin/bash

# Test Event Creation Script for Felicity 2026

echo "🎭 Creating test events for Felicity 2026..."

# Base URL
API_URL="http://localhost:5000/api"

# First, we need to create an organizer account and get token
echo "📝 Creating organizer account..."

# Register organizer (you may need to update this based on your auth routes)
ORGANIZER_RESPONSE=$(curl -s -X POST ${API_URL}/auth/register-organizer \
  -H "Content-Type: application/json" \
  -d '{
    "email": "techclub@iiit.ac.in",
    "password": "password123",
    "organizerName": "Tech Club IIIT",
    "category": "Technical",
    "description": "Official Tech Club of IIIT Hyderabad"
  }')

TOKEN=$(echo $ORGANIZER_RESPONSE | grep -o '"token":"[^"]*' | sed 's/"token":"//')

if [ -z "$TOKEN" ]; then
  echo "⚠️  Failed to create organizer. Trying to login..."
  
  LOGIN_RESPONSE=$(curl -s -X POST ${API_URL}/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "email": "techclub@iiit.ac.in",
      "password": "password123"
    }')
  
  TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | sed 's/"token":"//')
fi

echo "🔑 Token obtained!"
echo ""

# Event 1: Hackathon
echo "Creating Event 1: Hackathon 2026..."
curl -X POST ${API_URL}/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "eventName": "Hackathon 2026",
    "eventDescription": "24-hour coding marathon to build innovative solutions. Team up and create amazing projects!",
    "eventType": "Technical",
    "eventStartDate": "2026-03-15T09:00:00Z",
    "eventEndDate": "2026-03-16T09:00:00Z",
    "eventTime": "09:00 AM",
    "venue": "Academic Block A",
    "maxParticipants": 100,
    "currentRegistrations": 27,
    "registrationFee": 0,
    "prizeMoney": 50000,
    "eligibility": "All",
    "tags": ["coding", "hackathon", "competition"],
    "status": "published"
  }'

echo ""
echo ""

# Event 2: Cultural Night
echo "Creating Event 2: Cultural Night..."
curl -X POST ${API_URL}/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "eventName": "Cultural Night - Rang De",
    "eventDescription": "An evening of music, dance, and drama performances by talented students",
    "eventType": "Cultural",
    "eventStartDate": "2026-03-20T18:00:00Z",
    "eventEndDate": "2026-03-20T22:00:00Z",
    "eventTime": "06:00 PM",
    "venue": "Open Air Theatre",
    "maxParticipants": 500,
    "currentRegistrations": 156,
    "registrationFee": 100,
    "eligibility": "All",
    "tags": ["cultural", "performance", "entertainment"],
    "status": "published"
  }'

echo ""
echo ""

# Event 3: AI Workshop
echo "Creating Event 3: AI/ML Workshop..."
curl -X POST ${API_URL}/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "eventName": "AI/ML Workshop",
    "eventDescription": "Hands-on workshop on Machine Learning fundamentals and practical applications",
    "eventType": "Workshop",
    "eventStartDate": "2026-03-18T14:00:00Z",
    "eventEndDate": "2026-03-18T17:00:00Z",
    "eventTime": "02:00 PM",
    "venue": "Lab 201",
    "maxParticipants": 50,
    "currentRegistrations": 45,
    "registrationFee": 200,
    "eligibility": "All",
    "tags": ["workshop", "AI", "ML", "technical"],
    "status": "published"
  }'

echo ""
echo ""

# Event 4: Cricket Tournament
echo "Creating Event 4: Cricket Tournament..."
curl -X POST ${API_URL}/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "eventName": "Inter-College Cricket",
    "eventDescription": "Compete in thrilling cricket matches. Form your team and win the trophy!",
    "eventType": "Sports",
    "eventStartDate": "2026-03-22T08:00:00Z",
    "eventEndDate": "2026-03-24T18:00:00Z",
    "eventTime": "08:00 AM",
    "venue": "Sports Ground",
    "maxParticipants": 200,
    "currentRegistrations": 88,
    "registrationFee": 500,
    "prizeMoney": 30000,
    "eligibility": "All",
    "tags": ["sports", "cricket", "tournament"],
    "status": "published"
  }'

echo ""
echo ""

# Event 5: Stand-up Comedy Night
echo "Creating Event 5: Stand-up Comedy Night..."
curl -X POST ${API_URL}/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "eventName": "Comedy Night",
    "eventDescription": "Laugh out loud with professional comedians. An evening of hilarious entertainment!",
    "eventType": "Cultural",
    "eventStartDate": "2026-03-19T19:00:00Z",
    "eventEndDate": "2026-03-19T21:00:00Z",
    "eventTime": "07:00 PM",
    "venue": "Auditorium",
    "maxParticipants": 300,
    "currentRegistrations": 245,
    "registrationFee": 150,
    "eligibility": "All",
    "tags": ["comedy", "entertainment", "cultural"],
    "status": "published"
  }'

echo ""
echo ""

# Event 6: Web Development Workshop
echo "Creating Event 6: Web Dev Workshop..."
curl -X POST ${API_URL}/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "eventName": "Web Development Bootcamp",
    "eventDescription": "Learn React, Node.js, and build full-stack applications from scratch",
    "eventType": "Workshop",
    "eventStartDate": "2026-03-17T10:00:00Z",
    "eventEndDate": "2026-03-17T16:00:00Z",
    "eventTime": "10:00 AM",
    "venue": "Computer Lab 3",
    "maxParticipants": 40,
    "currentRegistrations": 38,
    "registrationFee": 300,
    "eligibility": "All",
    "tags": ["workshop", "webdev", "react", "nodejs"],
    "status": "published"
  }'

echo ""
echo ""

echo "✅ Test events created successfully!"
echo "🎉 Visit http://localhost:3000/events to see them!"
