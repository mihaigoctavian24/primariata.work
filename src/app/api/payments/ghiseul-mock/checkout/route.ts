import { NextRequest, NextResponse } from "next/server";
import { processCheckout } from "@/lib/payments/ghiseul-mock/server";
import type { MockTransactionId, MockCheckoutFormData } from "@/lib/payments/ghiseul-mock/types";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/payments/ghiseul-mock/checkout
 * Mock payment gateway checkout page
 *
 * Displays payment form with test card information.
 * This simulates the Ghișeul.ro checkout interface.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const transaction_id = searchParams.get("transaction_id") as MockTransactionId | null;

  if (!transaction_id) {
    return new NextResponse("Missing transaction_id", { status: 400 });
  }

  // Get payment details from database (not mock store - that's in-memory and doesn't persist)
  const supabase = await createClient();
  const { data: plata, error: plataError } = await supabase
    .from("plati")
    .select("id, suma, status")
    .eq("transaction_id", transaction_id)
    .single();

  if (plataError || !plata) {
    console.error("Payment not found for transaction:", transaction_id, plataError);
    return new NextResponse("Invalid transaction", { status: 404 });
  }

  // Construct return_url (same pattern as payment creation)
  const protocol = request.headers.get("x-forwarded-proto") || "http";
  const host = request.headers.get("host") || "localhost:3000";
  const baseUrl = `${protocol}://${host}`;
  const return_url = `${baseUrl}/app/plati/${plata.id}`;

  const payment = {
    transaction_id,
    amount: plata.suma,
    status: plata.status,
    return_url,
  };

  // Check if already processed
  if (payment.status !== "pending") {
    return new NextResponse(
      `Payment already ${payment.status}. Redirecting...
      <script>
        setTimeout(() => window.location.href = "${payment.return_url || "/"}", 2000);
      </script>`,
      {
        status: 200,
        headers: { "Content-Type": "text/html" },
      }
    );
  }

  // Render checkout form
  const html = `
<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ghișeul.ro - Checkout (MOCK)</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      max-width: 500px;
      width: 100%;
      padding: 40px;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #333;
      font-size: 24px;
      margin-bottom: 8px;
    }
    .mock-badge {
      display: inline-block;
      background: #ffd700;
      color: #333;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 20px;
    }
    .amount {
      text-align: center;
      font-size: 36px;
      font-weight: bold;
      color: #667eea;
      margin-bottom: 30px;
    }
    .form-group {
      margin-bottom: 20px;
    }
    label {
      display: block;
      margin-bottom: 8px;
      color: #555;
      font-weight: 500;
      font-size: 14px;
    }
    input, select {
      width: 100%;
      padding: 12px;
      border: 2px solid #e1e8ed;
      border-radius: 8px;
      font-size: 16px;
      transition: border-color 0.3s;
    }
    input:focus, select:focus {
      outline: none;
      border-color: #667eea;
    }
    .expiry-group {
      display: grid;
      grid-template-columns: 1fr 1fr 2fr;
      gap: 12px;
    }
    button {
      width: 100%;
      padding: 16px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s;
      margin-top: 10px;
    }
    button:hover { transform: translateY(-2px); }
    button:active { transform: translateY(0); }
    .test-cards {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 16px;
      margin-top: 24px;
    }
    .test-cards h3 {
      color: #333;
      font-size: 14px;
      margin-bottom: 12px;
    }
    .card-option {
      background: white;
      padding: 12px;
      border-radius: 6px;
      margin-bottom: 8px;
      cursor: pointer;
      border: 2px solid transparent;
      transition: border-color 0.2s;
    }
    .card-option:hover { border-color: #667eea; }
    .card-number { font-family: 'Courier New', monospace; font-weight: bold; color: #667eea; }
    .card-result { color: #666; font-size: 12px; }
    .error {
      background: #fee;
      color: #c33;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 20px;
      font-size: 14px;
    }
    .loading {
      display: none;
      text-align: center;
      padding: 20px;
    }
    .spinner {
      border: 3px solid #f3f3f3;
      border-top: 3px solid #667eea;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 16px;
    }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="mock-badge">🧪 MOCK GATEWAY</div>
      <h1>Ghișeul.ro Checkout</h1>
      <p style="color: #666; font-size: 14px;">Transaction: ${transaction_id.substring(0, 20)}...</p>
    </div>

    <div class="amount">${payment.amount.toFixed(2)} RON</div>

    <div id="error" class="error" style="display: none;"></div>

    <form id="checkout-form" onsubmit="handleSubmit(event)">
      <input type="hidden" name="transaction_id" value="${transaction_id}">

      <div class="form-group">
        <label for="card_number">Număr card</label>
        <input
          type="text"
          id="card_number"
          name="card_number"
          placeholder="1234 5678 9012 3456"
          maxlength="19"
          required
          oninput="formatCardNumber(this)"
        >
      </div>

      <div class="form-group">
        <label for="card_holder">Titular card</label>
        <input
          type="text"
          id="card_holder"
          name="card_holder"
          placeholder="ION POPESCU"
          required
          style="text-transform: uppercase"
        >
      </div>

      <div class="expiry-group">
        <div class="form-group">
          <label for="expiry_month">Lună</label>
          <select id="expiry_month" name="expiry_month" required>
            ${Array.from({ length: 12 }, (_, i) => {
              const month = (i + 1).toString().padStart(2, "0");
              return `<option value="${month}">${month}</option>`;
            }).join("")}
          </select>
        </div>
        <div class="form-group">
          <label for="expiry_year">An</label>
          <select id="expiry_year" name="expiry_year" required>
            ${Array.from({ length: 10 }, (_, i) => {
              const year = new Date().getFullYear() + i;
              return `<option value="${year}">${year}</option>`;
            }).join("")}
          </select>
        </div>
        <div class="form-group">
          <label for="cvv">CVV</label>
          <input
            type="text"
            id="cvv"
            name="cvv"
            placeholder="123"
            maxlength="3"
            required
            pattern="[0-9]{3}"
          >
        </div>
      </div>

      <button type="submit">Plătește ${payment.amount.toFixed(2)} RON</button>
    </form>

    <div id="loading" class="loading">
      <div class="spinner"></div>
      <p>Se procesează plata...</p>
    </div>

    <div class="test-cards">
      <h3>🧪 Carduri de test (Mock Gateway)</h3>
      <div class="card-option" onclick="useTestCard('4111111111111111', 'Succes Instant')">
        <div class="card-number">4111 1111 1111 1111</div>
        <div class="card-result">✅ Succes instant</div>
      </div>
      <div class="card-option" onclick="useTestCard('4000000000000002', 'Card Declined')">
        <div class="card-number">4000 0000 0000 0002</div>
        <div class="card-result">❌ Card refuzat</div>
      </div>
      <div class="card-option" onclick="useTestCard('4000000000000069', 'Card expirat')">
        <div class="card-number">4000 0000 0000 0069</div>
        <div class="card-result">❌ Card expirat</div>
      </div>
      <div class="card-option" onclick="useTestCard('4000000000000127', 'Fonduri insuficiente')">
        <div class="card-number">4000 0000 0000 0127</div>
        <div class="card-result">❌ Fonduri insuficiente</div>
      </div>
      <div class="card-option" onclick="useTestCard('4000000000009995', 'Processing lent (5s)')">
        <div class="card-number">4000 0000 0000 9995</div>
        <div class="card-result">⏱️ Procesare lentă (5s)</div>
      </div>
    </div>
  </div>

  <script>
    function formatCardNumber(input) {
      let value = input.value.replace(/\\s/g, '');
      let formatted = value.match(/.{1,4}/g)?.join(' ') || value;
      input.value = formatted;
    }

    function useTestCard(number, result) {
      document.getElementById('card_number').value = number.match(/.{1,4}/g).join(' ');
      document.getElementById('card_holder').value = 'TEST CARD';
      document.getElementById('cvv').value = '123';
    }

    async function handleSubmit(event) {
      event.preventDefault();
      
      const form = event.target;
      const formData = new FormData(form);
      const data = Object.fromEntries(formData);
      
      // Remove spaces from card number
      data.card_number = data.card_number.replace(/\\s/g, '');

      // Show loading
      form.style.display = 'none';
      document.getElementById('loading').style.display = 'block';
      document.getElementById('error').style.display = 'none';

      try {
        const response = await fetch('/api/payments/ghiseul-mock/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Payment failed');
        }

        // Redirect to return URL
        window.location.href = result.return_url;
      } catch (error) {
        // Show error
        document.getElementById('error').textContent = error.message;
        document.getElementById('error').style.display = 'block';
        form.style.display = 'block';
        document.getElementById('loading').style.display = 'none';
      }
    }
  </script>
</body>
</html>
  `;

  return new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

