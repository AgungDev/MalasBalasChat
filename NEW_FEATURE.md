# Implement a "Human Approval Fallback System" for WhatsApp AI auto-reply.

Objective:
When the AI receives a message that requires personal or real-time information (e.g., "lagi apa?", "sibuk?", "mau mabar?", "lagi dimana?", etc.), the system must NOT immediately respond. Instead, it should ask the real user for approval before replying.

Core Behavior:

1. Detect messages that require real human context (availability, activity, decisions, invitations).

2. If detected:

   * Do NOT auto-reply to the sender.
   * Forward the message to the owner's WhatsApp number (self number or admin number).
   * Format forwarded message clearly:
     "[NEED REPLY]\nFrom: {sender}\nMessage: {text}\n\nReply with: /reply {sender} {your_message}"

3. Start a timer (15 minutes).

4. If user replies within 15 minutes:

   * Capture the reply
   * Send it back to the original sender

5. If NO reply after 15 minutes:

   * AI generates a fallback response using predefined persona prompt:

     * Politely decline invitations (e.g., mabar)
     * Give safe/neutral answer about being busy
     * Avoid lying too specifically
     * Keep response natural and human-like

Detection Rules:
Trigger human approval if message contains:

* Availability questions (sibuk?, lagi apa?, free?)
* Invitations (mabar, keluar, call, main, ketemuan)
* Personal status (lagi dimana, sama siapa)
* Decision making requests

Architecture Requirements:

* Use Clean Architecture
* Create usecase: "HandleIncomingMessage"
* Create service: "HumanApprovalService"
* Store pending approvals in PostgreSQL:
  Table: pending_replies

  * id
  * sender_phone
  * original_message
  * status (pending, replied, timeout)
  * created_at

Timer Handling:

* Use goroutine or background worker
* After 15 minutes:

  * Check status
  * If still pending → trigger AI fallback response

AI Prompt for Fallback:
System prompt:
"You are a polite and natural human. If unsure, respond safely.
If invited, decline gently.
If asked about activity, respond generally (e.g., 'lagi ada kerjaan dikit').
Do not give specific or risky answers."

Additional Behavior:

* Prevent duplicate forwarding
* Only trigger for specific users (e.g., pacar, teman)
* Allow command parsing:
  "/reply 628xxxx message"

Output:

* Clean, modular code
* Clear separation between WhatsApp handler, usecase, and AI service
* Scalable for multiple users

Notes:

* Prioritize human authenticity over automation
* Avoid over-automation in sensitive conversations
