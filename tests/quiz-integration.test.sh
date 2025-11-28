#!/bin/bash

# Quiz Integration Test
# Tests the complete quiz flow via WhatsApp webhook

set -e

BASE_URL="${TEST_URL:-http://localhost:8080}"
TEST_PHONE="628999888777"

echo "🧪 Quiz Integration Test"
echo "========================"
echo "Base URL: $BASE_URL"
echo ""

# Helper function to send WhatsApp message
send_message() {
  local phone=$1
  local text=$2
  
  curl -s -X POST "$BASE_URL/webhook" \
    -H "Content-Type: application/json" \
    -d "{
      \"entry\": [{
        \"changes\": [{
          \"value\": {
            \"messages\": [{
              \"from\": \"$phone\",
              \"type\": \"text\",
              \"text\": { \"body\": \"$text\" }
            }]
          }
        }]
      }]
    }" > /dev/null
}

# Helper function to send interactive response
send_interactive() {
  local phone=$1
  local option_id=$2
  
  curl -s -X POST "$BASE_URL/webhook" \
    -H "Content-Type: application/json" \
    -d "{
      \"entry\": [{
        \"changes\": [{
          \"value\": {
            \"messages\": [{
              \"from\": \"$phone\",
              \"type\": \"interactive\",
              \"interactive\": {
                \"type\": \"list_reply\",
                \"list_reply\": { \"id\": \"$option_id\" }
              }
            }]
          }
        }]
      }]
    }" > /dev/null
}

echo "✅ Test 1: Start quiz command"
send_message "$TEST_PHONE" "mulai kuis"
sleep 2

echo "✅ Test 2: Answer question 1 (option A)"
send_interactive "$TEST_PHONE" "opt_0"
sleep 2

echo "✅ Test 3: Answer question 2 (option B)"
send_interactive "$TEST_PHONE" "opt_1"
sleep 2

echo "✅ Test 4: Answer question 3 (option C)"
send_interactive "$TEST_PHONE" "opt_2"
sleep 2

echo "✅ Test 5: Answer question 4 (option D)"
send_interactive "$TEST_PHONE" "opt_3"
sleep 2

echo "✅ Test 6: Check progress"
send_message "$TEST_PHONE" "progress"
sleep 2

echo "✅ Test 7: Start next quiz"
send_message "$TEST_PHONE" "quiz"
sleep 2

echo ""
echo "🎉 All quiz integration tests completed!"
echo ""
echo "📝 Manual verification needed:"
echo "  1. Check WhatsApp messages were sent"
echo "  2. Verify interactive list messages appeared"
echo "  3. Confirm progress was saved to Firestore"
echo "  4. Check user literacy scores updated"