/**
 * POST /api/payments/ghiseul-mock/checkout
 * Process mock payment checkout
 *
 * Handles form submission, processes payment, triggers webhook.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const formData: MockCheckoutFormData = {
      transaction_id: body.transaction_id as MockTransactionId,
      card_number: body.card_number,
      card_holder: body.card_holder,
      expiry_month: body.expiry_month,
      expiry_year: body.expiry_year,
      cvv: body.cvv,
    };

    // Process payment
    const result = await processCheckout(formData);

    // Get return_url from database
    const supabase = await createClient();
    const { data: plata } = await supabase
      .from("plati")
      .select("id")
      .eq("transaction_id", result.transaction_id)
      .single();

    if (!plata) {
      throw new Error("Payment not found after processing");
    }

    // Construct return_url
    const protocol = request.headers.get("x-forwarded-proto") || "http";
    const host = request.headers.get("host") || "localhost:3000";
    const return_url = `${protocol}://${host}/app/plati/${plata.id}`;

    return NextResponse.json({
      success: true,
      status: result.status,
      return_url,
      message:
        result.status === "success"
          ? "Plată procesată cu succes"
          : `Plată eșuată: ${result.error_message}`,
    });
  } catch (error) {
    console.error("[Mock Checkout] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Payment processing failed",
      },
      { status: 400 }
    );
  }
}
